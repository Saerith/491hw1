define([
    'animation',
    'game-engine'
],function(
    Animation,
    GameEngine,
){

    /***********
    Entity class

    game - a reference to the game in which this entity exists
    x, y - entity's coordinates
    removeFromWorld - a flag that denotes when to remove this entity from the game
    ************/
    class Entity {

        constructor (game, x, y, img=null, ctx=null) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.gravity = 0.5;
            this.img = img;
            this.removeFromWorld = false;
            this.ctx = ctx;
        }


        drawOutline (ctx) {
            ctx.beginPath();
            ctx.strokeStyle = "green";
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.stroke();
            ctx.closePath();
        }


        drawImg (ctx) {
            this.animation.drawFrame(this.clockTick, ctx, this.x, this.y, "run");
        }


        update () {}


        draw (ctx) {
            if (this.game.showOutlines && this.radius) {
                drawOutline(ctx)
            }
            if (this.img) {
                this.drawImg(ctx)
            }
        }

        /*
        todo: probably not necessary
        */
        rotateAndCache (image, angle) {
            let offscreenCanvas = document.createElement('canvas');
            let size = Math.max(image.width, image.height);
            offscreenCanvas.width = size;
            offscreenCanvas.height = size;
            let offscreenCtx = offscreenCanvas.getContext('2d');
            offscreenCtx.save();
            offscreenCtx.translate(size / 2, size / 2);
            offscreenCtx.rotate(angle);
            offscreenCtx.translate(0, 0);
            offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
            offscreenCtx.restore();
            //offscreenCtx.strokeStyle = "red";
            //offscreenCtx.strokeRect(0,0,size,size);
            return offscreenCanvas;
        }


    } // end of Entity class





    /***********
    Actor interface
    This interface is designed to encompass any Entity that acts upon the game level. This class should not be instantiated.
    Any action shared between actors is located here.

    game - a reference to the game in which this entity exists
    x, y - entity's coordinates
    removeFromWorld - a flag that denotes when to remove this entity from the game
    ************/
    class Actor extends Entity {
        constructor (game, x, y, img=null, jsondata=null, ctx=null, scale=null) {
            super(game, x, y, img, jsondata, ctx);
            this.facing = null;
            this.states = null;
            this.animations = null;

            //Is this used?
            this.animation = null;
        }
        
        /*
        Updates the entity each game loop
        i.e. what does this entity do?
        */
        update () {
            super.update();
        }

    } // end of Entity class


    class Puppy extends Actor {
        constructor (game, x, y, img=null, ctx=null, scale=1.5, spriteWidth=100, spriteHeight=100) {
            super(game, x, y, img, ctx)
            this.movementSpeed = 8
            this.xVelocity = 0
            this.scale = scale
            this.spriteWidth = spriteWidth
            this.spriteHeight = spriteHeight

            this.states = {
                "running": false,
                "facingRight": true,
            }

            this.animations = {
                "idle": new Animation(this.img, [spriteWidth, spriteHeight], 0, 4, 8, 1, true, this.scale),
                "run": new Animation(this.img, [spriteWidth, spriteHeight], 0, 4, 8, 8, true, this.scale),
            }
        }

        update () {

            this.states.running = true

            if (this.x > 1100) {
                this.states.facingRight = false;
            } else if (this.x < -100) {
                this.states.facingRight = true;
            }

            if (this.states.running) {
                if (this.states.facingRight) {
                    this.xVelocity = this.movementSpeed;
                } else {
                    this.xVelocity = -this.movementSpeed;
                }
            }
            this.x += this.xVelocity
        }

        draw (ctx) {
            if (this.xVelocity) {
                this.animation = this.animations.run;
            } else {
                this.animation = this.animations.idle;
            }
            this.animation.drawFrame(1, ctx, this.x, this.y, this.states.facingRight);
        };
    }


    class Hero extends Actor {

        constructor (game, x, y, img=null, ctx=null, scale=3, spriteWidth=50, spriteHeight=50) {
            super(game, x, y, img, ctx);
            this.origY = this.y; //For jumping
            this.movementSpeed = 8;
            this.jumpSpeed = -10;
            this.origJumpSpeed;
            this.jumpTime = 2;
            this.maxHeight = this.origY -200; // Down is positive
            this.scale = scale;
            this.spriteWidth = spriteWidth;
            this.spriteHeight = spriteHeight;

            this.jumpStart = y;
            this.states = {
                "running": false,
                "jumping": false,
                "swordAttack": false,
                "facingRight": true,
            };
            this.animations = {
                "idle": new Animation(this.img, [spriteWidth, spriteHeight], 0, 9, 3, 9, true, this.scale),
                "run": new Animation(this.img, [spriteWidth, spriteHeight], 1, 11, 3, 11, true, this.scale),
                "jump": new Animation(this.img, [spriteWidth, spriteHeight], 1, 11, 3, 11, true, this.scale),
            };
        }

        drawOutline (ctx) {
            ctx.beginPath();
            ctx.strokeStyle = "green";
            ctx.arc(this.x + (this.spriteWidth/2), this.y + ((this.spriteHeight*this.scale)/2), this.radius, 0, Math.PI * 2, false);
            ctx.stroke();
            ctx.closePath();
        }

        drawImg (ctx) {
            this.drawOutline(ctx);
            this.animation.drawFrame(1, ctx, this.x, this.y, this.states.facingRight);

        }

        update () {

            if (this.game.controlKeys[this.game.controls.right].active) { //run right
                if (!this.states.facingRight) { this.states.facingRight = true };
                this.states.running = true;
            } else if (this.game.controlKeys[this.game.controls.left].active) { //run left
                if (this.states.facingRight) { this.states.facingRight = false };
                this.states.running = true;
            }
            if (this.game.controlKeys[this.game.controls.jump].active && !this.states.jumping) { // jump
                this.origY = this.y;
                this.origJumpSpeed = this.jumpSpeed;
                this.states.jumping = true;
                console.log("Jump");
            }

            // check if button NOT pressed, if state is supposed to change...
            if (!(this.game.controlKeys[this.game.controls.right].active || this.game.controlKeys[this.game.controls.left].active)
                && this.states.running) { 
                this.states.running = false;
            }

            if (this.states.running) {
                if (this.states.facingRight) {
                    this.x += this.movementSpeed;
                } else {
                    this.x -= this.movementSpeed;
                }
            }


            if (this.states.jumping) {
               this.y += this.jumpSpeed*this.jumpTime;
               this.jumpSpeed += this.gravity*this.jumpTime;
                
               if (this.y > 500) { 
                   this.y = 500;
                   this.jumpSpeed = this.origJumpSpeed;
                   this.states.jumping = false;
               }
                
             
            }
        
        }


        draw (ctx) {
            if(this.states.jumping) {
                this.animation = this.animations.jump;
            }
        	else if (this.states.running && this.animation) {
                this.animation = this.animations.run;
            } else {
                this.animation = this.animations.idle;
            }
            this.drawImg(ctx);
        };
    }


    return {
        "Entity": Entity,
        "Hero": Hero,
        "Puppy": Puppy
    };
});