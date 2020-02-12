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

// Load up the resources used by destructable items
GlobalResourceLoader.AddImageResource("sheet_Props","images/props/sheet_Props.txt");
GlobalResourceLoader.AddImageResource("sheet_Debris","images/props/sheet_Debris.txt");

GlobalResourceLoader.AddAudioResource("parkbin_destroyed","sound/environment/generictrashcan_destroyed.mp3");
GlobalResourceLoader.AddAudioResource("parkbin_hit1","sound/environment/generictrashcan_hit1.mp3");
GlobalResourceLoader.AddAudioResource("parkbin_hit2","sound/environment/generictrashcan_hit2.mp3");
GlobalResourceLoader.AddAudioResource("parkbin_hit3","sound/environment/generictrashcan_hit3.mp3");
GlobalResourceLoader.AddAudioResource("glassdoor_destroyed","sound/environment/glassdoor_destroyed.mp3");
GlobalResourceLoader.AddAudioResource("mailbox_destroyed","sound/environment/mailbox_destroyed.mp3");
GlobalResourceLoader.AddAudioResource("mailbox_hit1","sound/environment/mailbox_hit1.mp3");
GlobalResourceLoader.AddAudioResource("mailbox_hit2","sound/environment/mailbox_hit2.mp3");
GlobalResourceLoader.AddAudioResource("trashcan_destroyed","sound/environment/generictrashcan_destroyed.mp3");
GlobalResourceLoader.AddAudioResource("trashcan_hit1","sound/environment/metaltrashcan_hit1.mp3");
GlobalResourceLoader.AddAudioResource("trashcan_hit2","sound/environment/metaltrashcan_hit2.mp3");
GlobalResourceLoader.AddAudioResource("trashcan_hit3","sound/environment/metaltrashcan_hit3.mp3");
GlobalResourceLoader.AddAudioResource("newspaperbox_destroyed","sound/environment/newsbox_destroyed.mp3");
GlobalResourceLoader.AddAudioResource("newspaperbox_hit1","sound/environment/newsbox_hit1.mp3");
GlobalResourceLoader.AddAudioResource("newspaperbox_hit2","sound/environment/newsbox_hit2.mp3");

function DestructableItem()
{
	EntityInit.call(this);

	this.displayName = "Trashcan";
	//this.spriteCenterX = 33;
	//this.spriteCenterY = 95;
	
	// Parts are spawned on breaking and only one of each is spawned
	this.parts = [];
	
	// Debris is spawned on each hit, up to 15 pieces
	this.debris = [];
	
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
	this.passthroughOnBreak = false;
	
	this.showDamageMeter = false;
	
	this.sizeBeforeBreakX = 50;
	this.sizeBeforeBreakY = 20;
	this.sizeAfterBreakX = 50;
	this.sizeAfterBreakY = 20;
	
	this.canJumpOver = true;
	
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
	this.hitRect.fitToPoint({x:-this.scale * this.sizeBeforeBreakX / 2,y:-this.scale * this.sizeBeforeBreakY / 2});
	this.hitRect.expandToFit({x:this.scale * this.sizeBeforeBreakX / 2,y:this.scale * this.sizeBeforeBreakY / 2});

	//this.ReInit()
	this.animationSetup();
};

DestructableItem.prototype.editorProperties = ['alliance','health','displayName', 'canJumpOver', 'weight', 'passthroughOnBreak','grabbable','zHeight','heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld', 'lifeOrbsHeld', 'broken', 'sizeBeforeBreakX', 'sizeBeforeBreakY','sizeAfterBreakX', 'sizeAfterBreakY'];

DestructableItem.prototype.ReInit = function()
{
	this.assetnameDebris = this.displayName.replace(/ /g,'').toLowerCase();
	this.assetname = this.displayName.replace(/ /g,'').toLowerCase();
	
	if (this.assetnameDebris === "door1" || this.assetnameDebris === "door2")
		this.assetnameDebris = "door";
	else if (this.assetnameDebris === "parkbin")
		this.assetnameDebris = "trashcan";
	// Hitbox
	this.hitRect = new BoundingRect();
	if (!this.broken)
	{
		this.hitRect.fitToPoint({x:-this.scale * this.sizeBeforeBreakX / 2,y:-this.scale * this.sizeBeforeBreakY / 2});
		this.hitRect.expandToFit({x:this.scale * this.sizeBeforeBreakX / 2,y:this.scale * this.sizeBeforeBreakY / 2});
	}
	else
	{
		this.hitRect.fitToPoint({x:-this.scale * this.sizeAfterBreakX / 2,y:-this.scale * this.sizeAfterBreakY / 2});
		this.hitRect.expandToFit({x:this.scale * this.sizeAfterBreakX / 2,y: this.scale * this.sizeAfterBreakY / 2});
	}
	
	this.hitSFX =   new RandomSoundCollection(this.assetname + "_hit{0}",2);
	this.breakSFX =   GlobalResourceLoader.GetSound(this.assetname + "_destroyed");
	
	this.animationSetup();
	if (this.broken)
		this.animationModel.ApplyPrefix("broken");
};

DestructableItem.prototype.GetMoveMaxVelocity = function()
{		
	if (this.state === States.Jump || this.state === States.Fall || this.state === States.FallHelpless)
		return 3.0;
	else
		return 0;
};

DestructableItem.prototype.GetStaminaRecovery = function()
{
	return 1; // Stamina fully recovers in 5 seconds when not dazed
};

DestructableItem.prototype.DrawSprite = function()
{
	// Draw shadow
	if (!this.passthroughOnBreak)
	{
		ctx.globalAlpha = 0.4 * this.alpha;
		ctx.fillStyle = "#000000";
		var shadowScale = 500 / (this.posZ + 500);
		drawEllipse(0,0,shadowScale*this.hitRect.width(),shadowScale*this.hitRect.height());
	}
	ctx.globalAlpha = this.alpha;
	this.animationModel.Draw();
	ctx.globalAlpha = 1.0;
};

DestructableItem.prototype.generateDebris = function(broke)
{
	if (broke)
	{
		// Spawn the parts
		for (var i=0; i < this.parts.length; i++)
		{
			var animation = this.parts[i];
			var debris = new DroppedItem(animation, this, 0, (Math.random()-0.5)*30, 290+(Math.random()-0.5)*30);
			debris.velX = (-5-10*Math.random())*this.facing;
			debris.velY = 5*(Math.random()-0.5);
			debris.velZ = 20+20*Math.random();
			debris.elasticity = elasticity;
			level.entities.AddEffect(debris);
		}
	}
	
	if (this.debris.length > 0)
	{
		var debrisPieces = 0;
	
		if (this.health > 0)
			debrisPieces = 4;
		else if (broke)
			debrisPieces = 10;
			
		for (var i=0; i < debrisPieces; i++)
		{
			var elasticity = 0.5*Math.random();
			var animation = getRandomItemFromArray(this.debris);
			var debris = new DroppedItem(animation, this, 300, (Math.random()-0.5)*30, 290+(Math.random()-0.5)*30);
			debris.velX = (-5-10*Math.random())*this.facing;
			debris.velY = 5*(Math.random()-0.5);
			debris.velZ = 20+20*Math.random();
			debris.elasticity = elasticity;
			level.entities.AddEffect(debris);
		}
	}
};

DestructableItem.prototype.UpdateState = function()
{
	// Do what needs to be done in each state and change the state if needed
	if (this.state === States.Walk)
	{
		this.ProcessDirectionalInput();
		this.animationModel.ChangeState("idle");
		
		// Change to jump state
		if (this.controller.jumpActivate())
		{
			this.ChangeState(States.Jump);
		}
		
		if (this.controller.punchActivate())
		{
			this.health = 0;
			this.generateDebris(false);
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
			this.ChangeState(States.Walk);
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
		this.breakSFX.Play(0.3);
		if (this.passthroughOnBreak)
			this.isPassThrough = true;
		this.broken = true;
		this.animationModel.ApplyPrefix("broken");
		this.generateDebris(true);
		this.ReleaseOrbs();
	}
};

DestructableItem.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this, "props/" + this.assetname );
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	this.animationModel.AddState("idle",idleState);
	
	this.parts = [];
	var i = 1;
	while (true)
	{
		var imagename = "props/" + this.assetname + "_part" + i.toString();
		if (GlobalResourceLoader.IsSpriteLoaded(imagename))
			this.parts.push(new Animation(this,imagename));
		else
			break;
		i++;
	}
	
	this.debris = [];
	i = 1;
	while (true)
	{
		var imagename = "debris/" + this.assetnameDebris + "_debris" + i.toString();
		if (GlobalResourceLoader.IsSpriteLoaded(imagename))
			this.debris.push(new Animation(this,imagename));
		else
			break;
		i++;
	}
};

DestructableItem.prototype.NotifyDamageDealt = function(damageDealt, corruptionDealt)
{
	EntityNotifyDamageDealt.call(this, damageDealt, corruptionDealt);
	this.health = 0;
};

DestructableItem.prototype.Hit = function(attack, isCaptive)
{
	EntityHit.call(this, attack, isCaptive);
	if (attack.damageDealt > 0 || attack.corruptionDealt === 0) this.hitSFX.Play(0.3);
	if (attack.damageDealt > 0)	
	{
		this.generateDebris(false);
		this.health = 0;
	}
}

// Boilerplate Entity Code
DestructableItem.prototype.Init = EntityInit;
DestructableItem.prototype.ChangeState = EntityChangeState;
DestructableItem.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
DestructableItem.prototype.Speed = EntitySpeed;
DestructableItem.prototype.Kill = EntityKill;
DestructableItem.prototype.ReleaseOrbs = EntityReleaseOrbs;
DestructableItem.prototype.Die = EntityDie;
DestructableItem.prototype.CancelAttack = EntityCancelAttack;
DestructableItem.prototype.Respawn = EntityRespawn;		
DestructableItem.prototype.GetGroundFriction = EntityGetGroundFriction;
// DestructableItem.prototype.DrawSprite = EntityDrawSprite;		// Overridden
DestructableItem.prototype.Draw = EntityDraw;
DestructableItem.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//DestructableItem.prototype.UpdateState = EntityUpdateState;	// Overridden
DestructableItem.prototype.Update = EntityUpdate;
DestructableItem.prototype.Push = EntityPush;
//DestructableItem.prototype.Hit = EntityHit;
DestructableItem.prototype.Capture = EntityCapture;
DestructableItem.prototype.Release = EntityRelease;
DestructableItem.prototype.ChangeAlliance = EntityChangeAlliance;
//DestructableItem.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
DestructableItem.prototype.CollisionDetection = EntityCollisionDetection;
DestructableItem.prototype.WatchSex = EntityWatchSex;
DestructableItem.prototype.DoneWatchingSex = EntityDoneWatchingSex;