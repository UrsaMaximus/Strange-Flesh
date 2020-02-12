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

GlobalResourceLoader.AddAudioResource("admonitor_grabbed1","sound/enemies/admonitor_grabbed1.mp3");
GlobalResourceLoader.AddAudioResource("admonitor_grabbed2","sound/enemies/admonitor_grabbed2.mp3");
GlobalResourceLoader.AddAudioResource("admonitor_hit1","sound/enemies/admonitor_hit1.mp3");
GlobalResourceLoader.AddAudioResource("admonitor_hit2","sound/enemies/admonitor_hit2.mp3");
GlobalResourceLoader.AddAudioResource("admonitor_shoulder1","sound/enemies/admonitor_shoulder1.mp3");
GlobalResourceLoader.AddAudioResource("admonitor_shoulder2","sound/enemies/admonitor_shoulder2.mp3");
GlobalResourceLoader.AddAudioResource("admonitor_attack1","sound/enemies/admonitor_attack1.mp3");
GlobalResourceLoader.AddAudioResource("admonitor_attack2","sound/enemies/admonitor_attack2.mp3");

function Admonitor()
{
	EntityInit.call(this);
	this.displayName = "Admonitor";
	
	this.ai = new AdmonitorAI(this);
	
	this.hitSFX = new RandomSoundCollection("admonitor_hit{0}",2);
	this.grabbedSFX = new RandomSoundCollection("admonitor_grabbed{0}",2);
	this.knockoutSFX = new RandomSoundCollection("admonitor_shoulder{0}",2);
	
	this.cumSFX = GlobalResourceLoader.GetSound("cum2");

	
	// Combat flags
	this.alliance = 2;
	this.grabbable = true;
	this.fuckable = false;
	this.kissable = false;
	this.throwable = true;
	this.knockoutable = true;
	this.corruptable = true;
	
	this.orbsOnDeath = 4;
	this.orbsAfterSex = 0;
	this.heathOrbsHeld = 0;
	this.corruptionOrbsHeld = 0;
	this.dominationOrbsHeld = 0;
	
	this.grabAdjustX = 20;
	this.grabAdjustY = 0;
	this.grabAdjustZ = 30;
	
	// Stats
	this.maxHealth = 100;
	this.maxHitStunFrames = 60;
	this.staminaRecoveryPerFrame = 1.0 / (60 * 10);	// Stamina fully recovers in 10 seconds when not dazed
	this.staminaRecoveryPerFrameWhenKOed = 1.0 / (60 * 4);	// Stamina fully recovers in 4 seconds
	this.weight = 80;
	
	//this.spriteCenterX = 64;
	//this.spriteCenterY = 98;
	
	// Flags
	this.aggresiveTowardsBartender = false;
	
	// Collision
	this.zHeight = this.scale * 130;
	this.collisionRadius = this.scale * 14;
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * 40,y:-this.scale * 14});
	this.hitRect.expandToFit({x:this.scale * 40,y:this.scale * 14});
	
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
	
	
	this.projectileAttack = new Attack(this);
	this.projectileAttack.alliance = 2;
	this.projectileAttack.connectWithAllies = true;
	this.projectileAttack.attackbox.SetBounds(-28,-28,28,28);
	this.projectileAttack.warmupframes = 1;
	this.projectileAttack.attackFrames = 1;
	this.projectileAttack.cooldownframes = 30;
	this.projectileAttack.damageDealt = 5;
	this.projectileAttack.staminaDrained = 0;
	this.projectileAttack.visualContactZ = 10 * this.scale;
	this.projectileAttack.hitStunDealt = 0.2;
	this.projectileAttack.remainActiveUntil = 1;
	this.projectileAttack.connectWithOwner = false;
	this.projectileAttack.sfx = new RandomSoundCollection("admonitor_attack{0}",2);
	
	this.animationSetup();
};

Admonitor.prototype.editorProperties = ['displayName','alliance','health','orbsOnDeath', 'orbsAfterSex', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld'];
Admonitor.prototype.runtimeProperties = ['newlySpawned','newlySpawnedTargetX','newlySpawnedTargetY','state','stateFrames','corrupted','recruited'];

Admonitor.prototype.GetMoveMaxVelocity = function()
{		
	return 11;
};

Admonitor.prototype.ChangeAlliance = function(newAlliance)
{
	this.alliance = newAlliance;
	this.tripAttack.alliance = newAlliance;
};

Admonitor.prototype.GetStaminaRecovery = function()
{
	if (IsInvulnerable(this.state))
		return this.staminaRecoveryPerFrameWhenKOed;
	else
		return this.staminaRecoveryPerFrame; // Stamina fully recovers in 5 seconds when not dazed
};

Admonitor.prototype.DrawSprite = function()
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

Admonitor.prototype.UpdateState = function()
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
			if (this.isPassThrough)
				this.tripAttack.Attack();
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
	else if (this.state === States.BasicAttack)
	{
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		// Spawn the abuse projectile
		if (this.stateFrames === 1)
		{
			var attack = this.projectileAttack.Clone();
			attack.PlaySFX();
			
			var airAnim;
			if (this.facing === 1)
				airAnim = getRandomItemFromArray(this.abuseAirAnims);
			else
				airAnim = getRandomItemFromArray(this.abuseAirAnimsLeft);
				
			var projectile = new Projectile(airAnim, this.abuseHitAnim, attack, this);
			projectile.posX = this.posX;
			projectile.posY = this.posY;
			projectile.posZ = 430;
			projectile.orderBonus = -50;
			
			// Shoot the projectile in the direction of the person we want to hit
			if (this.ai === null)
			{
				projectile.velX = this.facing * 20;
			}
			else
			{
				var targetAngle = Math.atan2(this.ai.targetPosY - this.posY, this.ai.targetPosX - this.posX);
				projectile.velX = Math.cos(targetAngle) * 20;
				projectile.velY = Math.sin(targetAngle) * 20;
			}
			
			projectile.velZ = -20;
			
			projectile.hitOnGround = true;
			projectile.deployAttackOnHit = true;
			attack.positionOwner = projectile;
			attack.Attack();
			level.entities.AddEffect(projectile);
		}
		
		if (this.stateFrames === 30)
			this.ChangeState(States.Walk);
		
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
		var fapSpeed = linearRemap(this.stateFrames, 1, 300, 2.1, 1.1);
		this.animationModel.animations["corrupt"].mainAnimation.SetDurationInSeconds(fapSpeed);
		
		if (fapSpeed === 1.1 && this.animationModel.animations["corrupt"].mainAnimation.endFrame)
		{
			this.ChangeState(States.CorruptOrgasm);
		}
	}
	else if (this.state === States.CorruptOrgasm)
	{
		if (this.stateFrames === 1)
			this.cumSFX.Play();
		this.tripAttack.Reset();
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
			this.animationModel.ChangeState("captive");
	}
	else if (this.state === States.Thrown)
	{
		this.ChangeState(States.KnockedOut);
	}
	
};

Admonitor.prototype.recruit = function(captor)
{
	this.ChangeAlliance(captor.alliance);
};

Admonitor.prototype.unrecruit = function()
{
	this.ChangeAlliance(2);
};

Admonitor.prototype.corrupt = function()
{
};

// All the animation frames associated with the Admonitor. These are in a sprite sheet.
GlobalResourceLoader.AddImageResource("sheet_Admonitor","images/enemies/sheet_Admonitor.txt");

Admonitor.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;									// This animation loops
	idleAnim.inheritFacing = 1;								// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddFrame("admonitor/idle1");		// All the frames and their timing info
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
	hitStunAnim.AddFrame("admonitor/hitstun1");		// All the frames and their timing info
	hitStunAnim.SetDurationInSeconds(0.5);
	var hitStunState = new AnimationState();
	hitStunState.SetMainAnimation(hitStunAnim);
	this.animationModel.AddState("hitstun",hitStunState);
	
	// Define the corruption animation
	var animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("admonitor/fall{0}",1,2);
	animation.AddSequentialFrames("admonitor/corruption{0}",1,9);
	animation.SetDurationInSeconds(1.9);
	var state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("corruption",state);
	
	animation = new Animation(this);
	animation.repeat = 1;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("admonitor/corruption{0}",10,11);
	animation.AddSequentialFrames("admonitor/sex{0}",3,6);
	animation.AddSequentialFrames("admonitor/sex{0}",1,6);
	animation.loopStartPosition = 0.5;
	//animation.AddFrame("admonitor/corruptionloop3");
	animation.SetDurationInSeconds(1.5);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("corrupt",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("admonitor/orgasm{0}",1,8);
	animation.SetDurationInSeconds(0.8);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("orgasm",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddFrame("admonitor/fall1");
	animation.SetDurationInSeconds(1.0);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("captive",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("admonitor/fall{0}",1,2);
	animation.SetDurationInSeconds(0.3);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("knockout",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("admonitor/fall{0}",3,5);
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
	walkAnim.AddSequentialFrames("admonitor/walk{0}",1,6);		// All the frames and their timing info
	walkAnim.SetDurationInSeconds(6.4);
	var walkState = new AnimationState();
	walkState.SetMainAnimation(walkAnim);
	this.animationModel.AddState("walk", walkState);
	
	this.abuseAirAnims = [ new Animation(this, "admonitor/projectile1"),
						   new Animation(this, "admonitor/projectile2"),
						   new Animation(this, "admonitor/projectile3") ];
						   
	this.abuseAirAnimsLeft = [ new Animation(this, "admonitor/projectileleft1"),
						   new Animation(this, "admonitor/projectileleft2"),
						   new Animation(this, "admonitor/projectileleft3") ];
	
	this.abuseAirAnims[0].inheritFacing = 0;
	this.abuseAirAnims[1].inheritFacing = 0;
	this.abuseAirAnims[2].inheritFacing = 0;
	this.abuseAirAnimsLeft[0].inheritFacing = 0;
	this.abuseAirAnimsLeft[1].inheritFacing = 0;
	this.abuseAirAnimsLeft[2].inheritFacing = 0;
	
	this.abuseHitAnim = new Animation(this, "admonitor/explosion{0}",7, 0.7, 0);
	this.abuseHitAnim.SetDurationByFramerate(20);
	this.abuseHitAnim.inheritFacing = 1;
};

Admonitor.prototype.Hit = function(attack, isCaptive)
{
	EntityHit.call(this, attack, isCaptive);
	
	if (attack.owner === player)
		this.aggresiveTowardsBartender = true;
}

// Boilerplate Entity Code
Admonitor.prototype.Init = EntityInit;
Admonitor.prototype.ChangeState = EntityChangeState;
Admonitor.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
Admonitor.prototype.Speed = EntitySpeed;
Admonitor.prototype.Kill = EntityKill;
Admonitor.prototype.ReleaseOrbs = EntityReleaseOrbs;
Admonitor.prototype.Die = EntityDie;
Admonitor.prototype.CancelAttack = EntityCancelAttack;
Admonitor.prototype.Respawn = EntityRespawn;		
Admonitor.prototype.GetGroundFriction = EntityGetGroundFriction;
//Admonitor.prototype.DrawSprite = EntityDrawSprite;
Admonitor.prototype.Draw = EntityDraw;
Admonitor.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//Admonitor.prototype.UpdateState = EntityUpdateState;	// Overridden
Admonitor.prototype.Update = EntityUpdate;
Admonitor.prototype.Push = EntityPush;
//Admonitor.prototype.Hit = EntityHit;
Admonitor.prototype.Capture = EntityCapture;
Admonitor.prototype.Release = EntityRelease;
//Admonitor.prototype.ChangeAlliance = EntityChangeAlliance;
Admonitor.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
Admonitor.prototype.CollisionDetection = EntityCollisionDetection;
Admonitor.prototype.WatchSex = EntityWatchSex;
Admonitor.prototype.DoneWatchingSex = EntityDoneWatchingSex;
//Admonitor.prototype.RequestAttackPermission = EntityRequestAttackPermission;
//Admonitor.prototype.ReleaseAttackPermission = EntityReleaseAttackPermission;
Admonitor.prototype.OnRemovalFromGame = EntityOnRemovalFromGame;


include("AICore.js");

function AdmonitorAI(owner)
{
	AICore.call(this,owner);
};

AdmonitorAI.prototype.GenerateNewAction = function()
{
	if (this.owner.aggresiveTowardsBartender && player != null && distanceActorToActor(player, this.owner) < 1000)
	{
		//var attackAction = new AttackTargetAction(this.owner, 350, 60, player, 0, 0);
		//attackAction.allowFriendlyFire = true;
		var attackAction = new ChaseAttackAction(player, 300, 600, 60);
		this.QueueAction(attackAction);
		this.owner.isPassThrough = false;
		return;
	}
	
	// If there is a nearby office angel, attack it
	var followTarget = level.entities.FindClosestEntityOfType(this.owner, 1000, OfficeAngel);
	if (followTarget != null)
	{
		//var attackAction = new AttackTargetAction(this.owner, 350, 60, followTarget, 0, 0);
		//attackAction.allowFriendlyFire = true;
		var attackAction = new ChaseAttackAction(followTarget, 300, 600, 60);
		this.owner.isPassThrough = true;
		attackAction.reverseDirectionOffscreen = true;
		this.QueueAction(attackAction);
		return;
	}
	
	if (player != null && distanceActorToActor(player, this.owner) < 1000)
	{
		//var attackAction = new AttackTargetAction(this.owner, 350, 60, player, 0, 0);
		//attackAction.allowFriendlyFire = true;
		var attackAction = new ChaseAttackAction(player, 300, 600, 60);
		this.QueueAction(attackAction);
		this.owner.isPassThrough = false;
		return;
	}
	
	// If there's nothing to do, wait 15 frames before evaluating again to lower CPU usage
	// And to make the AI seem more human by giving it some reaction time.
	this.QueueAction(new WaitAction(15));
	this.isPassThrough = false;
};

AdmonitorAI.prototype.QueueAction = AICore.prototype.QueueAction;
AdmonitorAI.prototype.Flush = AICore.prototype.Flush;
AdmonitorAI.prototype.CancelCurrentAction = AICore.prototype.CancelCurrentAction;
AdmonitorAI.prototype.Update = AICore.prototype.Update;
//AdmonitorAI.prototype.Draw = AICore.prototype.Draw;
AdmonitorAI.prototype.UpdateTargetPosition = AICore.prototype.UpdateTargetPosition;

AdmonitorAI.prototype.Draw = function()
{
	AICore.prototype.Draw.call(this);
};
