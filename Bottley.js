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

include("Projectile.js");

GlobalResourceLoader.AddAudioResource("bottley_attack1","sound/enemies/bottley_attack1.mp3");
GlobalResourceLoader.AddAudioResource("bottley_attack2","sound/enemies/bottley_attack2.mp3");
GlobalResourceLoader.AddAudioResource("bottley_hit1","sound/enemies/bottley_hit1.mp3");
GlobalResourceLoader.AddAudioResource("bottley_hit2","sound/enemies/bottley_hit2.mp3");
GlobalResourceLoader.AddAudioResource("bottley_jump1","sound/enemies/bottley_jump1.mp3");
GlobalResourceLoader.AddAudioResource("bottley_jump2","sound/enemies/bottley_jump2.mp3");

function Bottley()
{
	EntityInit.call(this);
	this.displayName = "Bottley";
	
	this.ai = new BottleyAI(this);
	
	this.attackSFX = new RandomSoundCollection("bottley_attack{0}",1);
	this.hitSFX = new RandomSoundCollection("bottley_hit{0}",2);
	this.jumpSFX = new RandomSoundCollection("bottley_jump{0}",2);
	
	// Combat flags
	this.alliance = 2;
	this.grabbable = false;
	this.fuckable = false;
	this.kissable = false;
	this.throwable = false;
	this.knockoutable = false;
	this.stunnable = false;
	this.corruptable = false;
	
	// Stats
	this.maxHealth = 1;
	this.maxHitStunFrames = 0;
	this.staminaRecoveryPerFrame = 1.0 / (60 * 10);	// Stamina fully recovers in 10 seconds when not dazed
	this.staminaRecoveryPerFrameWhenKOed = 1.0 / (60 * 4);	// Stamina fully recovers in 4 seconds
	this.weight = 5;
	this.maxJumpFrames = 18+6;
	this.gravity = -gravity * 0.5;
	this.groundFriction = 0.9;
	this.flying = true;
	this.MustJumpToMove=true;
	
	// Collision
	this.zHeight = this.scale * 25;
	this.collisionRadius = this.scale * 10;
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * 10,y:-this.scale * 10});
	this.hitRect.expandToFit({x:this.scale * 10,y:this.scale * 10});
	
	this.suicideAttack = new Attack(this);
	this.suicideAttack.attackbox.SetBounds(55*3,-40,150*3,40);
	this.suicideAttack.warmupframes = 84;
	this.suicideAttack.attackFrames = 1;
	this.suicideAttack.cooldownframes = 1;
	this.suicideAttack.damageDealt = 1;
	this.suicideAttack.intoxicationDealt = 1000;
	this.suicideAttack.staminaDrained = 0.1;
	this.suicideAttack.hitStunDealt = 0.8;
	this.suicideAttack.zHeight = 100;
	
	this.deathAttack = new Attack(this);
	this.deathAttack.attackbox.SetBounds(-40,-40,40,40);
	this.deathAttack.warmupframes = 30;
	this.deathAttack.attackFrames = 1;
	this.deathAttack.cooldownframes = 1;
	this.deathAttack.damageDealt = 1;
	this.deathAttack.intoxicationDealt = 500;
	this.deathAttack.staminaDrained = 0.1;
	this.deathAttack.hitStunDealt = 0.8;
	
	this.animationSetup();
};

Bottley.prototype.editorProperties = ['displayName','alliance','health','orbsOnDeath', 'orbsAfterSex', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld'];
Bottley.prototype.runtimeProperties = ['newlySpawned','newlySpawnedTargetX','newlySpawnedTargetY','state','stateFrames','corrupted','recruited'];

Bottley.prototype.GetMoveMaxVelocity = function()
{		
	if (this.state === States.Jump || this.state === States.Fall || this.state === States.FallHelpless)
		return 8.0;
	else
		return 0;
};

Bottley.prototype.GetStaminaRecovery = function()
{
	if (IsInvulnerable(this.state))
		return this.staminaRecoveryPerFrameWhenKOed;
	else
		return this.staminaRecoveryPerFrame; // Stamina fully recovers in 5 seconds when not dazed
};

Bottley.prototype.DrawSprite = function()
{
	drawEntityRoundShadow(this, 125)

	ctx.globalAlpha = this.alpha;
	this.animationModel.Draw();
	ctx.globalAlpha = 1.0;
	
	if (debug === 2 && this.ai != null)
		this.ai.Draw();
};

Bottley.prototype.UpdateState = function()
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
		if (this.controller.punchFramesSinceKeydown < 6 && this.controller.punch)
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
			if (this.stateFrames === 18)
				this.jumpSFX.Play(1.5);
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
	else if (this.state === States.Fall || this.state === States.FallHelpless)
	{
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		if (this.posZ <= 0)
			this.ChangeState(States.Walk);

	}
	else if (this.state === States.BasicAttack)
	{
		// Spawn the abuse projectile
		if (this.stateFrames === 1)
		{
			this.suicideAttack.Attack();
		}
		
		if (this.stateFrames === 18)
			this.jumpSFX.Play(1.5);
		if (this.stateFrames > 18 && this.stateFrames < 25)
		{
			//this.ProcessDirectionalInput();
			this.accelZ = 5.0;
		}
		else if (this.stateFrames >= 25)
		{
			this.accelZ = gravity * 0.5;	// Turn gravity off
			this.velZ *= 0.8;				// Add air friction to Z axis
		}
		if (this.stateFrames === 80)
		{
			this.attackSFX.Play(0.6);
		}
		
		this.animationModel.ChangeState("attack");
		if (this.animationModel.AnimationIsComplete("attack"))
		{
			this.Die();
			this.ReleaseOrbs();
		}
	}
	else if (this.state === States.Fall)
	{
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		this.animationModel.ChangeState("jump");
		if (this.posZ <= 0)
			this.ChangeState(States.Walk);
	}
	else if (this.state === States.Dying)
	{
		this.accelZ = gravity * 0.5;	// Turn gravity off
		this.velZ *= 0.8;				// Add air friction to Z axis
			
		if (this.stateFrames === 1)
			this.deathAttack.Attack();
		this.suicideAttack.Reset();
		this.animationModel.ChangeState("death");
		if (this.animationModel.AnimationIsComplete("death"))
		{
			level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,this.posZ+25,200,100,2.0));
			this.ReleaseOrbs();
			this.Die();
		}
	}	
	
};

Bottley.prototype.recruit = function(captor)
{
};

Bottley.prototype.unrecruit = function()
{
};

Bottley.prototype.corrupt = function()
{
};

// All the animation frames associated with the Bottley. These are in a sprite sheet.
GlobalResourceLoader.AddImageResource("sheet_Bottley","images/enemies/sheet_Bottley.txt");

Bottley.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 0;									// This animation loops
	idleAnim.inheritFacing = 1;								// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddSequentialFrames("Bottley/walk{0}",5,6);		// All the frames and their timing info
	idleAnim.AddFrame("Bottley/idle1");		// All the frames and their timing info
	idleAnim.SetDurationInSeconds(0.3);							// Set how long one loop takes (in seconds)
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	this.animationModel.AddState("idle",idleState);
	
	// Define the walk animation
	var walkAnim = new Animation(this);
	walkAnim.repeat = 0;						// This animation loops
	walkAnim.inheritFacing = 1;					// It inherits the player's facing property
	walkAnim.AddSequentialFrames("Bottley/walk{0}",1,4);		// All the frames and their timing info
	walkAnim.SetDurationInSeconds(0.4);
	var walkState = new AnimationState();
	walkState.SetMainAnimation(walkAnim);
	this.animationModel.AddState("jump", walkState);

	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("Bottley/attack{0}",1,18);
	animation.SetDurationInSeconds(1.8);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("attack",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("Bottley/death{0}",4,9);
	animation.SetDurationInSeconds(0.6);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("death",state);
};

Bottley.prototype.Capture = function(captor)
{	
	return null;
};

Bottley.prototype.Hit = function(attack, isCaptive)
{
	EntityHit.call(this, attack, isCaptive);
	this.hitSFX.Play(1.0);
	this.ChangeState(States.Dying);
}

// Boilerplate Entity Code
Bottley.prototype.Init = EntityInit;
Bottley.prototype.ChangeState = EntityChangeState;
Bottley.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
Bottley.prototype.Speed = EntitySpeed;
Bottley.prototype.Kill = EntityKill;
Bottley.prototype.ReleaseOrbs = EntityReleaseOrbs;
Bottley.prototype.Die = EntityDie;
Bottley.prototype.CancelAttack = EntityCancelAttack;
Bottley.prototype.Respawn = EntityRespawn;		
Bottley.prototype.GetGroundFriction = EntityGetGroundFriction;
//Bottley.prototype.DrawSprite = EntityDrawSprite;
Bottley.prototype.Draw = EntityDraw;
Bottley.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//Bottley.prototype.UpdateState = EntityUpdateState;	// Overridden
Bottley.prototype.Update = EntityUpdate;
Bottley.prototype.Push = EntityPush;
//Bottley.prototype.Hit = EntityHit;
//Bottley.prototype.Capture = EntityCapture;
Bottley.prototype.Release = EntityRelease;
Bottley.prototype.ChangeAlliance = EntityChangeAlliance;
Bottley.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
Bottley.prototype.CollisionDetection = EntityCollisionDetection;
Bottley.prototype.WatchSex = EntityWatchSex;
Bottley.prototype.DoneWatchingSex = EntityDoneWatchingSex;
//Bottley.prototype.RequestAttackPermission = EntityRequestAttackPermission;
//Bottley.prototype.ReleaseAttackPermission = EntityReleaseAttackPermission;
Bottley.prototype.OnRemovalFromGame = EntityOnRemovalFromGame;


include("AICore.js");

function BottleyAI(owner)
{
	AICore.call(this,owner);
};

BottleyAI.prototype.GenerateNewAction = function()
{
	if (player != null && distanceActorToActor(player, this.owner) < 800)
	{
		//function AttackTargetAction(owner, attackDist, attackTime, target, side, attackType)
		var	attackAction = new AttackTargetAction(this.owner, 300, 20, player, 0, 0);
		attackAction.tryAlternatePaths = false;
		attackAction.jumpingMovement = true;
		attackAction.movementDeadZone = 0;
		this.QueueAction(attackAction);
		return;
	}
	
	// If there's nothing to do, wait 15 frames before evaluating again to lower CPU usage
	// And to make the AI seem more human by giving it some reaction time.
	this.QueueAction(new WaitAction(15));
};

BottleyAI.prototype.QueueAction = AICore.prototype.QueueAction;
BottleyAI.prototype.Flush = AICore.prototype.Flush;
BottleyAI.prototype.CancelCurrentAction = AICore.prototype.CancelCurrentAction;
BottleyAI.prototype.Update = AICore.prototype.Update;
//BottleyAI.prototype.Draw = AICore.prototype.Draw;
BottleyAI.prototype.UpdateTargetPosition = AICore.prototype.UpdateTargetPosition;

BottleyAI.prototype.Draw = function()
{
	AICore.prototype.Draw.call(this);
};