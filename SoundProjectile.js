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

GlobalResourceLoader.AddImageResource("sheet_SoundProjectileHit","images/enemies/sheet_SoundProjectileHit.txt");
GlobalResourceLoader.AddImageResource("sheet_SoundProjectile","images/enemies/sheet_SoundProjectile.txt");
GlobalResourceLoader.AddImageResource("sheet_SoundProjectileUp","images/enemies/sheet_SoundProjectileUp.txt");

function SoundProjectile(owner, offsetX, offsetY, offsetZ, facingInvert, shootUp, speed)
{
	if(typeof(facingInvert)==='undefined') facingInvert = 1;
	if(typeof(shootUp)==='undefined') shootUp = false;
	if(typeof(speed)==='undefined') speed = 20;
	
	this.serializable = false;
	
	this.shootUp = shootUp;
	this.trailEnabled = true;
	
	this.attack = new Attack(owner);
	this.attack.positionOwner = this;
	this.attack.alliance = 0;
	this.attack.attackbox.SetBounds(-28,-28,28,28);
	this.attack.warmupframes = 1;
	this.attack.attackFrames = 1;
	this.attack.cooldownframes = 30;
	this.attack.intoxicationDealt = 0;
	//this.attack.damageDealt = 30;
	//this.attack.staminaDrained = 0;
	this.attack.visualContactZ = 0;
	this.attack.zHeight = 0;
	this.attack.hitStunDealt = 1.0;
	this.attack.remainActiveUntil = 1;
	this.attack.allowOwnerHarm = false;
	this.attack.connectWithOwner = false;
					this.attack.damageDealt = 25;
					this.attack.staminaDrained = 1.0;
	this.attack.Attack();
	
	this.trailDelay = 20;
	
	
	if (this.shootUp)
	{
		// Set the parameters, including cloning the animations and attack
		this.trailAnimation = new Animation(this);
		this.trailAnimation.AddSequentialFrames("SoundProjectileUp/beam{0}", 10, 16);
		this.trailAnimation.AddBlankFrame();
		this.trailAnimation.SetDurationInSeconds(0.8);
	
		this.trailDelayAnimation = new Animation(this, "SoundProjectileUp/beam{0}", 11, 1.1, 1);
		
		this.airAnimation = new Animation(this, "SoundProjectileUp/tip{0}", 10, 0.6, 1);
	}
	else
	{
		// Set the parameters, including cloning the animations and attack
		this.trailAnimation = new Animation(this);
		this.trailAnimation.AddSequentialFrames("SoundProjectile/beam{0}", 10, 16);
		this.trailAnimation.AddBlankFrame();
		this.trailAnimation.SetDurationInSeconds(0.8);
	
		this.trailDelayAnimation = new Animation(this, "SoundProjectile/beam{0}", 11, 1.1, 1);
		
		this.airAnimation = new Animation(this, "SoundProjectile/tip{0}", 10, 0.6, 1);
	}
	
	this.hitAnimation = new Animation(this, "SoundProjectile/hit{0}", 8, 0.8 , 0);
	this.hitAnimation.owner = this;
	
	this.orderBonus = 50;
	
	this.offsetX = offsetX;
	this.offsetY = offsetY;
	this.offsetZ = offsetZ;
	this.owner = owner;
	
	// Control the behavior of the SoundProjectile
	this.hit = false;
	this.timer = 0;
	this.deathTime = 240;
	
	// State
	this.state = States.Unknown;
	this.facing = owner.facing * facingInvert;
	
	// Drawing
	this.alpha = 1.0;
	this.rotation = 0;
	//this.orderBonus = 0;
    
	// Physics

	this.posX = this.owner.posX + this.offsetX * this.owner.facing * facingInvert;
	this.posY = this.owner.posY + this.offsetY;
	this.posZ = this.owner.posZ + this.offsetZ;
	
	if (!this.shootUp)
	{
		this.velX = speed * this.facing;
		this.velY = 0;
		this.velZ = 0;
	}
	else
	{
		this.velX = 0;
		this.velY = 0;
		this.velZ = speed;

	}
	
	this.hitRect = this.attack.attackbox.Copy();
};

SoundProjectile.prototype.Die = function()
{
	this.state = States.Dead;
};

SoundProjectile.prototype.Respawn = function(pos)
{
	this.posX = pos.x;
	this.posY = pos.y;
	this.posZ = pos.z;
	this.velX = 0;
	this.velY = 0;
	this.velZ = 0;
	this.state = States.Unknown;
};

SoundProjectile.prototype.Draw = function()
{
	ctx.translate(this.posX,this.posY);
	
	// Draw the trail from the current position back to the owner
	var sourceX = this.owner.posX + this.offsetX * this.facing - this.posX;

	var sourceY = -this.posZ;
	var destY = -(this.owner.posZ + this.offsetZ);
		
	if (this.hit)
		drawEntityRoundShadow(this,400);
	else
		drawEntityRoundShadow(this,250);
		
	var flipped = (this.facing === -1);
	
	if (this.trailEnabled)
	{
		drawEntityRectShadow(this, (sourceX) / 2.0, 0, Math.abs(sourceX), linearRemap(this.trailAnimation.position, (2.0/7.0), 1, 10,0));
	
		var stride = 39 * 3;

		var trailSprite = this.trailAnimation.GetFrame();
		if (this.trailDelay > 0)
			trailSprite = this.trailDelayAnimation.GetFrame();
	
		if (trailSprite != null)
		{
			if (this.shootUp)
			{
				var trailY = sourceY;
			
					while (trailY < destY)
					{
						if (trailY+stride > destY)
						{
							var height = Math.round((trailY - destY) / 3.0);
							var dheight = width * 3.0;	
				
							trailSprite.Draw( 0, trailSprite.info.centerY, trailSprite.info.width, height,  -trailSprite.info.centerX*3, trailY, trailSprite.info.width*3, dheight, false);
						}
						else
						{
							trailSprite.DrawSprite3x(0, trailY, false);
						}
						trailY += stride;
					}
				
			}
			else
			{
				var trailX = 0;
				if (!flipped)
				{
					while (trailX > sourceX)
					{
						if (trailX-stride < sourceX)
						{
							var width = Math.round((trailX - sourceX) / 3.0);
							var dwidth = width * 3.0;	
				
							trailSprite.Draw( trailSprite.info.centerX - width, 0, width, trailSprite.info.height, trailX-dwidth + 3, -trailSprite.info.centerY*3 - this.posZ, dwidth, trailSprite.info.height*3, false);
						}
						else
						{
							trailSprite.DrawSprite3x(trailX, -this.posZ, false);
						}
						trailX -= stride;
					}
				}
				else
				{
					while (trailX < sourceX)
					{
						if (trailX + stride > sourceX)
						{
							var width = Math.round((sourceX - trailX) / 3.0);
							var dwidth = width * 3.0;	
				
							trailSprite.Draw( 0, 0, width, trailSprite.info.height, trailX-12, -trailSprite.info.centerY*3 - this.posZ, dwidth, trailSprite.info.height*3, true);
						}
						else
						{
							trailSprite.DrawSprite3x(trailX, -this.posZ, true);
						}
						trailX += stride;
					}
				}
			}
		}
	}
	

	// Draw the tip
	var image;
	if (this.hit)
		image = this.hitAnimation.GetFrame();
	else
		image = this.airAnimation.GetFrame();

	if (image !== null)
		image.DrawSprite3x(0,-this.posZ, flipped);
	
	ctx.translate(-this.posX,-this.posY);
};

SoundProjectile.prototype.Update = function()
{
	// Update the physics
	if (!this.hit)
	{
		this.posX+=this.velX;
		this.posY+=this.velY;
		this.posZ+=this.velZ;
		
		// Check if we should be hitting
		if (this.attack.connected)	// The attached attack has hit something 
			this.hit = true;
	}
		
	// Update the animations
	if (this.hit)
		this.hitAnimation.Update();
	else
		this.airAnimation.Update();
		
	if (this.hit && this.trailAnimation.position < (2.0/7.0))
		this.trailAnimation.position = (2.0/7.0)

	if (this.trailDelay > 0)
	{
		this.trailDelayAnimation.Update();
		this.trailDelay -= 1;
	}
	else
	{
		this.trailAnimation.Update();
	}
	

	// If the hit animation is done of the death time has expired, despawn the SoundProjectile and remove the attackbox
	if ((!this.hit && this.timer >= this.deathTime) || (this.hit && this.hitAnimation.done))
	{
		this.state = States.Dead;
		this.attack.Reset();
	}
	
	// Update the timer
	this.timer += 1;
};

SoundProjectile.prototype.Push = function(otherEntity)
{
	// This object cannot be moved
};

SoundProjectile.prototype.Hit = function(attack)
{
	// This object cannot be hurt
};