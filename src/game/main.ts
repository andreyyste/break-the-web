import { AUTO, Game } from 'phaser';

import { PrologueScene } from './scenes/PrologueScene';
import { HorrorScene } from './scenes/HorrorScene';

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 800,
    height: 500,
    parent: 'game-container',
    backgroundColor: '#0a0a0a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: []
};

const StartGame = (parent: string | HTMLElement) => {
    const isHorror = (window as any).isHorrorMode || false;
    const finalConfig = {
        ...config,
        parent,
        scene: isHorror ? [HorrorScene, PrologueScene] : [PrologueScene, HorrorScene]
    };
    return new Game(finalConfig);
}

export default StartGame;
