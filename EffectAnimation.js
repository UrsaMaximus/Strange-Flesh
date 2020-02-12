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

function EffectAnimation(animation, owner, trackOwner)
{
	if(typeof(owner)==='undefined') owner = null;
	if(typeof(trackOwner)==='undefined') trackOwner = false;

	this.serializable = false;
	
	this.owner = owner;
	this.EffectAnimationAnim = animation.Clone();
	
	if (this.owner !== null)
		this.EffectAnimationAnim.owner = this.owner;
	//else
	//	this.EffectAnimationAnim.owner = this;
		
	this.trackOwner = trackOwner;
	this.holdUntilOwnerDies = false;
	this.trackOwnerAlpha = false;
	this.fadeFrames = 0;
	this.deathTime = Number.MAX_VALUE;
	this.dying = false;
	
	this.orderBonusAdjust = false;
	this.orderBonusEnd = 0;
	
	this.shadow = false;
	this.shadowWidth = 40;
	this.shadowHeight = 300;
	this.shadowColor = "#000";
	
	// State
	this.state = States.Unknown;
	if (owner != null)
	{
		this.facing = owner.facing;
		this.alliance = owner.alliance;
		
		if (!trackOwner)
		{
			if (this.facing === 1)
				this.EffectAnimationAnim.inheritFacing = 0;
			else
				this.EffectAnimationAnim.inheritFacing = 3;
		} 
		
	}
	else
	{
		this.facing = 1;
		this.alliance = 0;
	}
	this.timer = 0;
	this.alpha = 1.0;
    this.attack = null;
	
	// Physics

	this.rotation = 0;
	if (owner != null)
	{
		this.scale = owner.scale;
		this.posX = this.owner.posX;
		this.posY = this.owner.posY;
		this.posZ = this.owner.posZ;
		this.velX = this.owner.velX;
		this.velY = this.owner.velY;
		this.velZ = this.owner.velZ;
		
	}
	else
	{
		this.scale = 3.0;
		this.posX = 0;
		this.posY = 0;
		this.posZ = 0;
		this.velX = 0;
		this.velY = 0;
		this.velZ = 0;
	}
	
	// Drawing
	this.orderBonus = 50;
	
	// Reset the animation for use
	this.EffectAnimationAnim.Reset(0);
};

EffectAnimation.prototype.Die = function()
{
	this.state = States.Dead;
};

EffectAnimation.prototype.Respawn = function(pos)
{
	this.posX = pos.x;
	this.posY = pos.y;
	this.posZ = pos.z;
	this.velX = 0;
	this.velY = 0;
	this.velZ = 0;
	this.state = States.Unknown;
};

EffectAnimation.prototype.Draw = function()
{
		ctx.translate(this.posX,this.posY);

    	// Draw the shadow
    	if (this.shadow)
    	{
    		drawEntityRectShadow(this, 0, 0, this.shadowWidth, this.shadowHeight);
    	}
    	
    	// Draw the animation
    	var image = this.EffectAnimationAnim.GetFrame();
    	if (image !== null)
    	{

			
			ctx.globalCompositeOperation = this.EffectAnimationAnim.blendMode;
			
			if (this.EffectAnimationAnim.loopEndPosition !== 1.0)
				ctx.globalAlpha=this.EffectAnimationAnim.alpha * this.alpha;
			else if (this.timer < this.fadeFrames)
				ctx.globalAlpha=this.EffectAnimationAnim.alpha * this.alpha * normalizeValue(this.timer,0,this.fadeFrames);
			else if (this.timer > (this.deathTime - this.fadeFrames))
				ctx.globalAlpha=this.EffectAnimationAnim.alpha * this.alpha * (1-normalizeValue(this.timer,this.deathTime - this.fadeFrames,this.deathTime));
			else
				ctx.globalAlpha=this.EffectAnimationAnim.alpha * this.alpha;
			
			
			
			image.DrawSprite3x(0,-this.posZ, this.EffectAnimationAnim.GetFlipped());
			ctx.globalAlpha=1.0;
			ctx.globalCompositeOperation = "source-over";
		}
    	ctx.translate(-this.posX,-this.posY);
};

EffectAnimation.prototype.Update = function()
{
		if (this.trackOwner)
		{
			this.posX = this.owner.posX;
			this.posY = this.owner.posY;
			this.posZ = this.owner.posZ;
		}
		else
		{
			this.posX+=this.velX;
			this.posY+=this.velY;
			this.posZ+=this.velZ;
		}
		
		if (this.orderBonusAdjust)
		{
			this.orderBonus = crawlValue(this.orderBonus, this.orderBonusEnd, 2);
		}
		
		if (this.trackOwnerAlpha)
			this.alpha = this.owner.alpha;
		
		// Update the timer
		this.timer += 1;
		
		// Update the animations
		this.EffectAnimationAnim.Update();
		
		// If it's time to die, then die
		if (!this.dying)
		{
			if (!this.holdUntilOwnerDies && this.EffectAnimationAnim.done)
			{
				this.deathTime = this.timer + this.fadeFrames;
				this.dying = true;
			}
			else if (this.holdUntilOwnerDies && this.owner.state == States.Dead)
			{
				this.deathTime = this.timer + this.fadeFrames;
				this.dying = true;
			}
		}
		
		
		if (this.timer >= this.deathTime)
		{
			// If this is a looping animation where the loop isn't the last frame
			// then set repeat to 0 and wait for it to complete
			if (this.EffectAnimationAnim.loopEndPosition !== 1.0)
			{
				this.EffectAnimationAnim.repeat = 0;
				if (this.EffectAnimationAnim.done)
					this.state = States.Dead;
			}
			else	// Otherwise just end right away there's no need to let the animation keep going
			{
				this.state = States.Dead;
			}
		}
};

EffectAnimation.prototype.Push = function(otherEntity)
{
	// This object cannot be moved
};

EffectAnimation.prototype.Hit = function(attack)
{
	// This object cannot be hurt
};