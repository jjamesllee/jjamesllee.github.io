---
recent_order: 3
gallery_title: "PharmaSlice"
gallery_summary: "An Arduino-controlled prototype that feeds and separates medication strips."
card_summary: "A six-person APS112 design project for Sinai Health Pharmacy, developed from client requirements to a working prototype. The system combines mechanical strip feeding, a rotary cutter, and Arduino control to separate medication strips through an integrated electromechanical process."
title: "PharmaSlice: Automated Medication Strip Separator"
summary: "From client requirements to a working prototype: a six-person design project combining mechanical strip feeding, a rotary cutter, and Arduino control for Sinai Health Pharmacy."
description: "Cheng-Chi Lee's APS112 PharmaSlice project: concept selection, Arduino programming, prototype testing, and team leadership."
course: APS112 · Engineering Strategies & Practice
category: academic
year: 2026
order: 1
thumbnail: /projects/aps112-pharmaslice/images/aps112-final-design-top-view.png
cover:
  image: /projects/aps112-pharmaslice/images/aps112-final-design-top-view.png
  alt: "Overhead view of the PharmaSlice prototype with its cutter rail, feed wheels, motors, and Arduino wiring"
  caption: "The bench-top prototype: mechanical feeding and cutting coordinated by an Arduino Uno."
client: Sinai Health Pharmacy
role: Team Lead · Co-designer · Arduino Programming
technologies:
  - Arduino Uno R3
  - Arduino programming
  - DC gear motors
  - Encoder feedback
  - Pugh concept selection
tags: [client-design, programming, embedded-systems, mechanical-design, prototyping, testing, teamwork]
competencies: [Embedded control, Mechanical design, Prototyping, Testing and validation, Teamwork]
concepts:
  - image: /projects/aps112-pharmaslice/images/aps112-pharmaslice-side-view.png
    alt: "PharmaSlice concept with rotary blade, motor-driven input wheel, and guide rails"
    caption: "PharmaSlice: a rotary trimmer crosses a guided strip; a separate wheel advances the packages."
  - image: /projects/aps112-pharmaslice/images/aps112-thermocut-front-view.png
    alt: "ThermoCut concept with feed wheels, heated wire, filter, and collection basket"
    caption: "ThermoCut: rollers feed packages to a heated-wire cutter, with a filter and collection basket."
  - image: /projects/aps112-pharmaslice/images/aps112-sliceflow-side-view.png
    alt: "SliceFlow concept with foam roller, two conveyors, and pivoting blade"
    caption: "SliceFlow: conveyors feed the strip past a pivoting blade; a foam roller moves pills away from the cut."
team_process:
  - image: /projects/aps112-pharmaslice/images/aps112-team-decision-making-flowchart.png
    alt: "Team charter decision process from proposals and voting to task assignment and progress checks"
    caption: "Decision-making framework: discuss proposals, assign responsibilities, and check progress."
  - image: /projects/aps112-pharmaslice/images/aps112-conflict-resolution-flowchart.png
    alt: "Team charter conflict process from understanding perspectives to agreeing on a shared action plan"
    caption: "Conflict-resolution framework: understand perspectives, return to shared goals, and agree on a plan."
---

<div class="pharmaslice" markdown="1">

<nav class="aps-nav" aria-label="PharmaSlice project sections">
<a href="#overview">The problem</a><a href="#prototype">Prototype in motion</a><a href="#design-selection">Design decisions</a><a href="#my-contribution">My contribution</a><a href="#validation">Testing & results</a><a href="#teamwork">Teamwork & reflection</a>
</nav>

<section id="overview" markdown="1">
<p class="aps-label">A real client · A repetitive task · A physical prototype</p>

## Reducing repetitive work in hospital pharmacies

<p class="aps-lead">Sinai Health Pharmacy packages medication in connected unit-dose strips. Technicians then count and separate those strips by hand. Our task was to automate separation into batches of 2, 5, or 10 packages while preserving the sealed pouches and their readable labels.</p>

Faster cutting would offer little benefit if the machine damaged packages, jammed frequently, or needed constant attention. We translated client discussions into requirements for operator interaction, production rate, package integrity, cutting accuracy, and maintainability.

I led our six-person team and was one of PharmaSlice's designers. My contributions included client meetings, research, concept development and selection, work on the conceptual design specification, equipment procurement, and Arduino programming. I also took the lead on the **Measure of Success** test plan, connecting our design requirements to a way to evaluate the prototype.

<div class="aps-table-wrap" markdown="1">

| Requirement | Design implication |
| --- | --- |
| Batches of **2, 5, or 10** packages | Adjustable advancement before each cut |
| Cutting error within **±3 mm** | Alignment and feed calibration matter as much as blade motion |
| Operator interaction below **60 min/day** | Automate repeated motions; account for loading and intervention |
| **99.9% undamaged packages** target | Inspect package integrity, not just whether a strip separates |
| No exposed sharp moving parts in the intended design | Guarding is required beyond the bench-top prototype |

</div>
</section>

<section id="prototype" markdown="1">

## The prototype in motion

PharmaSlice uses two geared DC motors. One advances the strip using a feed wheel; the other moves a rotary paper trimmer along a rail and returns it for the next cycle. Guide rails keep the strip near the cutting path. An Arduino Uno coordinates the movements through an L298N motor driver.

<figure class="project-video">
<video controls playsinline preload="auto" poster="{{ '/projects/aps112-pharmaslice/images/aps112-video-poster.jpg' | relative_url }}" aria-label="PharmaSlice bench-top demonstration">
<source src="{{ '/projects/aps112-pharmaslice/videos/pharmaslice-demo-sdr.mp4' | relative_url }}?v=2" type='video/mp4; codecs="avc1.42C01F"'>
<source src="{{ '/projects/aps112-pharmaslice/videos/pharmaslice-demo-sdr.webm' | relative_url }}?v=2" type='video/webm; codecs="vp8"'>
Your browser does not support embedded video. Use the video link below.
</video>
<figcaption>Bench-top demonstration of the PharmaSlice prototype. The clip documents the mechanism; performance figures are explained separately below.</figcaption>
</figure>

[Open the demonstration video]({{ '/projects/aps112-pharmaslice/videos/pharmaslice-demo-sdr.mp4' | relative_url }})

**Operating sequence:** select a batch size → advance the strip by a calibrated distance → move the cutter across the strip → return the cutter → repeat.

The wooden frame and accessible wiring made the prototype easy to inspect and adjust. They also limit its durability and suitability for a pharmacy environment. This was a student bench-top prototype, not a deployed hospital device.
</section>

<section id="design-selection" markdown="1">

## Choosing a mechanism against the requirements

We explored feeding, positioning, and cutting as separate functions before combining them into complete concepts. We consolidated **69 initial concepts to 42**, screened them for feasibility to reach **21**, used multivoting to reach **9**, and compared the strongest candidates against the highest-priority objectives to select **3** for detailed evaluation.

{% include project-page-sections/figure.html image="/projects/aps112-pharmaslice/images/aps112-idea-selection-process-flowchart.png" alt="Concept selection funnel from 69 ideas through consolidation, feasibility, multivoting, graphical comparison, and Pugh analysis" caption="The concept-selection process recorded in our conceptual design specification." class="aps-wide" %}

{% include project-page-sections/gallery.html images=page.concepts heading="Three candidate designs" %}

A Pugh comparison led us to PharmaSlice. Its off-the-shelf cutter, visible mechanism, replaceable components, and compact layout made it a practical direction for prototyping. ThermoCut introduced heat and fume-management questions, while SliceFlow required coordinating conveyor transport and a pivoting blade.

The decision was a team comparison against requirements. The open construction helped us develop and inspect the prototype, but it did **not** establish that the final guarding requirement had been met.

<details markdown="1">
<summary>Explore the heated-wire alternative</summary>

{% include project-page-sections/figure.html image="/projects/aps112-pharmaslice/images/aps112-thermocut-top-view.png" alt="ThermoCut detail showing a heated wire moving across a package seam on a track" caption="ThermoCut's wire-motion concept, retained as part of our alternative-design analysis." class="aps-wide" %}
</details>
</section>

<section id="my-contribution" markdown="1">

## My contribution: design, documentation, and prototype development

### Co-designing PharmaSlice

I was one of the designers of PharmaSlice, contributing to the mechanical concept alongside my teammates. I participated in developing design solutions and comparing the candidate concepts against the client's requirements. This work helped connect the strip-advancement and cutting mechanisms to the pharmacy's needs for selectable batch sizes, package integrity, and reduced manual interaction.

### Client research and design documentation

I contributed to client meetings, research, and the conceptual design specification (CDS), helping document the problem, develop design solutions, and support our concept-selection work. Within that shared report, I took particular ownership of drafting the **Measure of Success** section: the test methods, performance criteria, and limitations we would use to assess PharmaSlice.

The CDS was a team deliverable. My role combined contributing to its broader design work with leading the test-planning section and helping turn the selected concept into an operating prototype.

<div class="aps-two" markdown="1">
<div markdown="1">

### Arduino programming and motor coordination

I wrote the program coordinating the feed and cutter motors, including batch selection, calibration routines, manual motor tests, automatic cycles, status reporting, and an operator stop/reset interface. Testing individual motors separately from complete cycles made troubleshooting more manageable.

The feed motor uses a calibrated run time for the selected batch. The cutter motor has quadrature-encoder feedback. These are different approaches: feed distance is time-based, while encoder counts provide feedback on cutter movement.

</div>
<div markdown="1">

### Measure of Success and equipment

I took the lead on the CDS test plan and helped procure equipment for testing. The plan evaluated production output, operator interaction, and package integrity together: a feeding or cutting failure affects all three.

We planned an operator/recorder pairing, video timing, calibration runs, and three runs for each batch size. Authentic packaging was limited, so the plan also included representative paper strips and recorded the limitations of substitute materials.

</div>
</div>

### Fault handling and further development

The program includes an encoder-based jam-check routine that compares movement across timed intervals and can stop both motors after repeated low-motion readings. The supplied version uses a consecutive-reading threshold of **999**, so it does not establish prompt protective response. The final presentation also identifies real-time jam monitoring as further work.

I distinguish **implemented fault-handling logic** from **validated jam protection**. A next iteration would tune the thresholds and test actual stalls, false alarms, response time, and recovery before relying on it.

<details markdown="1">
<summary>Read the encoder jam-check implementation</summary>

```arduino
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
```

[Read the full Arduino program]({{ '/projects/aps112-pharmaslice/code/aps112FINAL.ino' | relative_url }})
</details>
</section>

<section id="validation" markdown="1">

## Testing, reported results, and their limits

{% include project-page-sections/figure.html image="/projects/aps112-pharmaslice/images/aps112-project-timeline.png" alt="Testing timeline from assembly and Arduino development to strip preparation, calibration, and three runs per batch size" caption="Our planned sequence: assemble, program, prepare strips, calibrate, test each batch size, and revise if necessary." class="aps-wide" %}

The April 9 final presentation reports **less than 30 seconds of interaction per strip** and a **projected daily interaction time below 40 minutes**. It also reports production estimates calculated from advancement and cutting cycle times. These are bench-top results and timing-based projections, rather than measurements from a full pharmacy shift.

<div class="aps-table-wrap" markdown="1">

| Batch size | Cycle time | Separated batches/hour | Individual pouches/hour |
| --- | --- | --- | --- |
| 2 packages | 3.33 s | ≈1,081 | ≈2,162 |
| 5 packages | 4.80 s | 750 | 3,750 |
| 10 packages | 7.25 s | ≈496 | ≈4,960 |

</div>

The prototype exposed a practical limitation: quick-build tolerances caused alignment issues and reduced cutting accuracy. The presentation also notes material degradation under repeated use and a controlled environment that did not represent interruptions in a working pharmacy.

### What I would improve next

- **Alignment and repeatability:** tighten tolerances and improve the guides before increasing speed.
- **Durability:** replace temporary construction with more consistent, durable components.
- **Fault response:** tune and validate encoder-based jam monitoring under deliberate stall conditions.
- **Output handling and guarding:** clear separated pouches automatically and enclose sharp moving parts.
- **Validation:** collect package-integrity results and sustained-run data using authentic packaging, with clearly defined output units.

The main lesson was that **a working cycle is only the beginning**. Reliability depends on alignment, material behaviour, operator workload, and the response when something goes wrong.
</section>

<section id="teamwork" markdown="1">

## Leading the team and learning from feedback

{% include project-page-sections/figure.html image="/projects/aps112-pharmaslice/images/aps112-showcase-team.jpg" alt="The six PharmaSlice teammates together at the University of Toronto engineering showcase" caption="Our six-person PharmaSlice team at the engineering showcase. The project was selected as one of 16 teams from more than 200 projects." %}

As Team Lead, I helped coordinate responsibilities while contributing to PharmaSlice's design, client research, and written deliverables. I also took ownership of controls and test planning, helping distribute the work across programming, mechanical construction, and presentation preparation. Peer feedback specifically recognized my test planning, equipment procurement, Arduino programming, task assignment, and willingness to take on unfamiliar work.

Our team charter documented how we would evaluate proposals and handle disagreements. These flowcharts show the framework we agreed to use; they do not document a particular conflict.

{% include project-page-sections/gallery.html images=page.team_process %}

### Feedback on prioritization and communication

Peers also identified two areas for improvement: spending too long perfecting details under a tight deadline, and making technical ideas easier for the team to understand. That feedback clarified a responsibility of a technical lead: the work needs to be understandable and useful to others, not only technically complete.

My takeaway is to explain unfamiliar mechanisms with sketches or short demonstrations, check understanding, and prioritize improvements against the remaining time and project requirements.

<details markdown="1">
<summary>View the original peer feedback</summary>

{% include project-page-sections/figure.html image="/projects/aps112-pharmaslice/images/aps112-peer-feedback-2-individual-feedback.png" alt="Peer feedback recognizing test planning, procurement, Arduino programming, and leadership, with suggestions about prioritization and communication" caption="Original peer feedback, including strengths and development areas." class="aps-wide" %}

{% include project-page-sections/figure.html image="/projects/aps112-pharmaslice/images/aps112-peer-feedback-2-hexagon.png" alt="Peer feedback radar chart of performance, leadership, attitude, harmony, expression, and reliability" caption="The accompanying peer-assessment chart, retained as context." class="aps-wide" %}
</details>
</section>

<section id="documents" markdown="1">

## Project documents

The specification records requirements, concept comparison, and the test plan. The final presentation records prototype results, cycle-time calculations, and remaining limitations.

<div class="aps-resources">
<a href="{{ '/projects/aps112-pharmaslice/documents/aps112-cds.pdf' | relative_url }}">Conceptual design specification (PDF)</a>
<a href="{{ '/projects/aps112-pharmaslice/documents/aps112-final-presentation.pdf' | relative_url }}">Final presentation (PDF)</a>
<a href="{{ '/projects/aps112-pharmaslice/code/aps112FINAL.ino' | relative_url }}">Arduino source code</a>
</div>

<p><small>APS112 student design project, University of Toronto, 2026. The original presentation includes its course disclaimer and should be read with that disclaimer.</small></p>
</section>
</div>
