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

GlobalResourceLoader.AddAudioResource("glassdoor_destroyed","sound/environment/glassdoor_destroyed.mp3");


function GlassDoor()
{
	EntityInit.call(this);

	this.displayName = "Glass Door";
	this.side = 1;
	this.type = 0;
	
	this.breakSFX =   GlobalResourceLoader.GetSound("glassdoor_destroyed");
	
	
	// Parts are spawned on breaking and only one of each is spawned
	this.parts = [];
	
	// Debris is spawned on each hit, up to 15 pieces
	this.debris = [];
	
	// Combat flags
	this.alliance = 2;
	this.grabbable = false;
	this.fuckable = false;
	this.kissable = false;
	this.throwable = false;
	this.corruptable = false;
	this.knockoutable = false;
	this.stunnable = false;
	
	// Stats
	this.health = 1;
	this.maxHealth = 1;
	this.broken = false;
	this.assetname = "door" + this.side.toString();
	this.assetnameDebris = "door";
	
	this.sizeBeforeBreakX = 50;
	this.sizeBeforeBreakY = 20;
	this.sizeAfterBreakX = 50;
	this.sizeAfterBreakY = 20;
	
	this.canJumpOver = false;
	this.weight = Number.MAX_VALUE;
	this.isPassThrough = true;
	this.zHeight = 500;
	
	// Collision
	this.collisionRadius = 1;
	
	
	this.collisionGuides = [];
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * this.sizeBeforeBreakX / 2,y:-this.scale * this.sizeBeforeBreakY / 2});
	this.hitRect.expandToFit({x:this.scale * this.sizeBeforeBreakX / 2,y:this.scale * this.sizeBeforeBreakY / 2});

	this.animationSetup();
};

GlassDoor.prototype.Freeze = function(targetLevel)
{
	if(typeof(targetLevel)==='undefined')
		targetLevel = level;
	
	if (!this.broken)
	{
		targetLevel.collisionMask.RemoveLines(this.collisionGuides);
		this.collisionGuides = [];
	}
}

GlassDoor.prototype.Thaw = function(targetLevel)
{
	if(typeof(targetLevel)==='undefined')
		targetLevel = level;
		
	var skirmishActive = targetLevel.IsSkirmishActive();
	
	if (!this.broken && !skirmishActive)
	{
		if (this.type === 0)
		{
			this.collisionGuides = targetLevel.collisionMask.AddPolyLine(
					-18 * this.scale + this.posX - 80, -18 * this.scale + this.posY, 
					28 * this.scale + this.posX - 80, 28 * this.scale + this.posY, 
					28 * this.scale + this.posX + 80, 28 * this.scale + this.posY,
					-18 * this.scale + this.posX + 80, -18 * this.scale + this.posY, 
					-18 * this.scale + this.posX - 80, -18 * this.scale + this.posY		);
		}
		else
		{
					this.collisionGuides = targetLevel.collisionMask.AddPolyLine(
					-1 * this.scale + this.posX - 80, -18 * this.scale + this.posY, 
					2 * this.scale + this.posX -  80, 28 * this.scale + this.posY, 
					2 * this.scale + this.posX +  80, 28 * this.scale + this.posY,
					-1 * this.scale + this.posX + 80, -18 * this.scale + this.posY, 
					-1 * this.scale + this.posX - 80, -18 * this.scale + this.posY		);
		}
		
		for (var i=0; i < this.collisionGuides.length; i++)
		{	
			this.collisionGuides[i].playerOnly;
		}
	}
}

GlassDoor.prototype.editorProperties = ['alliance','health','displayName','heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld', 'broken', 'side', 'type'];

GlassDoor.prototype.ReInit = function(targetLevel)
{		
	if(typeof(targetLevel)==='undefined')
		targetLevel = level;
	this.Freeze(targetLevel);
	this.Thaw(targetLevel);
	this.animationSetup();
	if (this.broken)
		this.animationModel.ApplyPrefix("broken");
		
	if (this.type === 0)
	{
		this.sizeBeforeBreakX = 50;
		this.sizeBeforeBreakY = 20;
	}
	else
	{
		this.sizeBeforeBreakX = 50;
		this.sizeBeforeBreakY = 75;
	}
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * this.sizeBeforeBreakX / 2,y:-this.scale * this.sizeBeforeBreakY / 2});
	this.hitRect.expandToFit({x:this.scale * this.sizeBeforeBreakX / 2,y:this.scale * this.sizeBeforeBreakY / 2});
};

GlassDoor.prototype.GetMoveMaxVelocity = function()
{		
	return 0;
};

GlassDoor.prototype.GetStaminaRecovery = function()
{
	return 1; // Stamina fully recovers in 5 seconds when not dazed
};

GlassDoor.prototype.DrawSprite = function()
{
	ctx.globalAlpha = this.alpha;
	this.animationModel.Draw();
	ctx.globalAlpha = 1.0;
};

GlassDoor.prototype.generateDebris = function(broke)
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
	
	var debrisPieces = 0;
	
	if (this.health > 0)
		debrisPieces = 4;
	else if (broke)
		debrisPieces = 10 + this.type * 10;

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
};

GlassDoor.prototype.UpdateState = function()
{
	// This is a hacky way to update the collision map
	this.Freeze();
	this.Thaw();
	
	// Another beautiful hack to get the draw order right
	if (this.broken && this.side === 1)
		this.orderBonus = 500;
	else if (this.broken && this.side === 2)
		this.orderBonus = -500;
	else if (player != null && player.posX < (this.posX + (player.posY-this.posY)))
		this.orderBonus = -500;
	else
		this.orderBonus = 500;
	
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
		this.breakSFX.Play(0.5);
		level.collisionMask.RemoveLines(this.collisionGuides);
		this.collisionGuides = [];
		this.broken = true;
		this.animationModel.ApplyPrefix("broken");
		this.generateDebris(true);
		this.ReleaseOrbs();
	}
};

GlassDoor.prototype.animationSetup = function()
{
	if (this.type === 0)
		this.assetname = "door" + this.side.toString();
	else
		this.assetname = "skylightdoor";
		
	this.assetnameDebris = "door";
	
	// Define the idle animation
	var idleAnim = new Animation(this, "props/" + this.assetname );
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	this.animationModel.AddState("idle",idleState);
		

	
	this.parts = [];
			
	if (this.type === 0)
	{
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

GlassDoor.prototype.NotifyDamageDealt = function(damageDealt, corruptionDealt)
{
	EntityNotifyDamageDealt.call(this, damageDealt, corruptionDealt);
	this.health = 0;
};

GlassDoor.prototype.Hit = function(attack, isCaptive)
{
	if (level && level.IsSkirmishActive())
		return;
	EntityHit.call(this, attack, isCaptive);
	if (attack.damageDealt > 0)	
		this.generateDebris(false);
}

// Boilerplate Entity Code
GlassDoor.prototype.Init = EntityInit;
GlassDoor.prototype.ChangeState = EntityChangeState;
GlassDoor.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
GlassDoor.prototype.Speed = EntitySpeed;
GlassDoor.prototype.Kill = EntityKill;
GlassDoor.prototype.ReleaseOrbs = EntityReleaseOrbs;
GlassDoor.prototype.Die = EntityDie;
GlassDoor.prototype.CancelAttack = EntityCancelAttack;
GlassDoor.prototype.Respawn = EntityRespawn;		
GlassDoor.prototype.GetGroundFriction = EntityGetGroundFriction;
// GlassDoor.prototype.DrawSprite = EntityDrawSprite;		// Overridden
GlassDoor.prototype.Draw = EntityDraw;
GlassDoor.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//GlassDoor.prototype.UpdateState = EntityUpdateState;	// Overridden
GlassDoor.prototype.Update = EntityUpdate;
GlassDoor.prototype.Push = EntityPush;
//GlassDoor.prototype.Hit = EntityHit;
GlassDoor.prototype.Capture = EntityCapture;
GlassDoor.prototype.Release = EntityRelease;
GlassDoor.prototype.ChangeAlliance = EntityChangeAlliance;
//GlassDoor.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
GlassDoor.prototype.CollisionDetection = EntityCollisionDetection;
GlassDoor.prototype.WatchSex = EntityWatchSex;
GlassDoor.prototype.DoneWatchingSex = EntityDoneWatchingSex;