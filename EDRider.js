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

GlobalResourceLoader.AddAudioResource("edrider_bikeloop1","sound/enemies/edrider_bikeloop1.mp3");
GlobalResourceLoader.AddAudioResource("edrider_crash1","sound/enemies/edrider_crash1.mp3");
GlobalResourceLoader.AddAudioResource("edrider_hit1","sound/enemies/edrider_hit1.mp3");
GlobalResourceLoader.AddAudioResource("edrider_hitsplayer1","sound/enemies/edrider_hitsplayer1.mp3");

function EDRider()
{
	EntityInit.call(this);
	this.displayName = "E.D. Rider";
	
	this.ai = new EDRiderAI(this);
	
	this.engineNoise = new Music();
	this.engineNoise.tracks["idle"] = new MusicTrack("idle");
	var loopSegment = new MusicSegment("edrider_bikeloop1");
	loopSegment.nextSegment = loopSegment;
	this.engineNoise.tracks["idle"].firstSegment = loopSegment;
	this.engineNoise.setTrack("idle");
	this.engineNoise.volume = 1.0;
	
	this.hitSFX = GlobalResourceLoader.GetSound("edrider_hit1");
	this.hitPlayerSFX = GlobalResourceLoader.GetSound("edrider_hitsplayer1");
	this.crashSFX = GlobalResourceLoader.GetSound("edrider_crash1");
	
	this.cumSFX = GlobalResourceLoader.GetSound("cum12");

	
	// Combat flags
	this.alliance = 2;
	this.grabbable = false;
	this.fuckable = false;
	this.kissable = false;
	this.throwable = false;
	this.knockoutable = true;
	this.corruptable = true;
	
	this.orbsOnDeath = 6;
	this.orbsAfterSex = 0;
	this.heathOrbsHeld = 0;
	this.corruptionOrbsHeld = 0;
	this.dominationOrbsHeld = 0;
	
	this.groundFrictionKO = 0.95;
	this.groundFriction = 0.95;
	this.xyRatio = 0.25;
	this.walkAccel = 0.7;
	
	
	this.grabAdjustX = 20;
	this.grabAdjustY = 0;
	this.grabAdjustZ = -20;
	
	// Stats
	this.maxHealth = 40;
	this.maxHitStunFrames = 60;
	this.staminaRecoveryPerFrame = 1.0 / (60 * 10);	// Stamina fully recovers in 10 seconds when not dazed
	this.staminaRecoveryPerFrameWhenKOed = 1.0 / (60 * 4);	// Stamina fully recovers in 4 seconds
	this.weight = 80;

	//this.spriteCenterX = 64;
	//this.spriteCenterY = 98;
	
	// Flags
	this.facingLastFrame = 0;
	this.turnTimer = 0;
	
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
	
	this.tripAttack = new Attack(this);
	this.tripAttack.attackbox.SetBounds(-170,-28,170,28);
	this.tripAttack.warmupframes = 1;
	this.tripAttack.attackFrames = 1;
	this.tripAttack.cooldownframes = 30;
	this.tripAttack.damageDealt = 5;
	this.tripAttack.staminaDrained = 2.0;
	this.tripAttack.visualContactZ = 56 * this.scale;
	this.tripAttack.hitStunDealt = 0.8;
	this.tripAttack.remainActiveUntil = 1; // Linger until something gets hit
	this.tripAttack.knockbackMultiplierZ = 1.4;
	this.tripAttack.knockbackMultiplier = 1.4;
	
	this.animationSetup();
};

EDRider.prototype.editorProperties = ['displayName','alliance','health','orbsOnDeath', 'orbsAfterSex', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld'];
EDRider.prototype.runtimeProperties = ['newlySpawned','newlySpawnedTargetX','newlySpawnedTargetY','state','stateFrames','corrupted','recruited'];

EDRider.prototype.GetMoveMaxVelocity = function()
{		
	if (this.turnTimer > 0)
		return 0;
	else
		return 20;
};

EDRider.prototype.ChangeAlliance = function(newAlliance)
{
	this.alliance = newAlliance;
	this.tripAttack.alliance = newAlliance;
};

EDRider.prototype.GetStaminaRecovery = function()
{
	if (IsInvulnerable(this.state))
		return this.staminaRecoveryPerFrameWhenKOed;
	else
		return this.staminaRecoveryPerFrame; // Stamina fully recovers in 5 seconds when not dazed
};

EDRider.prototype.DrawSprite = function()
{
	// Draw shadow
	ctx.globalAlpha = 0.4 * this.alpha;
	ctx.fillStyle = "#000000";
	var shadowScale = 500 / (this.posZ + 500);
	
	if (this.turnTimer > 0)
		drawEllipse(-this.facing * 120,0,shadowScale*400,shadowScale*60);
	else
		drawEllipse(this.facing * 70,0,shadowScale*800,shadowScale*60);

	ctx.globalAlpha = this.alpha;
	this.animationModel.Draw();
	ctx.globalAlpha = 1.0;
	
	if (debug === 2 && this.ai != null)
		this.ai.Draw();
};

EDRider.prototype.GetGroundFriction = function()
{
	if (this.turnTimer > 0)
		return 0.99;
	else if (IsInvulnerable(this.state))
		return this.groundFrictionKO;
	else
		return this.groundFriction;
};


EDRider.prototype.UpdateState = function()
{
	var mag = Math.sqrt(Math.pow(this.velX,2)+Math.pow(this.velY,2));
	var ang = Math.atan2(this.velY,this.velX);
	
	// Do what needs to be done in each state and change the state if needed
	if (this.state === States.Walk)
	{
		// Move the character based on controller input
		if (this.turnTimer === 0)
		{
			this.ProcessDirectionalInput();
		}
		
		if (this.facingLastFrame != this.facing)
		{
			this.facingLastFrame = this.facing;
			this.turnTimer = 30;
			this.velX += -this.facing * (20-Math.abs(this.velX));
		}
		
		if (this.turnTimer > 0)
			this.turnTimer -= 1;
		
		if (this.turnTimer > 4)
		{
			this.turnTimer -= 1;
			this.animationModel.ChangeState("turn");
		}
		else if (mag < 2.6 && !this.controller.up && !this.controller.down && !this.controller.left && !this.controller.right)
		{
			this.animationModel.ChangeState("idle");
			this.tripAttack.Reset();
		}
		else
		{
			this.animationModel.ChangeState("walk");
			
			if (this.isPassThrough)
				this.tripAttack.Attack();
		}
		
		if (Math.abs(this.posX - camera.posX) < 4000)
		{
			this.engineNoise.play();
			this.engineNoise.setVolume(linearRemap(Math.abs(this.posX - camera.posX),3700,0,0,5.0*settings.baseSFXBoost));
			this.engineNoise.Update();
		}
		else
		{
			this.engineNoise.stop(0.3);
		}
	
	}
	else if (this.state === States.Fall)
	{
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		if (this.velZ > 0)
		{
			this.animationModel.ChangeState("idle");
		}
		else if (this.animationModel.state != "idle")
		{
			this.animationModel.ChangeState("idle");
		}
		
		// If we've landed on the ground
		if (this.posZ <= 0)
		{
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
	else if (this.state === States.HitStun)
	{
		if (this.stateFrames === 1)
		{
			this.animationModel.Reset("hitstun");
		}
		this.animationModel.ChangeState("hitstun");
		this.hitStunFrames -= 1.0;
		
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
		this.tripAttack.Reset();
		
		if (this.stateFrames === 1)
		{
			this.engineNoise.stop(0.5);
			this.crashSFX.Play();
			this.stamina = 0.0	
		}
		
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
		this.animationModel.ChangeState("getup");
		if (this.animationModel.AnimationIsComplete("getup"))
			this.ChangeState(States.Walk);
	}
	else if (this.state === States.CorruptionTransform)
	{
		this.tripAttack.Reset();
		this.animationModel.ChangeState("corruption");
		if (this.animationModel.AnimationIsComplete("corruption"))
			this.ChangeState(States.Corrupt);
	}
	else if (this.state === States.Corrupt)
	{
		this.corrupted = true;
		this.tripAttack.Reset();
		
		
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
		{
			this.cumSFX.Play(1.0,0.2);
		}
		this.tripAttack.Reset();
		this.animationModel.ChangeState("orgasm");
		if (this.animationModel.AnimationIsComplete("orgasm"))
		{
			level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,player.posZ+25,200,100,2.0));
			this.ReleaseOrbs();
			this.Die();
		}
	}
	
	if (controller.startActivate())
	{
		this.engineNoise.stop();
	}
};

EDRider.prototype.recruit = function(captor)
{
	this.ChangeAlliance(captor.alliance);
};

EDRider.prototype.unrecruit = function()
{
	this.ChangeAlliance(2);
};

EDRider.prototype.corrupt = function()
{
};

// All the animation frames associated with the EDRider. These are in a sprite sheet.
GlobalResourceLoader.AddImageResource("sheet_EDRider","images/enemies/sheet_EDRider.txt");

EDRider.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;									// This animation loops
	idleAnim.inheritFacing = 1;								// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddFrame("EDRider/idle1");		// All the frames and their timing info
	idleAnim.AddFrame("EDRider/idle2");		// All the frames and their timing info
	idleAnim.SetDurationByFramerate(20);							// Set how long one loop takes (in seconds)
	
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
	hitStunAnim.AddFrame("EDRider/fall1");		// All the frames and their timing info
	hitStunAnim.SetDurationInSeconds(0.1);
	var hitStunState = new AnimationState();
	hitStunState.SetMainAnimation(hitStunAnim);
	this.animationModel.AddState("hitstun",hitStunState);
	
	// Define the corruption animation
	var animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("EDRider/fall{0}",1,5);
	animation.AddSequentialFrames("EDRider/corruption{0}",1,14);
	animation.SetDurationInSeconds(1.9);
	var state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("corruption",state);
	
	animation = new Animation(this);
	animation.repeat = 1;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("EDRider/loop{0}",1,4);
	animation.SetDurationInSeconds(1.5);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("corrupt",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("EDRider/orgasm{0}",1,9);
	animation.AddSequentialFrames("EDRider/afterglow{0}",1,3);
	animation.AddFrame("EDRider/afterglow2");
	animation.AddSequentialFrames("EDRider/afterglow{0}",1,3);
	animation.AddFrame("EDRider/afterglow2");
	animation.AddSequentialFrames("EDRider/afterglow{0}",1,3);
	animation.AddFrame("EDRider/afterglow2");
	animation.SetDurationInSeconds(2.1);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("orgasm",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("EDRider/fall{0}",1,5);
	animation.SetDurationInSeconds(0.5);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("knockout",state);
	
	// Define the walk animation
	var walkAnim = new Animation(this);
	walkAnim.repeat = 1;						// This animation loops
	walkAnim.dynamicRate = 1;					// This animation moves faster with player speed
	walkAnim.inheritFacing = 1;					// It inherits the player's facing property
	walkAnim.matchPosition = true;
	walkAnim.AddSequentialFrames("EDRider/walk{0}",1,4);		// All the frames and their timing info
	walkAnim.SetDurationInSeconds(2.0);
	var walkState = new AnimationState();
	walkState.SetMainAnimation(walkAnim);
	this.animationModel.AddState("walk", walkState);
	
		// Define the turn animation
	var turnAnim = new Animation(this);
	turnAnim.inheritFacing = 2;					// It inherits the player's facing property
	turnAnim.AddFrame("EDRider/walk1");
	turnAnim.AddFrame("EDRider/turnframe1");
	turnAnim.SetDurationInSeconds(0.1);
	var turnState = new AnimationState();
	turnState.SetMainAnimation(turnAnim);
	this.animationModel.AddState("turn", turnState);
};

EDRider.prototype.Capture = function(captor)
{	
	return null;
};

EDRider.prototype.NotifyDamageDealt = function(damageDealt, corruptionDealt)
{
	EntityNotifyDamageDealt.call(this, damageDealt, corruptionDealt);
	if (damageDealt > 0)
		this.hitPlayerSFX.Play();
};

// Boilerplate Entity Code
EDRider.prototype.Init = EntityInit;
EDRider.prototype.ChangeState = EntityChangeState;
EDRider.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
EDRider.prototype.Speed = EntitySpeed;
EDRider.prototype.Kill = EntityKill;
EDRider.prototype.ReleaseOrbs = EntityReleaseOrbs;
EDRider.prototype.Die = EntityDie;
EDRider.prototype.CancelAttack = EntityCancelAttack;
EDRider.prototype.Respawn = EntityRespawn;		
//EDRider.prototype.GetGroundFriction = EntityGetGroundFriction;
//EDRider.prototype.DrawSprite = EntityDrawSprite;
EDRider.prototype.Draw = EntityDraw;
EDRider.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//EDRider.prototype.UpdateState = EntityUpdateState;	// Overridden
EDRider.prototype.Update = EntityUpdate;
EDRider.prototype.Push = EntityPush;
EDRider.prototype.Hit = EntityHit;
//EDRider.prototype.Capture = EntityCapture;
EDRider.prototype.Release = EntityRelease;
//EDRider.prototype.ChangeAlliance = EntityChangeAlliance;
//EDRider.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
EDRider.prototype.CollisionDetection = EntityCollisionDetection;
EDRider.prototype.WatchSex = EntityWatchSex;
EDRider.prototype.DoneWatchingSex = EntityDoneWatchingSex;
//EDRider.prototype.RequestAttackPermission = EntityRequestAttackPermission;
//EDRider.prototype.ReleaseAttackPermission = EntityReleaseAttackPermission;
EDRider.prototype.OnRemovalFromGame = EntityOnRemovalFromGame;


include("AICore.js");

function EDRiderAI(owner)
{
	AICore.call(this,owner);
	this.direction = owner.facing;
};

EDRiderAI.prototype.GenerateNewAction = function()
{	
	if (this.owner.posX < player.posX)
		this.direction = 1;
	else
		this.direction = -1;
	
	var newAction = new GoToPointAction(player.posX + 1400 * this.direction, player.posY + (Math.random()-0.5) * 300, 20, true);
	newAction.timeout = 90 + (Math.random()-0.5) * 60;
	this.QueueAction(newAction);
};

EDRiderAI.prototype.QueueAction = AICore.prototype.QueueAction;
EDRiderAI.prototype.Flush = AICore.prototype.Flush;
EDRiderAI.prototype.CancelCurrentAction = AICore.prototype.CancelCurrentAction;
EDRiderAI.prototype.Update = AICore.prototype.Update;
EDRiderAI.prototype.Draw = AICore.prototype.Draw;
EDRiderAI.prototype.UpdateTargetPosition = AICore.prototype.UpdateTargetPosition;