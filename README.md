# Snooker Game

This project implements a browser-based snooker game built with [p5.js](https://p5js.org/) and the [Matter.js](https://brm.io/matter-js/) physics engine.
It was created for a graphics programming coursework assignment.

## Features
- Realistic snooker table scaled to fit the browser window
- Cue ball and colored balls with scoring according to snooker rules
- Pockets and cushions using Matter.js physics
- Cue control with arrow keys and space bar
- Game modes: Standard setup, Random Reds and Random All
- On-screen prompts for events such as fouls or pocketed balls

## Controls
- **Left / Right Arrow** &mdash; Rotate the cue
- **Space** &mdash; Strike the cue ball
- **A** &mdash; Randomize positions of all balls
- **R** &mdash; Randomize positions of only the red balls
- **G** &mdash; Reset the game
- Drag the cue or cue ball with the mouse to reposition them

## Running the game
Open `index.html` in a modern web browser. If the game does not load due to
browser security restrictions, you can serve the directory locally, e.g.:

```bash
python3 -m http.server
```

Then visit `http://localhost:8000` in your browser.

## File overview
- `index.html` &mdash; Loads the scripts and creates the canvas
- `objects.js` &mdash; Classes for balls, the cue, cushions and pockets
- `helper-functions.js` &mdash; Game logic such as scoring and collisions
- `sketch.js` &mdash; Main p5.js sketch
- `style.css` &mdash; Minimal styling for the page
- `libraries/` &mdash; Bundled copies of p5.js, p5.sound and Matter.js

Enjoy the game!
