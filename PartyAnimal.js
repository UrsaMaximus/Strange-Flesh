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

GlobalResourceLoader.AddAudioResource("partyanimal_attack1","sound/enemies/partyanimal_attack1.mp3");
GlobalResourceLoader.AddAudioResource("partyanimal_attack2","sound/enemies/partyanimal_attack2.mp3");
GlobalResourceLoader.AddAudioResource("partyanimal_attack3","sound/enemies/partyanimal_attack3.mp3");
GlobalResourceLoader.AddAudioResource("partyanimal_attackexplode1","sound/enemies/partyanimal_attackexplode1.mp3");
GlobalResourceLoader.AddAudioResource("partyanimal_grabbed1","sound/enemies/partyanimal_grabbed1.mp3");
GlobalResourceLoader.AddAudioResource("partyanimal_grabbed2","sound/enemies/partyanimal_grabbed2.mp3");
GlobalResourceLoader.AddAudioResource("partyanimal_grabbed3","sound/enemies/partyanimal_grabbed3.mp3");
GlobalResourceLoader.AddAudioResource("partyanimal_hit1","sound/enemies/partyanimal_hit1.mp3");
GlobalResourceLoader.AddAudioResource("partyanimal_hit2","sound/enemies/partyanimal_hit2.mp3");
GlobalResourceLoader.AddAudioResource("partyanimal_hit3","sound/enemies/partyanimal_hit3.mp3");

function PartyAnimal()
{
	EntityInit.call(this);
	this.displayName = "Party Animal";
	
	this.ai = new PartyAnimalAI(this);
	
	this.attackSFX = new RandomSoundCollection("partyanimal_attack{0}",3);
	this.projectileSFX = new RandomSoundCollection("partyanimal_attackexplode{0}",1);
	this.grabbedSFX = new RandomSoundCollection("partyanimal_grabbed{0}",3);
	this.hitSFX = new RandomSoundCollection("partyanimal_hit{0}",3);
	
	// Combat flags
	this.alliance = 2;
	this.grabbable = true;
	this.fuckable = false;
	this.kissable = false;
	this.throwable = true;
	this.knockoutable = true;
	this.corruptable = true;
	
	this.grabAdjustX = 20;
	this.grabAdjustY = 0;
	this.grabAdjustZ = 160;
	
	// Stats
	this.maxHealth = 30;
	this.maxHitStunFrames = 60;
	this.staminaRecoveryPerFrame = 1.0 / (60 * 10);	// Stamina fully recovers in 10 seconds when not dazed
	this.staminaRecoveryPerFrameWhenKOed = 1.0 / (60 * 4);	// Stamina fully recovers in 4 seconds
	this.weight = 20;
	
	this.orbsOnDeath = 10;
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
	
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * 25,y:-this.scale * 15});
	this.hitRect.expandToFit({x:this.scale * 25,y:this.scale * 15});
	
	this.animationSetup();
};

PartyAnimal.prototype.editorProperties = ['displayName','alliance','health','orbsOnDeath', 'orbsAfterSex', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld'];
PartyAnimal.prototype.runtimeProperties = ['newlySpawned','newlySpawnedTargetX','newlySpawnedTargetY','state','stateFrames','corrupted','recruited'];

PartyAnimal.prototype.GetMoveMaxVelocity = function()
{		
	return 7.0;
};

PartyAnimal.prototype.GetStaminaRecovery = function()
{
	if (IsInvulnerable(this.state))
		return this.staminaRecoveryPerFrameWhenKOed;
	else
		return this.staminaRecoveryPerFrame; // Stamina fully recovers in 5 seconds when not dazed
};

PartyAnimal.prototype.DrawSprite = function()
{
	drawEntityRoundShadow(this,260);

	ctx.globalAlpha = this.alpha;
	this.animationModel.Draw();
	ctx.globalAlpha = 1.0;
	
	if (debug === 2 && this.ai != null)
		this.ai.Draw();
};


PartyAnimal.prototype.UpdateState = function()
{
	var mag = Math.sqrt(Math.pow(this.velX,2)+Math.pow(this.velY,2));
	var ang = Math.atan2(this.velY,this.velX);
	
	// Do what needs to be done in each state and change the state if needed
	if (this.state === States.Walk)
	{
		if (mag < 2.6 && !this.controller.up && !this.controller.down && !this.controller.left && !this.controller.right)
		{
			if (this.animationModel.state === "walk")
			{
				this.animationModel.ChangeState("idle");
				this.animationModel.animations["idle"].mainAnimation.position = this.animationModel.animations["walk"].mainAnimation.position;
			}
			else
				this.animationModel.ChangeState("idle");
		}
		else
		{
			if (this.animationModel.state === "idle")
			{
				this.animationModel.ChangeState("walk");
				this.animationModel.animations["walk"].mainAnimation.position = this.animationModel.animations["idle"].mainAnimation.position;
			}
			else
				this.animationModel.ChangeState("walk");
		}
	
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
		if (this.stateFrames === 1)
			this.debounce = false;
			
		if (mag < 2.6 && !this.controller.up && !this.controller.down && !this.controller.left && !this.controller.right)
		{
			if (this.animationModel.state === "walk")
			{
				this.animationModel.ChangeState("idle");
				this.animationModel.animations["idle"].mainAnimation.position = this.animationModel.animations["walk"].mainAnimation.position;
			}
			else
				this.animationModel.ChangeState("idle");
		}
		else
		{
			if (this.animationModel.state === "idle")
			{
				this.animationModel.ChangeState("walk");
				this.animationModel.animations["walk"].mainAnimation.position = this.animationModel.animations["idle"].mainAnimation.position;
			}
			else
				this.animationModel.ChangeState("walk");
		}
	
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		// Spawn the abuse projectile
		if (this.animationModel.WasLastFrameActivation(0) && !this.debounce)
		{
			this.debounce = true;
			var attack = this.projectileAttack.Clone();
			var projectile = new Projectile(this.projectileAirAnim, this.projectileHitAnim, attack, this);
			projectile.posX = this.posX + 50 * this.facing;
			projectile.posY = this.posY;
			projectile.posZ = 100;
			projectile.orderBonus = 50;
			
			// Shoot the projectile in the direction of the person we want to hit
			//if (this.ai === null)
			//{
				projectile.velX = this.facing * 15;
				projectile.velZ = 20;
				projectile.gravity *= 0.35;
			//}
			//else
			//{
			//	var targetAngle = Math.atan2(this.ai.targetPosY - this.posY, this.ai.targetPosX - this.posX);
			//	projectile.velX = Math.cos(targetAngle) * 20;
			//	projectile.velY = Math.sin(targetAngle) * 20;
			//}
			projectile.obeysGravity = true;
			projectile.hitTime = 240;
			projectile.hitOnGround = true;
			projectile.deployAttackOnHit = true;
			projectile.freezeOnHit = true;
			projectile.hitRect.SetBounds(-30,-20,30,20);
			attack.positionOwner = projectile;
			projectile.hitSFX = this.projectileSFX;
			attack.Attack();
			
			level.entities.AddEffect(projectile);
			this.attackSFX.Play();
		}
		
		if (this.stateFrames === 40)
		{
		 	this.ChangeState(States.Walk);
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
	else if (this.state === States.Captive)
	{
		this.animationModel.ChangeState("idle");
	}
	else if (this.state === States.Thrown)
	{
		this.ChangeState(States.KnockedOut);
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
			this.cumSFX.Play(1.0,0);
		this.animationModel.ChangeState("orgasm");
		if (this.animationModel.AnimationIsComplete("orgasm"))
		{
			level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,player.posZ+25,200,100,2.0));
			this.ReleaseOrbs();
			this.Die();
		}
	}
	
};

PartyAnimal.prototype.recruit = function(captor)
{
	this.ChangeAlliance(captor.alliance);
};

PartyAnimal.prototype.unrecruit = function()
{
	this.ChangeAlliance(2);
};

PartyAnimal.prototype.corrupt = function()
{
};

// All the animation frames associated with the PartyAnimal. These are in a sprite sheet.
GlobalResourceLoader.AddImageResource("sheet_PartyAnimal","images/enemies/sheet_PartyAnimal.txt");

PartyAnimal.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;									// This animation loops
	idleAnim.inheritFacing = 1;								// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddSequentialFrames("PartyAnimal/idle{0}",1,6);		// All the frames and their timing info
	idleAnim.SetDurationInSeconds(0.6);							// Set how long one loop takes (in seconds)
	
	// Add the idle animation and all its transitions to the idle animation state
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	
	// Add all the animation states to the animations collection
	this.animationModel.AddState("idle",idleState);
	
	// Define the idle animation
	var walkAnim = new Animation(this);
	walkAnim.repeat = 1;									// This animation loops
	walkAnim.inheritFacing = 1;								// It inherits the player's facing property
    //walkAnim.dynamicRate = 1;					// This animation moves faster with player speed
	walkAnim.sendPosition = false;
	walkAnim.AddSequentialFrames("PartyAnimal/walk{0}",1,6);		// All the frames and their timing info
	walkAnim.SetDurationInSeconds(0.6);							// Set how long one loop takes (in seconds)
	
	// Add the idle animation and all its transitions to the idle animation state
	var walkState = new AnimationState();
	walkState.SetMainAnimation(walkAnim);
	
	// Add all the animation states to the animations collection
	this.animationModel.AddState("walk",walkState);
	
	// Define the hitstun animation
	var hitStunAnim = new Animation(this);
	hitStunAnim.repeat = 0;							// This animation is one-shot
	hitStunAnim.inheritFacing = 1;					// It inherits the player's facing property
	hitStunAnim.matchPosition = false;
	hitStunAnim.AddFrame("PartyAnimal/hitstun");		// All the frames and their timing info
	hitStunAnim.SetDurationInSeconds(0.5);
	var hitStunState = new AnimationState();
	hitStunState.SetMainAnimation(hitStunAnim);
	this.animationModel.AddState("hitstun",hitStunState);
	
	// Define the corruption animation
	var animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("PartyAnimal/corruption{0}",1,8);
	animation.SetDurationInSeconds(0.8);
	var state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("corruption",state);
	
	animation = new Animation(this);
	animation.repeat = 1;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("PartyAnimal/loop{0}",1,8);
	animation.SetDurationInSeconds(1.5);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("corrupt",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("PartyAnimal/orgasm{0}",1,9);
	animation.SetDurationInSeconds(0.9);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("orgasm",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("PartyAnimal/fall{0}",1,8);
	animation.SetDurationInSeconds(0.8);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("knockout",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("PartyAnimal/getup{0}",1,2);
	animation.SetDurationInSeconds(0.3);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("getup",state);
	
	this.projectileAirAnim = new Animation(null,"PartyAnimal/bottle{0}", 8, 0.8, 1);
	
	this.projectileHitAnim = new Animation(this);
	this.projectileHitAnim.repeat = 0;							// This animation is one-shot
	this.projectileHitAnim.inheritFacing = 1;					// It inherits the player's facing property
	this.projectileHitAnim.matchPosition = false;
	this.projectileHitAnim.AddSequentialFrames("PartyAnimal/explosion{0}",1,6);
	this.projectileHitAnim.SetDurationInSeconds(0.6);
};

PartyAnimal.prototype.Capture = function(captor)
{	
	return null;
};

PartyAnimal.prototype.ChangeAlliance = function(newAlliance)
{
	this.alliance = newAlliance;
	//this.projectileAttack.alliance = newAlliance;
};


// Boilerplate Entity Code
PartyAnimal.prototype.Init = EntityInit;
PartyAnimal.prototype.ChangeState = EntityChangeState;
PartyAnimal.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
PartyAnimal.prototype.Speed = EntitySpeed;
PartyAnimal.prototype.Kill = EntityKill;
PartyAnimal.prototype.ReleaseOrbs = EntityReleaseOrbs;
PartyAnimal.prototype.Die = EntityDie;
PartyAnimal.prototype.CancelAttack = EntityCancelAttack;
PartyAnimal.prototype.Respawn = EntityRespawn;		
PartyAnimal.prototype.GetGroundFriction = EntityGetGroundFriction;
//PartyAnimal.prototype.DrawSprite = EntityDrawSprite;
PartyAnimal.prototype.Draw = EntityDraw;
PartyAnimal.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//PartyAnimal.prototype.UpdateState = EntityUpdateState;	// Overridden
PartyAnimal.prototype.Update = EntityUpdate;
PartyAnimal.prototype.Push = EntityPush;
PartyAnimal.prototype.Hit = EntityHit;
PartyAnimal.prototype.Capture = EntityCapture;
PartyAnimal.prototype.Release = EntityRelease;
//PartyAnimal.prototype.ChangeAlliance = EntityChangeAlliance;
PartyAnimal.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
PartyAnimal.prototype.CollisionDetection = EntityCollisionDetection;
PartyAnimal.prototype.WatchSex = EntityWatchSex;
PartyAnimal.prototype.DoneWatchingSex = EntityDoneWatchingSex;
//PartyAnimal.prototype.RequestAttackPermission = EntityRequestAttackPermission;
//PartyAnimal.prototype.ReleaseAttackPermission = EntityReleaseAttackPermission;
PartyAnimal.prototype.OnRemovalFromGame = EntityOnRemovalFromGame;


include("AICore.js");

function PartyAnimalAI(owner)
{
	AICore.call(this,owner);
};

PartyAnimalAI.prototype.GenerateNewAction = function()
{
	
	// Only attack the player
	if (player != null && distanceActorToActor(player, this.owner) < 2000)
	{
		this.QueueAction(new PartyAnimalLeap(player, this.owner));
		this.QueueAction(new PartyAnimalAttack(player, this.owner));
		return;
	}
	
	// If there's nothing to do, wait 15 frames before evaluating again to lower CPU usage
	// And to make the AI seem more human by giving it some reaction time.
	this.QueueAction(new WaitAction(15));
	this.isPassThrough = false;
};

PartyAnimalAI.prototype.QueueAction = AICore.prototype.QueueAction;
PartyAnimalAI.prototype.Flush = AICore.prototype.Flush;
PartyAnimalAI.prototype.CancelCurrentAction = AICore.prototype.CancelCurrentAction;
PartyAnimalAI.prototype.Update = AICore.prototype.Update;
//PartyAnimalAI.prototype.Draw = AICore.prototype.Draw;
PartyAnimalAI.prototype.UpdateTargetPosition = AICore.prototype.UpdateTargetPosition;

PartyAnimalAI.prototype.Draw = function()
{
	AICore.prototype.Draw.call(this);
};

// This action does not end and must be cancelled
function PartyAnimalAttack(target, owner)
{
	BasicAction.call(this);
	this.facing = (target.posX > owner.posX)?1:-1;
	this.target = target;
	this.owner = owner;
};

PartyAnimalAttack.prototype.Update = function()
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

PartyAnimalAttack.prototype.Complete = function()
{
	this.ended = true;
};

// This action does not end and must be cancelled
function PartyAnimalLeap(target, owner)
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

PartyAnimalLeap.prototype.Update = function()
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

PartyAnimalLeap.prototype.Complete = function()
{
	this.ended = true;
};