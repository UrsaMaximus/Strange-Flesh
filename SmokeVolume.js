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

function SmokeVolume(owner,followOwner,pinOffsetX,pinOffsetY,pinOffsetZ)
{
	this.serializable = false;
	
	// Default arguments
	if(typeof(pinOffsetX)==='undefined') pinOffsetX = 0;
	if(typeof(pinOffsetY)==='undefined') pinOffsetY = 0;
	if(typeof(pinOffsetZ)==='undefined') pinOffsetZ = 0;
	if(typeof(followOwner)==='undefined') followOwner = false;
	if(typeof(owner)==='undefined') owner = null;

	// State
	this.state = States.Unknown;
	this.owner = owner;
	this.followOwner = followOwner && (this.owner !== null);
	this.pinOffsetX = pinOffsetX;
	this.pinOffsetY = pinOffsetY;
	this.pinOffsetZ = pinOffsetZ;
	
	// Smoke generation variables
	this.inhibit = false;
	this.locationZMin = 0;
	this.locationZMax = 0;
	this.locationYMin = 0;
	this.locationYMax = 0;
	this.locationXMin = 0;
	this.locationXMax = 0;
	this.velocityZMin = 0;
	this.velocityZMax = 0;
	this.velocityYMin = -2;
	this.velocityYMax = 2;
	this.velocityXMin = -2;
	this.velocityXMax = 2;
	this.velocityRMin = -0.002;
	this.velocityRMax = 0.002;
	this.lifespanMin = 0;
	this.lifespanMax = 500;
	this.killDistance = 2000;
	this.darkSmokeProportion = 0;
	this.maxChildren = 20;
	this.scaleMin = 4;
	this.scaleMax = 8;
	this.autoSpawn = false;
	
	this.children = [];
	
	this.alliance = 0;
	this.attack = null;
	
	// Physics
	this.posX = 0;
	this.posY = 0;
	this.posZ = 0;
	this.velX = 0;
	this.velY = 0;
	this.velZ = 0;
	
	// Drawing
	this.orderBonus = 0;
};

SmokeVolume.prototype.Die = function()
{
	this.enabled = false;
	this.state = States.Dead;
};

SmokeVolume.prototype.Respawn = function(pos)
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

SmokeVolume.prototype.Draw = function()
{	
};

SmokeVolume.prototype.Update = function()
{
	if (this.followOwner)
	{
		this.posX=this.owner.posX + this.pinOffsetX;
		this.posY=this.owner.posY + this.pinOffsetY;
		this.posZ=this.owner.posZ + this.pinOffsetZ;
	}
	else
	{
		this.posX+=this.velX;
		this.posY+=this.velY;
		this.posZ+=this.velZ;
	}
	
	// Remove any dead smoke puffs
	for (var i=0; i < this.children.length; i++)
	{
		if (this.children[i].state === States.Dead)
			this.children.splice(i,1);
	}
	
	// Spawn new smoke puffs to fill back to max
	while(!this.inhibit && this.children.length < this.maxChildren)
	{
		// WaftingSmoke(isDarkSmoke, lifespan, owner)
		var isDark = !(Math.random() > this.darkSmokeProportion);
		var lifespan =  linearRemap(Math.random(),0,1,this.lifespanMin,this.lifespanMax);
		var smokePuff = new WaftingSmoke(isDark, lifespan, this, this.killDistance);
		smokePuff.posX = this.posX + linearRemap(Math.random(),0,1,this.locationXMin,this.locationXMax);
		smokePuff.posY = this.posY + linearRemap(Math.random(),0,1,this.locationYMin,this.locationYMax);
		smokePuff.posZ = this.posZ + linearRemap(Math.random(),0,1,this.locationZMin,this.locationZMax);
		smokePuff.velX = linearRemap(Math.random(),0,1,this.velocityXMin,this.velocityXMax);
		smokePuff.velY = linearRemap(Math.random(),0,1,this.velocityYMin,this.velocityYMax);
		smokePuff.velZ = linearRemap(Math.random(),0,1,this.velocityZMin,this.velocityZMax);
		/*
		if (this.followOwner)
		{
			smokePuff.velX += this.owner.velX;
			smokePuff.velY += this.owner.velY;
			smokePuff.velZ += this.owner.velZ;
		}
		*/
		smokePuff.velR = linearRemap(Math.random(),0,1,this.velocityRMin,this.velocityRMax);
		smokePuff.minScale = this.scaleMin;
		smokePuff.scale = this.scaleMin;
		smokePuff.maxScale = this.scaleMax;
		smokePuff.rotation = linearRemap(Math.random(),0,1,-Math.PI,Math.PI);
		smokePuff.orderBonus = this.orderBonus;
	
		if (this.autoSpawn)
			level.entities.AddEffect(smokePuff);
		
		this.children.push(smokePuff);
	}
	
	// If it's time to die, then die
	if (this.followOwner && this.owner.state === States.Dead)
	{
		this.state = States.Dead;
	}
};

SmokeVolume.prototype.Push = function(otherEntity)
{
	// This object cannot be moved
};

SmokeVolume.prototype.Hit = function(attack)
{
	// This object cannot be hurt
};

function WaftingSmoke(isDarkSmoke, lifespan, owner, maxDistance)
{
	// Default arguments
	if(typeof(isDarkSmoke)==='undefined') isDarkSmoke = false;
	if(typeof(lifespan)==='undefined') lifespan = 0;
	if(typeof(owner)==='undefined') owner = null;
	if(typeof(maxDistance)==='undefined') maxDistance = 0;
	
	// State
	this.state = States.Unknown;
	
	this.alliance = 0;
	this.timer = 0;
	this.attack = null;
	
	// Drawing variables
	this.isDarkSmoke = isDarkSmoke;
	this.lifespan = lifespan;
	this.owner = owner;
	this.maxDistance = maxDistance;
	
	this.drawAlpha = 0.0;
	if (isDarkSmoke)
	{
		this.alpha = 0.2;
		this.blendmode = "multiply";
	}
	else
	{
		this.alpha = 0.2;
		this.blendmode = "screen"; //"lighter";
	}
	
	// Physics
	this.posX = 0;
	this.posY = 0;
	this.posZ = 0;
	this.rotation = 0;
	this.scale = 5.0;
	this.minScale = 4.0;
	this.maxScale = 8.0;
	this.velX = 0;
	this.velY = 0;
	this.velZ = 0;
	this.velR = 0.005;
	
	// Drawing
	this.orderBonus = 0;
	
	// Define the image frames we'll use
	this.lightSmokeSprite = null;
	this.darkSmokeSprite = null;
};

WaftingSmoke.prototype.Kill = function()
{
	this.state = States.Dying;
};

WaftingSmoke.prototype.Die = function()
{
	this.state = States.Dead;
};

WaftingSmoke.prototype.Respawn = function(pos)
{
	this.posX = pos.x;
	this.posY = pos.y;
	this.posZ = pos.z;
	this.velX = 0;
	this.velY = 0;
	this.velZ = 0;
	this.state = States.Unknown;
};

WaftingSmoke.prototype.Draw = function()
{
	if (this.lightSmokeSprite === null)
	{
		this.lightSmokeSprite = GlobalResourceLoader.GetSprite("smokelight");
		this.darkSmokeSprite = GlobalResourceLoader.GetSprite("smokedark");
	}
	
	ctx.translate(this.posX,this.posY-this.posZ);
	
	// Draw the smoke
	var image = this.lightSmokeSprite;
	if (this.isDarkSmoke)
		image = this.darkSmokeSprite;
	var centerX = image.width/2;
	var centerY = image.height/2;
	
	ctx.globalCompositeOperation = this.blendmode;
	ctx.globalAlpha=this.drawAlpha;
	image.Draw(-(centerX)*this.scale,-(centerY)*this.scale,image.width*this.scale,image.height*this.scale);
	ctx.globalAlpha=1.0;
	ctx.globalCompositeOperation = "source-over";
	
	ctx.translate(-this.posX,-(this.posY-this.posZ));
};

WaftingSmoke.prototype.Update = function()
{
	// Update the timer
	this.timer += 1;
	
	this.posX+=this.velX;
	this.posY+=this.velY;
	this.posZ+=this.velZ;
	
	// If a lifespan was set and it's up, kill yourself
	if (this.lifespan > 0 && this.timer > this.lifespan)
		this.Kill(); 
		
	// If the owner is dead, kill yourself
	if (this.owner !== null && this.owner.state === States.Dead)
		this.Kill();
		
	if (this.owner !== null && this.maxDistance > 0 && distance3DActorToActor(this, this.owner) > this.maxDistance)
		this.Kill();
		
	if (this.posZ < 0)
		this.Kill();
	
	this.drawAlpha = crawlValue(this.drawAlpha,this.alpha,0.005);
	this.scale = crawlValue(this.scale,linearRemap(this.alpha, 0, 1, this.maxScale, this.minScale),0.02);
	this.rotation = normalizeAngle(this.rotation+this.velR);
	
	// If you're dying, fade out
	if (this.state === States.Dying)
	{
		this.alpha = 0;
		if (this.drawAlpha === 0)
			this.Die();
	}

		
};

WaftingSmoke.prototype.Push = function(otherEntity)
{
	// This object cannot be moved
};

WaftingSmoke.prototype.Hit = function(attack)
{
	// This object cannot be hurt
};

// All the animation frames associated with the SmokeVolume.
GlobalResourceLoader.AddImageResource("smokelight","images/smoke/waftingSmokeLight_blue.png");
GlobalResourceLoader.AddImageResource("smokedark","images/smoke/waftingSmokeDark.png");