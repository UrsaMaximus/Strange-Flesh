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

var activeAttacks = [];

function ResetAllAttacks()
{
	for (var i=0; i < activeAttacks.length; i++)
	{
		activeAttacks[i].Reset();
		i--;
	}
};

function Attack(owner)
{
	if(typeof(owner)==='undefined') owner = null;
	this.owner = owner;
	this.positionOwner = owner;	// Distinct from owner. Places the hitbox
								// in space but does not get credit for damage.
								
	this.damageDealt = 25;		// 25 damage
	this.hitStunDealt = 0.5;	// 50% hitstun effect
	this.corruptionDealt = 0.0;	
	this.staminaDrained = 0.2;
	this.intoxicationDealt = 0.0;
	this.attackbox = new BoundingRect();
	this.zHeight = 0;
	this.zSize = 50;
	this.lungeX = 0;
	this.lungeY = 0;
	this.lungeZ = 0;
	this.lungeOnFrame = 0;
	this.allowMove = false;
	this.visualContactX = 0;
	this.visualContactZ = 0;
	this.knockbackMultiplierZ = 1.0;
	this.knockbackMultiplier = 1.0;
	this.sfx = null;
	this.sfxDrunk = null;
	this.sfxPlayed = false;
	this.sfxVolume = 1.0;
	this.connectWithOwner = true;
	this.hitEntities = [];
	this.oneHitPerEntity = false;
	
	// Alliances: 	0 = Hazards (hurt player and enemy)
	//				1 = Player	(hurts enemy)
	//				2 = Enemy (hurts player)
	if (owner !== null)
		this.alliance = owner.alliance;
	else
		this.alliance = 0;
	
	// If friendly fire is enabled, then the attack does damage to friendly targets
	// If false, the attack still lands and stuns friendly targets, but does not hurt them
	this.connectWithAllies = false;
		
	// Every state must have at least one frame
	// Attack should probably only have one.
	this.warmupframes = 20;
	this.attackFrames = 1;
	this.cooldownframes = 20;
	
	this.remainActiveUntil = 0;		// 0 = until attackFrames Expire
									// 1 = until first hit
									// 2 = until positionOwner hits ground
									// 3 = first hit or ground
	
	this.autoReactivate = false;
	
	this.animationTriggered = "lightpunch";
	
	// States: 0 = ready, 1 = warming up, 2 = attacking, 3 = cooling down
	this.state = 0;
	this.counter = 0;
	this.totalCounter = 0;
	this.connected = false;
	this.firstHitEntity = null;
};

Attack.prototype.Clone = function() 
{
	var clone = new Attack();
	
	clone.owner = this.owner;
	clone.positionOwner = this.positionOwner;
	clone.damageDealt = this.damageDealt;
	clone.hitStunDealt = this.hitStunDealt;
	clone.corruptionDealt = this.corruptionDealt;	
	clone.staminaDrained = this.staminaDrained;
	clone.intoxicationDealt = this.intoxicationDealt;
	clone.attackbox = this.attackbox.Copy();
	clone.zHeight = this.zHeight;
	clone.zSize = this.zSize;
	clone.lungeX = this.lungeX;
	clone.lungeY = this.lungeY;
	clone.lungeZ = this.lungeZ;
	clone.lungeOnFrame = this.lungeOnFrame;
	clone.allowMove = this.allowMove;
	clone.visualContactX = this.visualContactX;
	clone.visualContactZ = this.visualContactZ;
	clone.knockbackMultiplierZ = this.knockbackMultiplierZ;
	clone.knockbackMultiplier = this.knockbackMultiplier;
	clone.sfx = this.sfx;
	clone.sfxDrunk = this.sfxDrunk;
	clone.sfxPlayed = this.sfxPlayed;
	clone.sfxVolume = this.sfxVolume;
	clone.alliance = this.alliance;
	clone.warmupframes = this.warmupframes;
	clone.attackFrames = this.attackFrames;
	clone.cooldownframes = this.cooldownframes;
	clone.remainActiveUntil = this.remainActiveUntil;
	clone.animationTriggered = this.animationTriggered;
	clone.state = this.state;
	clone.counter = this.counter;
	clone.totalCounter = this.totalCounter;
	clone.connected = this.connected;
	clone.firstHitEntity = this.firstHitEntity;
	clone.connectWithOwner = this.connectWithOwner;
	clone.connectWithAllies = this.connectWithAllies;
	
	return clone;
};

Attack.prototype.Attack = function() 
{
	if (this.state == 0)
	{
		this.connected = false;
		this.sfxPlayed = false;
		this.firstHitEntity = null;
		this.counter = 0;
		this.totalCounter = 0;
		this.state = 1;
		this.PushAttack();
	}
};

Attack.prototype.PushAttack = function() 
{
	// If the attackbox is out, take it back in
	var i = activeAttacks.indexOf(this);
	if (i == -1)
	{
		activeAttacks.push(this);
	}
};

Attack.prototype.PopAttack = function()
{
	// If the attackbox is out, take it back in
	var i = activeAttacks.indexOf(this);
	if (i != -1)
	{
		activeAttacks.splice(i,1);
	}
};

Attack.prototype.Reset = function() 
{
	this.PopAttack();
	this.hitEntities = [];
	this.state = 0;
	this.counter = 0;
	this.totalCounter = 0;
	//this.sfxPlayed = false;
};

Attack.prototype.GetRect = function()
{
		if (this.positionOwner != null)
			return this.attackbox.CopyAndMoveTo(this.positionOwner.posX,this.positionOwner.posY,this.positionOwner.facing);
		else
			return this.attackbox;
};

Attack.prototype.GetEntitiesInRange = function()
{
	var entitiesInRange = [];

	if (this.positionOwner != null)
	{
		var thisRect = this.attackbox.CopyAndMoveTo(this.positionOwner.posX,this.positionOwner.posY,this.positionOwner.facing);
		for (var i=0; i < level.entities.list.length; i++)
		{
			var rect = level.entities.list[i].hitRect.CopyAndMoveTo(level.entities.list[i].posX,level.entities.list[i].posY);
			var zLow = level.entities.list[i].posZ;
			var zHigh = level.entities.list[i].posZ+level.entities.list[i].zHeight;
			var alliance = level.entities.list[i].alliance;
		
			if (this.positionOwner.posZ + this.zHeight + this.zSize >= zLow && this.positionOwner.posZ + this.zHeight - this.zSize <= zHigh && (this.alliance != alliance || this.alliance === 0))
			{
				if (thisRect.ContainsRect(rect))
					entitiesInRange.push(level.entities.list[i]);
			}
		}
	}
	else
	{
		for (var i=0; i < level.entities.list.length; i++)
		{
			var rect = level.entities.list[i].hitRect.CopyAndMoveTo(level.entities.list[i].posX,level.entities.list[i].posY);
			var zLow = level.entities.list[i].posZ;
			var zHigh = level.entities.list[i].posZ+level.entities.list[i].zHeight;
			var alliance = level.entities.list[i].alliance;
			if (this.zHeight + this.zSize >= zLow && this.zHeight - this.zSize <= zHigh && (this.alliance != alliance || this.alliance === 0))
			{
				if (this.attackBox.ContainsRect(rect))
					entitiesInRange.push(level.entities.list[i]);
			}
		}
	}
	return entitiesInRange;
};

Attack.prototype.PlaySFX = function(delay)
{
	if(typeof(delay)==='undefined') delay = 0;
	
	if (this.owner != null && this.owner.drunkTimer > 0 && this.sfxDrunk !== null && !this.sfxPlayed)
	{
		this.sfxDrunk.Play(this.sfxVolume, delay);
		this.sfxPlayed = true;
	}
	else if (this.sfx !== null && !this.sfxPlayed)
	{
		this.sfx.Play(this.sfxVolume, delay);
		this.sfxPlayed = true;
	}
};

Attack.prototype.ShouldConnect = function(rect,zLow,zHigh,alliance,targetObject)
{
	if (!this.connectWithOwner && this.owner.displayName === targetObject.displayName)
	{
		return false;
	}
	
	if (this.state == 2)
	{
		
		for (var i=0; i < this.hitEntities.length; i++)
		{
			if (targetObject === this.hitEntities[i])
				return false;
		}
		
		if (this.positionOwner != null)
		{
			if (this.positionOwner.posZ + this.zHeight + this.zSize >= zLow && this.positionOwner.posZ + this.zHeight - this.zSize <= zHigh && (this.alliance != alliance || this.alliance === 0 || (this.connectWithAllies && this.alliance === alliance)))
			{
				return this.attackbox.CopyAndMoveTo(this.positionOwner.posX,this.positionOwner.posY,this.positionOwner.facing).ContainsRect(rect);
			}
		}
		else
		{
			if (this.zHeight + this.zSize >= zLow && this.zHeight - this.zSize <= zHigh)
			{
				return this.attackbox.ContainsRect(rect);
			}
		}
	}
	return false;
};

Attack.prototype.NotifyConnected = function(entity)
{
	//this.connected = true;
	//this.firstHitEntity = null;
};

Attack.prototype.NotifyDamage = function(entity, damageDealt, corruptionDealt)
{
	if (this.oneHitPerEntity)
		this.hitEntities.push(entity);
	
	if (!this.connected)
		this.connected = true;
	
	if (this.firstHitEntity === null)
		this.firstHitEntity = entity;
		
	if (this.owner !== null && "NotifyDamageDealt" in this.owner)
		this.owner.NotifyDamageDealt(damageDealt, corruptionDealt);
	
	if (this.positionOwner !== null && "NotifyDamageDealt" in this.positionOwner)
		this.positionOwner.NotifyDamageDealt(0, 0);
};

// Pretty much for debug only
Attack.prototype.Draw = function()
{
	var zHeight = this.zHeight;
	if (this.positionOwner != null)
	{
		ctx.translate(this.positionOwner.posX,this.positionOwner.posY);
		zHeight += this.positionOwner.posZ;
	}

	// Draw the hit rect
	
	if (this.state == 1)
		ctx.strokeStyle = "#0000FF";
	else if (this.state == 2)
		ctx.strokeStyle = "#FF0000";
	else if (this.state == 3)
		ctx.strokeStyle = "#FF00FF";
	
	var bb;
	if (this.positionOwner != null)
		bb = this.attackbox.CopyAndMoveTo(0,0,this.positionOwner.facing);
	else
		bb = this.attackbox;
	drawBoundingBox(bb);
		

	// Draw the hit-zone staff
	ctx.globalAlpha = 0.3;
	ctx.fillStyle = "#FFFF00";
	ctx.fillRect(bb.xMin, -zHeight - this.zSize, bb.width(), this.zSize * 2);
	ctx.globalAlpha = 1.0;
	
	ctx.beginPath();
	ctx.moveTo(bb.centerX(),0);
	ctx.lineTo(bb.centerX(), -zHeight - this.zSize);
	ctx.stroke();
	
	if (this.positionOwner != null)
	{
		ctx.translate(-this.positionOwner.posX,-this.positionOwner.posY);
	}
};

Attack.prototype.Update = function() 
{
	if (this.state == 0)
		return false;
	
	if (this.owner !== null && this.totalCounter === this.lungeOnFrame)
	{
		this.owner.velX += this.lungeX*this.owner.facing;
		this.owner.velY += this.lungeY;
		this.owner.velZ += this.lungeZ;
	}
	
	this.totalCounter += 1;
	
	if (this.state == 1)
	{
		this.counter += 1;
		if (this.counter >= this.warmupframes)
		{
			this.counter = 0;
			this.state = 2;
		}
	}
	else if (this.state == 2)
	{
		// 0 = Until attackFrames Expire
		if (this.remainActiveUntil === 0)
			this.counter += 1;
		// 1 = Until first hit, do not advance the counter at all until contact has been made
		else if ((this.remainActiveUntil === 1 || this.remainActiveUntil === 3) && (this.connected || (this.positionOwner !== null && this.positionOwner.state === States.Dead)))
			this.counter += 1;
		// 2 = Until positionOwner hits ground
		else if ((this.remainActiveUntil === 2 || this.remainActiveUntil === 3) && this.positionOwner !== null && this.positionOwner.posZ <= 0)
			this.counter += this.attackFrames;
			
		if (this.counter >= this.attackFrames)
		{
			this.counter = 0;
			this.state = 3;
		}
	}
	else if (this.state == 3)
	{
		this.counter += 1;
		if (this.counter >= this.cooldownframes)
		{
			this.Reset();
			
			if (this.autoReactivate)
				this.Attack();
			else
				return true;
		}
	}
	return false;
};