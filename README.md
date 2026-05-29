# Break The Web

A meta-puzzle game where a standard React portfolio website becomes the physics-based environment for a Phaser 3 snake game. 

What starts as a simple 2D platformer quickly turns into a battle against the DOM itself. Drag and drop HTML elements into the game canvas, use CSS classes as weapons, and survive a total system failure.

## Features
- **Cross-Realm Interactions**: Use HTML5 Drag-and-Drop to pull UI elements (Inputs, Images) directly into the Phaser physics engine.
- **Bi-directional Communication**: The React UI updates based on game state, and the game state updates based on UI interactions.
- **Persistent Horror Mode**: Crashing the game permanently corrupts the website via `localStorage`, altering the entire aesthetic and unlocking new puzzles.

## Prerequisites
- Node.js (v16 or higher)
- npm

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/break-the-web.git
cd break-the-web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open `http://localhost:5173` in your browser.

## How to Play
1. Click the `#game-box` on the homepage to start the game.
2. Use `WASD` or `Arrow Keys` to move the snake.
3. Pay close attention to the website around you—if you get stuck, the solution might be hidden in the HTML.
4. If you enter Horror Mode, use the Developer Console (button in the footer) and run `reset --hard` if you wish to return to the normal portfolio.

## Technologies Used
- React 18
- Vite
- Phaser 3
- Zustand (State Management)
- Vanilla CSS

