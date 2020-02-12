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

GlobalResourceLoader.AddAudioResource("starvingartist_grabbed1",  "sound/enemies/starvingartist_grabbed1.mp3");
GlobalResourceLoader.AddAudioResource("starvingartist_grabbed2",  "sound/enemies/starvingartist_grabbed2.mp3");
GlobalResourceLoader.AddAudioResource("starvingartist_hit1",      "sound/enemies/starvingartist_hit1.mp3");
GlobalResourceLoader.AddAudioResource("starvingartist_hit2",      "sound/enemies/starvingartist_hit2.mp3");
GlobalResourceLoader.AddAudioResource("starvingartist_shoulder1", "sound/enemies/starvingartist_shoulder1.mp3");
GlobalResourceLoader.AddAudioResource("starvingartist_shoulder2", "sound/enemies/starvingartist_shoulder2.mp3");
GlobalResourceLoader.AddAudioResource("starvingartist_attack1",   "sound/enemies/starvingartist_attack1.mp3");
GlobalResourceLoader.AddAudioResource("starvingartist_attack2",   "sound/enemies/starvingartist_attack2.mp3");

function StarvingArtist()
{
	EntityInit.call(this);
	this.displayName = "Starving Artist";
	
	this.ai = new JoeAI(this);
	this.ai.punchDist = 100;
	
	this.hitSFX =      new RandomSoundCollection("starvingartist_hit{0}",2);
	this.grabbedSFX =  new RandomSoundCollection("starvingartist_grabbed{0}",2);
	this.knockoutSFX = new RandomSoundCollection("starvingartist_shoulder{0}",2);
	this.attackSFX =   new RandomSoundCollection("starvingartist_attack{0}",2);
	
	// Combat flags
	this.alliance = 2;
	this.grabbable = true;
	this.fuckable = false;
	this.kissable = false;
	this.throwable = true;
	this.knockoutable = true;
	this.corruptable = true;
	
	// Animation anchor points
	this.grabX = 46*this.scale;
	this.grabY = 0;
	this.grabZ = -52*this.scale;
	
	this.grabAdjustX = 0;
	this.grabAdjustY = 0;
	this.grabAdjustZ = 100;
	
	// Stats
	this.maxHealth = 30;
	this.maxHitStunFrames = 60;
	this.staminaRecoveryPerFrame = 1.0 / (60 * 10);	// Stamina fully recovers in 10 seconds when not dazed
	this.staminaRecoveryPerFrameWhenKOed = 1.0 / (60 * 4);	// Stamina fully recovers in 4 seconds
	this.weight = 20;
	this.gravity = -gravity / 2.0;
	
	this.groundFriction = 0.90;
	this.xyRatio = 0.2;
	
	this.orbsOnDeath = 8;
	this.orbsAfterSex = 0;
	this.heathOrbsHeld = 0;
	this.corruptionOrbsHeld = 0;
	this.dominationOrbsHeld = 0;
	
	this.grabFrontSprite = null;
	
	// Flags
	this.isPassThrough = false;
	
	// Collision
	this.zHeight = this.scale * 66;
	this.collisionRadius = this.scale * 10;
	
	// The grab blow attack is 30 frames long
	this.grabAttack = new Attack(this);
	this.grabAttack.alliance = 2; // Hit everyone
	this.grabAttack.attackbox.SetBounds(100,-28,300,28);
	this.grabAttack.animationTriggered = "grab";
	this.grabAttack.warmupframes = 40;
	this.grabAttack.attackFrames = 1;
	this.grabAttack.cooldownframes = 14;
	this.grabAttack.damageDealt = 0.0;
	this.grabAttack.corruptionDealt = 0.0;	
	this.grabAttack.staminaDrained = 0;
	this.grabAttack.hitStunDealt = 1.0;
	this.grabAttack.visualContactZ = 0 * this.scale;
	this.grabAttack.zHeight = 0 * this.scale;
	
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * 20,y:-this.scale * 10});
	this.hitRect.expandToFit({x:this.scale * 20,y:this.scale * 10});
	
	this.animationSetup();
};

StarvingArtist.prototype.editorProperties = ['displayName','alliance','health','orbsOnDeath', 'orbsAfterSex', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld'];
StarvingArtist.prototype.runtimeProperties = ['newlySpawned','newlySpawnedTargetX','newlySpawnedTargetY','state','stateFrames','corrupted','recruited'];

StarvingArtist.prototype.GetMoveMaxVelocity = function()
{		
	return 10.0;
};

StarvingArtist.prototype.GetStaminaRecovery = function()
{
	if (IsInvulnerable(this.state))
		return this.staminaRecoveryPerFrameWhenKOed;
	else
		return this.staminaRecoveryPerFrame; // Stamina fully recovers in 5 seconds when not dazed
};

StarvingArtist.prototype.DrawSprite = function()
{
	// Draw shadow
	drawEntityRoundShadow(this,380, 0.10);

	ctx.globalAlpha = this.alpha;
	this.animationModel.Draw();
	ctx.globalAlpha = 1.0;
	
	if (debug === 2 && this.ai != null)
		this.ai.Draw();
};

StarvingArtist.prototype.UpdateState = function()
{
	var mag = Math.sqrt(Math.pow(this.velX,2)+Math.pow(this.velY,2));
	var ang = Math.atan2(this.velY,this.velX);
	
	// Do what needs to be done in each state and change the state if needed
	if (this.state === States.Walk)
	{
		if (!this.controller.up && !this.controller.down && !this.controller.left && !this.controller.right)
		{
			this.animationModel.animations["walk"].mainAnimation.repeat = 0;
			if (mag < 1.0)
			{
				this.animationModel.ChangeState("idle");
			}
		}
		else
		{
			this.animationModel.animations["walk"].mainAnimation.repeat = 1;
			this.animationModel.ChangeState("walk");
		}
		
	
		// Apply velocity on frame 4 of the walk animation
		if (this.animationModel.state === "walk" && 	
				 this.animationModel.animations["walk"].mainAnimation.lastDisplayedFrameIndex > 3 &&
				 this.animationModel.animations["walk"].mainAnimation.lastDisplayedFrameIndex < 6 )
		{
			if (this.animationModel.animations["walk"].mainAnimation.lastDisplayedFrameIndex == 4 && 
				this.animationModel.animations["walk"].mainAnimation.lastFrameWasTransition)
			{
				this.walkAccel = 10.0;
			}
			else
			{
				this.walkAccel = 2.0;
			}
			
			this.ProcessDirectionalInput();
		}
		else
		{
			// Process just left and right to get facing property to update
			if (this.controller.right)
				this.facing = 1;
			else if (this.controller.left)
				this.facing = -1;
		}
		
		if (this.controller.jump)
		{
			if (this.velZ < 5.0)
				this.accelZ = 1.0;
		}
		
		// Change to Grab State
		if (this.controller.punchActivate())
		{
			this.attack = this.grabAttack;
			this.attack.Attack();
			this.animationModel.ChangeState(this.attack.animationTriggered);
			this.ChangeState(States.Grab);
			this.isPassThrough = true;
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
			
			if (this.grabFrontSprite !== null)
			{
				this.grabFrontSprite.state = States.Dead;
				this.grabFrontSprite = null;
			}
			this.isPassThrough = false;
			if (this.captive !== null)
			{
				if (this.captive.state === States.Snared)
					this.captive.ChangeState(States.HitStun);
				this.captive = null;
			}
			this.gravity = -gravity / 2.0;
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
		this.animationModel.ChangeState("getup");
		if (this.animationModel.AnimationIsComplete("getup"))
			this.ChangeState(States.Walk);
	}
	else if (this.state === States.CorruptionTransform)
	{
		this.animationModel.ChangeState("corruption");
		if (this.animationModel.AnimationIsComplete("corruption"))
			this.ChangeState(States.Corrupt);
	}
	else if (this.state === States.Corrupt)
	{
		this.corrupted = true;
		
		this.animationModel.ChangeState("corrupt");
		var fapSpeed = linearRemap(this.stateFrames, 1, 240, 2.5, 1.6);
		this.animationModel.animations["corrupt"].mainAnimation.SetDurationInSeconds(fapSpeed);
		
		if (fapSpeed === 1.6 && this.animationModel.animations["corrupt"].mainAnimation.endFrame)
		{
			this.ChangeState(States.CorruptOrgasm);
		}
	}
	else if (this.state === States.CorruptOrgasm)
	{
		if (this.stateFrames === 1)
		{
			this.cumSFX.Play(1.0);
		}
		this.animationModel.ChangeState("orgasm");
		if (this.animationModel.AnimationIsComplete("orgasm"))
		{
			level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,player.posZ+25,200,100,2.0));
			this.ReleaseOrbs();
			this.Die();
		}
	}
	else if (this.state === States.Grab)
	{
		this.animationModel.ChangeState("grab");
		this.orderBonus = -30;
		
		if (this.stateFrames === 15)
			this.attackSFX.Play();
			
		if (this.stateFrames > 15 && this.stateFrames < 20 && this.captive === null)
		{
			this.accelZ = 7.0;
			if (this.posZ === 0)	// Unsnap from the ground
				this.posZ = 0.1;
		}
		
		if (this.grabAttack.connected && this.captive === null && this.grabAttack.firstHitEntity !== null)
		{
			var closest = this.GetGrabCandidate();
			this.grabAttack.firstHitEntity = closest;
			if (closest !== null)
			{
				this.captive = this.grabAttack.firstHitEntity;
				this.captive.ChangeState(States.Snared)
				this.captive.facing = -this.facing;
				
				if (this.grabFrontSprite !== null)
				{
					this.grabFrontSprite.state = States.Dead;
					this.grabFrontSprite = null;
				}
				
				this.grabFrontSprite = new EffectAnimation(this.connectFrontAnimation, this, true);
				this.grabFrontSprite.holdUntilOwnerDies = true;
				level.entities.AddEffect(this.grabFrontSprite);
			}
		}
		
		if (this.captive !== null)
		{
			this.gravity = -gravity;
			this.posX = crawlValue(this.posX, this.captive.posX - this.grabX * this.facing, 35.0);
			this.posY = crawlValue(this.posY, this.captive.posY - this.grabY,35.0);
			this.posZ = crawlValue(this.posZ, this.captive.posZ - this.grabZ, 35.0);
		}
		
		if (this.stateFrames > 	(this.grabAttack.warmupframes + this.grabAttack.attackFrames) && this.captive === null)
		{
			if (this.grabFrontSprite !== null)
			{
				this.grabFrontSprite.state = States.Dead;
				this.grabFrontSprite = null;
			}
			this.gravity = -gravity / 2.0;
			this.isPassThrough = false;
			this.ChangeState(States.GrabFail);
		}
		
		// Check if we have a captive. If so, wait for them to break the snare.
		if (this.captive !== null && this.captive.state !== States.Snared)
		{
			if (this.grabFrontSprite !== null)
			{
				this.grabFrontSprite.state = States.Dead;
				this.grabFrontSprite = null;
			}
			this.accelX += -10 * this.facing;
			this.animationModel.ChangeState("idle");
			this.isPassThrough = false;
			this.captive = null;
			this.gravity = -gravity / 2.0;
			this.ChangeState(States.Walk);
		}
		
	}
	else if (this.state === States.GrabFail)
	{
		this.animationModel.ChangeState("grabfail");
		if (this.animationModel.animations["grabfail"].mainAnimation.done)
			this.ChangeState(States.Walk);
	}
	else if (this.state === States.Captive)
	{
		this.CancelAttack();
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

StarvingArtist.prototype.GetGrabCandidate = function()
{
	// Look through all the entities for one that is grabbable and within range
	var entitiesInRange = this.grabAttack.GetEntitiesInRange();
	var nearestEntity = null;
	var nearestdistance = 1000;
	
	for (var i=0; i < entitiesInRange.length; i++)
	{
		if (entitiesInRange[i].snareable && !IsInvulnerable(entitiesInRange[i].state) && entitiesInRange[i].state !== States.Snared)
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

StarvingArtist.prototype.recruit = function(captor)
{
	this.ChangeAlliance(captor.alliance);
};

StarvingArtist.prototype.unrecruit = function()
{
	this.ChangeAlliance(2);
};

StarvingArtist.prototype.corrupt = function()
{
};

// All the animation frames associated with the StarvingArtist. These are in a sprite sheet.
GlobalResourceLoader.AddImageResource("sheet_StarvingArtist","images/enemies/sheet_StarvingArtist.txt");

StarvingArtist.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleState = new AnimationState();
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;									// This animation loops
	idleAnim.inheritFacing = 1;								// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddFrame("StarvingArtist/idle1");		// All the frames and their timing info
	idleAnim.SetDurationInSeconds(1.0);							// Set how long one loop takes (in seconds)
	idleState.SetMainAnimation(idleAnim);
	this.animationModel.AddState("idle",idleState);
	
		// Define the walk animation
	var walkAnim = new Animation(this);
	walkAnim.repeat = 1;						// This animation loops
	//walkAnim.dynamicRate = 1;					// This animation moves faster with player speed
	walkAnim.inheritFacing = 1;					// It inherits the player's facing property
	walkAnim.matchPosition = true;
	walkAnim.AddSequentialFrames("StarvingArtist/walk{0}",1,3);		// All the frames and their timing info
	walkAnim.HoldFrame("StarvingArtist/walk4",2);
	walkAnim.AddSequentialFrames("StarvingArtist/walk{0}",5,7);		// All the frames and their timing info
	walkAnim.SetDurationInSeconds(1.2);
	var walkState = new AnimationState();
	walkState.SetMainAnimation(walkAnim);
	this.animationModel.AddState("walk", walkState);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("StarvingArtist/release{0}",1,5);
	animation.SetDurationInSeconds(0.5);
	
	idleState.AddTransitionAnimation("grab", animation);
	walkState.AddTransitionAnimation("grab", animation);

	
	// Define the hitstun animation
	var hitStunAnim = new Animation(this);
	hitStunAnim.repeat = 0;							// This animation is one-shot
	hitStunAnim.inheritFacing = 1;					// It inherits the player's facing property
	hitStunAnim.matchPosition = false;
	hitStunAnim.AddFrame("StarvingArtist/hitstun1");		// All the frames and their timing info
	hitStunAnim.SetDurationInSeconds(0.5);
	var hitStunState = new AnimationState();
	hitStunState.SetMainAnimation(hitStunAnim);
	this.animationModel.AddState("hitstun",hitStunState);
	
	// Define the corruption animation
	var animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("StarvingArtist/fall{0}",1,4);
	animation.AddSequentialFrames("StarvingArtist/corruption{0}",2,22);
	animation.SetDurationInSeconds(2.0);
	var state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("corruption",state);
	
	animation = new Animation(this);
	animation.repeat = 1;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("StarvingArtist/loop{0}",1,16);
	animation.SetDurationInSeconds(1.6);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("corrupt",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("StarvingArtist/orgasm{0}",1,19);
	animation.SetDurationInSeconds(1.0);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("orgasm",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("StarvingArtist/fall{0}",1,4);
	animation.SetDurationInSeconds(0.4);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("knockout",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("StarvingArtist/fall{0}",1,2);
	animation.SetDurationInSeconds(0.2);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("captive",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("StarvingArtist/attack{0}",1,9);
	animation.AddSequentialFrames("StarvingArtist/connectback{0}",1,2);
	animation.SetDurationInSeconds(1.1);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("grab",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("StarvingArtist/whiff{0}",1,4);
	animation.SetDurationInSeconds(0.5);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("grabfail",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("StarvingArtist/fall{0}",5,6);
	animation.SetDurationInSeconds(0.3);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("getup",state);
	
	this.connectFrontAnimation = new Animation(this);
	this.connectFrontAnimation.repeat = 0;							// This animation is one-shot
	this.connectFrontAnimation.inheritFacing = 1;					// It inherits the player's facing property
	this.connectFrontAnimation.AddSequentialFrames("StarvingArtist/connectfront{0}",1,4);
	this.connectFrontAnimation.SetDurationInSeconds(0.4);
};

StarvingArtist.prototype.ChangeAlliance = function(newAlliance)
{
	this.alliance = newAlliance;
	//this.grabAttack.alliance = newAlliance;
};


// Boilerplate Entity Code
StarvingArtist.prototype.Init = EntityInit;
StarvingArtist.prototype.ChangeState = EntityChangeState;
StarvingArtist.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
StarvingArtist.prototype.Speed = EntitySpeed;
StarvingArtist.prototype.Kill = EntityKill;
StarvingArtist.prototype.ReleaseOrbs = EntityReleaseOrbs;
StarvingArtist.prototype.Die = EntityDie;
StarvingArtist.prototype.CancelAttack = EntityCancelAttack;
StarvingArtist.prototype.Respawn = EntityRespawn;		
StarvingArtist.prototype.GetGroundFriction = EntityGetGroundFriction;
//StarvingArtist.prototype.DrawSprite = EntityDrawSprite;
StarvingArtist.prototype.Draw = EntityDraw;
StarvingArtist.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//StarvingArtist.prototype.UpdateState = EntityUpdateState;	// Overridden
StarvingArtist.prototype.Update = EntityUpdate;
StarvingArtist.prototype.Push = EntityPush;
StarvingArtist.prototype.Hit = EntityHit;
StarvingArtist.prototype.Capture = EntityCapture;
StarvingArtist.prototype.Release = EntityRelease;
//StarvingArtist.prototype.ChangeAlliance = EntityChangeAlliance;
StarvingArtist.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
StarvingArtist.prototype.CollisionDetection = EntityCollisionDetection;
StarvingArtist.prototype.WatchSex = EntityWatchSex;
StarvingArtist.prototype.DoneWatchingSex = EntityDoneWatchingSex;
//StarvingArtist.prototype.RequestAttackPermission = EntityRequestAttackPermission;
//StarvingArtist.prototype.ReleaseAttackPermission = EntityReleaseAttackPermission;
StarvingArtist.prototype.OnRemovalFromGame = EntityOnRemovalFromGame;


include("AICore.js");

function StarvingArtistAI(owner)
{
	AICore.call(this,owner);
};

StarvingArtistAI.prototype.GenerateNewAction = function()
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

StarvingArtistAI.prototype.QueueAction = AICore.prototype.QueueAction;
StarvingArtistAI.prototype.Flush = AICore.prototype.Flush;
StarvingArtistAI.prototype.CancelCurrentAction = AICore.prototype.CancelCurrentAction;
StarvingArtistAI.prototype.Update = AICore.prototype.Update;
StarvingArtistAI.prototype.Draw = AICore.prototype.Draw;