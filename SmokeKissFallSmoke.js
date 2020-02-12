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

function SmokeKissFallSmoke(owner)
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
	this.alpha = 0.4;
	
	// Physics
	this.posX = this.owner.posX;
	this.posY = this.owner.posY;
	this.posZ = this.owner.posZ;
	this.rotation = 0;
	this.scale = 3.0;
	this.velX = 0;
	this.velY = 0;
	this.velZ = 0;
	
	// Drawing
	this.orderBonus = 100;
	
	// Define the main animation
	this.SmokePuffAnim = new Animation(this);
	this.SmokePuffAnim.repeat = 0;						// This animation is one-shot
	this.SmokePuffAnim.inheritFacing = 1;				// It inherits the player's facing property
	this.SmokePuffAnim.AddSequentialFrames("effect/mouthsmoke/smokeafterkiss{0}",1,10);

	this.SmokePuffAnim.SetDurationInSeconds(1.5);
};

SmokeKissFallSmoke.prototype.Die = function()
{
	this.enabled = false;
	this.state = States.Dead;
};

SmokeKissFallSmoke.prototype.Respawn = function(pos)
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

SmokeKissFallSmoke.prototype.Draw = function()
{
	if (this.enabled)
	{
		ctx.translate(this.posX,this.posY);
    	
    	// Draw the smoke animation
    	var image = this.SmokePuffAnim.GetFrame();
    	if (image !== null)
    	{
			ctx.globalCompositeOperation = "lighter";
			ctx.globalAlpha=this.alpha;
			image.DrawSprite3x(0,-this.posZ,this.SmokePuffAnim.GetFlipped());
			ctx.globalAlpha=1.0;
			ctx.globalCompositeOperation = "source-over";
    	}
    	// If it's late enough, draw all smoke effect children
    	ctx.translate(-this.posX,-this.posY);
	}
};

SmokeKissFallSmoke.prototype.Update = function()
{
	if (this.enabled)
	{
		// Update the timer
		this.timer += 1;
		var lastframe = this.owner.animationModel.GetState().lastDisplayedFrame;
		var ox = 0;
		var oy = 0;
		if (lastframe !== null)
		{
			ox = lastframe.offsetX;
			oy = lastframe.offsetY;
		}
		
		this.facing = this.owner.facing;
		this.posX = this.owner.posX + ox * this.owner.scale * this.facing;
		this.posY = this.owner.posY;
		this.posZ = this.owner.posZ - oy * this.owner.scale;
		
		// Update the animations
		this.SmokePuffAnim.Update();
		
		// If it's time to die, then die
		if (this.SmokePuffAnim.done)
		{
			this.state = States.Dead;
		}
	}
};

SmokeKissFallSmoke.prototype.Push = function(otherEntity)
{
	// This object cannot be moved
};

SmokeKissFallSmoke.prototype.Hit = function(attack)
{
	// This object cannot be hurt
};


// Get all the animation frames
GlobalResourceLoader.AddImageResource("sheet_Effect_MouthSmoke","images/smoke/sheet_Effect_MouthSmoke.txt");
