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

function Projectile(airAnimation, hitAnimation, attack, owner)
{
	if(typeof(owner)==='undefined') owner = null;
	this.serializable = false;
	
	// Set the parameters, including cloning the animations and attack
	this.airAnimation = airAnimation.Clone();
	this.hitAnimation = hitAnimation.Clone();
	this.airAnimation.owner = this;
	this.hitAnimation.owner = this;
	
	this.attack = attack;
	this.owner = owner;
	
	// Control the behavior of the projectile
	this.hit = false;
	this.hitSFX = null;
	this.timer = 0;
	this.hitOnGround = false;
	this.hitOnAirCompletion = false;
	this.deployAttackOnHit = false;
	this.hitTime = Number.MAX_VALUE;
	this.deathTime = Number.MAX_VALUE;
	this.obeysGravity = false;
	this.freezeOnHit = false;
	this.gravity = gravity;
	this.onHit = function(){};
	
	// State
	this.state = States.Unknown;
	if (owner != null)
	{
		this.facing = owner.facing;
		this.alliance = owner.alliance;		
	}
	else
	{
		this.facing = 1;
		this.alliance = 0;
	}
	
	// Drawing
	this.alpha = 1.0;
	this.rotation = 0;
	this.orderBonus = 0;
    
	// Physics
	this.posX = 0;
	this.posY = 0;
	this.posZ = 0;
	this.velX = 0;
	this.velY = 0;
	this.velZ = 0;
	
	if (this.attack === null)
	{
		this.hitRect = new BoundingRect();
		this.hitRect.SetBounds(-0.5,-0.5,0.5,0.5);
		this.attack = new Attack(this);
	}
	else
		this.hitRect = this.attack.attackbox.Copy();
	
	// Reset the animation for use
	this.airAnimation.Reset(0);
	this.hitAnimation.Reset(0);
};

Projectile.prototype.Die = function()
{
	this.state = States.Dead;
};

Projectile.prototype.Respawn = function(pos)
{
	this.posX = pos.x;
	this.posY = pos.y;
	this.posZ = pos.z;
	this.velX = 0;
	this.velY = 0;
	this.velZ = 0;
	this.state = States.Unknown;
};

Projectile.prototype.Draw = function()
{
	ctx.translate(this.posX,this.posY);

	// Draw the animation
	var image;
	var flipped;
	if (this.hit)
	{
		image = this.hitAnimation.GetFrame();
		flipped = this.hitAnimation.GetFlipped();
	}
	else
	{
		image = this.airAnimation.GetFrame();
		flipped = this.airAnimation.GetFlipped();
		drawEntityRoundShadow(this,this.hitRect.width()*3.0);
	}
	if (image !== null)
	{
		ctx.globalCompositeOperation = this.airAnimation.blendMode;
		ctx.globalAlpha=this.airAnimation.alpha * this.alpha;

		image.DrawSprite3x(0,-this.posZ, flipped);
		
		ctx.globalAlpha=1.0;
		ctx.globalCompositeOperation = "source-over";
	}
	
	ctx.translate(-this.posX,-this.posY);
};

Projectile.prototype.Update = function()
{
		if (this.posZ < 0)
		{
			this.posZ = 0;
		}
		else
		{
			// Update the physics
			this.posX+=this.velX;
			this.posY+=this.velY;
			this.posZ+=this.velZ;
			
			if (this.obeysGravity)
				this.velZ -= this.gravity;
		}
		
		// Check if we should be hitting
		if (!this.hit && (
			(this.timer === this.hitTime) ||				// If it's time to hit or
			(this.hitOnGround && this.posZ === 0)  ||		// This attack detonates on the ground and we're on the ground or
			(this.attack.connected)							// The attached attack has hit something 
			))
		{
			this.onHit();
			if (this.hitSFX !== null)
				this.hitSFX.Play();
			this.hit = true;
			if (this.deployAttackOnHit)
				this.attack.Attack();
			if (this.freezeOnHit && this.timer !== this.hitTime)
			{
				this.velX = 0;
				this.velY = 0;
				this.velZ = 0;
				this.obeysGravity = false;
			}
		}
		
		// Update the animations
		if (this.hit)
			this.hitAnimation.Update();
		else
			this.airAnimation.Update();

		// If the hit animation is done of the death time has expired, despawn the projectile and remove the attackbox
		if ((!this.hit && this.timer >= this.deathTime) || (this.hit && this.hitAnimation.done))
		{
			this.state = States.Dead;
			this.attack.Reset();
		}
		
		// Update the timer
		this.timer += 1;
};

Projectile.prototype.Push = function(otherEntity)
{
	// This object cannot be moved
};

Projectile.prototype.Hit = function(attack)
{
	// This object cannot be hurt
};