define([
    'asset-manager'
], function (
    AssetManager
) {

        /**************
        Animation class

        Properties:
        spriteSheet - an Image object of this animation's spritesheet.
        frameDimensions[width, height] - an array of length 2, denoting the width and height of 
            one frame in the series.
        row - an integer denoting the row (beginning with 0) of the spritesheet to play.
        sheetWidth - an integer denoting the number of frames in one row. If sheetWidth is greater
            than this Animation's frames property, it will continue to the first column on the next row.
        frameDuration - the number of frames each sprite in the animation will be shown for.
        frames - the number of frames in this animation.
        loop - a boolean denoting whether this animation should replay or not.
        scale - a value to multiply the original sprite's size by.
        */
        class Animation {
        
            constructor (spriteSheet, frameDimensions, row, sheetWidth, frameDuration, frames, loop, scale) {
                this.spriteSheet = spriteSheet;
                this.frameWidth = frameDimensions[0];
                this.frameDuration = frameDuration;
                this.frameHeight = frameDimensions[1]+1;
                this.row = row;
                this.sheetWidth = sheetWidth;
                this.frames = frames;
                this.totalTime = frameDuration * frames;
                this.elapsedTime = 0;
                this.loop = loop;
                this.scale = scale;
            }

            drawFrame (tick, ctx, x, y, facingRight) {
                this.elapsedTime += tick;
                if (this.isDone()) {
                    if (this.loop) this.elapsedTime = 0;
                }
                var frame = this.currentFrame();
                var xindex = 0;
                var yindex = 0;
                let drow = (this.row * this.frameHeight)
                xindex = frame % this.sheetWidth;
                yindex = Math.floor(frame / this.sheetWidth);

                if (!facingRight) {
                    ctx.save();
                	ctx.translate(x + (this.scale * this.frameWidth) / 2, 
                        0);
                    ctx.scale(-1, 1);
                	ctx.drawImage(this.spriteSheet,
                             (xindex * this.frameWidth), (yindex * this.frameHeight) + drow, 
                             this.frameWidth, this.frameHeight,
                             -(this.frameWidth)/2, y, // Offset dx
                             this.frameWidth * this.scale,
                             this.frameHeight * this.scale);
                    ctx.restore();

                } else { 
                	ctx.drawImage(this.spriteSheet,
                             (xindex * this.frameWidth), (yindex * this.frameHeight) + drow,  
                             this.frameWidth, this.frameHeight,
                             x - this.frameWidth, y,
                             this.frameWidth * this.scale,
                             this.frameHeight * this.scale);
                }
                
            }

            currentFrame () {
                return Math.floor(this.elapsedTime / this.frameDuration);
            }

            isDone () {
                return (this.elapsedTime >= this.totalTime);
            }
    }

    return Animation;

});
