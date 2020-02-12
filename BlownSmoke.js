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

function BlownSmoke(owner)
{
	this.serializable = false;

	this.objectID = nextObjectID++;
	
	// State
	this.state = States.Unknown;
	this.enabled = true;
	this.owner = owner;
	this.facing = owner.facing;
	this.alliance = owner.alliance;
	this.timer = 0;
	this.attack = null;
	this.alpha = 1.0;
	
	// Physics
	this.posX = this.owner.posX + 215*this.owner.scale*this.owner.facing;
	this.posY = this.owner.posY+1;
	this.posZ = this.owner.posZ;
	this.rotation = 0;
	this.scale = 3.0;
	this.velX = 0;
	this.velY = 0;
	this.velZ = 0;
	
	// Drawing
	this.orderBonus = 50;
	//this.spriteCenterX = 215;
	//this.spriteCenterY = 148;
	
	// Define the main animation
	this.blownSmokeAnim = new Animation(this);
	this.blownSmokeAnim.repeat = 0;						// This animation loops
	this.blownSmokeAnim.inheritFacing = 1;					// It inherits the player's facing property
	this.blownSmokeAnim.AddSequentialFrames("smoke/blownSmoke{0}", 1, 12);		// All the frames and their timing info
	this.blownSmokeAnim.SetDurationInSeconds(1.0);				// Set how long one loop takes (in seconds)
};

BlownSmoke.prototype.Die = function()
{
	this.enabled = false;
	this.state = States.Dead;
};

BlownSmoke.prototype.Respawn = function(pos)
{
	this.enabled = true;
	this.posX = pos.x;
	this.posY = pos.y;
	this.posZ = pos.z;
	this.velX = 0;
	this.velY = 0;
	this.velZ = 0;
	this.state = States.Unknown;
};

BlownSmoke.prototype.Draw = function()
{
if (this.enabled && this.timer > 15)
	{
		ctx.translate(this.posX,this.posY);
    	
    	// Draw the smoke animation
    	var image = this.blownSmokeAnim.GetFrame();
    	
    		
    	ctx.globalCompositeOperation = "lighter";
    	ctx.globalAlpha=this.alpha;
		image.DrawSprite3x(0,-this.posZ, (this.facing < 0));
    	ctx.globalAlpha=1.0;
    	ctx.globalCompositeOperation = "source-over";
    	
    	ctx.translate(-this.posX,-this.posY);
	}
};

BlownSmoke.prototype.Update = function()
{
	if (this.enabled)
	{
		// Update the timer
		this.timer += 1;
		
		// Update the animations
		if (this.timer > 15)
		{
			this.blownSmokeAnim.Update();
			//this.scale += 0.02;
		}
			
		if (this.timer > 50)
		{
			
			this.alpha -= 0.05;
			if (this.alpha < 0)
				this.alpha = 0;
		}
		
		// If it's time to die, then die
		if (this.timer > 105)
		{
			this.state = States.Dead;
		}
	}
};

BlownSmoke.prototype.Push = function(otherEntity)
{
	// This object cannot be moved
};

BlownSmoke.prototype.Hit = function(attack)
{
	// This object cannot be hurt
};

// All the animation frames associated with the BlownSmoke.
GlobalResourceLoader.AddImageResource("sheet_Smoke_BlownSmoke","images/smoke/sheet_Smoke_BlownSmoke.txt");