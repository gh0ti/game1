window.addEventListener('load', function () {
    // canvas setup
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1500;
    canvas.height = 500;

    class InputHandler {
        constructor(game) {
            this.game = game;
            window.addEventListener('keydown', e => {
                if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && this.game.keys.indexOf(e.key) === -1) {
                    this.game.keys.push(e.key);
                } else if (e.key === ' ') {
                    this.game.player.shootTop();
                }
                console.log(this.game.keys);
            });
            window.addEventListener('keyup', e => {
                if (this.game.keys.indexOf(e.key) > -1) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
                console.log(this.game.keys);
            })
        }
    }

    class Projectile {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            this.markedForDeletion = false;
        }

        update() {
            this.x += this.speed;
            if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }

        draw(context) {
            context.fillStyle = 'yellow';
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    class Particle {

    }

    class Player {
        constructor(game) {
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.speedY = 0;
            this.maxSpeed = 2;
            this.projectiles = [];
            this.maxAmmo = 20;
            this.ammo = this.maxAmmo;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
        }

        update(deltaTime) {
            // handle movement
            if (this.game.keys.includes('ArrowUp')) {
                this.speedY = -this.maxSpeed;
            } else if (this.game.keys.includes('ArrowDown')) {
                this.speedY = this.maxSpeed;
            } else {
                this.speedY = 0;
            }
            this.y += this.speedY;

            // handle projectiles
            this.projectiles.forEach(projectile => {
                projectile.update();
            });
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);

            // handle ammo
            if (this.ammoTimer > this.ammoInterval) {
                console.log('process ammo update');
                if (this.ammo < this.maxAmmo) {
                    console.log('ammo update');
                    this.ammo++;
                }
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }
        }

        draw(context) {
            context.fillStyle = 'black';
            context.fillRect(this.x, this.y, this.width, this.height);

            this.projectiles.forEach(projectile => projectile.draw(context));
        }

        shootTop() {
            if (this.ammo <= 0) {
                return;
            }
            this.projectiles.push(new Projectile(this.game, this.x + 70, this.y + 30));
            this.ammo--;
            console.log(this.projectiles);
        }
    }

    class Enemy {

    }

    class Layer {

    }

    class Background {

    }

    class UI {
        constructor(game) {
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Helvetica';
            this.color = 'yellow';
        }

        draw(context) {
            context.fillStyle = this.color;
            console.log(this.game.player.ammo);
            for (let i = 0; i < this.game.player.ammo; i++) {
                context.fillRect(20 + 5 * i, 20, 3, 20);
            }
        }
    }

    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
        }

        update(deltaTime) {
            this.player.update(deltaTime);
        }

        draw(context) {
            this.player.draw(context);
            this.ui.draw(context);
        }
    }

    const game = new Game(canvas.width, canvas.height);

    //TODO: extract this code to the class, inject the game object and create it in the game constructor
    let lastTime = 0;
    //animation loop
    function animate(timeStamp = 0) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate)
    }
    animate();
})
