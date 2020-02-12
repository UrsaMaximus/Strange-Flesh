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

GlobalResourceLoader.AddAudioResource("GOH_GagExplodes","sound/enemies/GOH_GagExplodes.mp3");
GlobalResourceLoader.AddAudioResource("GOH_GagLaser","sound/enemies/GOH_GagLaser.mp3");

function BallGag(orcHead)
{
	EntityInit.call(this);
	
	this.displayName = "Ball Gag";
	//this.spriteCenterX = 100;
	//this.spriteCenterY = 190;
	
	this.gagExplodeSFX = GlobalResourceLoader.GetSound("GOH_GagExplodes");
	this.gagAttackSFX = GlobalResourceLoader.GetSound("GOH_GagLaser");
	
	// Combat flags
	this.alliance = 0;
	this.grabbable = true;
	this.fuckable = false;
	this.kissable = false;
	this.throwable = true;
	this.corruptable = false;
	this.knockoutable = false;
	this.stunnable = false;
	
	this.deathTimer = 0;
	
	if(typeof(orcHead)=='undefined') 
		orcHead = null;
	this.orcHead = orcHead;
	
	// Stats
	this.health = 1;
	this.maxHealth = 1;
	this.weight = 40;
	
	// Collision
	this.zHeight = this.scale * 86;
	this.collisionRadius = this.scale * 18;
	
	this.grabAdjustX = 40;
	this.grabAdjustY = 0;
	this.grabAdjustZ = 130;
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * 40 / 2,y:-this.scale * 14 / 2});
	this.hitRect.expandToFit({x:this.scale * 40 / 2,y:this.scale * 14 / 2});
	

	// Explosion attack
	this.explosionAttack = new Attack(this);
	this.explosionAttack.damageDealt = 25;
	this.explosionAttack.staminaDrained = 1.0;
	var box = new BoundingRect();
	box.Resize(95*3,95*3);
	this.explosionAttack.attackbox = box;
	this.explosionAttack.zHeight = 0;
	this.explosionAttack.zSize = 95*3;
	this.explosionAttack.visualContactX = 0;
	this.explosionAttack.visualContactZ = 95*1.5;
	this.explosionAttack.alliance = 0;
	this.explosionAttack.warmupframes = 10;
	this.explosionAttack.attackFrames = 1;
	this.explosionAttack.cooldownframes = 49;
	
	this.animationSetup();
};

BallGag.prototype.editorProperties = ['health', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld'];

BallGag.prototype.GetMoveMaxVelocity = function()
{		
	if (this.state === States.Jump || this.state === States.Fall || this.state === States.FallHelpless)
		return 3.0;
	else
		return 0;
};

BallGag.prototype.GetStaminaRecovery = function()
{
	return 1; // Stamina fully recovers in 5 seconds when not dazed
};

BallGag.prototype.DrawSprite = function()
{
	if (!IsDeadOrDying(this.state))
	{
		// Draw shadow
		ctx.globalAlpha = 0.4 * this.alpha;
		ctx.fillStyle = "#000000";
		var shadowScale = 500 / (this.posZ + 500);
		drawEllipse(0,-6,shadowScale*180,shadowScale*40);
	}
	
	ctx.globalAlpha = this.alpha;
	this.animationModel.Draw();
	ctx.globalAlpha = 1.0;
};

BallGag.prototype.UpdateState = function()
{
	if (this.orcHead !== null)
		camera.addObjectToTrack(this); 
	
	if (!IsDeadOrDying(this.state))
	{
		if (this.orcHead !== null && IsDeadOrDying(this.orcHead.state))
		{
			this.deathTimer+=1;
		}
	
		else if (this.orcHead !== null && !IsDeadOrDying(this.orcHead.state))
		{
			if (this.orcHead.ballgagState !== 2)
				this.deathTimer+=1;
		}
		
		if (this.deathTimer > 60)
			this.ChangeState(States.Dying);
		
	}
	
	// Do what needs to be done in each state and change the state if needed
	if (this.state === States.Walk)
	{
		this.animationModel.ChangeState("idle");
		
		// Change to jump state
		if (this.controller.jumpActivate())
		{
			this.ChangeState(States.Jump);
		}
		
		if (this.controller.punchActivate())
		{
			soundWaveTrigger = 2;
		}
	}
	else if (this.state === States.Jump)
	{	
		this.animationModel.ChangeState("jump");
		if (this.controller.jump && this.stateFrames < this.maxJumpFrames)
		{
			this.ProcessDirectionalInput();
			this.accelZ = 5.0;
		}
		else
		{
			this.ChangeState(States.Fall);
		}
	}
	else if (this.state === States.Fall)
	{
		this.ProcessDirectionalInput();
		if (this.posZ <= 0)
			this.ChangeState(States.Walk);
	}
	else if (this.state === States.Thrown)
	{
		this.animationModel.ChangeState("thrown");
		if (this.posZ <= 0)
			this.ChangeState(States.Walk);
	}
	else if (this.state === States.Captive)
	{
		this.animationModel.ChangeState("captive");
	}
	else if (this.state === States.Dying)
	{
		if (this.stateFrames === 1)
		{
			this.gravity = -gravity;
			this.explosionAttack.Attack();
			this.animationModel.ChangeState("exploding");
			this.gagExplodeSFX.Play();
		}
		
		if (this.animationModel.AnimationIsComplete("exploding"))
			this.ChangeState(States.Dead);
	}
	// Any non-captive state should just circle back to the walk state
	else if (this.state !== States.Dead && !IsCaptive(this.state))
	{
		this.ChangeState(States.Walk);
	}
	
	if (soundWaveTrigger === 1)
	{
		if (this.state === States.Walk)
		{
			this.projectile = new SoundProjectile(this, -9, 0, 52*3, -1, true);
			level.entities.AddEffect(this.projectile);
		}
		else
		{
			this.projectile = new SoundProjectile(this, 12*3, 0, 42*3, -1, false);
			this.projectile.attack.damageDealt = 120;
			level.entities.AddEffect(this.projectile);
		}
		
		this.gagAttackSFX.Play(0.8);
	}
	
};

// All the animation frames associated with the BallGag.
GlobalResourceLoader.AddImageResource("sheet_BallGag","images/joe5/sheet_BallGag.txt");
GlobalResourceLoader.AddImageResource("sheet_OrcSpeaker","images/joe5/sheet_OrcSpeaker.txt");
GlobalResourceLoader.AddImageResource("sheet_GagExplosion","images/effect/sheet_GagExplosion.txt");

BallGag.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;						// This animation loops
	idleAnim.inheritFacing = 2;					// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddFrame("ballgag/ground1");		// All the frames and their timing info
	idleAnim.SetDurationInSeconds(1.0);
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	this.animationModel.AddState("idle",idleState);
	
	// Define the idle animation
	var anim = new Animation(this);
	anim.repeat = 1;						// This animation loops
	anim.inheritFacing = 2;					// It inherits the player's facing property
	anim.sendPosition = false;
	anim.AddFrame("ballgag/flying1");		// All the frames and their timing info
	anim.SetDurationInSeconds(1.0);
	var state = new AnimationState();
	state.SetMainAnimation(anim);
	this.animationModel.AddState("thrown",state);
	
	// Define the idle animation
	var anim = new Animation(this);
	anim.repeat = 1;						// This animation loops
	anim.inheritFacing = 2;					// It inherits the player's facing property
	anim.sendPosition = false;
	anim.AddFrame("ballgag/pickup1");		// All the frames and their timing info
	anim.SetDurationInSeconds(1.0);
	var state = new AnimationState();
	state.SetMainAnimation(anim);
	this.animationModel.AddState("captive",state);
	
	var anim = new Animation(this);
	anim.repeat = 0;						// This animation is one-shot
	anim.inheritFacing = 1;					// It inherits the player's facing property
	anim.sendPosition = false;
	anim.AddSequentialFrames("GagExplosion/explosion{0}",1,16);		// All the frames and their timing info
	anim.SetDurationInSeconds(1.0);
	var state = new AnimationState();
	state.SetMainAnimation(anim);
	this.animationModel.AddState("exploding",state);
	
    this.soundwaveAnim = new Animation(this);
	this.soundwaveAnim.AddFrame("orcspeaker/soundwave");
	this.soundwaveAnim.SetDurationInSeconds(4);
	this.soundwaveAnim.inheritFacing = 1;
	
	this.soundwaveAnimUp = new Animation(this);
	this.soundwaveAnimUp.AddFrame("orcspeaker/soundwave_up");
	this.soundwaveAnimUp.SetDurationInSeconds(4);
	this.soundwaveAnimUp.inheritFacing = 1;
};

BallGag.prototype.NotifyDamageDealt = function(damageDealt, corruptionDealt)
{
	EntityNotifyDamageDealt.call(this, damageDealt, corruptionDealt);
	this.health = 0;
};

// Boilerplate Entity Code
BallGag.prototype.Init = EntityInit;
BallGag.prototype.ChangeState = EntityChangeState;
BallGag.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
BallGag.prototype.Speed = EntitySpeed;
BallGag.prototype.Kill = EntityKill;
BallGag.prototype.ReleaseOrbs = EntityReleaseOrbs;
BallGag.prototype.Die = EntityDie;
BallGag.prototype.CancelAttack = EntityCancelAttack;
BallGag.prototype.Respawn = EntityRespawn;		
BallGag.prototype.GetGroundFriction = EntityGetGroundFriction;
// BallGag.prototype.DrawSprite = EntityDrawSprite;		// Overridden
BallGag.prototype.Draw = EntityDraw;
BallGag.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//BallGag.prototype.UpdateState = EntityUpdateState;	// Overridden
BallGag.prototype.Update = EntityUpdate;
BallGag.prototype.Push = EntityPush;
BallGag.prototype.Hit = EntityHit;
BallGag.prototype.Capture = EntityCapture;
BallGag.prototype.Release = EntityRelease;
BallGag.prototype.ChangeAlliance = EntityChangeAlliance;
//BallGag.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
BallGag.prototype.CollisionDetection = EntityCollisionDetection;
BallGag.prototype.WatchSex = EntityWatchSex;
BallGag.prototype.DoneWatchingSex = EntityDoneWatchingSex;