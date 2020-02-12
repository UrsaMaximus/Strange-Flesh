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

GlobalResourceLoader.AddAudioResource("virusfromvenus_cum1",         "sound/enemies/virusfromvenus_cum1.mp3");
GlobalResourceLoader.AddAudioResource("virusfromvenus_cum2",         "sound/enemies/virusfromvenus_cum2.mp3");
GlobalResourceLoader.AddAudioResource("virusfromvenus_cumhit1",      "sound/enemies/virusfromvenus_cumhit1.mp3");
GlobalResourceLoader.AddAudioResource("virusfromvenus_cumsplatter1", "sound/enemies/virusfromvenus_cumsplatter1.mp3");
GlobalResourceLoader.AddAudioResource("virusfromvenus_hit1",         "sound/enemies/virusfromvenus_hit1.mp3");
GlobalResourceLoader.AddAudioResource("virusfromvenus_hit2",         "sound/enemies/virusfromvenus_hit2.mp3");
GlobalResourceLoader.AddAudioResource("virusfromvenus_spawn1",       "sound/enemies/virusfromvenus_spawn1.mp3");
GlobalResourceLoader.AddAudioResource("virusfromvenus_spawn2",       "sound/enemies/virusfromvenus_spawn2.mp3");

function VirusFromVenus()
{
	EntityInit.call(this);
	this.displayName = "The Virus from Venus";
	
	this.ai = new VirusFromVenusAI(this);
	
	this.hitSFX =      new RandomSoundCollection("virusfromvenus_hit{0}",2);
	this.attackSFX =   new RandomSoundCollection("virusfromvenus_cum{0}",2);
	this.spawnSFX =    new RandomSoundCollection("virusfromvenus_spawn{0}",2);
	this.cumHitSFX =   GlobalResourceLoader.GetSound("virusfromvenus_cumhit1");
	this.cumSplatterSFX =   GlobalResourceLoader.GetSound("virusfromvenus_cumsplatter1");
	this.cumSFX =   GlobalResourceLoader.GetSound("cum3");


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
	
	this.orbsOnDeath = 20;
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
	this.projectileAttack.intoxicationDealt = 800;
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

VirusFromVenus.prototype.editorProperties = ['displayName','alliance','health','orbsOnDeath', 'orbsAfterSex', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld'];
VirusFromVenus.prototype.runtimeProperties = ['newlySpawned','newlySpawnedTargetX','newlySpawnedTargetY','state','stateFrames','corrupted','recruited'];

VirusFromVenus.prototype.GetMoveMaxVelocity = function()
{		
	return 5.0;
};

VirusFromVenus.prototype.GetStaminaRecovery = function()
{
	if (IsInvulnerable(this.state))
		return this.staminaRecoveryPerFrameWhenKOed;
	else
		return this.staminaRecoveryPerFrame; // Stamina fully recovers in 5 seconds when not dazed
};

VirusFromVenus.prototype.DrawSprite = function()
{
	drawEntityRoundShadow(this,260);

	ctx.globalAlpha = this.alpha;
	this.animationModel.Draw();
	ctx.globalAlpha = 1.0;
	
	if (debug === 2 && this.ai != null)
		this.ai.Draw();
};


VirusFromVenus.prototype.UpdateState = function()
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
		
		// Spawn the cum projectile
		if (this.stateFrames === 25 || this.stateFrames === 28 || this.stateFrames === 31)
		{	
			this.attackSFX.Play();
			
			var attack = this.projectileAttack.Clone();
			var projectile = new Projectile(this.projectileAirAnim, this.projectileHitAnim, attack, this);
			projectile.posX = this.posX + this.facing * 318;
			projectile.posY = this.posY;
			projectile.posZ = 180;
			projectile.orderBonus = 50;
			projectile.velX = this.facing * 20;
			projectile.velZ = 5;
			projectile.gravity *= 0.1;
			projectile.obeysGravity = true;
			projectile.hitTime = 240;
			projectile.hitOnGround = true;
			projectile.deployAttackOnHit = true;
			projectile.freezeOnHit = true;
			projectile.hitRect.SetBounds(-30,-20,30,20);
			projectile.hitSFX = this.cumHitSFX;

			attack.positionOwner = projectile;
			attack.Attack();
			
			var virus = this;
			
			projectile.onHit = function()
			{
				for (var i=0; i < 15; i++)
				{
					var animation = getRandomItemFromArray(virus.splatters);
					var splatter = new Projectile(animation, virus.splatterHitAnim, null, null);
					splatter.posX = projectile.posX;
					splatter.posY = projectile.posY;
					splatter.posZ = projectile.posZ;
					splatter.velX = (Math.random()-0.5) * 28.0;
					splatter.velY = (Math.random()-0.5) * 11.0;
					splatter.velZ = (Math.random()) * 33.0;
					splatter.obeysGravity = true;
					splatter.hitOnGround = true;
					splatter.freezeOnHit = true;
					if (i === 0)
						splatter.hitSFX = virus.cumSplatterSFX;
					splatter.hitRect.SetBounds(-15,-15,15,15);
					level.entities.AddEffect(splatter);
				}
			};
			
			level.entities.AddEffect(projectile);
		}
		
		if (this.stateFrames === 28)
		{
			var effectAnim = new EffectAnimation(this.projectileSplashAnim, this, false);
			effectAnim.holdUntilOwnerDies = true;
			effectAnim.posX += (this.facing * 500)
			level.entities.AddEffect(effectAnim);
		}
		
		if (this.stateFrames === 40)
		{
			this.accelX = this.facing * -10;
			this.accelZ = 20;
			this.posZ += 0.1;
		}
		
		if (this.stateFrames === 70)
		{
			level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,this.posZ+25,200,100,2.0));
			this.ReleaseOrbs();
			this.Die();
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
			this.cumSFX.Play(2.0,0.7);
			this.cumSplatterSFX.Play(1.0,0.8);
			this.cumSplatterSFX.Play(1.0,0.9);
			this.cumSplatterSFX.Play(1.0,1.0);
		}
		this.animationModel.ChangeState("orgasm");
		if (this.animationModel.AnimationIsComplete("orgasm"))
		{
			level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,player.posZ+25,200,100,2.0));
			this.ReleaseOrbs();
			this.Die();
		}
	}
	else if (this.state === States.Spawning)
	{
		this.animationModel.ChangeState("spawn");
		
		if (this.stateFrames === 1)
		{
			this.spawnSFX.Play();
		}
		if (this.animationModel.AnimationIsComplete("spawn"))
		{
			this.ChangeState(States.GetUp);
		}
	}
	
};

VirusFromVenus.prototype.recruit = function(captor)
{
	this.ChangeAlliance(captor.alliance);
};

VirusFromVenus.prototype.unrecruit = function()
{
	this.ChangeAlliance(2);
};

VirusFromVenus.prototype.corrupt = function()
{
};

// All the animation frames associated with the VirusFromVenus. These are in a sprite sheet.
GlobalResourceLoader.AddImageResource("sheet_VirusFromVenus","images/enemies/sheet_VirusFromVenus.txt");
GlobalResourceLoader.AddImageResource("sheet_VirusFromVenus_corrupt","images/enemies/sheet_VirusFromVenus_corrupt.txt");
GlobalResourceLoader.AddImageResource("sheet_CumProjectile","images/enemies/sheet_CumProjectile.txt");

VirusFromVenus.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;									// This animation loops
	idleAnim.inheritFacing = 1;								// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddSequentialFrames("VirusFromVenus/idle{0}",1,7);		// All the frames and their timing info
	idleAnim.SetDurationInSeconds(1.2);							// Set how long one loop takes (in seconds)
	
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
	animation.AddSequentialFrames("VirusFromVenus/walk{0}",1,8);
	animation.SetDurationInSeconds(6.4);
	var state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("walk",state);
	
	// Define the hitstun animation
	var hitStunAnim = new Animation(this);
	hitStunAnim.repeat = 0;							// This animation is one-shot
	hitStunAnim.inheritFacing = 1;					// It inherits the player's facing property
	hitStunAnim.matchPosition = false;
	hitStunAnim.AddFrame("VirusFromVenus/hitstun");		// All the frames and their timing info
	hitStunAnim.SetDurationInSeconds(0.5);
	var hitStunState = new AnimationState();
	hitStunState.SetMainAnimation(hitStunAnim);
	this.animationModel.AddState("hitstun",hitStunState);
	
	var animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("VirusFromVenus/fall{0}",1,9);
	animation.AddSequentialFrames("VirusFromVenus/corruption{0}",1,9);
	animation.SetDurationInSeconds(1.8);
	var state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("corruption",state);
	
	var animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("VirusFromVenus/attack{0}",1,13);
	animation.SetDurationInSeconds(1.3);
	var state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("attack",state);
	
	animation = new Animation(this);
	animation.repeat = 1;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("VirusFromVenus/loop{0}",1,6);
	animation.SetDurationInSeconds(1.5);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("corrupt",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("VirusFromVenus/loop{0}",1,4);
	animation.AddSequentialFrames("VirusFromVenus/orgasm{0}",1,16);
	animation.SetDurationInSeconds(2.0);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("orgasm",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("VirusFromVenus/fall{0}",1,9);
	animation.SetDurationInSeconds(0.9);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("knockout",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("VirusFromVenus/getup{0}",1,3);
	animation.SetDurationInSeconds(0.3);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("getup",state);
	
	animation = new Animation(this);
	animation.repeat = 0;							// This animation is one-shot
	animation.inheritFacing = 1;					// It inherits the player's facing property
	animation.matchPosition = false;
	animation.AddSequentialFrames("VirusFromVenus/spawn{0}",1,13);
	animation.SetDurationInSeconds(1.3);
	state = new AnimationState();
	state.SetMainAnimation(animation);
	this.animationModel.AddState("spawn",state);
	
	this.projectileSplashAnim = new Animation(null,"CumProjectile/splash{0}", 6, 0.6, 0);
	
	this.projectileAirAnim = new Animation(null,"CumProjectile/mainloop{0}", 4, 0.5, 1);
	
	this.projectileHitAnim = new Animation(this);
	this.projectileHitAnim.repeat = 0;							// This animation is one-shot
	this.projectileHitAnim.inheritFacing = 1;					// It inherits the player's facing property
	this.projectileHitAnim.matchPosition = false;
	this.projectileHitAnim.AddSequentialFrames("CumProjectile/mainsplat{0}",1,8);
	this.projectileHitAnim.SetDurationInSeconds(0.5);
	
	this.splatters = [new Animation(null,"CumProjectile/particle1"),
				      new Animation(null,"CumProjectile/particle2"),
					  new Animation(null,"CumProjectile/particle3")];
	this.splatterHitAnim = new Animation(null,"CumProjectile/genericparticlesplat{0}", 5, 0.5, 0);
};

VirusFromVenus.prototype.Capture = function(captor)
{	
	return null;
};

VirusFromVenus.prototype.ChangeAlliance = function(newAlliance)
{
	this.alliance = newAlliance;
	this.projectileAttack.alliance = newAlliance;
};

VirusFromVenus.prototype.Respawn = function(pos)
{
 	EntityRespawn.call(this, pos);
 	this.ChangeState(States.Spawning);
 	this.animationModel.ChangeState("spawn");
 	this.posZ = 0;
};


// Boilerplate Entity Code
VirusFromVenus.prototype.Init = EntityInit;
VirusFromVenus.prototype.ChangeState = EntityChangeState;
VirusFromVenus.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
VirusFromVenus.prototype.Speed = EntitySpeed;
VirusFromVenus.prototype.Kill = EntityKill;
VirusFromVenus.prototype.ReleaseOrbs = EntityReleaseOrbs;
VirusFromVenus.prototype.Die = EntityDie;
VirusFromVenus.prototype.CancelAttack = EntityCancelAttack;
//VirusFromVenus.prototype.Respawn = EntityRespawn;		
VirusFromVenus.prototype.GetGroundFriction = EntityGetGroundFriction;
//VirusFromVenus.prototype.DrawSprite = EntityDrawSprite;
VirusFromVenus.prototype.Draw = EntityDraw;
VirusFromVenus.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//VirusFromVenus.prototype.UpdateState = EntityUpdateState;	// Overridden
VirusFromVenus.prototype.Update = EntityUpdate;
VirusFromVenus.prototype.Push = EntityPush;
VirusFromVenus.prototype.Hit = EntityHit;
//VirusFromVenus.prototype.Capture = EntityCapture;
VirusFromVenus.prototype.Release = EntityRelease;
//VirusFromVenus.prototype.ChangeAlliance = EntityChangeAlliance;
VirusFromVenus.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
VirusFromVenus.prototype.CollisionDetection = EntityCollisionDetection;
VirusFromVenus.prototype.WatchSex = EntityWatchSex;
VirusFromVenus.prototype.DoneWatchingSex = EntityDoneWatchingSex;
//VirusFromVenus.prototype.RequestAttackPermission = EntityRequestAttackPermission;
//VirusFromVenus.prototype.ReleaseAttackPermission = EntityReleaseAttackPermission;
VirusFromVenus.prototype.OnRemovalFromGame = EntityOnRemovalFromGame;


include("AICore.js");

function VirusFromVenusAI(owner)
{
	AICore.call(this,owner);
	this.waited = false;
};

VirusFromVenusAI.prototype.GenerateNewAction = function()
{
	if (!this.waited)
	{
		this.QueueAction(new WaitAction(160));
		this.waited = true;
	}
	
	var attackAction = new AttackTargetAction(this.owner, 500, 90, player, -1, 0, 2);
	attackAction.tryAlternatePaths = false;
	this.QueueAction(attackAction);
};

VirusFromVenusAI.prototype.QueueAction = AICore.prototype.QueueAction;
VirusFromVenusAI.prototype.Flush = AICore.prototype.Flush;
VirusFromVenusAI.prototype.CancelCurrentAction = AICore.prototype.CancelCurrentAction;
VirusFromVenusAI.prototype.Update = AICore.prototype.Update;
VirusFromVenusAI.prototype.Draw = AICore.prototype.Draw;