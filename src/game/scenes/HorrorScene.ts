import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { EventBus } from '../events';

export class HorrorScene extends Scene {
    private snake!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | Phaser.GameObjects.Rectangle;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: any;
    private platforms!: Phaser.Physics.Arcade.StaticGroup;
    private vaultDoor!: Phaser.GameObjects.Rectangle;
    private vaultCollider!: Phaser.Physics.Arcade.Collider;
    private isDead: boolean = false;
    private exitDoor!: Phaser.GameObjects.Rectangle;
    private pressurePlate!: Phaser.GameObjects.Rectangle;
    private gateDoor!: Phaser.GameObjects.Rectangle;
    private gateCollider!: Phaser.Physics.Arcade.Collider;
    private avatarBoulder!: Phaser.GameObjects.Rectangle;
    private gateOpened: boolean = false;

    constructor() {
        super('Horror');
    }

    create() {
        this.physics.world.setBounds(0, 0, 2000, 500);
        this.cameras.main.setBounds(0, 0, 2000, 500);
        this.cameras.main.setBackgroundColor('#050000');

        this.platforms = this.physics.add.staticGroup();
        
        // Floor
        this.platforms.create(1000, 480, undefined).setSize(2000, 40).setDisplaySize(2000, 40).setOrigin(0.5).setTint(0x330000);
        
        // Vault Door blocking path at x=500
        this.vaultDoor = this.add.rectangle(500, 240, 80, 440, 0x222222) as any;
        this.physics.add.existing(this.vaultDoor, true);
        
        // Cryptic Text
        this.add.text(500, 240, 'LOCKED', {
            fontFamily: 'monospace', fontSize: '20px', color: '#ff0000', fontStyle: 'bold'
        }).setOrigin(0.5).setAngle(-90);

        // Pressure Plate (x=1400)
        this.pressurePlate = this.add.rectangle(1400, 455, 80, 10, 0xff0000) as any;
        this.physics.add.existing(this.pressurePlate, true);
        (this.pressurePlate.body as any).isSensor = true; // Snake or boulder can overlap it

        // Gate Door blocking path at x=1700
        this.gateDoor = this.add.rectangle(1700, 240, 40, 440, 0x555555) as any;
        this.physics.add.existing(this.gateDoor, true);
        this.gateCollider = this.physics.add.collider(this.snake ? this.snake : (this as any)._tempSnakePlaceholder, this.gateDoor);

        // Exit door
        this.exitDoor = this.add.rectangle(1900, 410, 60, 100, 0xffffff) as any;
        this.physics.add.existing(this.exitDoor, true);
        (this.exitDoor.body as any).isSensor = true;
        this.add.text(1900, 340, 'exit()', { fontFamily: 'monospace', color: '#ffffff' }).setOrigin(0.5);

        // Snake
        this.snake = this.add.rectangle(100, 400, 32, 32, 0xaa0000) as any;
        this.physics.add.existing(this.snake);
        const body = this.snake.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);
        this.physics.add.collider(this.snake, this.platforms);
        this.vaultCollider = this.physics.add.collider(this.snake, this.vaultDoor);
        
        // We assigned snake after gateDoor, so recreate gate collider
        if (this.gateCollider) this.physics.world.removeCollider(this.gateCollider);
        this.gateCollider = this.physics.add.collider(this.snake, this.gateDoor);
        
        this.cameras.main.startFollow(this.snake, true, 0.1, 0.1);

        body.setBounce(0.2);
        body.setDrag(500);
        body.setMaxVelocity(300);
        body.setGravityY(800);

        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = this.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D
            });
        }

        EventBus.addEventListener('terminalToggle', this.handleTerminalToggle as EventListener);
        EventBus.addEventListener('unlockVault', this.handleUnlockVault as EventListener);
        EventBus.addEventListener('avatarDropped', this.handleAvatarDropped as EventListener);

        this.events.on('shutdown', () => {
            EventBus.removeEventListener('terminalToggle', this.handleTerminalToggle as EventListener);
            EventBus.removeEventListener('unlockVault', this.handleUnlockVault as EventListener);
            EventBus.removeEventListener('avatarDropped', this.handleAvatarDropped as EventListener);
        });
    }

    private handleAvatarDropped = (e: any) => {
        const { x, y } = e.detail;
        const worldX = this.cameras.main.scrollX + x;
        const worldY = this.cameras.main.scrollY + y;

        // Spawn a massive heavy boulder
        this.avatarBoulder = this.add.rectangle(worldX, worldY, 100, 100, 0x888888) as any;
        this.add.text(worldX, worldY, '[AVATAR]', { fontFamily: 'monospace', color: '#000', fontSize: '16px', fontStyle: 'bold' }).setOrigin(0.5);

        this.physics.add.existing(this.avatarBoulder);
        const boulderBody = this.avatarBoulder.body as Phaser.Physics.Arcade.Body;
        boulderBody.setCollideWorldBounds(true);
        boulderBody.setBounce(0.1);
        boulderBody.setMass(100); // Super heavy
        boulderBody.setDrag(800); // Friction so it stops when pushed
        boulderBody.setGravityY(1500); // Heavy gravity

        this.physics.add.collider(this.avatarBoulder, this.platforms);
        this.physics.add.collider(this.avatarBoulder, this.snake); // Snake can push it
        this.physics.add.collider(this.avatarBoulder, this.vaultDoor);
        this.physics.add.collider(this.avatarBoulder, this.gateDoor);
    }

    private handleUnlockVault = () => {
        if (this.vaultDoor) {
            this.cameras.main.shake(500, 0.02);
            this.physics.world.removeCollider(this.vaultCollider);
            this.tweens.add({
                targets: this.vaultDoor,
                y: 700,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => {
                    this.vaultDoor.destroy();
                }
            });
        }
    }

    private handleTerminalToggle = (e: any) => {
        const isOpen = e.detail;
        if (this.input && this.input.keyboard) {
            this.input.keyboard.enabled = !isOpen;
            if (isOpen) {
                if (this.cursors) {
                    this.cursors.up.reset();
                    this.cursors.down.reset();
                    this.cursors.left.reset();
                    this.cursors.right.reset();
                }
                if (this.wasd) {
                    this.wasd.up.reset();
                    this.wasd.down.reset();
                    this.wasd.left.reset();
                    this.wasd.right.reset();
                }
            }
        }
    }

    update() {
        if (this.isDead) return;
        if (!this.snake.body) return;
        const body = this.snake.body as Phaser.Physics.Arcade.Body;

        if (this.physics.overlap(this.snake, this.exitDoor)) {
            body.setVelocity(0, 0);
            body.setAllowGravity(false);
            const cx = this.cameras.main.scrollX + 400;
            this.add.text(cx, 250, 'YOU HAVE ESCAPED THE WEB', {
                fontFamily: 'monospace', fontSize: '32px', color: '#ffffff'
            }).setOrigin(0.5);
            this.isDead = true;
            return;
        }

        // Pressure Plate Logic
        if (this.physics.overlap(this.snake, this.pressurePlate)) {
            // Snake touches it
        }

        // Only the avatar boulder is heavy enough
        if (this.avatarBoulder && this.physics.overlap(this.avatarBoulder, this.pressurePlate)) {
            this.pressurePlate.fillColor = 0x00ff00; // Turns green
            
            // Open gate if not already opened
            if (!this.gateOpened && this.gateDoor) {
                this.gateOpened = true;
                this.cameras.main.shake(200, 0.01);
                this.physics.world.removeCollider(this.gateCollider);
                this.tweens.add({
                    targets: this.gateDoor,
                    y: 700,
                    duration: 1500,
                    ease: 'Power2'
                });
            }
        } else {
            this.pressurePlate.fillColor = 0xff0000; // Red when unpressed
        }

        const speed = 200;
        body.setVelocityX(0);

        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            body.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            body.setVelocityX(speed);
        }

        if ((this.cursors.up.isDown || this.wasd.up.isDown) && body.touching.down) {
            body.setVelocityY(-400);
        }
    }
}
