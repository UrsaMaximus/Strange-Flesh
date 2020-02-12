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

GlobalResourceLoader.AddAudioResource("ballgag_grabbed","sound/enemies/ballgag_grabbed.mp3");
GlobalResourceLoader.AddAudioResource("GOH_Death","sound/enemies/GOH_Death.mp3");
GlobalResourceLoader.AddAudioResource("GOH_GagExplodes","sound/enemies/GOH_GagExplodes.mp3");
GlobalResourceLoader.AddAudioResource("GOH_GagLaser","sound/enemies/GOH_GagLaser.mp3");
GlobalResourceLoader.AddAudioResource("GOH_GagStolen","sound/enemies/GOH_GagStolen.mp3");
GlobalResourceLoader.AddAudioResource("GOH_Hit1","sound/enemies/GOH_Hit1.mp3");
GlobalResourceLoader.AddAudioResource("GOH_Hit2","sound/enemies/GOH_Hit2.mp3");
GlobalResourceLoader.AddAudioResource("GOH_Hit3","sound/enemies/GOH_Hit3.mp3");
GlobalResourceLoader.AddAudioResource("GOH_RearLaser","sound/enemies/GOH_RearLaser.mp3");
GlobalResourceLoader.AddAudioResource("GOH_SpawnsAppear","sound/enemies/GOH_SpawnsAppear.mp3");
GlobalResourceLoader.AddAudioResource("GOH_SpikesMove","sound/enemies/GOH_SpikesMove.mp3");
GlobalResourceLoader.AddAudioResource("GOH_SpikesSpawn","sound/enemies/GOH_SpikesSpawn.mp3");
GlobalResourceLoader.AddAudioResource("orc_speaker_despawn","sound/enemies/orc_speaker_despawn.mp3");
GlobalResourceLoader.AddAudioResource("orc_speaker_spawn","sound/enemies/orc_speaker_spawn.mp3");

include("SoundProjectile.js");


function OrcSpeaker(master)
{
	EntityInit.call(this);
	this.displayName = "Colossal Orc Slave";
	this.serializable = false;
	
	this.deathSFX = GlobalResourceLoader.GetSound("GOH_Death");
	this.gagExplodeSFX = GlobalResourceLoader.GetSound("GOH_GagExplodes");
	this.gagAttackSFX = GlobalResourceLoader.GetSound("GOH_GagLaser");
	this.gagGrabbedSFX = GlobalResourceLoader.GetSound("ballgag_grabbed");
	this.gagStolenSFX = GlobalResourceLoader.GetSound("GOH_GagStolen");
	this.hitSFX = new RandomSoundCollection("GOH_Hit{0}",3);
	this.offscreenAttackSFX = GlobalResourceLoader.GetSound("GOH_RearLaser");
	this.spikesMoveSFX = new SuspendableSound("GOH_SpikesMove");
	this.spikesSpawnSFX = GlobalResourceLoader.GetSound("GOH_SpikesSpawn");
	this.despawnSFX = GlobalResourceLoader.GetSound("orc_speaker_despawn");
	this.spawnSFX = GlobalResourceLoader.GetSound("orc_speaker_spawn");
	
	
	if (typeof(master) == 'undefined')
		master = null;
	
	this.master = master;
	
	if (master === null)	
		this.ai = new OrcSpeakerTestAI(this);
	else
		this.ai = new OrcSpeakerAI(this);
	
	this.mirrorOn = true;
	
	// Combat flags
	this.alliance = 2;
	this.grabbable = true;
	this.fuckable = false;
	this.kissable = false;
	this.throwable = false;
	this.corruptable = false;
	this.knockoutable = false;
	this.stunnable = false;
	
	this.vibrateHitstunTimer = 0;	// amplitude,scale
	this.earthquakeX = new EarthQuakeNoise(21,0.4);
	this.earthquakeY = new EarthQuakeNoise(21,0.4);
	this.effectOffsetX = 0;
	this.effectOffsetY = 0;
	
	this.projectile = null;
	
	this.disableSpawnOnScroll = true;
	
	this.ballgagState = 0;  // 0 = normal, 1 = choke, 2 = spit
	this.ballgagStolen = false; // If true, don't spawn a ballgag during the spit action
	
	// Stats
	this.maxHealth = 717;
	this.health = 717;
	this.weight = Number.MAX_VALUE;
	
	// Collision
	this.zHeight = this.scale * 250;
	this.collisionRadius = this.scale * 25;
	
	this.grabAdjustX = 0;
	this.grabAdjustY = 0;
	this.grabAdjustZ = 50;
	
	this.isPassThrough = true;
	
	this.popUpState = 0.0;
	this.popUpPerFrame = 1.0 / 40.0; // Take 40 frames to pop up
	
	this.spikeSpawnArmed = true;
	this.spikeSpawnPopupValue = 0.3;
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	
	this.animationSetup();
	if (!isEditor)
		this.animationModel.ChangeState("spawn");
};

OrcSpeaker.prototype.editorProperties = ['displayName','alliance','health','orbsOnDeath', 'orbsAfterSex', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld','popUpState'];
OrcSpeaker.prototype.runtimeProperties = ['state','stateFrames'];

OrcSpeaker.prototype.Respawn = function(pos)
{
 	EntityRespawn.call(this, pos);
 	this.popUpState = 0.0;
};


OrcSpeaker.prototype.GetMoveMaxVelocity = function()
{		
	return 5.5 - (this.popUpState * 5.5);
};

OrcSpeaker.prototype.GetStaminaRecovery = function()
{
	return 1.0;
};

OrcSpeaker.prototype.UpdateState = function()
{	
	this.posZ = 0;
	
	if (this.state === States.Fall)
	{
		this.ChangeState(States.Walk);
	}
	
	if (this.state === States.HitStun)
	{
		if (this.ballgagStolen)
		{
			this.animationModel.ChangeState("stolen");
			
			if (this.animationModel.AnimationIsComplete("stolen"))
					this.ChangeState(States.Walk);
		}
		else if (this.ballgagState === 1)
		{
			this.animationModel.ChangeState("choke");

			if (this.animationModel.AnimationIsComplete("choke"))
				this.ChangeState(States.Walk);
		}
		else if (this.ballgagState === 2)
		{
			this.animationModel.ChangeState("spit");
			
			if (this.stateFrames === 24)
			{
				var ballGagProj = new BallGag(this);
				ballGagProj.ChangeState(States.Thrown);
				ballGagProj.posX = this.posX + 124*3 * this.facing;
				ballGagProj.posY = this.posY;
				ballGagProj.posZ = this.posZ + 81*3;
				ballGagProj.facing = -this.facing;
				ballGagProj.velX = 35 * this.facing;
				ballGagProj.velZ = 10;
				level.entities.AddEntity(ballGagProj);
			}
			
			if (this.animationModel.AnimationIsComplete("spit"))
				this.ChangeState(States.Walk);
		}
	}
	else if (this.state === States.Walk)
	{
		if (this.controller.smoke && this.popUpState === 0)
			this.spawnSFX.Play(1.5, -0.3);
			
		if (!this.controller.smoke && this.popUpState === 1.0)
			this.despawnSFX.Play(1.5, -0.3);
				
		// When the controller is holding smoke, the head pops up
		// When not held, it goes down
		if (this.controller.smoke)
			this.popUpState = crawlValue(this.popUpState, 1.0, this.popUpPerFrame);
		else
			this.popUpState = crawlValue(this.popUpState, 0.0, this.popUpPerFrame);
		
		// Move the character based on controller input
		if (this.popUpState < 0.7)
		{
			this.ProcessDirectionalInput();
		}
		
		if (this.popUpState < this.spikeSpawnPopupValue)
		{
			this.spikesMoveSFX.Stop();
		}
		
		// Set up the player-player collision based on popup state
		this.isPassThrough = (this.popUpState === 0.0);
		this.hitRect.Resize(this.popUpState*600,this.popUpState*150);
		this.collisionRadius = 60.0 * this.popUpState + 15.0;
		
		// If all the way down, reset the ball gag state
		if (this.popUpState === 0.0)
		{
			this.ballgagState = 0;
			this.ballgagStolen = false;
			this.spikeSpawnArmed = true;
		}
		
		if (this.spikeSpawnArmed && this.popUpState >= this.spikeSpawnPopupValue)
		{
			this.spikeSpawnArmed = false;
			this.spikesSpawnSFX.Play(0.8);
			//this.spikesMoveSFX.Play(0.5, 1.0);
			
			for (var x = -1200; x < 400; x += 100)
			{
				for (var y = -300; y < 300; y += 60)
				{
					var offsetX = Math.random() * 50 - 25 + x * this.facing;
					var offsetY = Math.random() * 33 - 17 + y;
					
					if (Math.sqrt(Math.pow(offsetX,2) + Math.pow(offsetY / 0.17, 2)) > 435)
					{
						var spike = new OrcSpike(this);
						spike.posX = this.posX;
						spike.posY = this.posY;
					
						// Place the spike using the collision detection engine
						spike.CollisionDetection(offsetX,offsetY,0,false);
					
						// If the spike didn't hit any walls, spawn it in
						if (Math.abs(spike.posX -  (this.posX + offsetX)) < 1.0 &&
							Math.abs(spike.posY -  (this.posY + offsetY)) < 1.0 )
							{
								level.entities.AddEntity(spike);
							}
					}
				}
			}
			

		}
		
		if (this.popUpState > 0)
		{
			if (this.controller.punchActivate())
			{
				this.projectile = new SoundProjectile(this, -2000, -250, 87*3);
				this.projectile.trailDelay = 90;
				level.entities.AddEffect(this.projectile);
				
				this.projectile = new SoundProjectile(this, -2000, 250, 87*3);
				this.projectile.trailDelay = 90;
				level.entities.AddEffect(this.projectile);
				//this.offscreenAttackSFX.Play(0.5,1.4);
				//this.offscreenAttackSFX.Play(0.5,1.3);
				
			}
		}
		
		// If popped all the way up, process punch events
		if (this.popUpState === 1.0)
		{
			if (this.controller.punchActivate())
			{
				if (this.ballgagState === 0)	// Shoot soundwave
				{
				
					this.projectile = new SoundProjectile(this, 65*3, 0, 87*3);
					level.entities.AddEffect(this.projectile);
					this.gagAttackSFX.Play(0.8);
					
				}
				else if (this.ballgagState === 1)	// Hurt self with swallowed speaker
				{
					// Soundwave attack
					var soundAttack = new Attack(this);
					soundAttack.damageDealt = 86;
					soundAttack.staminaDrained = 1.0;
					this.Hit(soundAttack,false);
				}
				

			}
			
			else if (this.controller.grabActivate())	// Induce swallow
			{
				if (this.ballgagState === 0)
				{
					this.ballgagState = 1;
					this.ChangeState(States.HitStun);
				}
			}
			
			else if (this.controller.jumpActivate())	// Induce spit
			{
				if (this.ballgagState === 0)
				{
					this.ballgagState = 2;
					this.ChangeState(States.HitStun);
				}
			}
			
		}
		
		// Force the animation into the right state (spawning, idle, dying, etc)
		if (this.popUpState < 1.0)
		{
			if (this.ballgagState === 0)
				this.animationModel.ChangeState("spawn");
			else if (this.ballgagState === 1)
				this.animationModel.ChangeState("spawn_choke");
			else if (this.ballgagState === 2)
				this.animationModel.ChangeState("spawn_spit");
			this.animationModel.SetAllPositions(this.animationModel.state, this.popUpState);
		}
		else
		{
			if (this.ballgagState === 0)
			{
				if (this.controller.punch)
					this.animationModel.ChangeState("attack");
				else
					this.animationModel.ChangeState("idle");
			}
			else if (this.ballgagState === 1)
			{
				if (this.controller.punchFramesSinceKeydown < 30)
					this.animationModel.ChangeState("attack_choke");
				else
					this.animationModel.ChangeState("idle_choke");
			}
			else if (this.ballgagState === 2)
				this.animationModel.ChangeState("idle_spit");
		}
		
	}
	
	if (this.health <= 0)
	{
		level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,this.posZ+200,300,400,2.0));
		this.ReleaseOrbs();
		this.Die();
	}
	
};

// All the animation frames associated with the OrcSpeaker.
GlobalResourceLoader.AddImageResource("sheet_OrcSpeaker","images/joe5/sheet_OrcSpeaker.txt");

OrcSpeaker.prototype.animationSetup = function()
{
	// Define the spawn animation
	var spawnAnim = new Animation(this);
	spawnAnim.AddBlankFrame();
	spawnAnim.AddSequentialFrames("orcspeaker/normal{0}",1,13);
	spawnAnim.SetDurationByFramerate(30);
	spawnAnim.repeat = 0;
	spawnAnim.inheritFacing = 1;
	// Add the spawn animation and all its transitions to the spawn animation state
	var spawnState = new AnimationState();
	spawnState.SetMainAnimation(spawnAnim);
	// Add all the animation states to the animations collection
	this.animationModel.AddState("spawn",spawnState);
	
	// Define the spawn animation
	var spawnAnim = new Animation(this);
	spawnAnim.AddBlankFrame();
	spawnAnim.AddSequentialFrames("orcspeaker/normal{0}",1,5);
	spawnAnim.AddSequentialFrames("orcspeaker/choked{0}",6,13);
	spawnAnim.SetDurationByFramerate(30);
	spawnAnim.repeat = 0;
	spawnAnim.inheritFacing = 1;
	// Add the spawn animation and all its transitions to the spawn animation state
	var spawnState = new AnimationState();
	spawnState.SetMainAnimation(spawnAnim);
	// Add all the animation states to the animations collection
	this.animationModel.AddState("spawn_choke",spawnState);
	
	// Define the spawn animation
	var spawnAnim = new Animation(this);
	spawnAnim.AddBlankFrame();
	spawnAnim.AddSequentialFrames("orcspeaker/normal{0}",1,5);
	spawnAnim.AddSequentialFrames("orcspeaker/gagless{0}",6,13);
	spawnAnim.SetDurationByFramerate(30);
	spawnAnim.repeat = 0;
	spawnAnim.inheritFacing = 1;
	// Add the spawn animation and all its transitions to the spawn animation state
	var spawnState = new AnimationState();
	spawnState.SetMainAnimation(spawnAnim);
	// Add all the animation states to the animations collection
	this.animationModel.AddState("spawn_spit",spawnState);
	
	
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.AddFrame("orcspeaker/normal13");
	idleAnim.SetDurationInSeconds(1.0);
	idleAnim.repeat = 1;
	idleAnim.inheritFacing = 1;
	// Add the idle animation and all its transitions to the idle animation state
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	// Add all the animation states to the animations collection
	this.animationModel.AddState("idle",idleState);
	
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.AddFrame("orcspeaker/choked13");
	idleAnim.SetDurationInSeconds(1.0);
	idleAnim.repeat = 1;
	idleAnim.inheritFacing = 1;
	// Add the idle animation and all its transitions to the idle animation state
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	// Add all the animation states to the animations collection
	this.animationModel.AddState("idle_choke",idleState);
	
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.AddFrameAtFramerate("orcspeaker/attack_choke1",10);
	idleAnim.AddFrameAtFramerate("orcspeaker/attack_choke2",20);
	idleAnim.AddFrameAtFramerate("orcspeaker/attack_choke3",20);
	idleAnim.AddFrameAtFramerate("orcspeaker/attack_choke4",20);
	idleAnim.NormalizeAnimationTiming();
	idleAnim.SetLoopByFrame(1);
	idleAnim.repeat = 1;
	idleAnim.inheritFacing = 1;
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	this.animationModel.AddState("attack_choke",idleState);
	
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.AddFrame("orcspeaker/gagless13");
	idleAnim.SetDurationInSeconds(1.0);
	idleAnim.repeat = 1;
	idleAnim.inheritFacing = 1;
	// Add the idle animation and all its transitions to the idle animation state
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	// Add all the animation states to the animations collection
	this.animationModel.AddState("idle_spit",idleState);
	
	// Define the attack animation
	var attackAnim = new Animation(this);
	attackAnim.AddSequentialFrames("orcspeaker/normal{0}",13,14);
	attackAnim.SetDurationByFramerate(30);
	attackAnim.repeat = 1;
	attackAnim.inheritFacing = 1;
	// Add the attack animation and all its transitions to the attack animation state
	var attackState = new AnimationState();
	attackState.SetMainAnimation(attackAnim);
	// Add all the animation states to the animations collection
	this.animationModel.AddState("attack",attackState);
	
	
	
	var anim = new Animation(this);
	anim.AddSequentialFrames("orcspeaker/choke{0}",1,3);
	anim.SetDurationInSeconds(0.6);
	anim.inheritFacing = 1;
	anim.repeat = 0;
	// Add the dying animation and all its transitions to the dying animation state
	var state = new AnimationState();
	state.SetMainAnimation(anim);
	// Add all the animation states to the animations collection
	this.animationModel.AddState("choke",state);
	
	var anim = new Animation(this);
	anim.AddSequentialFrames("orcspeaker/choke{0}",1,2);
	anim.AddFrame("orcspeaker/spit");
	anim.SetDurationInSeconds(0.6);
	anim.inheritFacing = 1;
	anim.repeat = 0;
	// Add the dying animation and all its transitions to the dying animation state
	var state = new AnimationState();
	state.SetMainAnimation(anim);
	// Add all the animation states to the animations collection
	this.animationModel.AddState("spit",state);
	
	var anim = new Animation(this);
	anim.AddFrame("orcspeaker/spit");
	anim.SetDurationInSeconds(0.2);
	anim.inheritFacing = 1;
	anim.repeat = 0;
	// Add the dying animation and all its transitions to the dying animation state
	var state = new AnimationState();
	state.SetMainAnimation(anim);
	// Add all the animation states to the animations collection
	this.animationModel.AddState("stolen",state);
	
	
    this.soundwaveAnim = new Animation(this);
	this.soundwaveAnim.AddFrame("orcspeaker/soundwave");
	this.soundwaveAnim.SetDurationInSeconds(120);
	this.soundwaveAnim.inheritFacing = 1;
};

OrcSpeaker.prototype.ChangeAlliance = function(newAlliance)
{
};

OrcSpeaker.prototype.Capture = function(captor)
{	
	if (this.ballgagState === 0 && signWithoutZero(captor.posX - this.posX) === this.facing)
	{
		this.gagGrabbedSFX.Play(1.0, -0.9);
		var ballGagProj = new BallGag(this);
		level.entities.AddEntity(ballGagProj);
		ballGagProj.Capture(captor);
		ballGagProj.posX = this.posX + 90*3 * this.facing;
		ballGagProj.posY = this.posY;
		ballGagProj.posZ = this.posZ + 50*3;
		ballGagProj.facing = -this.facing;
		this.ballgagState = 2;
		this.ballgagStolen = true;
		this.ChangeState(States.HitStun);
		
		return ballGagProj;
	}
	return null;
};

OrcSpeaker.prototype.Hit = function(attack, isCaptive)
{
	if (this.popUpState === 1.0)
	{
		if (this.ballgagState === 0 && attack.damageDealt > 0 && attack.hitStunDealt > 0)
		{
			if (attack.owner !== null && signWithoutZero(attack.owner.posX - 300 - this.posX) === this.facing && attack.owner.facing !== this.facing)
			{
				this.ballgagState = 1;  // 0 = normal, 1 = choke, 2 = spit
				this.hitSFX.Play(2.0);
			}
			else if (attack.owner !== null && signWithoutZero(attack.owner.posX + 300 - this.posX) === -this.facing && attack.owner.facing === this.facing)
			{
				this.ballgagState = 2;  // 0 = normal, 1 = choke, 2 = spit
				this.gagStolenSFX.Play();
				this.gagGrabbedSFX.Play(1.0, -0.5);
			}
		
			if (this.ballgagState !== 0)
			{
				this.vibrateHitstunTimer = 20;
				this.ChangeState(States.HitStun);
				attack.NotifyDamage(this, 0, 0); // Notify the attack that it connected
			}
		}
		else if (this.ballgagState === 0 && attack.damageDealt === 0 && attack.hitStunDealt > 0)
		{
			attack.NotifyDamage(this, 0, 0); // Notify the attack that it connected
		}
		else if (this.ballgagState === 2 && attack.damageDealt > 0 && attack.hitStunDealt > 0)
		{
			if (attack.positionOwner !== null && attack.positionOwner instanceof BallGag && signWithoutZero(attack.positionOwner.posX - this.posX) === this.facing)
			{
				this.ballgagState = 1;  // 0 = normal, 1 = choke, 2 = spit
				attack.NotifyDamage(this, attack.damageDealt, attack.corruptionDealt); // Notify the attack that it connected
				attack.positionOwner.Die();
				attack.Reset();
			}
		}
	
		// Figure out which sound effect to play
		if (attack.damageDealt > 0)
		{	
			//if (attack.owner !== player)
			{
				enemyinfo.NotifyHit(this); // Notify the enemy health popup
				attack.NotifyDamage(this, attack.damageDealt, attack.corruptionDealt); // Notify the attack that it connected
				if (attack.owner !== player)
				{
					this.health -= attack.damageDealt;
					this.vibrateHitstunTimer = 20;	
				}
			}
			
			this.hitSFX.Play(2.5,0.25);
		
			var posZ = attack.visualContactZ;
			if (attack.positionOwner !== null)
				posZ+=attack.positionOwner.posZ;
			var sparks = new HitSpark(this, 0, posZ);
			// Size them based on stamina drained.
			sparks.scale = 2.8 + attack.staminaDrained * 2;
			level.entities.AddEffect(sparks);
		
			if (attack.hitStunDealt > 0 && attack.hitStunDealt < 0.333)
				this.lightHitSFX.Play(1.0);
			else if (attack.hitStunDealt >= 0.333 && attack.hitStunDealt < 0.666)
				this.moderateHitSFX.Play(1.0);
			else if (attack.hitStunDealt >= 0.666)
				this.hardHitSFX.Play(1.0);
		}
	}
	
};

// Boilerplate Entity Code
OrcSpeaker.prototype.Init = EntityInit;
OrcSpeaker.prototype.ChangeState = EntityChangeState;
OrcSpeaker.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
OrcSpeaker.prototype.Speed = EntitySpeed;
OrcSpeaker.prototype.Kill = EntityKill;
OrcSpeaker.prototype.ReleaseOrbs = EntityReleaseOrbs;
OrcSpeaker.prototype.Die = EntityDie;
OrcSpeaker.prototype.CancelAttack = EntityCancelAttack;
//OrcSpeaker.prototype.Respawn = EntityRespawn;		
OrcSpeaker.prototype.GetGroundFriction = EntityGetGroundFriction;
OrcSpeaker.prototype.DrawSprite = EntityDrawSprite;		// Overridden
OrcSpeaker.prototype.Draw = EntityDraw;
OrcSpeaker.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//OrcSpeaker.prototype.UpdateState = EntityUpdateState;	// Overridden
OrcSpeaker.prototype.Update = EntityUpdate;
OrcSpeaker.prototype.Push = EntityPush;
//OrcSpeaker.prototype.Hit = EntityHit;
//OrcSpeaker.prototype.Capture = EntityCapture;
OrcSpeaker.prototype.Release = EntityRelease;
//OrcSpeaker.prototype.ChangeAlliance = EntityChangeAlliance;
OrcSpeaker.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
OrcSpeaker.prototype.CollisionDetection = EntityCollisionDetection;
OrcSpeaker.prototype.WatchSex = EntityWatchSex;
OrcSpeaker.prototype.DoneWatchingSex = EntityDoneWatchingSex;


// Test AI for the orc speaker
function OrcSpeakerTestAI(owner)
{
	AICore.call(this, owner);
};

OrcSpeakerTestAI.prototype.GenerateNewAction = function()
{
	this.QueueAction( new BasicAttackAction(player, 600, 1) );
	this.QueueAction( new WaitAction(600, true) );
};

OrcSpeakerTestAI.prototype.QueueAction = AICore.prototype.QueueAction;
OrcSpeakerTestAI.prototype.Flush = AICore.prototype.Flush;
OrcSpeakerTestAI.prototype.CancelCurrentAction = AICore.prototype.CancelCurrentAction;
OrcSpeakerTestAI.prototype.Update = AICore.prototype.Update;
OrcSpeakerTestAI.prototype.Draw = AICore.prototype.Draw;
OrcSpeakerTestAI.prototype.UpdateTargetPosition = AICore.prototype.UpdateTargetPosition;

// Test AI for the orc speaker
function OrcSpeakerAI(owner)
{
	AICore.call(this, owner);
};

OrcSpeakerAI.prototype.GenerateNewAction = function()
{
	if (this.owner.master !== null && this.owner.master.state === States.BasicAttack && this.owner.master.attack === this.owner.master.screamAttack)
		this.QueueAction( new OrcSpeakerAttack(this.owner.master, this.owner) );
	//else
	//	this.QueueAction( new WaitAction(5, true) );
};

OrcSpeakerAI.prototype.QueueAction = AICore.prototype.QueueAction;
OrcSpeakerAI.prototype.Flush = AICore.prototype.Flush;
OrcSpeakerAI.prototype.CancelCurrentAction = AICore.prototype.CancelCurrentAction;
OrcSpeakerAI.prototype.Update = AICore.prototype.Update;
OrcSpeakerAI.prototype.Draw = AICore.prototype.Draw;
OrcSpeakerAI.prototype.UpdateTargetPosition = AICore.prototype.UpdateTargetPosition;

// This action does not end and must be cancelled
function OrcSpeakerAttack(target, owner)
{
	BasicAction.call(this);
	
	this.target = target;
	this.owner = owner;
	
	// Warp the orc speaker into place
	this.owner.posX = this.target.posX + 500 * this.target.facing;
	this.owner.posY = this.target.posY;
	this.owner.facing = this.target.facing;
};

OrcSpeakerAttack.prototype.Update = function()
{
	this.timer += 1;
	
	// Hold the smoke key to rise up from the ground
	if (this.target.state === States.BasicAttack)
	{
		this.owner.controller.smokeKeyDown();
	
		if (soundWaveTrigger === 1)
			this.owner.controller.punchKeyDown();
	}
	else
	{
		this.Complete();
	}
};

OrcSpeakerAttack.prototype.Complete = function()
{
	this.ended = true;
};
