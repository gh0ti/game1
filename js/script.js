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
                    this.game.player.shoot();
                } else if (e.key === 'd') {
                    this.game.debug = !this.game.debug;
                }
            });
            window.addEventListener('keyup', e => {
                if (this.game.keys.indexOf(e.key) > -1) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
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
            this.image = document.getElementById('projectile');
        }

        update() {
            this.x += this.speed;
            if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }

        draw(context) {
            context.fillStyle = 'yellow';
            if (this.game.debug) {
                context.strokeRect(this.x, this.y, this.width, this.height);
            }
            context.drawImage(this.image, this.x, this.y,);
        }
    }

    class Particle {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('gears');
            this.frameX = Math.floor(Math.random() * 3);
            this.frameY = Math.floor(Math.random() * 3);
            this.spriteSize = 50;
            this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
            this.size = this.spriteSize * this.sizeModifier;
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * -15;
            this.gravity = 0.5;
            this.markedForDeletion = false;
            this.angle = 0;
            this.va = Math.random() * 0.2;
        }

        update() {
            this.angle += this.va;
            this.speedY += this.gravity;

            this.x += -this.speedX;

            if (this.y > 400) {
                this.speedY = -this.speedY * 0.5;
                if (this.speedY > -5) {
                    this.markedForDeletion = true;
                }
            }

            this.y += this.speedY;
        }

        draw(context) {
            context.save();
            context.translate(this.x, this.y);
            context.rotate(this.angle);
            context.drawImage(this.image, this.frameX * this.spriteSize, this.frameY * this.spriteSize, this.spriteSize, this.spriteSize, this.size * -0.5, this.size * -0.5, this.size, this.size);
            context.restore();
        }
    }

    class Player {
        constructor(game) {
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
            this.speedY = 0;
            this.maxSpeed = 2;
            this.projectiles = [];
            this.maxAmmo = 20;
            this.ammo = this.maxAmmo;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
            this.image = document.getElementById('player');
            this.powerUp = false;
            this.powerUpTimer = 0;
            this.powerUpLimit = 10000;
        }

        update(deltaTime) {
            // handle movement
            if (this.game.keys.includes('ArrowUp')) {
                if (this.y > -this.height * 0.5) {
                    this.speedY = -this.maxSpeed;
                } else {
                    this.speedY = 0;
                }
            } else if (this.game.keys.includes('ArrowDown')) {
                if (this.y < (this.game.height - this.height * 0.5)) {
                    this.speedY = this.maxSpeed;
                } else {
                    this.speedY = 0;
                }
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
                if (this.ammo < this.maxAmmo) {
                    this.ammo++;
                }
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }

            if (this.frameX < this.maxFrame) {
                this.frameX++;
            } else {
                this.frameX = 0;
            }

            if (this.powerUp) {
                if (this.powerUpTimer > this.powerUpLimit) {
                    this.powerUp = false;
                    this.powerUpTimer = 0;
                    this.frameY = 0;
                } else {
                    this.powerUpTimer += deltaTime;
                    this.frameY = 1;
                }
            }


        }

        draw(context) {
            context.fillStyle = 'black';
            if (this.game.debug) {
                context.strokeRect(this.x, this.y, this.width, this.height);
            }
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, 120, 190, this.x, this.y, this.width, this.height);

            this.projectiles.forEach(projectile => projectile.draw(context));
        }

        shoot() {
            if (this.ammo <= 0) {
                return;
            }

            this.shootTop();

            if (this.powerUp) {
                this.shootBottom();
            }
        }

        shootTop() {
            this.projectiles.push(new Projectile(this.game, this.x + 70, this.y + 30));
            this.ammo--;
        }

        shootBottom() {
            this.projectiles.push(new Projectile(this.game, this.x + 70, this.y + 175));
        }

        enterPowerUp() {
            this.powerUp = true;
            this.powerUpTimer = 0;
            this.frameY = 2;
            this.ammo = this.maxAmmo;
        }
    }

    class Enemy {
        constructor(game) {
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5;
            this.markedForDeletion = false;
            this.lives = undefined;
            this.score = undefined;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
            this.image = undefined;
        }

        update() {
            this.x += this.speedX - this.game.speed;
            if (this.x + this.width < 0) this.markedForDeletion = true;

            if (this.frameX < this.maxFrame) {
                this.frameX++;
            } else {
                this.frameX = 0;
            }
        }

        draw(context) {
            context.fillStyle = 'red';
            if (this.game.debug) {
                context.strokeRect(this.x, this.y, this.width, this.height);

                context.fillStyle = 'black';
                context.font = '20px Helvetica';
                context.fillText(this.lives, this.x, this.y)
            }
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height)
        }

        createParticles() {
            let particles = [];
            const particlesCount = this.lives <= 0 ? this.score : 1;
            for (let i = 0; i < particlesCount; i++) {
                particles.push(new Particle(game, this.x + this.width * 0.5, this.y + this.height * 0.5));
            }

            return particles;
        }

        processDamage(collider) {
            if (collider instanceof Player) {
                this.lives = 0;
            } else {
                this.lives--;
            }

            this.game.particles = this.game.particles.concat(this.createParticles());

            if (this.lives <= 0) {
                this.processDeletion(collider);
            }
        }

        processDeletion(collider) {
            this.markedForDeletion = true;
        }
    }

    class Angler1 extends Enemy {
        constructor(game) {
            super(game);
            this.lives = 2;
            this.score = this.lives;
            this.width = 228;
            this.height = 169;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('angler1');
            this.frameX = 38;
            this.frameY = Math.floor(Math.random() * 3);
        }
    }

    class Angler2 extends Enemy {
        constructor(game) {
            super(game);
            this.lives = 3;
            this.score = this.lives;
            this.width = 213;
            this.height = 165;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('angler2');
            this.frameX = 38;
            this.frameY = Math.floor(Math.random() * 2);
        }
    }

    class LuckyFish extends Enemy {
        constructor(game) {
            super(game);
            this.lives = 3;
            this.score = 15;
            this.type = 'lucky';
            this.width = 99;
            this.height = 95;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('lucky');
            this.frameX = 38;
            this.frameY = Math.floor(Math.random() * 2);
        }
    }

    class HiveWhale extends Enemy {
        constructor(game) {
            super(game);
            this.lives = 15;
            this.score = this.lives;
            this.type = 'hivewhale';
            this.width = 400;
            this.height = 227;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('hivewhale');
            this.frameX = 38;
            this.frameY = 0;
            this.speedX = Math.random() * -1.2 - 0.2;
        }

        processDeletion(collider) {
            super.processDeletion();

            if (collider instanceof Projectile) {
                for (let i = 0; i < 3; i++) {
                    const xCoord = this.x + Math.random() * this.width;
                    const yCoord = this.y + Math.random() * this.height;

                    this.game.enemies.push(new Drone(this.game, xCoord, yCoord));
                }
            }
        }
    }

    class Drone extends Enemy {
        constructor(game, x, y) {
            super(game);
            this.lives = 3;
            this.score = 3;
            this.type = 'drone';
            this.width = 115;
            this.height = 95;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('drone');
            this.frameX = 38;
            this.frameY = Math.floor(Math.random() * 2);
            this.speedX = Math.random() * -4.2 - 0.5;
        }
    }

    class Layer {
        constructor(game, image, speedModifier) {
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }

        update() {
            if (this.x <= -this.width) {
                this.x = 0;
            } else {
                this.x -= this.game.speed * this.speedModifier;
            }
        }

        draw(context) {
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y);
        }
    }

    class Background {
        constructor(game) {
            this.game = game;
            this.layer1 = new Layer(game, document.getElementById('layer1'), 0.3);
            this.layer2 = new Layer(game, document.getElementById('layer2'), 0.4);
            this.layer3 = new Layer(game, document.getElementById('layer3'), 1);
            this.layer4 = new Layer(game, document.getElementById('layer4'), 1.3);
            this.layers = [this.layer1, this.layer2, this.layer3/*, this.layer4*/];
        }

        update() {
            this.layers.forEach(layer => layer.update());
        }

        draw(context) {
            this.layers.forEach(layer => layer.draw(context));
        }
    }

    class UI {
        constructor(game) {
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Bangers';
            this.color = 'yellow';
        }

        draw(context) {
            context.save();

            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.font = this.fontSize + 'px ' + this.fontFamily;

            context.fillText(this.game.score, 20, 40);

            for (let i = 0; i < this.game.player.ammo; i++) {
                context.fillRect(20 + 5 * i, 50, 3, 20);
            }

            const formattedTime = Math.ceil((this.game.timeLimit - this.game.gameTime) * 0.001);
            context.fillText( `Time left: ${formattedTime}`, 20, 100);

            if (this.game.gameOver) {
                context.textAlign = 'center';
                let message1;
                let message2;
                if (this.game.score > this.game.winningScore) {
                    message1 = 'Most Wondrous!';
                    message2 = 'Well done explorer!';
                } else {
                    message1 = 'Blazes!';
                    message2 = 'Get my repair kit and try again';
                }
                context.font = '70px ' + this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 20);

                context.font = '25px ' + this.fontFamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 20);
            }

            context.restore();
        }
    }

    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.background = new Background(this);
            this.keys = [];
            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 10;
            this.gameTime = 0;
            this.timeLimit = 25000;
            this.speed = 2;
            this.debug = false;
            this.particles = [];
        }

        addEnemy() {
            const randomize = Math.random();
            if (randomize < 0.3) {
                this.enemies.push(new Angler1(this));
            } else if (randomize < 0.6) {
                this.enemies.push(new Angler2(this));
            } else if (randomize < 0.8) {
                this.enemies.push(new HiveWhale(this));
            } else {
                this.enemies.push(new LuckyFish(this));
            }

        }

        checkCollision(rect1, rect2) {
            return (
                rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.height + rect1.y > rect2.y
            );
        }

        update(deltaTime) {
            if (!this.gameOver) {
                this.gameTime += deltaTime;
                if (this.gameTime > this.timeLimit) {
                    this.gameOver = true;
                }
            }

            this.player.update(deltaTime);
            this.enemies.forEach(enemy => {
                enemy.update();
                if (this.checkCollision(this.player, enemy)) {
                    if (enemy.type === 'lucky') {
                        this.player.enterPowerUp();
                    } else {
                        this.score--;
                    }

                    enemy.processDamage(this.player);
                }
                this.player.projectiles.forEach(projectile => {
                    if (this.checkCollision(projectile, enemy)) {
                        enemy.processDamage(projectile);

                        projectile.markedForDeletion = true;

                        if (enemy.lives <= 0) {
                            if (!this.gameOver) {
                                this.score += enemy.score;
                            }
                            if (this.score >= this.winningScore) {
                                this.gameOver = true;
                            }
                        }
                    }
                })
            });

            this.particles.forEach(particle => particle.update());
            this.particles = this.particles.filter(particle => {
                return !particle.markedForDeletion;
            });

            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if ((this.enemyTimer > this.enemyInterval) && !this.gameOver) {
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }

            this.background.update();
            this.background.layer4.update();
        }

        draw(context) {
            this.background.draw(context);
            this.player.draw(context);
            this.ui.draw(context);
            this.enemies.forEach(enemy => enemy.draw(context));
            this.particles.forEach(particle => particle.draw(context))
            this.background.layer4.draw(context);
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
