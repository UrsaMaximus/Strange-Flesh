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

function OrcSpike(orcHead)
{
	EntityInit.call(this);
	this.displayName = "Colossal Orc Slave";
	
	// Combat flags
	this.alliance = 2;
	this.grabbable = false;
	this.fuckable = false;
	this.kissable = false;
	this.throwable = false;
	this.corruptable = false;
	this.knockoutable = false;
	this.stunnable = false;
	
	this.delayFrames = Math.round(Math.random() * 36) + 60;
	
	this.disableSpawnOnScroll = true;
	
	if(typeof(orcHead)=='undefined') 
		orcHead = null;
	this.orcHead = orcHead;
	
	// Stats
	this.weight = Number.MAX_VALUE;
	
	// Collision
	this.zHeight = this.scale * 40;
	this.collisionRadius = this.scale * 8;
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	
	this.spikeAttack = new Attack(this);
	this.spikeAttack.attackbox.SetBounds(-20,-20,20,20);
	this.spikeAttack.warmupframes = 1;
	this.spikeAttack.attackFrames = 1;
	this.spikeAttack.cooldownframes = 30;
	this.spikeAttack.zHeight = 0;
	this.spikeAttack.zSize = 120;
	this.spikeAttack.damageDealt = 20;
	this.spikeAttack.staminaDrained = 1.0;
	this.spikeAttack.visualContactZ = 30 * this.scale;
	this.spikeAttack.hitStunDealt = 1.0;
	this.spikeAttack.autoReactivate = true;
	this.spikeAttack.remainActiveUntil = 1; // Linger until something gets hit
	
	this.ChangeState(States.Spawning);
	
	this.animationSetup();
	if (!isEditor)
		this.animationModel.ChangeState("spawn");
};

OrcSpike.prototype.editorProperties = ['displayName','alliance','health','orbsOnDeath', 'orbsAfterSex', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld','popUpState','posSideX','negSideX','currentSide'];
OrcSpike.prototype.runtimeProperties = ['state','stateFrames'];

OrcSpike.prototype.Respawn = function(pos)
{
 	EntityRespawn.call(this, pos);
 	this.ChangeState(States.Spawning);
};

OrcSpike.prototype.GetMoveMaxVelocity = function()
{		
	return 0;
};

OrcSpike.prototype.GetStaminaRecovery = function()
{
	return 1.0;
};

OrcSpike.prototype.UpdateState = function()
{	
	this.posZ = 0;
	
	if (this.state === States.Fall)
	{
		this.ChangeState(States.Walk);
	}
	else if (this.state === States.Spawning)
	{
		if (this.stateFrames < this.delayFrames)
		{
			this.animationModel.ChangeState("openportal");
		}
		else
		{
			this.animationModel.ChangeState("rise");
		
			// Set up the player-player collision based on popup state
			var popupState = this.animationModel.animations["rise"].mainAnimation.position;
			this.hitRect.Resize(popupState*43,popupState*43);
		
			if (this.animationModel.AnimationIsComplete("rise"))
				this.ChangeState(States.Walk);
		}
	}
	else if (this.state === States.Walk)
	{
		this.animationModel.ChangeState("idle");
		
		if (this.stateFrames === 1)
			this.spikeAttack.Attack();
			
		if (this.animationModel.WasLastFrameActivation(0))
		{
			if (this.orcHead !== null)
			{
				if (this.orcHead.popUpState < this.orcHead.spikeSpawnPopupValue || IsDeadOrDying(this.orcHead.state))
					this.ChangeState(States.Dying);
			}
		}
	}
	else if (this.state === States.Dying)
	{
		// Lower the spike
		this.animationModel.ChangeState("fall");
		
		var popupState = 1.0 - this.animationModel.animations["fall"].mainAnimation.position;
		this.hitRect.Resize(popupState*43,popupState*43);
		
		// Cancel the spike attack
		if (this.stateFrames === 10)
			this.spikeAttack.Reset();
		
		if (this.animationModel.AnimationIsComplete("fall"))
			this.ChangeState(States.Dead);
	}
	
};

// All the animation frames associated with the OrcSpike.
GlobalResourceLoader.AddImageResource("sheet_OrcSpike","images/effect/sheet_OrcSpike.txt");

OrcSpike.prototype.animationSetup = function()
{
	// Random start delay
	var framerate = Math.round(20 + 5 * Math.random());
	
	// Define the spawn animation
	var spawnAnim = new Animation(this);
	spawnAnim.AddSequentialFrames("OrcSpike/rise{0}",1,3);
	spawnAnim.SetDurationByFramerate(framerate);
	spawnAnim.repeat = 0;
	spawnAnim.inheritFacing = 1;
	// Add the spawn animation and all its transitions to the spawn animation state
	var spawnState = new AnimationState();
	spawnState.SetMainAnimation(spawnAnim);
	// Add all the animation states to the animations collection
	this.animationModel.AddState("openportal",spawnState);
	
	// Define the spawn animation
	var spawnAnim = new Animation(this);
	spawnAnim.AddSequentialFrames("OrcSpike/rise{0}",4,7);
	spawnAnim.SetDurationByFramerate(framerate);
	spawnAnim.repeat = 0;
	spawnAnim.inheritFacing = 1;
	// Add the spawn animation and all its transitions to the spawn animation state
	var spawnState = new AnimationState();
	spawnState.SetMainAnimation(spawnAnim);
	// Add all the animation states to the animations collection
	this.animationModel.AddState("rise",spawnState);
	
	var anim = new Animation(this);
	anim.AddSequentialFrames("OrcSpike/rise{0}",7,5);
	anim.AddSequentialFrames("OrcSpike/rise{0}",5,7);
	anim.SetDurationByFramerate(framerate/2 + Math.random()*5);
	anim.repeat = 1;
	anim.inheritFacing = 1;
	// Add the spawn animation and all its transitions to the spawn animation state
	var animState = new AnimationState();
	animState.SetMainAnimation(anim);
	// Add all the animation states to the animations collection
	this.animationModel.AddState("idle",animState);
	
	var dyingAnim = new Animation(this);
	dyingAnim.AddSequentialFrames("OrcSpike/rise{0}",7,1);
	dyingAnim.SetDurationByFramerate(framerate);
	dyingAnim.inheritFacing = 1;
	dyingAnim.repeat = 0;
	// Add the dying animation and all its transitions to the dying animation state
	var dyingState = new AnimationState();
	dyingState.SetMainAnimation(dyingAnim);
	// Add all the animation states to the animations collection
	this.animationModel.AddState("fall",dyingState);
};

OrcSpike.prototype.ChangeAlliance = function(newAlliance)
{
};

OrcSpike.prototype.Capture = function(captor)
{	
	return null;
};

OrcSpike.prototype.Hit = function(attack, isCaptive)
{
};

// Boilerplate Entity Code
OrcSpike.prototype.Init = EntityInit;
OrcSpike.prototype.ChangeState = EntityChangeState;
OrcSpike.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
OrcSpike.prototype.Speed = EntitySpeed;
OrcSpike.prototype.Kill = EntityKill;
OrcSpike.prototype.ReleaseOrbs = EntityReleaseOrbs;
OrcSpike.prototype.Die = EntityDie;
OrcSpike.prototype.CancelAttack = EntityCancelAttack;
//OrcSpike.prototype.Respawn = EntityRespawn;		
OrcSpike.prototype.GetGroundFriction = EntityGetGroundFriction;
OrcSpike.prototype.DrawSprite = EntityDrawSprite;		// Overridden
OrcSpike.prototype.Draw = EntityDraw;
OrcSpike.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//OrcSpike.prototype.UpdateState = EntityUpdateState;	// Overridden
OrcSpike.prototype.Update = EntityUpdate;
OrcSpike.prototype.Push = EntityPush;
//OrcSpike.prototype.Hit = EntityHit;
//OrcSpike.prototype.Capture = EntityCapture;
OrcSpike.prototype.Release = EntityRelease;
//OrcSpike.prototype.ChangeAlliance = EntityChangeAlliance;
OrcSpike.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
OrcSpike.prototype.CollisionDetection = EntityCollisionDetection;
OrcSpike.prototype.WatchSex = EntityWatchSex;
OrcSpike.prototype.DoneWatchingSex = EntityDoneWatchingSex;

