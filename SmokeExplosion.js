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

GlobalResourceLoader.AddImageResource("sheet_Smoke_Puff","images/smoke/sheet_Smoke_Puff.txt");
GlobalResourceLoader.AddAudioResource("smokeexplosion","sound/smokeexplosion.mp3");

function SmokeExplosion(posX,posY,posZ,width,height,density)
{
	this.serializable = false;
	
	// Create the smoke puff animation for use by the explosion
	this.puff = new Animation(this);
	this.puff.repeat = 0;
	this.puff.AddSequentialFrames("smoke/puff{0}",1,8);
	this.puff.AddBlankFrame();
	this.puff.SetDurationInSeconds(1.0);
	
	// Orb release variables
	this.corrupted = false;
	this.fucked = false;
	this.orbsOnDeath = 0;
	this.orbsAfterSex = 0;
	this.heathOrbsHeld = 0;
	this.corruptionOrbsHeld = 0;
	this.dominationOrbsHeld = 0;
	this.internalObjects = [];
	
	// State
	this.state = States.Unknown;
	this.facing = 1;
	this.alliance = 0;
	this.timer = 0;
    this.attack = null;
	
	// Physics
	this.delayTimer = -1;
	this.density = density;
	this.scale = 3.0;
	this.posX = posX;
	this.posY = posY;
	this.posZ = posZ;
	this.width = width;
	this.height = height;
	this.velX = 0;
	this.velY = 0;
	this.velZ = 0;
	
	this.puffVelX = 6;
	this.puffVelY = 6;
	this.puffBalanceX = 0.5;
	this.puffBalanceY = 0.5;
	
	this.orbSpawnType = 1;
	
	this.renew = false;
	this.deathTriggerEntity = null;
	this.mute = false;
	
	this.sfx = GlobalResourceLoader.GetSound("smokeexplosion");
	
	// Drawing
	this.orderBonus = 50;
	this.children = [];
	this.primed = false;
};

// Make all the smoke explosions share the same internal canvas
SmokeExplosion.prototype.renderRadius = 150;
SmokeExplosion.prototype.internalCanvas = null;
SmokeExplosion.prototype.localctx = null;

SmokeExplosion.prototype.newSmokePuff = function()
{
	var newpuff = { 'posX': (Math.random()-0.5)*this.width/2 + this.renderRadius - 25,
					'posY': (Math.random()-0.5)*this.height/2 + this.renderRadius - 25,
					'velX': (Math.random()-this.puffBalanceX)*this.puffVelX,
					'velY': (Math.random()-this.puffBalanceY)*this.puffVelY,
					'anim': this.puff.Clone()
				  };
	newpuff.anim.SetDurationInSeconds(Math.random() * 0.75 + 0.50);
	return newpuff;
};

SmokeExplosion.prototype.Die = function()
{
	this.state = States.Dead;
};

SmokeExplosion.prototype.TransferOrbs = function(entity)
{	
	// Transfer any held orbs
	this.corrupted = entity.corrupted;
	this.fucked = entity.fucked;
	this.orbsOnDeath = entity.orbsOnDeath;
	this.orbsAfterSex = entity.orbsAfterSex;
	this.heathOrbsHeld = entity.heathOrbsHeld;
	this.lifeOrbsHeld = entity.lifeOrbsHeld;
	this.corruptionOrbsHeld = entity.corruptionOrbsHeld;
	this.dominationOrbsHeld = entity.dominationOrbsHeld;
	this.internalObjects = entity.internalObjects;
	
	// Remove all orbs from the original entity
	entity.orbsOnDeath = 0;
	entity.lifeOrbsHeld = 0;
	entity.orbsAfterSex = 0;
	entity.heathOrbsHeld = 0;
	entity.corruptionOrbsHeld = 0;
	entity.dominationOrbsHeld = 0;
	entity.internalObjects = [];
}

SmokeExplosion.prototype.Respawn = function(pos)
{
	this.posX = pos.x;
	this.posY = pos.y;
	this.posZ = pos.z;
	this.velX = 0;
	this.velY = 0;
	this.velZ = 0;
	this.state = States.Unknown;
};

SmokeExplosion.prototype.Draw = function()
{	
	// Using kill distance as a size guide, create a new internal canvas if needed
	if (this.internalCanvas === null || this.internalCanvas.width != this.renderRadius * 2)
	{
		this.internalCanvas = document.createElement("canvas");
		this.internalCanvas.width = this.renderRadius*2;
		this.internalCanvas.height = this.renderRadius*2;
		
		// Make sure blurring is off
		this.localctx = this.internalCanvas.getContext("2d");
		this.localctx.imageSmoothingEnabled = false;
		this.localctx.webkitImageSmoothingEnabled = false;
		this.localctx.mozImageSmoothingEnabled = false;
	}
	
	// Clear the local context
	this.localctx.clearRect(0, 0, this.renderRadius*2, this.renderRadius*2);
	
	// 	Swap out the drawing context
	var holdCtx = ctx;
	ctx = this.localctx;
	
	// Draw all the children to it using source-over
	for (var i = 0; i < this.children.length; i++)
	{
		var child = this.children[i];
		if (child.anim.GetFrame() !== null)
			child.anim.GetFrame().Draw(child.posX,child.posY,50,50);
	}
	
	// Swap the drawing context back
	ctx = holdCtx;
	
	// Draw the local context on to the global context using lighter blending
	ctx.translate(this.posX,this.posY);
	ctx.globalCompositeOperation = "lighter";
	ctx.drawImage(this.internalCanvas,-this.renderRadius*this.scale,-this.renderRadius*this.scale-this.posZ,this.renderRadius*2*this.scale,this.renderRadius*2*this.scale);
	ctx.globalCompositeOperation = "source-over";
	ctx.translate(-this.posX,-this.posY);
};

SmokeExplosion.prototype.Update = function()
{
	if (this.delayTimer > 0)
		this.delayTimer -= 1;
			
	if (!this.primed && this.delayTimer === -1 && (this.deathTriggerEntity === null || IsDeadOrDying(this.deathTriggerEntity.state)))
	{
		// Prime the explosion
		// Each smoke puff is about 50x50 so a density of 1 would mean height*width / 2500 puffs
		var puffCount = Math.round(this.height*this.width/2500.0) * this.density;
		for (var i = 0; i < puffCount; i++)
		{
			this.children.push(this.newSmokePuff());
		}
		this.ReleaseOrbs();
		this.primed = true;
		if (!this.mute)
			this.sfx.Play(1.0);
	}
	else if (!this.primed && this.delayTimer === 0)
	{
		// Prime the explosion
		// Each smoke puff is about 50x50 so a density of 1 would mean height*width / 2500 puffs
		var puffCount = Math.round(this.height*this.width/2500.0) * this.density;
		for (var i = 0; i < puffCount; i++)
		{
			this.children.push(this.newSmokePuff());
		}
		this.ReleaseOrbs();
		this.primed = true;
		if (!this.mute)
			this.sfx.Play(1.0);
	}
	
	if (this.primed)
	{
		this.posX+=this.velX;
		this.posY+=this.velY;
		this.posZ+=this.velZ;
		
		// Update the timer
		this.timer += 1;
	
		// Update the animations
		var allFinished = true;
		for (var i = 0; i < this.children.length; i++)
		{
			var child = this.children[i];
			child.posX += child.velX;
			child.posY += child.velY;
			child.velX *= 0.90;
			child.velY *= 0.90;
			child.anim.Update();
			if (this.renew && child.anim.done)
				this.children[i] = this.newSmokePuff();
			if (!child.anim.done)
				allFinished = false;
		}
	
		// If all the child puffs are done, it's time to die
		if (allFinished && !this.renew)
		{
			this.state = States.Dead;
		}
	}
};

SmokeExplosion.prototype.Push = function(otherEntity)
{
	// This object cannot be moved
};

SmokeExplosion.prototype.Hit = function(attack)
{
	// This object cannot be hurt
};

SmokeExplosion.prototype.ReleaseOrbs = EntityReleaseOrbs;