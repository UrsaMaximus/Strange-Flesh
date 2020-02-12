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

GlobalResourceLoader.AddAudioResource("fartherfigure_attack","sound/enemies/fartherfigure_attack.mp3");
GlobalResourceLoader.AddAudioResource("fartherfigure_charge","sound/enemies/fartherfigure_charge.mp3");
GlobalResourceLoader.AddAudioResource("fartherfigure_grabbed1","sound/enemies/fartherfigure_grabbed1.mp3");
GlobalResourceLoader.AddAudioResource("fartherfigure_grabbed2","sound/enemies/fartherfigure_grabbed2.mp3");
GlobalResourceLoader.AddAudioResource("fartherfigure_grabbed3","sound/enemies/fartherfigure_grabbed3.mp3");
GlobalResourceLoader.AddAudioResource("fartherfigure_hit1","sound/enemies/fartherfigure_hit1.mp3");
GlobalResourceLoader.AddAudioResource("fartherfigure_hit2","sound/enemies/fartherfigure_hit2.mp3");
GlobalResourceLoader.AddAudioResource("fartherfigure_hit3","sound/enemies/fartherfigure_hit3.mp3");
GlobalResourceLoader.AddAudioResource("fartherfigure_wingflap1","sound/enemies/fartherfigure_wingflap1.mp3");

function FartherFigure()
{
	EntityInit.call(this);
	this.displayName = "Farther Figure";
	
	this.ai = new FartherFigureAI(this);
	
	this.attackSFX = GlobalResourceLoader.GetSound("fartherfigure_attack");
	this.chargeSFX = GlobalResourceLoader.GetSound("fartherfigure_charge");
	this.hitSFX = new RandomSoundCollection("fartherfigure_hit{0}",3);
	this.grabbedSFX = new RandomSoundCollection("fartherfigure_grabbed{0}",3);
	this.knockoutSFX = new RandomSoundCollection("fartherfigure_hit{0}",3);
	this.wingflapSFX = GlobalResourceLoader.GetSound("fartherfigure_wingflap1");
	
	// Combat flags
	this.alliance = 2;
	this.grabbable = true;
	this.fuckable = false;
	this.kissable = false;
	this.throwable = true;
	this.knockoutable = true;
	this.corruptable = true;
	
	this.grabAdjustX = 0;
	this.grabAdjustY = 0;
	this.grabAdjustZ = 160;
	
	// Stats
	this.maxHealth = 30;
	this.maxHitStunFrames = 60;
	this.staminaRecoveryPerFrame = 1.0 / (60 * 10);	// Stamina fully recovers in 10 seconds when not dazed
	this.staminaRecoveryPerFrameWhenKOed = 1.0 / (60 * 4);	// Stamina fully recovers in 4 seconds
	this.weight = 100;
	this.flying = true;
	this.flyGravity = -(gravity * 0.7)
	this.groundFriction = 0.95;
	
	this.orbsOnDeath = 20;
	this.orbsAfterSex = 0;
	this.heathOrbsHeld = 0;
	this.corruptionOrbsHeld = 0;
	this.dominationOrbsHeld = 0;
	
	// Collision
	this.zHeight = this.scale * 66;
	this.collisionRadius = this.scale * 10;
	
	this.projectileAttack = new Attack(this);
	this.projectileAttack.alliance = 0;
	this.projectileAttack.connectWithAllies = true;
	this.projectileAttack.attackbox.SetBounds(-70,-40,70,40);
	this.projectileAttack.warmupframes = 1;
	this.projectileAttack.attackFrames = 1;
	this.projectileAttack.cooldownframes = 30;
	this.projectileAttack.damageDealt = 5;
	this.projectileAttack.staminaDrained = 0;
	this.projectileAttack.visualContactZ = 0;
	this.projectileAttack.intoxicationDealt = 800;
	this.projectileAttack.hitStunDealt = 0.2;
	this.projectileAttack.remainActiveUntil = 1;
	this.projectileAttack.connectWithOwner = true;
	
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * 25,y:-this.scale * 15});
	this.hitRect.expandToFit({x:this.scale * 25,y:this.scale * 15});
	
	this.animationSetup();
};

FartherFigure.prototype.editorProperties = ['displayName','alliance','health','orbsOnDeath', 'orbsAfterSex', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld'];
FartherFigure.prototype.runtimeProperties = ['newlySpawned','newlySpawnedTargetX','newlySpawnedTargetY','state','stateFrames','corrupted','recruited'];

FartherFigure.prototype.GetMoveMaxVelocity = function()
{		
	return 5.0;
};

FartherFigure.prototype.GetStaminaRecovery = function()
{
	if (IsInvulnerable(this.state))
		return this.staminaRecoveryPerFrameWhenKOed;
	else
		return this.staminaRecoveryPerFrame; // Stamina fully recovers in 5 seconds when not dazed
};

FartherFigure.prototype.DrawSprite = function()
{
	drawEntityRoundShadow(this,260);

	ctx.globalAlpha = this.alpha;
	this.animationModel.Draw();
	ctx.globalAlpha = 1.0;
	
	if (debug === 2 && this.ai != null)
		this.ai.Draw();
};


FartherFigure.prototype.UpdateState = function()
{
	var mag = Math.sqrt(Math.pow(this.velX,2)+Math.pow(this.velY,2));
	var ang = Math.atan2(this.velY,this.velX);
	
	this.gravity = 0;
	
	// Do what needs to be done in each state and change the state if needed
	if (this.state === States.Walk)
	{
		this.gravity = this.flyGravity;
		
		this.animationModel.ChangeState("idle");
		
		if (this.animationModel.WasLastFrameActivation(4))
		{
			this.wingflapSFX.Play(0.3);
		}
	
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		// If under 500 px and not over 1000, flap up on the flap animation frames
		var estZ = this.posZ + this.velZ*5;
		if (estZ < 500)
		{
			//  Frames 4 and 5 are the upward flapping
			//var frame = this.animationModel.GetLastFrameIndex();
			//if (frame > 3 && frame < 8)
			{
				if (this.posZ === 0)
					this.posZ = 0.001;
				this.accelZ += 3.0 * normalizeValue(estZ,500,0);
			}
		}
		
		// Change to attack state
		if (this.controller.punch && this.controller.punchFramesSinceKeydown < 6)
		{
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
		this.gravity = -gravity;// * 0.99;
		this.animationModel.ChangeState("attack");
		
		if (this.stateFrames === 1)
		{
			this.animationModel.animations["attack"].mainAnimation.repeat = 1;
			//this.chargeSFX.Play(1.0);
		}
		
		// Spawn the thunderbolt attack
		if (this.stateFrames === 10)
		{
			var thunderbolt = new Thunderbolt("blue");
			
			thunderbolt.posX = player.posX + player.velX * 20;
			thunderbolt.posY = player.posY + player.velY * 20;
			
			if (Math.random() > 0.5)
				thunderbolt.facing = 1;
			else
				thunderbolt.facing = -1;
			
			level.entities.AddEffect(thunderbolt);
		}
		
		if (this.stateFrames === 80)
		{
			this.animationModel.animations["attack"].mainAnimation.repeat = 0;
			this.animationModel.animations["attack"].mainAnimation.done = false;
		}
		
		if (this.stateFrames > 80 && this.animationModel.AnimationIsComplete("attack"))
		{
			this.ChangeState(States.Walk);
		}
		
	}
	else if (this.state === States.Fall)
	{
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		

		this.animationModel.ChangeState("hitstun");
		
		// If we've landed on the ground
		if (this.posZ <= 0)
		{
			this.ChangeState(States.GetUp);
		}
	}
	else if (this.state === States.FallHelpless)
	{
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		this.animationModel.ChangeState("hitstun");
		if (this.posZ <= 0)
			this.ChangeState(States.GetUp);
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
		this.gravity = -gravity * 0.65
		this.animationModel.ChangeState("getup");
		
		if (this.animationModel.WasLastFrameActivation(3))
		{
			if (this.posZ === 0)
				this.posZ = 0.001;
			this.velZ += 30.0;
			this.wingflapSFX.Play(0.3);
		}
		
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
		{
			this.cumSFX.Play(1.0,0.4);
			this.cumSFX.Play(1.0,0.7);
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
			this.animationModel.ChangeState("captive");
	}
	else if (this.state === States.Thrown)
	{
		this.ChangeState(States.KnockedOut);
		this.stateFrames = 2;
		this.stamina = 0.3;	
	}
	
};

FartherFigure.prototype.recruit = function(captor)
{
	this.ChangeAlliance(captor.alliance);
};

FartherFigure.prototype.unrecruit = function()
{
	this.ChangeAlliance(2);
};

FartherFigure.prototype.corrupt = function()
{
};

// All the animation frames associated with the FartherFigure. These are in a sprite sheet.
GlobalResourceLoader.AddImageResource("sheet_FartherFigure","images/enemies/sheet_FartherFigure.txt");

FartherFigure.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;									// This animation loops
	idleAnim.inheritFacing = 1;								// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddSequentialFrames("FartherFigure/fly{0}",1,9);		// All the frames and their timing info
	idleAnim.SetDurationInSeconds(1.2);							// Set how long one loop takes (in seconds)
	
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
	hitStunAnim.AddFrame("FartherFigure/hitstun");		// All the frames and their timing info
	hitStunAnim.SetDurationInSeconds(0.5);
	var hitStunState = new AnimationState();
	hitStunState.SetMainAnimation(hitStunAnim);
	this.animationModel.AddState("hitstun",hitStunState);
	
	// Define the corruption animation
	var animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("FartherFigure/fall{0}",1,4);
	animation.AddSequentialFrames("FartherFigure/corruption{0}",1,15);
	animation.AddSequentialFrames("FartherFigure/loop{0}",4,6);
	animation.SetDurationInSeconds(2.0);
	var state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("corruption",state);
	
	// Define the corruption animation
	var animation = new Animation(this);
	animation.repeat = 1;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("FartherFigure/attack{0}",1,12);
	animation.SetDurationInSeconds(0.6);
	animation.SetLoopByFrame(4,5);
	var state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("attack",state);
	
	animation = new Animation(this);
	animation.repeat = 1;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("FartherFigure/loop{0}",1,6);
	animation.SetDurationInSeconds(1.5);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("corrupt",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("FartherFigure/corrupt{0}",1,16);
	animation.SetDurationInSeconds(1.6);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("orgasm",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("FartherFigure/fall{0}",1,4);
	animation.SetDurationInSeconds(0.6);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("knockout",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("FartherFigure/getup{0}",1,3);
	animation.HoldFrame("FartherFigure/getup4",6);
	animation.AddFrame("FartherFigure/getup5");
	animation.SetDurationInSeconds(1.0);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("getup",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddFrame("FartherFigure/getup4");
	animation.SetDurationInSeconds(1.0);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("captive",state);
};

FartherFigure.prototype.ChangeAlliance = function(newAlliance)
{
	this.alliance = newAlliance;
	this.projectileAttack.alliance = newAlliance;
};


// Boilerplate Entity Code
FartherFigure.prototype.Init = EntityInit;
FartherFigure.prototype.ChangeState = EntityChangeState;
FartherFigure.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
FartherFigure.prototype.Speed = EntitySpeed;
FartherFigure.prototype.Kill = EntityKill;
FartherFigure.prototype.ReleaseOrbs = EntityReleaseOrbs;
FartherFigure.prototype.Die = EntityDie;
FartherFigure.prototype.CancelAttack = EntityCancelAttack;
FartherFigure.prototype.Respawn = EntityRespawn;		
FartherFigure.prototype.GetGroundFriction = EntityGetGroundFriction;
//FartherFigure.prototype.DrawSprite = EntityDrawSprite;
FartherFigure.prototype.Draw = EntityDraw;
FartherFigure.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//FartherFigure.prototype.UpdateState = EntityUpdateState;	// Overridden
FartherFigure.prototype.Update = EntityUpdate;
FartherFigure.prototype.Push = EntityPush;
FartherFigure.prototype.Hit = EntityHit;
FartherFigure.prototype.Capture = EntityCapture;
FartherFigure.prototype.Release = EntityRelease;
//FartherFigure.prototype.ChangeAlliance = EntityChangeAlliance;
FartherFigure.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
FartherFigure.prototype.CollisionDetection = EntityCollisionDetection;
FartherFigure.prototype.WatchSex = EntityWatchSex;
FartherFigure.prototype.DoneWatchingSex = EntityDoneWatchingSex;
//FartherFigure.prototype.RequestAttackPermission = EntityRequestAttackPermission;
//FartherFigure.prototype.ReleaseAttackPermission = EntityReleaseAttackPermission;
FartherFigure.prototype.OnRemovalFromGame = EntityOnRemovalFromGame;


include("AICore.js");

function FartherFigureAI(owner)
{
	AICore.call(this,owner);
};

FartherFigureAI.prototype.GenerateNewAction = function()
{
	
	// Only attack the player
	if (player != null && distanceActorToActor(player, this.owner) < 2000)
	{
		this.QueueAction(new FartherFigureLeap(player, this.owner));
		this.QueueAction(new FartherFigureAttack(player, this.owner));
		return;
	}
	
	// If there's nothing to do, wait 15 frames before evaluating again to lower CPU usage
	// And to make the AI seem more human by giving it some reaction time.
	this.QueueAction(new WaitAction(15));
	this.isPassThrough = false;
};

FartherFigureAI.prototype.QueueAction = AICore.prototype.QueueAction;
FartherFigureAI.prototype.Flush = AICore.prototype.Flush;
FartherFigureAI.prototype.CancelCurrentAction = AICore.prototype.CancelCurrentAction;
FartherFigureAI.prototype.Update = AICore.prototype.Update;
//FartherFigureAI.prototype.Draw = AICore.prototype.Draw;
FartherFigureAI.prototype.UpdateTargetPosition = AICore.prototype.UpdateTargetPosition;

FartherFigureAI.prototype.Draw = function()
{
	AICore.prototype.Draw.call(this);
};

// This action does not end and must be cancelled
function FartherFigureAttack(target, owner)
{
	BasicAction.call(this);
	this.facing = (target.posX > owner.posX)?1:-1;
	this.target = target;
	this.owner = owner;
};

FartherFigureAttack.prototype.Update = function()
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

FartherFigureAttack.prototype.Complete = function()
{
	this.ended = true;
};

// This action does not end and must be cancelled
function FartherFigureLeap(target, owner)
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

FartherFigureLeap.prototype.Update = function()
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

FartherFigureLeap.prototype.Complete = function()
{
	this.ended = true;
};