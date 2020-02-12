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

function SmokeKissPuff(owner,posX,posZ)
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
	this.offsetX = posX;
	this.offsetZ = posZ;
	
	// Physics
	this.posX = this.owner.posX + posX*this.owner.scale*this.owner.facing;
	this.posY = this.owner.posY;
	this.posZ = this.owner.posZ + posZ*this.owner.scale;
	this.rotation = 0;
	this.scale = 3.0;
	this.velX = 0;
	this.velY = 0;
	this.velZ = 0;
	
	// Drawing
	this.orderBonus = 100;
	//this.spriteCenterX = 33;
	//this.spriteCenterY = 27;
	
	// Define the main animation
	this.SmokePuffAnim = new Animation(this);
	this.SmokePuffAnim.repeat = 0;
	this.SmokePuffAnim.inheritFacing = 1;
	this.SmokePuffAnim.AddBlankFrames(8);
	this.SmokePuffAnim.AddSequentialFrames("effect/mouthsmoke/smoke{0}",1,14);

	this.SmokePuffAnim.AddBlankFrames(2);
	this.SmokePuffAnim.SetDurationInSeconds(3.0);
};

SmokeKissPuff.prototype.Die = function()
{
	this.enabled = false;
	this.state = States.Dead;
};

SmokeKissPuff.prototype.Respawn = function(pos)
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

SmokeKissPuff.prototype.Draw = function()
{
if (this.enabled)
	{
    	ctx.translate(this.posX,this.posY);
    	
    	// Draw the smoke animation
    	var image = this.SmokePuffAnim.GetFrame();
    	if (image !== null)
    	{
			var centerX = this.spriteCenterX;
			if (this.facing == -1)
				centerX = image.width - centerX;
			
			ctx.globalCompositeOperation = "lighter";
			ctx.globalAlpha=this.alpha;
			
			image.DrawSprite3x(0,-this.posZ,this.SmokePuffAnim.GetFlipped());
			
			//image.Draw(-(centerX)*this.scale,-(this.spriteCenterY)*this.scale-this.posZ,image.width*this.scale,image.height*this.scale);
			ctx.globalAlpha=1.0;
			ctx.globalCompositeOperation = "source-over";
    	}
    	// If it's late enough, draw all smoke effect children
    	ctx.translate(-this.posX,-this.posY);
	}
};

SmokeKissPuff.prototype.Update = function()
{
	if (this.enabled)
	{
		// Update the timer
		this.timer += 1;
	this.posX = this.owner.posX + this.offsetX*this.owner.scale*this.owner.facing;
	this.posY = this.owner.posY;
	this.posZ = this.owner.posZ + this.offsetZ*this.owner.scale;
		
		// Update the animations
		this.SmokePuffAnim.Update();
		
		// If it's time to die, then die
		if (this.SmokePuffAnim.done)
		{
			this.state = States.Dead;
		}
	}
};

SmokeKissPuff.prototype.Push = function(otherEntity)
{
	// This object cannot be moved
};

SmokeKissPuff.prototype.Hit = function(attack)
{
	// This object cannot be hurt
};

// All the animation frames associated with the SmokePuff.
GlobalResourceLoader.AddImageResource("sheet_Effect_MouthSmoke","images/smoke/sheet_Effect_MouthSmoke.txt");
