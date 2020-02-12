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

// All the animation frames associated with the SmokePuff.
GlobalResourceLoader.AddImageResource("sheet_Smoke_Puff","images/smoke/sheet_Smoke_Puff.txt");

function SmokePuff(owner,posX,posZ)
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
	this.alpha = 0.5;
	
	// Physics
	this.posX = this.owner.posX + posX*this.owner.scale*this.facing;
	this.posY = this.owner.posY;
	this.posZ = this.owner.posZ + posZ*this.owner.scale;
	this.rotation = 0;
	this.scale = 2.0;
	this.velX = this.owner.velX*0.333;
	this.velY = this.owner.velY*0.333;
	this.velZ = this.owner.velZ*0.333;
	
	// Drawing
	this.orderBonus = 20;
	
	// Define the main animation
	this.SmokePuffAnim = new Animation(this);
	this.SmokePuffAnim.repeat = 0;
	this.SmokePuffAnim.AddSequentialFrames("smoke/puff{0}",1,8);
	this.SmokePuffAnim.SetDurationInSeconds(1.0);
};

SmokePuff.prototype.Die = function()
{
	this.enabled = false;
	this.state = States.Dead;
};

SmokePuff.prototype.Respawn = function(pos)
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

SmokePuff.prototype.Draw = function()
{
	if (this.enabled)
	{
    	ctx.translate(this.posX,this.posY);
    	
    	// Draw the smoke animation
    	var image = this.SmokePuffAnim.GetFrame();
    		
    	ctx.globalCompositeOperation = "lighter";
    	ctx.globalAlpha=this.alpha;
		image.DrawSprite3x(0,-this.posZ, this.SmokePuffAnim.GetFlipped());
    	ctx.globalAlpha=1.0;
    	ctx.globalCompositeOperation = "source-over";
    	
    	ctx.translate(-this.posX,-this.posY);
    	//ctx.restore();
	}
};

SmokePuff.prototype.Update = function()
{
	if (this.enabled)
	{
		// Update the timer
		this.timer += 1;
		this.posX+=this.velX;
		this.posY+=this.velY;
		this.posZ+=this.velZ;
		
		// Update the animations
		this.SmokePuffAnim.Update();
		
		// If it's time to die, then die
		if (this.timer > 60)
		{
			this.state = States.Dead;
		}
	}
};

SmokePuff.prototype.Push = function(otherEntity)
{
	// This object cannot be moved
};

SmokePuff.prototype.Hit = function(attack)
{
	// This object cannot be hurt
};