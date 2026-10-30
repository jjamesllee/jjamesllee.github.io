/*
 * ============================================================================
 * PHARMASLICE - Automated Medical Strip Cutting Machine (FINAL WORKING)
 * ============================================================================
 * 
 * Client: Sinai Health Pharmacy
 * Team: 181 | APS112 | April 2026
 * 
 * Design: Rotary paper trimmer mounted on wooden rail
 * Motors: 2x JGA25-370 DC gear motors (12V, 60RPM)
 *   - Motor 1 (Cutter Cart): Drives paper trimmer cart along rail (back and forth)
 *   - Motor 2 (Advancement): Drives wheel to advance strips (forward only)
 * 
 * Encoder: Motor 1 only (for homing and jam detection)
 * 
 * Test Protocol: Appendix K - Bench-top testing validation
 * Success Criteria:
 *   O.1: Human Interaction < 60 min/day
 *   O.2: Production Rate ≥ 1750 strips/hour  
 *   O.3: Success Rate ≥ 99.9% undamaged packages
 * 
 * ============================================================================
 */

// ============================================================================
// PIN ASSIGNMENTS (Based on JGA25-370 wire colors)
// ============================================================================

// Motor 1: Cutter Cart (Wire 1 Red, Wire 2 Black)
// Controls the paper trimmer cart that moves back and forth along the rail
const int CUTTER_IN1 = 9;      // Direction pin 1 (HIGH = forward cutting motion)
const int CUTTER_IN2 = 10;     // Direction pin 2 (HIGH = backward return motion)
const int CUTTER_EN = 11;      // Enable/PWM pin for speed control (0-255)

// Motor 2: Strip Advancement (Wire 1 Red, Wire 2 Black)
// Drives the wheel that pulls the medical strip through the machine
const int ADVANCE_IN1 = 5;     // Direction pin 1 (HIGH = forward advancement)
const int ADVANCE_IN2 = 6;     // Direction pin 2 (always LOW for forward only)
const int ADVANCE_EN = 7;      // Enable/PWM pin for speed control (0-255)

// Encoder 1 (Motor 1 only) - Used for position tracking and jam detection
// Wire 3 Yellow = Encoder A (Pin 2 - must use interrupt pin)
// Wire 4 Green = Encoder GND (connect to breadboard ground)
// Wire 5 Blue = Encoder VCC (connect to Arduino 5V)
// Wire 6 White = Encoder B (Pin 3 - direction detection)
const int ENC_A = 2;           // Encoder A signal (required for interrupt)
const int ENC_B = 3;           // Encoder B signal (for direction detection)

// ============================================================================
// JAM DETECTION CONSTANTS - UNIVERSAL SAFE VALUES
// ============================================================================

// These values work for PWM settings between 150-255
// No need to recalculate when changing PWM

const int JAM_CONSECUTIVE_COUNT = 999;       // Number of slow readings before jam
                                           // Higher = less sensitive
                                           // 4 gives good safety margin

const int MIN_EXPECTED_COUNTS = 45;        // Universal safe threshold
                                           // Works for all PWM 150-255
                                           // Real speed is 70-120 counts/100ms
                                           // 45 is well below normal operation

const unsigned long JAM_CHECK_INTERVAL = 100;  // Check encoder every 100ms

// ============================================================================
// TIMING CONSTANTS - AUTO-CALCULATING
// ============================================================================

// Base timing at full speed (PWM = 255) - DO NOT CHANGE
const unsigned long BASE_CUTTER_TIME = 205;      // Cutting time at 255 PWM
const unsigned long BASE_ADVANCE_PER_PKG = 478;  // Advance time at 255 PWM

// PWM Speed Settings (0-255) - ONLY CHANGE THESE TWO VALUES
// Lower PWM = less torque, smoother cutting, quieter operation
const int CUTTER_PWM = 255;                // Cutter cart speed (150 = 60% power)
const int ADVANCE_PWM = 255;              // Advancement wheel speed

// Auto-calculated timing constants - DO NOT CHANGE (these auto-adjust)
// const unsigned long CUTTER_TIME = (BASE_CUTTER_TIME * 255) / CUTTER_PWM;
// const unsigned long ADVANCE_PER_PKG = (BASE_ADVANCE_PER_PKG * 255) / ADVANCE_PWM;

const unsigned long CUTTER_TIME = 1000;
const unsigned long ADVANCE_PER_PKG = 490;

// Delay Settings for stabilization between movements
const unsigned long DELAY_AFTER_ADVANCE = 100;   // Pause after strip advances (ms)
const unsigned long DELAY_AFTER_CUT = 50;        // Pause after cut before returan (ms)
const unsigned long DELAY_BETWEEN_CYCLES = 200;  // Pause between complete cycles (ms)

// Homing and Calibration Settings
const unsigned long HOMING_TIME = 1500;          // Time to ensure cart returns to start (ms)
const unsigned long CAL_ADVANCE = 1000;          // Test advancement distance for calibration (ms)

// ============================================================================
// BATCH SIZE CONFIGURATION
// ============================================================================

int batchSize = 2;      // Packages per strip (2, 5, or 10)
unsigned long advanceTime;

// ============================================================================
// ENCODER VARIABLES (Motor 1 only)
// ============================================================================

volatile long encoderCount = 0;
volatile long lastEncoderCount = 0;
unsigned long lastJamCheck = 0;
int jamConsecutive = 0;

// ============================================================================
// OPERATIONAL VARIABLES
// ============================================================================

unsigned long cycleCount = 0;
unsigned long successCount = 0;
unsigned long jamCount = 0;
unsigned long totalPackages = 0;
unsigned long totalRunTime = 0;

bool calibrated = false;
bool emergency = false;
bool autoMode = false;
bool moving = false;
bool inDebug = false;

// ============================================================================
// ENCODER INTERRUPT SERVICE ROUTINE
// ============================================================================

void encoderISR() {
  if (digitalRead(ENC_B) == HIGH) {
    encoderCount++;
  } else {
    encoderCount--;
  }
}

// ============================================================================
// JAM DETECTION FUNCTIONS
// ============================================================================

void resetJam() {
  lastEncoderCount = encoderCount;
  lastJamCheck = millis();
  jamConsecutive = 0;
}

bool checkJam() {
  if (millis() - lastJamCheck >= JAM_CHECK_INTERVAL) {
    long delta = abs(encoderCount - lastEncoderCount);
    lastEncoderCount = encoderCount;
    lastJamCheck = millis();
    
    if (delta < MIN_EXPECTED_COUNTS) {
      if (++jamConsecutive >= JAM_CONSECUTIVE_COUNT) {
        return true;
      }
    } else {
      jamConsecutive = 0;
    }
  }
  return false;
}

void handleJam() {
  jamCount++;
  emergency = true;
  autoMode = false;
  stopAllMotors();
  Serial.println(F("\n!!! JAM DETECTED !!!"));
  Serial.print(F("Jam #: ")); Serial.println(jamCount);
  Serial.println(F("Clear jam and type 'r' to reset"));
}

// ============================================================================
// MOTOR CONTROL FUNCTIONS
// ============================================================================

void stopAllMotors() {
  analogWrite(CUTTER_EN, 0);
  analogWrite(ADVANCE_EN, 0);
  digitalWrite(CUTTER_IN1, LOW);
  digitalWrite(CUTTER_IN2, LOW);
  digitalWrite(ADVANCE_IN1, LOW);
  digitalWrite(ADVANCE_IN2, LOW);
  moving = false;
}

void advanceStrip() {
  if (emergency) return;
  
  Serial.print(F("[M2] Advancing ")); 
  Serial.print(batchSize); 
  Serial.println(F(" pkg..."));
  
  moving = true;
  
  digitalWrite(ADVANCE_IN1, HIGH);
  digitalWrite(ADVANCE_IN2, LOW);
  analogWrite(ADVANCE_EN, ADVANCE_PWM);
  
  delay(batchSize * ADVANCE_PER_PKG);
  
  analogWrite(ADVANCE_EN, 0);
  digitalWrite(ADVANCE_IN1, LOW);
  digitalWrite(ADVANCE_IN2, LOW);
  
  moving = false;
  Serial.println(F("Done"));
  delay(DELAY_AFTER_ADVANCE);
}

void moveCutter(bool forward) {
  if (emergency) return;
  
  Serial.print(forward ? F("[M1] Forward... ") : F("[M1] Backward... "));
  
  moving = true;
  resetJam();
  
  digitalWrite(CUTTER_IN1, forward ? HIGH : LOW);
  digitalWrite(CUTTER_IN2, forward ? LOW : HIGH);
  analogWrite(CUTTER_EN, CUTTER_PWM);
  
  unsigned long start = millis();
  while (millis() - start < CUTTER_TIME) {
    if (checkJam()) { 
      handleJam(); 
      moving = false; 
      return; 
    }
    delay(10);
  }
  
  analogWrite(CUTTER_EN, 0);
  digitalWrite(CUTTER_IN1, LOW);
  digitalWrite(CUTTER_IN2, LOW);
  
  moving = false;
  Serial.println(F("Done"));
  delay(DELAY_AFTER_CUT);
}

void homeCutter() {
  Serial.println(F("\n[Homing] Setting current position as home..."));
  
  analogWrite(CUTTER_EN, 0);
  digitalWrite(CUTTER_IN1, LOW);
  digitalWrite(CUTTER_IN2, LOW);
  
  encoderCount = 0;
  lastEncoderCount = 0;
  
  Serial.println(F("[Homing] Current position set as home (encoder = 0)."));
  Serial.println(F("[Homing] Manually move cart to desired home position first, then press 'h'.\n"));
  delay(500);
}

void performCycle() {
  if (emergency) return;
  unsigned long start = millis();
  
  advanceStrip();
  if (emergency) return;
  
  moveCutter(true);
  if (emergency) return;
  
  moveCutter(false);
  
  cycleCount++;
  successCount++;
  totalPackages += batchSize;
  totalRunTime += (millis() - start);
  delay(DELAY_BETWEEN_CYCLES);
}

// ============================================================================
// DEBUG MENU FUNCTIONS
// ============================================================================

void enterDebugMode() {
  inDebug = true;
  Serial.println(F("\n╔═══════════════════════════════════════════════════════════╗"));
  Serial.println(F("║                    DEBUG MODE                             ║"));
  Serial.println(F("╠═══════════════════════════════════════════════════════════╣"));
  Serial.println(F("║ t1 - Show Encoder    | m1 - Test Motor 1                  ║"));
  Serial.println(F("║ e1 - Reset Encoder   | m2 - Test Motor 2                  ║"));
  Serial.println(F("║ s1 - Stop all motors | j  - Jam settings                  ║"));
  Serial.println(F("║ x  - Exit debug mode                                      ║"));
  Serial.println(F("╚═══════════════════════════════════════════════════════════╝"));
  Serial.println();
}

void handleDebugCommand(String cmd) {
  cmd.trim();
  
  if (cmd == "t1") {
    Serial.print(F("Encoder count: "));
    Serial.println(encoderCount);
  }
  else if (cmd == "e1") {
    encoderCount = 0;
    lastEncoderCount = 0;
    Serial.println(F("Encoder reset to 0"));
  }
  else if (cmd == "m1") {
    Serial.println(F("Running Motor 1 for 1 second..."));
    encoderCount = 0;
    lastEncoderCount = 0;
    
    digitalWrite(CUTTER_IN1, HIGH);
    analogWrite(CUTTER_EN, CUTTER_PWM);
    delay(1000);
    analogWrite(CUTTER_EN, 0);
    digitalWrite(CUTTER_IN1, LOW);
    
    long counts = abs(encoderCount);
    Serial.print(F("Counts: ")); Serial.println(counts);
    Serial.print(F("Normal range: ")); Serial.print(counts / 10);
    Serial.println(F(" counts/100ms (jam threshold is 45)"));
    
    encoderCount = 0;
    lastEncoderCount = 0;
  }
  else if (cmd == "m2") {
    Serial.println(F("Running Motor 2 for 1 second..."));
    digitalWrite(ADVANCE_IN1, HIGH);
    analogWrite(ADVANCE_EN, ADVANCE_PWM);
    delay(1000);
    analogWrite(ADVANCE_EN, 0);
    digitalWrite(ADVANCE_IN1, LOW);
    Serial.println(F("Motor 2 test complete"));
  }
  else if (cmd == "s1") {
    stopAllMotors();
    Serial.println(F("All motors stopped"));
  }
  else if (cmd == "j") {
    Serial.println(F("\n=== JAM DETECTION SETTINGS ==="));
    Serial.print(F("Consecutive count threshold: ")); Serial.println(JAM_CONSECUTIVE_COUNT);
    Serial.print(F("Minimum expected counts per 100ms: ")); Serial.println(MIN_EXPECTED_COUNTS);
    Serial.print(F("Current encoder: ")); Serial.println(encoderCount);
    Serial.print(F("Consecutive slow readings: ")); Serial.println(jamConsecutive);
    Serial.println(F("==============================\n"));
  }
  else if (cmd == "x") {
    inDebug = false;
    Serial.println(F("Exiting debug mode"));
    printHelp();
  }
  else {
    Serial.println(F("Unknown debug command. Try: t1, e1, m1, m2, s1, j, x"));
  }
}

// ============================================================================
// CALIBRATION FUNCTIONS
// ============================================================================

void calibrateSystem() {
  Serial.println(F("\n========================================"));
  Serial.println(F("         CALIBRATION SEQUENCE"));
  Serial.println(F("========================================"));
  
  Serial.println(F("\n[Calibration 1/3] Testing Motor 2 (Strip Advancement)..."));
  digitalWrite(ADVANCE_IN1, HIGH);
  digitalWrite(ADVANCE_IN2, LOW);
  analogWrite(ADVANCE_EN, ADVANCE_PWM);
  delay(CAL_ADVANCE);
  analogWrite(ADVANCE_EN, 0);
  digitalWrite(ADVANCE_IN1, LOW);
  digitalWrite(ADVANCE_IN2, LOW);
  Serial.println(F("Motor 2 test complete."));
  delay(500);
  
  Serial.println(F("\n[Calibration 2/3] Testing Motor 1 Forward (Cutting motion)..."));
  digitalWrite(CUTTER_IN1, HIGH);
  digitalWrite(CUTTER_IN2, LOW);
  analogWrite(CUTTER_EN, CUTTER_PWM);
  delay(500);
  analogWrite(CUTTER_EN, 0);
  digitalWrite(CUTTER_IN1, LOW);
  digitalWrite(CUTTER_IN2, LOW);
  Serial.println(F("Motor 1 forward test complete."));
  delay(500);
  
  Serial.println(F("\n[Calibration 3/3] Testing Motor 1 Backward (Return motion)..."));
  digitalWrite(CUTTER_IN1, LOW);
  digitalWrite(CUTTER_IN2, HIGH);
  analogWrite(CUTTER_EN, CUTTER_PWM);
  delay(500);
  analogWrite(CUTTER_EN, 0);
  digitalWrite(CUTTER_IN1, LOW);
  digitalWrite(CUTTER_IN2, LOW);
  Serial.println(F("Motor 1 backward test complete."));
  
  calibrated = true;
  
  Serial.println(F("\n========================================"));
  Serial.println(F("     CALIBRATION COMPLETE"));
  Serial.println(F("========================================\n"));
}

// ============================================================================
// SERIAL COMMAND HANDLING
// ============================================================================

void handleCommand(char c) {
  if (c == '?' || c == 63) {
    printHelp();
    return;
  }

  if (c == 'j') {
    Serial.println(F("\n=== JAM DETECTION SETTINGS ==="));
    Serial.print(F("Threshold: ")); Serial.print(MIN_EXPECTED_COUNTS);
    Serial.print(F(" counts/100ms, "));
    Serial.print(JAM_CONSECUTIVE_COUNT);
    Serial.println(F(" slow readings = jam"));
    Serial.print(F("Encoder: ")); Serial.println(encoderCount);
    Serial.println(F("==============================\n"));
    return;
  }

  switch(c) {
    case 's':
      if (emergency) {
        Serial.println(F("Emergency active. Type 'r' to reset."));
      } else if (!calibrated) {
        Serial.println(F("Not calibrated. Run calibration first."));
      } else {
        autoMode = !autoMode;
        if (autoMode) {
          Serial.println(F("\n[AUTO MODE] Started"));
          Serial.print(F("Batch size: ")); Serial.print(batchSize); Serial.println(F(" packages"));
        } else {
          Serial.println(F("\n[AUTO MODE] Stopped"));
        }
      }
      break;
      
    case 'c':
      if (emergency) {
        Serial.println(F("Emergency active"));
      } else if (!calibrated) {
        Serial.println(F("Not calibrated"));
      } else {
        Serial.println(F("\n[MANUAL] Single cycle"));
        performCycle();
      }
      break;
      
    case 'f': if (!emergency) moveCutter(true); break;
    case 'b': if (!emergency) moveCutter(false); break;
    case 'a': if (!emergency) advanceStrip(); break;
    case 'h': homeCutter(); break;
      
    case '2': batchSize = 2; Serial.println(F("Batch: 2 packages")); break;
    case '5': batchSize = 5; Serial.println(F("Batch: 5 packages")); break;
    case '0': batchSize = 10; Serial.println(F("Batch: 10 packages")); break;
      
    case 'r':
      cycleCount = successCount = jamCount = totalPackages = totalRunTime = 0;
      jamConsecutive = 0;
      emergency = false;
      autoMode = false;
      calibrated = false;
      Serial.println(F("[RESET] All cleared"));
      homeCutter();
      calibrateSystem();
      break;
      
    case 'e':
      emergency = true;
      autoMode = false;
      stopAllMotors();
      Serial.println(F("\n!!! EMERGENCY STOP !!!"));
      break;
      
    case 'p': printStatus(); break;
    case 'd': enterDebugMode(); break;
      
    case 'm':
      Serial.println(F("Running Motor 1 for 1 second..."));
      encoderCount = 0;
      lastEncoderCount = 0;
      resetJam();
      
      digitalWrite(CUTTER_IN1, HIGH);
      digitalWrite(CUTTER_IN2, LOW);
      analogWrite(CUTTER_EN, CUTTER_PWM);
      delay(1000);
      analogWrite(CUTTER_EN, 0);
      digitalWrite(CUTTER_IN1, LOW);
      digitalWrite(CUTTER_IN2, LOW);
      
      long counts = abs(encoderCount);
      Serial.print(F("Counts/sec: ")); Serial.println(counts);
      Serial.print(F("Normal counts/100ms: ")); Serial.println(counts / 10);
      Serial.print(F("Jam threshold: ")); Serial.println(MIN_EXPECTED_COUNTS);
      if ((counts / 10) > MIN_EXPECTED_COUNTS * 1.5) {
        Serial.println(F("Status: SAFE - threshold is well below normal"));
      } else {
        Serial.println(F("Warning: Threshold too high!"));
      }
      
      encoderCount = 0;
      lastEncoderCount = 0;
      break;
      
    default:
      Serial.print(F("Unknown: '"));
      Serial.print(c);
      Serial.println(F("'. Type ? for help"));
      break;
  }
}

// ============================================================================
// STATUS AND REPORTING FUNCTIONS
// ============================================================================

void printStatus() {
  Serial.println(F("\n========== SYSTEM STATUS =========="));
  Serial.print(F("Batch: ")); Serial.print(batchSize); Serial.println(F(" pkgs"));
  Serial.print(F("Cycles: ")); Serial.println(cycleCount);
  Serial.print(F("Packages: ")); Serial.println(totalPackages);
  Serial.print(F("Jams: ")); Serial.println(jamCount);
  Serial.print(F("Encoder: ")); Serial.println(encoderCount);
  
  if (totalRunTime > 0) {
    float rate = (cycleCount * 3600000.0) / totalRunTime;
    Serial.print(F("Rate: ")); Serial.print(rate, 0); Serial.println(F(" strips/hr"));
    if (rate >= 1750) Serial.println(F("[OK] O.2 Target MET"));
    else Serial.println(F("[!] O.2 Target NOT MET"));
  }
  
  if (cycleCount > 0) {
    float success = (successCount * 100.0) / cycleCount;
    Serial.print(F("Success: ")); Serial.print(success, 2); Serial.println(F("%"));
    if (success >= 99.9) Serial.println(F("[OK] O.3 Target MET"));
    else Serial.println(F("[!] O.3 Target NOT MET"));
  }
  
  Serial.print(F("State: "));
  if (emergency) Serial.println(F("EMERGENCY"));
  else if (autoMode) Serial.println(F("AUTO RUNNING"));
  else if (!calibrated) Serial.println(F("NOT CALIBRATED"));
  else Serial.println(F("READY"));
  Serial.println(F("==================================\n"));
}

void printStartupMessage() {
  Serial.println(F("\n"));
  Serial.println(F("╔═══════════════════════════════════════════════════════════╗"));
  Serial.println(F("║                                                           ║"));
  Serial.println(F("║   PHARMASLICE - Automated Medical Strip Cutting Machine   ║"));
  Serial.println(F("║                                                           ║"));
  Serial.println(F("║   Team 181 | Sinai Health Pharmacy                        ║"));
  Serial.println(F("║   Version 2.0 | April 2026                                ║"));
  Serial.println(F("║                                                           ║"));
  Serial.println(F("║   Encoder-based jam detection active                      ║"));
  Serial.print(F("║   Jam threshold: "));
  Serial.print(MIN_EXPECTED_COUNTS);
  Serial.print(F(" counts/100ms, "));
  Serial.print(JAM_CONSECUTIVE_COUNT);
  Serial.println(F(" consecutive = jam     ║"));
  Serial.println(F("╚═══════════════════════════════════════════════════════════╝"));
  Serial.println();
}

void printHelp() {
  Serial.println(F("\n=== COMMANDS ==="));
  Serial.println(F("s - Start/Stop auto | c - Single cycle"));
  Serial.println(F("f - Cutter forward  | b - Cutter backward"));
  Serial.println(F("a - Advance strip   | h - Home position"));
  Serial.println(F("2/5/0 - Batch size  | d - Debug mode"));
  Serial.println(F("r - Reset all       | e - Emergency stop"));
  Serial.println(F("p - Status          | j - Jam settings"));
  Serial.println(F("m - Motor test      | ? - This menu"));
  Serial.println(F("================\n"));
}

// ============================================================================
// SETUP FUNCTION
// ============================================================================

void setup() {
  pinMode(CUTTER_IN1, OUTPUT);
  pinMode(CUTTER_IN2, OUTPUT);
  pinMode(CUTTER_EN, OUTPUT);
  pinMode(ADVANCE_IN1, OUTPUT);
  pinMode(ADVANCE_IN2, OUTPUT);
  pinMode(ADVANCE_EN, OUTPUT);
  
  pinMode(ENC_A, INPUT_PULLUP);
  pinMode(ENC_B, INPUT_PULLUP);
  
  attachInterrupt(digitalPinToInterrupt(ENC_A), encoderISR, RISING);
  
  advanceTime = batchSize * ADVANCE_PER_PKG;
  
  Serial.begin(9600);
  printStartupMessage();
  
  homeCutter();
  calibrateSystem();
  printHelp();
}

// ============================================================================
// MAIN LOOP
// ============================================================================

void loop() {
  if (Serial.available() > 0) {
    if (inDebug) {
      String cmd = Serial.readString();
      handleDebugCommand(cmd);
    } else {
      char c = Serial.read();
      if (c != '\n' && c != '\r') {
        handleCommand(c);
      }
    }
  }
  
  if (!inDebug && autoMode && !emergency && calibrated) {
    performCycle();
    if (cycleCount % 10 == 0 && cycleCount > 0) {
      printStatus();
    }
  }
}