# Image sources

- `backgrounds/sierpinski.svg`: original five-level recursive triangular subdivision, rendered as an outline Sierpiński triangle. Construction reference: https://mathworld.wolfram.com/SierpinskiSieve.html.
- `backgrounds/dragon.svg`: original eleven-iteration dragon curve, generated with the FX L-system and 90-degree turns. Construction reference: https://mathworld.wolfram.com/DragonCurve.html.

- `backgrounds/lorenz.svg`: original numerical rendering of the Lorenz system with sigma = 10, rho = 28, beta = 8/3. Equations and parameters: https://sprott.physics.wisc.edu/chaos/lorenzle.htm. Integrated with RK4 and projected into the x-z plane.
- `backgrounds/chladni.svg`: original zero-contour rendering of cos(3*pi*x/L)*cos(5*pi*y/L) - cos(5*pi*x/L)*cos(3*pi*y/L). Mathematical model: https://resources.wolframcloud.com/FunctionRepository/resources/ChladniFigure/.
- `../../source-assets/experiments/quasiperiodic.svg`: original contour composition from five equally spaced plane-wave directions. Used as a decorative quasiperiodic interference field.

- `backgrounds/golden.svg`, `phyllotaxis.svg`, archived `../../source-assets/experiments/{lissajous,isometric,waves,rosette}.svg`: original vector compositions generated from logarithmic spirals, the golden-angle leaf arrangement, sinusoidal parametric curves, triangular lattices, superposed sine waves, and a seven-fold polar harmonic. Decorative page backgrounds.
- `garden/{hoddmimis-holt,glasir,mimameidr,laeradr,yggdrasil}.svg`: transparent tree illustrations by Lorc, Delapouite, and Cathelineau from Game-icons.net, CC BY 3.0. See `garden/SOURCES.md` for individual source pages and license details.
- `social/email.svg`: original outline envelope icon, used as a theme-coloured CSS mask.

- `identity/university-of-toronto-crest-blue.svg`: crest geometry from the University of Toronto website signature SVG, https://www.utoronto.ca/themes/custom/bootstrap_uoft/logo.svg. Crest isolated and rendered in U of T blue (#1E3765) for the site header. University trademark remains its property.
- `../../source-assets/experiments/james-lee-gear.svg`: James Lee's existing gear mark, with a transparent centre and a centred vector J to avoid font-dependent baseline shifts.
- `social/github.svg` and `social/linkedin.svg`: Bootstrap Icons, https://github.com/twbs/icons, MIT license. CSS masks allow theme-aware monochrome display.
- `../../source-assets/backgrounds/spectre-aperiodic-tiling.svg`: a finite Spectre tiling patch generated from the substitution geometry in Craig S. Kaplan's interactive application, https://cs.uwaterloo.ca/~csk/spectre/. Work by David Smith, Joseph Samuel Myers, Craig S. Kaplan, and Chaim Goodman-Strauss (2023). The source page permits modification of sample images under CC BY 4.0: https://creativecommons.org/licenses/by/4.0/. Adapted to a continuous tall outline-only SVG crop for the scrolling website background.
- `../../source-assets/experiments/pixelated-floppy-disk.png`: existing portfolio image, archived and not published.
- `../../source-assets/experiments/spectre-aperiodic-tiling.svg`: archived optimized vector mask derived from the editable Spectre source above. Tile copies outside the crop are removed, curves retain their coordinates, and the stroke width is 0.055 viewBox units for clearer rendering at screen sizes. No longer referenced by the website.

All six active mathematical fields are original deterministic exports reproduced by `scripts/generate_backgrounds.py`. Archived files above are excluded from Jekyll output.

- `../../favicon.svg`, `../../favicon.ico`, and `identity/favicon-32.png`: original circular monogram with a transparent J cutout. SVG is the editable source; ICO and PNG are raster exports.
