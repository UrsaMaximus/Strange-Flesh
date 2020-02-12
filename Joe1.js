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
include("VirusFromVenus.js");

GlobalResourceLoader.AddAudioResource("joe1_ejac","sound/joe/Joe_BlowLoad.mp3");
GlobalResourceLoader.AddSequentialAudioResources("joe1_grabbed{0}","sound/joe/Joe_Grabbed_{0}.mp3",1,3);
GlobalResourceLoader.AddSequentialAudioResources("joe1_hit{0}","sound/joe/Joe_Hit_{0}.mp3",3,5);
GlobalResourceLoader.AddSequentialAudioResources("joe1_knockout{0}","sound/joe/Joe_Shoulder_Hit_{0}.mp3",1,3);

GlobalResourceLoader.AddSequentialAudioResources("joe1_attack{0}","sound/joe/joe1_attack{0}.mp3",1,2);
GlobalResourceLoader.AddSequentialAudioResources("joe1_hit{0}","sound/joe/joe1_hit{0}.mp3",1,2);

function Joe1()
{
	EntityInit.call(this);
	
	this.ai = new JoeAI(this);
	this.polite = true;
	
	this.regularNames = ["Broken Joe","Exhausted Joe","Rundown Joe","Overworked Joe"];
	this.corruptNames = ["Corrupted Joe","Aroused Joe","Lewd Joe","Filthy Joe","Horny Joe","Lust-Mad Joe","Zonked Joe"];
	var randName = Math.floor((Math.random() * this.regularNames.length));
	this.displayName = this.regularNames[randName];
	this.lastDisplayName = this.displayName;
	
	// SFX
	this.attackSFX = new RandomSoundCollection("joe1_attack{0}",2);
	this.hitSFX = new RandomSoundCollection("joe1_hit{0}",2);
	this.grabbedSFX = new RandomSoundCollection("joe1_grabbed{0}",1);
	this.knockoutSFX = new RandomSoundCollection("joe1_knockout{0}",3);
	this.ejacSFX = GlobalResourceLoader.GetSound("joe1_ejac");
	this.smokeKissSFX = GlobalResourceLoader.GetSound("joe1_hit5");
	this.smokeKissFallSFX = GlobalResourceLoader.GetSound("joe1_hit4");
	
	// Combat flags
	this.alliance = 2;
	this.grabbable = true;
	this.fuckable = true;
	this.kissable = true;
	this.throwable = true;
	
	// Stats
	this.walkMaxVel = 5.4 + Math.random() * 0.1;
	this.maxHitStunFrames = 60;
	this.maxJumpFrames = 5;
	this.maxHealth = 75;
	this.staminaRecoveryPerFrame = 1.0 / (60 * 10);	// Stamina fully recovers in 10 seconds when not dazed
	this.staminaRecoveryPerFrameWhenKOed = 1.0 / (60 * 4);	// Stamina fully recovers in 4 seconds
	this.weight = 50;
	
	// Orbs
	this.orbsOnDeath = 3;
	this.orbsAfterSex = 5;
	this.heathOrbsHeld = 0;
	this.corruptionOrbsHeld = 0;
	this.dominationOrbsHeld = 0;
	
	// Collision
	this.zHeight = this.scale * 100;
	this.collisionRadius = this.scale * 10;
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * 50 / 2,y:-this.scale * 20 / 2});
	this.hitRect.expandToFit({x:this.scale * 50 / 2,y:this.scale * 20 / 2});

	// Light punch is 0.6 seconds long, that's 36 frames total
	this.lightPunchAttack = new Attack(this);
	this.lightPunchAttack.attackbox.SetBounds(100,-28,300,28);
	this.lightPunchAttack.animationTriggered = "lightpunch";
	this.lightPunchAttack.warmupframes = 19;
	this.lightPunchAttack.attackFrames = 1;
	this.lightPunchAttack.cooldownframes = 24;
	this.lightPunchAttack.damageDealt = 10;
	this.lightPunchAttack.staminaDrained = 0.1;
	this.lightPunchAttack.visualContactZ = 96 * this.scale;
	this.lightPunchAttack.hitStunDealt = 0.2;
	this.lightPunchAttack.zHeight = 80 * this.scale;
	this.lightPunchAttack.zSize = 55;
	this.lightPunchAttack.sfx = this.attackSFX;
	
	this.animationSetup();
};

Joe1.prototype.editorProperties = ['displayName','alliance','health','orbsOnDeath', 'orbsAfterSex', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld', 'lifeOrbsHeld'];
Joe1.prototype.runtimeProperties = ['lastDisplayName','newlySpawned','newlySpawnedTargetX','newlySpawnedTargetY','state','stateFrames','corrupted','recruited'];

Joe1.prototype.ReInit = function()
{
	if (this.recruited)
		this.animationModel.ApplyPrefix("boner");
};

Joe1.prototype.GetMoveMaxVelocity = function()
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

Joe1.prototype.GetStaminaRecovery = function()
{
	if (IsInvulnerable(this.state))
		return this.staminaRecoveryPerFrameWhenKOed;
	else
		return this.staminaRecoveryPerFrame; // Stamina fully recovers in 5 seconds when not dazed
};

Joe1.prototype.DrawSprite = function()
{
	// Draw shadow
	ctx.globalAlpha = 0.4 * this.alpha;
	ctx.fillStyle = "#000000";
	var shadowScale = 500 / (this.posZ + 500);
	drawEllipse(0,-6,shadowScale*180,shadowScale*40);

	ctx.globalAlpha = this.alpha;
	this.animationModel.Draw();
	
	if (debug === 2 && this.ai != null)
		this.ai.Draw();
	
	ctx.globalAlpha = 1.0;
};

Joe1.prototype.UpdateState = function()
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
			this.attack = this.lightPunchAttack;
			this.attack.Attack();
			this.animationModel.ChangeState(this.attack.animationTriggered);
			this.ChangeState(States.BasicAttack);
		}
		
		if (this.controller.smoke && !this.recruited)
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
		
		if (this.objectID % 2 === 0)
			this.animationModel.ChangeState("cheering1");
		else
			this.animationModel.ChangeState("cheering2");
			
		if (this.stateFrames === 1)
			this.animationModel.SetAllPositions(this.animationModel.state,Math.random());
		
		if (!this.controller.smoke)
		{
			this.ChangeState(States.Walk);
		}
	}
	else if (this.state === States.LoseBoner)
	{
		this.animationModel.ChangeState("loseboner");
		
		if (this.animationModel.animations["loseboner"].mainAnimation.done)
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
		if (this.stateFrames === 20)
			this.attack.PlaySFX();
			
		// Divekick is not implemented yet
		this.ChangeStateOnAttackComplete(States.Walk);
	}
	else if (this.state === States.HitStun)
	{
		if (this.stateFrames === 1)
			this.animationModel.animations["hitstun"].mainAnimation.Reset();
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
			this.animationModel.animations["captivehitstun"].mainAnimation.Reset();
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
		
		if (this.ai !== null)
			this.ai.Flush();
		
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
			this.animationModel.animations["corruptiontransform"].SetAllPositions(7/18);
		}
		
		if (this.animationModel.AnimationIsComplete("corruptiontransform"))
			this.ChangeState(States.Corrupt);
	}
	else if (this.state === States.Corrupt)
	{
		this.corrupt();
		this.animationModel.ChangeState("corrupt");
		
		var fapSpeed = 1.5 - 1.0*normalizeValue(this.stateFrames, 1, 700);
		this.animationModel.animations["corrupt"].mainAnimation.SetDurationInSeconds(fapSpeed);
		
		if (fapSpeed === 0.5 && this.animationModel.animations["corrupt"].mainAnimation.endFrame)
		{
			this.ChangeState(States.CorruptOrgasm);
		}
	}
	else if (this.state === States.CorruptOrgasm)
	{
		this.animationModel.ChangeState("faporgasm");
		
		if (this.stateFrames === 30)
		{
			this.ejacSFX.Play(1.0);
		}
		
		if (this.animationModel.animations["faporgasm"].mainAnimation.done)
		{
			level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,player.posZ+25,200,100,2.0));
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
		if (this.sexType === 0 || this.sexType === 1)
		{
			this.animationModel.ChangeState("beforesex");
		}
		else
		{
			this.animationModel.ChangeState("beforesex2");
		}
	}
	else if (this.state === States.CaptiveSexBottom)
	{
		if (this.stateFrames === 310)
		{
			this.ejacSFX.Play(1.0);
		}
	}
	else if (this.state === States.CorruptOrgasmAfterSex)
	{
		if (this.sexType === 0)
		{
			this.animationModel.ChangeState("aftersex");
		
			if (this.animationModel.AnimationIsComplete("aftersex"))
			{
				level.entities.AddEffect(new SmokeExplosion(this.posX + 150 * this.facing,this.posY - 50,this.posZ+25,200,100,2.0));
				this.ReleaseOrbs();
				this.Die();
			}
		}
		else if (this.sexType === 1)
		{
			this.animationModel.ChangeState("aftersex/drunk");
		
			if (this.animationModel.AnimationIsComplete("aftersex/drunk"))
			{
				level.entities.AddEffect(new SmokeExplosion(this.posX + 150 * this.facing,this.posY - 50,this.posZ+25,200,100,2.0));
				this.ReleaseOrbs();
				this.Die();
			}
		}
		else if (this.sexType === 2)
		{
			this.animationModel.ChangeState("aftersex2");
		
			if (this.animationModel.AnimationIsComplete("aftersex2"))
			{
				level.entities.AddEffect(new SmokeExplosion(this.posX + 150 * this.facing,this.posY - 50,this.posZ+25,200,100,2.0));
				this.ReleaseOrbs();
				this.Die();
			}
		}
	}
	else if (this.state === States.Dying)
	{
		this.orderBonus = -10;
		
		if (this.stateFrames > 60)
			this.alpha = crawlValue(this.alpha, 0, 0.01);
		
		if (this.alpha === 0)
			this.Die();
	}
};

Joe1.prototype.recruit = function(captor)
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

Joe1.prototype.unrecruit = function()
{
	if (this.recruited)
	{
		this.recruited = false;
		this.displayName = this.lastDisplayName;
		this.ChangeAlliance(2);
		this.animationModel.ClearPrefix("boner");
	}
};

Joe1.prototype.corrupt = function()
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

// All the animation frames associated with the Joe.
GlobalResourceLoader.AddImageResource("sheet_Joe1_Normal","images/joe1/sheet_Joe1_Normal.txt");
GlobalResourceLoader.AddImageResource("sheet_Joe1_Boner","images/joe1/sheet_Joe1_Boner.txt");
GlobalResourceLoader.AddImageResource("sheet_Joe1_Corrupt","images/joe1/sheet_Joe1_Corrupt.txt");
GlobalResourceLoader.AddImageResource("sheet_Joe1_HornyKiss","images/joe1/sheet_Joe1_HornyKiss.txt");

GlobalResourceLoader.AddImageResource("sheet_Bartender_Joe1Sex_Footjob","images/bartender/sheet_Bartender_Joe1Sex_Footjob.txt");
GlobalResourceLoader.AddImageResource("sheet_Bartender_Joe1Sex_Anal","images/bartender/sheet_Bartender_Joe1Sex_Anal.txt");
GlobalResourceLoader.AddImageResource("sheet_Bartender_Joe1DrunkSex_Blowjob","images/bartender/sheet_Bartender_Joe1DrunkSex_Blowjob.txt");


Joe1.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;						// This animation loops
	idleAnim.inheritFacing = 1;					// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddFrame("joe1/idle");		// All the frames and their timing info
	idleAnim.SetDurationInSeconds(1.0);				// Set how long one loop takes (in seconds)
	
	// Add the idle animation and all its transitions to the idle animation state
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	
	// Define a transition from walk to idle
	var walkToIdle = new Animation(this);
	walkToIdle.repeat = 3;
	walkToIdle.inheritFacing = 1;					// It inherits the player's facing property
	walkToIdle.matchPosition = true;
	walkToIdle.AddFrame("joe1/walk1")
	walkToIdle.SetDurationInSeconds(0.2);
	idleState.AddTransitionAnimation("walk", walkToIdle); 
	
	// Add all the animation states to the animations collection
	this.animationModel.AddState("idle",idleState);
	
	// Define the corruption TF animation
	var sexidleAnim = new Animation(this);
	sexidleAnim.repeat = 1;						// This animation is one-shot
	sexidleAnim.inheritFacing = 1;					// It inherits the player's facing property
	sexidleAnim.AddSequentialFrames("joe1/sexidle{0}",1,10);
	sexidleAnim.SetDurationInSeconds(1.25); // This is 8 fps
	
	// Extend the animation
	sexidleAnim.SetDurationInSecondsWithoutRetime(3.5);
	
	// Add the 4 loop frames
	sexidleAnim.AddTimedFrame("joe1/sexidle11",1.25);
	sexidleAnim.AddTimedFrame("joe1/sexidle12",1.25 + (1/8));
	sexidleAnim.AddTimedFrame("joe1/sexidle13",1.25 + (1/8) + 1.0);
	sexidleAnim.AddTimedFrame("joe1/sexidle14",1.25 + (2/8) + 1.0);
	
	// Loop around frames 11 and 14
	sexidleAnim.SetLoopByFrame(10,13);
	
	var sexidleState = new AnimationState();
	sexidleState.SetMainAnimation(sexidleAnim);
	this.animationModel.AddState("sexidle",sexidleState);
	
	
	// Define the walk animation
	var walkAnim = new Animation(this);
	walkAnim.repeat = 1;						// This animation loops
	walkAnim.dynamicRate = 1;					// This animation moves faster with player speed
	walkAnim.inheritFacing = 1;					// It inherits the player's facing property
	walkAnim.matchPosition = true;
	walkAnim.AddSequentialFrames("joe1/walk{0}",1,7);		// All the frames and their timing info
	walkAnim.SetDurationInSeconds(6.4);
	var walkState = new AnimationState();
	walkState.SetMainAnimation(walkAnim);
	this.animationModel.AddState("walk", walkState);
	
	// Define the hitstun animation
	var hitStunAnim = new Animation(this);
	hitStunAnim.repeat = 0;							// This animation is one-shot
	hitStunAnim.inheritFacing = 1;					// It inherits the player's facing property
	hitStunAnim.matchPosition = false;
	hitStunAnim.AddFrame("joe1/hitstun");		// All the frames and their timing info
	hitStunAnim.AddFrame("joe1/idle");		// All the frames and their timing info
	hitStunAnim.AddFrame("joe1/hitstun");		// All the frames and their timing info
	hitStunAnim.SetDurationInSeconds(this.maxHitStunFrames / 60.0);
	var hitStunState = new AnimationState();
	hitStunState.SetMainAnimation(hitStunAnim);
	this.animationModel.AddState("hitstun",hitStunState);
	
	// Define the captivehitstun animation
	var captiveHitStunAnim = new Animation(this);
	captiveHitStunAnim.repeat = 0;							// This animation is one-shot
	captiveHitStunAnim.inheritFacing = 1;					// It inherits the player's facing property
	captiveHitStunAnim.matchPosition = false;
	captiveHitStunAnim.AddFrame("joe1/hitstun");		// All the frames and their timing info
	captiveHitStunAnim.SetDurationInSeconds(0.18);
	var captiveHitStunState = new AnimationState();
	captiveHitStunState.SetMainAnimation(captiveHitStunAnim);
	this.animationModel.AddState("captivehitstun",captiveHitStunState);
	
	// Define the knockout animation
	var knockoutAnim = new Animation(this);
	knockoutAnim.repeat = 0;							// This animation is one-shot
	knockoutAnim.inheritFacing = 1;					// It inherits the player's facing property
	knockoutAnim.matchPosition = false;
	knockoutAnim.AddFrame("joe1/knockout1");		// All the frames and their timing info
	knockoutAnim.AddFrame("joe1/knockout2");	
	knockoutAnim.AddFrame("joe1/knockout3");	
	knockoutAnim.AddFrame("joe1/knockout4");	
	knockoutAnim.SetDurationInSeconds(0.6);
	var knockoutState = new AnimationState();
	knockoutState.SetMainAnimation(knockoutAnim);
	this.animationModel.AddState("knockout",knockoutState);
	
	// Define the knockout animation
	var getupAnim = new Animation(this);
	getupAnim.repeat = 0;							// This animation is one-shot
	getupAnim.inheritFacing = 1;					// It inherits the player's facing property
	getupAnim.matchPosition = false;
	getupAnim.AddFrame("joe1/getup1");		// All the frames and their timing info
	getupAnim.AddFrame("joe1/getup2");	
	getupAnim.AddFrame("joe1/getup3");	
	getupAnim.AddFrame("joe1/getup4");	
	getupAnim.SetDurationInSeconds(0.4);
	var getupState = new AnimationState();
	getupState.SetMainAnimation(getupAnim);
	this.animationModel.AddState("getup",getupState);
	
	// Define the thrown animation
	var thrownAnim = new Animation(this);
	thrownAnim.repeat = 0;							// This animation is one-shot
	thrownAnim.inheritFacing = 1;					// It inherits the player's facing property
	thrownAnim.matchPosition = false;
	thrownAnim.AddFrame("joe1/knockout2");	
	thrownAnim.AddFrame("joe1/knockout3");	
	thrownAnim.AddFrame("joe1/knockout4");	
	thrownAnim.SetDurationInSeconds(0.6);
	var thrownState = new AnimationState();
	thrownState.SetMainAnimation(thrownAnim);
	this.animationModel.AddState("thrown",thrownState);
	
	// Define the knockout animation
	var punchAnim = new Animation(this);
	punchAnim.repeat = 0;							// This animation is one-shot
	punchAnim.inheritFacing = 1;					// It inherits the player's facing property
	punchAnim.matchPosition = false;
	punchAnim.AddFrame("joe1/punch1");		// All the frames and their timing info
	punchAnim.AddFrame("joe1/punch2");	
	punchAnim.AddFrame("joe1/punch3");	
	punchAnim.AddFrame("joe1/punch4");	
	punchAnim.AddFrame("joe1/punch5");
	punchAnim.AddFrame("joe1/punch6");	
	punchAnim.AddFrame("joe1/punch7");	
	punchAnim.AddFrame("joe1/punch8");	
	punchAnim.SetDurationInSeconds(0.6);
	var punchState = new AnimationState();
	punchState.SetMainAnimation(punchAnim);
	this.animationModel.AddState("lightpunch",punchState);
	
	// Define the captive animation
	var captiveAnim = new Animation(this);
	captiveAnim.repeat = 0;							// This animation is one-shot
	captiveAnim.inheritFacing = 1;					// It inherits the player's facing property
	captiveAnim.matchPosition = false;
	captiveAnim.AddFrame("joe1/captive");		// All the frames and their timing info
	captiveAnim.SetDurationInSeconds(0.6);
	var captiveState = new AnimationState();
	captiveState.SetMainAnimation(captiveAnim);
	this.animationModel.AddState("captive",captiveState);
	
	// Define the captive smoke kiss animation
	var captiveSmokeKissAnim = new Animation(this);
	captiveSmokeKissAnim.repeat = 0;						// This animation is one-shot
	captiveSmokeKissAnim.inheritFacing = 1;					// It inherits the player's facing property
	captiveSmokeKissAnim.AddFrame("joe1/captive");
	captiveSmokeKissAnim.AddFrame("joe1/captive");
	captiveSmokeKissAnim.AddFrame("joe1/captive");
	captiveSmokeKissAnim.AddFrame("joe1/captive");
	captiveSmokeKissAnim.AddFrame("joe1/captive");
	captiveSmokeKissAnim.AddFrame("joe1/captive");
	captiveSmokeKissAnim.AddFrame("joe1/captive");
	captiveSmokeKissAnim.AddFrame("joe1/captive");
	captiveSmokeKissAnim.AddFrame("joe1/captive");
	captiveSmokeKissAnim.AddFrame("joe1/captive");
	captiveSmokeKissAnim.AddFrame("joe1/smokekiss1"); // First frame of the actual kiss
	captiveSmokeKissAnim.AddFrame("joe1/smokekiss2");
	captiveSmokeKissAnim.AddFrame("joe1/smokekiss3");
	captiveSmokeKissAnim.AddFrame("joe1/smokekiss4");
	captiveSmokeKissAnim.AddFrame("joe1/smokekiss5");
	captiveSmokeKissAnim.AddFrame("joe1/smokekiss6");
	captiveSmokeKissAnim.AddFrame("joe1/smokekiss1");
	captiveSmokeKissAnim.AddFrame("joe1/smokekiss2");
	captiveSmokeKissAnim.AddFrame("joe1/smokekiss3");
	captiveSmokeKissAnim.AddFrame("joe1/smokekiss4");
	captiveSmokeKissAnim.AddFrame("joe1/smokekiss5");
	captiveSmokeKissAnim.AddFrame("joe1/smokekiss6");
	captiveSmokeKissAnim.AddFrame("joe1/captive");
	captiveSmokeKissAnim.AddFrame("joe1/captive");
	captiveSmokeKissAnim.AddFrame("joe1/captive");
	captiveSmokeKissAnim.SetDurationInSeconds(3.0);
	var captiveSmokeKissState = new AnimationState();
	captiveSmokeKissState.SetMainAnimation(captiveSmokeKissAnim);
	this.animationModel.AddState("captivesmokekiss",captiveSmokeKissState);
	
	// Define the fall after smoke kiss animation
	
	var fallAfterSmokeKissAnim = new Animation(this);
	fallAfterSmokeKissAnim.repeat = 0;						// This animation is one-shot
	fallAfterSmokeKissAnim.inheritFacing = 1;					// It inherits the player's facing property
	fallAfterSmokeKissAnim.AddFrame("joe1/fallsmokekiss1",-10,-104);
	fallAfterSmokeKissAnim.AddFrame("joe1/fallsmokekiss2",-31, -84);
	fallAfterSmokeKissAnim.AddFrame("joe1/fallsmokekiss3",-20,-48);
	fallAfterSmokeKissAnim.AddFrame("joe1/fallsmokekiss4",-20, -50);
	fallAfterSmokeKissAnim.AddFrame("joe1/fallsmokekiss5",-20, -48);
	fallAfterSmokeKissAnim.AddFrame("joe1/fallsmokekiss5",-20, -48);
	fallAfterSmokeKissAnim.AddFrame("joe1/fallsmokekiss5",-20, -48);
	fallAfterSmokeKissAnim.AddFrame("joe1/fallsmokekiss6",-20, -48);
	fallAfterSmokeKissAnim.AddFrame("joe1/fallsmokekiss7",-20, -48);
	fallAfterSmokeKissAnim.AddFrame("joe1/fallsmokekiss8",-20, -48);
	fallAfterSmokeKissAnim.AddFrame("joe1/fallsmokekiss9",-20, -48);
	fallAfterSmokeKissAnim.AddFrame("joe1/fallsmokekiss9",-20, -48);
	fallAfterSmokeKissAnim.AddFrame("joe1/fallsmokekiss9",-20, -48);
	fallAfterSmokeKissAnim.AddFrame("joe1/fallsmokekiss9",-20, -48);
	fallAfterSmokeKissAnim.AddFrame("joe1/fallsmokekiss9",-20, -48);
	fallAfterSmokeKissAnim.AddFrame("joe1/fallsmokekiss9",-20, -48);
	fallAfterSmokeKissAnim.AddFrame("joe1/fallsmokekiss10",-2, -53);
	fallAfterSmokeKissAnim.AddFrame("joe1/fallsmokekiss11",27, -76);
	fallAfterSmokeKissAnim.SetDurationInSeconds(2.0);
	var fallAfterSmokeKissState = new AnimationState();
	fallAfterSmokeKissState.SetMainAnimation(fallAfterSmokeKissAnim);
	this.animationModel.AddState("fallaftersmokekiss",fallAfterSmokeKissState);
	
	// Define the corruption TF animation
	var losebonerAnim = new Animation(this);
	losebonerAnim.repeat = 0;						// This animation is one-shot
	losebonerAnim.inheritFacing = 1;					// It inherits the player's facing property
	losebonerAnim.AddFrame("joe1/loseboner1");
	losebonerAnim.AddFrame("joe1/loseboner2");
	losebonerAnim.AddFrame("joe1/loseboner3");
	losebonerAnim.AddFrame("joe1/loseboner4");
	losebonerAnim.AddFrame("joe1/loseboner5");
	losebonerAnim.AddFrame("joe1/loseboner6");
	losebonerAnim.AddFrame("joe1/loseboner7");
	losebonerAnim.AddFrame("joe1/loseboner8");
	losebonerAnim.AddFrame("joe1/loseboner9");
	losebonerAnim.AddFrame("joe1/loseboner10");
	losebonerAnim.AddFrame("joe1/loseboner10");
	losebonerAnim.AddFrame("joe1/loseboner10");
	losebonerAnim.AddFrame("joe1/loseboner10");
	losebonerAnim.SetDurationInSeconds(1.3);
	var losebonerState = new AnimationState();
	losebonerState.SetMainAnimation(losebonerAnim);
	this.animationModel.AddState("loseboner",losebonerState);
	
	// Define the corruption TF animation
	var corruptionTFAnim = new Animation(this);
	corruptionTFAnim.repeat = 0;						// This animation is one-shot
	corruptionTFAnim.inheritFacing = 1;					// It inherits the player's facing property
	corruptionTFAnim.AddFrame("joe1/fallsmokekiss1",-10,-104);
	corruptionTFAnim.AddFrame("joe1/fallsmokekiss2",-31, -84);
	corruptionTFAnim.AddFrame("joe1/fallsmokekiss3",-20, -48);
	corruptionTFAnim.AddFrame("joe1/fallsmokekiss4",-20, -50);
	corruptionTFAnim.AddFrame("joe1/fallsmokekiss5",-20, -48);
	corruptionTFAnim.AddFrame("joe1/fallsmokekiss5",-20, -48);
	corruptionTFAnim.AddFrame("joe1/corruption1",-20, -48);
	corruptionTFAnim.AddFrame("joe1/corruption2",-20, -48);
	corruptionTFAnim.AddFrame("joe1/corruption3",0,110);
	corruptionTFAnim.AddFrame("joe1/corruption4",0,110);
	corruptionTFAnim.AddFrame("joe1/corruption5",0,110);
	corruptionTFAnim.AddFrame("joe1/corruption6",0,110);
	corruptionTFAnim.AddFrame("joe1/corruption7",0,110);
	corruptionTFAnim.AddFrame("joe1/corruption8",0,110);
	corruptionTFAnim.AddFrame("joe1/corruption9",0,110);
	corruptionTFAnim.AddFrame("joe1/corruption10",0,110);
	corruptionTFAnim.AddFrame("joe1/corruption11",0,110);
	corruptionTFAnim.AddFrame("joe1/corruption12",0,110);
	corruptionTFAnim.SetDurationInSeconds(2.2);
	
	var corruptionTFState = new AnimationState();
	corruptionTFState.SetMainAnimation(corruptionTFAnim);
	this.animationModel.AddState("corruptiontransform",corruptionTFState);
	
	// Define the corruption TF animation
	var corruptAnim = new Animation(this);
	corruptAnim.repeat = 1;						// This animation is bou
	corruptAnim.inheritFacing = 1;					// It inherits the player's facing property
	corruptAnim.AddFrame("joe1/corruption12");
	corruptAnim.AddFrame("joe1/corruption13");
	corruptAnim.AddFrame("joe1/corruption14");
	corruptAnim.AddFrame("joe1/corruption15");
	corruptAnim.AddFrame("joe1/corruption14");
	corruptAnim.AddFrame("joe1/corruption13");
	corruptAnim.AddFrame("joe1/corruption12");
	corruptAnim.AddFrame("joe1/corruption16");
	corruptAnim.SetDurationInSeconds(1.5);
	var corruptState = new AnimationState();
	corruptState.SetMainAnimation(corruptAnim);
	this.animationModel.AddState("corrupt",corruptState);
	
	// Define the fap orgasm animation
	var faporgasmAnim = new Animation(this);
	faporgasmAnim.repeat = 0;						// This animation is bou
	faporgasmAnim.inheritFacing = 1;					// It inherits the player's facing property
	faporgasmAnim.AddFrame("joe1/faporgasm1");
	faporgasmAnim.AddFrame("joe1/faporgasm2");
	faporgasmAnim.AddFrame("joe1/faporgasm3");
	faporgasmAnim.AddFrame("joe1/faporgasm4");
	faporgasmAnim.AddFrame("joe1/faporgasm5");
	faporgasmAnim.AddFrame("joe1/faporgasm6");
	faporgasmAnim.AddFrame("joe1/faporgasm7");
	faporgasmAnim.AddFrame("joe1/faporgasm8");
	faporgasmAnim.AddFrame("joe1/faporgasm9");
	faporgasmAnim.AddFrame("joe1/faporgasm10");
	faporgasmAnim.AddFrame("joe1/faporgasm11");
	faporgasmAnim.AddFrame("joe1/faporgasm12");
	faporgasmAnim.AddFrame("joe1/faporgasm13");
	faporgasmAnim.AddFrame("joe1/faporgasm14");
	faporgasmAnim.AddFrame("joe1/faporgasm15");
	faporgasmAnim.SetDurationInSeconds(1.8);
	var faporgasmState = new AnimationState();
	faporgasmState.SetMainAnimation(faporgasmAnim);
	this.animationModel.AddState("faporgasm",faporgasmState);
	
	// Define the before and after footjob animations
	var beforeSexAnim = new Animation(this);
	beforeSexAnim.repeat = 0;
	beforeSexAnim.inheritFacing = 1;					// It inherits the player's facing property
	beforeSexAnim.AddSequentialFrames( "joe1/sex/beforesex{0}", 1,3);
	beforeSexAnim.SetDurationInSeconds(0.3);
	var beforeSexState = new AnimationState();
	beforeSexState.SetMainAnimation(beforeSexAnim);
	this.animationModel.AddState("beforesex",beforeSexState);
	
	var afterSexAnim = new Animation(this);
	afterSexAnim.repeat = 0;
	afterSexAnim.inheritFacing = 1;					// It inherits the player's facing property
	afterSexAnim.AddFrame( "joe1/sex/aftersex1");
	afterSexAnim.SetDurationInSeconds(1.0);
	var afterSexState = new AnimationState();
	afterSexState.SetMainAnimation(afterSexAnim);
	this.animationModel.AddState("aftersex",afterSexState);
	
	var afterSexAnim = new Animation(this);
	afterSexAnim.repeat = 0;
	afterSexAnim.inheritFacing = 1;					// It inherits the player's facing property
	afterSexAnim.AddFrame( "joe1/drunksex/after1");
	afterSexAnim.SetDurationInSeconds(1.0);
	var afterSexState = new AnimationState();
	afterSexState.SetMainAnimation(afterSexAnim);
	this.animationModel.AddState("aftersex/drunk",afterSexState);
	
	
	// Define the before and after footjob animations
	var beforeSexAnim = new Animation(this);
	beforeSexAnim.repeat = 0;
	beforeSexAnim.inheritFacing = 1;					// It inherits the player's facing property
	beforeSexAnim.AddSequentialFrames( "joe1/sex2/before{0}", 1,5);
	beforeSexAnim.SetDurationInSeconds(0.5);
	var beforeSexState = new AnimationState();
	beforeSexState.SetMainAnimation(beforeSexAnim);
	this.animationModel.AddState("beforesex2",beforeSexState);
	
	var afterSexAnim = new Animation(this);
	afterSexAnim.repeat = 0;
	afterSexAnim.inheritFacing = 1;					// It inherits the player's facing property
	afterSexAnim.AddSequentialFrames( "joe1/sex2/after{0}", 1,3);
	afterSexAnim.SetDurationInSeconds(0.3);
	var afterSexState = new AnimationState();
	afterSexState.SetMainAnimation(afterSexAnim);
	this.animationModel.AddState("aftersex2",afterSexState);
	
	var anim = new Animation(this);
	anim.repeat = 1;						// This animation loops
	anim.inheritFacing = 1;					// It inherits the player's facing property
	anim.AddSequentialFrames("joe1/waitcheering{0}",1,4);
	anim.SetDurationInSeconds(0.8);
	var animState = new AnimationState();
	animState.SetMainAnimation(anim);
	this.animationModel.AddState("cheering1",animState);
	
	var anim = new Animation(this);
	anim.repeat = 1;						// This animation loops
	anim.inheritFacing = 1;					// It inherits the player's facing property
	anim.AddSequentialFrames("joe1/waitaggressive{0}",1,5);
	anim.SetDurationInSeconds(1.0);
	var animState = new AnimationState();
	animState.SetMainAnimation(anim);
	this.animationModel.AddState("cheering2",animState);
	
	
	this.hornyKissLeftAnim = new Animation(this, "joe1/left_hornykiss_{0}", 6, 1.5);
	this.hornyKissLeftAnim.AddFrame("joe1/left_hornykiss_5");
	this.hornyKissLeftAnim.AddFrame("joe1/left_hornykiss_4");
	this.hornyKissLeftAnim.AddFrame("joe1/left_hornykiss_5");
	this.hornyKissLeftAnim.AddFrame("joe1/left_hornykiss_6");
	this.hornyKissLeftAnim.AddFrame("joe1/left_hornykiss_5");
	this.hornyKissLeftAnim.AddFrame("joe1/left_hornykiss_4");
	this.hornyKissLeftAnim.AddFrame("joe1/left_hornykiss_5");
	this.hornyKissLeftAnim.AddFrame("joe1/left_hornykiss_6");
	this.hornyKissLeftAnim.AddFrame("joe1/left_hornykiss_5");
	this.hornyKissLeftAnim.AddFrame("joe1/left_hornykiss_4");
	this.hornyKissLeftAnim.AddFrame("joe1/left_hornykiss_5");
	this.hornyKissLeftAnim.AddFrame("joe1/left_hornykiss_6");
	this.hornyKissLeftAnim.SetDurationInSeconds(4.5);
	this.hornyKissLeftAnim.repeat = 0;
	
	this.hornyKissRightAnim = new Animation(this, "joe1/right_hornykiss_{0}", 6, 1.5);
	this.hornyKissRightAnim.AddFrame("joe1/right_hornykiss_5");
	this.hornyKissRightAnim.AddFrame("joe1/right_hornykiss_4");
	this.hornyKissRightAnim.AddFrame("joe1/right_hornykiss_5");
	this.hornyKissRightAnim.AddFrame("joe1/right_hornykiss_6");
	this.hornyKissRightAnim.AddFrame("joe1/right_hornykiss_5");
	this.hornyKissRightAnim.AddFrame("joe1/right_hornykiss_4");
	this.hornyKissRightAnim.AddFrame("joe1/right_hornykiss_5");
	this.hornyKissRightAnim.AddFrame("joe1/right_hornykiss_6");
	this.hornyKissRightAnim.AddFrame("joe1/right_hornykiss_5");
	this.hornyKissRightAnim.AddFrame("joe1/right_hornykiss_4");
	this.hornyKissRightAnim.AddFrame("joe1/right_hornykiss_5");
	this.hornyKissRightAnim.AddFrame("joe1/right_hornykiss_6");
	this.hornyKissRightAnim.SetDurationInSeconds(4.5);
	this.hornyKissRightAnim.repeat = 0;
	
};

Joe1.prototype.Kiss = function(posX,posY,posZ, isLeft)
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

Joe1.prototype.ChangeAlliance = function(newAlliance)
{
	this.alliance = newAlliance;
	this.lightPunchAttack.alliance = newAlliance;
};

Joe1.prototype.Capture = function(captor)
{
	var captured = EntityCapture.call(this,captor);
	
	//if (captured !== null)
	//{
	//	if (this.state !== States.CorruptPrepareBeforeSex)
	//	{
	//		this.grabbedSFX.Play(1.0);
	//	}
	//}
	
	return captured;
};

Joe1.prototype.DoneWatchingSex = function()
{
	// If we are recruited, don't lose the boner
	if (!this.recruited)
		this.ChangeState(States.LoseBoner);
		
	EntityDoneWatchingSex.call(this);
};

// Boilerplate Entity Code
Joe1.prototype.Init = EntityInit;
Joe1.prototype.ChangeState = EntityChangeState;
Joe1.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
Joe1.prototype.Speed = EntitySpeed;
Joe1.prototype.Kill = EntityKill;
Joe1.prototype.ReleaseOrbs = EntityReleaseOrbs;
Joe1.prototype.Die = EntityDie;
Joe1.prototype.CancelAttack = EntityCancelAttack;
Joe1.prototype.Respawn = EntityRespawn;		
Joe1.prototype.GetGroundFriction = EntityGetGroundFriction;
// Joe1.prototype.DrawSprite = EntityDrawSprite;		// Overridden
Joe1.prototype.Draw = EntityDraw;
Joe1.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//Joe1.prototype.UpdateState = EntityUpdateState;	// Overridden
Joe1.prototype.Update = EntityUpdate;
Joe1.prototype.Push = EntityPush;
Joe1.prototype.Hit = EntityHit;
//Joe1.prototype.Capture = EntityCapture;
Joe1.prototype.Release = EntityRelease;
//Joe1.prototype.ChangeAlliance = EntityChangeAlliance;
Joe1.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
Joe1.prototype.CollisionDetection = EntityCollisionDetection;
Joe1.prototype.WatchSex = EntityWatchSex;
//Joe1.prototype.DoneWatchingSex = EntityDoneWatchingSex;
Joe1.prototype.OnRemovalFromGame = EntityOnRemovalFromGame;