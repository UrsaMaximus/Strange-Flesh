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

GlobalResourceLoader.AddImageResource("sheet_ColombianRescue","images/enemies/sheet_ColombianRescue.txt");

function CoffeeProjectile(owner, offsetX, offsetZ)
{
	this.serializable = false;
	
	this.attack = new Attack(owner);
	this.attack.positionOwner = this;
	this.attack.alliance = 2;
	this.attack.attackbox.SetBounds(-28,-28,28,28);
	this.attack.warmupframes = 1;
	this.attack.attackFrames = 1;
	this.attack.cooldownframes = 30;
	this.attack.intoxicationDealt = -99999999.0;
	this.attack.damageDealt = 30;
	this.attack.staminaDrained = 0;
	this.attack.visualContactZ = 0;
	this.attack.zHeight = 0;
	this.attack.hitStunDealt = 1.0;
	this.attack.remainActiveUntil = 1;
	this.attack.allowOwnerHarm = false;
	this.attack.Attack();
	
	// Set the parameters, including cloning the animations and attack
	this.trailSprite = [  GlobalResourceLoader.GetSprite("ColombianRescue/stream1"),
					GlobalResourceLoader.GetSprite("ColombianRescue/stream2"),
					GlobalResourceLoader.GetSprite("ColombianRescue/stream3"),
					GlobalResourceLoader.GetSprite("ColombianRescue/stream4"),
					GlobalResourceLoader.GetSprite("ColombianRescue/stream5"),
					];
	this.airSprite = GlobalResourceLoader.GetSprite("ColombianRescue/streamtip1");
	this.hitAnimation = new Animation(this, "ColombianRescue/impact{0}", 6, 0.6, 0);
	this.hitAnimation.owner = this;
	
	this.orderBonus = 50;
	
	this.offsetX = offsetX;
	this.offsetZ = offsetZ;
	this.owner = owner;
	
	// Control the behavior of the CoffeeProjectile
	this.hit = false;
	this.timer = 0;
	this.deathTime = 60;
	
	// State
	this.state = States.Unknown;
	this.facing = owner.facing;
	
	// Drawing
	this.alpha = 1.0;
	this.rotation = 0;
	this.orderBonus = 0;
    
	// Physics
	this.posX = this.owner.posX + this.offsetX * this.owner.facing;
	this.posY = this.owner.posY;
	this.posZ = this.owner.posZ + this.offsetZ;
	this.velX = 30 * this.facing;
	this.velY = 0;
	this.velZ = 0;
	
	this.hitRect = this.attack.attackbox.Copy();
};

CoffeeProjectile.prototype.Die = function()
{
	this.state = States.Dead;
};

CoffeeProjectile.prototype.Respawn = function(pos)
{
	this.posX = pos.x;
	this.posY = pos.y;
	this.posZ = pos.z;
	this.velX = 0;
	this.velY = 0;
	this.velZ = 0;
	this.state = States.Unknown;
};

CoffeeProjectile.prototype.Draw = function()
{
	ctx.translate(this.posX,this.posY);
	
	// Draw the trail from the current position back to the owner
	var sourceX = this.owner.posX + this.offsetX * this.facing - this.posX;
	var trailIndex = Math.floor(linearRemap(Math.abs(sourceX), 300, 1300, 0, 5));	
	var trailIndexHit = Math.floor(linearRemap(this.hitAnimation.position, 0,1,0,5));
	if (this.hit && trailIndexHit > trailIndex)
		trailIndex = trailIndexHit;
		
	if (this.hit)
		drawEntityRoundShadow(this,400);
	else
		drawEntityRoundShadow(this,250);
	drawEntityRectShadow(this, (sourceX) / 2.0, 0, Math.abs(sourceX), (5-trailIndex) * 10)
	
	var stride = 53 * 3;
	var flipped = (this.facing === -1);
	var trailX = 0;
	
	if (!flipped && trailIndex < 5)
	{
		while (trailX > sourceX)
		{
			if (trailX-stride < sourceX)
			{
				var width = Math.round((trailX - sourceX) / 3.0);
				var dwidth = width * 3.0;	
				
				this.trailSprite[trailIndex].Draw( 184 - width, 83, width, 15, trailX-dwidth + 3, -27 - this.posZ, dwidth, 45, false);
			}
			else
			{
				this.trailSprite[trailIndex].DrawSprite3x(trailX, -this.posZ, false);
			}
			trailX -= stride;
		}
	}
	else if (trailIndex < 5)
	{
		while (trailX < sourceX)
		{
			if (trailX + stride > sourceX)
			{
				var width = Math.round((sourceX - trailX) / 3.0);
				var dwidth = width * 3.0;	
				
				this.trailSprite[trailIndex].Draw( 45, 83, width, 15, trailX-3, -27 - this.posZ, dwidth, 45, true);
			}
			else
			{
				this.trailSprite[trailIndex].DrawSprite3x(trailX, -this.posZ, true);
			}
			trailX += stride;
		}
	}
	

	// Draw the tip
	var image;
	if (this.hit)
		image = this.hitAnimation.GetFrame();
	else
		image = this.airSprite;

	if (image !== null)
		image.DrawSprite3x(0,-this.posZ, flipped);
	
	ctx.translate(-this.posX,-this.posY);
};

CoffeeProjectile.prototype.Update = function()
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

	// If the hit animation is done of the death time has expired, despawn the CoffeeProjectile and remove the attackbox
	if ((!this.hit && this.timer >= this.deathTime) || (this.hit && this.hitAnimation.done))
	{
		this.state = States.Dead;
		this.attack.Reset();
	}
	
	// Update the timer
	this.timer += 1;
};

CoffeeProjectile.prototype.Push = function(otherEntity)
{
	// This object cannot be moved
};

CoffeeProjectile.prototype.Hit = function(attack)
{
	// This object cannot be hurt
};