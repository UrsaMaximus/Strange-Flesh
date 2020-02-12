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

// SFX
GlobalResourceLoader.AddAudioResource("officeangel_grabbed1","sound/enemies/officeangel_grabbed1.mp3");
GlobalResourceLoader.AddAudioResource("officeangel_grabbed2","sound/enemies/officeangel_grabbed2.mp3");
GlobalResourceLoader.AddAudioResource("officeangel_hit1","sound/enemies/officeangel_hit1.mp3");
GlobalResourceLoader.AddAudioResource("officeangel_hit2","sound/enemies/officeangel_hit2.mp3");
GlobalResourceLoader.AddAudioResource("officeangel_shoulder1","sound/enemies/officeangel_shoulder1.mp3");
GlobalResourceLoader.AddAudioResource("officeangel_shoulder2","sound/enemies/officeangel_shoulder2.mp3");

function OfficeAngel()
{
	EntityInit.call(this);
	this.displayName = "Office Angel";
	
	this.ai = new OfficeAngelAI(this);
	
	
	
	this.hitSFX = new RandomSoundCollection("officeangel_hit{0}",2);
	this.grabbedSFX = new RandomSoundCollection("officeangel_grabbed{0}",2);
	this.knockoutSFX = new RandomSoundCollection("officeangel_shoulder{0}",2);
	
	this.cum1SFX = GlobalResourceLoader.GetSound("cum1");
	this.cum2SFX = GlobalResourceLoader.GetSound("cum12");
	
	// Combat flags
	this.alliance = 2;
	this.grabbable = true;
	this.fuckable = false;
	this.kissable = false;
	this.throwable = true;
	this.knockoutable = true;
	this.corruptable = true;
	
	this.grabAdjustX = -20;
	this.grabAdjustY = 0;
	this.grabAdjustZ = 170;
	
	// Stats
	this.maxHealth = 30;
	this.maxHitStunFrames = 60;
	this.staminaRecoveryPerFrame = 1.0 / (60 * 10);	// Stamina fully recovers in 10 seconds when not dazed
	this.staminaRecoveryPerFrameWhenKOed = 1.0 / (60 * 4);	// Stamina fully recovers in 4 seconds
	this.weight = 20;
	
	this.orbsOnDeath = 4;
	this.orbsAfterSex = 0;
	this.heathOrbsHeld = 0;
	this.corruptionOrbsHeld = 0;
	this.dominationOrbsHeld = 0;
	
	//this.spriteCenterX = 64;
	//this.spriteCenterY = 98;
	
	// Flags
	this.isPassThrough = true;
	this.afraidOfBartender = false;
	
	// Collision
	this.zHeight = this.scale * 66;
	this.collisionRadius = this.scale * 10;
	
	this.tripAttack = new Attack(this);
	this.tripAttack.attackbox.SetBounds(-28,-28,28,28);
	this.tripAttack.warmupframes = 1;
	this.tripAttack.attackFrames = 1;
	this.tripAttack.cooldownframes = 30;
	this.tripAttack.damageDealt = 5;
	this.tripAttack.staminaDrained = 0.99;
	this.tripAttack.visualContactZ = 10 * this.scale;
	this.tripAttack.hitStunDealt = 0.8;
	this.tripAttack.remainActiveUntil = 1; // Linger until something gets hit
	
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * 20,y:-this.scale * 10});
	this.hitRect.expandToFit({x:this.scale * 20,y:this.scale * 10});
	
	this.animationSetup();
};

OfficeAngel.prototype.editorProperties = ['displayName','alliance','health','orbsOnDeath', 'orbsAfterSex', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld'];
OfficeAngel.prototype.runtimeProperties = ['newlySpawned','newlySpawnedTargetX','newlySpawnedTargetY','state','stateFrames','corrupted','recruited'];

OfficeAngel.prototype.GetMoveMaxVelocity = function()
{		
	return 10.5;
};

OfficeAngel.prototype.GetStaminaRecovery = function()
{
	if (IsInvulnerable(this.state))
		return this.staminaRecoveryPerFrameWhenKOed;
	else
		return this.staminaRecoveryPerFrame; // Stamina fully recovers in 5 seconds when not dazed
};

OfficeAngel.prototype.DrawSprite = function()
{
	// Draw shadow
	ctx.globalAlpha = 0.4 * this.alpha;
	ctx.fillStyle = "#000000";
	var shadowScale = 500 / (this.posZ + 500);
	drawEllipse(0,0,shadowScale*180,shadowScale*60);

	ctx.globalAlpha = this.alpha;
	this.animationModel.Draw();
	ctx.globalAlpha = 1.0;
	
	if (debug === 2 && this.ai != null)
		this.ai.Draw();
};

OfficeAngel.prototype.dropItem = function(count, velX, velZ)
{
	if(typeof(count)==='undefined') count = 1;
	if(typeof(velX)==='undefined') velX = 0;
	if(typeof(velZ)==='undefined') velZ = 0;

	for (var i = 0; i < count; i++)
	{
		var animation = getRandomItemFromArray(this.itemAnimations).Clone();
		
										//animation, source, lifespan, offsetX, offsetZ, hitGroundSFX
		var heldItem = new DroppedItem(animation, this, 300, -6*this.facing, 240);
		heldItem.velX = -this.velXEffective*0.04 + -Math.random() * this.facing + velX;
		heldItem.velZ = 1 + Math.random() + velZ
		heldItem.gravity = gravity * 0.3;
		heldItem.airFriction = 0.5;
		heldItem.elasticity = 0;
		level.entities.AddEffect(heldItem);
	}
};


OfficeAngel.prototype.UpdateState = function()
{
	var mag = Math.sqrt(Math.pow(this.velX,2)+Math.pow(this.velY,2));
	var ang = Math.atan2(this.velY,this.velX);
	
	// Do what needs to be done in each state and change the state if needed
	if (this.state === States.Walk)
	{
		if (mag < 2.6 && !this.controller.up && !this.controller.down && !this.controller.left && !this.controller.right)
		{
			this.animationModel.ChangeState("idle");
			this.tripAttack.Reset();
		}
		else
		{
			this.animationModel.ChangeState("walk");
			this.tripAttack.Attack();
		}
	
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		if (mag > 2.6 && Math.random() > 0.97)
		{
			this.dropItem();
		}
		
		if (this.controller.jump)
		{
			if (this.velZ < 5.0)
				this.accelZ = 1.0;
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
			this.dropItem(3, this.facing * -10, 10);
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
		if (this.stateFrames === 1)
		{
			this.dropItem(5, this.facing * -10 * Math.random(), 10 * Math.random());
			this.stamina = 0.0
		}
		
		this.animationModel.ChangeState("knockout");
		
		this.CancelAttack();
		this.tripAttack.Reset();
		
		if (this.health <= 0 && this.stateFrames > 90)
		{
			level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,player.posZ+25,200,100,2.0));
			this.ReleaseOrbs();
			this.Die();
		}
		
		if (this.stamina >= 1.0)
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
		var fapSpeed = linearRemap(this.stateFrames, 1, 240, 0.9, 0.5);
		this.animationModel.animations["corrupt"].mainAnimation.SetDurationInSeconds(fapSpeed);
		
		if (fapSpeed === 0.5 && this.animationModel.animations["corrupt"].mainAnimation.endFrame)
		{
			this.ChangeState(States.CorruptOrgasm);
		}
	}
	else if (this.state === States.CorruptOrgasm)
	{
		this.tripAttack.Reset();
		if (this.stateFrames === 1)
		{
			this.cum1SFX.Play(1.0,0.3);
			this.cum2SFX.Play(1.0,1.4);
		}
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
		this.CancelAttack();
		this.tripAttack.Reset();
		if (this.prepareForThrow)
			this.animationModel.ChangeState("knockout");
		else
			this.animationModel.ChangeState("hitstun");
	}
	else if (this.state === States.Thrown)
	{
		this.ChangeState(States.KnockedOut);
	}
	
};

OfficeAngel.prototype.recruit = function(captor)
{
	this.ChangeAlliance(captor.alliance);
};

OfficeAngel.prototype.unrecruit = function()
{
	this.ChangeAlliance(2);
};

OfficeAngel.prototype.corrupt = function()
{
};

// All the animation frames associated with the OfficeAngel. These are in a sprite sheet.
GlobalResourceLoader.AddImageResource("sheet_OfficeAngel","images/enemies/sheet_OfficeAngel.txt");

OfficeAngel.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;									// This animation loops
	idleAnim.inheritFacing = 1;								// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddSequentialFrames("officeangel/idle{0}",2,13);		// All the frames and their timing info
	idleAnim.SetDurationInSeconds(2.0);							// Set how long one loop takes (in seconds)
	
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
	hitStunAnim.AddFrame("officeangel/hitstun");		// All the frames and their timing info
	hitStunAnim.SetDurationInSeconds(0.5);
	var hitStunState = new AnimationState();
	hitStunState.SetMainAnimation(hitStunAnim);
	this.animationModel.AddState("hitstun",hitStunState);
	
	// Define the corruption animation
	var animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("officeangel/fall{0}",1,4);
	animation.AddSequentialFrames("officeangel/corruption{0}",1,16);
	animation.SetDurationInSeconds(2.0);
	var state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("corruption",state);
	
	animation = new Animation(this);
	animation.repeat = 1;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("officeangel/corruptionloop{0}",1,4);
	//animation.AddFrame("officeangel/corruptionloop3");
	animation.SetDurationInSeconds(1.5);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("corrupt",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("officeangel/orgasm{0}",1,24);
	animation.SetDurationInSeconds(2.4);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("orgasm",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("officeangel/fall{0}",1,4);
	animation.SetDurationInSeconds(0.4);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("knockout",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("officeangel/fall{0}",5,6);
	animation.SetDurationInSeconds(0.3);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("getup",state);
	
	// Define the walk animation
	var walkAnim = new Animation(this);
	walkAnim.repeat = 1;						// This animation loops
	walkAnim.dynamicRate = 1;					// This animation moves faster with player speed
	walkAnim.inheritFacing = 1;					// It inherits the player's facing property
	walkAnim.matchPosition = true;
	walkAnim.AddSequentialFrames("officeangel/walking{0}",1,4);		// All the frames and their timing info
	walkAnim.SetDurationInSeconds(6.4);
	var walkState = new AnimationState();
	walkState.SetMainAnimation(walkAnim);
	this.animationModel.AddState("walk", walkState);
	
	this.itemAnimations = [
							new Animation(null,"officeangel/particle{0}", 3, 0.6, 0)
						  ];
	
};

OfficeAngel.prototype.Hit = function(attack, isCaptive)
{
	EntityHit.call(this, attack, isCaptive);
	
	if (attack.owner === player)
		this.afraidOfBartender = true;
}

OfficeAngel.prototype.ChangeAlliance = function(newAlliance)
{
	this.alliance = newAlliance;
	this.tripAttack.alliance = newAlliance;
};


// Boilerplate Entity Code
OfficeAngel.prototype.Init = EntityInit;
OfficeAngel.prototype.ChangeState = EntityChangeState;
OfficeAngel.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
OfficeAngel.prototype.Speed = EntitySpeed;
OfficeAngel.prototype.Kill = EntityKill;
OfficeAngel.prototype.ReleaseOrbs = EntityReleaseOrbs;
OfficeAngel.prototype.Die = EntityDie;
OfficeAngel.prototype.CancelAttack = EntityCancelAttack;
OfficeAngel.prototype.Respawn = EntityRespawn;		
OfficeAngel.prototype.GetGroundFriction = EntityGetGroundFriction;
//OfficeAngel.prototype.DrawSprite = EntityDrawSprite;
OfficeAngel.prototype.Draw = EntityDraw;
OfficeAngel.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//OfficeAngel.prototype.UpdateState = EntityUpdateState;	// Overridden
OfficeAngel.prototype.Update = EntityUpdate;
OfficeAngel.prototype.Push = EntityPush;
//OfficeAngel.prototype.Hit = EntityHit;
OfficeAngel.prototype.Capture = EntityCapture;
OfficeAngel.prototype.Release = EntityRelease;
//OfficeAngel.prototype.ChangeAlliance = EntityChangeAlliance;
OfficeAngel.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
OfficeAngel.prototype.CollisionDetection = EntityCollisionDetection;
OfficeAngel.prototype.WatchSex = EntityWatchSex;
OfficeAngel.prototype.DoneWatchingSex = EntityDoneWatchingSex;
//OfficeAngel.prototype.RequestAttackPermission = EntityRequestAttackPermission;
//OfficeAngel.prototype.ReleaseAttackPermission = EntityReleaseAttackPermission;
OfficeAngel.prototype.OnRemovalFromGame = EntityOnRemovalFromGame;


include("AICore.js");

function OfficeAngelAI(owner)
{
	AICore.call(this,owner);
};

OfficeAngelAI.prototype.GenerateNewAction = function()
{
	
	var followTarget = null;

	// If there is a nearby monitor, flee from it
	followTarget = level.entities.FindClosestEntityOfType(this.owner, 600, Admonitor);
	
	if (followTarget != null)
	{
		this.QueueAction(new FleeAction(followTarget, 700));
		return;
	}
	
	if (this.owner.afraidOfBartender && player != null && distanceActorToActor(player, this.owner) < 300)
	{
		this.QueueAction(new FleeAction(player, 700));
		return;
	}
	
	// If there's nothing to do, wait 15 frames before evaluating again to lower CPU usage
	// And to make the AI seem more human by giving it some reaction time.
	this.QueueAction(new WaitAction(15));
};

OfficeAngelAI.prototype.QueueAction = AICore.prototype.QueueAction;
OfficeAngelAI.prototype.Flush = AICore.prototype.Flush;
OfficeAngelAI.prototype.CancelCurrentAction = AICore.prototype.CancelCurrentAction;
OfficeAngelAI.prototype.Update = AICore.prototype.Update;
OfficeAngelAI.prototype.Draw = AICore.prototype.Draw;