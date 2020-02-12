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

GlobalResourceLoader.AddAudioResource("punkpuppy_attack1","sound/enemies/punkpuppy_attack1.mp3");
GlobalResourceLoader.AddAudioResource("punkpuppy_attack2","sound/enemies/punkpuppy_attack2.mp3");
GlobalResourceLoader.AddAudioResource("punkpuppy_grabbed1","sound/enemies/punkpuppy_grabbed1.mp3");
GlobalResourceLoader.AddAudioResource("punkpuppy_grabbed2","sound/enemies/punkpuppy_grabbed2.mp3");
GlobalResourceLoader.AddAudioResource("punkpuppy_hit1","sound/enemies/punkpuppy_hit1.mp3");
GlobalResourceLoader.AddAudioResource("punkpuppy_hit2","sound/enemies/punkpuppy_hit2.mp3");
GlobalResourceLoader.AddAudioResource("punkpuppy_shoulder1","sound/enemies/punkpuppy_shoulder1.mp3");
GlobalResourceLoader.AddAudioResource("punkpuppy_shoulder2","sound/enemies/punkpuppy_shoulder2.mp3");

function PunkPuppy()
{
	EntityInit.call(this);
	this.displayName = "Punk Puppy";
	
	this.ai = new PunkPuppyAI(this);
	
	this.attackSFX = new RandomSoundCollection("punkpuppy_attack{0}",2);
	this.hitSFX = new RandomSoundCollection("punkpuppy_hit{0}",2);
	this.grabbedSFX = new RandomSoundCollection("punkpuppy_grabbed{0}",2);
	this.knockoutSFX = new RandomSoundCollection("punkpuppy_shoulder{0}",2);
	
	this.cumSFX = GlobalResourceLoader.GetSound("cum9");
	
	// Combat flags
	this.alliance = 2;
	this.grabbable = true;
	this.fuckable = false;
	this.kissable = false;
	this.throwable = true;
	this.knockoutable = true;
	this.corruptable = true;
	
	this.orbsOnDeath = 6;
	this.orbsAfterSex = 0;
	this.heathOrbsHeld = 0;
	this.corruptionOrbsHeld = 0;
	this.dominationOrbsHeld = 0;
	
	//this.groundFrictionKO = 0.95;
	//this.groundFriction = 0.95;
	//this.xyRatio = 0.25;
	//this.walkAccel = 0.7;
	
	this.gravity = - gravity / 2.0;
	
	
	this.grabAdjustX = 20;
	this.grabAdjustY = 0;
	this.grabAdjustZ = 160;
	
	// Stats
	this.maxJumpFrames = 20;
	this.maxHealth = 40;
	this.maxHitStunFrames = 60;
	this.staminaRecoveryPerFrame = 1.0 / (60 * 10);	// Stamina fully recovers in 10 seconds when not dazed
	this.staminaRecoveryPerFrameWhenKOed = 1.0 / (60 * 4);	// Stamina fully recovers in 4 seconds
	this.weight = 80;
	
	// Collision
	this.zHeight = this.scale * 130;
	this.collisionRadius = this.scale * 14;
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * 58,y:-this.scale * 14});
	this.hitRect.expandToFit({x:this.scale * 58,y:this.scale * 14});
	
	this.isPassThrough = true;
	
	this.jumpAttack = new Attack(this);
	this.jumpAttack.attackbox.SetBounds(-170,-28,170,28);
	this.jumpAttack.warmupframes = 10;
	this.jumpAttack.attackFrames = 1;
	this.jumpAttack.cooldownframes = 30;
	this.jumpAttack.damageDealt = 5;
	this.jumpAttack.staminaDrained = 2.0;
	this.jumpAttack.visualContactZ = 56 * this.scale;
	this.jumpAttack.hitStunDealt = 0.8;
	this.jumpAttack.remainActiveUntil = 1; // Linger until something gets hit
	this.jumpAttack.knockbackMultiplierZ = 1.4;
	this.jumpAttack.knockbackMultiplier = 1.4;
	
	this.animationSetup();
};

PunkPuppy.prototype.editorProperties = ['displayName','alliance','health','orbsOnDeath', 'orbsAfterSex', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld'];
PunkPuppy.prototype.runtimeProperties = ['newlySpawned','newlySpawnedTargetX','newlySpawnedTargetY','state','stateFrames','corrupted','recruited'];

PunkPuppy.prototype.GetMoveMaxVelocity = function()
{		
	return 15;
};

PunkPuppy.prototype.ChangeAlliance = function(newAlliance)
{
	this.alliance = newAlliance;
	this.jumpAttack.alliance = newAlliance;
};

PunkPuppy.prototype.GetStaminaRecovery = function()
{
	if (IsInvulnerable(this.state))
		return this.staminaRecoveryPerFrameWhenKOed;
	else
		return this.staminaRecoveryPerFrame; // Stamina fully recovers in 5 seconds when not dazed
};

PunkPuppy.prototype.DrawSprite = function()
{
	// Draw shadow
	ctx.globalAlpha = 0.4 * this.alpha;
	ctx.fillStyle = "#000000";
	var shadowScale = 500 / (this.posZ + 500);
	
	drawEllipse(0,0,shadowScale*400,shadowScale*60);

	ctx.globalAlpha = this.alpha;
	this.animationModel.Draw();
	ctx.globalAlpha = 1.0;
	
	if (debug === 2 && this.ai != null)
		this.ai.Draw();
};

PunkPuppy.prototype.GetGroundFriction = function()
{
	if (IsInvulnerable(this.state))
		return this.groundFrictionKO;
	else
		return this.groundFriction;
};


PunkPuppy.prototype.UpdateState = function()
{
	var mag = Math.sqrt(Math.pow(this.velX,2)+Math.pow(this.velY,2));
	var ang = Math.atan2(this.velY,this.velX);
	
	
	// Do what needs to be done in each state and change the state if needed
	if (this.state === States.Walk)
	{
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		if (mag < 2.6 && !this.controller.up && !this.controller.down && !this.controller.left && !this.controller.right)
		{
			this.animationModel.ChangeState("idle");
		}
		else
		{
			this.animationModel.ChangeState("walk");
		}
		this.jumpAttack.Reset();
		
		if (this.controller.jumpActivate())
		{
			this.ChangeState(States.Jump);
		}
	
	}
	else if (this.state === States.Jump)
	{	
		this.animationModel.ChangeState("jumpPrepare");
		
		if (this.stateFrames === 40)
		{
			this.jumpAttack.Attack();
			this.animationModel.ChangeState("jump");
			this.attackSFX.Play(1.5);
			this.accelX += this.facing * 20;
			this.accelZ += 30;
			if (this.posZ === 0)
				this.posZ = 0.01;
			this.ChangeState(States.FallHelpless);
		}
		
	}
	else if (this.state === States.Fall)
	{
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		// If we've landed on the ground
		if (this.posZ <= 0)
		{
			this.ChangeState(States.Walk);
		}
	}
	else if (this.state === States.FallHelpless)
	{
		// Move the character based on controller input
		//this.ProcessDirectionalInput();
		
		if (this.posZ <= 0)
			this.ChangeState(States.Walk);
	}
	else if (this.state === States.HitStun)
	{
		if (this.stateFrames === 1)
		{
			this.animationModel.Reset("hitstun");
		}
		this.animationModel.ChangeState("hitstun");
		this.hitStunFrames -= 1.0;
		
		this.jumpAttack.Reset();
		this.CancelAttack();
		
		if (this.hitStunFrames <= 0)
		{
			this.hitStunFrames = 0;
			if (this.health === 0)
				this.ChangeState(States.KnockedOut);
			else
				this.ChangeState(States.Walk);
		}
	}
	else if (this.state === States.KnockedOut)
	{
		this.animationModel.ChangeState("knockout");
		this.CancelAttack();
		this.jumpAttack.Reset();
		
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
	else if (this.state === States.GetUp)
	{
		this.jumpAttack.Reset();
		this.animationModel.ChangeState("getup");
		if (this.animationModel.AnimationIsComplete("getup"))
			this.ChangeState(States.Walk);
	}
	else if (this.state === States.CorruptionTransform)
	{
		this.jumpAttack.Reset();
		this.animationModel.ChangeState("corruption");
		if (this.animationModel.AnimationIsComplete("corruption"))
			this.ChangeState(States.Corrupt);
	}
	else if (this.state === States.Corrupt)
	{
		this.corrupted = true;
		this.jumpAttack.Reset();
		this.animationModel.ChangeState("corrupt");
		var fapSpeed = linearRemap(this.stateFrames, 1, 300, 1.0, 0.4);
		this.animationModel.animations["corrupt"].mainAnimation.SetDurationInSeconds(fapSpeed);
		
		if (fapSpeed === 0.4 && this.animationModel.animations["corrupt"].mainAnimation.endFrame)
		{
			this.ChangeState(States.CorruptOrgasm);
		}
	}
	else if (this.state === States.CorruptOrgasm)
	{
		if (this.stateFrames === 1)
			this.cumSFX.Play(1.0,0.1);
		this.jumpAttack.Reset();
		this.animationModel.ChangeState("orgasm");
		if (this.animationModel.AnimationIsComplete("orgasm"))
		{
			level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,player.posZ+25,200,100,2.0));
			this.ReleaseOrbs();
			this.Die();
		}
	}
	else if (this.state === States.Captive)
	{
		if (this.prepareForThrow)
			this.animationModel.ChangeState("knockout");
		else
			this.animationModel.ChangeState("captive");
	}
	else if (this.state === States.Thrown)
	{
		this.ChangeState(States.KnockedOut);
	}
	
};

PunkPuppy.prototype.recruit = function(captor)
{
	this.ChangeAlliance(captor.alliance);
};

PunkPuppy.prototype.unrecruit = function()
{
	this.ChangeAlliance(2);
};

PunkPuppy.prototype.corrupt = function()
{
};

// All the animation frames associated with the PunkPuppy. These are in a sprite sheet.
GlobalResourceLoader.AddImageResource("sheet_PunkPuppy","images/enemies/sheet_PunkPuppy.txt");

PunkPuppy.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;									// This animation loops
	idleAnim.inheritFacing = 1;								// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddFrame("PunkPuppy/idle");		// All the frames and their timing info
	idleAnim.SetDurationInSeconds(1.0);
	
	// Add the idle animation and all its transitions to the idle animation state
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	
	// Add all the animation states to the animations collection
	this.animationModel.AddState("idle",idleState);
	
	// Define the hitstun animation
	var hitStunAnim = new Animation(this);
	hitStunAnim.repeat = 0;							// This animation is one-shot
	hitStunAnim.inheritFacing = 1;					// It inherits the player's facing property
	hitStunAnim.matchPosition = false;
	hitStunAnim.AddFrame("PunkPuppy/hitstun");		// All the frames and their timing info
	hitStunAnim.SetDurationInSeconds(0.1);
	var hitStunState = new AnimationState();
	hitStunState.SetMainAnimation(hitStunAnim);
	this.animationModel.AddState("hitstun",hitStunState);
	
	// Define the corruption animation
	var animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("PunkPuppy/fall{0}",1,5);
	animation.AddSequentialFrames("PunkPuppy/corruption{0}",1,15);
	animation.AddSequentialFrames("PunkPuppy/loop{0}",5,7);
	animation.SetDurationInSeconds(2.3);
	var state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("corruption",state);
	
	animation = new Animation(this);
	animation.repeat = 1;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("PunkPuppy/loop{0}",1,7);
	animation.SetDurationInSeconds(2.0);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("corrupt",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("PunkPuppy/orgasm{0}",1,16);
	animation.SetDurationInSeconds(1.6);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("orgasm",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("PunkPuppy/fall{0}",1,5);
	animation.SetDurationInSeconds(0.5);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("knockout",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddFrame("PunkPuppy/hitstun");
	animation.AddFrame("PunkPuppy/fall1");
	animation.AddFrame("PunkPuppy/fall2");
	animation.SetDurationInSeconds(0.3);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("captive",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddFrame("PunkPuppy/attack1");
	animation.SetDurationInSeconds(0.4);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("jumpPrepare",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("PunkPuppy/attack{0}",2,4);
	animation.SetDurationInSeconds(0.4);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("jump",state);
	
	// Define the walk animation
	var walkAnim = new Animation(this);
	walkAnim.repeat = 1;						// This animation loops
	walkAnim.dynamicRate = 1;					// This animation moves faster with player speed
	walkAnim.inheritFacing = 1;					// It inherits the player's facing property
	walkAnim.matchPosition = true;
	walkAnim.AddSequentialFrames("PunkPuppy/walk{0}",1,12);		// All the frames and their timing info
	walkAnim.SetDurationInSeconds(18);
	var walkState = new AnimationState();
	walkState.SetMainAnimation(walkAnim);
	this.animationModel.AddState("walk", walkState);
};


// Boilerplate Entity Code
PunkPuppy.prototype.Init = EntityInit;
PunkPuppy.prototype.ChangeState = EntityChangeState;
PunkPuppy.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
PunkPuppy.prototype.Speed = EntitySpeed;
PunkPuppy.prototype.Kill = EntityKill;
PunkPuppy.prototype.ReleaseOrbs = EntityReleaseOrbs;
PunkPuppy.prototype.Die = EntityDie;
PunkPuppy.prototype.CancelAttack = EntityCancelAttack;
PunkPuppy.prototype.Respawn = EntityRespawn;		
//PunkPuppy.prototype.GetGroundFriction = EntityGetGroundFriction;
//PunkPuppy.prototype.DrawSprite = EntityDrawSprite;
PunkPuppy.prototype.Draw = EntityDraw;
PunkPuppy.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//PunkPuppy.prototype.UpdateState = EntityUpdateState;	// Overridden
PunkPuppy.prototype.Update = EntityUpdate;
PunkPuppy.prototype.Push = EntityPush;
PunkPuppy.prototype.Hit = EntityHit;
PunkPuppy.prototype.Capture = EntityCapture;
PunkPuppy.prototype.Release = EntityRelease;
//PunkPuppy.prototype.ChangeAlliance = EntityChangeAlliance;
PunkPuppy.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
PunkPuppy.prototype.CollisionDetection = EntityCollisionDetection;
PunkPuppy.prototype.WatchSex = EntityWatchSex;
PunkPuppy.prototype.DoneWatchingSex = EntityDoneWatchingSex;
//PunkPuppy.prototype.RequestAttackPermission = EntityRequestAttackPermission;
//PunkPuppy.prototype.ReleaseAttackPermission = EntityReleaseAttackPermission;
PunkPuppy.prototype.OnRemovalFromGame = EntityOnRemovalFromGame;


include("AICore.js");

function PunkPuppyAI(owner)
{
	AICore.call(this,owner);
	this.direction = owner.facing;
};

PunkPuppyAI.prototype.GenerateNewAction = function()
{	
	if (this.owner.posX < player.posX)
		this.direction = 1;
	else
		this.direction = -1;
	
	var newAction = new GoToPointAction(player.posX + 1400 * this.direction, player.posY + (Math.random()-0.5) * 300, 20, true);
	newAction.deadZoneX = 10;
	newAction.deadZoneY = 10;
	newAction.timeout = 90 + (Math.random()-0.5) * 60;
	this.QueueAction(newAction);
	
	newAction = new LeapAttackAction(player);
	
	this.QueueAction(newAction);
};

PunkPuppyAI.prototype.QueueAction = AICore.prototype.QueueAction;
PunkPuppyAI.prototype.Flush = AICore.prototype.Flush;
PunkPuppyAI.prototype.CancelCurrentAction = AICore.prototype.CancelCurrentAction;
PunkPuppyAI.prototype.Update = AICore.prototype.Update;
PunkPuppyAI.prototype.Draw = AICore.prototype.Draw;
PunkPuppyAI.prototype.UpdateTargetPosition = AICore.prototype.UpdateTargetPosition;