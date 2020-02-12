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

function DroppedItem(animation, source, lifespan, offsetX, offsetZ, hitGroundSFX)
{
	this.objectID = nextObjectID++;
	
	this.serializable = false;
	
	if(typeof(hitGroundSFX)==='undefined') hitGroundSFX = null;

	this.DroppedItemAnim = animation.Clone();
	
	if (source !== null)
	{
		if (source.facing === 1)
			this.DroppedItemAnim.inheritFacing = 0;
		else
			this.DroppedItemAnim.inheritFacing = 3;
	}
	
	// State
	this.state = States.Unknown;
	this.facing = source.facing;
	this.alliance = source.alliance;
	this.timer = 0;
	this.alpha = 1.0;
    this.attack = null;
    this.lifespan = lifespan;
    this.dieOnTouchingGround = false;
    this.touchedGround = false;
    this.hitGroundSFX = hitGroundSFX;
	
	// Physics
	this.posX = source.posX + offsetX;
	this.posY = source.posY;
	this.posZ = source.posZ + offsetZ;
	this.rotation = 0;
	this.scale = 3.0;
	this.velX = source.velX;
	this.velY = source.velY;
	this.velZ = source.velZ;
	this.elasticity = 0.2;
	this.groundFriction = 0.81;
	this.airFriction = 1.0;
	this.gravity = gravity;

	// Collision
	this.zHeight = 48;
	this.collisionRadius = this.scale * 10;

	
	// Drawing
	this.orderBonus = 0;

	// Reset the animation for use
	this.DroppedItemAnim.Reset(0);
};

DroppedItem.prototype.Die = function()
{
	this.state = States.Dead;
};

DroppedItem.prototype.Respawn = function(pos)
{
	this.posX = pos.x;
	this.posY = pos.y;
	this.posZ = pos.z;
	this.velX = 0;
	this.velY = 0;
	this.velZ = 0;
	this.state = States.Unknown;
};

DroppedItem.prototype.Draw = function()
{
		ctx.translate(this.posX,this.posY);
    	
    	// Draw the animation
    	var image = this.DroppedItemAnim.GetFrame();
    	if (image !== null)
    	{
			ctx.globalCompositeOperation = this.DroppedItemAnim.blendMode;
			ctx.globalAlpha=this.DroppedItemAnim.alpha * this.alpha;
			image.DrawSprite3x(0,-this.posZ, this.DroppedItemAnim.GetFlipped());
			ctx.globalAlpha=1.0;
			ctx.globalCompositeOperation = "source-over";
		}
		
		
		if (debug === 2)
    	{    	
    	    ctx.lineWidth = 4.0 / camera.scale;	
    		ctx.strokeStyle = "#00FF00";
    		drawCircle(0, 0, this.collisionRadius);
    		
			// Draw the velocity vector
			var mag = speed3(this.velX,this.velY,this.velZ);
			var ang = Math.atan2(this.velY-this.velZ,this.velX);
			var velX = mag*8*Math.cos(ang-this.rotation);
			var velY = mag*8*Math.sin(ang-this.rotation);
			ctx.strokeStyle = "#FF0000";
			
			ctx.beginPath();
			ctx.moveTo(0,0); 
			ctx.lineTo(velX, velY); 
			ctx.stroke();
    	}
		
    	ctx.translate(-this.posX,-this.posY);
};

DroppedItem.prototype.Update = function()
{
	// Gravity
	if (this.posZ > 0)
	{
		this.velZ -= this.gravity;
	}
	else
	{
		if (!this.touchedGround && this.hitGroundSFX !== null)
		{
			this.hitGroundSFX.Play(1.0);
			this.touchedGround = true;
		}
		
		if (this.dieOnTouchingGround)
		{
			this.state = States.Dead;
		}
		else if (Math.abs(this.velZ) > 5)
		{
			this.posZ = 0.01;
			this.velZ = -this.velZ * this.elasticity;
		}
		else
		{
			this.posZ = 0;
			this.velZ = 0;
		}
	}
	
	// Convert the velocities to magnitude and angle
	var mag = Math.sqrt(Math.pow(this.velX,2)+Math.pow(this.velY,2));
	var ang = Math.atan2(this.velY,this.velX);

	// Apply friction
	if (Math.abs(this.posZ) < 1)
	{
		mag = mag * this.groundFriction;
	}
	
	this.velX = mag*Math.cos(ang);
	this.velY = mag*Math.sin(ang) * this.airFriction;

	/*
	this.posX+=this.velX;
	this.posY+=this.velY;
	this.posZ+=this.velZ;
	*/
	
	
	// Calculate any fake height transition forces
	var fakeHeightYCorrection = 0;
	var fakeHeightZCorrection = 0;
	for (var i = 0; i < level.transitions.length; i++)
	{
		var wasInside = (level.transitions[i].entitiesInside.indexOf(this) !== -1);
		
		var entityInside = level.transitions[i].box.PointIntersect(this.posX, this.posY) && 
				this.posZ >= level.transitions[i].activationZMin &&
				this.posZ <= level.transitions[i].activationZMax;
						
		if (entityInside)
		{
			if (level.transitions[i].changeFakeHeight)
			{
				fakeHeightYCorrection = this.velX * level.transitions[i].fakeHeightYFactor;
				if (this.posZ > 0 || this.state === States.Dash)
					fakeHeightZCorrection = this.velX * level.transitions[i].fakeHeightYFactor;
			}
		
			if (level.transitions[i].limitZHeight)
			{
				if (this.posZ > level.transitions[i].zHeightLimit)
				{
					this.posZ = level.transitions[i].zHeightLimit;
					if (this.velZ > 0)
						this.velZ = 0;
					// End the jump
					if (this.state === States.Jump)
						this.stateFrames = 10000;
					
				}
			}
		}
			
		// Perform a relative warp if the current object wasn't inside the transition box last frame, but is this frame
		if (level.transitions[i].relativeWarp && !wasInside && entityInside)
		{
			this.posX += level.transitions[i].relativeWarpX;
			this.posY += level.transitions[i].relativeWarpY;
			this.posZ += level.transitions[i].relativeWarpZ;
		}
		
		if (!entityInside && wasInside)
			level.transitions[i].entitiesInside.splice(level.transitions[i].entitiesInside.indexOf(this), 1);
		else if (entityInside && !wasInside)
			level.transitions[i].entitiesInside.push(this);
		
	}
	
	
	
	this.CollisionDetection(this.velX,this.velY,this.velZ,false);
	
	// Update the timer
	this.timer += 1;
	
	// Update the animations
	this.DroppedItemAnim.Update();
	
	// If it's time to die, then die
	if (this.DroppedItemAnim.done && this.lifespan < this.timer && this.lifespan > 0)
	{
		this.state = States.Dead;
	}
};

DroppedItem.prototype.Push = function(otherEntity)
{
	// This object cannot be moved
};

DroppedItem.prototype.Hit = function(attack)
{
	// This object cannot be hurt
};

DroppedItem.prototype.CollisionDetection = EntityCollisionDetection;