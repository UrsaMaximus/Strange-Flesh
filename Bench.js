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

GlobalResourceLoader.AddAudioResource("bench_hit1","sound/environment/bench_hit1.mp3");
GlobalResourceLoader.AddAudioResource("bench_hit2","sound/environment/bench_hit2.mp3");
GlobalResourceLoader.AddAudioResource("bench_destroyed","sound/environment/bench_destroyed.mp3");

function Bench()
{
	EntityInit.call(this);

	this.displayName = "Park Bench";
	//this.spriteCenterX = 66;
	//this.spriteCenterY = 60;
	
	this.hitSFX =   new RandomSoundCollection("bench_hit{0}",2);
	this.breakSFX = GlobalResourceLoader.GetSound("bench_destroyed");
	
	// Combat flags
	this.alliance = 0;
	this.grabbable = false;
	this.fuckable = false;
	this.kissable = false;
	this.throwable = false;
	this.corruptable = false;
	this.knockoutable = false;
	this.stunnable = false;
	
	// Stats
	this.maxHealth = 30;
	this.health = 30;
	this.broken = false;
	this.weight = Number.MAX_VALUE;
	
	// Collision
	this.zHeight = this.scale * 60;
	this.collisionRadius = this.scale * 7;
	
	this.grabAdjustX = 0;
	this.grabAdjustY = 0;
	this.grabAdjustZ = 50;
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * 133 / 2,y:-this.scale * 10});
	this.hitRect.expandToFit({x:this.scale * 133 / 2,y:this.scale * 10});

	this.animationSetup();
};

Bench.prototype.editorProperties = ['health'];

Bench.prototype.GetMoveMaxVelocity = function()
{		
	if (this.state === States.Jump || this.state === States.Fall || this.state === States.FallHelpless)
		return 3.0;
	else
		return 0;
};

Bench.prototype.GetStaminaRecovery = function()
{
	return 1; // Stamina fully recovers in 5 seconds when not dazed
};

Bench.prototype.DrawSprite = function()
{
	// Draw shadow
	ctx.globalAlpha = 0.4 * this.alpha;
	ctx.fillStyle = "#000000";
	var shadowScale = 500 / (this.posZ + 500);
	drawEllipse(0,-6,shadowScale*300,shadowScale*80);

	ctx.globalAlpha = this.alpha;
	this.animationModel.Draw();
	ctx.globalAlpha = 1.0;
};

Bench.prototype.generateDebris = function()
{		
	for (var i=0; i < 15; i++)
	{
		var elasticity = 0.3*Math.random();
		var animation = getRandomItemFromArray(this.debris);
		debris = new DroppedItem(animation, this, 300, (Math.random()-0.5)*400, Math.random()*300);
		debris.velX = (-5-8*Math.random())*this.facing;
		debris.velY = randomVelocity(5,10);
		debris.velZ = 20+20*Math.random();
		debris.elasticity = elasticity;
		level.entities.AddEffect(debris);
	}
};

Bench.prototype.UpdateState = function()
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
	
	if (this.health === 0)
	{
		this.breakSFX.Play();
		this.ChangeState(States.Dead);
		this.generateDebris();
		this.ReleaseOrbs();
		
		// Spawn in broken bench pieces
		
		// Offset front: -34, 0
		var brokenleft = new BenchPart();
		brokenleft.partID = 1;
		brokenleft.ReInit();
		brokenleft.posX = this.posX - 34 * 3;
		brokenleft.posY = this.posY;
		brokenleft.posZ = 36;
		level.entities.AddEntity(brokenleft);
		
		// Offset right:      34, 0
		var brokenright = new BenchPart();
		brokenright.partID = 2;
		brokenright.ReInit();
		brokenright.posX = this.posX + 34 * 3;
		brokenright.posY = this.posY;
		brokenright.posZ = 0;
		level.entities.AddEntity(brokenright);
	}
};

// All the animation frames associated with the Bench.
GlobalResourceLoader.AddImageResource("sheet_Props","images/props/sheet_Props.txt");
GlobalResourceLoader.AddImageResource("sheet_Debris","images/props/sheet_Debris.txt");

Bench.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;						// This animation loops
	idleAnim.inheritFacing = 0;					// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddFrame("props/parkbench");		// All the frames and their timing info
	idleAnim.SetDurationInSeconds(1.0);
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	this.animationModel.AddState("idle",idleState);
	
	this.debris = [];
	this.debris.push(new Animation(this,"debris/parkbench_debris1"));
	this.debris.push(new Animation(this,"debris/parkbench_debris2"));
	this.debris.push(new Animation(this,"debris/parkbench_debris3"));
};

Bench.prototype.NotifyDamageDealt = function(damageDealt, corruptionDealt)
{
	EntityNotifyDamageDealt.call(this, damageDealt, corruptionDealt);
	if (damageDealt > 0)
		this.generateDebris();
	//this.health = 0;
};

Bench.prototype.Hit = function(attack, isCaptive)
{
	this.hitSFX.Play();
	EntityHit.call(this, attack, isCaptive);
	if (attack.damageDealt > 0)
		this.generateDebris();
}

// Boilerplate Entity Code
Bench.prototype.Init = EntityInit;
Bench.prototype.ChangeState = EntityChangeState;
Bench.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
Bench.prototype.Speed = EntitySpeed;
Bench.prototype.Kill = EntityKill;
Bench.prototype.ReleaseOrbs = EntityReleaseOrbs;
Bench.prototype.Die = EntityDie;
Bench.prototype.CancelAttack = EntityCancelAttack;
Bench.prototype.Respawn = EntityRespawn;		
Bench.prototype.GetGroundFriction = EntityGetGroundFriction;
// Bench.prototype.DrawSprite = EntityDrawSprite;		// Overridden
Bench.prototype.Draw = EntityDraw;
Bench.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//Bench.prototype.UpdateState = EntityUpdateState;	// Overridden
Bench.prototype.Update = EntityUpdate;
Bench.prototype.Push = EntityPush;
//Bench.prototype.Hit = EntityHit;
Bench.prototype.Capture = EntityCapture;
Bench.prototype.Release = EntityRelease;
Bench.prototype.ChangeAlliance = EntityChangeAlliance;
//Bench.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
Bench.prototype.CollisionDetection = EntityCollisionDetection;
Bench.prototype.WatchSex = EntityWatchSex;
Bench.prototype.DoneWatchingSex = EntityDoneWatchingSex;


// BenchPart.js
//
// BenchPart : no additional methods added
// isa Entity : Draw(), Update(), enabled
//
function BenchPart()
{
	EntityInit.call(this);

	this.displayName = "Bench Piece";
	//this.spriteCenterX = 82/2;
	//this.spriteCenterY = 60;
	this.partID = 1; // 1 = left, 2 = right
	
	this.hitSFX =   new RandomSoundCollection("bench_hit{0}",2);
	
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
	this.maxHealth = 1;
	this.health = 0;
	this.weight = 100;
	
	// Collision
	this.zHeight = this.scale * 40;
	this.collisionRadius = this.scale * 10;
	
	this.grabAdjustX = 50;
	this.grabAdjustY = 0;
	this.grabAdjustZ = 0;
	
	this.ReInit();
};

BenchPart.prototype.editorProperties = ['partID'];

BenchPart.prototype.ReInit = function()
{
	this.hitRect = new BoundingRect();
	if (this.partID === 1)
	{
		this.hitRect.fitToPoint({x:-this.scale * 35,y:-this.scale * 10});
		this.hitRect.expandToFit({x:this.scale * 35,y:this.scale * 10});
		this.grabAdjustX = 0;
		this.grabAdjustY = 0;
		this.grabAdjustZ = 150;
		this.displayName = "Left Half of Bench";
	}
	else if (this.partID === 2)
	{
		this.hitRect.fitToPoint({x:-this.scale * 35,y:-this.scale * 10});
		this.hitRect.expandToFit({x:this.scale * 35,y:this.scale * 10});
		this.grabAdjustX = 0;
		this.grabAdjustY = 0;
		this.grabAdjustZ = 150;
		this.displayName = "Right Half of Bench";
	}

	this.animationSetup();
};

BenchPart.prototype.GetMoveMaxVelocity = function()
{		
	if (this.state === States.Jump || this.state === States.Fall || this.state === States.FallHelpless)
		return 3.0;
	else
		return 0;
};

BenchPart.prototype.GetStaminaRecovery = function()
{
	return 1; // Stamina fully recovers in 5 seconds when not dazed
};

BenchPart.prototype.DrawSprite = function()
{
	// Draw shadow
	ctx.globalAlpha = 0.4 * this.alpha;
	ctx.fillStyle = "#000000";
	var shadowScale = 500 / (this.posZ + 500);
	drawEllipse(0,0,shadowScale*this.hitRect.width(),shadowScale*this.hitRect.height());

	ctx.globalAlpha = this.alpha;
	this.animationModel.Draw();
	ctx.globalAlpha = 1.0;
};

BenchPart.prototype.UpdateState = function()
{
	// Do what needs to be done in each state and change the state if needed
	if (this.state === States.Walk)
	{
		this.animationModel.ChangeState("idle");
	}
	else if (this.state === States.Fall)
	{
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
};

BenchPart.prototype.animationSetup = function()
{
	var part = "";
	
	if (this.partID === 1)
	{
		part = "props/parkbench_left";
	}
	else if (this.partID === 2)
	{
		part = "props/parkbench_right";
	}
	
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;						// This animation loops
	idleAnim.inheritFacing = 0;					// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddFrame(part);		// All the frames and their timing info
	idleAnim.SetDurationInSeconds(1.0);
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	this.animationModel.AddState("idle",idleState);
};

BenchPart.prototype.NotifyDamageDealt = function(damageDealt, corruptionDealt)
{
	EntityNotifyDamageDealt.call(this, damageDealt, corruptionDealt);
	//this.health = 0;
};

BenchPart.prototype.Hit = function(attack, isCaptive)
{
	if (attack.damageDealt > 0 || attack.corruptionDealt === 0) this.hitSFX.Play();
	EntityHit.call(this, attack, isCaptive);
}

// Boilerplate Entity Code
BenchPart.prototype.Init = EntityInit;
BenchPart.prototype.ChangeState = EntityChangeState;
BenchPart.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
BenchPart.prototype.Speed = EntitySpeed;
BenchPart.prototype.Kill = EntityKill;
BenchPart.prototype.Die = EntityDie;
BenchPart.prototype.CancelAttack = EntityCancelAttack;
BenchPart.prototype.Respawn = EntityRespawn;		
BenchPart.prototype.GetGroundFriction = EntityGetGroundFriction;
// BenchPart.prototype.DrawSprite = EntityDrawSprite;		// Overridden
BenchPart.prototype.Draw = EntityDraw;
BenchPart.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//BenchPart.prototype.UpdateState = EntityUpdateState;	// Overridden
BenchPart.prototype.Update = EntityUpdate;
BenchPart.prototype.Push = EntityPush;
//BenchPart.prototype.Hit = EntityHit;
BenchPart.prototype.Capture = EntityCapture;
BenchPart.prototype.Release = EntityRelease;
BenchPart.prototype.ChangeAlliance = EntityChangeAlliance;
//BenchPart.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
BenchPart.prototype.CollisionDetection = EntityCollisionDetection;
BenchPart.prototype.WatchSex = EntityWatchSex;
BenchPart.prototype.DoneWatchingSex = EntityDoneWatchingSex;