---
recent_order: 2
gallery_title: "Solar Race Strategy Simulator"
gallery_summary: "A C++ simulator balancing speed, weather, and energy across a solar race."
card_summary: "An individual C++ recruitment project simulating energy use across a roughly 3,000 km solar race. I combined vehicle modelling, adaptive speed selection, and faster weather lookups to compare race strategies and track battery constraints."
permalink: /projects/blueskysolar-recruitmentproject/
title: "Solar Race Strategy & Energy Simulator"
summary: "An individual C++ recruitment project combining vehicle energy modelling, adaptive speed selection, and faster weather lookups over a roughly 3,000 km solar race."
description: "Cheng-Chi Lee's solar race simulator: energy modelling, constant-speed sweeps, adaptive strategies, and documented simulation outputs."
course: Blue Sky Solar Racing · Recruitment Project
category: academic
year: 2026
order: 2
role: Simulation and strategy development
thumbnail: /projects/blueskysolar-recruitment/images/segment-strategy-results.png
github: https://github.com/jjamesllee/Solar-Race-Strategy-Simulator
technologies:
  - C++
  - CMake
  - Simulation
  - Energy modelling
  - Route and weather data
  - Adaptive speed strategy
tags:
  - programming
  - simulation
  - energy-modelling
  - algorithm-design
  - testing
  - data-analysis
competencies:
  - Object-oriented programming
  - Physics-based modelling
  - Algorithm design
  - Data interpolation
  - Performance optimization
strategy_outputs:
  - image: /projects/blueskysolar-recruitment/images/segment-strategy-results.png
    alt: "Segment strategy terminal output showing a viable finish, 301 speed decisions, 4.26 kWh final battery, and 1.01 kWh minimum battery"
    caption: "Segment strategy: 301 decisions, a viable finish, and 81.90% battery remaining in the captured run."
  - image: /projects/blueskysolar-recruitment/images/route-point-strategy-results.png
    alt: "Route-point strategy terminal output showing a viable finish, 28,842 decisions, 4.27 kWh final battery, and 1.01 kWh minimum battery"
    caption: "Route-point strategy: 28,842 decisions, a viable finish, and 82.12% battery remaining in the captured run."
---

<div class="solar-study" markdown="1">
<nav class="solar-nav" aria-label="Solar simulator sections">
<a href="#solar-challenge">The challenge</a><a href="#solar-strategy">Strategy</a><a href="#solar-contribution">My contribution</a><a href="#solar-results">Simulation results</a><a href="#solar-limits">Lessons & limitations</a>
</nav>

<section id="solar-challenge" markdown="1">

## Balancing speed against available energy

The World Solar Challenge is a roughly 3,000 km race from Darwin to Adelaide in which a solar car must balance speed, available sunlight, battery capacity, terrain, mandatory control stops, and limited daily driving hours. The recruitment project began with a C++ framework and route and direct-normal-irradiance (DNI) datasets. The goal was to complete the car and race models, then determine which constant speeds could finish before the race deadline without depleting the battery.

The simulator also needed to handle practical details that affect an entire race: aerodynamic and rolling losses, elevation changes, solar generation while driving and stopped, overnight charging, a 5.2 kWh battery limit, nine mandatory 30-minute control stops, and the time-zone offset between the weather data and local race time.

This was an **individual recruitment project**, built from a supplied framework and datasets. The work shown here is my simulation and strategy development, rather than a claim of membership on the racing team or deployment on its vehicle.

</section>
<section id="solar-strategy" markdown="1">

## From constant speed to adaptive decisions

I built a physics-based energy model for the car and connected it to a route simulation that advances through adjacent GPS coordinates. For each part of the route, the program calculates travel time, energy consumption, solar energy gained, battery state, and the current race time. It pauses driving outside official hours, continues charging when sunlight is available, and checks that the car never runs out of energy or misses the final deadline.

The completed program offers three simulation modes:

- A whole-race sweep that tests constant speeds from 1 to 99 km/h
- A segment strategy that can reconsider speed after approximately every 10 km
- A route-point strategy that can reconsider speed between every pair of adjacent CSV coordinates

### Establishing a baseline

The constant-speed sweep asks a useful first question: which fixed speeds can complete the simulated race within both the time and battery constraints? In the captured portion of the output, **59 to 64 km/h are viable**, while the neighbouring displayed speeds are not. This is a result for the supplied model and inputs, not a general operating range for a real solar car.

{% include project-page-sections/figure.html image="/projects/blueskysolar-recruitment/images/constant-speed-sweep.png" alt="Constant-speed sweep showing speeds 59 through 64 as viable and the neighbouring displayed speeds as not viable" caption="An excerpt of the 1 to 99 km/h sweep. Too little speed can miss the deadline; too much can exceed the energy budget." class="solar-output" %}

### Adapting to the route

Rather than committing to one speed for the entire race, the adaptive strategy revisits the choice as the car progresses. It evaluates the upcoming route, available sunlight, and battery reserve, then selects a candidate speed. The segment mode makes fewer decisions; the route-point mode can respond at every coordinate interval.

</section>
<section id="solar-contribution" markdown="1">

## My contribution: modelling, strategy, and optimization

I implemented the car's energy calculations and the full race simulation, including driving-hour enforcement, battery tracking, solar charging, control stops, terrain changes, and route progress. I also completed the irradiance lookup so DNI values are interpolated across both location and time instead of being limited to exact entries in the weather table.

To go beyond the base requirements, I designed a configurable speed-selection strategy. At each decision point, it evaluates candidate speeds using the upcoming route distance, positive elevation changes, present irradiance, and a required battery reserve. The strategy selects the fastest candidate that satisfies the predicted reserve while limiting how sharply the speed can change between decisions. When none of the candidates meets the reserve, it uses a controlled fallback rather than immediately jumping to the minimum speed.

I also added an optional final-sprint mode. Near the end of the route, the simulator can reconsider its speed immediately, look ahead to the finish, allow a higher maximum speed, and target a smaller finishing battery reserve.

### Connecting the vehicle model to the race

The `Car` class isolates the vehicle model. It calculates aerodynamic drag, rolling resistance, gravitational energy, motor and battery efficiency losses, passive electrical use, solar-array output, and maximum battery capacity.

The `Simulator` class manages the race state. It moves the car through the route, queries the weather lookup using position and UTC time, updates battery energy, enforces race hours and stops, and reports whether a proposed speed or adaptive strategy is viable. Fixed-speed and adaptive simulations share the same travel and charging calculations so their results remain comparable.

The forecast lookup performs linear interpolation between nearby timestamps and weather locations. Because route queries generally move forward, it caches the nearest weather-table row from the previous lookup and searches locally from there, reducing repeated work across the dataset.

### Removing repeated lookup work

Weather lookup became an important optimization opportunity because each race run repeatedly queries irradiance along the route, and a speed sweep repeats that process for many candidate speeds. Reusing the previous lookup position reduced repeated searching without replacing the underlying energy model. This was a practical lesson in identifying expensive repeated work before refining the strategy itself.

### Making the strategy configurable

The adaptive strategy exposes settings for decision interval, look-ahead distance, speed range and increment, starting speed, battery reserve, and maximum speed change. A separate set of options controls whether the final sprint is enabled, when it begins, its maximum speed, and its target finishing reserve. The program prints each selected segment speed along with battery state and finishes with a summary of race viability, finish time, final battery, minimum battery, and the number of strategy decisions.

</section>
<section id="solar-results" markdown="1">

## Results from the captured simulation runs

{% include project-page-sections/gallery.html images=page.strategy_outputs %}

<div class="solar-table" markdown="1">

| Reported output | Segment strategy | Route-point strategy |
| --- | --- | --- |
| Result | Viable | Viable |
| Simulated finish on October 28, 2023 | 11:34:45.919 | 11:31:01.216 |
| Final battery | 4.26 kWh (81.90%) | 4.27 kWh (82.12%) |
| Minimum battery | 1.01 kWh near 1,765.16 km | 1.01 kWh near 1,765.16 km |
| Speed decisions | 301 | 28,842 |
| Final battery target | Not enabled | Not enabled |

</div>

The route-point run finished about **3 minutes 45 seconds earlier** in these screenshots, with slightly more battery remaining. It also made substantially more decisions. The comparison highlights a design question: how much extra responsiveness is useful relative to the additional decision-making work?

<div class="solar-note" markdown="1">

These screenshots document two successful runs, not a controlled benchmark proving one strategy is always better. They do not show every configuration setting or execution time. The finish dates belong to the simulated race, and the outputs are model predictions rather than measured vehicle performance.

</div>

</section>
<section id="solar-limits" markdown="1">

## Testing and model limitations

I checked the model by sweeping a broad range of constant speeds and by running the adaptive modes through the same race rules and energy equations. Input validation rejects invalid strategy ranges and reserve settings, while each run resets time and weather-lookup state so repeated simulations begin from the same conditions.

The adaptive logic is intentionally a look-ahead heuristic rather than a globally optimal race planner. Its prediction uses current irradiance across the look-ahead window and does not plan future overnight or control-stop charging. Speed changes occur only at route points, and the model does not include acceleration, braking losses, or handling constraints. These boundaries keep the strategy understandable while identifying clear directions for future refinement.

### What I would improve next

I would compare both strategies with the same recorded settings, measure execution time alongside finish time and battery reserves, and test sensitivity to weather and vehicle assumptions. A more complete planner could incorporate forecast changes and future charging opportunities, then account for acceleration and braking before its speed choices are considered for a physical vehicle.

## What the project taught me

This project connected mechanical and electrical physics with software design and data processing. Choosing a speed required tracking the interaction of drag, terrain, sunlight, time, and stored energy over thousands of kilometres. I learned to establish a baseline, make the decision rules explicit, and separate a viable simulated outcome from a claim of an optimal strategy.

[Explore the simulator source code on GitHub](https://github.com/jjamesllee/Solar-Race-Strategy-Simulator){:target="_blank" rel="noopener noreferrer" title="Opens in a new tab"}

</section>
</div>
