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

var ORB_HEALTH = 1;
var ORB_DOMINATE = 2;
var ORB_CORRUPT = 3;
var ORB_LIFE = 4;

GlobalResourceLoader.AddImageResource("healthorb","images/effect/orb_heath.png",1,32);
GlobalResourceLoader.AddSequentialImageResources("corruptionorb{0}","images/effect/orb_corruption{0}.png",1,11);
GlobalResourceLoader.AddSequentialImageResources("dominationorb{0}","images/effect/orb_domination{0}.png",1,6);

GlobalResourceLoader.AddImageResource("life_symbol","images/menus/life_symbol.png");

GlobalResourceLoader.AddImageResource("glowcorruption","images/effect/glowcorruption.png");
GlobalResourceLoader.AddImageResource("glowdomination","images/effect/glowdomination.png");
GlobalResourceLoader.AddImageResource("glowhealth","images/effect/glowhealth.png");

GlobalResourceLoader.AddAudioResource("corruptionpickup","sound/orb_corruption_pickup.mp3");
GlobalResourceLoader.AddAudioResource("dominationpickup","sound/orb_domination_pickup.mp3");
GlobalResourceLoader.AddAudioResource("healthpickup","sound/orb_health_pickup.mp3");

function CollectableOrb(kind, autoCollect, source, offsetX, offsetZ, pop)
{
	//this.serializable = false;

	this.hitRect = new BoundingRect();
	
	if(typeof(kind)==='undefined') 
	{
		var choice = Math.random();
		if (choice > 0.666)
			this.kind = ORB_HEALTH;
		else if (choice > 0.333)
			this.kind = ORB_DOMINATE;
		else
			this.kind = ORB_CORRUPT;
	}
	else
	{
		this.kind = kind;
	}
	
	if(typeof(kind)==='pop') 
		this.pop = 0;
	else
		this.pop = pop;
		
	if(typeof(autoCollect)==='undefined') 
		this.autoCollect = false;
	else
		this.autoCollect = autoCollect;
	
	this.ReInit();
		
	this.alliance = 0;
	
	// State
	this.state = States.Unknown;
	this.alpha = 1.0;
	this.collected = false;
	
	// Physics
	if(typeof(source)==='undefined') 
	{
		this.posX = 0;
		this.posY = 0;
		this.posZ = 0;

		this.velX = 0;
		this.velY = 0;
		this.velZ = 0;
	}
	else
	{
		this.posX = source.posX + offsetX;
		this.posY = source.posY;
		this.posZ = source.posZ + offsetZ;

		this.velX = source.velX;
		this.velY = source.velY;
		this.velZ = source.velZ;
		
		// If this orb is spawning from a source that's offscreen, auto-collect it
		if (camera !== null && !camera.boundingRect.PointIntersect(this.posX, this.posY) && this.kind !== ORB_HEALTH)
		{
			this.autoCollect = true;
		}
	}
	
	if (this.pop === 1)
	{
		this.accelX = (Math.random()-0.5) * 10;
		this.accelY = (Math.random()-0.5) * 4;
		this.accelZ = Math.random() * 3 + gravity;
		this.velZ = 0;
		this.posZ += 1;
	}
	else if (this.pop === 2)
	{
		this.accelX = (Math.random()-0.5) * 10;
		this.accelY = (Math.random()+0.2) * 2;
		this.accelZ = Math.random() * 5 + gravity;
		this.velZ = 0;
		this.posZ += 1;
	}
	else
	{
		this.accelX = 0;
		this.accelY = 0;
		this.accelZ = 0;
	}
	
	this.destX = 0;
	this.destY = 0;
	this.timer = 0;
	this.collectTimer = 0;
	
	this.elasticity = 0.2;
	this.groundFriction = 0.81;

	// Collision
	this.grabbable = false;
	this.zHeight = 48;
	this.collisionRadius = 30;

	// Drawing
	this.orderBonus = 0;
};

CollectableOrb.prototype.editorProperties = ['kind'];

CollectableOrb.prototype.ReInit = function()
{
	// Fill color
	if (this.kind === ORB_HEALTH)
	{
		this.animation = new Animation(this, "healthorb", 1, 1.0);
		this.fillColor = "#ff0169";
		this.glowimage = GlobalResourceLoader.GetSprite("glowhealth");
		this.pickupSFX = GlobalResourceLoader.GetSound("healthpickup");
	}
	else if (this.kind === ORB_DOMINATE)
	{
		this.animation = new Animation(this, "dominationorb{0}", 6, 0.75);
		this.fillColor = "#68c4af";
		this.glowimage = GlobalResourceLoader.GetSprite("glowdomination");
		this.pickupSFX = GlobalResourceLoader.GetSound("dominationpickup");
	}
	else if (this.kind === ORB_CORRUPT)
	{
		this.animation = new Animation(this, "corruptionorb{0}", 11, 1.5);
		this.fillColor = "#df2eff";
		this.glowimage = GlobalResourceLoader.GetSprite("glowcorruption");
		this.pickupSFX = GlobalResourceLoader.GetSound("corruptionpickup");
	}
	else if (this.kind === ORB_LIFE)
	{
		this.animation = new Animation(this, "life_symbol", 1, 1.0);
		this.fillColor = "#ff0169";
		this.glowimage = GlobalResourceLoader.GetSprite("glowhealth");
		this.pickupSFX = GlobalResourceLoader.GetSound("healthpickup");
	}
	
	this.pickupSFX.allowOverlap = true;
	
	// Give each orb a random animation offset so they don't all spin in unison
	this.animation.position = Math.random();
};

CollectableOrb.prototype.Die = function()
{
	this.state = States.Dead;
};

CollectableOrb.prototype.Respawn = function(pos)
{
	this.posX = pos.x;
	this.posY = pos.y;
	this.posZ = pos.z;
	this.velX = 0;
	this.velY = 0;
	this.velZ = 0;
	this.state = States.Unknown;
};

CollectableOrb.prototype.Draw = function()
{
	ctx.translate(this.posX, this.posY);
	
	var image = this.animation.GetFrame();
	image.DrawSprite3x(-30,-30-this.posZ);
	
	ctx.globalCompositeOperation = "screen";
	this.glowimage.DrawSprite3x(-60,-60-this.posZ);
	ctx.globalCompositeOperation = "source-over";
	
	if (debug === 2)
	{    	
		ctx.lineWidth = 4.0 / camera.scale;	
		ctx.strokeStyle = "#00FF00";
		drawCircle(0, 0, this.collisionRadius);
		
		// Draw the velocity vector
		var mag = speed2(this.velX,this.velY);
		var ang = Math.atan2(this.velY,this.velX);
		var velX = mag*8*Math.cos(ang);
		var velY = mag*8*Math.sin(ang);
		ctx.strokeStyle = "#FF0000";
		
		ctx.beginPath();
		ctx.moveTo(0,0); 
		ctx.lineTo(velX, velY); 
		ctx.stroke();
	}
	
	ctx.translate(-this.posX, -this.posY);
};

CollectableOrb.prototype.Update = function()
{
	this.animation.Update();
	
	// If this orb is spawning from a source that's offscreen, auto-collect it
	if (!this.autoCollect && camera !== null && !camera.boundingRect.PointIntersect(this.posX, this.posY) && this.kind !== ORB_HEALTH)
	{
		this.autoCollect = true;
	}

	// Gravity
	if (this.collected)
	{
		var dist = distanceSquared(this.posX, this.posY, this.destX, this.destY);
		
		// Suck the orb in towards the destination
		this.velX += (this.destX - this.posX) * 10000 / dist;
		this.velY += (this.destY - this.posY) * 10000 / dist;
	}
	else
	{
		// Apply the explosive force
		if (this.timer < 10)
		{
			this.velX += this.accelX;
			this.velY += this.accelY;
			this.velZ += this.accelZ;
		}
	
		if (this.posZ > 0)
		{
			this.velZ -= gravity;
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
	mag = mag * this.groundFriction;
	this.velX = mag*Math.cos(ang);
	this.velY = mag*Math.sin(ang);
	
	if (this.collected)
	{
		this.posX += this.velX;
		this.posY += this.velY;
		this.posZ += this.velZ;
	}
	else
	{
		this.CollisionDetection(this.velX,this.velY,this.velZ,false, 1);
	}
	
	// If it's time to be collected, then get collected
	if (!this.collected)
	{
		this.timer += 1;
		
		if (distance3DActorToActor(player,this) < 125 && this.timer > 60)
		{
			if (this.kind === ORB_HEALTH)
			{
				if (player.health < player.maxHealth)
					hud.CollectOrb(this);
			}
			else 
			{
				hud.CollectOrb(this);
			}
		}
		else if (this.autoCollect && this.timer > 60)
		{
			hud.CollectOrb(this);
		}
	}
	else
	{
		this.collectTimer += 1;
		
		if (distance(this.posX,this.posY,this.destX,this.destY) < mag || this.collectTimer > 180)
		{
			this.state = States.Dying;
			
			if (this.kind === ORB_HEALTH)
			{
				if (player !== null)
					player.health = clamp(player.health + 5, 0, player.maxHealth);
			}
			else if (this.kind === ORB_DOMINATE)
			{
				enemiesDispatched += 1;
				if (level !== null)
				{
					level.dominationCollected += 1;
				}
			}
			else if (this.kind === ORB_CORRUPT)
			{
				enemiesCorrupted += 1;
				if (level !== null)
				{
					level.corruptionCollected += 1;
				}
			}
			else if (this.kind === ORB_LIFE)
			{
				lives += 1;
			}
		}
	}
};

CollectableOrb.prototype.Push = function(otherEntity)
{
	// This object cannot be moved
};

CollectableOrb.prototype.Hit = function(attack)
{
	// This object cannot be hurt
};

CollectableOrb.prototype.CollisionDetection = EntityCollisionDetection;