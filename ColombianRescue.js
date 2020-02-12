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

include("CoffeeProjectile.js");

GlobalResourceLoader.AddAudioResource("colombian_attack1","sound/enemies/columbian_attack1.mp3");
GlobalResourceLoader.AddAudioResource("colombian_grabbed1","sound/enemies/columbian_grabbed1.mp3");
GlobalResourceLoader.AddAudioResource("colombian_grabbed2","sound/enemies/columbian_grabbed2.mp3");
GlobalResourceLoader.AddAudioResource("colombian_hit1","sound/enemies/columbian_hit1.mp3");
GlobalResourceLoader.AddAudioResource("colombian_hit2","sound/enemies/columbian_hit2.mp3");
GlobalResourceLoader.AddAudioResource("colombian_shoulder1","sound/enemies/columbian_shoulder1.mp3");
GlobalResourceLoader.AddAudioResource("colombian_shoulder2","sound/enemies/columbian_shoulder2.mp3");
GlobalResourceLoader.AddAudioResource("bartender_smoke_quick3","sound/bartender/bartender_smoke_quick3.mp3");

function ColombianRescue()
{
	EntityInit.call(this);
	this.displayName = "Colombian Rescue";
	
	this.ai = new ColombianRescueAI(this);
	
	this.attackSFX = new RandomSoundCollection("colombian_attack{0}",1);
	this.hitSFX = new RandomSoundCollection("colombian_hit{0}",2);
	this.grabbedSFX = new RandomSoundCollection("colombian_grabbed{0}",2);
	this.knockoutSFX = new RandomSoundCollection("colombian_shoulder{0}",2);
	
	this.exhaleSFX = GlobalResourceLoader.GetSound("bartender_smoke_quick3");

	
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
	
	this.grabAdjustX = 10;
	this.grabAdjustY = 0;
	this.grabAdjustZ = 80;
	
	// Stats
	this.maxHealth = 30;
	this.maxHitStunFrames = 60;
	this.staminaRecoveryPerFrame = 1.0 / (60 * 10);	// Stamina fully recovers in 10 seconds when not dazed
	this.staminaRecoveryPerFrameWhenKOed = 1.0 / (60 * 4);	// Stamina fully recovers in 4 seconds
	this.weight = 160;
	this.maxJumpFrames = 18+8;
	this.gravity = -gravity * 0.5;
	this.groundFriction = 0.9;
	this.flying = true;
	
	//this.spriteCenterX = 64;
	//this.spriteCenterY = 98;
	
	// Collision
	this.zHeight = this.scale * 100;
	this.collisionRadius = this.scale * 14;
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * 40,y:-this.scale * 14});
	this.hitRect.expandToFit({x:this.scale * 40,y:this.scale * 14});
	
	this.projectile = null;
	
	this.animationSetup();
};

ColombianRescue.prototype.editorProperties = ['displayName','alliance','health','orbsOnDeath', 'orbsAfterSex', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld'];
ColombianRescue.prototype.runtimeProperties = ['newlySpawned','newlySpawnedTargetX','newlySpawnedTargetY','state','stateFrames','corrupted','recruited'];

ColombianRescue.prototype.GetMoveMaxVelocity = function()
{		
	if (this.state === States.Jump || this.state === States.Fall || this.state === States.FallHelpless)
		return 16.0;
	else
		return 0;
};

ColombianRescue.prototype.GetStaminaRecovery = function()
{
	if (IsInvulnerable(this.state))
		return this.staminaRecoveryPerFrameWhenKOed;
	else
		return this.staminaRecoveryPerFrame; // Stamina fully recovers in 5 seconds when not dazed
};

ColombianRescue.prototype.DrawSprite = function()
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

ColombianRescue.prototype.UpdateState = function()
{
	var mag = Math.sqrt(Math.pow(this.velX,2)+Math.pow(this.velY,2));
	var ang = Math.atan2(this.velY,this.velX);
	
	// Do what needs to be done in each state and change the state if needed
	if (this.state === States.Walk)
	{
		this.animationModel.ChangeState("idle");
	
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		// Change to attack state
		if (this.controller.punch && this.controller.punchFramesSinceKeydown < 6)
		{
			this.ChangeState(States.BasicAttack);
		}
		// Change to jump state
		else if (this.controller.jumpActivate())
		{
			this.ChangeState(States.Jump);
		}
	}
	else if (this.state === States.Jump)
	{	
		this.animationModel.ChangeState("jump");
		if (this.controller.jump && this.stateFrames < this.maxJumpFrames)
		{
			if (this.stateFrames > 18)
			{
				this.ProcessDirectionalInput();
				this.accelZ = 5.0;
			}
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
		
		// If we've landed on the ground
		if (this.posZ <= 0)
		{
			this.ChangeState(States.Walk);
		}
	}
	else if (this.state === States.BasicAttack)
	{
		this.animationModel.ChangeState("attack");
		
		if (this.stateFrames === 20)
			this.attackSFX.Play(2.0);
		
		// Spawn the coffee projectile
		if (this.stateFrames === 42)
		{
			
			this.projectile = new CoffeeProjectile(this, 40*3, 65*3);
			level.entities.AddEffect(this.projectile);
		}
		
		// If the coffee projectile was spawned and is dead, then return to the walk state
		if (this.projectile !== null && this.projectile.state === States.Dead)
		{
			this.projectile = null;
			this.ChangeState(States.Walk);
		}
	}
	else if (this.state === States.FallHelpless)
	{
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		//this.animationModel.ChangeState("idle");
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
		
		if (this.stateFrames === 1)
			this.stamina = 0.0
		
		if (this.stamina >= 1.0)
		{
			if (this.health <= 0)
			{
				level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,player.posZ+25,200,100,2.0));
				this.ReleaseOrbs();
				this.Die();
				
			}
			else
			{
				this.ChangeState(States.GetUp);
			}
		}
	}
	else if (this.state === States.GetUp)
	{
		this.flying = true;
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
		var fapSpeed = linearRemap(this.stateFrames, 1, 300, 1.9, 1.1);
		this.animationModel.animations["corrupt"].mainAnimation.SetDurationInSeconds(fapSpeed);
		
		if (fapSpeed === 1.1 && this.animationModel.animations["corrupt"].mainAnimation.endFrame)
		{
			this.ChangeState(States.CorruptOrgasm);
		}
	}
	else if (this.state === States.CorruptOrgasm)
	{
		if (this.stateFrames === 1)
		{
			this.cumSFX.Play(1.0,0.5);
			this.exhaleSFX.Play(1.0,0.3);
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
		if (this.prepareForThrow)
			this.animationModel.ChangeState("knockout");
		else
			this.animationModel.ChangeState("hitstun");
	}
	else if (this.state === States.Thrown)
	{
		this.ChangeState(States.KnockedOut);
		this.flying = false;
	}
	
};

ColombianRescue.prototype.recruit = function(captor)
{
};

ColombianRescue.prototype.unrecruit = function()
{
};

ColombianRescue.prototype.corrupt = function()
{
};

// All the animation frames associated with the ColombianRescue. These are in a sprite sheet.
GlobalResourceLoader.AddImageResource("sheet_ColombianRescue","images/enemies/sheet_ColombianRescue.txt");

ColombianRescue.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;									// This animation loops
	idleAnim.inheritFacing = 1;								// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddFrame("ColombianRescue/idle1");		// All the frames and their timing info
	idleAnim.SetDurationInSeconds(1.0);							// Set how long one loop takes (in seconds)
	
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
	hitStunAnim.AddFrame("ColombianRescue/hitstun1");		// All the frames and their timing info
	hitStunAnim.SetDurationInSeconds(0.5);
	var hitStunState = new AnimationState();
	hitStunState.SetMainAnimation(hitStunAnim);
	this.animationModel.AddState("hitstun",hitStunState);
	
	// Define the corruption animation
	
	// The last 5 frames of this animation must run at 5.555 frames per second
	
	var animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("ColombianRescue/fall{0}",1,2);
	animation.AddSequentialFrames("ColombianRescue/corruption{0}",1,11);
	animation.SetDurationInSeconds(1.3);
	var state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("corruption",state);
	
	animation = new Animation(this);
	animation.repeat = 1;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("ColombianRescue/corruption{0}",12,14);
	animation.AddSequentialFrames("ColombianRescue/sexloop{0}",4,5);
	animation.AddSequentialFrames("ColombianRescue/sexloop{0}",1,5);
	animation.SetDurationInSeconds(1.5);
	animation.loopStartPosition = 0.5;
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("corrupt",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("ColombianRescue/orgasm{0}",1,11);
	animation.SetDurationInSeconds(1.3);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddBlankFrames(3);
	animation.AddSequentialFrames("ColombianRescue/steam{0}",1,7);
	animation.SetDurationInSeconds(1.1);
	animation.blendMode = "lighter";
	state.AddDecoratorAnimation(animation);
	this.animationModel.AddState("orgasm",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("ColombianRescue/fall{0}",1,2);
	animation.SetDurationInSeconds(0.3);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("knockout",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("ColombianRescue/fall{0}",3,4);
	animation.SetDurationInSeconds(0.3);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("getup",state);
	
	// Define the walk animation
	var walkAnim = new Animation(this);
	walkAnim.inheritFacing = 1;					// It inherits the player's facing property
	walkAnim.AddSequentialFrames("ColombianRescue/walking{0}",1,6);		// All the frames and their timing info
	walkAnim.SetDurationInSeconds(0.6);
	var walkState = new AnimationState();
	walkState.SetMainAnimation(walkAnim);
	this.animationModel.AddState("jump", walkState);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("ColombianRescue/attack{0}",1,4);
	animation.AddFrame("ColombianRescue/attack5");
	animation.AddFrame("ColombianRescue/attack6");
	animation.AddFrame("ColombianRescue/attack6");
	animation.AddSequentialFrames("ColombianRescue/attack{0}",7,9);
	animation.SetDurationInSeconds(1.0);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("attack",state);
};

// Boilerplate Entity Code
ColombianRescue.prototype.Init = EntityInit;
ColombianRescue.prototype.ChangeState = EntityChangeState;
ColombianRescue.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
ColombianRescue.prototype.Speed = EntitySpeed;
ColombianRescue.prototype.Kill = EntityKill;
ColombianRescue.prototype.ReleaseOrbs = EntityReleaseOrbs;
ColombianRescue.prototype.Die = EntityDie;
ColombianRescue.prototype.CancelAttack = EntityCancelAttack;
ColombianRescue.prototype.Respawn = EntityRespawn;		
ColombianRescue.prototype.GetGroundFriction = EntityGetGroundFriction;
//ColombianRescue.prototype.DrawSprite = EntityDrawSprite;
ColombianRescue.prototype.Draw = EntityDraw;
ColombianRescue.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//ColombianRescue.prototype.UpdateState = EntityUpdateState;	// Overridden
ColombianRescue.prototype.Update = EntityUpdate;
ColombianRescue.prototype.Push = EntityPush;
ColombianRescue.prototype.Hit = EntityHit;
ColombianRescue.prototype.Capture = EntityCapture;
ColombianRescue.prototype.Release = EntityRelease;
ColombianRescue.prototype.ChangeAlliance = EntityChangeAlliance;
ColombianRescue.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
ColombianRescue.prototype.CollisionDetection = EntityCollisionDetection;
ColombianRescue.prototype.WatchSex = EntityWatchSex;
ColombianRescue.prototype.DoneWatchingSex = EntityDoneWatchingSex;
//ColombianRescue.prototype.RequestAttackPermission = EntityRequestAttackPermission;
//ColombianRescue.prototype.ReleaseAttackPermission = EntityReleaseAttackPermission;
ColombianRescue.prototype.OnRemovalFromGame = EntityOnRemovalFromGame;


include("AICore.js");

function ColombianRescueAI(owner)
{
	AICore.call(this,owner);
};

ColombianRescueAI.prototype.GenerateNewAction = function()
{
	
	// Only attack the player
	if (player != null && distanceActorToActor(player, this.owner) < 2000)
	{
		this.QueueAction(new ColombianRescueLeap(player, this.owner));
		this.QueueAction(new ColombianRescueAttack(player, this.owner));
		return;
	}
	
	// If there's nothing to do, wait 15 frames before evaluating again to lower CPU usage
	// And to make the AI seem more human by giving it some reaction time.
	this.QueueAction(new WaitAction(15));
	this.isPassThrough = false;
};

ColombianRescueAI.prototype.QueueAction = AICore.prototype.QueueAction;
ColombianRescueAI.prototype.Flush = AICore.prototype.Flush;
ColombianRescueAI.prototype.CancelCurrentAction = AICore.prototype.CancelCurrentAction;
ColombianRescueAI.prototype.Update = AICore.prototype.Update;
//ColombianRescueAI.prototype.Draw = AICore.prototype.Draw;
ColombianRescueAI.prototype.UpdateTargetPosition = AICore.prototype.UpdateTargetPosition;

ColombianRescueAI.prototype.Draw = function()
{
	AICore.prototype.Draw.call(this);
};

// This action does not end and must be cancelled
function ColombianRescueAttack(target, owner)
{
	BasicAction.call(this);
	this.facing = (target.posX > owner.posX)?1:-1;
	this.target = target;
	this.owner = owner;
};

ColombianRescueAttack.prototype.Update = function()
{
	this.timer += 1;
	
	// Don't attack if offscreen, that's super annoying
	if (this.timer === 1 && camera.walkingEntityOnscreenSide(this.owner) !== 0)
	{
		this.Complete();
		return;
	}
	
	// Don't attack if the player is not around
	if (this.timer === 1 && Math.abs(this.owner.posY - this.target.posY) > 100)
	{
		this.Complete();
		return;
	}
	
	this.owner.facing = this.facing;
	this.owner.controller.punchKeyDown();
	if (this.timer > 90 && this.owner.state === States.Walk)
	{
		this.Complete();
	}
};

ColombianRescueAttack.prototype.Complete = function()
{
	this.ended = true;
};

// This action does not end and must be cancelled
function ColombianRescueLeap(target, owner)
{
	BasicAction.call(this);
	this.facing = (target.posX > owner.posX)?1:-1;
	this.target = target;
	
	// Is this a dodge or move into position?
	this.dodge = Math.random() > 0.3;
	this.dodgeRight = owner.posY < target.posY; //Math.random() > 0.5;
	this.dodgeUp = owner.posY > target.posY; //Math.random() > 0.5;
	this.dodgeHoriz = Math.random() > 0.2;
	this.dodgeVert = Math.random() > 0.2;
	
	this.offscreenStatus = camera.walkingEntityOnscreenSide(owner);
	
};

ColombianRescueLeap.prototype.Update = function()
{	
	this.timer += 1;

	// Offscreen to the right
	if (this.offscreenStatus === 1)
	{
		this.owner.controller.leftKeyDown();
	}
	// Offscreen to the left
	else if (this.offscreenStatus === -1)
	{
		this.owner.controller.rightKeyDown();
	}
	// Dodging
	else if (this.dodge)
	{
		if (this.dodgeVert)
		{
			if (this.dodgeUp)
				this.owner.controller.upKeyDown();
			else
				this.owner.controller.downKeyDown();
		}
		if (this.dodgeHoriz)
		{
			if (this.dodgeRight)
				this.owner.controller.rightKeyDown();
			else
				this.owner.controller.leftKeyDown();
		}
	}
	// Leaping into position
	else
	{
		if (this.owner.posY+50 < this.target.posY)
			this.owner.controller.downKeyDown();
		else if (this.owner.posY-50 > this.target.posY)
			this.owner.controller.upKeyDown();
				
		if (Math.abs(this.owner.posX - this.target.posX) < 300)
		{
			if (this.owner.posX < this.target.posX)
				this.owner.controller.leftKeyDown();
			else
				this.owner.controller.rightKeyDown();
		}
	}
	
	this.owner.controller.jumpKeyDown();
	
	if (this.timer > 90 && this.owner.state === States.Walk)
		this.Complete();
};

ColombianRescueLeap.prototype.Complete = function()
{
	this.ended = true;
};