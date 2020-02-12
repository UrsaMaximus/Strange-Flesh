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

GlobalResourceLoader.AddAudioResource("fister_attack1","sound/enemies/fister_attack1.mp3");
GlobalResourceLoader.AddAudioResource("fister_attack2","sound/enemies/fister_attack2.mp3");
GlobalResourceLoader.AddAudioResource("fister_grabbed1","sound/enemies/fister_grabbed1.mp3");
GlobalResourceLoader.AddAudioResource("fister_grabbed2","sound/enemies/fister_grabbed2.mp3");
GlobalResourceLoader.AddAudioResource("fister_hit1","sound/enemies/fister_hit1.mp3");
GlobalResourceLoader.AddAudioResource("fister_hit2","sound/enemies/fister_hit2.mp3");
GlobalResourceLoader.AddAudioResource("fister_shoulder1","sound/enemies/fister_shoulder1.mp3");
GlobalResourceLoader.AddAudioResource("fister_shoulder2","sound/enemies/fister_shoulder2.mp3");

function Fister()
{
	EntityInit.call(this);
	this.displayName = "Fister";
	
	//this.ai = new FisterAI(this);
	this.ai = new JoeAI(this);
	this.ai.punchDist = 150;
	
	this.attackSFX = new RandomSoundCollection("fister_attack{0}",2);
	this.hitSFX = new RandomSoundCollection("fister_hit{0}",2);
	this.grabbedSFX = new RandomSoundCollection("fister_grabbed{0}",2);
	this.knockoutSFX = new RandomSoundCollection("fister_shoulder{0}",2);
	
	// Combat flags
	this.alliance = 2;
	this.grabbable = true;
	this.fuckable = false;
	this.kissable = false;
	this.throwable = true;
	this.knockoutable = true;
	this.corruptable = true;
	
	this.grabAdjustX = -40;
	this.grabAdjustY = 0;
	this.grabAdjustZ = 120;
	
	// Stats
	this.maxHealth = 40;
	this.maxHitStunFrames = 60;
	this.staminaRecoveryPerFrame = 1.0 / (60 * 10);	// Stamina fully recovers in 10 seconds when not dazed
	this.staminaRecoveryPerFrameWhenKOed = 1.0 / (60 * 4);	// Stamina fully recovers in 4 seconds
	this.weight = 50;
	
	this.orbsOnDeath = 8;
	this.orbsAfterSex = 0;
	this.heathOrbsHeld = 0;
	this.corruptionOrbsHeld = 0;
	this.dominationOrbsHeld = 0;
	
	// Collision
	this.zHeight = this.scale * 80;
	this.collisionRadius = this.scale * 10;
	
	// Light punch is 0.6 seconds long, that's 36 frames total
	this.punchAttack = new Attack(this);
	this.punchAttack.attackbox.SetBounds(100,-28,500,28);
	this.punchAttack.animationTriggered = "attack";
	this.punchAttack.warmupframes = 30;
	this.punchAttack.attackFrames = 1;
	this.punchAttack.cooldownframes = 43;
	this.punchAttack.damageDealt = 30;
	this.punchAttack.staminaDrained = 1.1;
	this.punchAttack.visualContactZ = 54 * this.scale;
	this.punchAttack.hitStunDealt = 1.0;
	this.punchAttack.zHeight = 54 * this.scale;
	this.punchAttack.zSize = 90;
	
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * 30,y:-this.scale * 10});
	this.hitRect.expandToFit({x:this.scale * 30,y:this.scale * 10});
	
	this.animationSetup();
};

Fister.prototype.editorProperties = ['displayName','alliance','health','orbsOnDeath', 'orbsAfterSex', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld'];
Fister.prototype.runtimeProperties = ['newlySpawned','newlySpawnedTargetX','newlySpawnedTargetY','state','stateFrames','corrupted','recruited'];

Fister.prototype.GetMoveMaxVelocity = function()
{		
	return 7.0;
};

Fister.prototype.GetStaminaRecovery = function()
{
	if (IsInvulnerable(this.state))
		return this.staminaRecoveryPerFrameWhenKOed;
	else
		return this.staminaRecoveryPerFrame; // Stamina fully recovers in 5 seconds when not dazed
};

Fister.prototype.DrawSprite = function()
{
	drawEntityRoundShadow(this,260);

	ctx.globalAlpha = this.alpha;
	this.animationModel.Draw();
	ctx.globalAlpha = 1.0;
	
	if (debug === 2 && this.ai != null)
		this.ai.Draw();
};


Fister.prototype.UpdateState = function()
{
	var mag = Math.sqrt(Math.pow(this.velX,2)+Math.pow(this.velY,2));
	var ang = Math.atan2(this.velY,this.velX);
	
	// Do what needs to be done in each state and change the state if needed
	if (this.state === States.Walk)
	{
		if (mag < 2.6 && !this.controller.up && !this.controller.down && !this.controller.left && !this.controller.right)
		{
			this.animationModel.ChangeState("idle");
		}
		else
		{
			this.animationModel.ChangeState("walk");
		}
	
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		// Change to attack state
		if (this.controller.punch && this.controller.punchFramesSinceKeydown < 6)
		{
			this.attack = this.punchAttack;
			this.attack.Attack();
			this.animationModel.ChangeState(this.attack.animationTriggered);
			this.ChangeState(States.BasicAttack);
		}
		
		else if (this.controller.jump)
		{
			if (this.velZ < 5.0)
				this.accelZ = 1.0;
		}
	}
	else if (this.state === States.BasicAttack)
	{
		if (this.stateFrames === 20)
			this.attackSFX.Play(2.0);
		this.ChangeStateOnAttackComplete(States.Walk);
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
		var fapSpeed = linearRemap(this.stateFrames, 1, 240, 0.9, 0.5);
		this.animationModel.animations["corrupt"].mainAnimation.SetDurationInSeconds(fapSpeed);
		
		if (fapSpeed === 0.5 && this.animationModel.animations["corrupt"].mainAnimation.endFrame)
		{
			this.ChangeState(States.CorruptOrgasm);
		}
	}
	else if (this.state === States.CorruptOrgasm)
	{
		if (this.stateFrames === 1)
			this.cumSFX.Play(1.0,0.3);
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
	}
	
};

Fister.prototype.recruit = function(captor)
{
	this.ChangeAlliance(captor.alliance);
};

Fister.prototype.unrecruit = function()
{
	this.ChangeAlliance(2);
};

Fister.prototype.corrupt = function()
{
};

// All the animation frames associated with the Fister. These are in a sprite sheet.
GlobalResourceLoader.AddImageResource("sheet_Fister","images/enemies/sheet_Fister.txt");

Fister.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;									// This animation loops
	idleAnim.inheritFacing = 1;								// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddFrame("Fister/idle");		// All the frames and their timing info
	idleAnim.SetDurationInSeconds(1.0);							// Set how long one loop takes (in seconds)
	
	// Add the idle animation and all its transitions to the idle animation state
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	
	// Add all the animation states to the animations collection
	this.animationModel.AddState("idle",idleState);
	
	var animation = new Animation(this);
	animation.repeat = 1;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.dynamicRate = true;
	animation.AddSequentialFrames("Fister/walk{0}",1,8);
	animation.SetDurationInSeconds(6.4);
	var state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("walk",state);
	
	// Define the hitstun animation
	var hitStunAnim = new Animation(this);
	hitStunAnim.repeat = 0;							// This animation is one-shot
	hitStunAnim.inheritFacing = 1;					// It inherits the player's facing property
	hitStunAnim.matchPosition = false;
	hitStunAnim.AddFrame("Fister/hitstun");		// All the frames and their timing info
	hitStunAnim.SetDurationInSeconds(0.5);
	var hitStunState = new AnimationState();
	hitStunState.SetMainAnimation(hitStunAnim);
	this.animationModel.AddState("hitstun",hitStunState);
	
	// Define the corruption animation
	var animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("Fister/fall{0}",1,5);
	animation.AddSequentialFrames("Fister/corrution{0}",1,4);
	animation.SetDurationInSeconds(0.9);
	var state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("corruption",state);
	
	// Define the corruption animation
	var animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.HoldFrame("Fister/attack1",2);
	animation.HoldFrame("Fister/attack2",8);
	animation.HoldFrame("Fister/attack3",2);
	animation.HoldFrame("Fister/attack4",2);
	animation.HoldFrame("Fister/attack5",2);
	animation.HoldFrame("Fister/attack6",2);
	animation.HoldFrame("Fister/attack7",2);
	animation.AddFrame("Fister/idle");
	animation.SetDurationInSeconds(0.9);
	var state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("attack",state);
	
	animation = new Animation(this);
	animation.repeat = 1;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("Fister/loop{0}",1,6);
	animation.SetDurationInSeconds(1.5);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("corrupt",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("Fister/loop{0}",1,3);
	animation.AddSequentialFrames("Fister/orgasm{0}",1,6);
	
	animation.SetDurationInSeconds(0.9);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("orgasm",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("Fister/fall{0}",1,5);
	animation.SetDurationInSeconds(0.5);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("knockout",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("Fister/getup{0}",1,2);
	animation.SetDurationInSeconds(0.3);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("getup",state);
};

Fister.prototype.ChangeAlliance = function(newAlliance)
{
	this.alliance = newAlliance;
	this.punchAttack.alliance = newAlliance;
};


// Boilerplate Entity Code
Fister.prototype.Init = EntityInit;
Fister.prototype.ChangeState = EntityChangeState;
Fister.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
Fister.prototype.Speed = EntitySpeed;
Fister.prototype.Kill = EntityKill;
Fister.prototype.ReleaseOrbs = EntityReleaseOrbs;
Fister.prototype.Die = EntityDie;
Fister.prototype.CancelAttack = EntityCancelAttack;
Fister.prototype.Respawn = EntityRespawn;		
Fister.prototype.GetGroundFriction = EntityGetGroundFriction;
//Fister.prototype.DrawSprite = EntityDrawSprite;
Fister.prototype.Draw = EntityDraw;
Fister.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//Fister.prototype.UpdateState = EntityUpdateState;	// Overridden
Fister.prototype.Update = EntityUpdate;
Fister.prototype.Push = EntityPush;
Fister.prototype.Hit = EntityHit;
Fister.prototype.Capture = EntityCapture;
Fister.prototype.Release = EntityRelease;
//Fister.prototype.ChangeAlliance = EntityChangeAlliance;
Fister.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
Fister.prototype.CollisionDetection = EntityCollisionDetection;
Fister.prototype.WatchSex = EntityWatchSex;
Fister.prototype.DoneWatchingSex = EntityDoneWatchingSex;
//Fister.prototype.RequestAttackPermission = EntityRequestAttackPermission;
//Fister.prototype.ReleaseAttackPermission = EntityReleaseAttackPermission;
Fister.prototype.OnRemovalFromGame = EntityOnRemovalFromGame;


include("AICore.js");

function FisterAI(owner)
{
	AICore.call(this,owner);
};

FisterAI.prototype.GenerateNewAction = function()
{
	
	// Only attack the player
	if (player != null && distanceActorToActor(player, this.owner) < 2000)
	{
		this.QueueAction(new FisterLeap(player, this.owner));
		this.QueueAction(new FisterAttack(player, this.owner));
		return;
	}
	
	// If there's nothing to do, wait 15 frames before evaluating again to lower CPU usage
	// And to make the AI seem more human by giving it some reaction time.
	this.QueueAction(new WaitAction(15));
	this.isPassThrough = false;
};

FisterAI.prototype.QueueAction = AICore.prototype.QueueAction;
FisterAI.prototype.Flush = AICore.prototype.Flush;
FisterAI.prototype.CancelCurrentAction = AICore.prototype.CancelCurrentAction;
FisterAI.prototype.Update = AICore.prototype.Update;
//FisterAI.prototype.Draw = AICore.prototype.Draw;
FisterAI.prototype.UpdateTargetPosition = AICore.prototype.UpdateTargetPosition;

FisterAI.prototype.Draw = function()
{
	AICore.prototype.Draw.call(this);
};

// This action does not end and must be cancelled
function FisterAttack(target, owner)
{
	BasicAction.call(this);
	this.facing = (target.posX > owner.posX)?1:-1;
	this.target = target;
	this.owner = owner;
};

FisterAttack.prototype.Update = function()
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

FisterAttack.prototype.Complete = function()
{
	this.ended = true;
};

// This action does not end and must be cancelled
function FisterLeap(target, owner)
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

FisterLeap.prototype.Update = function()
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
	
	//this.owner.controller.jumpKeyDown();
	
	if (this.timer > 90 && this.owner.state === States.Walk)
		this.Complete();
};

FisterLeap.prototype.Complete = function()
{
	this.ended = true;
};