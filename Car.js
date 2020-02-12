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

GlobalResourceLoader.AddAudioResource("car_firsthit","sound/environment/car_firsthit.mp3");
GlobalResourceLoader.AddAudioResource("car_hit1","sound/environment/car_hit1.mp3");
GlobalResourceLoader.AddAudioResource("car_hit2","sound/environment/car_hit2.mp3");
GlobalResourceLoader.AddAudioResource("car_hit3","sound/environment/car_hit3.mp3");
GlobalResourceLoader.AddAudioResource("car_destroyed","sound/environment/car_destroyed.mp3");

function Car()
{
	EntityInit.call(this);

	this.displayName = "Parked Car";
	//this.spriteCenterX = 200;
	//this.spriteCenterY = 110;
	this.mirrorOn = true;
	
	this.firstHitSFX =   GlobalResourceLoader.GetSound("car_firsthit");
	this.hitSFX =   new RandomSoundCollection("car_hit{0}",3);
	this.breakSFX =   GlobalResourceLoader.GetSound("car_destroyed");
	
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
	this.maxHealth = 100;
	this.health = 100;
	this.broken = false;
	this.weight = Number.MAX_VALUE;
	
	// Collision
	this.zHeight = this.scale * 100;
	this.collisionRadius = this.scale * 50;
	
	this.grabAdjustX = 0;
	this.grabAdjustY = 0;
	this.grabAdjustZ = 50;
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * 300 / 2,y:-this.scale * 100 / 2});
	this.hitRect.expandToFit({x:this.scale * 300 / 2,y:this.scale * 100 / 2});

	this.animationSetup();
};

Car.prototype.editorProperties = ['health'];

Car.prototype.GetMoveMaxVelocity = function()
{		
	return 10;
};

Car.prototype.GetStaminaRecovery = function()
{
	return 1; // Stamina fully recovers in 5 seconds when not dazed
};

Car.prototype.DrawSprite = function()
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

Car.prototype.generateDebris = function()
{
	
	var debris = null;
	
	if (this.mirrorOn && this.state === States.Dead)
	{
		debris = new DroppedItem(this.mirrorAnim, this, 300, -30, 10);
		debris.velX = -10*this.facing;
		debris.velY = 20;
		debris.velZ = 40;
		debris.elasticity = 0.3;
		debris.orderBonus = 20;
		level.entities.AddEffect(debris);
		
		this.mirrorOn = false;
	}
		
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

Car.prototype.UpdateState = function()
{
	// Do what needs to be done in each state and change the state if needed
	if (this.state === States.Walk)
	{
		this.animationModel.ChangeState("idle");
		this.ProcessDirectionalInput();
	}
	else if (this.state === States.Fall)
	{
		if (this.posZ <= 0)
			this.ChangeState(States.Walk);
	}
	
	if (this.health === 0)
	{
		this.breakSFX.Play();
		this.ChangeState(States.Dead);
		this.generateDebris();
		this.ReleaseOrbs();
		
		// Spawn in broken car pieces (tbd)
		// Offset front: -128,12
		var brokenfront = new CarPart();
		brokenfront.partID = 1;
		brokenfront.ReInit();
		brokenfront.posX = this.posX - 128 * 3;
		brokenfront.posY = this.posY+50;
		brokenfront.posZ = 36;
		level.entities.AddEntity(brokenfront);
		
		// Offset mid:      0, 0
		var brokenmid = new CarPart();
		brokenmid.partID = 2;
		brokenmid.ReInit();
		brokenmid.posX = this.posX;
		brokenmid.posY = this.posY+50;
		brokenmid.posZ = 0;
		level.entities.AddEntity(brokenmid);
		
		// Offset rear:   136, 0
		var brokenrear = new CarPart();
		brokenrear.partID = 3;
		brokenrear.ReInit();
		brokenrear.posX = this.posX + 136*3;
		brokenrear.posY = this.posY+50;
		brokenrear.posZ = 0;
		level.entities.AddEntity(brokenrear);
	}
};

// All the animation frames associated with the Car.
GlobalResourceLoader.AddImageResource("sheet_Car","images/props/sheet_Car.txt");
GlobalResourceLoader.AddImageResource("sheet_Debris","images/props/sheet_Debris.txt");

Car.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;						// This animation loops
	idleAnim.inheritFacing = 0;					// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddFrame("props/car");		// All the frames and their timing info
	idleAnim.SetDurationInSeconds(1.0);
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	this.animationModel.AddState("idle",idleState);
	
	this.mirrorAnim = new Animation(this,"debris/car_mirror");
	this.debris = [];
	this.debris.push(new Animation(this,"debris/car_debris1"));
	this.debris.push(new Animation(this,"debris/car_debris2"));
	this.debris.push(new Animation(this,"debris/car_debris3"));
	this.debris.push(new Animation(this,"debris/car_debris4"));
	this.debris.push(new Animation(this,"debris/car_debris5"));
	this.debris.push(new Animation(this,"debris/car_debris6"));

};

Car.prototype.NotifyDamageDealt = function(damageDealt, corruptionDealt)
{
	EntityNotifyDamageDealt.call(this, damageDealt, corruptionDealt);
	if (damageDealt > 0)
		this.generateDebris();
	//this.health = 0;
};

Car.prototype.Hit = function(attack, isCaptive)
{
	if (this.mirrorOn)
	{
		if (attack.damageDealt > 0 || attack.corruptionDealt === 0) this.firstHitSFX.Play();
	}
	else
	{
		if (attack.damageDealt > 0 || attack.corruptionDealt === 0) this.hitSFX.Play();
	}
	EntityHit.call(this, attack, isCaptive);
	if (attack.damageDealt > 0)
		this.generateDebris();
}

// Boilerplate Entity Code
Car.prototype.Init = EntityInit;
Car.prototype.ChangeState = EntityChangeState;
Car.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
Car.prototype.Speed = EntitySpeed;
Car.prototype.Kill = EntityKill;
Car.prototype.ReleaseOrbs = EntityReleaseOrbs;
Car.prototype.Die = EntityDie;
Car.prototype.CancelAttack = EntityCancelAttack;
Car.prototype.Respawn = EntityRespawn;		
Car.prototype.GetGroundFriction = EntityGetGroundFriction;
// Car.prototype.DrawSprite = EntityDrawSprite;		// Overridden
Car.prototype.Draw = EntityDraw;
Car.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//Car.prototype.UpdateState = EntityUpdateState;	// Overridden
Car.prototype.Update = EntityUpdate;
Car.prototype.Push = EntityPush;
//Car.prototype.Hit = EntityHit;
Car.prototype.Capture = EntityCapture;
Car.prototype.Release = EntityRelease;
Car.prototype.ChangeAlliance = EntityChangeAlliance;
//Car.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
Car.prototype.CollisionDetection = EntityCollisionDetection;
Car.prototype.WatchSex = EntityWatchSex;
Car.prototype.DoneWatchingSex = EntityDoneWatchingSex;


// CarPart.js
//
// CarPart : no additional methods added
// isa Entity : Draw(), Update(), enabled
//
function CarPart()
{
	EntityInit.call(this);

	this.displayName = "Broken Car Piece";
	//this.spriteCenterX = 200;
	//this.spriteCenterY = 110;
	this.partID = 1; // 1 = front, 2 = mid, 3 = rear
	
	this.hitSFX =   new RandomSoundCollection("car_hit{0}",3);
	
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
	this.weight = 800;
	
	// Collision
	this.zHeight = this.scale * 100;
	this.collisionRadius = this.scale * 10;
	
	this.grabAdjustX = 50;
	this.grabAdjustY = 0;
	this.grabAdjustZ = 200;
	
	this.ReInit();
};

CarPart.prototype.editorProperties = ['partID'];

CarPart.prototype.ReInit = function()
{
	this.hitRect = new BoundingRect();
	if (this.partID === 3)
	{
		this.hitRect.fitToPoint({x:-this.scale * 40,y:-this.scale * 21});
		this.hitRect.expandToFit({x:this.scale * 40,y:this.scale * 21});
		this.grabAdjustX = 50;
		this.grabAdjustY = 0;
		this.grabAdjustZ = 200;
		this.displayName = "Broken Bumper";
	}
	else if (this.partID === 2)
	{
		this.hitRect.fitToPoint({x:-this.scale * 100,y:-this.scale * 50});
		this.hitRect.expandToFit({x:this.scale * 100,y:this.scale * 50});
		this.grabAdjustX = 200;
		this.grabAdjustY = 0;
		this.grabAdjustZ = 200;
		this.displayName = "Crushed Cabin";
	}
	else if (this.partID === 1)
	{
		this.hitRect.fitToPoint({x:-this.scale * 40,y:-this.scale * 21});
		this.hitRect.expandToFit({x:this.scale * 40,y:this.scale * 21});
		this.grabAdjustX = 50;
		this.grabAdjustY = 0;
		this.grabAdjustZ = 200;
		this.displayName = "Trashed Trunk";
	}

	this.animationSetup();
};

CarPart.prototype.GetMoveMaxVelocity = function()
{		
	return 0;
};

CarPart.prototype.GetStaminaRecovery = function()
{
	return 1; // Stamina fully recovers in 5 seconds when not dazed
};

CarPart.prototype.DrawSprite = function()
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

CarPart.prototype.UpdateState = function()
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

CarPart.prototype.animationSetup = function()
{
	var part = "";
	
	if (this.partID === 1)
	{
		part = "props/car_front_damaged";
	}
	else if (this.partID === 2)
	{
		part = "props/car_mid_damaged";
	}
	else if (this.partID === 3)
	{
		part = "props/car_rear_damaged";
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

CarPart.prototype.NotifyDamageDealt = function(damageDealt, corruptionDealt)
{
	EntityNotifyDamageDealt.call(this, damageDealt, corruptionDealt);
	//this.health = 0;
};

CarPart.prototype.Hit = function(attack, isCaptive)
{
	if (attack.damageDealt > 0 || attack.corruptionDealt === 0) this.hitSFX.Play();
	EntityHit.call(this, attack, isCaptive);
}

// Boilerplate Entity Code
CarPart.prototype.Init = EntityInit;
CarPart.prototype.ChangeState = EntityChangeState;
CarPart.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
CarPart.prototype.Speed = EntitySpeed;
CarPart.prototype.Kill = EntityKill;
CarPart.prototype.Die = EntityDie;
CarPart.prototype.CancelAttack = EntityCancelAttack;
CarPart.prototype.Respawn = EntityRespawn;		
CarPart.prototype.GetGroundFriction = EntityGetGroundFriction;
// CarPart.prototype.DrawSprite = EntityDrawSprite;		// Overridden
CarPart.prototype.Draw = EntityDraw;
CarPart.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//CarPart.prototype.UpdateState = EntityUpdateState;	// Overridden
CarPart.prototype.Update = EntityUpdate;
CarPart.prototype.Push = EntityPush;
//CarPart.prototype.Hit = EntityHit;
CarPart.prototype.Capture = EntityCapture;
CarPart.prototype.Release = EntityRelease;
CarPart.prototype.ChangeAlliance = EntityChangeAlliance;
//CarPart.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
CarPart.prototype.CollisionDetection = EntityCollisionDetection;
CarPart.prototype.WatchSex = EntityWatchSex;
CarPart.prototype.DoneWatchingSex = EntityDoneWatchingSex;