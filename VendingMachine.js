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

GlobalResourceLoader.AddAudioResource("vendingmachine_hit1","sound/environment/vendingmachine_hit1.mp3");
GlobalResourceLoader.AddAudioResource("vendingmachine_hit2","sound/environment/vendingmachine_hit2.mp3");
GlobalResourceLoader.AddAudioResource("vendingmachine_destroyed","sound/environment/vendingmachine_destroyed.mp3");

function VendingMachine()
{
	EntityInit.call(this);

	this.displayName = "Vending Machine";
	//this.spriteCenterX = 50;
	//this.spriteCenterY = 148;
	
	this.hitSFX =   new RandomSoundCollection("vendingmachine_hit{0}",2);
	this.breakSFX =   GlobalResourceLoader.GetSound("vendingmachine_destroyed");
	
	
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
	this.weight = 5000;
	this.orbSpawnType = 2;
	this.heathOrbsHeld = 4;
	
	// Collision
	this.zHeight = this.scale * 150;
	this.collisionRadius = this.scale * 10;
	
	this.grabAdjustX = 0;
	this.grabAdjustY = 0;
	this.grabAdjustZ = 50;
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * 100 / 2,y:-this.scale * 20 / 2});
	this.hitRect.expandToFit({x:this.scale * 100 / 2,y:this.scale * 20 / 2});

	this.animationSetup();
};

VendingMachine.prototype.editorProperties = ['health','orbsAfterCorruption', 'heathOrbsHeld', 'corruptionOrbsHeld', 'lifeOrbsHeld', 'dominationOrbsHeld', 'broken'];

VendingMachine.prototype.ReInit = function()
{
	if (this.broken)
		this.animationModel.ApplyPrefix("broken");
};

VendingMachine.prototype.GetMoveMaxVelocity = function()
{		
	if (this.state === States.Jump || this.state === States.Fall || this.state === States.FallHelpless)
		return 3.0;
	else
		return 0;
};

VendingMachine.prototype.GetStaminaRecovery = function()
{
	return 1; // Stamina fully recovers in 5 seconds when not dazed
};

VendingMachine.prototype.DrawSprite = function()
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

VendingMachine.prototype.generateDebris = function()
{
	for (var i=0; i < 15; i++)
	{
		var elasticity = 0.3*Math.random();
		var animation = this.debris1Anim;
		if (Math.random() >= 0.9)
			animation = this.debris2Anim;
		else if (Math.random() >= 0.5)
			animation = this.debris3Anim;
		else if (Math.random() >= 0.1)
			animation = this.debris4Anim;
			
		var debris = new DroppedItem(animation, this, 300, (Math.random()-0.5)*150, Math.random()*450);
		debris.velX = (-5-8*Math.random())*this.facing;
		debris.velY = 5*(Math.random()-0.5);
		debris.velZ = 20+20*Math.random();
		debris.elasticity = elasticity;
		level.entities.AddEffect(debris);
	}
};

VendingMachine.prototype.UpdateState = function()
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
		this.breakSFX.Play();
		this.broken = true;
		this.animationModel.ApplyPrefix("broken");
		this.generateDebris();
		this.ReleaseOrbs();
	}
};

// All the animation frames associated with the VendingMachine.
GlobalResourceLoader.AddImageResource("sheet_Props","images/props/sheet_Props.txt");
GlobalResourceLoader.AddImageResource("sheet_Debris","images/props/sheet_Debris.txt");

VendingMachine.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;						// This animation loops
	idleAnim.inheritFacing = 0;					// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddFrame("props/vendingmachine");		// All the frames and their timing info
	idleAnim.SetDurationInSeconds(1.0);
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	this.animationModel.AddState("idle",idleState);
	
	this.debris1Anim = new Animation(this);
	this.debris1Anim.repeat = 0;
	this.debris1Anim.inheritFacing = 0;
	this.debris1Anim.AddFrame("debris/vending_debris1");
	this.debris1Anim.SetDurationInSeconds(1.0);
	
	this.debris2Anim = new Animation(this);
	this.debris2Anim.repeat = 0;
	this.debris2Anim.inheritFacing = 0;
	this.debris2Anim.AddFrame("debris/vending_debris2");
	this.debris2Anim.SetDurationInSeconds(1.0);
	
	this.debris3Anim = new Animation(this);
	this.debris3Anim.repeat = 0;
	this.debris3Anim.inheritFacing = 0;
	this.debris3Anim.AddFrame("debris/vending_debris3");
	this.debris3Anim.SetDurationInSeconds(1.0);
	
	this.debris4Anim = new Animation(this);
	this.debris4Anim.repeat = 0;
	this.debris4Anim.inheritFacing = 0;
	this.debris4Anim.AddFrame("debris/vending_debris4");
	this.debris4Anim.SetDurationInSeconds(1.0);
};

VendingMachine.prototype.NotifyDamageDealt = function(damageDealt, corruptionDealt)
{
	EntityNotifyDamageDealt.call(this, damageDealt, corruptionDealt);
	//this.health = 0;
};

VendingMachine.prototype.Hit = function(attack, isCaptive)
{
	if (attack.damageDealt > 0 || attack.corruptionDealt === 0) this.hitSFX.Play();
	EntityHit.call(this, attack, isCaptive);
}

// Boilerplate Entity Code
VendingMachine.prototype.Init = EntityInit;
VendingMachine.prototype.ChangeState = EntityChangeState;
VendingMachine.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
VendingMachine.prototype.Speed = EntitySpeed;
VendingMachine.prototype.Kill = EntityKill;
VendingMachine.prototype.ReleaseOrbs = EntityReleaseOrbs;
VendingMachine.prototype.Die = EntityDie;
VendingMachine.prototype.CancelAttack = EntityCancelAttack;
VendingMachine.prototype.Respawn = EntityRespawn;		
VendingMachine.prototype.GetGroundFriction = EntityGetGroundFriction;
// VendingMachine.prototype.DrawSprite = EntityDrawSprite;		// Overridden
VendingMachine.prototype.Draw = EntityDraw;
VendingMachine.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//VendingMachine.prototype.UpdateState = EntityUpdateState;	// Overridden
VendingMachine.prototype.Update = EntityUpdate;
VendingMachine.prototype.Push = EntityPush;
//VendingMachine.prototype.Hit = EntityHit;
VendingMachine.prototype.Capture = EntityCapture;
VendingMachine.prototype.Release = EntityRelease;
VendingMachine.prototype.ChangeAlliance = EntityChangeAlliance;
//VendingMachine.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
VendingMachine.prototype.CollisionDetection = EntityCollisionDetection;
VendingMachine.prototype.WatchSex = EntityWatchSex;
VendingMachine.prototype.DoneWatchingSex = EntityDoneWatchingSex;