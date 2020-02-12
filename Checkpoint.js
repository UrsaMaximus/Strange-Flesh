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

GlobalResourceLoader.AddAudioResource("eyeball_arc1","sound/environment/eyeball_arc1.mp3");
GlobalResourceLoader.AddAudioResource("eyeball_arc2","sound/environment/eyeball_arc2.mp3");
GlobalResourceLoader.AddAudioResource("eyeball_arc3","sound/environment/eyeball_arc3.mp3");
GlobalResourceLoader.AddAudioResource("checkpoint_blink1","sound/environment/eyeball_blink.mp3");
//GlobalResourceLoader.AddAudioResource("checkpoint_blink2","sound/environment/checkpoint_blink2.mp3");
//GlobalResourceLoader.AddAudioResource("checkpoint_blink3","sound/environment/checkpoint_blink3.mp3");
GlobalResourceLoader.AddAudioResource("checkpoint_zap","sound/environment/checkpoint_zap.mp3");

function Checkpoint()
{
	EntityInit.call(this);
	this.displayName = "Nexus Junction";
	
	this.blinkSFX =   new RandomSoundCollection("checkpoint_blink{0}",1);
	this.zapSFX =   new RandomSoundCollection("eyeball_arc{0}",3);
	this.saveSFX =   GlobalResourceLoader.GetSound("checkpoint_zap");
	
	// Combat flags
	this.alliance = 0;
	this.grabbable = false;
	this.fuckable = false;
	this.kissable = false;
	this.throwable = false;
	this.corruptable = false;
	this.knockoutable = false;
	this.stunnable = false;
	this.smoked = false;
	this.saved = false;
	
	// Stats
	this.maxHealth = 1;
	this.health = 1;
	this.weight = Number.MAX_VALUE;
	
	// Collision
	this.zHeight = this.scale * 150;
	this.collisionRadius = 33;
	
	this.lifeState = 0;
	
	this.waitOnTransformTimer = 0;
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();		// 65x16
	this.hitRect.Resize(this.scale * 80, this.scale * 20);
	
	this.animationSetup();
};

Checkpoint.prototype.editorProperties = ['displayName','health','orbsOnDeath', 'orbsAfterSex', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld', "normalMessage", "corruptMessage"];
Checkpoint.prototype.runtimeProperties = ['lifeState','saved'];


Checkpoint.prototype.Respawn = function(pos)
{
 	EntityRespawn.call(this, pos);
 	this.lifeState = 0;
 	this.saved = false;
};


Checkpoint.prototype.GetMoveMaxVelocity = function()
{		
	return 0;
};

Checkpoint.prototype.GetStaminaRecovery = function()
{
	return 1;
};

Checkpoint.prototype.UpdateState = function()
{	
	this.posZ = 0;
	
	if (this.lifeState === 0)	// Idle
	{
		if (this.animationModel.AnimationIsComplete(this.animationModel.state))
		{
			// If the last animation was not idle, then go idle
			if (this.animationModel.state !== "idle")
			{
				this.animationModel.ChangeState("idle");
			}
			else
			{
				var sfxVolume = linearRemap(Math.abs(this.posX - camera.posX),3700,0,0,1.0)
			
				var newState = getRandomItemFromArray(this.idleStates);
				this.animationModel.ChangeState(newState);
				if (sfxVolume > 0)
				{
					if (newState === "blink")
						this.blinkSFX.Play(3.0*sfxVolume);
					if (newState === "elec")
					{
						this.blinkSFX.Play(3.0*sfxVolume, 0.1);
						this.zapSFX.Play(1.0*sfxVolume,0.2);
					}
				}
			}
		}
	}
	else if (this.lifeState === 1)	// Transforming
	{
		this.waitOnTransformTimer += 1;
		
		if (this.waitOnTransformTimer===2 && !this.smoked)
		{
			level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,this.posZ+220,180,280,4.0));
			this.smoked = true;
		}
			
		if (this.waitOnTransformTimer >= 30)
		{
			this.animationModel.ChangeState("corruption");
			if (this.animationModel.AnimationIsComplete(this.animationModel.state))
				this.lifeState = 2;
		}
	}
	else if (this.lifeState === 2)	// Humping
	{
		this.animationModel.ChangeState("corrupt");
	}
};

// All the animation frames associated with the Checkpoint.
GlobalResourceLoader.AddImageResource("sheet_Checkpoint","images/checkpoint/sheet_Checkpoint.txt");

Checkpoint.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.AddFrame("checkpoint/idle");
	idleAnim.SetDurationInSeconds(2.0);
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	this.animationModel.AddState("idle",idleState);
	
	// Electricity animation
	var elecAnim = new Animation(this);
	elecAnim.AddSequentialFrames("checkpoint/elec{0}",1,16);
	elecAnim.SetDurationByFramerate(20);
	var elecState = new AnimationState();
	elecState.SetMainAnimation(elecAnim);
	this.animationModel.AddState("elec",elecState);
	
	// Look right animation
	var lookRightAnim = new Animation(this);
	lookRightAnim.AddFrame("checkpoint/look1");
	lookRightAnim.HoldFrame("checkpoint/look2",28);
	lookRightAnim.AddFrame("checkpoint/look1");
	lookRightAnim.SetDurationInSeconds(3.0);
	var lookRightState = new AnimationState();
	lookRightState.SetMainAnimation(lookRightAnim);
	this.animationModel.AddState("lookRight",lookRightState);
	
	// Look left animation
	var lookLeftAnim = new Animation(this);
	lookLeftAnim.AddFrame("checkpoint/look3");
	lookLeftAnim.HoldFrame("checkpoint/look4",28);
	lookLeftAnim.AddFrame("checkpoint/look3");
	lookLeftAnim.SetDurationInSeconds(3.0);
	var lookLeftState = new AnimationState();
	lookLeftState.SetMainAnimation(lookLeftAnim);
	this.animationModel.AddState("lookLeft",lookLeftState);
	
	// Blink animation
	var blinkAnim = new Animation(this);
	blinkAnim.AddFrame("checkpoint/blink1");
	blinkAnim.AddFrame("checkpoint/blink2");
	blinkAnim.AddFrame("checkpoint/blink3");
	blinkAnim.AddFrame("checkpoint/blink2");
	blinkAnim.AddFrame("checkpoint/blink1");
	blinkAnim.SetDurationInSeconds(0.5);
	var blinkState = new AnimationState();
	blinkState.SetMainAnimation(blinkAnim);
	this.animationModel.AddState("blink",blinkState);
	
	// Corruption animation
	var corruptionAnim = new Animation(this);
	corruptionAnim.AddSequentialFrames("checkpoint/corruption{0}",1,16);
	corruptionAnim.SetDurationInSeconds(1.6);
	var corruptionState = new AnimationState();
	corruptionState.SetMainAnimation(corruptionAnim);
	this.animationModel.AddState("corruption",corruptionState);
	
	// Corrupt animation
	var corruptAnim = new Animation(this);
	corruptAnim.AddSequentialFrames("checkpoint/corrupt{0}",4,15);
	corruptAnim.SetDurationInSeconds(1.1);
	corruptAnim.repeat = 1;
	var corruptState = new AnimationState();
	corruptState.SetMainAnimation(corruptAnim);
	this.animationModel.AddState("corrupt",corruptState);
	
	this.idleStates = ["elec","elec","elec","elec","lookLeft","lookRight","blink","blink","blink","blink"];
};

Checkpoint.prototype.ChangeAlliance = function(newAlliance)
{
};

Checkpoint.prototype.Capture = function(captor)
{	
	return null;
};

Checkpoint.prototype.Hit = function(attack, isCaptive)
{
	if (attack.corruptionDealt >= 1)
	{
		this.Save();
	}
};

Checkpoint.prototype.Save = function()
{
	if (!this.saved)
	{
		this.saveSFX.Play(1.0, 1.0);
		if (!this.smoked)
		{
			level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,this.posZ+220,180,280,4.0));
			this.smoked = true;
		}
		this.lifeState = 1;
		this.saved = true;
		saveGame();
		hud.DisplayMessage("Game Saved!");
	}
};

// Boilerplate Entity Code
Checkpoint.prototype.Init = EntityInit;
Checkpoint.prototype.ChangeState = EntityChangeState;
Checkpoint.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
Checkpoint.prototype.Speed = EntitySpeed;
Checkpoint.prototype.Kill = EntityKill;
Checkpoint.prototype.ReleaseOrbs = EntityReleaseOrbs;
Checkpoint.prototype.Die = EntityDie;
Checkpoint.prototype.CancelAttack = EntityCancelAttack;
//Checkpoint.prototype.Respawn = EntityRespawn;		
Checkpoint.prototype.GetGroundFriction = EntityGetGroundFriction;
Checkpoint.prototype.DrawSprite = EntityDrawSprite;		// Overridden
Checkpoint.prototype.Draw = EntityDraw;
Checkpoint.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//Checkpoint.prototype.UpdateState = EntityUpdateState;	// Overridden
Checkpoint.prototype.Update = EntityUpdate;
Checkpoint.prototype.Push = EntityPush;
//Checkpoint.prototype.Hit = EntityHit;
//Checkpoint.prototype.Capture = EntityCapture;
Checkpoint.prototype.Release = EntityRelease;
//Checkpoint.prototype.ChangeAlliance = EntityChangeAlliance;
Checkpoint.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
Checkpoint.prototype.CollisionDetection = EntityCollisionDetection;
Checkpoint.prototype.WatchSex = EntityWatchSex;
Checkpoint.prototype.DoneWatchingSex = EntityDoneWatchingSex;