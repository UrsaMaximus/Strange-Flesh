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

GlobalResourceLoader.AddAudioResource("joe3_attack1","sound/joe/joe3_attack1.mp3");
GlobalResourceLoader.AddAudioResource("joe3_attack2","sound/joe/joe3_attack2.mp3");
//GlobalResourceLoader.AddAudioResource("joe3_attack3","sound/joe/joe3_attack3.mp3");

GlobalResourceLoader.AddAudioResource("joe3_grabbed1","sound/joe/joe3_grabbed1.mp3");
GlobalResourceLoader.AddAudioResource("joe3_grabbed2","sound/joe/joe3_grabbed2.mp3");
GlobalResourceLoader.AddAudioResource("joe3_grabbed3","sound/joe/joe3_grabbed3.mp3");

GlobalResourceLoader.AddAudioResource("joe3_hit1","sound/joe/joe3_hit1.mp3");
GlobalResourceLoader.AddAudioResource("joe3_hit2","sound/joe/joe3_hit2.mp3");
GlobalResourceLoader.AddAudioResource("joe3_hit3","sound/joe/joe3_hit3.mp3");

GlobalResourceLoader.AddAudioResource("joe3_shoulder1","sound/joe/joe3_shoulder1.mp3");
GlobalResourceLoader.AddAudioResource("joe3_shoulder2","sound/joe/joe3_shoulder2.mp3");
GlobalResourceLoader.AddAudioResource("joe3_shoulder3","sound/joe/joe3_shoulder3.mp3");


function Joe3()
{
	EntityInit.call(this);
	
	this.ai = new JoeAI(this);
	this.ai.enableGrab = true;
	
	this.regularNames = ["Amped Joe","Fiery Joe","Wild Joe"];
	this.corruptNames = ["Corrupted Joe"];
	var randName = Math.floor((Math.random() * this.regularNames.length));
	this.displayName = this.regularNames[randName];
	
	// SFX
	this.attackSFX = new RandomSoundCollection("joe3_attack{0}",2);
	this.grabbedSFX = new RandomSoundCollection("joe3_grabbed{0}",3);
	this.hitSFX = new RandomSoundCollection("joe3_hit{0}",3);
	this.knockoutSFX = new RandomSoundCollection("joe3_shoulder{0}",3);
	this.ejacSFX = GlobalResourceLoader.GetSound("joe1_ejac");
	this.smokeKissSFX = GlobalResourceLoader.GetSound("joe1_hit5");
	this.smokeKissFallSFX = GlobalResourceLoader.GetSound("joe1_hit4");
	
	// Combat flags
	this.alliance = 2;
	this.grabbable = true;
	this.fuckable = true;
	this.kissable = true;
	this.throwable = true;
	
	// Sex animation flags
	this.captivePrepareSexAnim = "preparesex/joe3";
	this.captiveBeforeSexAnim = "beforesex/joe3";
	this.captiveSexAnim = "sex/joe3";
	this.captiveAfterSexAnim = "aftersex/joe3";
	this.sexOffsetX = 119;
	this.sexOffsetY = -18;
	this.sexOffsetZ = 0;
	
	this.grabAdjustX = 20;
	this.grabAdjustY = 0;
	this.grabAdjustZ = -20;
	
	// Stats
	this.walkMaxVel = 5.8 + Math.random()*0.1;
	this.maxHitStunFrames = 50;
	this.maxJumpFrames = 5;
	this.maxHealth = 155;
	this.maxStamina = 1.0;
	this.stamina = this.maxStamina;
	this.staminaRecoveryPerFrame = 1.0 / (60 * 10);	// Stamina fully recovers in 10 seconds when not dazed
	this.staminaRecoveryPerFrameWhenKOed = 1.0 / (60 * 4);	// Stamina fully recovers in 4 seconds
	this.weight = 110;
	
	// Grab and release vars
	this.captive = null;
	this.grabX = 120;
	this.grabY = 0;
	this.grabZ = 10;
	
	// Orbs
	this.orbsOnDeath = 10;
	this.orbsAfterSex = 10;
	this.heathOrbsHeld = 0;
	this.corruptionOrbsHeld = 0;
	this.dominationOrbsHeld = 0;
	
	// Collision
	this.zHeight = this.scale * 120;
	this.collisionRadius = this.scale * 10;
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * 50 / 2,y:-this.scale * 20 / 2});
	this.hitRect.expandToFit({x:this.scale * 50 / 2,y:this.scale * 20 / 2});

	// Light punch is 0.6 seconds long, that's 36 frames total
	this.smashAttack = new Attack(this);
	this.smashAttack.attackbox.SetBounds(100,-28,300,28);
	this.smashAttack.animationTriggered = "attack";
	this.smashAttack.warmupframes = 35;
	this.smashAttack.attackFrames = 1;
	this.smashAttack.cooldownframes = 20;
	this.smashAttack.damageDealt = 35;
	this.smashAttack.staminaDrained = 0.8;
	this.smashAttack.visualContactZ = 96 * this.scale;
	this.smashAttack.hitStunDealt = 1.0;
	this.smashAttack.zHeight = 85 * this.scale;
	this.smashAttack.zSize = 40 * this.scale;
	
	// The grab blow attack is 30 frames long
	this.grabAttack = new Attack(this);
	this.grabAttack.alliance = 0; // Hit everyone
	this.grabAttack.attackbox.SetBounds(100,-28,300,28);
	this.grabAttack.animationTriggered = "grab";
	this.grabAttack.warmupframes = 15;
	this.grabAttack.attackFrames = 1;
	this.grabAttack.cooldownframes = 14;
	this.grabAttack.damageDealt = 0.0;
	this.grabAttack.corruptionDealt = 0.0;	
	this.grabAttack.staminaDrained = 0;
	this.grabAttack.hitStunDealt = 0.1;
	this.grabAttack.visualContactZ = 92 * this.scale;
	this.grabAttack.zHeight = 75 * this.scale;
	
	this.animationSetup();
};

Joe3.prototype.GetMoveMaxVelocity = function()
{		
		// Enforce velocity limits
		var maxVel = this.walkMaxVel;
		if (this.state === States.Run)
			maxVel = this.walkMaxVel * 2.0;
		else if (this.state === States.SmokeWalk)
			maxVel = this.walkMaxVel / 1.5;
		else if (this.state === States.Jump || this.state === States.Fall || this.state === States.FallHelpless)
			maxVel = this.walkMaxVel / 2.0;
		else if (this.state === States.Drag)
			maxVel = 0;
		return maxVel;
};

Joe3.prototype.editorProperties = ['displayName','alliance','health','orbsOnDeath', 'orbsAfterSex', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld'];
Joe3.prototype.runtimeProperties = ['newlySpawned','newlySpawnedTargetX','newlySpawnedTargetY','state','stateFrames','corrupted','recruited'];

Joe3.prototype.GetStaminaRecovery = function()
{
	if (IsInvulnerable(this.state))
		return this.staminaRecoveryPerFrameWhenKOed;
	else
		return this.staminaRecoveryPerFrame; // Stamina fully recovers in 5 seconds when not dazed
};

Joe3.prototype.DrawSprite = function()
{
	// Draw shadow
	ctx.globalAlpha = 0.4 * this.alpha;
	ctx.fillStyle = "#000000";
	var shadowScale = 500 / (this.posZ + 500);
	drawEllipse(0,0,shadowScale*290,shadowScale*90);

	ctx.globalAlpha = this.alpha;
	this.animationModel.DrawBase();
	this.DrawCaptive();
	this.animationModel.DrawDecorator(0);
	
	ctx.globalAlpha = 1.0;
	
	if (debug === 2 && this.ai != null)
		this.ai.Draw();
};

Joe3.prototype.DrawCaptive = function()
{
	if (this.captive !== null)
	{
		var extraOffsetX = 0;
		var extraOffsetY = 0;
		if (this.animationModel.GetState().lastDisplayedFrame !== null)
		{
			extraOffsetX = this.animationModel.GetState().lastDisplayedFrame.offsetX * this.scale;
			extraOffsetY = this.animationModel.GetState().lastDisplayedFrame.offsetY * this.scale;
		}
		
    	ctx.translate(this.captive.posX - this.posX + extraOffsetX*this.facing, this.captive.posY - this.posY + extraOffsetY);
		this.captive.DrawSprite();
		ctx.translate(-(this.captive.posX - this.posX + extraOffsetX*this.facing), -(this.captive.posY - this.posY + extraOffsetY));

	}
}

Joe3.prototype.UpdateState = function()
{
	var mag = Math.sqrt(Math.pow(this.velX,2)+Math.pow(this.velY,2));
	var ang = Math.atan2(this.velY,this.velX);
	
	// Do what needs to be done in each state and change the state if needed
	if (this.state === States.Walk)
	{
		if (mag < 2.6 && !this.controller.up && !this.controller.down && !this.controller.left && !this.controller.right)
		{
			if (this.watchingSex)
				this.animationModel.ChangeState("sexidle");
			else
				this.animationModel.ChangeState("idle");
		}
		else
		{
			if (this.watchingSex && !this.controller.up && !this.controller.down && !this.controller.left && !this.controller.right)
				this.animationModel.ChangeState("sexidle");
			else
				this.animationModel.ChangeState("walk");
		}
	
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		// Change to jump state
		if (this.controller.jumpActivate())
		{
			this.jumpFrames = 0;
			this.ChangeState(States.Jump);
		}
		
		// Change to attack state
		if (this.controller.punch && this.controller.punchFramesSinceKeydown < 6)
		{
			this.attack = this.smashAttack;
			this.attack.Attack();
			this.animationModel.ChangeState(this.attack.animationTriggered);
			this.ChangeState(States.BasicAttack);
		}
		
		else if (this.controller.grab && this.controller.grabFramesSinceKeydown < 6)
		{
			this.attack = this.grabAttack;
			this.attack.Attack();
			this.animationModel.ChangeState(this.attack.animationTriggered);
			this.ChangeState(States.Grab);
		}
		
		// If the ground is missing, go to the fall helpless state
		if (this.posZ > 0)
		{
			this.ChangeState(States.FallHelpless);
		}
		
		if (this.recruitedFrames > this.recruitmentTime)
		{
			this.unrecruit();
			this.ChangeState(States.LoseBoner);
		}
		
	}
	else if (this.state === States.LoseBoner)
	{
		this.animationModel.ChangeState("loseboner");
		(this.animationModel.AnimationIsComplete("loseboner"))
		{
			this.ChangeState(States.Walk);
		}
	}
	else if (this.state === States.Jump)
	{
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		this.animationModel.ChangeState("jump");
		if (this.controller.jump && this.jumpFrames < this.maxJumpFrames)
		{
			this.jumpFrames += 1;
			this.accelZ = 10.0;
		}
		else
		{
			this.ChangeState(States.Fall);
		}
	}
	else if (this.state === States.Fall)
	{
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		if (this.velZ > 0)
			this.animationModel.ChangeState("jump");
		else
			this.animationModel.ChangeState("fall");
		
		if (this.posZ <= 0)
			this.ChangeState(States.Walk);
	}
	else if (this.state === States.FallHelpless)
	{
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		this.animationModel.ChangeState("fall");
		if (this.posZ <= 0)
			this.ChangeState(States.Walk);
	}
	else if (this.state === States.BasicAttack)
	{
		if (this.stateFrames === 30)
			this.attackSFX.Play(2.0);
		this.ChangeStateOnAttackComplete(States.Walk);
	}
	else if (this.state === States.Grab)
	{
		if (this.stateFrames === 30)
			this.attackSFX.Play(2.0);
			
		this.orderBonus = -30;
		if (this.grabAttack.connected && this.captive === null && this.grabAttack.firstHitEntity !== null)
		{
			var closest = this.GetGrabCandidate();
			this.grabAttack.firstHitEntity = closest;
			if (closest !== null)
			{
				var attemptedCaptive = this.grabAttack.firstHitEntity.Capture(this);
				if (attemptedCaptive !== null)
				{
					this.captive = attemptedCaptive;
					//this.heftSFX.Play(1.5);
				}
			}
		}
		
		if (this.captive !== null && this.stateFrames > 20)
		{
			this.captive.posX = crawlValue(this.captive.posX, this.posX + (this.grabX + this.captive.grabAdjustX) * this.facing, 35.0);
			this.captive.posY = crawlValue(this.captive.posY,this.posY + this.grabY + this.captive.grabAdjustY,35.0);
			this.captive.posZ = crawlValue(this.captive.posZ, this.posZ + this.grabZ + this.captive.grabAdjustZ, 35.0);
			this.captive.facing = -this.facing;
		}
		
		if (this.stateFrames > 17 && this.captive === null)
		{
			this.ChangeState(States.GrabFail);
		}
		
		// Check if we have a captive. If so, take them captive
		if (this.stateFrames === 30 && this.captive !== null)
		{
			this.ChangeState(States.Drag);
		}
		
	}
	else if (this.state === States.Drag)
	{
		this.lastWalkState = this.state;
		
		if (this.captive !== null)
		{
			this.captive.posX = this.posX + (this.grabX  + this.captive.grabAdjustX) * this.facing;
			this.captive.posY = this.posY + this.grabY + this.captive.grabAdjustY;
			this.captive.posZ = this.posZ + this.grabZ  + this.captive.grabAdjustZ;
			if (this.captive === player)
				this.captive.facing = this.facing;
			else
				this.captive.facing = -this.facing;
		}

		this.animationModel.ChangeState("drag");
	
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		// If we let go of grab of the person we are holding is dead
		if (this.controller.grabDeactivate() || this.captive === null || (this.captive.knockoutable && this.captive.health === 0))
		{
			this.ChangeState(States.Release);
		}
	}
	else if (this.state === States.GrabFail)
	{
		this.animationModel.ChangeState("grabfail");
		if (this.animationModel.animations["grabfail"].mainAnimation.done)
			this.ChangeState(States.Walk);
	}
	else if (this.state === States.Release)
	{
		this.animationModel.ChangeState("release");

		if (this.captive !== null && this.stateFrames === 3)
		{
			this.captive.Release(this);
			this.captive = null;
		}
		if (this.stateFrames === 20)
			this.ChangeState(States.Walk);
	}
	else if (this.state === States.HitStun)
	{
		if (this.stateFrames === 1)
			this.animationModel.Reset("hitstun");
		this.animationModel.ChangeState("hitstun");
		this.hitStunFrames -= 1.0;
		
		this.CancelAttack();
		
		if (this.hitStunFrames <= 0)
		{
			this.hitStunFrames = 0;
			this.ChangeState(States.Walk);
		}
	}
	else if (this.state === States.CaptiveHitStun)
	{
		if (this.stateFrames === 1)
			this.animationModel.Reset("captivehitstun");
		this.animationModel.ChangeState("captivehitstun");
		this.hitStunFrames -= 3.0;
		
		this.CancelAttack();
		
		if (this.hitStunFrames <= 0)
		{
			this.hitStunFrames = 0;
			this.ChangeState(States.Captive);
		}
	}
	else if (this.state === States.KnockedOut)
	{
		this.animationModel.ChangeState("knockout");
		
		this.CancelAttack();
		
		if (this.stateFrames === 1)
			this.stamina = 0.0	
		
		if (this.health <= 0 && this.stateFrames > this.framesBeforeDeath)
		{
			level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,player.posZ+25,200,100,2.0));
			this.ReleaseOrbs();
			this.Die();
		}
		
		if (this.stamina >= 1.0 && this.health > 0)
		{
			this.ChangeState(States.GetUp);
		}
	}
	else if (this.state === States.Thrown)
	{
		this.animationModel.ChangeState("thrown");
		
		this.CancelAttack();
		
		if (this.health <= 0 && this.stateFrames > 50)
		{
			level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,player.posZ+25,200,100,2.0));
			this.ReleaseOrbs();
			this.Die();
		}
		
		if (this.stamina >= 1.0)
		{
			if (this.health > 0)
			{
				this.ChangeState(States.GetUp);
			}
		}
	}
	else if (this.state === States.GetUp)
	{
		this.animationModel.ChangeState("getup");
		if (this.animationModel.AnimationIsComplete("getup"))
			this.ChangeState(States.Walk);
	}
	else if (this.state === States.CaptiveSmokeKiss)
	{
		this.animationModel.ChangeState("captivesmokekiss");
	}
	else if (this.state === States.FallAfterSmokeKiss)
	{
		if (this.stateFrames === 1)
		{
			var smoke = new EffectAnimation(this.blowSmokeAnim, this, true);
			level.entities.AddEffect(smoke);
		}
		this.animationModel.ChangeState("fallaftersmokekiss");
		if (this.animationModel.AnimationIsComplete("fallaftersmokekiss"))
		{	
			// Joe3 cannot be recruited
			//this.recruit();
			this.ChangeState(States.Walk);
		}
	}
	else if (this.state === States.CorruptionTransform)
	{
		this.animationModel.ChangeState("corruptiontransform");
		this.corrupt();
		if (this.stateFrames <= 1 && this.lastState !== States.KnockedOut)
		{
			//var fallsmoke = new SmokeKissFallSmoke(this);
			//level.entities.AddEffect(fallsmoke);
		}
		else if (this.stateFrames <= 1 && this.lastState === States.KnockedOut)
		{
			this.animationModel.SetAllPositions("corruptiontransform", 7/18);
		}
		
		if (this.animationModel.AnimationIsComplete("corruptiontransform"))
		{
			this.ChangeState(States.Corrupt);
			this.facing = -this.facing;
			this.animationModel.ChangeState("corrupt");
		}
	}
	else if (this.state === States.Corrupt)
	{
		this.corrupt();
		this.animationModel.ChangeState("corrupt");
		
		var fapSpeed = 1.0 - 0.5*normalizeValue(this.stateFrames, 1, 700);
		this.animationModel.SetDurationInSeconds("corrupt",fapSpeed);
		
		if (fapSpeed <= 0.5)
		{
			this.ChangeState(States.CorruptOrgasm);
		}
	}
	else if (this.state === States.CorruptOrgasm)
	{
		this.animationModel.ChangeState("faporgasm");
		
		if (this.animationModel.AnimationLoopHitEnd("faporgasm"))
		{
			level.entities.AddEffect(
			  new SmokeExplosion(this.posX - 50 * this.facing,
			                     this.posY,
			                     player.posZ + 150,
			                     150, 150, 2.0) );
			this.ReleaseOrbs();
			this.Die();
		}
	}
	else if (this.state === States.Captive)
	{
		if (this.prepareForThrow)
			this.animationModel.ChangeState("thrown");
		else
			this.animationModel.ChangeState("captive");
	}
	else if (this.state === States.CorruptPrepareBeforeSex)
	{
		if (this.sexType == 0)
			this.animationModel.ChangeState("beforesex");
	}
	else if (this.state === States.CaptiveSexBottom)
	{
		// Nothing to do, bartender in control
	}
	else if (this.state === States.CorruptOrgasmAfterSex)
	{
		this.animationModel.ChangeState("aftersex");
		
		if (this.animationModel.AnimationIsComplete("aftersex"))
		{
			level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,player.posZ+25,200,100,2.0));
			this.ReleaseOrbs();
			this.Die();
		}
	}
	else if (this.state === States.Dying)
	{
		this.orderBonus = 30;
		
		if (this.stateFrames > 60)
			this.alpha = crawlValue(this.alpha, 0, 0.01);
		
		if (this.alpha === 0)
			this.Die();
	}
	
	// If for some reason we have a captive in a state that we should not, release it.
	if (this.captive !== null && this.state !== States.Grab && this.state !== States.Drag && 
		this.state !== States.Throw && this.state !== States.CaptivePunch && this.state !== States.CaptiveFinish && 
		this.state !== States.SmokeKiss && this.state !== States.CaptiveSexTop && this.state !== States.Release)
	{
		this.captive.Release(this);
		this.captive = null;
	}
};

Joe3.prototype.GetGrabCandidate = function()
{
	// Look through all the entities for one that is fuckable and within range
	var entitiesInRange = this.grabAttack.GetEntitiesInRange();
	var nearestEntity = null;
	var nearestdistance = 1000;
	
	for (var i=0; i < entitiesInRange.length; i++)
	{
		if (entitiesInRange[i].grabbable && !IsInvulnerable(entitiesInRange[i].state))
		{
			var dist = distanceActorToActor(this,entitiesInRange[i]);
			if (dist < nearestdistance)
			{
				nearestdistance = dist;
				nearestEntity = entitiesInRange[i];
			}
		}
	}
	
	return nearestEntity;
};

Joe3.prototype.recruit = function(captor)
{
	if (false && !this.recruited)
	{
		this.ChangeAlliance(captor.alliance)
		
		this.recruited = true;
		this.lastDisplayName = this.displayName;
		this.displayName = "Horny Joe";
		this.animationModel.ApplyPrefix("boner");
	}
};

Joe3.prototype.unrecruit = function()
{
	if (this.recruited)
	{
		this.recruited = false;
		this.displayName = this.lastDisplayName;
		this.ChangeAlliance(2);
		this.animationModel.ClearPrefix("boner");
	}
};

Joe3.prototype.corrupt = function()
{
	if (!this.corrupted)
	{
		this.corrupted = true;
		if (!this.recruited)
		{
			var randName = Math.floor((Math.random() * this.corruptNames.length));
			this.displayName = this.corruptNames[randName];
		}
	}
};

// All the animation frames associated with the Joe3.
GlobalResourceLoader.AddImageResource("sheet_Joe3_Normal","images/joe3/sheet_Joe3_Normal.txt");
GlobalResourceLoader.AddImageResource("sheet_Joe3_Corrupt","images/joe3/sheet_Joe3_Corrupt.txt");
GlobalResourceLoader.AddImageResource("sheet_Bartender_Joe3Sex_Anal","images/bartender/sheet_Bartender_Joe3Sex_Anal.txt");

Joe3.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;						// This animation loops
	idleAnim.inheritFacing = 1;					// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddFrame("joe3/idle");		// All the frames and their timing info
	idleAnim.SetDurationInSeconds(1.0);				// Set how long one loop takes (in seconds)
	
	// Add the idle animation and all its transitions to the idle animation state
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	
		// Define the corruption TF animation
	var sexidleAnim = new Animation(this);
	sexidleAnim.repeat = 1;						// This animation is one-shot
	sexidleAnim.inheritFacing = 1;					// It inherits the player's facing property
	sexidleAnim.AddSequentialFrames("joe3/sexidle{0}",1,8);
	sexidleAnim.AddFrame("joe3/sexidle7");
	sexidleAnim.SetDurationInSeconds(1.5); // This is 8 fps
	
	// Loop around frames 6-9
	sexidleAnim.SetLoopByFrame(5,8);
	
	var sexidleState = new AnimationState();
	sexidleState.SetMainAnimation(sexidleAnim);
	this.animationModel.AddState("sexidle",sexidleState);
	
	// Define a transition from walk to idle
	var walkToIdle = new Animation(this);
	walkToIdle.repeat = 3;
	walkToIdle.inheritFacing = 1;					// It inherits the player's facing property
	walkToIdle.matchPosition = true;
	walkToIdle.AddFrame("joe3/walk1")
	walkToIdle.SetDurationInSeconds(0.2);
	idleState.AddTransitionAnimation("walk", walkToIdle); 
	
	// Add all the animation states to the animations collection
	this.animationModel.AddState("idle",idleState);
	
	
	// Define the walk animation
	var walkAnim = new Animation(this);
	walkAnim.repeat = 1;						// This animation loops
	walkAnim.dynamicRate = 1;					// This animation moves faster with player speed
	walkAnim.inheritFacing = 1;					// It inherits the player's facing property
	walkAnim.matchPosition = true;
	walkAnim.AddFrame("joe3/walk1");		// All the frames and their timing info
	walkAnim.AddFrame("joe3/walk2");
	walkAnim.AddFrame("joe3/walk3");
	walkAnim.AddFrame("joe3/walk4");
	walkAnim.AddFrame("joe3/walk5");
	walkAnim.AddFrame("joe3/walk6");
	walkAnim.AddFrame("joe3/walk7");
	walkAnim.AddFrame("joe3/walk8");
	walkAnim.SetDurationInSeconds(5.0);
	var walkState = new AnimationState();
	walkState.SetMainAnimation(walkAnim);
	this.animationModel.AddState("walk", walkState);
	
	
	
	var grabForearm = new Animation(this);
	grabForearm.inheritFacing = 1;
	grabForearm.AddBlankFrame();
	grabForearm.AddBlankFrame();
	grabForearm.AddBlankFrame();
	grabForearm.AddFrame("joe3/grab4arm");	
	grabForearm.AddFrame("joe3/grab5arm");	
	grabForearm.AddFrame("joe3/grab6arm");	
	grabForearm.AddFrame("joe3/grab7arm");	
	grabForearm.SetDurationInSeconds(0.5);
	
	var grabAnim = new Animation(this);
	grabAnim.inheritFacing = 1;					// It inherits the player's facing property
	grabAnim.AddFrame("joe3/grab1");					// All the frames and their timing info
	grabAnim.AddFrame("joe3/grab2");
	grabAnim.AddFrame("joe3/grab3");
	grabAnim.AddFrame("joe3/grab4");
	grabAnim.AddFrame("joe3/grab5");
	grabAnim.AddFrame("joe3/grab6");
	grabAnim.AddFrame("joe3/grab7");
	grabAnim.SetDurationInSeconds(0.5);
	var grabAnimState = new AnimationState();
	grabAnimState.SetMainAnimation(grabAnim);
	grabAnimState.AddDecoratorAnimation(grabForearm);
	this.animationModel.AddState("grab", grabAnimState);
	
	var grabfailAnim = new Animation(this);
	grabfailAnim.inheritFacing = 1;					// It inherits the player's facing property
	grabfailAnim.AddFrame("joe3/grab3");					// All the frames and their timing info
	grabfailAnim.AddFrame("joe3/grab2");
	grabfailAnim.AddFrame("joe3/grab1");
	grabfailAnim.SetDurationInSeconds(0.3);
	var grabfailAnimState = new AnimationState();
	grabfailAnimState.SetMainAnimation(grabfailAnim);
	this.animationModel.AddState("grabfail", grabfailAnimState);
	
	var releaseAnim = new Animation(this);
	releaseAnim.inheritFacing = 1;					// It inherits the player's facing property
	releaseAnim.AddFrame("joe3/grab3");					// All the frames and their timing info
	releaseAnim.AddFrame("joe3/grab2");
	releaseAnim.AddFrame("joe3/grab1");
	releaseAnim.SetDurationInSeconds(0.25);
	var releaseAnimState = new AnimationState();
	releaseAnimState.SetMainAnimation(releaseAnim);
	this.animationModel.AddState("release", releaseAnimState);
	
	
	var dragIdleForearm = new Animation(this);
	dragIdleForearm.inheritFacing = 1;
	dragIdleForearm.AddFrame("joe3/grab7arm");	
	dragIdleForearm.SetDurationInSeconds(0.5);
	
	var dragIdleAnim = new Animation(this);
	dragIdleAnim.inheritFacing = 1;					// It inherits the player's facing property
	dragIdleAnim.AddFrame("joe3/grab7");
	dragIdleAnim.SetDurationInSeconds(0.5);
	var dragIdleAnimState = new AnimationState();
	dragIdleAnimState.SetMainAnimation(dragIdleAnim);
	dragIdleAnimState.AddDecoratorAnimation(dragIdleForearm);
	this.animationModel.AddState("drag", dragIdleAnimState);
	
	
	
	// Define the hitstun animation
	var hitStunAnim = new Animation(this);
	hitStunAnim.repeat = 0;							// This animation is one-shot
	hitStunAnim.inheritFacing = 1;					// It inherits the player's facing property
	hitStunAnim.matchPosition = false;
	hitStunAnim.AddFrame("joe3/hitstun");		// All the frames and their timing info
	//hitStunAnim.AddFrame("joe3hitstun");		// All the frames and their timing info
	//hitStunAnim.AddFrame("joe3idle");		// All the frames and their timing info
	hitStunAnim.SetDurationInSeconds(this.maxHitStunFrames / 60.0);
	var hitStunState = new AnimationState();
	hitStunState.SetMainAnimation(hitStunAnim);
	this.animationModel.AddState("hitstun",hitStunState);
	
	// Define the captivehitstun animation
	var captiveHitStunAnim = new Animation(this);
	captiveHitStunAnim.repeat = 0;							// This animation is one-shot
	captiveHitStunAnim.inheritFacing = 1;					// It inherits the player's facing property
	captiveHitStunAnim.matchPosition = false;
	captiveHitStunAnim.AddFrame("joe3/hitstun");		// All the frames and their timing info
	captiveHitStunAnim.SetDurationInSeconds(0.18);
	var captiveHitStunState = new AnimationState();
	captiveHitStunState.SetMainAnimation(captiveHitStunAnim);
	this.animationModel.AddState("captivehitstun",captiveHitStunState);
	
	
	// Define the knockout animation
	var knockoutAnim = new Animation(this);
	knockoutAnim.repeat = 0;							// This animation is one-shot
	knockoutAnim.inheritFacing = 1;					// It inherits the player's facing property
	knockoutAnim.matchPosition = false;
	knockoutAnim.AddFrame("joe3/knockout1");		// All the frames and their timing info
	knockoutAnim.AddFrame("joe3/knockout2");	
	knockoutAnim.AddFrame("joe3/knockout3");	
	knockoutAnim.AddFrame("joe3/knockout4");	
	knockoutAnim.AddFrame("joe3/knockout5");	
	knockoutAnim.SetDurationInSeconds(0.6);
	var knockoutState = new AnimationState();
	knockoutState.SetMainAnimation(knockoutAnim);
	this.animationModel.AddState("knockout",knockoutState);
	
	// Define the knockout animation
	var getupAnim = new Animation(this);
	getupAnim.repeat = 0;							// This animation is one-shot
	getupAnim.inheritFacing = 1;					// It inherits the player's facing property
	getupAnim.matchPosition = false;
	getupAnim.AddSequentialFrames("joe3/getup{0}",1,7);		// All the frames and their timing info
	getupAnim.SetDurationInSeconds(0.6);
	var getupState = new AnimationState();
	getupState.SetMainAnimation(getupAnim);
	this.animationModel.AddState("getup",getupState);
	
	// Define the thrown animation
	var thrownAnim = new Animation(this);
	thrownAnim.repeat = 0;							// This animation is one-shot
	thrownAnim.inheritFacing = 1;					// It inherits the player's facing property
	thrownAnim.matchPosition = false;
	thrownAnim.AddFrame("joe3/knockout2");	
	thrownAnim.AddFrame("joe3/knockout3");	
	thrownAnim.AddFrame("joe3/knockout4");	
	thrownAnim.AddFrame("joe3/knockout5");
	thrownAnim.SetDurationInSeconds(0.6);
	var thrownState = new AnimationState();
	thrownState.SetMainAnimation(thrownAnim);
	this.animationModel.AddState("thrown",thrownState);
	
	// Define the knockout animation
	var attackAnim = new Animation(this);
	attackAnim.repeat = 0;							// This animation is one-shot
	attackAnim.inheritFacing = 1;					// It inherits the player's facing property
	attackAnim.matchPosition = false;
	attackAnim.AddFrame("joe3/attack1");		// All the frames and their timing info
	attackAnim.AddFrame("joe3/attack2");	
	attackAnim.AddFrame("joe3/attack3");	
	attackAnim.AddFrame("joe3/attack4");	
	attackAnim.AddFrame("joe3/attack5");
	attackAnim.AddFrame("joe3/attack6");	
	attackAnim.AddFrame("joe3/attack7");	
	attackAnim.AddFrame("joe3/attack8");	
	attackAnim.AddFrame("joe3/attack9");	
	attackAnim.SetDurationInSeconds(0.8);
	var attackState = new AnimationState();
	attackState.SetMainAnimation(attackAnim);
	this.animationModel.AddState("attack",attackState);
	
	// Define the captive animation
	var captiveAnim = new Animation(this);
	captiveAnim.repeat = 0;							// This animation is one-shot
	captiveAnim.inheritFacing = 1;					// It inherits the player's facing property
	captiveAnim.matchPosition = false;
	captiveAnim.AddFrame("joe3/captive");		// All the frames and their timing info
	captiveAnim.SetDurationInSeconds(0.6);
	var captiveState = new AnimationState();
	captiveState.SetMainAnimation(captiveAnim);
	this.animationModel.AddState("captive",captiveState);
	
	
	// Define the captive smoke kiss animation
	var captiveSmokeKissAnim = new Animation(this);
	captiveSmokeKissAnim.repeat = 0;						// This animation is one-shot
	captiveSmokeKissAnim.inheritFacing = 1;					// It inherits the player's facing property
	captiveSmokeKissAnim.HoldFrame("joe3/captive",10);
	captiveSmokeKissAnim.AddFrame("joe3/smokekiss1"); // First frame of the actual kiss
	captiveSmokeKissAnim.AddFrame("joe3/smokekiss2");
	captiveSmokeKissAnim.AddFrame("joe3/smokekiss3");
	captiveSmokeKissAnim.AddFrame("joe3/smokekiss4");
	captiveSmokeKissAnim.AddFrame("joe3/smokekiss5");
	captiveSmokeKissAnim.AddFrame("joe3/smokekiss1");
	captiveSmokeKissAnim.AddFrame("joe3/smokekiss2");
	captiveSmokeKissAnim.AddFrame("joe3/smokekiss3");
	captiveSmokeKissAnim.AddFrame("joe3/smokekiss4");
	captiveSmokeKissAnim.AddFrame("joe3/smokekiss5");
	captiveSmokeKissAnim.HoldFrame("joe3/captive",2);
	captiveSmokeKissAnim.SetDurationInSeconds(3.0);
	var captiveSmokeKissState = new AnimationState();
	captiveSmokeKissState.SetMainAnimation(captiveSmokeKissAnim);
	this.animationModel.AddState("captivesmokekiss",captiveSmokeKissState);
	
	// Define the fall after smoke kiss animation
	var smokeKissFailAnim = new Animation(this);
	smokeKissFailAnim.repeat = 0;
	smokeKissFailAnim.inheritFacing = 1;				
	smokeKissFailAnim.AddSequentialFrames("joe3/smokekissfail{0}",1,13);
	smokeKissFailAnim.SetDurationInSeconds(1.3);
	var fallAfterSmokeKissState = new AnimationState();
	fallAfterSmokeKissState.SetMainAnimation(smokeKissFailAnim);
	this.animationModel.AddState("fallaftersmokekiss",fallAfterSmokeKissState);
	
		// Define the fall after smoke kiss animation
	this.blowSmokeAnim = new Animation(this);
	this.blowSmokeAnim.repeat = 0;
	this.blowSmokeAnim.blendMode = "lighter"
	this.blowSmokeAnim.inheritFacing = 1;
	this.blowSmokeAnim.AddBlankFrames(7);
	this.blowSmokeAnim.AddSequentialFrames("joe3/blownsmoke{0}",1,7);
	this.blowSmokeAnim.MatchFramerate(smokeKissFailAnim);
	
	// Define the corruption TF animation
	var corruptionTFAnim = new Animation(this);
	corruptionTFAnim.repeat = 0;						// This animation is one-shot
	corruptionTFAnim.inheritFacing = 1;					// It inherits the player's facing property
	corruptionTFAnim.AddFrame("joe3/knockout1");		// All the frames and their timing info
	corruptionTFAnim.AddFrame("joe3/knockout2");	
	corruptionTFAnim.AddFrame("joe3/knockout3");	
	corruptionTFAnim.AddFrame("joe3/knockout4");	
	corruptionTFAnim.HoldFrame("joe3/knockout5",5);	
	corruptionTFAnim.AddSequentialFrames("joe3/corruption{0}",1,47);
	corruptionTFAnim.SetDurationInSeconds(7.0);
	
	var corruptionTFState = new AnimationState();
	corruptionTFState.SetMainAnimation(corruptionTFAnim);
	this.animationModel.AddState("corruptiontransform",corruptionTFState);
	
	// Define the corruption TF animation
	
	var corruptAnimIntro = new Animation(this);
	corruptAnimIntro.repeat = 0;						// This animation is bou
	corruptAnimIntro.inheritFacing = 1;					// It inherits the player's facing property
	corruptAnimIntro.AddSequentialFrames("joe3/corrupted{0}",1,3);
	corruptAnimIntro.SetDurationInSeconds(1.0);
	
	var corruptAnim = new Animation(this);
	corruptAnim.repeat = 1;						// This animation is bou
	corruptAnim.inheritFacing = 1;					// It inherits the player's facing property
	corruptAnim.AddSequentialFrames("joe3/corrupted{0}",4,7);
	corruptAnim.SetDurationInSeconds(1.0);
	
	var corruptState = new AnimationState();
	corruptState.AddTransitionAnimation("corruptiontransform",corruptAnimIntro);
	corruptState.SetMainAnimation(corruptAnim);
	this.animationModel.AddState("corrupt",corruptState);
	
	
	// Define the fap orgasm animation
	var faporgasmAnimIntro = new Animation(this);
	faporgasmAnimIntro.repeat = 0;
	faporgasmAnimIntro.inheritFacing = 1;					// It inherits the player's facing property
	faporgasmAnimIntro.AddSequentialFrames("joe3/orgasm{0}",1,14);
	faporgasmAnimIntro.SetDurationInSeconds(1.9);
	
	var faporgasmAnim = new Animation(this);
	faporgasmAnim.repeat = 1;						// This animation is bou
	faporgasmAnim.inheritFacing = 1;					// It inherits the player's facing property
	faporgasmAnim.AddSequentialFrames("joe3/orgasm{0}",15,18);
	faporgasmAnim.MatchFramerate(faporgasmAnimIntro);
	
	var faporgasmState = new AnimationState();
	faporgasmState.AddTransitionAnimation("corrupt", faporgasmAnimIntro);
	faporgasmState.SetMainAnimation(faporgasmAnim);
	this.animationModel.AddState("faporgasm",faporgasmState);
	
	// Define the before and after sex animations
	var beforeSexAnim = new Animation(this);
	beforeSexAnim.repeat = 0;
	beforeSexAnim.inheritFacing = 1;					// It inherits the player's facing property
	beforeSexAnim.AddSequentialFrames( "joe3/sex/before{0}", 1,8);
	beforeSexAnim.SetDurationInSeconds(0.8);
	var beforeSexState = new AnimationState();
	beforeSexState.SetMainAnimation(beforeSexAnim);
	this.animationModel.AddState("beforesex",beforeSexState);
	
	var afterSexAnim = new Animation(this);
	afterSexAnim.repeat = 0;
	afterSexAnim.inheritFacing = 1;					// It inherits the player's facing property
	afterSexAnim.AddSequentialFrames( "joe3/sex/after{0}", 1,15);
	afterSexAnim.SetDurationInSeconds(1.5);
	var afterSexState = new AnimationState();
	afterSexState.SetMainAnimation(afterSexAnim);
	this.animationModel.AddState("aftersex",afterSexState);
};

Joe3.prototype.ChangeAlliance = function(newAlliance)
{
	this.alliance = newAlliance;
	this.smashAttack.alliance = newAlliance;
};

// Boilerplate Entity Code
Joe3.prototype.Init = EntityInit;
Joe3.prototype.ChangeState = EntityChangeState;
Joe3.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
Joe3.prototype.Speed = EntitySpeed;
Joe3.prototype.Kill = EntityKill;
Joe3.prototype.ReleaseOrbs = EntityReleaseOrbs;
Joe3.prototype.Die = EntityDie;
Joe3.prototype.CancelAttack = EntityCancelAttack;
Joe3.prototype.Respawn = EntityRespawn;		
Joe3.prototype.GetGroundFriction = EntityGetGroundFriction;
// Joe3.prototype.DrawSprite = EntityDrawSprite;		// Overridden
Joe3.prototype.Draw = EntityDraw;
Joe3.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//Joe3.prototype.UpdateState = EntityUpdateState;	// Overridden
Joe3.prototype.Update = EntityUpdate;
Joe3.prototype.Push = EntityPush;
Joe3.prototype.Hit = EntityHit;
Joe3.prototype.Capture = EntityCapture;
Joe3.prototype.Release = EntityRelease;
//Joe3.prototype.ChangeAlliance = EntityChangeAlliance;
Joe3.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
Joe3.prototype.CollisionDetection = EntityCollisionDetection;
Joe3.prototype.WatchSex = EntityWatchSex;
Joe3.prototype.DoneWatchingSex = EntityDoneWatchingSex;
Joe3.prototype.OnRemovalFromGame = EntityOnRemovalFromGame;