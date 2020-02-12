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

// Hit sound effects are the same for all walking entities
GlobalResourceLoader.AddAudioResource("hard_hit","sound/hard_hit.mp3");
GlobalResourceLoader.AddAudioResource("moderate_hit","sound/moderate_hit.mp3");
GlobalResourceLoader.AddAudioResource("light_hit","sound/light_hit.mp3");

GlobalResourceLoader.AddAudioResource("cum1","sound/cum/Cum1.mp3");
GlobalResourceLoader.AddAudioResource("cum2","sound/cum/Cum2.mp3");
GlobalResourceLoader.AddAudioResource("cum3","sound/cum/Cum3.mp3");
GlobalResourceLoader.AddAudioResource("cum4","sound/cum/Cum4.mp3");
GlobalResourceLoader.AddAudioResource("cum5","sound/cum/Cum5.mp3");
GlobalResourceLoader.AddAudioResource("cum6","sound/cum/Cum6.mp3");
GlobalResourceLoader.AddAudioResource("cum7","sound/cum/Cum7.mp3");
GlobalResourceLoader.AddAudioResource("cum8","sound/cum/Cum8.mp3");
GlobalResourceLoader.AddAudioResource("cum9","sound/cum/Cum9.mp3");
GlobalResourceLoader.AddAudioResource("cum10","sound/cum/Cum10.mp3");
GlobalResourceLoader.AddAudioResource("cum11","sound/cum/Cum11.mp3");
GlobalResourceLoader.AddAudioResource("cum12","sound/cum/Cum12.mp3");

GlobalResourceLoader.AddImageResource("sheet_StatusMeters","images/menus/sheet_StatusMeters.txt");

// Once per launch of the game, spawn a zombie for sure the very first time you can
var zombieNeverSpawned = true;

// WalkingEntity.js

// Since Javascript inheritance is a massive joke, this file
// features what would have been shared functions from a base
// class for all the walking entities.

function EntityInit()
{
	this.objectID = nextObjectID++;
	this.displayName = "Walking Entity";
	
	this.newlySpawned = false;
	this.newlySpawnedTargetX = 0;
	this.newlySpawnedTargetY = 0;
	
	this.disableSpawnOnScroll = false;
	this.spawnOnSkirmish = false;
	
	this.vibrateHitstunTimer = 0;	// amplitude,scale
	this.earthquakeX = new EarthQuakeNoise(12,0.4);
	this.earthquakeY = new EarthQuakeNoise(12,0.4);
	this.effectOffsetX = 0;
	this.effectOffsetY = 0;
	
	// SFX
	this.hardHitSFX = GlobalResourceLoader.GetSound("hard_hit");
	this.moderateHitSFX = GlobalResourceLoader.GetSound("moderate_hit");
	this.lightHitSFX = GlobalResourceLoader.GetSound("light_hit");
	
	this.cumSFX = GlobalResourceLoader.GetSound("cum1");

	
	this.hitSFX = null;
	this.hitDrunkSFX = null;
	this.knockoutSFX = null;
	
	this.hitSFXDebounce = 0;
	
	this.grabbedSFX = null;
	this.knockoutGroundHitSFX = null;
	
	this.captive = null;
	
	// Physics
	this.posX = 0;
	this.posY = 0;
	this.posZ = 0;
	this.rotation = 0;
	this.scale = 3.0;
	this.velX = 0;
	this.velY = 0;
	this.velZ = 0;
	this.polite = false;
	this.canJumpOver = true;
	
	this.posXHistory = [];
	this.posYHistory = [];
	this.posZHistory = [];
	this.posHistoryIndex = 0;
	
	this.velXEffective = 0;
	this.velYEffective = 0;
	this.velZEffective = 0;
	
	this.accelX = 0;
	this.accelY = 0;
	this.accelZ = 0;
	this.walkAccel = 5.0;
	this.xyRatio = 20.0 / 50.0;
	this.groundFriction = 0.81;
	this.groundFrictionKO = 0.9;
	this.weight = 100;
	this.gravity = 0;
	this.landing = false;
	this.posZLastFrame = 1;
	this.flying = false;
	this.MustJumpToMove=false;
	this.isPassThrough = false;
	this.showDamageMeter = true;
	
	// Orbs released on death
	this.orbsOnDeath = 0;
	this.orbsAfterSex = 0;
	this.heathOrbsHeld = 0;
	this.lifeOrbsHeld = 0;
	this.corruptionOrbsHeld = 0;
	this.dominationOrbsHeld = 0;
	this.internalObjects = [];
	this.orbSpawnType = 1;
	
	// Control and object state
	this.controller = new Controller();
	this.ai = null;
	this.facing = 1;
	this.state = States.Walk;
	this.lastState = States.Walk;
	this.lastStateFrames = 0;
	this.stateFrames = 0;
	this.recruited = false;
	this.recruitmentTime = 1200;
	this.recruitedFrames = 0;
	this.watchingSex = false;
	this.watchingSexFrames = 0;
	this.corrupted = false;
	this.fucked = false;
	this.grabbable = false;
	this.snareable = false;
	this.fuckable = false;
	this.kissable = false;
	this.throwable = false;
	this.corruptable = true;
	this.knockoutable = true;
	this.stunnable = true;
	this.intoxicatable = false;
	this.drunkTimer = 0;
	this.maxDrunkTimer = 7200; // This is the drunkest the bartender is allowed to be
	this.spawnedZombie = false;
	this.framesBeforeDeath = 120;
	this.smokeHitEffectCounter = 0;
	this.maxJumpFrames = 6;
	
	this.drunkOutline = GlobalResourceLoader.GetSprite("statusMeters/outline-drunk");
	this.drunkFill = GlobalResourceLoader.GetSprite("statusMeters/fill-drunk");
	this.recruitOutline = GlobalResourceLoader.GetSprite("statusMeters/outline-recruit");
	this.recruitFill = GlobalResourceLoader.GetSprite("statusMeters/fill-recruit");
	this.corruptOutline = GlobalResourceLoader.GetSprite("statusMeters/outline-corrupt");
	this.corruptFill = GlobalResourceLoader.GetSprite("statusMeters/fill-corrupt");
	
	this.sexType = 0;
	
	this.leftSideAttackers = [];
	this.rightSideAttackers = [];
	this.maxAttackersPerSide = 1;
	
	// Animation
	this.orderBonus = 0;
	this.animationModel = new AnimationModel(this);
	this.prepareForThrow = false;
	this.alpha = 1.0
	//this.spriteCenterX = 150;
	//this.spriteCenterY = 183;
	
	// Camera info
	this.trackingOffsetX = 0;
	this.trackingOffsetY = -350;
	
	this.grabAdjustX = 0;
	this.grabAdjustY = 0;
	this.grabAdjustZ = 0;
	
	// Collision
	this.zHeight = this.scale * 100;
	this.collisionRadius = this.scale * 20;
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	this.health = 200;
	this.maxHealth = 200;
	this.hitStunFrames = 0;
	this.maxHitStunFrames = 60;
	this.stamina = 1.0;
	this.maxStamina = 1.0;
	this.attack = null;
	this.framesSinceLastConnectingAttack = 10000;
	this.alliance = 0;
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * 50 / 2,y:-this.scale * 20 / 2});
	this.hitRect.expandToFit({x:this.scale * 50 / 2,y:this.scale * 20 / 2});
	
	// Only used by the bartender but these might as well be here
	this.maxSexMeter = 1000;
	this.sexMeter = this.maxSexMeter * 0.75;
};

function EntityChangeState(newState)
{
	this.lastState = this.state;
	this.state = newState;
	this.lastStateFrames = this.stateFrames;
	this.stateFrames = 0;
};

function EntityGetGroundFriction()
{
	if (IsInvulnerable(this.state))
		return this.groundFrictionKO;
	else
		return this.groundFriction;
};

function EntityChangeStateOnAttackComplete(newState)
{
	if (this.attack === null || this.attack.state === 0)
		this.ChangeState(newState);
};

function EntitySpeed()
{
	return speed3(this.velX,this.velY,this.velZ);
};

function EntityKill()
{
	this.state = States.Dying;
};

function EntityDie()
{
	this.ReleaseOrbs();
	this.ChangeState(States.Dead);
	if (this.ai !== null)
		this.ai.Flush();
};

function EntityReleaseOrbs()
{
	// If corrupted, release corruption orbs
	if (this.corrupted)
	{
		for (var i=0; i < this.orbsOnDeath; i++)
			level.entities.AddEntity(new CollectableOrb(ORB_CORRUPT, false, this, 0, 0, this.orbSpawnType));
	}
	else
	{
		for (var i=0; i < this.orbsOnDeath; i++)
			level.entities.AddEntity(new CollectableOrb(ORB_DOMINATE, false, this, 0, 0, this.orbSpawnType));
	}
	
	// After sex, release the after sex orbs and POSSIBLY a zombie
	if (this.fucked)
	{
		if ((Math.random()< 0.6 || zombieNeverSpawned)  && !this.spawnedZombie && level.hasOwnProperty("zombiesCanSpawn") && level.zombiesCanSpawn)
		{
			var zombie = new VirusFromVenus();
			zombie.Respawn({'x':this.posX,'y':this.posY,'z':this.posZ});
			level.entities.AddEntity(zombie);
			this.spawnedZombie = true;
			zombieNeverSpawned = false;
		}
		
		// If fucked, release after sex orbs
		for (var i=0; i < this.orbsAfterSex; i++)
			level.entities.AddEntity(new CollectableOrb(ORB_HEALTH, false, this, 0, 0, this.orbSpawnType));
	}
	
	// Release any held other held orbs
	for (var i=0; i < this.corruptionOrbsHeld; i++)
		level.entities.AddEntity(new CollectableOrb(ORB_CORRUPT, false, this, 0, 0, this.orbSpawnType));

	for (var i=0; i < this.heathOrbsHeld; i++)
		level.entities.AddEntity(new CollectableOrb(ORB_HEALTH, false, this, 0, 0, this.orbSpawnType));

	for (var i=0; i < this.dominationOrbsHeld; i++)
		level.entities.AddEntity(new CollectableOrb(ORB_DOMINATE, false, this, 0, 0, this.orbSpawnType));
	
	for (var i=0; i < this.lifeOrbsHeld; i++)
		level.entities.AddEntity(new CollectableOrb(ORB_LIFE, false, this, 0, 0, this.orbSpawnType));
	
		
	for (var i=0; i < this.internalObjects.length; i++)
	{
		this.internalObjects[i].posX = this.posX;
		this.internalObjects[i].posY = this.posY;
		this.internalObjects[i].posZ = this.posZ;
		level.entities.AddEntity(this.internalObjects[i]);
	}
		
	// Orbs have been released. Set all counts to zero
	this.orbsOnDeath = 0;
	this.orbsAfterSex = 0;
	this.heathOrbsHeld = 0;
	this.corruptionOrbsHeld = 0;
	this.dominationOrbsHeld = 0;
	this.internalObjects.length = 0;
	this.lifeOrbsHeld = 0;
};

function EntityCancelAttack()
{
	if (this.attack !== null)
	{
		this.attack.Reset();
		this.attack = null;
	}
};

function EntityRespawn(pos)
{
	this.posX = pos.x;
	this.posY = pos.y;
	if (pos.hasOwnProperty("z"))
		this.posZ = pos.z;
	this.velX = 0;
	this.velY = 0;
	this.velZ = 0;
	this.accelX = 0;
	this.accelY = 0;
	this.accelZ = 0;
	this.ChangeState(States.Fall);
	this.health = this.maxHealth;
	this.drunkTimer = 0;
	this.hitStunFrames = 0;
	this.stamina = 1.0;
	this.attack = null;
	this.framesSinceLastConnectingAttack = 10000;
};

function EntityDrawSprite()
{
	this.animationModel.Draw();
};

function EntityDraw()
{
	if (!IsCaptive(this.state))
	{
    	ctx.translate(this.posX,this.posY);
    	
    	this.DrawSprite();
  		
    	if (debug === 2)
    	{
    		ctx.lineWidth = 4.0 / camera.scale;
    		
    		// Draw the hit rect
    		ctx.strokeStyle = "#FF0000";
    		drawBoundingBox(this.hitRect);
    		
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
			
			// Show the Z component of the hit box
			var bb = this.hitRect;
			var zHeight = this.zHeight;
			ctx.globalAlpha = 0.3;
			ctx.fillStyle = "#00FF00";
			ctx.fillRect(bb.xMin, -zHeight-this.posZ, bb.width(), zHeight);
			ctx.globalAlpha = 1.0;

			ctx.beginPath();
			ctx.moveTo(bb.centerX(),0);
			ctx.lineTo(bb.centerX(), -zHeight-this.posZ - this.zSize);
			ctx.stroke();
			
    	}
    	
    		
	//this.drunkOutline = GlobalResourceLoader.GetSprite("statusMeters/outline-drunk");
	//this.drunkFill = GlobalResourceLoader.GetSprite("statusMeters/fill-drunk");
	//this.recruitOutline = GlobalResourceLoader.GetSprite("statusMeters/outline-recruit");
	//this.recruitFill = GlobalResourceLoader.GetSprite("statusMeters/fill-recruit");
	//this.corruptOutline = GlobalResourceLoader.GetSprite("statusMeters/outline-corrupt");
	//this.corruptFill = GlobalResourceLoader.GetSprite("statusMeters/fill-corrupt");

    	// Draw the little pacman indicator for drunkenness
    	if (this.intoxicatable && this.drunkTimer > 0)
    	{
    		DrawStatusIndicator(normalizeValue(this.drunkTimer, 0, this.maxDrunkTimer), 0, -(this.zHeight + 130), this.drunkOutline, this.drunkFill);
    	}
    	// Draw the little pacman indicator for sex
    	else if (this.state === States.Corrupt && this.fuckable && this.corrupted && !this.fucked)
    	{
    		//DrawPacmanIndicator(normalizeValue(this.stateFrames, 1, 700), -250, "#3cd35b" , "#f7e2d9");
    		DrawStatusIndicator(normalizeValue(this.stateFrames, 1, 700), 75*this.facing, -200, this.corruptOutline, this.corruptFill);

    	}
    	// Draw the little pacman indicator for recruitment
    	else if (this.recruited)
    	{
    		//DrawPacmanIndicator(1-normalizeValue(this.recruitedFrames, 0,this.recruitmentTime), -(this.zHeight + 130), "#b3169f");
    		DrawStatusIndicator(1-normalizeValue(this.recruitedFrames, 0,this.recruitmentTime), 0, -(this.zHeight + 130), this.recruitOutline, this.recruitFill)
    	}
    	
    	ctx.translate(-this.posX,-this.posY);
    	}
};

function DrawStatusIndicator(value, xoffset, zheight, outlineSprite, fillSprite)
{
	// Draw the fill
	//ctx.globalCompositeOperation = "screen";
	
	var srcY = Math.round((1-value) * fillSprite.height);
	var fillHeight = fillSprite.height - srcY;
	
	if (fillHeight > 0)
	{
		fillSprite.Draw(	0, 
							srcY, 
							fillSprite.width, 
							fillHeight, 
							-fillSprite.info.centerX * 3 + xoffset,
							-fillSprite.info.centerY * 3 + zheight + srcY * 3,
							fillSprite.width * 3,
							fillHeight * 3);
	}
	
	//ctx.globalCompositeOperation = "source-over";
	
	// Draw the outline
	outlineSprite.DrawSprite3x(xoffset, zheight);
};

function EntityProcessDirectionalInput(allowLR, allowUD)
{		
		if(typeof(allowLR)=='undefined') 
			allowLR = true;
			
		if(typeof(allowUD)=='undefined') 
			allowUD = true;

		// Enforce velocity limits
		var maxVel = this.GetMoveMaxVelocity();
		
		var updownMoveBonus = 1.0;
		if ((!this.controller.left && !this.controller.right) || !allowLR)
		{
			updownMoveBonus = 2.0;
		}
		if (this.controller.right && allowLR)
		{
			if (this.velX < maxVel)
				this.accelX = clamp(this.walkAccel,0,maxVel-this.velX);
			this.facing = 1;
		}
		else if (this.controller.left && allowLR)
		{
			if (this.velX > -maxVel)
				this.accelX = -clamp(this.walkAccel,0,this.velX+maxVel);
			this.facing = -1;
		}
		if (this.controller.up && allowUD)
		{
			if (this.velY > -maxVel*this.xyRatio*updownMoveBonus)
				this.accelY = -clamp(this.walkAccel * this.xyRatio*updownMoveBonus,0,this.velY + maxVel*this.xyRatio*updownMoveBonus);
		}
		else if (this.controller.down && allowUD)
		{
			if (this.velY < maxVel*this.xyRatio*updownMoveBonus)
				this.accelY = clamp(this.walkAccel * this.xyRatio*updownMoveBonus,0,maxVel*this.xyRatio*updownMoveBonus-this.velY);
		}
};

function EntityUpdateState()
{	
};

function EntityUpdate()
{
	// Manage position history and effective velocity
	while (this.posXHistory.length < 20)
	{
		this.posXHistory.push(this.posX);
		this.posYHistory.push(this.posY);
		this.posZHistory.push(this.posZ);
	}
	
	this.posXHistory[this.posHistoryIndex] = this.posX;
	this.posYHistory[this.posHistoryIndex] = this.posY;
	this.posZHistory[this.posHistoryIndex] = this.posZ;
	
	this.velXEffective = this.posX - this.posXHistory[modPositive(this.posHistoryIndex-1,20)];
	this.velYEffective = this.posY - this.posYHistory[modPositive(this.posHistoryIndex-1,20)];
	this.velZEffective = this.posZ - this.posZHistory[modPositive(this.posHistoryIndex-1,20)];
	
	this.posHistoryIndex = (this.posHistoryIndex + 1)%20;
	
	if (this.hitSFXDebounce > 0)
		this.hitSFXDebounce -= 1;
	
	// If waiting for sex, ping the HUD
	if (this.state === States.Corrupt && this.fuckable && this.corrupted && !this.fucked)
	{
		hud.EntityReadyForSex();
	}
	
	if (this.vibrateHitstunTimer > 0)
	{
		this.vibrateHitstunTimer -= 1;
		this.effectOffsetX = this.earthquakeX.getVal(this.vibrateHitstunTimer);
		this.effectOffsetY = this.earthquakeY.getVal(this.vibrateHitstunTimer);
	}
	else
	{
		this.effectOffsetX = 0;
		this.effectOffsetY = 0;
	}

	// Update AI controllers
	if (this.controller !== controller)
	{
		// Don't update AI while dead or player-controlled
		this.controller.update();
		if (this.ai !== null)
			this.ai.Update();
	}
	
	// Update the animation model
	this.animationModel.Update();
	
	// Reset movement acceleration
	this.accelX = 0;
	this.accelY = 0;
	this.accelZ = 0;
	
	// Reset draw order priority
	this.orderBonus = 0;

	// Update the state machine
	this.UpdateState();
	this.stateFrames += 1;
	
	// Update the newly spawned status
	if (this.newlySpawned)
	{
		if (distance(this.posX, this.posY, this.newlySpawnedTargetX,this.newlySpawnedTargetY) < 50)
		{
			this.newlySpawned = false;
		}
	}
	
	if (this.recruited && !IsCorrupt(this.state) && !IsDeadOrDying(this.state))
		this.recruitedFrames += 1;
	else
		this.recruitedFrames = 0;
		
	if (this.watchingSexFrames > 0)
		this.watchingSexFrames -= 1;
	else if (this.watchingSex)
		this.DoneWatchingSex();
		
	if (this.smokeHitEffectCounter > 0)
		this.smokeHitEffectCounter -= 1;
	
	// Update the attack
	this.framesSinceLastConnectingAttack++;
	if (this.attack !== null)
	{
		if (this.attack.state == 0)
		{
			if (this.attack.connected)
			{
				this.framesSinceLastConnectingAttack = 0;
			}
			this.attack = null;
		}
	}

	if (!IsCaptive(this.state))
	{
		
		// Move the player
		this.velX += this.accelX;
		this.velY += this.accelY;
		this.velZ += this.accelZ;
		
		// Convert the velocities to magnitude and angle
		var mag = Math.sqrt(Math.pow(this.velX,2)+Math.pow(this.velY,2));
		var ang = Math.atan2(this.velY,this.velX);
	
		// Apply friction
		if (this.posZ === 0 || this.flying)
		{
			mag = mag * this.GetGroundFriction();
		}
		this.velX = mag*Math.cos(ang);
		this.velY = mag*Math.sin(ang);
	
		// Recover stamina
		this.stamina += this.GetStaminaRecovery();
		
		if (this.stamina > this.maxStamina)
			this.stamina = this.maxStamina;

		// Gravity
		if (this.posZ > 0)
		{
			this.velZ -= (gravity + this.gravity);
		}
		else
		{
			if (this.state !== States.Jump && this.state !== States.KnockedOut && this.state !== States.BasicAttack)
			{
				if (this.flying)
				{
					if (!this.controller.jump)
						this.velZ = 0;
					
				}
				else
				{
					this.velZ = 0;
				}
				
			}
		}
		
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

				if (level.transitions[i].killEnemies && player != this)
				{
					level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,player.posZ+25,200,100,2.0));
					this.ReleaseOrbs();
					this.Die();
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
		
		this.CollisionDetection(this.velX,this.velY + fakeHeightYCorrection,this.velZ + fakeHeightZCorrection,true);
		
		// Check if any damage has been dealt to this actor
		var hitRect = this.hitRect.CopyAndMoveTo(this.posX,this.posY);
		for (var i = 0; i < activeAttacks.length; i++) 
		{
			if (activeAttacks[i].ShouldConnect(hitRect,this.posZ,this.posZ+this.zHeight,this.alliance, this))
			{
				this.Hit(activeAttacks[i]);
			}
			
			if (this.captive !== null /*&& sign(activeAttacks[i].positionOwner.posX-this.posX) === this.facing*/)
			{	
				var captiveHitRect = this.captive.hitRect.CopyAndMoveTo(this.captive.posX,this.captive.posY);
				if (activeAttacks[i].ShouldConnect(captiveHitRect,this.captive.posZ,this.captive.posZ+this.captive.zHeight,this.captive.alliance, this.captive))
				{
					this.captive.Hit(activeAttacks[i], true);
				}
			}
		}

		// Perform some checks to set event flags	
		if (this.posZLastFrame > 0 && this.posZ <= 0)
			this.landing = true;
		else
			this.landing = false;
		this.posZLastFrame = this.posZ;
		
		// Knock the player out if for some reason they are legit dead
		if (this.knockoutable && this.health === 0 && !IsInvulnerable(this.state))
		{
			this.ChangeState(States.KnockedOut);
			if (this.ai !== null)
				this.ai.Flush();
		}
		
	}
	
	// Cleanup the attack lists once per frame, checking in on all attackers
	for (var i=0; i < this.leftSideAttackers.length; i++)
	{
		if (!IsCapableOfThought(this.leftSideAttackers[i].state))
		{
			this.ReleaseAttackPermission(this.leftSideAttackers[i])
			i--;
		}
	}
	for (var i=0; i < this.rightSideAttackers.length; i++)
	{
		if (!IsCapableOfThought(this.rightSideAttackers[i].state))
		{
			this.ReleaseAttackPermission(this.rightSideAttackers[i])
			i--;
		}
	}
};

function EntityCollisionDetection(deltaX,deltaY,deltaZ,enableEntityCollision, moveStepSizeOverride)
{
	if (!(this === player && playernoclip))
	{
		// Use continuous collision detection...
		var moveStepSize = 20;
		
		if(typeof(moveStepSizeOverride)!=='undefined') 
			moveStepSize = moveStepSizeOverride
		
		var steps = Math.floor(speed2(deltaX,deltaY)/moveStepSize)+1;

		var dx = deltaX / steps;
		var dy = deltaY / steps;
		var dz = deltaZ / steps;

		for (var step=0; step < steps; step++)
		{
			this.posX += dx;
			this.posY += dy;
			this.posZ += dz;
	

			// Resolve any collisions with other agents
			if (enableEntityCollision  && !this.newlySpawned)
			{
				for (var i = 0; i < level.entities.list.length; i++) 
				{
					level.entities.list[i].Push(this);
				}
			}

			// Eject the player from the level
			if (!this.newlySpawned)
			{
				var ejectionVector = level.Collide(this.posX, this.posY, this.collisionRadius, this);
				this.posX += ejectionVector.x;
				this.posY += ejectionVector.y;
			}

			if (this.posZ < 0)
				this.posZ = 0;
		}
	}
	else
	{
		this.posX += deltaX;
		this.posY += deltaY;
		this.posZ += deltaZ;
		if (this.posZ < 0)
			this.posZ = 0;
	}
};

function EntityNotifyDamageDealt(damageDealt, corruptionDealt)
{
	if (this.state === States.Thrown)
	{
		this.velX = this.velX * 0.3;
	}
	// Do nothing with this info. Overrides will do the heavy lifting.
};

function EntityPush(otherEntity)
{
	if (playernoclip && (this === player || otherEntity === player))
		return;
	
	if (otherEntity === this)
		return;
	
	// Enemies do not collide with one another
	if ((this.alliance === 2 && otherEntity.alliance === 2) || this.isPassThrough || otherEntity.isPassThrough)
		return;
		
	// Check zCollision
	if (this.posZ + this.zHeight < otherEntity.posZ || otherEntity.posZ + otherEntity.zHeight < this.posZ)
		return;
		
	if (IsCaptive(this.state) || IsPassthrough(this.state) || IsCaptive(otherEntity.state) || IsPassthrough(otherEntity.state))
		return;
		
	var heightMultiplier = (this.zHeight - Math.abs(this.posZ - otherEntity.posZ)) / this.zHeight;
	if (heightMultiplier < 0)
		heightMultiplier = 0;
	if (!this.canJumpOver)
		heightMultiplier = 1;
		
	var collisionRect = this.hitRect.CopyAndMoveTo(this.posX,this.posY);
	var otherEntityRect = otherEntity.hitRect.CopyAndMoveTo(otherEntity.posX,otherEntity.posY);
	
	if (collisionRect.ContainsRect(otherEntityRect))
	{
		// Split the difference between the two objects
		var xDist = Math.abs(collisionRect.centerX() - otherEntityRect.centerX());
		var yDist = Math.abs(collisionRect.centerY() - otherEntityRect.centerY());
		
		var requiredSeparationX = heightMultiplier*((collisionRect.width() / 2 + otherEntityRect.width() / 2)-xDist);
		var requiredSeparationY = heightMultiplier*((collisionRect.height() / 2 + otherEntityRect.height() / 2)-yDist);
		
		var thisXVel = 0;
		var thisYVel = 0;
		var thatXVel = 0;
		var thatYVel = 0;
		
		var thisWeightRatio = this.weight / (this.weight + otherEntity.weight);
		var thatWeightRatio = otherEntity.weight / (this.weight + otherEntity.weight);
		
		// Push horizontally
		if (requiredSeparationX < requiredSeparationY)
		{
			if (collisionRect.centerX()  > otherEntityRect.centerX())
			{
				thisXVel = requiredSeparationX * thatWeightRatio;
				thatXVel = -requiredSeparationX * thisWeightRatio;
			}
			else
			{
				thisXVel = -requiredSeparationX * thatWeightRatio;
				thatXVel = requiredSeparationX * thisWeightRatio;
			}
		}
		// Push vertically
		else
		{
			if (collisionRect.centerY()  > otherEntityRect.centerY())
			{
				thisYVel = requiredSeparationY * thatWeightRatio;
				thatYVel = -requiredSeparationY * thisWeightRatio;
			}
			else
			{
				thisYVel = -requiredSeparationY * thatWeightRatio;
				thatYVel = requiredSeparationY * thisWeightRatio;
			}
		}
		
		// Eject this entity from the level to avoid interactions from stacking up
		// and pushing it through completely
		this.CollisionDetection(thisXVel,thisYVel,0,false);
		otherEntity.CollisionDetection(thatXVel,thatYVel,0,false);
		
	}
};

function EntityHit(attack, isCaptive)
{	
	var attackDamageActuallyDealt = 0;
	var corruptDamageActuallyDealt = 0;
	
	if(typeof(isCaptive)==='undefined') isCaptive = false;
	
	// Help out the AI by resetting the combat timer every time the bartender hits an enemy or an enemy hits the bartender
	if (this === player && attack.owner !== null && attack.owner.alliance === 2)
	{
		activeCombatTimer = 180;
	}
	else if (attack.owner !== null && attack.owner === player && this.alliance === 2)
	{
		activeCombatTimer = 180;
	}
	
	// If you're not already knocked out or the caller is your captor, then
	// calculate and apply damage
	if (!IsInvulnerable(this.state) || isCaptive)
	{
		// Face your attacker
		if (attack.positionOwner !== null && this.state !== States.Snared)
		{
			if (attack.positionOwner.posX < this.posX)
				this.facing = -1;
			else
				this.facing = 1;
		}
		else if (this.state !== States.Snared)
		{
			if (attack.attackbox.centerX < this.posX && this.state !== States.Snared)
				this.facing = -1;
			else
				this.facing = 1;
		}
		
		// Figure out which sound effect to play
		if (attack.damageDealt > 0)
		{	
			if (attack.owner === player)
				this.polite = false;
			
			this.vibrateHitstunTimer = 15;
			
			if (attack.hitStunDealt > 0 && attack.hitStunDealt < 0.333)
				this.lightHitSFX.Play(1.0);
			else if (attack.hitStunDealt >= 0.333 && attack.hitStunDealt < 0.666)
				this.moderateHitSFX.Play(1.0);
			else if (attack.hitStunDealt >= 0.666)
				this.hardHitSFX.Play(1.0);
		}
		
		if (this.intoxicatable)
		{
			this.drunkTimer += attack.intoxicationDealt;
			if (this.drunkTimer > this.maxDrunkTimer)
				this.drunkTimer = this.maxDrunkTimer;
			
			if (this.drunkTimer  < 0)
			{
				this.drunkTimer = 0;
			}
		}
		
		// Calculate hitstun, drain stamina, health, and corruption
		var hitStun = attack.hitStunDealt * this.maxHitStunFrames;
		if (this.knockoutable)
			this.stamina -= attack.staminaDrained;
		var wasAlive = this.health > 0;
		
		if (attack.alliance !== this.alliance || this.alliance === 0)
		{
			attackDamageActuallyDealt = clamp(attack.damageDealt,0,this.health);
			if (attack.damageDealt < this.health)
				corruptDamageActuallyDealt = clamp(attack.corruptionDealt,0,this.health-attackDamageActuallyDealt);
				
			this.health -= attack.damageDealt;

			if (this.corruptable)
				this.health -= attack.corruptionDealt;
		}
		
		// Don't allow stats to drain past zero
		if (this.stamina < 0)
			this.stamina = 0;
		if (this.health < 0)
			this.health = 0;
		
		// State transition priority from lowest to highest
		// Hitstun < Knockout < CorruptionTransform
		
		// If stamina or health are zero and this entity isn't a captive,
		// transition into the knockout animation
		if ((this.stamina === 0 || this.health === 0) && !IsCaptive(this.state) && (this.corruptable || this.knockoutable))
		{
			
			this.stamina = 0;	// Set stamina to zero so the knockout animation completes
			
			if (attack.corruptionDealt > 0 && this.corruptable && this.health === 0)
			{
				if (this.hitSFX !== null && this.hitSFXDebounce === 0)
				{
					if (this.drunkTimer > 0 && this.hitDrunkSFX !== null)
						this.hitDrunkSFX.Play(1.0);
					else
						this.hitSFX.Play(1.0); 
					this.hitSFXDebounce = 20;
				}
				this.ChangeState(States.CorruptionTransform);
			}
			else if (this.knockoutable)
			{
				if (this.knockoutSFX !== null && this.hitSFXDebounce === 0)
				{
					this.knockoutSFX.Play(1.0); 
					this.hitSFXDebounce = 60;
				}
				this.ChangeState(States.KnockedOut);
				if (this.ai !== null)
					this.ai.Flush();
			}
				
			this.hitStunFrames = 0;
			
			// Figure out where the attack came from and give the
			// Joe a push in that direction.
			if (attack.positionOwner !== null)
			{
				if (attack.positionOwner.posX < this.posX)
					this.velX += 15 * attack.knockbackMultiplier;
				else
					this.velX -= 15 * attack.knockbackMultiplier;
			}
			else
			{
				if (attack.attackbox.centerX < this.posX)
					this.velX += 15 * attack.knockbackMultiplier;
				else
					this.velX -= -15 * attack.knockbackMultiplier;
			}
			
			// Pop up into the air a bit
			this.velZ += 25 * attack.knockbackMultiplierZ;
			
		}
		// If this wasn't a knockout but there was some hitstun, transition into hitstun
		else if (hitStun > 0 && this.stunnable)
		{
			if (this.hitSFX !== null && this.hitStunFrames === 0 && this.hitSFXDebounce === 0)
			{
				if (this.drunkTimer > 0 && this.hitDrunkSFX !== null)
					this.hitDrunkSFX.Play(1.0);
				else
					this.hitSFX.Play(1.0); 
				this.hitSFXDebounce = 20;
			}
			
			this.hitStunFrames = hitStun;
			if (IsCaptive(this.state))
			{
				if (IsCaptiveVulnerable(this.state))
					this.ChangeState(States.CaptiveHitStun);
			}
			else if (this.state !== States.Snared)
				this.ChangeState(States.HitStun);
		}
		
		// If the attack dealt physical damage, spawn some hitsparks
		if (attack.damageDealt > 0 && !isCaptive)
		{
			var posZ = attack.visualContactZ;
			if (attack.positionOwner !== null)
				posZ+=attack.positionOwner.posZ;
			var sparks = new HitSpark(this, 0, posZ);
			// Size them based on stamina drained.
			sparks.scale = 2.8 + attack.staminaDrained * 2;
			level.entities.AddEffect(sparks);
		}
		
		// If the attack dealt smoke damage, spawn some puffs of smoke
		if (attack.corruptionDealt > 0 && this.corruptable && this.smokeHitEffectCounter === 0)
		{
			this.vibrateHitstunTimer = 5;
			level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,this.posZ + 200,180,150,1.0));
			this.smokeHitEffectCounter = 20;
		}
		
		// Finally, notify the attack if anything connected
		if ((attack.corruptionDealt > 0 && this.corruptable) || attack.damageDealt > 0  || hitStun > 0)
		{
			if (this.showDamageMeter)
				enemyinfo.NotifyHit(this); // Notify the enemy health popup
			attack.NotifyDamage(this, attackDamageActuallyDealt, corruptDamageActuallyDealt); // Notify the attack that it connected

		}
		
	}
	// If invulnerable, still process corruption damage only
	else if (!IsCorrupt(this.state))
	{		
		corruptDamageActuallyDealt = clamp(attack.corruptionDealt,0,this.health);
		this.health = clamp(this.health-attack.corruptionDealt,0,this.health);

		// Finally, notify the attack if anything connected
		if (attack.corruptionDealt > 0 && this.corruptable)
		{
			
			// If the attack dealt smoke damage, spawn some puffs of smoke
			if (this.smokeHitEffectCounter === 0)
			{
				this.vibrateHitstunTimer = 5;
				level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,this.posZ + 200,180,150,1.0));
				this.smokeHitEffectCounter = 20;
			}
		
			if (!IsCaptive(this.state) && this.health === 0)
			{
				this.ChangeState(States.CorruptionTransform);
			}
			
			if (this.showDamageMeter)
				enemyinfo.NotifyHit(this); // Notify the enemy health popup
				
			if (wasAlive)
				attack.NotifyDamage(this, 0, corruptDamageActuallyDealt); // Notify the attack that it connected
		}
	}
	
};

function EntityCapture(captor)
{
	
	// Notify the health bar overlay that you've been hit
	if (this.showDamageMeter)
		enemyinfo.NotifyHit(this);

	if (this.state === States.Corrupt || this.state === States.PreCorrupt)
	{
		this.ChangeState(States.CorruptPrepareBeforeSex);
		return this;
	}
	else
	{
		// If you're not already knocked out...
		if (this.state !== States.KnockedOut)
		{
			if (this.grabbedSFX !== null)
			{
				this.grabbedSFX.Play(1.0); 
			}
				
			this.CancelAttack();
			this.ChangeState(States.Captive);
			if (this.ai !== null)
				this.ai.Flush();
			return this;
		}
	}
	return null;
};

function EntityRelease(captor)
{
	this.prepareForThrow = false;
	
	// Fix a bug with objects carried across boundaries
	level.entities.Remove(this);
	level.entities.AddEntity(this);
	
	// Starting from the captor's location, try to slide into the current location.
	var deltaX = this.posX - captor.posX;
	var deltaY = this.posY - captor.posY;
	var deltaZ = this.posZ - captor.posZ;
	this.posX = captor.posX;
	this.posY = captor.posY;
	this.posZ = captor.posZ;
	this.CollisionDetection(deltaX,deltaY,deltaZ,false);
	
	if (this.state === States.CaptiveSexBottom)
	{
		this.ChangeState(States.CorruptOrgasmAfterSex);
	}
	else
	{
		var hitStun = 0.5 * this.maxHitStunFrames;
		if (hitStun > 0)
		{
			this.animationModel.Reset("hitstun");
			this.hitStunFrames = hitStun;
			this.ChangeState(States.HitStun);
		}
	}
};

function EntityWatchSex(frames)
{
	this.watchingSex = true;
	this.watchingSexFrames = frames;
};

function EntityDoneWatchingSex()
{
	this.watchingSex = false;
	this.watchingSexFrames = 0;
};

function EntityChangeAlliance(newAlliance)
{
	this.alliance = newAlliance;
};

function EntityRequestAttackPermission(attackingEntity)
{
	//this.leftSideAttackers = [];
	//this.rightSideAttackers = [];
	//this.maxAttackersPerSide = 2;
	
	// First, decide which side is primary and which is secondary
	var primaryCollection, secondaryCollection;
	var primarySide, secondarySide;
	if (this.posX > attackingEntity.posX)
	{
		primarySide = -1;
		secondarySide = 1;
		primaryCollection = this.leftSideAttackers;
		secondaryCollection = this.rightSideAttackers;
	}
	else
	{
		primarySide = 1;
		secondarySide = -1;
		primaryCollection = this.rightSideAttackers;
		secondaryCollection = this.leftSideAttackers;
	}
	
	// Check if the entity already has permission. If so, release it...
	this.ReleaseAttackPermission(attackingEntity)
		
	// Check if the primary collection has an open spot
	if (primaryCollection.length < this.maxAttackersPerSide)
	{
		primaryCollection.push(attackingEntity);
		return primarySide;
	}
	
	// Check if the primary collection has an open spot
	if (secondaryCollection.length < this.maxAttackersPerSide)
	{
		secondaryCollection.push(attackingEntity);
		return secondarySide;
	}
	
	// If the attacking entity is not polite, don't bother respecting limits
	if (!attackingEntity.polite)
	{
		// +1 priority to the preferred side
		if ((primaryCollection.length) <= (secondaryCollection.length + 1))
		{
			primaryCollection.push(attackingEntity);
			return primarySide;
		}
		else
		{
			secondaryCollection.push(attackingEntity);
			return secondarySide;
		}
	}
	
	// If there are no open spots, deny permission by returning -2
	return -2;
};

function EntityReleaseAttackPermission(attackingEntity)
{
	// Check if the entity has permission in either list...
	var rightIndex = this.rightSideAttackers.indexOf(attackingEntity);
	var leftIndex = this.leftSideAttackers.indexOf(attackingEntity);
	
	if (rightIndex !== -1)
		this.rightSideAttackers.splice(rightIndex, 1);
	if (leftIndex !== -1)
		this.leftSideAttackers.splice(leftIndex, 1);
};

function EntityOnRemovalFromGame()
{
	if (this.ai !== null)
		this.ai.Flush();
	
	this.rightSideAttackers = [];
	this.leftSideAttackers = [];
};

