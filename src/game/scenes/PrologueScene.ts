import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { EventBus, ElementDropData } from '../events';

export class PrologueScene extends Scene {
    private snake!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | Phaser.GameObjects.Rectangle;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: any;
    private platforms!: Phaser.Physics.Arcade.StaticGroup;
    private debrisGroup!: Phaser.Physics.Arcade.Group;
    private isDead: boolean = false;
    private levelComplete: boolean = false;
    private corruptionStarted: boolean = false;
    private firewall: any;
    private safeZone: any;
    private firewallHint: Phaser.GameObjects.Text | null = null;

    constructor() {
        super('Prologue');
    }

    create(data?: { startX?: number }) {
        const startX = data?.startX || 150;
        const isHorrorMode = (window as any).isHorrorMode || false;

        // Set world bounds to be much wider
        this.physics.world.setBounds(0, 0, 2400, 500);
        this.cameras.main.setBounds(0, 0, 2400, 500);
        
        if (isHorrorMode) {
            this.cameras.main.setBackgroundColor('#1a0000');
        }

        // Create platforms with a gap
        this.platforms = this.physics.add.staticGroup();
        // Left platform
        this.platforms.create(150, 480, undefined).setSize(300, 40).setDisplaySize(300, 40).setOrigin(0.5).setTint(isHorrorMode ? 0x330000 : 0x333333);
        // Right platform extending to end of level
        this.platforms.create(1450, 480, undefined).setSize(1900, 40).setDisplaySize(1900, 40).setOrigin(0.5).setTint(isHorrorMode ? 0x330000 : 0x333333);

        // Add firewall on the right platform
        if (startX <= 150) {
            this.firewall = this.add.rectangle(780, 400, 40, 200, 0xff0000) as any;
            this.physics.add.existing(this.firewall, true);

            // Add firewall hint
            this.firewallHint = this.add.text(780, 280, '<firewall>\nrequires: rm', {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#ff0000',
                align: 'center'
            }).setOrigin(0.5);
        }

        // Safe zone at the end
        this.safeZone = this.add.rectangle(2300, 350, 100, 220, 0x00ffff, 0.3) as any;
        this.physics.add.existing(this.safeZone, true);
        (this.safeZone.body as any).isSensor = true;

        // Spawn snake
        this.snake = this.add.rectangle(startX, 400, 32, 32, isHorrorMode ? 0xcc0000 : 0x00ff00) as any;
        this.physics.add.existing(this.snake);
        const body = this.snake.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);
        this.physics.world.setBoundsCollision(true, true, true, false); // Allow falling out bottom
        this.physics.add.collider(this.snake, this.platforms);
        if (this.firewall) this.physics.add.collider(this.snake, this.firewall);
        
        // Debris group
        this.debrisGroup = this.physics.add.group();
        this.physics.add.collider(this.debrisGroup, this.platforms, undefined, (debris: any) => {
            // Only collide with the platform when falling down (velocity Y > 0)
            return debris.body.velocity.y > 0;
        });
        this.physics.add.overlap(this.snake, this.debrisGroup, this.handleDebrisHit as any, undefined, this);

        // Camera follow
        this.cameras.main.startFollow(this.snake, true, 0.1, 0.1);

        body.setBounce(0.2);
        body.setDrag(500);
        body.setMaxVelocity(300);

        // Input
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = this.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D
            });
        }

        // Gravity is 0 by default, let's add gravity for the snake to fall into the gap
        body.setGravityY(800);

        // Listen for React DOM drops
        EventBus.addEventListener('elementDrop', this.handleElementDrop as EventListener);
        EventBus.addEventListener('destroyFirewall', this.handleDestroyFirewall as EventListener);
        EventBus.addEventListener('terminalToggle', this.handleTerminalToggle as EventListener);
        EventBus.addEventListener('spawnDebris', this.handleSpawnDebris as EventListener);

        this.events.on('shutdown', () => {
            EventBus.removeEventListener('elementDrop', this.handleElementDrop as EventListener);
            EventBus.removeEventListener('destroyFirewall', this.handleDestroyFirewall as EventListener);
            EventBus.removeEventListener('terminalToggle', this.handleTerminalToggle as EventListener);
            EventBus.removeEventListener('spawnDebris', this.handleSpawnDebris as EventListener);
        });
    }

    private handleDebrisHit = () => {
        if (!this.isDead && !this.levelComplete) {
            this.triggerDeath();
        }
    }

    private handleSpawnDebris = (e: any) => {
        if (this.isDead || this.levelComplete) return;
        const lettersToSpawn = e.detail.letters as string[];

        lettersToSpawn.forEach((letter, index) => {
            this.time.delayedCall(index * 600, () => {
                if (this.isDead || this.levelComplete) return;
                
                const spawnX = Phaser.Math.Between(this.snake.x + 100, this.snake.x + 350);
                
                const warningLine = this.add.rectangle(spawnX, 480, 2, 80, 0xffaa00, 0.8);
                warningLine.setOrigin(0.5, 1);
                
                this.tweens.add({
                    targets: warningLine,
                    alpha: 0,
                    yoyo: true,
                    duration: 150,
                    repeat: 3,
                    onComplete: () => {
                        warningLine.destroy();
                        if (this.isDead || this.levelComplete) return;
                        
                        const debris = this.add.text(spawnX, 550, letter, {
                            fontFamily: 'monospace',
                            fontSize: '28px',
                            color: (window as any).isHorrorMode ? '#ff0000' : '#ffaa00',
                            fontStyle: 'bold'
                        }).setOrigin(0.5);

                        this.physics.add.existing(debris);
                        this.debrisGroup.add(debris);
                        
                        const body = debris.body as Phaser.Physics.Arcade.Body;
                        body.setVelocityY(Phaser.Math.Between(-650, -800));
                        body.setGravityY(400);
                        body.setBounce(0.6);
                        body.setAngularVelocity(Phaser.Math.Between(-200, 200));
                    }
                });
            });
        });
    }

    private handleTerminalToggle = (e: any) => {
        const isOpen = e.detail;
        if (this.input && this.input.keyboard) {
            this.input.keyboard.enabled = !isOpen;
            if (isOpen) {
                // Reset keys so snake stops moving
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

    private handleDestroyFirewall = () => {
        if (this.firewall) {
            if (this.firewallHint) {
                this.firewallHint.destroy();
                this.firewallHint = null;
            }
            // Visual effect
            this.tweens.add({
                targets: this.firewall,
                alpha: 0,
                scaleY: 0,
                duration: 500,
                onComplete: () => {
                    this.firewall.destroy();
                    this.firewall = null;
                }
            });
        }
    }

    private handleElementDrop = (e: CustomEvent<ElementDropData>) => {
        if (this.isDead) return;
        const { text, x, y } = e.detail;
        
        // Spawn the dropped DOM element as a Phaser text platform
        const droppedEntity = this.add.text(x, y, text, {
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.physics.add.existing(droppedEntity, true); // true = static body
        this.platforms.add(droppedEntity);
    }

    update() {
        if (this.isDead) return;
        if (!this.snake.body) return;
        const body = this.snake.body as Phaser.Physics.Arcade.Body;

        if (this.snake.y > 600) {
            this.triggerDeath();
            return;
        }

        if (this.snake.x > 850 && !this.corruptionStarted) {
            this.corruptionStarted = true;
            EventBus.dispatchEvent(new CustomEvent('startCorruption'));
            
            const warning = this.add.text(this.snake.x, 200, 'WARNING: HOST INTEGRITY COMPROMISED', {
                fontFamily: 'monospace', fontSize: '24px', color: '#ff0000', backgroundColor: '#000000'
            }).setOrigin(0.5);
            this.tweens.add({ targets: warning, alpha: 0, y: 100, duration: 4000 });
        }

        if (this.physics.overlap(this.snake, this.safeZone) && !this.levelComplete) {
            this.levelComplete = true;
            body.setVelocity(0, 0);
            body.setAllowGravity(false);
            
            // Trigger system crash sequence
            EventBus.dispatchEvent(new CustomEvent('systemCrash'));
            
            // Phaser visual crash buildup
            this.cameras.main.shake(7000, 0.03); // Shake for 7 seconds
            
            this.add.text(this.snake.x, 200, 'CRITICAL ERROR: KERNEL PANIC', {
                fontFamily: 'monospace', fontSize: '32px', color: '#ff0000', backgroundColor: '#000000'
            }).setOrigin(0.5);
            
            // Random glitch text spawning inside Phaser
            this.time.addEvent({
                delay: 100,
                callback: () => {
                    this.add.text(
                        this.snake.x + Phaser.Math.Between(-400, 400),
                        Phaser.Math.Between(0, 500),
                        'ERR_' + Phaser.Math.Between(1000, 9999),
                        { color: '#ff0000', fontSize: Phaser.Math.Between(12, 36) + 'px', fontFamily: 'monospace' }
                    );
                },
                repeat: 70
            });
        }

        if (this.levelComplete) return;

        const speed = 200;

        // Reset X velocity
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

    private triggerDeath() {
        this.isDead = true;
        
        // Stop the snake
        const body = this.snake.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0, 0);
        body.setAllowGravity(false);

        const cx = this.cameras.main.scrollX + 400;
        const cy = this.cameras.main.scrollY + 250;

        // Dark overlay
        this.add.rectangle(cx, cy, 800, 500, 0x000000, 0.8).setOrigin(0.5);

        // YOU DIED text
        this.add.text(cx, cy - 50, 'SYSTEM FAILURE', {
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: '48px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Retry button
        const retryBtn = this.add.text(cx, cy + 50, '> RETRY <', {
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        retryBtn.on('pointerover', () => retryBtn.setColor('#00ff00'));
        retryBtn.on('pointerout', () => retryBtn.setColor('#ffffff'));
        retryBtn.on('pointerdown', () => {
            // Determine checkpoint based on snake position
            const checkpointX = this.snake.x > 850 ? 900 : 150;
            
            // Reset React state (bring the 'T' back to the DOM, reset corruption)
            EventBus.dispatchEvent(new CustomEvent('resetReactState'));
            
            // Restart the Phaser scene and pass checkpoint data
            this.scene.restart({ startX: checkpointX });
            this.isDead = false;
        });
    }
}
