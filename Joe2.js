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

include("JoeAI.js");

GlobalResourceLoader.AddAudioResource("joe2_attack1","sound/joe/joe2_attack1.mp3");
GlobalResourceLoader.AddAudioResource("joe2_attack2","sound/joe/joe2_attack2.mp3");
GlobalResourceLoader.AddAudioResource("joe2_grabbed1","sound/joe/joe2_grabbed1.mp3");
GlobalResourceLoader.AddAudioResource("joe2_grabbed2","sound/joe/joe2_grabbed2.mp3");
GlobalResourceLoader.AddAudioResource("joe2_hit1","sound/joe/joe2_hit1.mp3");
GlobalResourceLoader.AddAudioResource("joe2_hit2","sound/joe/joe2_hit2.mp3");
GlobalResourceLoader.AddAudioResource("joe2_hit3","sound/joe/joe2_hit3.mp3");
GlobalResourceLoader.AddAudioResource("joe2_shoulder1","sound/joe/joe2_shoulder1.mp3");
GlobalResourceLoader.AddAudioResource("joe2_shoulder2","sound/joe/joe2_shoulder2.mp3");

function Joe2()
{
	EntityInit.call(this);
	this.regularNames = ["Tense Joe","Edgy Joe","Troubled Joe"];
	this.corruptNames = ["Corrupted Joe"];
	var randName = Math.floor((Math.random() * this.regularNames.length));
	this.displayName = this.regularNames[randName];
	this.lastDisplayName = this.displayName;
	
	this.ai = new JoeAI(this);
	
	this.polite = true;
	
	// SFX
	this.attackSFX = new RandomSoundCollection("joe2_attack{0}",2);
	this.grabbedSFX = new RandomSoundCollection("joe2_grabbed{0}",2);
	this.hitSFX = new RandomSoundCollection("joe2_hit{0}",3);
	this.knockoutSFX = new RandomSoundCollection("joe2_shoulder{0}",2);
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
	this.captivePrepareSexAnim = "preparesex/joe2";
	this.captiveBeforeSexAnim = "beforesex/joe2";
	this.captiveSexAnim = "sex/joe2";
	this.captiveAfterSexAnim = "aftersex/joe2";
	this.sexOffsetX = 135;
	this.sexOffsetY = -12;
	this.sexOffsetZ = 0;
	
	this.grabAdjustX = 20;
	this.grabAdjustY = 0;
	this.grabAdjustZ = -20;
	
	// Stats
	this.walkMaxVel = 5.9 + Math.random()*0.1;
	this.maxHitStunFrames = 60;
	this.maxJumpFrames = 5;
	this.maxHealth = 135;
	this.staminaRecoveryPerFrame = 1.0 / (60 * 10);	// Stamina fully recovers in 10 seconds when not dazed
	this.staminaRecoveryPerFrameWhenKOed = 1.0 / (60 * 4);	// Stamina fully recovers in 4 seconds
	this.weight = 75;
	
	// Orbs
	this.orbsOnDeath = 5;
	this.orbsAfterSex = 8;
	this.heathOrbsHeld = 0;
	this.corruptionOrbsHeld = 0;
	this.dominationOrbsHeld = 0;
	
	// Collision
	this.zHeight = this.scale * 110;
	this.collisionRadius = this.scale * 10;
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * 50 / 2,y:-this.scale * 20 / 2});
	this.hitRect.expandToFit({x:this.scale * 50 / 2,y:this.scale * 20 / 2});

	// Light punch is 0.6 seconds long, that's 36 frames total
	this.punch1Attack = new Attack(this);
	this.punch1Attack.attackbox.SetBounds(100,-28,300,28);
	this.punch1Attack.animationTriggered = "attack";
	this.punch1Attack.warmupframes = 19;
	this.punch1Attack.attackFrames = 1;
	this.punch1Attack.cooldownframes = 76;
	this.punch1Attack.damageDealt = 10;
	this.punch1Attack.staminaDrained = 0.1;
	this.punch1Attack.visualContactZ = 96 * this.scale;
	this.punch1Attack.hitStunDealt = 0.2;
	this.punch1Attack.zHeight = 85 * this.scale;
	
	this.punch2Attack = new Attack(this);
	this.punch2Attack.attackbox.SetBounds(100,-28,300,28);
	this.punch2Attack.animationTriggered = "attack";
	this.punch2Attack.warmupframes = 40;
	this.punch2Attack.attackFrames = 1;
	this.punch2Attack.cooldownframes = 55;
	this.punch2Attack.damageDealt = 10;
	this.punch2Attack.staminaDrained = 0.1;
	this.punch2Attack.visualContactZ = 96 * this.scale;
	this.punch2Attack.hitStunDealt = 0.2;
	this.punch2Attack.zHeight = 85 * this.scale;
	
	this.kickAttack = new Attack(this);
	this.kickAttack.attackbox.SetBounds(100,-28,300,28);
	this.kickAttack.animationTriggered = "attack";
	this.kickAttack.warmupframes = 75;
	this.kickAttack.attackFrames = 1;
	this.kickAttack.cooldownframes = 20;
	this.kickAttack.damageDealt = 5;
	this.kickAttack.staminaDrained = 0.5;
	this.kickAttack.visualContactZ = 96 * this.scale;
	this.kickAttack.hitStunDealt = 0.6;
	this.kickAttack.zHeight = 85 * this.scale;
	
	this.animationSetup();
};

Joe2.prototype.editorProperties = ['displayName','alliance','health','orbsOnDeath', 'orbsAfterSex', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld','lifeOrbsHeld'];
Joe2.prototype.runtimeProperties = ['newlySpawned','newlySpawnedTargetX','newlySpawnedTargetY','state','stateFrames','corrupted','recruited','lastDisplayName'];

Joe2.prototype.ReInit = function()
{
	if (this.recruited)
		this.animationModel.ApplyPrefix("boner");
};

Joe2.prototype.GetMoveMaxVelocity = function()
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
			maxVel = this.walkMaxVel / 2.0;
		else if (this.state === States.Cheering)
			maxVel = 0;
		return maxVel;
};

Joe2.prototype.GetStaminaRecovery = function()
{
	if (IsInvulnerable(this.state))
		return this.staminaRecoveryPerFrameWhenKOed;
	else
		return this.staminaRecoveryPerFrame; // Stamina fully recovers in 5 seconds when not dazed
};

Joe2.prototype.DrawSprite = function()
{
	// Draw shadow
	ctx.globalAlpha = 0.4 * this.alpha;
	ctx.fillStyle = "#000000";
	var shadowScale = 500 / (this.posZ + 500);
	drawEllipse(0,0,shadowScale*240,shadowScale*60);

	this.animationModel.Draw();
	
	if (debug === 2 && this.ai != null)
		this.ai.Draw();
};

Joe2.prototype.UpdateState = function()
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
			this.attack = this.punch1Attack;
			this.punch1Attack.Attack();
			this.punch2Attack.Attack();
			this.kickAttack.Attack();
			this.animationModel.ChangeState(this.punch1Attack.animationTriggered);
			this.ChangeState(States.BasicAttack);
		}
		
		else if (this.controller.smoke && !this.recruited)
		{
			this.ChangeState(States.Cheering);
		}
		
		// If the ground is missing, go to the fall helpless state
		if (this.posZ > 0)
		{
			this.ChangeState(States.FallHelpless);
		}
		
		if (this.recruited && this.recruitedFrames > this.recruitmentTime)
		{
			this.unrecruit();
			
			if (!this.watchingSex)
				this.ChangeState(States.LoseBoner);
		}
		
	}
	else if (this.state === States.Cheering)
	{
		this.ProcessDirectionalInput();
		
		if (this.objectID % 3 === 0)
			this.animationModel.ChangeState("cheering1");
		else if (this.objectID % 3 === 1)
			this.animationModel.ChangeState("cheering2");
		else if (this.objectID % 3 === 2)
			this.animationModel.ChangeState("cheering3");
			
		if (this.stateFrames === 1)
			this.animationModel.SetAllPositions(this.animationModel.state, Math.random());
		
		if (!this.controller.smoke)
		{
			this.ChangeState(States.Walk);
		}
	}
	else if (this.state === States.LoseBoner)
	{
		this.animationModel.ChangeState("loseboner");
		if (this.animationModel.AnimationIsComplete("loseboner"))
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
		if (this.stateFrames === 15 || this.stateFrames === 35 || this.stateFrames === 70)
			this.attackSFX.Play(2.0);
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
		
		if (this.stateFrames === 1)
		{
			this.smokeKissSFX.Play(2.0);
		}
	}
	else if (this.state === States.FallAfterSmokeKiss)
	{
		if (this.stateFrames === 1)
		{
			var fallsmoke = new SmokeKissFallSmoke(this);
			level.entities.AddEffect(fallsmoke);
		}
		if (this.stateFrames === 20)
		{
			this.smokeKissFallSFX.Play(2.0);
		}
		this.animationModel.ChangeState("fallaftersmokekiss");
		if (this.animationModel.AnimationIsComplete("fallaftersmokekiss"))
		{	
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
			var fallsmoke = new SmokeKissFallSmoke(this);
			level.entities.AddEffect(fallsmoke);
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
		
		var fapSpeed = 1.5 - 1.0*normalizeValue(this.stateFrames, 1, 700);
		this.animationModel.SetDurationInSeconds("corrupt",fapSpeed);
		
		if (fapSpeed <= 0.5 /*&& this.animationModel.animations["corrupt"].mainAnimation.endFrame*/)
		{
			this.ChangeState(States.CorruptOrgasm);
		}
	}
	else if (this.state === States.CorruptOrgasm)
	{
		this.animationModel.ChangeState("faporgasm");
		
		if (this.stateFrames === 45)
		{
			this.ejacSFX.Play(2.0);
		}
		
		if (this.animationModel.AnimationIsComplete("faporgasm"))
		{
			level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,this.posZ+100,150,150,2.0));
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
		this.animationModel.ChangeState("beforesex");
	}
	else if (this.state === States.CaptiveSexBottom)
	{
		// Nothing to do. Bartender is in control.
	}
	else if (this.state === States.CorruptOrgasmAfterSex)
	{
		this.animationModel.ChangeState("aftersex");
		
		if (this.animationModel.AnimationIsComplete("aftersex"))
		{
			this.ChangeState(States.CorruptOrgasm);
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

Joe2.prototype.recruit = function(captor)
{
	if (!this.recruited)
	{
		this.ChangeAlliance(captor.alliance)
		
		this.recruited = true;
		this.lastDisplayName = this.displayName;
		this.displayName = "Horny Joe";
		this.animationModel.ApplyPrefix("boner");
	}
	else
	{
		this.recruitedFrames = 0;
	}
};

Joe2.prototype.unrecruit = function()
{
	if (this.recruited)
	{
		this.recruited = false;
		this.displayName = this.lastDisplayName;
		this.ChangeAlliance(2);
		this.animationModel.ClearPrefix("boner");
	}
};

Joe2.prototype.corrupt = function()
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

// All the animation frames associated with the Joe2.
GlobalResourceLoader.AddImageResource("sheet_Joe2_Normal","images/joe2/sheet_Joe2_Normal.txt");
GlobalResourceLoader.AddImageResource("sheet_Joe2_Boner","images/joe2/sheet_Joe2_Boner.txt");
GlobalResourceLoader.AddImageResource("sheet_Joe2_Corrupt","images/joe2/sheet_Joe2_Corrupt.txt");
GlobalResourceLoader.AddImageResource("sheet_Joe2_HornyKiss","images/joe2/sheet_Joe2_HornyKiss.txt");

GlobalResourceLoader.AddImageResource("sheet_Bartender_Joe2Sex_Blowjob","images/bartender/sheet_Bartender_Joe2Sex_Blowjob.txt");

Joe2.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;						// This animation loops
	idleAnim.inheritFacing = 1;					// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddFrame("joe2/idle");		// All the frames and their timing info
	idleAnim.SetDurationInSeconds(1.0);				// Set how long one loop takes (in seconds)
	
	// Define the corruption TF animation
	var sexidleAnim = new Animation(this);
	sexidleAnim.repeat = 1;						// This animation is one-shot
	sexidleAnim.inheritFacing = 1;					// It inherits the player's facing property
	sexidleAnim.AddSequentialFrames("joe2/sexidle{0}",1,11);
	sexidleAnim.SetDurationInSeconds(1.25); // This is 8 fps
	
	// Extend the animation
	sexidleAnim.SetDurationInSecondsWithoutRetime(3.5);
	
	// Add the 4 loop frames
	sexidleAnim.AddTimedFrame("joe2/sexidle13",1.25);
	sexidleAnim.AddTimedFrame("joe2/sexidle14",1.25 + (1/8));
	sexidleAnim.AddTimedFrame("joe2/sexidle15",1.25 + (1/8) + 1.0);
	sexidleAnim.AddTimedFrame("joe2/sexidle16",1.25 + (2/8) + 1.0);
	
	// Loop around frames 11 and 14
	sexidleAnim.SetLoopByFrame(11,14);
	
	var sexidleState = new AnimationState();
	sexidleState.SetMainAnimation(sexidleAnim);
	this.animationModel.AddState("sexidle",sexidleState);
	
	// Add the idle animation and all its transitions to the idle animation state
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	
	// Define a transition from walk to idle
	var walkToIdle = new Animation(this);
	walkToIdle.repeat = 3;
	walkToIdle.inheritFacing = 1;					// It inherits the player's facing property
	walkToIdle.matchPosition = true;
	walkToIdle.AddFrame("joe2/walk1")
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
	walkAnim.AddFrame("joe2/walk1");		// All the frames and their timing info
	walkAnim.AddFrame("joe2/walk2");
	walkAnim.AddFrame("joe2/walk3");
	walkAnim.AddFrame("joe2/walk4");
	walkAnim.AddFrame("joe2/walk5");
	walkAnim.AddFrame("joe2/walk6");
	walkAnim.AddFrame("joe2/walk7");
	walkAnim.AddFrame("joe2/walk8");
	walkAnim.SetDurationInSeconds(5.4);
	var walkState = new AnimationState();
	walkState.SetMainAnimation(walkAnim);
	this.animationModel.AddState("walk", walkState);
	
	// Define the hitstun animation
	var hitStunAnim = new Animation(this);
	hitStunAnim.repeat = 0;							// This animation is one-shot
	hitStunAnim.inheritFacing = 1;					// It inherits the player's facing property
	hitStunAnim.matchPosition = false;
	hitStunAnim.AddFrame("joe2/hitstun");		// All the frames and their timing info
	//hitStunAnim.AddFrame("joe2hitstun");		// All the frames and their timing info
	//hitStunAnim.AddFrame("joe2idle");		// All the frames and their timing info
	hitStunAnim.SetDurationInSeconds(this.maxHitStunFrames / 60.0);
	var hitStunState = new AnimationState();
	hitStunState.SetMainAnimation(hitStunAnim);
	this.animationModel.AddState("hitstun",hitStunState);
	
	// Define the captivehitstun animation
	var captiveHitStunAnim = new Animation(this);
	captiveHitStunAnim.repeat = 0;							// This animation is one-shot
	captiveHitStunAnim.inheritFacing = 1;					// It inherits the player's facing property
	captiveHitStunAnim.matchPosition = false;
	captiveHitStunAnim.AddFrame("joe2/hitstun");		// All the frames and their timing info
	captiveHitStunAnim.SetDurationInSeconds(0.18);
	var captiveHitStunState = new AnimationState();
	captiveHitStunState.SetMainAnimation(captiveHitStunAnim);
	this.animationModel.AddState("captivehitstun",captiveHitStunState);
	
	
	// Define the knockout animation
	var knockoutAnim = new Animation(this);
	knockoutAnim.repeat = 0;							// This animation is one-shot
	knockoutAnim.inheritFacing = 1;					// It inherits the player's facing property
	knockoutAnim.matchPosition = false;
	knockoutAnim.AddFrame("joe2/knockout1");		// All the frames and their timing info
	knockoutAnim.AddFrame("joe2/knockout2");	
	knockoutAnim.AddFrame("joe2/knockout3");	
	knockoutAnim.AddFrame("joe2/knockout4");	
	knockoutAnim.SetDurationInSeconds(0.6);
	var knockoutState = new AnimationState();
	knockoutState.SetMainAnimation(knockoutAnim);
	this.animationModel.AddState("knockout",knockoutState);
	
	// Define the knockout animation
	var getupAnim = new Animation(this);
	getupAnim.repeat = 0;							// This animation is one-shot
	getupAnim.inheritFacing = 1;					// It inherits the player's facing property
	getupAnim.matchPosition = false;
	getupAnim.AddFrame("joe2/getup1");		// All the frames and their timing info
	getupAnim.AddFrame("joe2/getup2");	
	getupAnim.AddFrame("joe2/getup3");	
	getupAnim.AddFrame("joe2/getup4");	
	getupAnim.SetDurationInSeconds(0.4);
	var getupState = new AnimationState();
	getupState.SetMainAnimation(getupAnim);
	this.animationModel.AddState("getup",getupState);
	
		// Define the corruption TF animation
	var losebonerAnim = new Animation(this);
	losebonerAnim.repeat = 0;						// This animation is one-shot
	losebonerAnim.inheritFacing = 1;					// It inherits the player's facing property
	losebonerAnim.AddSequentialFrames("joe2/loseboner{0}", 1, 10);
	losebonerAnim.SetDurationInSeconds(1.3);
	var losebonerState = new AnimationState();
	losebonerState.SetMainAnimation(losebonerAnim);
	this.animationModel.AddState("loseboner",losebonerState);
	
	// Define the thrown animation
	var thrownAnim = new Animation(this);
	thrownAnim.repeat = 0;							// This animation is one-shot
	thrownAnim.inheritFacing = 1;					// It inherits the player's facing property
	thrownAnim.matchPosition = false;
	thrownAnim.AddFrame("joe2/knockout2");	
	thrownAnim.AddFrame("joe2/knockout3");	
	thrownAnim.AddFrame("joe2/knockout4");	
	thrownAnim.AddFrame("joe2/knockout5");
	thrownAnim.SetDurationInSeconds(0.6);
	var thrownState = new AnimationState();
	thrownState.SetMainAnimation(thrownAnim);
	this.animationModel.AddState("thrown",thrownState);
	
	// Define the attack animation
	var attackAnim = new Animation(this);
	attackAnim.repeat = 0;							// This animation is one-shot
	attackAnim.inheritFacing = 1;					// It inherits the player's facing property
	attackAnim.matchPosition = false;
	attackAnim.AddSequentialFrames("joe2/attack{0}",1,17);		// All the frames and their timing info
	attackAnim.SetDurationInSeconds(1.6);
	var attackState = new AnimationState();
	attackState.SetMainAnimation(attackAnim);
	this.animationModel.AddState("attack",attackState);
	
	// Define the captive animation
	var captiveAnim = new Animation(this);
	captiveAnim.repeat = 0;							// This animation is one-shot
	captiveAnim.inheritFacing = 1;					// It inherits the player's facing property
	captiveAnim.matchPosition = false;
	captiveAnim.AddFrame("joe2/captive");		// All the frames and their timing info
	captiveAnim.SetDurationInSeconds(0.6);
	var captiveState = new AnimationState();
	captiveState.SetMainAnimation(captiveAnim);
	this.animationModel.AddState("captive",captiveState);
	
	
	// Define the captive smoke kiss animation
	var captiveSmokeKissAnim = new Animation(this);
	captiveSmokeKissAnim.repeat = 0;						// This animation is one-shot
	captiveSmokeKissAnim.inheritFacing = 1;					// It inherits the player's facing property
	captiveSmokeKissAnim.HoldFrame("joe2/captive",10);
	captiveSmokeKissAnim.AddSequentialFrames("joe2/smokekiss{0}",1,6); // First frame of the actual kiss
	captiveSmokeKissAnim.AddSequentialFrames("joe2/smokekiss{0}",1,6); // First frame of the actual kiss
	captiveSmokeKissAnim.HoldFrame("joe2/captive",3);
	captiveSmokeKissAnim.SetDurationInSeconds(3.0);
	var captiveSmokeKissState = new AnimationState();
	captiveSmokeKissState.SetMainAnimation(captiveSmokeKissAnim);
	this.animationModel.AddState("captivesmokekiss",captiveSmokeKissState);
	
	// Define the fall after smoke kiss animation
	var fallAfterSmokeKissAnim = new Animation(this);
	fallAfterSmokeKissAnim.repeat = 0;						// This animation is one-shot
	fallAfterSmokeKissAnim.inheritFacing = 1;					// It inherits the player's facing property
	//fallAfterSmokeKissAnim.AddFrame("joe2fallsmokekiss1",-10,-104);
	fallAfterSmokeKissAnim.AddFrame("joe2/fallsmokekiss2",-10, -109);
	fallAfterSmokeKissAnim.AddFrame("joe2/fallsmokekiss3",-19,-104);
	fallAfterSmokeKissAnim.AddFrame("joe2/fallsmokekiss4",-37, -69);
	fallAfterSmokeKissAnim.AddFrame("joe2/fallsmokekiss5",-55, -26);
	fallAfterSmokeKissAnim.AddFrame("joe2/fallsmokekiss6",-56, -30);
	fallAfterSmokeKissAnim.AddFrame("joe2/fallsmokekiss7",-55, -31);
	fallAfterSmokeKissAnim.AddFrame("joe2/fallsmokekiss7",-55, -31);
	fallAfterSmokeKissAnim.AddFrame("joe2/fallsmokekiss7",-55, -31);
	fallAfterSmokeKissAnim.AddFrame("joe2/fallsmokekiss8",-55, -31);
	fallAfterSmokeKissAnim.AddFrame("joe2/fallsmokekiss9",-55, -31);
	fallAfterSmokeKissAnim.AddFrame("joe2/fallsmokekiss10",-55, -31);
	fallAfterSmokeKissAnim.AddFrame("joe2/fallsmokekiss10",-55, -31);
	fallAfterSmokeKissAnim.AddFrame("joe2/fallsmokekiss10",-55, -31);
	fallAfterSmokeKissAnim.AddFrame("joe2/fallsmokekiss10",-55, -31);
	fallAfterSmokeKissAnim.AddFrame("joe2/fallsmokekiss10",-55, -31);
	fallAfterSmokeKissAnim.AddFrame("joe2/fallsmokekiss11",-42, -44);
	fallAfterSmokeKissAnim.AddFrame("joe2/fallsmokekiss12",-38, -50);
	fallAfterSmokeKissAnim.AddFrame("joe2/fallsmokekiss13",-22, -79);
	fallAfterSmokeKissAnim.AddFrame("joe2/fallsmokekiss14",-14, -98);
	fallAfterSmokeKissAnim.SetDurationInSeconds(2.4);
	var fallAfterSmokeKissState = new AnimationState();
	fallAfterSmokeKissState.SetMainAnimation(fallAfterSmokeKissAnim);
	this.animationModel.AddState("fallaftersmokekiss",fallAfterSmokeKissState);

	// Define the corruption TF animation
	var corruptionTFAnim = new Animation(this);
	corruptionTFAnim.repeat = 0;						// This animation is one-shot
	corruptionTFAnim.inheritFacing = 1;					// It inherits the player's facing property
	corruptionTFAnim.AddFrame("joe2/fallsmokekiss2",-10, -109);
	corruptionTFAnim.AddFrame("joe2/fallsmokekiss3",-19,-104);
	corruptionTFAnim.AddFrame("joe2/fallsmokekiss4",-37, -69);
	corruptionTFAnim.AddFrame("joe2/fallsmokekiss5",-55, -26);
	corruptionTFAnim.AddFrame("joe2/fallsmokekiss6",-56, -30);
	corruptionTFAnim.AddFrame("joe2/fallsmokekiss7",-55, -31);
	corruptionTFAnim.AddFrame("joe2/fallsmokekiss7",-55, -31);
	corruptionTFAnim.AddFrame("joe2/fallsmokekiss7",-55, -31);
	corruptionTFAnim.AddFrame("joe2/fallsmokekiss7",-55, -31);
	corruptionTFAnim.AddFrame("joe2/fallsmokekiss7",-55, -31);
	corruptionTFAnim.AddFrame("joe2/fallsmokekiss7",-55, -31);
	corruptionTFAnim.AddFrame("joe2/fallsmokekiss7",-55, -31);
	corruptionTFAnim.AddSequentialFrames("joe2/corruption{0}",1,26);
	corruptionTFAnim.SetDurationInSeconds(3.0);
	
	var corruptionTFState = new AnimationState();
	corruptionTFState.SetMainAnimation(corruptionTFAnim);
	this.animationModel.AddState("corruptiontransform",corruptionTFState);
	
	// Define the corrupt animation loop
	var corruptAnim = new Animation(this);
	corruptAnim.repeat = 1;						// This animation is bou
	corruptAnim.inheritFacing = 1;					// It inherits the player's facing property
	corruptAnim.AddSequentialFrames("joe2/corrupted{0}",1,6);
	corruptAnim.SetDurationInSeconds(1.5);
	var corruptState = new AnimationState();
	corruptState.SetMainAnimation(corruptAnim);
	this.animationModel.AddState("corrupt",corruptState);
	
	// Define the fap orgasm animation
	var faporgasmAnim = new Animation(this);
	faporgasmAnim.repeat = 0;						// This animation is bou
	faporgasmAnim.inheritFacing = 1;					// It inherits the player's facing property
	faporgasmAnim.AddSequentialFrames("joe2/orgasm{0}",1,18);
	faporgasmAnim.SetDurationInSeconds(1.8);
	
	var orgasmCumAnim = new Animation(this);
	orgasmCumAnim.repeat = 0;						// This animation is bou
	orgasmCumAnim.inheritFacing = 1;					// It inherits the player's facing property
	orgasmCumAnim.AddBlankFrames(4);
	orgasmCumAnim.AddSequentialFrames("joe2/cum{0}",1,13);
	orgasmCumAnim.AddFrame("joe2/cum13");
	orgasmCumAnim.SetDurationInSeconds(1.8);
	
	var faporgasmState = new AnimationState();
	faporgasmState.SetMainAnimation(faporgasmAnim);
	faporgasmState.AddDecoratorAnimation(orgasmCumAnim);
	this.animationModel.AddState("faporgasm",faporgasmState);
	
	// Define the before and after footjob animations
	var beforeSexAnim = new Animation(this);
	beforeSexAnim.repeat = 1;
	beforeSexAnim.inheritFacing = 1;					// It inherits the player's facing property
	beforeSexAnim.AddSequentialFrames( "joe2/sex/before{0}", 1,2);
	beforeSexAnim.SetDurationInSeconds(0.5);
	var beforeSexState = new AnimationState();
	beforeSexState.SetMainAnimation(beforeSexAnim);
	this.animationModel.AddState("beforesex",beforeSexState);
	
	var afterSexAnim = new Animation(this);
	afterSexAnim.repeat = 0;
	afterSexAnim.inheritFacing = 1;					// It inherits the player's facing property
	afterSexAnim.AddSequentialFrames( "joe2/sex/after{0}", 1,4);
	afterSexAnim.SetDurationInSeconds(0.5);
	var afterSexState = new AnimationState();
	afterSexState.SetMainAnimation(afterSexAnim);
	this.animationModel.AddState("aftersex",afterSexState);
	
	var anim = new Animation(this);
	anim.repeat = 1;						// This animation loops
	anim.inheritFacing = 1;					// It inherits the player's facing property
	anim.AddSequentialFrames("joe2/waitclapping{0}",1,5);
	anim.SetDurationInSeconds(0.6);
	var animState = new AnimationState();
	animState.SetMainAnimation(anim);
	this.animationModel.AddState("cheering1",animState);
	
	var anim = new Animation(this);
	anim.repeat = 1;						// This animation loops
	anim.inheritFacing = 1;					// It inherits the player's facing property
	anim.AddSequentialFrames("joe2/waiting{0}",1,4);
	anim.SetDurationInSeconds(0.8);
	var animState = new AnimationState();
	animState.SetMainAnimation(anim);
	this.animationModel.AddState("cheering2",animState);
	
	var anim = new Animation(this);
	anim.repeat = 1;						// This animation loops
	anim.inheritFacing = 1;					// It inherits the player's facing property
	anim.AddSequentialFrames("joe2/waitcheering{0}",1,4);
	anim.SetDurationInSeconds(0.7);
	var animState = new AnimationState();
	animState.SetMainAnimation(anim);
	this.animationModel.AddState("cheering3",animState);
	
	this.hornyKissLeftAnim = new Animation(this, "joe2/left_hornykiss_{0}", 6, 1.5);
	this.hornyKissLeftAnim.AddFrame("joe2/left_hornykiss_5");
	this.hornyKissLeftAnim.AddFrame("joe2/left_hornykiss_4");
	this.hornyKissLeftAnim.AddFrame("joe2/left_hornykiss_5");
	this.hornyKissLeftAnim.AddFrame("joe2/left_hornykiss_6");
	this.hornyKissLeftAnim.AddFrame("joe2/left_hornykiss_5");
	this.hornyKissLeftAnim.AddFrame("joe2/left_hornykiss_4");
	this.hornyKissLeftAnim.AddFrame("joe2/left_hornykiss_5");
	this.hornyKissLeftAnim.AddFrame("joe2/left_hornykiss_6");
	this.hornyKissLeftAnim.AddFrame("joe2/left_hornykiss_5");
	this.hornyKissLeftAnim.AddFrame("joe2/left_hornykiss_4");
	this.hornyKissLeftAnim.AddFrame("joe2/left_hornykiss_5");
	this.hornyKissLeftAnim.AddFrame("joe2/left_hornykiss_6");
	this.hornyKissLeftAnim.SetDurationInSeconds(4.5);
	this.hornyKissLeftAnim.repeat = 0;
	
	this.hornyKissRightAnim = new Animation(this, "joe2/right_hornykiss_{0}", 6, 1.5);
	this.hornyKissRightAnim.AddFrame("joe2/right_hornykiss_5");
	this.hornyKissRightAnim.AddFrame("joe2/right_hornykiss_4");
	this.hornyKissRightAnim.AddFrame("joe2/right_hornykiss_5");
	this.hornyKissRightAnim.AddFrame("joe2/right_hornykiss_6");
	this.hornyKissRightAnim.AddFrame("joe2/right_hornykiss_5");
	this.hornyKissRightAnim.AddFrame("joe2/right_hornykiss_4");
	this.hornyKissRightAnim.AddFrame("joe2/right_hornykiss_5");
	this.hornyKissRightAnim.AddFrame("joe2/right_hornykiss_6");
	this.hornyKissRightAnim.AddFrame("joe2/right_hornykiss_5");
	this.hornyKissRightAnim.AddFrame("joe2/right_hornykiss_4");
	this.hornyKissRightAnim.AddFrame("joe2/right_hornykiss_5");
	this.hornyKissRightAnim.AddFrame("joe2/right_hornykiss_6");
	this.hornyKissRightAnim.SetDurationInSeconds(4.5);
	this.hornyKissRightAnim.repeat = 0;
};

Joe2.prototype.Kiss = function(posX,posY,posZ, isLeft)
{	
	// Replace self with kissing effectanimation
	var selfKissAnim, otherKissAnim;
	if (isLeft)
		selfKissAnim = new EffectAnimation(this.hornyKissLeftAnim, null, false);
	else
		selfKissAnim = new EffectAnimation(this.hornyKissRightAnim, null, false);
	
	// Place the kiss animation properly
	selfKissAnim.posX = posX;
	selfKissAnim.posY = posY;
	//selfKissAnim.spriteCenterX = 70;
	//selfKissAnim.spriteCenterY = 148;
	if (!isLeft)
		selfKissAnim.orderBonus=0;
	
	// Also plant a smoke explosion for when the effect animation dies
	var smoke = new SmokeExplosion(posX,posY,posZ,200,200,1.0);
	smoke.deathTriggerEntity = selfKissAnim;
	
	this.corrupted = true;
	smoke.TransferOrbs(this);
	
	// Spawn in all the new entities
	level.entities.AddEffect(selfKissAnim);
	level.entities.AddEffect(smoke);
	
	// Kill self
	this.Die();
};

Joe2.prototype.ChangeAlliance = function(newAlliance)
{
	this.alliance = newAlliance;
	this.punch1Attack.alliance = newAlliance;
	this.punch2Attack.alliance = newAlliance;
	this.kickAttack.alliance = newAlliance;
};

Joe2.prototype.CancelAttack = function()
{
	// Call the parent method
	EntityCancelAttack.call(this);
	
	// But also manually cancel all these attacks
	this.punch1Attack.Reset();
	this.punch2Attack.Reset();
	this.kickAttack.Reset();
};

Joe2.prototype.DoneWatchingSex = function()
{
	// If we are recruited, don't lose the boner
	if (!this.recruited)
		this.ChangeState(States.LoseBoner);
		
	EntityDoneWatchingSex.call(this);
};

// Boilerplate Entity Code
Joe2.prototype.Init = EntityInit;
Joe2.prototype.ChangeState = EntityChangeState;
Joe2.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
Joe2.prototype.Speed = EntitySpeed;
Joe2.prototype.Kill = EntityKill;
Joe2.prototype.ReleaseOrbs = EntityReleaseOrbs;
Joe2.prototype.Die = EntityDie;
//Joe2.prototype.CancelAttack = EntityCancelAttack;
Joe2.prototype.Respawn = EntityRespawn;		
Joe2.prototype.GetGroundFriction = EntityGetGroundFriction;
// Joe2.prototype.DrawSprite = EntityDrawSprite;		// Overridden
Joe2.prototype.Draw = EntityDraw;
Joe2.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//Joe2.prototype.UpdateState = EntityUpdateState;	// Overridden
Joe2.prototype.Update = EntityUpdate;
Joe2.prototype.Push = EntityPush;
Joe2.prototype.Hit = EntityHit;
Joe2.prototype.Capture = EntityCapture;
Joe2.prototype.Release = EntityRelease;
//Joe2.prototype.ChangeAlliance = EntityChangeAlliance;
Joe2.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
Joe2.prototype.CollisionDetection = EntityCollisionDetection;
Joe2.prototype.WatchSex = EntityWatchSex;
//Joe2.prototype.DoneWatchingSex = EntityDoneWatchingSex;
Joe2.prototype.OnRemovalFromGame = EntityOnRemovalFromGame;