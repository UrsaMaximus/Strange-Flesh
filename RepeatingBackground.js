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

GlobalResourceLoader.AddImageResource("grid_test","images/background/grid_test.png");

function RepeatingBackground(imageName, blendMode)
{
	if(typeof(imageName)==='undefined') imageName = "grid_test";
	if(typeof(blendMode)==='undefined') blendMode = "source-over";
	
	this.imageName = imageName;
	this.blendMode = blendMode;
	this.alpha = 1.0;
	
	this.posX = 0;
	this.posY = 0;
	this.orderBonus = 0;
	
	this.parallax = 0;	//   0 = Scroll Normally
						//	 0.5 = Scroll half speed
						//   1 = No scroll (skybox)
	
	this.facing = 0;
	
	this.repX = 1;		// How many times to repeat the tile along the X axis
	this.repY = 1;		// How many times to repeat the tile along the Y axis
	this.spacingX = 0;	// Extra X spacing between tiles
	this.spacingY = 0;	// Extra Y spacing between tiles
	
	this.floatYAmplitude = 0;
	this.floatYPeriodInFrames = 160;
	this.floatYShiftInFrames = 160;
	this.floatCounter = 0;
	
	this.floatYValue = 0;
	
	this.flipHorizontal = false;
	this.flipRespectingCenter = false;
	
	this.ReInit();
};

RepeatingBackground.prototype.editorProperties = ['imageName','blendMode','alpha','parallax','repX','repY','spacingX','spacingY','flipHorizontal','flipRespectingCenter','orderBonus', 'floatYAmplitude', 'floatYPeriodInFrames','floatYShiftInFrames'];

RepeatingBackground.prototype.ReInit = function()
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

RepeatingBackground.prototype.Die = function()
{
	this.enabled = false;
	this.state = States.Dead;
};

RepeatingBackground.prototype.Respawn = function(pos)
{
	this.enabled = true;
	this.posX = pos.x;
	this.posY = pos.y;
	this.posZ = pos.z;
	this.state = States.Unknown;
};

RepeatingBackground.prototype.Draw = function()
{
if (this.enabled && this.alpha > 0)
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
			var posY = this.posY + ((yMin-this.posY)/totalHeight) * this.parallax * totalHeight + this.floatYValue;
			
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

RepeatingBackground.prototype.getBoundingRect = function() 
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

RepeatingBackground.prototype.Update = function()
{

			
	if (this.enabled)
	{
		if (this.floatYAmplitude > 0)
		{
			this.floatCounter += 1;
			if (this.floatCounter >= this.floatYPeriodInFrames)
				this.floatCounter = 0;
			
			this.floatYValue = this.floatYAmplitude * Math.sin((this.floatYShiftInFrames + this.floatCounter)/this.floatYPeriodInFrames * 2 * Math.PI);
		}
		this.animation.Update();
	}
};