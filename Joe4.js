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

GlobalResourceLoader.AddAudioResource("joe4_attack1","sound/joe/joe4_attack1.mp3");
GlobalResourceLoader.AddAudioResource("joe4_attack2","sound/joe/joe4_attack2.mp3");

GlobalResourceLoader.AddAudioResource("joe4_hit1","sound/joe/joe4_hit1.mp3");
GlobalResourceLoader.AddAudioResource("joe4_hit2","sound/joe/joe4_hit2.mp3");
GlobalResourceLoader.AddAudioResource("joe4_hit3","sound/joe/joe4_hit3.mp3");

GlobalResourceLoader.AddAudioResource("joe4_shoulder1","sound/joe/joe4_shoulder1.mp3");
GlobalResourceLoader.AddAudioResource("joe4_shoulder2","sound/joe/joe4_shoulder2.mp3");
GlobalResourceLoader.AddAudioResource("joe4_shoulder3","sound/joe/joe4_shoulder3.mp3");

function Joe4()
{
	EntityInit.call(this);
	
	this.ai = new JoeAI(this);
	this.ai.enableLeap = true;
	
	this.regularNames = ["Overloaded Joe","Frenzied Joe","Maniacal Joe"];
	this.corruptNames = ["Corrupted Joe"];
	var randName = Math.floor((Math.random() * this.regularNames.length));
	this.displayName = this.regularNames[randName];
	
	// SFX
	this.attackSFX = new RandomSoundCollection("joe4_attack{0}",2);
	this.hitSFX = new RandomSoundCollection("joe4_hit{0}",3);
	this.knockoutSFX = new RandomSoundCollection("joe4_shoulder{0}",3);
	this.ejacSFX = GlobalResourceLoader.GetSound("joe1_ejac");
	this.smokeKissSFX = GlobalResourceLoader.GetSound("joe1_hit5");
	this.smokeKissFallSFX = GlobalResourceLoader.GetSound("joe1_hit4");
	
	// Combat flags
	this.alliance = 2;
	this.grabbable = true;
	this.fuckable = true;
	this.kissable = false;
	this.throwable = false;
	
	// Sex animation flags
	this.captivePrepareSexAnim = "preparesex/joe4";
	this.captiveBeforeSexAnim = "beforesex/joe4";
	this.captiveSexAnim = "sex/joe4";
	this.captiveAfterSexAnim = "aftersex/joe4";
	this.sexOffsetX = 119;
	this.sexOffsetY = -18;
	this.sexOffsetZ = 0;
	
	this.grabAdjustX = 20;
	this.grabAdjustY = 0;
	this.grabAdjustZ = -20;
	
	// Stats
	this.walkMaxVel = 5.7  + Math.random()*0.2;
	this.maxHitStunFrames = 45;
	this.maxJumpFrames = 10;
	this.maxHealth = 205;
	this.maxStamina = 1.0;
	this.stamina = this.maxStamina;
	this.staminaRecoveryPerFrame = 1.0 / (60 * 10);	// Stamina fully recovers in 5 seconds when not dazed
	this.staminaRecoveryPerFrameWhenKOed = 1.0 / (60 * 4);	// Stamina fully recovers in 3 seconds
	this.weight = 150;
	
	// Orbs
	this.orbsOnDeath = 16;
	this.orbsAfterSex = 30;
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

	this.shatterAttack = new Attack(this);
	this.shatterAttack.attackbox.SetBounds(50,-30,320,30);
	this.shatterAttack.animationTriggered = "attack";
	this.shatterAttack.warmupframes = 1;
	this.shatterAttack.attackFrames = 1;
	this.shatterAttack.cooldownframes = 1;
	this.shatterAttack.damageDealt = 40;
	this.shatterAttack.staminaDrained = 0.85;
	this.shatterAttack.visualContactZ = 96 * this.scale;
	this.shatterAttack.hitStunDealt = 1.0;
	this.shatterAttack.knockbackMultiplierZ = 1.2;
	this.shatterAttack.knockbackMultiplier = 1.5;
	
	this.shockwaveAttack = new Attack(this);
	this.shockwaveAttack.attackbox.SetBounds(-300,-60,300,60);
	this.shockwaveAttack.warmupframes = 1;
	this.shockwaveAttack.zHeight = 3;
	this.shockwaveAttack.attackFrames = 1;
	this.shockwaveAttack.cooldownframes = 10;
	this.shockwaveAttack.damageDealt = 25;
	this.shockwaveAttack.staminaDrained = 1.0;
	this.shockwaveAttack.visualContactZ = 0;
	this.shockwaveAttack.hitStunDealt = 1.0;
	
	this.stunAttack = new Attack(this);
	this.stunAttack.attackbox.SetBounds(50,-35,350,35);
	this.stunAttack.animationTriggered = "attack";
	this.stunAttack.warmupframes = 30;
	this.stunAttack.attackFrames = 15;
	this.stunAttack.cooldownframes = 14;
	this.stunAttack.damageDealt = 1;
	this.stunAttack.staminaDrained = 0.015;
	this.stunAttack.visualContactZ = 96 * this.scale;
	this.stunAttack.hitStunDealt = 0.2;
	
	// Grab Cancel is 0.6 seconds long, that's 36 frames total
	this.grabCancelAttack = new Attack(this);
	this.grabCancelAttack.attackbox.SetBounds(100,-28,300,28);
	this.grabCancelAttack.animationTriggered = "grabcancel";
	this.grabCancelAttack.warmupframes = 25;
	this.grabCancelAttack.attackFrames = 1;
	this.grabCancelAttack.cooldownframes = 4;
	this.grabCancelAttack.damageDealt = 10;
	this.grabCancelAttack.staminaDrained = 3.0;
	this.grabCancelAttack.visualContactZ = 96 * this.scale;
	this.grabCancelAttack.hitStunDealt = 1.0;
	this.grabCancelAttack.alliance = 0;
	
	this.animationSetup();
};

Joe4.prototype.editorProperties = ['displayName','alliance','health','orbsOnDeath', 'orbsAfterSex', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld'];
Joe4.prototype.runtimeProperties = ['newlySpawned','newlySpawnedTargetX','newlySpawnedTargetY','state','stateFrames','corrupted','recruited'];

Joe4.prototype.GetMoveMaxVelocity = function()
{		
	// Enforce velocity limits
	var maxVel = this.walkMaxVel;
	if (this.state === States.Run)
		maxVel = this.walkMaxVel * 2.0;
	else if (this.state === States.SmokeWalk)
		maxVel = this.walkMaxVel / 1.5;
	else if (this.state === States.Jump || this.state === States.Fall || this.state === States.FallHelpless)
		maxVel = this.walkMaxVel * 4.0;
	else if (this.state === States.Drag)
		maxVel = this.walkMaxVel / 2.0;
	return maxVel;
};

Joe4.prototype.GetStaminaRecovery = function()
{
	if (IsInvulnerable(this.state))
		return this.staminaRecoveryPerFrameWhenKOed;
	else
		return this.staminaRecoveryPerFrame; // Stamina fully recovers in 5 seconds when not dazed
};

Joe4.prototype.DrawSprite = function()
{
	// Draw shadow
	ctx.globalAlpha = 0.4 * this.alpha;
	ctx.fillStyle = "#000000";
	var shadowScale = 500 / (this.posZ + 500);
	drawEllipse(0,0,shadowScale*290,shadowScale*90);

	ctx.globalAlpha = this.alpha;
	this.animationModel.Draw();
	ctx.globalAlpha = 1.0;
	
	if (debug === 2 && this.ai != null)
		this.ai.Draw();
};

Joe4.prototype.UpdateState = function()
{
	var mag = Math.sqrt(Math.pow(this.velX,2)+Math.pow(this.velY,2));
	var ang = Math.atan2(this.velY,this.velX);
	
	// Do what needs to be done in each state and change the state if needed
	if (this.state === States.Walk)
	{
		if (this.shockwaveAttack.state != 0)
			this.animationModel.ChangeState("fall");
		else if (mag < 2.6 && !this.controller.up && !this.controller.down && !this.controller.left && !this.controller.right)
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
		if (this.shockwaveAttack.state == 0)
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
			this.attack = this.stunAttack;
			this.attack.Attack();
			this.animationModel.ChangeState(this.attack.animationTriggered);
			this.ChangeState(States.BasicAttack);
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
		if (this.stateFrames === 15)
			this.attackSFX.Play(2.0);
		// Move the character based on controller input
		if (this.stateFrames > 15)
			this.ProcessDirectionalInput();
		
		this.animationModel.ChangeState("jump");
		if (this.controller.jump && this.jumpFrames < this.maxJumpFrames)
		{
			if (this.stateFrames > 15)
			{
				this.jumpFrames += 1;
				this.accelZ = 4.0;
			}
		}
		else if (!this.controller.jump)
		{
			this.ChangeState(States.FallHelpless);
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
		{
			this.animationModel.ChangeState("jump");
		}
		else if (this.animationModel.state != "fall")
		{
			this.animationModel.ChangeState("fall");
		}
		
		// If we've landed on the ground and the attack is over...
		if (this.posZ <= 0)
		{
			this.attackSFX.Play(2.0);
			this.shockwaveAttack.Attack();
			this.ChangeState(States.Walk);
		}
	}
	else if (this.state === States.FallHelpless)
	{
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		this.animationModel.ChangeState("idle");
		if (this.posZ <= 0)
			this.ChangeState(States.Walk);
	}
	else if (this.state === States.BasicAttack)
	{
		// When we hit the right frame, unleash the hit component
		if (this.stateFrames === 46)
		{
			this.attackSFX.Play(2.0);
			this.shatterAttack.Attack();
		}
		
		this.ChangeStateOnAttackComplete(States.Walk);
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
			// Joe4 cannot be recruited
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
			this.ChangeState(States.Corrupt);
	}
	else if (this.state === States.Corrupt)
	{
		this.corrupt();
		this.animationModel.ChangeState("corrupt");
		
		//var fapSpeed = 0.75 - 0.25*normalizeValue(this.stateFrames, 1, 500);
		//this.animationModel.SetDurationInSeconds("corrupt",fapSpeed);
		
		if (this.stateFrames > 500 && this.animationModel.animations["corrupt"].mainAnimation.endFrame)
		{
			this.ChangeState(States.CorruptOrgasm);
		}
	}
	else if (this.state === States.CorruptOrgasm)
	{
		this.animationModel.ChangeState("faporgasm");
		
		if (this.animationModel.AnimationIsComplete("faporgasm"))
		{
			level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,player.posZ+150,200,200,2.0));
			this.ReleaseOrbs();
			this.Die();
		}
	}
	else if (this.state === States.Captive)
	{
		// Joe 4 cannot be taken captive, so trigger the grab cancel animation and send out a hit
		this.attack = this.grabCancelAttack;
		this.attack.Attack();
		this.animationModel.ChangeState(this.attack.animationTriggered);
		this.ChangeState(States.BasicAttack);
	}
	else if (this.state === States.CorruptPrepareBeforeSex)
	{
		if (this.sexType === 0)
			this.animationModel.ChangeState("beforesex");
		else
			this.animationModel.ChangeState("beforedrunksex");
	}
	else if (this.state === States.CaptiveSexBottom)
	{
		// Nothing to do, bartender in control
	}
	else if (this.state === States.CorruptOrgasmAfterSex)
	{
		if (this.sexType === 0)
			this.animationModel.ChangeState("aftersex");
		
		if (this.animationModel.AnimationIsComplete("aftersex") || this.sexType === 1)
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
};

Joe4.prototype.recruit = function(captor)
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

Joe4.prototype.unrecruit = function()
{
	if (this.recruited)
	{
		this.recruited = false;
		this.displayName = this.lastDisplayName;
		this.ChangeAlliance(2);
		this.animationModel.ClearPrefix("boner");
	}
};

Joe4.prototype.corrupt = function()
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

// All the animation frames associated with the Joe4.
GlobalResourceLoader.AddImageResource("sheet_Joe4_Normal","images/joe4/sheet_Joe4_Normal.txt");
GlobalResourceLoader.AddImageResource("sheet_Joe4_Corrupt","images/joe4/sheet_Joe4_Corrupt.txt");
GlobalResourceLoader.AddImageResource("sheet_Bartender_Joe4Sex_Spitroast_Joe4","images/bartender/sheet_Bartender_Joe4Sex_Spitroast_Joe4.txt");
GlobalResourceLoader.AddImageResource("sheet_Bartender_Joe4DrunkSex_Cowboy","images/bartender/sheet_Bartender_Joe4DrunkSex_Cowboy.txt");


Joe4.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;						// This animation loops
	idleAnim.inheritFacing = 1;					// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddFrame("joe4/idle");		// All the frames and their timing info
	idleAnim.SetDurationInSeconds(1.0);				// Set how long one loop takes (in seconds)
	
	// Add the idle animation and all its transitions to the idle animation state
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	
	// Define the corruption TF animation
	var sexidleAnim = new Animation(this);
	sexidleAnim.repeat = 1;						// This animation is one-shot
	sexidleAnim.inheritFacing = 1;					// It inherits the player's facing property
	sexidleAnim.AddSequentialFrames("joe4/sexidle{0}",1,13);
	sexidleAnim.AddFrame("joe4/sexidle12");
	idleAnim.SetDurationInSeconds(1.5);
	
	// Loop around frames 11-14
	sexidleAnim.SetLoopByFrame(10,13);
	
	var sexidleState = new AnimationState();
	sexidleState.SetMainAnimation(sexidleAnim);
	this.animationModel.AddState("sexidle",sexidleState);
	
	// Define a transition from walk to idle
	var walkToIdle = new Animation(this);
	walkToIdle.repeat = 3;
	walkToIdle.inheritFacing = 1;					// It inherits the player's facing property
	walkToIdle.matchPosition = true;
	walkToIdle.AddFrame("joe4/walk1")
	walkToIdle.SetDurationInSeconds(0.2);
	idleState.AddTransitionAnimation("walk", walkToIdle); 
	
	var fallToIdle = new Animation(this);
	fallToIdle.inheritFacing = 1;					// It inherits the player's facing property
	fallToIdle.AddFrame("joe4/shockwave10")
	fallToIdle.AddFrame("joe4/shockwave11")
	fallToIdle.SetDurationInSeconds(0.2);
	idleState.AddTransitionAnimation("fall", fallToIdle); 
	
	// Add all the animation states to the animations collection
	this.animationModel.AddState("idle",idleState);
	
	
	// Define the walk animation
	var walkAnim = new Animation(this);
	walkAnim.repeat = 1;						// This animation loops
	walkAnim.dynamicRate = 1;					// This animation moves faster with player speed
	walkAnim.inheritFacing = 1;					// It inherits the player's facing property
	walkAnim.matchPosition = true;
	walkAnim.AddSequentialFrames("joe4/walk{0}",1,9);
	walkAnim.SetDurationInSeconds(5.0);
	var walkState = new AnimationState();
	walkState.SetMainAnimation(walkAnim);
	
	var fallToWalk = new Animation(this);
	fallToWalk.inheritFacing = 1;					// It inherits the player's facing property
	fallToWalk.AddFrame("joe4/shockwave10")
	fallToWalk.AddFrame("joe4/shockwave11")
	fallToWalk.SetDurationInSeconds(0.2);
	walkState.AddTransitionAnimation("fall", fallToWalk); 
	
	this.animationModel.AddState("walk", walkState);
	
	// Define the hitstun animation
	var hitStunAnim = new Animation(this);
	hitStunAnim.repeat = 0;							// This animation is one-shot
	hitStunAnim.inheritFacing = 1;					// It inherits the player's facing property
	hitStunAnim.matchPosition = false;
	hitStunAnim.AddFrame("joe4/hit");		// All the frames and their timing info
	//hitStunAnim.AddFrame("joe4hitstun");		// All the frames and their timing info
	//hitStunAnim.AddFrame("joe4idle");		// All the frames and their timing info
	hitStunAnim.SetDurationInSeconds(this.maxHitStunFrames / 60.0);
	var hitStunState = new AnimationState();
	hitStunState.SetMainAnimation(hitStunAnim);
	this.animationModel.AddState("hitstun",hitStunState);
	
	// Define the captivehitstun animation
	var captiveHitStunAnim = new Animation(this);
	captiveHitStunAnim.repeat = 0;							// This animation is one-shot
	captiveHitStunAnim.inheritFacing = 1;					// It inherits the player's facing property
	captiveHitStunAnim.matchPosition = false;
	captiveHitStunAnim.AddFrame("joe4/hitstun");		// All the frames and their timing info
	captiveHitStunAnim.SetDurationInSeconds(0.18);
	var captiveHitStunState = new AnimationState();
	captiveHitStunState.SetMainAnimation(captiveHitStunAnim);
	this.animationModel.AddState("captivehitstun",captiveHitStunState);
	
   // Define the grab cancel animation
	var grabCancelAnim = new Animation(this);
	grabCancelAnim.repeat = 0;							// This animation is one-shot
	grabCancelAnim.inheritFacing = 1;					// It inherits the player's facing property
	grabCancelAnim.matchPosition = false;
	grabCancelAnim.AddSequentialFrames("joe4/grab_cancel{0}",1,6);		// All the frames and their timing info
	grabCancelAnim.SetDurationInSeconds(0.5);
	var grabCancelState = new AnimationState();
	grabCancelState.SetMainAnimation(grabCancelAnim);
	this.animationModel.AddState("grabcancel",grabCancelState);
	
	// Define the jump animation
	var jumpAttackAnim = new Animation(this);
	jumpAttackAnim.repeat = 0;							// This animation is one-shot
	jumpAttackAnim.inheritFacing = 1;					// It inherits the player's facing property
	jumpAttackAnim.matchPosition = false;
	jumpAttackAnim.AddSequentialFrames("joe4/shockwave{0}",1,5);		// All the frames and their timing info
	jumpAttackAnim.SetDurationInSeconds(0.5);
	var jumpAttackState = new AnimationState();
	jumpAttackState.SetMainAnimation(jumpAttackAnim);
	this.animationModel.AddState("jump",jumpAttackState);
	
	// Define the jump animation
	var fallAttackAnim = new Animation(this);
	fallAttackAnim.repeat = 0;							// This animation is one-shot
	fallAttackAnim.inheritFacing = 1;					// It inherits the player's facing property
	fallAttackAnim.matchPosition = false;
	fallAttackAnim.AddSequentialFrames("joe4/shockwave{0}",6,9);		// All the frames and their timing info
	fallAttackAnim.SetDurationInSeconds(0.4);
	var fallAttackState = new AnimationState();
	fallAttackState.SetMainAnimation(fallAttackAnim);
	this.animationModel.AddState("fall",fallAttackState);
	
	// Define the knockout animation
	var knockoutAnim = new Animation(this);
	knockoutAnim.repeat = 0;							// This animation is one-shot
	knockoutAnim.inheritFacing = 1;					// It inherits the player's facing property
	knockoutAnim.matchPosition = false;
	knockoutAnim.AddFrame("joe4/knockout1");		// All the frames and their timing info
	knockoutAnim.AddFrame("joe4/knockout2");	
	knockoutAnim.AddFrame("joe4/knockout3");	
	knockoutAnim.AddFrame("joe4/knockout4");	
	knockoutAnim.SetDurationInSeconds(0.4);
	var knockoutState = new AnimationState();
	knockoutState.SetMainAnimation(knockoutAnim);
	this.animationModel.AddState("knockout",knockoutState);
	
	// Define the knockout animation
	var getupAnim = new Animation(this);
	getupAnim.repeat = 0;							// This animation is one-shot
	getupAnim.inheritFacing = 1;					// It inherits the player's facing property
	getupAnim.matchPosition = false;
	getupAnim.AddSequentialFrames("joe4/getup{0}",1,5);		// All the frames and their timing info
	getupAnim.SetDurationInSeconds(0.4);
	var getupState = new AnimationState();
	getupState.SetMainAnimation(getupAnim);
	this.animationModel.AddState("getup",getupState);
	
	// Define the thrown animation
	var thrownAnim = new Animation(this);
	thrownAnim.repeat = 0;							// This animation is one-shot
	thrownAnim.inheritFacing = 1;					// It inherits the player's facing property
	thrownAnim.matchPosition = false;
	thrownAnim.AddFrame("joe4/knockout2");	
	thrownAnim.AddFrame("joe4/knockout3");	
	thrownAnim.AddFrame("joe4/knockout4");
	thrownAnim.SetDurationInSeconds(0.6);
	var thrownState = new AnimationState();
	thrownState.SetMainAnimation(thrownAnim);
	this.animationModel.AddState("thrown",thrownState);
	
	
	// Define the knockout animation
	var attackAnim = new Animation(this);
	attackAnim.repeat = 0;							// This animation is one-shot
	attackAnim.inheritFacing = 1;					// It inherits the player's facing property
	attackAnim.matchPosition = false;
	attackAnim.AddSequentialFrames("joe4/shatter{0}",1,14);		// All the frames and their timing info	
	attackAnim.SetDurationInSeconds(1.0);
	var attackState = new AnimationState();
	attackState.SetMainAnimation(attackAnim);
	this.animationModel.AddState("attack",attackState);
	
	// Define the corruption TF animation
	var corruptionTFAnim = new Animation(this);
	corruptionTFAnim.repeat = 0;						// This animation is one-shot
	corruptionTFAnim.inheritFacing = 1;					// It inherits the player's facing property
	corruptionTFAnim.AddFrame("joe4/knockout1");		// All the frames and their timing info
	corruptionTFAnim.AddFrame("joe4/knockout2");	
	corruptionTFAnim.AddFrame("joe4/knockout3");	
	corruptionTFAnim.HoldFrame("joe4/knockout4",5);	
	corruptionTFAnim.AddSequentialFrames("joe4/corruption{0}",1,26);
	corruptionTFAnim.SetDurationInSeconds(4.0);
	
	var corruptionTFState = new AnimationState();
	corruptionTFState.SetMainAnimation(corruptionTFAnim);
	this.animationModel.AddState("corruptiontransform",corruptionTFState);
	
	// Define the corruption TF animation
	var corruptAnim = new Animation(this);
	corruptAnim.repeat = 1;						
	corruptAnim.inheritFacing = 1;					// It inherits the player's facing property
	corruptAnim.AddSequentialFrames("joe4/corruption{0}",27,30);
	corruptAnim.SetDurationInSeconds(0.75);
	var corruptState = new AnimationState();
	corruptState.SetMainAnimation(corruptAnim);
	this.animationModel.AddState("corrupt",corruptState);
	
	// Define the fap orgasm animation
	var faporgasmAnim = new Animation(this);
	faporgasmAnim.repeat = 0;						
	faporgasmAnim.inheritFacing = 1;					// It inherits the player's facing property
    faporgasmAnim.AddFrame("joe4/corruption27");
	faporgasmAnim.AddSequentialFrames("joe4/corruption{0}",31,44);
	//faporgasmAnim.MatchFramerate(corruptAnim);
	faporgasmAnim.SetDurationInSeconds(2.0);
	var faporgasmState = new AnimationState();
	faporgasmState.SetMainAnimation(faporgasmAnim);
	this.animationModel.AddState("faporgasm",faporgasmState);
	
	// Define the before and after sex animations
	var beforeSexAnim = new Animation(this);
	beforeSexAnim.repeat = 1;
	beforeSexAnim.inheritFacing = 1;					// It inherits the player's facing property
	beforeSexAnim.AddSequentialFrames( "joe4/sex/before{0}", 1,3);
	beforeSexAnim.AddFrame( "joe4/sex/before2");
	beforeSexAnim.SetDurationInSeconds(0.4);
	var beforeSexState = new AnimationState();
	beforeSexState.SetMainAnimation(beforeSexAnim);
	this.animationModel.AddState("beforesex",beforeSexState);
	
	var beforeSexAnim = new Animation(this);
	beforeSexAnim.repeat = 0;
	beforeSexAnim.inheritFacing = 1;					// It inherits the player's facing property
	beforeSexAnim.AddSequentialFrames( "joe4/drunksex/before{0}", 1,6);
	beforeSexAnim.SetDurationInSeconds(0.9);
	var beforeSexState = new AnimationState();
	beforeSexState.SetMainAnimation(beforeSexAnim);
	this.animationModel.AddState("beforedrunksex",beforeSexState);
	
	var afterSexAnim = new Animation(this);
	afterSexAnim.repeat = 0;
	afterSexAnim.inheritFacing = 1;					// It inherits the player's facing property
	afterSexAnim.HoldFrame( "joe4/sex/after1",9);
	afterSexAnim.AddSequentialFrames( "joe4/sex/after{0}", 10,30);
	afterSexAnim.SetDurationInSeconds(3.0);
	var afterSexState = new AnimationState();

	var afterSexSmoke = new Animation(this);
	afterSexSmoke.inheritFacing = 1;
	afterSexSmoke.AddBlankFrames(8);
	afterSexSmoke.AddSequentialFrames("joe4/sex/afterdecorator{0}",9,11);	
	afterSexSmoke.AddBlankFrames(9);
	afterSexSmoke.AddSequentialFrames("joe4/sex/afterdecorator{0}",20,30);	
	afterSexSmoke.SetDurationInSeconds(3.0);
	afterSexSmoke.blendMode = "lighter";

	afterSexState.AddDecoratorAnimation(afterSexSmoke);
	
	afterSexState.SetMainAnimation(afterSexAnim);
	this.animationModel.AddState("aftersex",afterSexState);
	
};

Joe4.prototype.ChangeAlliance = function(newAlliance)
{
	this.alliance = newAlliance;
	this.shatterAttack.alliance = newAlliance;
	this.shockwaveAttack.alliance = newAlliance;
	this.stunAttack.alliance = newAlliance;
	this.grabCancelAttack.alliance = newAlliance;
};

Joe4.prototype.Capture = function(captor)
{
	var captured = EntityCapture.call(this,captor);
	
	if (captured !== null)
	{
		if (this.state === States.CaptiveSexBottom)
		{
			// Get rid of a dumb animation glitch that occurs on the handoff frame
			//this.animationModel.ChangeState("fuck");
			this.facing = captor.facing;
			this.fucked = true;
			
			// Move Joe so the sex animation lines up with the normal sitting animation
			this.posX -= 50 * this.facing;
		    this.posY -= 12;
		}
	}
	
	return captured;
};

// Boilerplate Entity Code
Joe4.prototype.Init = EntityInit;
Joe4.prototype.ChangeState = EntityChangeState;
Joe4.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
Joe4.prototype.Speed = EntitySpeed;
Joe4.prototype.Kill = EntityKill;
Joe4.prototype.ReleaseOrbs = EntityReleaseOrbs;
Joe4.prototype.Die = EntityDie;
Joe4.prototype.CancelAttack = EntityCancelAttack;
Joe4.prototype.Respawn = EntityRespawn;		
Joe4.prototype.GetGroundFriction = EntityGetGroundFriction;
// Joe4.prototype.DrawSprite = EntityDrawSprite;		// Overridden
Joe4.prototype.Draw = EntityDraw;
Joe4.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//Joe4.prototype.UpdateState = EntityUpdateState;	// Overridden
Joe4.prototype.Update = EntityUpdate;
Joe4.prototype.Push = EntityPush;
Joe4.prototype.Hit = EntityHit;
//Joe4.prototype.Capture = EntityCapture;
Joe4.prototype.Release = EntityRelease;
//Joe4.prototype.ChangeAlliance = EntityChangeAlliance;
Joe4.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
Joe4.prototype.CollisionDetection = EntityCollisionDetection;
Joe4.prototype.WatchSex = EntityWatchSex;
Joe4.prototype.DoneWatchingSex = EntityDoneWatchingSex;
Joe4.prototype.OnRemovalFromGame = EntityOnRemovalFromGame;