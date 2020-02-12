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

GlobalResourceLoader.AddAudioResource("watercooler_hit1","sound/environment/watercooler_hit1.mp3");
GlobalResourceLoader.AddAudioResource("watercooler_hit2","sound/environment/watercooler_hit2.mp3");
GlobalResourceLoader.AddAudioResource("watercooler_destroyed","sound/environment/watercooler_destroyed.mp3");

function WaterCooler()
{
	EntityInit.call(this);

	this.displayName = "Water Cooler";
	//this.spriteCenterX = 33;
	//this.spriteCenterY = 128;
	
	this.hitSFX =   new RandomSoundCollection("watercooler_hit{0}",2);
	this.breakSFX =   GlobalResourceLoader.GetSound("watercooler_destroyed");
	
	// Combat flags
	this.alliance = 0;
	this.grabbable = true;
	this.fuckable = false;
	this.kissable = false;
	this.throwable = true;
	this.corruptable = false;
	this.knockoutable = false;
	this.stunnable = false;
	
	// Stats
	this.health = 1;
	this.maxHealth = 1;
	this.broken = false;
	this.weight = 3000;
	
	// Collision
	this.zHeight = this.scale * 100;
	this.collisionRadius = this.scale * 10;
	
	this.grabAdjustX = 0;
	this.grabAdjustY = 0;
	this.grabAdjustZ = 120;
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * 50 / 2,y:-this.scale * 20 / 2});
	this.hitRect.expandToFit({x:this.scale * 50 / 2,y:this.scale * 20 / 2});

	this.animationSetup();
};

WaterCooler.prototype.ReInit = function()
{
	if (this.broken)
		this.animationModel.ApplyPrefix("broken");
};

WaterCooler.prototype.editorProperties = ['health', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld', 'broken'];

WaterCooler.prototype.GetMoveMaxVelocity = function()
{		
	if (this.state === States.Jump || this.state === States.Fall || this.state === States.FallHelpless)
		return 3.0;
	else
		return 0;
};

WaterCooler.prototype.GetStaminaRecovery = function()
{
	return 1; // Stamina fully recovers in 5 seconds when not dazed
};

WaterCooler.prototype.DrawSprite = function()
{
	// Draw shadow
	ctx.globalAlpha = 0.4 * this.alpha;
	ctx.fillStyle = "#000000";
	var shadowScale = 500 / (this.posZ + 500);
	drawEllipse(0,-6,shadowScale*180,shadowScale*40);

	ctx.globalAlpha = this.alpha;
	this.animationModel.Draw();
	ctx.globalAlpha = 1.0;
};

WaterCooler.prototype.generateDebris = function()
{
	for (var i=0; i < 5; i++)
	{
		var elasticity = 0.5*Math.random();
		var animation = this.debris1Anim;
		if (Math.random() >= 0.5)
			animation = this.debris2Anim;
			
		var debris = new DroppedItem(animation, this, 300, (Math.random()-0.5)*30, 290+(Math.random()-0.5)*30);
		debris.velX = (-2.5-5*Math.random())*this.facing;
		debris.velY = 5*(Math.random()-0.5);
		debris.velZ = 20+20*Math.random();
		debris.elasticity = elasticity;
		level.entities.AddEffect(debris);
	}
	
	for (var i=0; i < 6; i++)
	{
		var elasticity = 0;
		var velX = 15*(Math.random()-0.5);
		var animation = this.splash1Anim;
		if (velX > 0)
			animation = this.splash2Anim;
		
		var debris = new DroppedItem(animation, this, 45, (Math.random()-0.5)*90, 330+(Math.random()-0.5)*90);
		debris.velX = velX;
		debris.velY = 5*(Math.random()-0.5);
		debris.velZ = 30*Math.random();
		debris.dieOnTouchingGround = true;
		debris.elasticity = elasticity;
		level.entities.AddEffect(debris);
	}
};

WaterCooler.prototype.UpdateState = function()
{
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
			this.health = 0;
			this.generateDebris();
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
		if (this.posZ <= 0)
		{
			this.health = 0;
			this.ChangeState(States.Walk);
		}
	}
	else if (this.state === States.Dying)
	{
		this.orderBonus = -10;
		
		if (this.stateFrames > 60)
			this.alpha = crawlValue(this.alpha, 0, 0.01);
		
		if (this.alpha === 0)
			this.ChangeState(States.Dead);
	}
	// Any non-captive state should just circle back to the walk state
	else if (this.state !== States.Dead && !IsCaptive(this.state))
	{
		this.ChangeState(States.Walk);
	}
	
	if (!this.broken && this.health === 0)
	{
		this.broken = true;
		this.animationModel.ApplyPrefix("broken");
		
		
		this.breakSFX.Play();
		
		this.generateDebris();
		this.ReleaseOrbs();
	}
};

// All the animation frames associated with the WaterCooler.
GlobalResourceLoader.AddImageResource("sheet_Props","images/props/sheet_Props.txt");
GlobalResourceLoader.AddImageResource("sheet_Debris","images/props/sheet_Debris.txt");

WaterCooler.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;						// This animation loops
	idleAnim.inheritFacing = 1;					// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddFrame("props/watercooler");		// All the frames and their timing info
	idleAnim.SetDurationInSeconds(1.0);
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	this.animationModel.AddState("idle",idleState);
	
	this.debris1Anim = new Animation(this);
	this.debris1Anim.repeat = 0;
	this.debris1Anim.inheritFacing = 0;
	this.debris1Anim.AddFrame("debris/watercooler_debris1");
	this.debris1Anim.SetDurationInSeconds(1.0);
	
	this.debris2Anim = new Animation(this);
	this.debris2Anim.repeat = 0;
	this.debris2Anim.inheritFacing = 0;
	this.debris2Anim.AddFrame("debris/watercooler_debris2");
	this.debris2Anim.SetDurationInSeconds(1.0);
	
	this.splash1Anim = new Animation(this);
	this.splash1Anim.repeat = 0;
	this.splash1Anim.inheritFacing = 0;
	this.splash1Anim.AddFrame("debris/watercooler_splash1");
	this.splash1Anim.SetDurationInSeconds(1.0);
	
	this.splash2Anim = new Animation(this);
	this.splash2Anim.repeat = 0;
	this.splash2Anim.inheritFacing = 0;
	this.splash2Anim.AddFrame("debris/watercooler_splash2");
	this.splash2Anim.SetDurationInSeconds(1.0);
};

WaterCooler.prototype.NotifyDamageDealt = function(damageDealt, corruptionDealt)
{
	EntityNotifyDamageDealt.call(this, damageDealt, corruptionDealt);
	this.health = 0;
};

WaterCooler.prototype.Hit = function(attack, isCaptive)
{
	if (attack.damageDealt > 0 || attack.corruptionDealt === 0) this.hitSFX.Play();
	EntityHit.call(this, attack, isCaptive);
}

// Boilerplate Entity Code
WaterCooler.prototype.Init = EntityInit;
WaterCooler.prototype.ChangeState = EntityChangeState;
WaterCooler.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
WaterCooler.prototype.Speed = EntitySpeed;
WaterCooler.prototype.Kill = EntityKill;
WaterCooler.prototype.ReleaseOrbs = EntityReleaseOrbs;
WaterCooler.prototype.Die = EntityDie;
WaterCooler.prototype.CancelAttack = EntityCancelAttack;
WaterCooler.prototype.Respawn = EntityRespawn;		
WaterCooler.prototype.GetGroundFriction = EntityGetGroundFriction;
// WaterCooler.prototype.DrawSprite = EntityDrawSprite;		// Overridden
WaterCooler.prototype.Draw = EntityDraw;
WaterCooler.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//WaterCooler.prototype.UpdateState = EntityUpdateState;	// Overridden
WaterCooler.prototype.Update = EntityUpdate;
WaterCooler.prototype.Push = EntityPush;
//WaterCooler.prototype.Hit = EntityHit;
WaterCooler.prototype.Capture = EntityCapture;
WaterCooler.prototype.Release = EntityRelease;
WaterCooler.prototype.ChangeAlliance = EntityChangeAlliance;
//WaterCooler.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
WaterCooler.prototype.CollisionDetection = EntityCollisionDetection;
WaterCooler.prototype.WatchSex = EntityWatchSex;
WaterCooler.prototype.DoneWatchingSex = EntityDoneWatchingSex;