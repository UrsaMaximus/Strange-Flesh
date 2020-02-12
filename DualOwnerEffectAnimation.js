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

function DualOwnerEffectAnimation(animation, owner1, owner2, trackStart, trackEnd)
{
	this.serializable = false;
	
	this.owner1 = owner1;
	this.owner2 = owner2;
	
	this.trackStart = trackStart;
	this.trackEnd = trackEnd;
	this.DualOwnerEffectAnimationAnim = animation.Clone();
	if (this.owner2 != null)
		this.DualOwnerEffectAnimationAnim.owner = this.owner2;
	this.trackOwner = true;
	this.holdUntilOwnerDies = false;
	this.trackOwnerAlpha = false;
	
	// State
	this.state = States.Unknown;
	this.facing = owner2.facing;
	this.alliance = owner2.alliance;
	this.timer = 0;
	this.alpha = 1.0;
    this.attack = null;
	
	// Physics
	this.posX = this.owner1.posX;
	this.posY = this.owner1.posY;
	this.posZ = this.owner1.posZ;
	this.rotation = 0;
	this.scale = owner1.scale;
	this.velX = this.owner1.velX;
	this.velY = this.owner1.velY;
	this.velZ = this.owner1.velZ;
	
	// Drawing
	this.startOrderBonus = 0;
	this.endOrderBonus = 0;
	this.orderBonus = 0;
	
	//this.spriteCenterX = owner1.spriteCenterX;
	//this.spriteCenterY = owner1.spriteCenterY;
	
	this.owner1OffsetX = 0;
	this.owner2OffsetX = 0;
	this.owner1OffsetY = 0;
	this.owner2OffsetY = 0;
	this.owner1OffsetZ = 0;
	this.owner2OffsetZ = 0;
	
	// Reset the animation for use
	this.DualOwnerEffectAnimationAnim.Reset(0);
};

DualOwnerEffectAnimation.prototype.Die = function()
{
	this.state = States.Dead;
};

DualOwnerEffectAnimation.prototype.Respawn = function(pos)
{
	this.posX = pos.x;
	this.posY = pos.y;
	this.posZ = pos.z;
	this.velX = 0;
	this.velY = 0;
	this.velZ = 0;
	this.state = States.Unknown;
};

DualOwnerEffectAnimation.prototype.Draw = function()
{
		ctx.translate(this.posX,this.posY);
    	
    	// Draw the animation
    	var image = this.DualOwnerEffectAnimationAnim.GetFrame();
    	if (image !== null)
    	{
			
			ctx.globalCompositeOperation = this.DualOwnerEffectAnimationAnim.blendMode;
			ctx.globalAlpha=this.DualOwnerEffectAnimationAnim.alpha * this.alpha;
			image.DrawSprite3x(0,-this.posZ, this.DualOwnerEffectAnimationAnim.GetFlipped());
			ctx.globalAlpha=1.0;
			ctx.globalCompositeOperation = "source-over";
		}
    	ctx.translate(-this.posX,-this.posY);
};

DualOwnerEffectAnimation.prototype.Update = function()
{
		this.orderBonus = linearRemap(this.DualOwnerEffectAnimationAnim.position, this.trackStart, this.trackEnd, this.startOrderBonus, this.endOrderBonus);
		
		if (this.trackOwner)
		{
			this.posX = linearRemap(this.DualOwnerEffectAnimationAnim.position, this.trackStart, this.trackEnd, this.owner1.posX+this.owner1OffsetX*this.owner1.facing, this.owner2.posX+this.owner2OffsetX*this.owner2.facing)
			this.posY = linearRemap(this.DualOwnerEffectAnimationAnim.position, this.trackStart, this.trackEnd, this.owner1.posY+this.owner1OffsetY, this.owner2.posY+this.owner2OffsetY)
			this.posZ = linearRemap(this.DualOwnerEffectAnimationAnim.position, this.trackStart, this.trackEnd, this.owner1.posZ+this.owner1OffsetZ, this.owner2.posZ+this.owner2OffsetZ)
		}
		else
		{
			this.posX+=this.velX;
			this.posY+=this.velY;
			this.posZ+=this.velZ;
		}
		
		if (this.trackOwnerAlpha)
			this.alpha = this.owner2.alpha;
		
		// Update the timer
		this.timer += 1;
		
		// Update the animations
		this.DualOwnerEffectAnimationAnim.Update();
		
		// If it's time to die, then die
		if (!this.holdUntilOwnerDies && this.DualOwnerEffectAnimationAnim.done)
		{
			this.state = States.Dead;
		}
		else if (this.holdUntilOwnerDies && this.owner2.state == States.Dead)
		{
			this.state = States.Dead;
		}
};

DualOwnerEffectAnimation.prototype.Push = function(otherEntity)
{
	// This object cannot be moved
};

DualOwnerEffectAnimation.prototype.Hit = function(attack)
{
	// This object cannot be hurt
};