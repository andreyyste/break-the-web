# Break The Web - Agent Handoff Document

Welcome! If you are an AI agent picking up this project, this document will give you the full context of what has been built, the mechanics, and the roadmap for what comes next.

## The Concept
**"Break The Web"** is a meta-game where a standard React portfolio website becomes the level geometry for a 2D Phaser game. The player controls a snake that physically interacts with DOM elements.
As the game progresses, the system "corrupts" and enters **Horror Mode**, where the website becomes dark, glitches out, and puzzles require cross-realm interactions (using the HTML5 Drag-and-Drop API to drag elements from the React DOM into the Phaser Canvas).

## Tech Stack
- **Frontend**: React (Vite)
- **Game Engine**: Phaser 3 (integrated inside a React component)
- **State Management**: Zustand (`store.ts`)
- **Communication**: Custom `EventBus` (`events.ts`) for React <-> Phaser bi-directional events
- **Styling**: Vanilla CSS (`index.css`)

## Core Mechanics
- **Phaser/React Bridge**: Phaser emits events to React (e.g. `stealElement`, `systemCrash`), and React emits events to Phaser (e.g. `unlockVault`, `avatarDropped`).
- **Horror Mode**: Triggered after Checkpoint 3. The `App.tsx` state checks `localStorage.getItem('horrorMode')`. If true, the entire website applies `.horror-theme` and Phaser boots into `HorrorScene.ts` instead of `PrologueScene.ts`.
- **Drag-and-Drop**: Elements in React are set to `draggable={isHorrorMode}`. They are dropped onto the Phaser `#game-container`, passing data via `e.dataTransfer`.

## Current State (Checkpoint 7 Completed)
We have successfully implemented up to **Checkpoint 7** of the original 12-checkpoint plan.

### Completed Checkpoints:
1. **The Stolen Title**: Snake steals the `T` from the React header.
2. **Terminal Injection**: Player uses a React terminal to spawn platforms in the game.
3. **Total System Failure**: The snake touches a corrupt element, causing a kernel panic, crashing the browser, and forcing a reload into Horror Mode.
4. **Horror Mode Reloaded**: The game boots into a dark, corrupted state (`HorrorScene.ts`).
5. **(Scrapped)**: The original ceiling trap puzzle was scrapped.
6. **The Input Code (Vault)**: Player drags an Email `<input>` field from React into Phaser to type a passcode (`0451`) and unlock a massive vault door.
7. **The Avatar Boulder**: Player drags their Profile Picture (`<img>`) into Phaser. It spawns as a 100kg physics boulder used to crush a pressure plate and open an iron gate.

## Roadmap for Next Agent (Checkpoints 8-12)
The next agent should continue building out `HorrorScene.ts` (or transition to a new scene) with the following puzzles:

- **Checkpoint 8 (Class Theft)**: Enemies block the way. Player must inspect/drag a `.hidden` or `display: none` CSS text badge into the game. Touching enemies with this "CSS Class weapon" makes them vanish.
- **Checkpoint 9 (Social Gears)**: A mechanical door needs gears. Player drags Twitter and LinkedIn SVG icons from the footer into the game to place them on the door mechanisms.
- **Checkpoint 10 (Checkbox Platforms)**: The snake needs a bridge. The player clicks actual `<input type="checkbox">` elements in a React form. Checked boxes spawn solid platforms in Phaser; unchecked removes them.
- **Checkpoint 11 (Canvas Resizing)**: The snake is trapped in a small room. The player must use a React slider `<input type="range">` to manually stretch the `#game-box` width/height to reveal the exit.
- **Checkpoint 12 (The Great Escape)**: The final boss sequence. The snake must outrun a collapsing DOM.

## Important Notes for Agents
- Do **not** use `localStorage` for normal game state; it is exclusively used for the `horrorMode` persistence to survive the browser reload.
- **CSS**: Stick to `index.css`. We are strictly using Vanilla CSS. Do not install Tailwind.
- **Typescript**: Be careful with Phaser physics types. Cast to `Phaser.Physics.Arcade.Body` when modifying velocity/gravity.
- **Testing**: Run `npx tsc --noEmit` to verify type safety after writing game logic.

Good luck, and build something terrifying!
