// Strange Flesh © 2017 by Greatest Bear Studios
// 
// Strange Flesh is licensed under a
// Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
// 
// You should have received a copy of the license along with this
// work. If not, see <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
//
// This sourcecode has not been minified or obfuscated in any way. Enjoy.
//

GlobalResourceLoader.AddImageResource("foreground_smoke1","images/level4/foreground_smoke1.png");
GlobalResourceLoader.AddImageResource("foreground_smoke2","images/level4/foreground_smoke2.png");


function FloatingSmoke(posX, posY, posZ, delay)
{
	this.imageName = "foreground_smoke1";
	if (Math.random() >= 0.5)
		this.imageName = "foreground_smoke2";
	
	this.blendMode = "screen";
	this.alpha = 0;
	this.targetAlpha = 0.5;
	this.delay = delay;
	this.timer = 0;
	this.floatTime = 100;
	this.sinkTime = 2400;
	
	this.posX = posX + (Math.random()-0.5) * 1000;
	this.posY = posY;
	this.posZ = posZ + (Math.random()-0.5) * 100;
	this.startZ = this.posZ;
	
	this.orderBonus = linearRemap(this.posY, 600, 400, 400, 150);
	this.parallax = linearRemap(this.posY, 600, 400, -0.5, 0.4);
	
	this.facing = 0;
	
	this.repX = 8;		// How many times to repeat the tile along the X axis
	this.repY = 1;		// How many times to repeat the tile along the Y axis
	this.spacingX = 0;	// Extra X spacing between tiles
	this.spacingY = 0;	// Extra Y spacing between tiles
	
	this.floatYAmplitude = 50;
	this.floatYPeriodInFrames = 1200;
	this.floatYShiftInFrames = Math.round(Math.random()*1200);
	this.floatCounter = 0;
	
	this.floatYValue = 0;
	
	this.flipHorizontal = false;
	this.flipRespectingCenter = false;
	
	this.ReInit();
};

FloatingSmoke.prototype.editorProperties = ['imageName','blendMode','alpha','parallax','repX','repY','spacingX','spacingY','flipHorizontal','flipRespectingCenter','orderBonus', 'floatYAmplitude', 'floatYPeriodInFrames','floatYShiftInFrames'];

FloatingSmoke.prototype.ReInit = function()
{
	this.enabled = true;
	
	this.state = States.Unknown;
	
	// Define the image animation
	if (this.imageName instanceof Animation)
	{
		this.animation = this.imageName.Clone();
	}
	else
	{
		this.animation = new Animation(this);
		this.animation.repeat = 1;						// This animation loops
		this.animation.AddFrame(this.imageName);		    	// All the frames and their timing info
		this.animation.SetDurationInSeconds(1.0);			// Set how long one loop takes (in seconds)
	}
	
	if (this.flipHorizontal)
		this.animation.inheritFacing = 3;
	else
		this.animation.inheritFacing = 0;
};

FloatingSmoke.prototype.Die = function()
{
	this.enabled = false;
	this.state = States.Dead;
};

FloatingSmoke.prototype.Respawn = function(pos)
{
	this.enabled = true;
	this.posX = pos.x;
	this.posY = pos.y;
	this.posZ = pos.z;
	this.state = States.Unknown;
};

FloatingSmoke.prototype.Draw = function()
{
if (this.enabled)
	{	
		var image = this.animation.GetFrame();
		if (image !== null)
		{
			var flipped = this.animation.GetFlipped();
			var tileWidth = image.width*pxScale + this.spacingX;
			var tileHeight = image.height*pxScale + this.spacingY;
			var totalWidth = this.repX*tileWidth;
			var totalHeight = this.repY*tileHeight;
		

			var xMin = camera.posX-960; // camera.boundingRect.xMin
			var yMin = camera.posY-540; // camera.boundingRect.yMin
		
			var posX = this.posX + ((xMin-this.posX)/totalWidth) * this.parallax * totalWidth;
			var posY = this.posY + ((yMin-this.posY)/totalHeight) * this.parallax * totalHeight + this.floatYValue - this.posZ;
			
			// Find out which, if any, of the repetitions of this pattern are onscreen.
		
			var bRect = new BoundingRect();
				bRect.fitToPoint({x:posX,y:posY});
				bRect.expandToFit({x:posX+totalWidth,y:posY});
				bRect.expandToFit({x:posX+totalWidth,y:posY+totalHeight});
				bRect.expandToFit({x:posX,y:posY+totalHeight});

			if (camera.boundingRect.ContainsRect(bRect))
			{
				// Get the first X rep
				var firstXRep = Math.floor((camera.boundingRect.xMin-posX) / tileWidth)
				if (firstXRep < 0)
					firstXRep = 0;
			
				// Get the last X rep
				var lastXRep = Math.floor((camera.boundingRect.xMax - posX) / tileWidth) + 1
				if (lastXRep > this.repX)
					lastXRep = this.repX;
				
				// Get the first Y rep
				var firstYRep = Math.floor((camera.boundingRect.yMin - posY) / tileHeight)
				if (firstYRep < 0)
					firstYRep = 0;
			
				// Get the last Y rep
				var lastYRep = Math.floor((camera.boundingRect.yMax - posY) / tileHeight) + 1
				if (lastYRep > this.repY)
					lastYRep = this.repY;
			
				if (flipped && !this.flipRespectingCenter)
					posX += tileWidth;
				
				ctx.globalAlpha = this.alpha;
				ctx.globalCompositeOperation = this.blendMode;
				for (var x=firstXRep; x < lastXRep; x++)
				{
					for (var y=firstYRep; y < lastYRep; y++)
					{
						image.DrawSprite3x(posX+x*tileWidth, posY+y*tileHeight, flipped);
					}
				}
				ctx.globalCompositeOperation = "source-over";
				ctx.globalAlpha = 1.0;
			}
    	}
	}
};

FloatingSmoke.prototype.getBoundingRect = function() 
{
  	var rect = new BoundingRect();
  	  
	var image = this.animation.frames[0].image;
	var tileWidth = image.width*pxScale + this.spacingX;
	var tileHeight = image.height*pxScale + this.spacingY;
	var totalWidth = this.repX*tileWidth;
	var totalHeight = this.repY*tileHeight;
  	  
	rect.fitToPoint({x:this.posX + 45, y:this.posY + 45});
	rect.expandToFit({x:this.posX + tileWidth - 45, y:this.posY + tileHeight  - 45});
  	
  	return rect;
}

FloatingSmoke.prototype.Update = function()
{
	if (this.enabled)
	{
		this.delay = crawlValue(this.delay, 0, 1);
		
		if (this.delay === 0)
		{
			this.alpha = crawlValue(this.alpha, this.targetAlpha, 0.005);
			this.timer += 1;
			
			this.posZ = this.startZ - linearRemap(this.timer, this.floatTime, this.sinkTime+this.floatTime,0,1)*this.startZ;
			
			if (this.floatYAmplitude > 0)
			{
				this.floatCounter += 1;
				if (this.floatCounter >= this.floatYPeriodInFrames)
					this.floatCounter = 0;
			
				this.floatYValue = this.floatYAmplitude * Math.sin((this.floatYShiftInFrames + this.floatCounter)/this.floatYPeriodInFrames * 2 * Math.PI);
			}
			this.animation.Update();
		}
	}
};