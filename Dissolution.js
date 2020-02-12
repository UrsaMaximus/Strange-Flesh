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

GlobalResourceLoader.AddAudioResource("dissolution_attack1","sound/enemies/dissolution_attack1.mp3");
GlobalResourceLoader.AddAudioResource("dissolution_attack2","sound/enemies/dissolution_attack2.mp3");
GlobalResourceLoader.AddAudioResource("dissolution_attackexplode1","sound/enemies/dissolution_attackexplode1.mp3");
GlobalResourceLoader.AddAudioResource("dissolution_attackexplode2","sound/enemies/dissolution_attackexplode2.mp3");
GlobalResourceLoader.AddAudioResource("dissolution_hit1","sound/enemies/dissolution_hit1.mp3");
GlobalResourceLoader.AddAudioResource("dissolution_hit2","sound/enemies/dissolution_hit2.mp3");
GlobalResourceLoader.AddAudioResource("dissolution_hiccup1","sound/enemies/dissolutionhic.mp3");


function Dissolution()
{
	EntityInit.call(this);
	this.displayName = "Dissolution";
	
	this.ai = new DissolutionAI(this);
	
	this.attackSFX = new RandomSoundCollection("dissolution_attack{0}",1);
	this.hiccupSFX = new RandomSoundCollection("dissolution_hiccup{0}",1);
	this.projectileSFX = new RandomSoundCollection("dissolution_attackexplode{0}",2);
	this.hitSFX = new RandomSoundCollection("dissolution_hit{0}",2);
	
	this.cumSFX = GlobalResourceLoader.GetSound("cum3");

	// Combat flags
	this.alliance = 2;
	this.grabbable = false;
	this.fuckable = false;
	this.kissable = false;
	this.throwable = false;
	this.knockoutable = true;
	this.corruptable = true;
	
	this.grabAdjustX = 20;
	this.grabAdjustY = 0;
	this.grabAdjustZ = -20;
	
	// Stats
	this.maxHealth = 30;
	this.maxHitStunFrames = 60;
	this.staminaRecoveryPerFrame = 1.0 / (60 * 10);	// Stamina fully recovers in 10 seconds when not dazed
	this.staminaRecoveryPerFrameWhenKOed = 1.0 / (60 * 4);	// Stamina fully recovers in 4 seconds
	this.weight = 20;
	
	this.orbsOnDeath = 8;
	this.orbsAfterSex = 0;
	this.heathOrbsHeld = 0;
	this.corruptionOrbsHeld = 0;
	this.dominationOrbsHeld = 0;
	
	// Collision
	this.zHeight = this.scale * 66;
	this.collisionRadius = this.scale * 10;
	
	this.projectileAttack = new Attack(this);
	this.projectileAttack.alliance = 2;
	this.projectileAttack.connectWithAllies = false;
	this.projectileAttack.attackbox.SetBounds(-70,-40,70,40);
	this.projectileAttack.warmupframes = 1;
	this.projectileAttack.attackFrames = 1;
	this.projectileAttack.cooldownframes = 30;
	this.projectileAttack.damageDealt = 5;
	this.projectileAttack.staminaDrained = 0;
	this.projectileAttack.visualContactZ = 0;
	this.projectileAttack.intoxicationDealt = 1600;
	this.projectileAttack.hitStunDealt = 0.2;
	this.projectileAttack.remainActiveUntil = 1;
	this.projectileAttack.connectWithOwner = false;
	
	this.aimX = 400;
	this.aimY = 0;
	
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * 25,y:-this.scale * 15});
	this.hitRect.expandToFit({x:this.scale * 25,y:this.scale * 15});
	
	this.animationSetup();
};

Dissolution.prototype.editorProperties = ['displayName','alliance','health','orbsOnDeath', 'orbsAfterSex', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld'];
Dissolution.prototype.runtimeProperties = ['newlySpawned','newlySpawnedTargetX','newlySpawnedTargetY','state','stateFrames','corrupted','recruited'];

Dissolution.prototype.GetMoveMaxVelocity = function()
{		
	return 5.0;
};

Dissolution.prototype.GetStaminaRecovery = function()
{
	if (IsInvulnerable(this.state))
		return this.staminaRecoveryPerFrameWhenKOed;
	else
		return this.staminaRecoveryPerFrame; // Stamina fully recovers in 5 seconds when not dazed
};

Dissolution.prototype.DrawSprite = function()
{
	drawEntityRoundShadow(this,260);

	ctx.globalAlpha = this.alpha;
	this.animationModel.Draw();
	ctx.globalAlpha = 1.0;
	
	if (debug === 2 && this.ai != null)
		this.ai.Draw();
};


Dissolution.prototype.UpdateState = function()
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
		else if (this.controller.jump)
		{
			if (this.velZ < 5.0)
				this.accelZ = 1.0;
		}
	}
	else if (this.state === States.BasicAttack)
	{
		// Move the character based on controller input
		//this.ProcessDirectionalInput();
		this.animationModel.ChangeState("attack");
		
		if (this.stateFrames === 1)
			this.hiccupSFX.Play(0.8,-0.2);
		
		//if (this.stateFrames === 26)
		//	this.attackSFX.Play();
		
		// Spawn the projectile
		if (this.stateFrames === 30)
		{
			var attack = this.projectileAttack.Clone();
			var projectile = new Projectile(this.projectileAirAnim, this.projectileHitAnim, attack, this);
			projectile.posX = this.posX;
			projectile.posY = this.posY;
			projectile.posZ = 302;
			projectile.orderBonus = 50;
			
			// Shoot the projectile in the direction of the person we want to hit
			if (this.ai === null)
			{
				projectile.velX = this.facing * 20;
				projectile.velZ = 10;
				projectile.gravity *= 0.5;
			}
			else
			{
				var targetAngle = Math.atan2(this.ai.targetPosY - this.posY, this.ai.targetPosX - this.posX);
				projectile.velX = Math.cos(targetAngle) * 20;
				projectile.velY = Math.sin(targetAngle) * 20;
				projectile.velZ = 10;
				projectile.gravity *= 0.5;
			}
			
			projectile.obeysGravity = true;
			projectile.hitTime = 240;
			projectile.hitOnGround = true;
			projectile.deployAttackOnHit = true;
			projectile.freezeOnHit = true;
			projectile.hitRect.SetBounds(-30,-20,30,20);
			projectile.hitSFX = this.projectileSFX;
			attack.positionOwner = projectile;
			attack.Attack();
			
			level.entities.AddEffect(projectile);
		}
		
		if (this.stateFrames === 70)
			this.ChangeState(States.Walk);
		
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
		{
			this.cumSFX.Play(1.0,0.4);
		}
		this.animationModel.ChangeState("orgasm");
		if (this.animationModel.AnimationIsComplete("orgasm"))
		{
			level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,player.posZ+25,200,100,2.0));
			this.ReleaseOrbs();
			this.Die();
		}
	}
	
};

Dissolution.prototype.recruit = function(captor)
{
	this.ChangeAlliance(captor.alliance);
};

Dissolution.prototype.unrecruit = function()
{
	this.ChangeAlliance(2);
};

Dissolution.prototype.corrupt = function()
{
};

// All the animation frames associated with the Dissolution. These are in a sprite sheet.
GlobalResourceLoader.AddImageResource("sheet_Dissolution","images/enemies/sheet_Dissolution.txt");

Dissolution.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;									// This animation loops
	idleAnim.inheritFacing = 1;								// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddSequentialFrames("Dissolution/idle{0}",1,8);		// All the frames and their timing info
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
	hitStunAnim.AddFrame("Dissolution/hitstun");		// All the frames and their timing info
	hitStunAnim.SetDurationInSeconds(0.5);
	var hitStunState = new AnimationState();
	hitStunState.SetMainAnimation(hitStunAnim);
	this.animationModel.AddState("hitstun",hitStunState);
	
	// Define the corruption animation
	var animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("Dissolution/knockout{0}",1,12);
	animation.AddSequentialFrames("Dissolution/corruption{0}",1,12);
	animation.AddSequentialFrames("Dissolution/loop{0}",4,8);
	animation.SetDurationInSeconds(2.0);
	var state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("corruption",state);
	
	// Define the corruption animation
	var animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.HoldFrame("Dissolution/attack1",2);
	animation.HoldFrame("Dissolution/attack2",2);
	animation.AddSequentialFrames("Dissolution/attack{0}",3,11);
	animation.SetDurationInSeconds(1.2);
	var state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("attack",state);
	
	animation = new Animation(this);
	animation.repeat = 1;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("Dissolution/loop{0}",1,8);
	animation.SetDurationInSeconds(1.5);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("corrupt",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("Dissolution/orgasm{0}",1,14);
	animation.SetDurationInSeconds(1.4);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("orgasm",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("Dissolution/knockout{0}",1,12);
	animation.SetDurationInSeconds(1.2);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("knockout",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("Dissolution/getup{0}",1,7);
	animation.SetDurationInSeconds(0.7);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("getup",state);
	
	this.projectileAirAnim = new Animation(null,"Dissolution/projectile{0}", 4, 0.5, 1);
	
	this.projectileHitAnim = new Animation(this);
	this.projectileHitAnim.repeat = 0;							// This animation is one-shot
	this.projectileHitAnim.inheritFacing = 1;					// It inherits the player's facing property
	this.projectileHitAnim.matchPosition = false;
	this.projectileHitAnim.AddSequentialFrames("Dissolution/projectile{0}",5,14);
	this.projectileHitAnim.SetDurationInSeconds(0.5);
};

Dissolution.prototype.Capture = function(captor)
{	
	return null;
};

Dissolution.prototype.ChangeAlliance = function(newAlliance)
{
	this.alliance = newAlliance;
	this.projectileAttack.alliance = newAlliance;
};


// Boilerplate Entity Code
Dissolution.prototype.Init = EntityInit;
Dissolution.prototype.ChangeState = EntityChangeState;
Dissolution.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
Dissolution.prototype.Speed = EntitySpeed;
Dissolution.prototype.Kill = EntityKill;
Dissolution.prototype.ReleaseOrbs = EntityReleaseOrbs;
Dissolution.prototype.Die = EntityDie;
Dissolution.prototype.CancelAttack = EntityCancelAttack;
Dissolution.prototype.Respawn = EntityRespawn;		
Dissolution.prototype.GetGroundFriction = EntityGetGroundFriction;
//Dissolution.prototype.DrawSprite = EntityDrawSprite;
Dissolution.prototype.Draw = EntityDraw;
Dissolution.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//Dissolution.prototype.UpdateState = EntityUpdateState;	// Overridden
Dissolution.prototype.Update = EntityUpdate;
Dissolution.prototype.Push = EntityPush;
Dissolution.prototype.Hit = EntityHit;
//Dissolution.prototype.Capture = EntityCapture;
Dissolution.prototype.Release = EntityRelease;
//Dissolution.prototype.ChangeAlliance = EntityChangeAlliance;
Dissolution.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
Dissolution.prototype.CollisionDetection = EntityCollisionDetection;
Dissolution.prototype.WatchSex = EntityWatchSex;
Dissolution.prototype.DoneWatchingSex = EntityDoneWatchingSex;
//Dissolution.prototype.RequestAttackPermission = EntityRequestAttackPermission;
//Dissolution.prototype.ReleaseAttackPermission = EntityReleaseAttackPermission;
Dissolution.prototype.OnRemovalFromGame = EntityOnRemovalFromGame;


include("AICore.js");

function DissolutionAI(owner)
{
	AICore.call(this,owner);
};

DissolutionAI.prototype.GenerateNewAction = function()
{
	
	// Only attack the player
	if (player != null && distanceActorToActor(player, this.owner) < 2000)
	{
		//this.QueueAction(new DissolutionLeap(player, this.owner));
		this.QueueAction(new DissolutionAttack(player, this.owner));
		return;
	}
	
	// If there's nothing to do, wait 15 frames before evaluating again to lower CPU usage
	// And to make the AI seem more human by giving it some reaction time.
	this.QueueAction(new WaitAction(15));
	this.isPassThrough = false;
};

DissolutionAI.prototype.QueueAction = AICore.prototype.QueueAction;
DissolutionAI.prototype.Flush = AICore.prototype.Flush;
DissolutionAI.prototype.CancelCurrentAction = AICore.prototype.CancelCurrentAction;
DissolutionAI.prototype.Update = AICore.prototype.Update;
//DissolutionAI.prototype.Draw = AICore.prototype.Draw;
DissolutionAI.prototype.UpdateTargetPosition = AICore.prototype.UpdateTargetPosition;

DissolutionAI.prototype.Draw = function()
{
	AICore.prototype.Draw.call(this);
};

// This action does not end and must be cancelled
function DissolutionAttack(target, owner)
{
	BasicAction.call(this);
	this.facing = (target.posX > owner.posX)?1:-1;
	this.target = target;
	this.owner = owner;
};

DissolutionAttack.prototype.Update = function()
{
	this.timer += 1;
	
	// Don't attack if offscreen, that's super annoying
	if (this.timer === 1 && camera.walkingEntityOnscreenSide(this.owner) !== 0)
	{
		this.Complete();
		return;
	}
	
	if (this.timer === 1)
	{
		this.owner.ai.UpdateTargetPosition(this.target);
	}
	
	this.owner.facing = this.facing;
	
	if (this.timer < 40)
		this.owner.controller.punchKeyDown();
		
	if (this.timer > 140 && this.owner.state === States.Walk)
	{
		this.Complete();
	}
};

DissolutionAttack.prototype.Complete = function()
{
	this.ended = true;
};

// This action does not end and must be cancelled
function DissolutionLeap(target, owner)
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

DissolutionLeap.prototype.Update = function()
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

DissolutionLeap.prototype.Complete = function()
{
	this.ended = true;
};