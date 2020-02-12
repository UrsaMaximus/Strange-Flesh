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

GlobalResourceLoader.AddAudioResource("boss_intro_transform","sound/joe/boss_intro_transform.mp3");
GlobalResourceLoader.AddAudioResource("GOH_BossYellsinMic","sound/enemies/GOH_BossYellsinMic.mp3");

GlobalResourceLoader.AddAudioResource("Boss_LaserAttack","sound/joe/Boss_LaserAttack.mp3");
GlobalResourceLoader.AddAudioResource("Boss_FireBallAttack_Loop","sound/joe/Boss_FireBallAttack_Loop.mp3");
GlobalResourceLoader.AddAudioResource("Boss_FireBallAttack_Start","sound/joe/Boss_FireBallAttack_Start.mp3");
GlobalResourceLoader.AddAudioResource("Boss_FireBallAttack_Cackle","sound/joe/Boss_FireBallAttack_Cackle.mp3");
GlobalResourceLoader.AddAudioResource("Boss_FireBallAttack_End","sound/joe/Boss_FireBallAttack_End.mp3");
GlobalResourceLoader.AddAudioResource("Boss_FistsAreUseless1","sound/joe/Boss_FistsAreUseless1.mp3");
GlobalResourceLoader.AddAudioResource("Boss_FistsAreUseless2","sound/joe/Boss_FistsAreUseless2.mp3");
GlobalResourceLoader.AddAudioResource("Boss_DeathScene","sound/joe/Boss_DeathScene.mp3");
GlobalResourceLoader.AddAudioResource("Boss_SexScene1","sound/joe/Boss_SexScene1.mp3");
GlobalResourceLoader.AddAudioResource("Boss_SexScene2","sound/joe/Boss_SexScene2.mp3");

include("SuspendableSound.js");

function Joe5()
{
	EntityInit.call(this);
	this.displayName = "J O E";
	
	// SFX
	this.introSFX = new SuspendableSound("boss_intro_transform");
	//this.attackSFX = new RandomSoundCollection("joe4_attack{0}",2);
	//this.hitSFX = new RandomSoundCollection("joe4_hit{0}",3);
	
	this.soundProjectileSFX = GlobalResourceLoader.GetSound("Boss_LaserAttack");
	this.yellSFX = new SuspendableSound("GOH_BossYellsinMic");

	
	this.fistsUselessSFX = new RandomSoundCollection("Boss_FistsAreUseless{0}",2);
	
	this.deathSFX = new SuspendableSound("Boss_DeathScene");
	this.sex1SFX = new SuspendableSound("Boss_SexScene1");
	this.sex2SFX = new SuspendableSound("Boss_SexScene2");
	
	this.fireballStartSFX = GlobalResourceLoader.GetSound("Boss_FireBallAttack_Start");
	this.fireballEndSFX = GlobalResourceLoader.GetSound("Boss_FireBallAttack_End");
	this.fireballCackleSFX = GlobalResourceLoader.GetSound("Boss_FireBallAttack_Cackle");

	
	this.fireballSFX = new Music();
	this.fireballSFX.tracks["idle"] = new MusicTrack("idle");
	var loopSegment = new MusicSegment("Boss_FireBallAttack_Loop");
	loopSegment.nextSegment = loopSegment;
	this.fireballSFX.tracks["idle"].firstSegment = loopSegment;
	this.fireballSFX.setTrack("idle");
	this.fireballSFX.volume = 0.6;
	
	this.ai = new BossPhase0AI(this);
	this.aiPhase = 0;
	this.health = 615;	// 615
	this.maxHealth = 615; // 615
	this.orcSpeakerSpawned = false;
	
	this.triggersSpecialGameEvents = false;
	this.shownTitle = false;
	
	// Combat flags
	this.alliance = 2;
	this.grabbable = false;
	this.fuckable = true;
	this.kissable = false;
	this.throwable = false;
	this.knockoutable = false;
	this.corruptable = true;
	
	this.grabAdjustX = 20;
	this.grabAdjustY = 0;
	this.grabAdjustZ = -20;
	
	// Stats
	this.walkMaxVel = 18.0;
	this.walkAccel = 3.0;
	this.maxHitStunFrames = 20;
	this.maxJumpFrames = 10;
	
	this.vibrateHitstunTimer = 0;	// amplitude,scale
	this.earthquakeX = new EarthQuakeNoise(21,0.4);
	this.earthquakeY = new EarthQuakeNoise(21,0.4);
	this.effectOffsetX = 0;
	this.effectOffsetY = 0;
	
	this.staminaRecoveryPerFrame = 1.0;	// Stamina fully recovers in 10 seconds when not dazed
	this.staminaRecoveryPerFrameWhenKOed = 1.0;	// Stamina fully recovers in 4 seconds
	
	this.gravity = -(gravity - 0.1);
	
	this.weight = 150;
	this.flying = true;
	this.groundFriction = 0.95;
	this.groundFrictionKO = 0.95;
	
	
	this.orcSpeaker = null;
	
	this.fadeOutObjects = [];
	this.fadeInObjects = [];
	this.lightFlash = new GlobalLight();
	this.lightFlash.lightColor = "#C8BDCA";
	this.lightFlash.alpha = 0;
	
	// Collision
	this.zHeight = this.scale * 120;
	this.collisionRadius = this.scale * 20;
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * 100 / 2,y:-this.scale * 40 / 2});
	this.hitRect.expandToFit({x:this.scale * 100 / 2,y:this.scale * 40 / 2});

	this.guitarAttack = new Attack(this);
	this.guitarAttack.attackbox.SetBounds(-5,-5,5,5);
	this.guitarAttack.animationTriggered = "guitarAttack";
	this.guitarAttack.warmupframes = 60;
	this.guitarAttack.attackFrames = 1;
	this.guitarAttack.cooldownframes = 240;
	this.guitarAttack.damageDealt = 100;
	this.guitarAttack.staminaDrained = 0.85;
	this.guitarAttack.visualContactZ = 96 * this.scale;
	this.guitarAttack.hitStunDealt = 1.0;
	this.guitarAttack.knockbackMultiplierZ = 1.2;
	this.guitarAttack.knockbackMultiplier = 1.5;
	this.guitarAttack.remainActiveUntil = -1;
	
	this.screamAttack = new Attack(this);
	this.screamAttack.attackbox.SetBounds(-5,-5,5,5);
	this.screamAttack.animationTriggered = "screamAttack";
	this.screamAttack.warmupframes = 60;
	this.screamAttack.zHeight = 3;
	this.screamAttack.attackFrames = 1;
	this.screamAttack.cooldownframes = 230;
	this.screamAttack.damageDealt = 25;
	this.screamAttack.staminaDrained = 1.0;
	this.screamAttack.visualContactZ = 0;
	this.screamAttack.hitStunDealt = 1.0;
	this.screamAttack.remainActiveUntil = -1;
	
	this.dashAttack = new Attack(this);
	this.dashAttack.attackbox.SetBounds(0,-55,320,55);
	this.dashAttack.animationTriggered = "dashAttack";
	this.dashAttack.warmupframes = 40;
	this.dashAttack.zHeight = 114;
	this.dashAttack.zSize = 185;
	this.dashAttack.attackFrames = 1;
	this.dashAttack.cooldownframes = 1;
	this.dashAttack.damageDealt = 40;
	this.dashAttack.staminaDrained = 1.0;
	this.dashAttack.connectWithOwner = false;
	this.dashAttack.remainActiveUntil = -1; // Active until explicitly cancelled
	//this.dashAttack.visualContactX = 113*3;
	this.dashAttack.visualContactZ = 117*3;
	this.dashAttack.hitStunDealt = 1.0;
	
	this.speechBubbles = [];
	this.spawnTransformAnim = null;
	
	this.animationSetup();
};

Joe5.prototype.editorProperties = ['displayName','alliance','health','orbsOnDeath', 'orbsAfterSex', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld','triggersSpecialGameEvents'];
Joe5.prototype.runtimeProperties = ['newlySpawned','newlySpawnedTargetX','newlySpawnedTargetY','state','stateFrames','corrupted','recruited'];

Joe5.prototype.GetMoveMaxVelocity = function()
{		
	return this.walkMaxVel;
};

Joe5.prototype.GetStaminaRecovery = function()
{
	if (IsInvulnerable(this.state))
		return this.staminaRecoveryPerFrameWhenKOed;
	else
		return this.staminaRecoveryPerFrame; // Stamina fully recovers in 5 seconds when not dazed
};

Joe5.prototype.DrawSprite = function()
{
	// Draw shadow
	ctx.globalAlpha = 0.4 * this.alpha;
	ctx.fillStyle = "#000000";
	var shadowScale = 500 / (this.posZ + 500);
	drawEllipse(0,0,shadowScale*290,shadowScale*90);

	ctx.globalAlpha = this.alpha;
	this.animationModel.Draw();
	ctx.globalAlpha = 1.0;
	
	if (debug === 2 && this.ai != null)
		this.ai.Draw();
};

Joe5.prototype.UpdateState = function()
{
	camera.addObjectToTrack(this);
	
	var mag = Math.sqrt(Math.pow(this.velX,2)+Math.pow(this.velY,2));
	var ang = Math.atan2(this.velY,this.velX);
	
	if (!this.orcSpeakerSpawned)
	{
		this.orcSpeaker =  new OrcSpeaker(this);
		level.entities.AddEntity(this.orcSpeaker );
		this.orcSpeakerSpawned = true;
	}
	
	// Change the AI phases on different conditions
	if (this.ai !== null)
	{
		if (this.aiPhase === 0)		// Phase lasts for 615-410 HP
		{
			// If the player is on the ground
			if (player.posZ === 0 && this.posZ === 0 && this.state !== States.Spawning)
			{
				this.ai = new BossPhase1AI(this);
				this.aiPhase = 1;
			}
		}
		else if (this.aiPhase === 1)	// Phase lasts until orc head is dead
		{
			if (this.health <= 410)
			{
				this.ai = new BossPhase2AI(this);
				this.aiPhase = 2;
			}
		}
		else if (this.aiPhase === 2)	// Phase lasts 410-205 HP
		{
			if (this.orcSpeaker !== null && IsDeadOrDying(this.orcSpeaker.state))
			{
				this.orcSpeaker = null;
				this.ai = new BossPhase3AI(this);
				this.aiPhase = 3;
			}
		}
		else if (this.aiPhase === 3)	// Phase lasts 205 - 0 HP
		{
			if (this.health <= 205)
			{
				this.ai = new BossPhase4AI(this);
				this.aiPhase = 4;
			}
		}
	}
	
	// Do what needs to be done in each state and change the state if needed
	if (this.state === States.Walk)
	{
		this.animationModel.ChangeState("idle");
		
		if (!this.shownTitle)
		{
			this.shownTitle = true;
			hud.DisplayMessage("Innermost Desires;J O E");
		}
	
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		if (this.controller.jump)
		{
			if (this.velZ < 5.0)
				this.accelZ = 1.0;
		}
		
		// Change to attack state
		if (this.controller.punch && this.controller.punchFramesSinceKeydown < 6)
		{
			this.attack = this.guitarAttack;
			this.attack.Attack();
			this.animationModel.ChangeState(this.attack.animationTriggered);
			this.ChangeState(States.BasicAttack);
		}
		else if (this.controller.smoke && this.controller.smokeFramesSinceKeydown < 6)
		{
			this.attack = this.screamAttack;
			this.attack.Attack();
			this.animationModel.ChangeState(this.attack.animationTriggered);
			this.ChangeState(States.BasicAttack);
		}
		else if (this.controller.grab /*&& this.controller.grabFramesSinceKeydown < 6*/)
		{
			this.attack = this.dashAttack;
			this.attack.Attack();
			this.ChangeState(States.VulnerableDash);
		}
	}
	else if (this.state === States.VulnerableDash)
	{
		if (this.stateFrames < 40)
		{
			this.animationModel.ChangeState("dashAttackWarmup");
		}
		else
		{
			this.animationModel.ChangeState("dashAttack");
		}
		
		if (this.stateFrames === 1)
		{
			this.fireballCackleSFX.Play();
		}
		
		if (this.stateFrames === 40)
		{
			this.fireballStartSFX.Play(); // = GlobalResourceLoader.GetSound("Boss_FireBallAttack_Start");
		}
		
		if (this.stateFrames >= 40)
		{
			this.velX = this.facing * 24;
			this.ProcessDirectionalInput(false,true);
			
			this.fireballSFX.play();
			this.fireballSFX.setVolume(linearRemap(Math.abs(this.posX - camera.posX),3700,0,0,1.0*settings.baseSFXBoost));
			this.fireballSFX.Update();
		}
		
		if (!this.controller.grab && this.controller.grabFramesSinceKeyup > 5 && this.stateFrames >= 60)
		{
			if (this.stateFrames >= 40)
			{
				var smoke = new SmokeExplosion(this.posX + 170 * this.facing,this.posY+25,this.posZ+140*3,300,300,0.6);
				smoke.velX = this.velX*0.5;
				smoke.mute = true;
				smoke.delayTimer = 12;
				level.entities.AddEffect(smoke);
				this.fireballSFX.stop(0.0, 0.2);
				
				this.fireballEndSFX.Play(1.0,0.2);
			}
				
			this.attack.Reset();
			this.ChangeState(States.Walk);
		}
	}
	else if (this.state === States.Fall)
	{
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		if (this.velZ > 0)
		{
			this.animationModel.ChangeState("idle");
		}
		else if (this.animationModel.state != "idle")
		{
			this.animationModel.ChangeState("idle");
		}
		
		// If we've landed on the ground
		if (this.posZ <= 0)
		{
			this.ChangeState(States.Walk);
		}
	}
	else if (this.state === States.FallHelpless)
	{
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		this.animationModel.ChangeState("idle");
		if (this.posZ <= 0)
			this.ChangeState(States.Walk);
	}
	else if (this.state === States.BasicAttack)
	{	
		
		if (this.attack === this.screamAttack)
		{	
			if (this.orcSpeaker !== null)
			{
				//this.yellSFX.Play(0.7,0.5);
				if ((this.stateFrames + 50) % 90 === 0  )
				{
					if (soundWaveTrigger === 0)
						soundWaveTrigger = 2;
				}
			}
			else
			{
				if ((this.stateFrames + 50) % 90 === 0  )
				{
					this.soundProjectileSFX.Play();
					
					var projectile = new SoundProjectile(this, 70*3, 0, 121*3);
					level.entities.AddEffect(projectile);
					
					var projectile = new SoundProjectile(this, 70*3, 0, 121*3);
					projectile.velY = 4.0;
					projectile.trailEnabled = false;
					level.entities.AddEffect(projectile);
					
					var projectile = new SoundProjectile(this, 70*3, 0, 121*3);
					projectile.velY = -4.0;
					projectile.trailEnabled = false;
					level.entities.AddEffect(projectile);
				}
			}
			
			if (!this.controller.smoke && this.controller.smokeFramesSinceKeyup > 30)
			{
				this.CancelAttack();
				this.ChangeState(States.Walk);
			}
			
		}
		else if (this.attack === this.guitarAttack)
		{
			// Spawn the thunderbolt attack
			if (this.stateFrames === 30 || this.stateFrames === 90 || this.stateFrames === 150)
			{
				for (var i =0; i < 3; i++)
				{
					var thunderbolt = new Thunderbolt("red");
				
					thunderbolt.posX = player.posX + (Math.random()-0.5)*700;
					thunderbolt.posY = player.posY + (Math.random()-0.5)*300;
					
					if (Math.random() > 0.5)
						thunderbolt.facing = 1;
		 			else
						thunderbolt.facing = -1;
				
					level.entities.AddEffect(thunderbolt);
				}
			}
			
			if (!this.controller.punch && this.controller.punchFramesSinceKeyup > 30)
			{
				this.CancelAttack();
				this.ChangeState(States.Walk);
			}
		}
		else
		{
			this.CancelAttack();
			this.ChangeState(States.Walk);
		}
	
		//this.ChangeStateOnAttackComplete(States.Walk);
	}
	else if (this.state === States.HitStun)
	{
		if (this.stateFrames === 1)
			this.animationModel.Reset("hitstun");
		this.animationModel.ChangeState("hitstun");
		this.hitStunFrames -= 1.0;
		
		this.CancelAttack();
		
		if (this.hitStunFrames <= 0)
		{
			this.hitStunFrames = 0;
			if (this.health <= 0)
				this.ChangeState(States.KnockedOut);
			// Change to attack state
			else if (this.controller.punch)
			{
				this.attack = this.guitarAttack;
				this.attack.Attack();
				this.animationModel.ChangeState(this.attack.animationTriggered);
				this.ChangeState(States.BasicAttack);
			}
			else if (this.controller.smoke)
			{
				this.attack = this.screamAttack;
				this.attack.Attack();
				this.animationModel.ChangeState(this.attack.animationTriggered);
				this.ChangeState(States.BasicAttack);
			}
			else if (this.controller.grab)
			{
				this.attack = this.dashAttack;
				this.attack.Attack();
				this.ChangeState(States.VulnerableDash);
			}
			else if (this.health > 1)
			{
				this.ChangeState(States.Walk);
			}
			else if (this.health === 1)
			{
				this.ChangeState(States.Taunt);
			}
		}
	}
	else if (this.state === States.Taunt)
	{
		this.animationModel.ChangeState("screamAttack");
		this.weight = Number.MAX_VALUE;
		
		if (this.stateFrames === 60)
		{
			this.deliverDialogue(5,200);
			this.fistsUselessSFX.Play();
		}
		
		if (this.stateFrames === 260)
		{
			this.weight = 150;
			this.ChangeState(States.Walk);
		}
	}
	else if (this.state === States.KnockedOut)
	{
		// 
	}
	else if (this.state === States.Dying)
	{
		if (this.stateFrames === 1)
			this.animationModel.ChangeState("death");
		
		var hitloopend = this.animationModel.animations["death"].mainAnimation.hitLoopEnd;
		if (hitloopend)
		{
			level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,this.posZ+25,200,100,2.0));
			this.ReleaseOrbs();
			this.Die();
		}
	}
	else if (this.state === States.CorruptionTransform)
	{
		if (!this.triggersSpecialGameEvents)
		{
			this.ChangeState(States.Dying);
		}
		else
		{
			this.showDamageMeter = false;
			if (this.stateFrames === 1)
			{
				this.animationModel.ChangeState("predeath");
				this.deathSFX.Play(); // Needs to play ~282 frames before cumming
				GlobalMusic.stop(4.0);
			}
			this.CancelAttack();
		
			player.allowIdle = false;
			player.sexMeter = player.maxSexMeter;	// automatically give the player a full sex meter
		
			// Slide Joe5 towards center stage
			this.posX = crawlValue(this.posX, 2180, 4);
			this.posY = crawlValue(this.posY, 891, 4);
			
			// Stall
			if (this.posX != 2180 || this.posY != 891)
			{
				if (this.stateFrames > 240)
					this.stateFrames -= 1;
			}
			else if (this.stateFrames > 270)
			{
				this.animationModel.ChangeState("death");
			}
		
			// Start the earthquake shortly before he cums
			if (this.stateFrames === 250)
			{
				camera.earthquakeEffect = true;
			}
		
			// Smoke wafts down in sheets from after he cums until the flash
			if (this.stateFrames >= 250 && this.stateFrames <= 400 && this.stateFrames % 10 === 0)
			{
				var floatingSmoke = new FloatingSmoke(-1000, linearRemap(this.stateFrames, 250, 400, 500, 650), linearRemap(this.stateFrames, 250, 400, 600, 400), 0);
				level.entities.AddEffect(floatingSmoke);
			}
		
			// Start the stage's transformation around when he cums
			if (this.stateFrames === 300)
			{
				var fadeIn1 = new Rectangle(1920,1180,"#000");
				fadeIn1.alpha = 0;
				fadeIn1.posX = 1224;
				fadeIn1.posY = -92;
			
				var fadeIn2 = new Rectangle(4000,1180,"#101");
				fadeIn2.alpha = 0;
				fadeIn2.posX = 162;
				fadeIn2.posY = -48;
				
				var fadeIn3 = new RepeatingBackground("haze", "screen");
				fadeIn3.alpha = 0;
				fadeIn3.posX = 0;
				fadeIn3.posY = 0;
				fadeIn3.repX = 20;
			
				this.fadeInObjects.push(fadeIn1);
				this.fadeInObjects.push(fadeIn2);
				this.fadeInObjects.push(fadeIn3);
			
				// Indices to fade from fg: 2, 
				// Indices to fade from background 1, 2, 3, 4
				//this.fadeOutObjects.push(level.foreground[2]);
				this.fadeOutObjects.push(level.background[1]);
				this.fadeOutObjects.push(level.background[2]);
				this.fadeOutObjects.push(level.background[3]);
				//this.fadeOutObjects.push(level.background[4]);
			
				// Insert fadeIn1 at 5, 8
				level.background.splice(5, 0, fadeIn1);
				level.background.splice(8, 0, fadeIn2);
				level.foreground.push(fadeIn3);
				overlays.push(this.lightFlash);
			}
		
			// Fade out the audience, music equipment, and dim the lights
			if (this.stateFrames > 300)
			{
				this.fadeInObjects[0].alpha = linearRemap(this.stateFrames, 300, 500, 0, 0.5);
				this.fadeInObjects[1].alpha = linearRemap(this.stateFrames, 300, 500, 0, 0.3);
				this.fadeInObjects[2].alpha = linearRemap(this.stateFrames, 300, 500, 0, 1.0);
			
				for (var i=0; i < this.fadeOutObjects.length; i++)
				{
					this.fadeOutObjects[i].alpha = linearRemap(this.stateFrames, 300, 500, 1, 0);
				}
			}
		
			if (this.stateFrames > 500 && this.stateFrames <= 560)
			{
				this.lightFlash.alpha = linearRemap(this.stateFrames, 500, 560, 0.0, 1.0);
				hud.HideHud();
			}
		
			if (this.stateFrames > 620 && this.stateFrames <= 680)
			{
				camera.earthquakeEffect = false;
				this.lightFlash.lightColor = mixColor(normalizeValue(this.stateFrames,620,680), "#C8BDCA", "#000000");
			}
		
			if (this.stateFrames === 680)
			{
				GlobalMusic.setTrack("final_sex");
				GlobalMusic.play();
				this.lightFlash.FadeOutAndDie(60);
				this.ChangeState(States.PreCorrupt);
				player.allowIdle = true;
			}
		}
	}
	
	else if (this.state === States.Thrown)
	{
		this.showDamageMeter = false;
		this.weight = Number.MAX_VALUE;
		this.animationModel.ChangeState("thrown");
		
		this.gravity = -gravity*0.4;
		this.flying = false;
		this.weight = 150;
		this.groundFriction = 0.81;
		this.groundFrictionKO = 0.9;
		
		if (this.posZ === 0)
		{
			this.ChangeState(States.Corrupt);
		}
	}
	else if (this.state === States.PreCorrupt)
	{
		this.showDamageMeter = false;
		this.weight = Number.MAX_VALUE;
		this.animationModel.ChangeState("precorrupt");
	}
	else if (this.state === States.Corrupt)
	{
		this.weight = Number.MAX_VALUE;
		this.corrupt();
		this.animationModel.ChangeState("corrupt");
	}
	else if (this.state === States.CorruptPrepareBeforeSex)
	{
		if (this.sexType === 0)
		{
			if (this.stateFrames === 1)
				this.sex1SFX.Play();
			this.animationModel.ChangeState("precorrupt");
		}
		else
		{
			if (this.stateFrames === 1)
				this.sex2SFX.Play();
			this.animationModel.ChangeState("corrupt");
		}
	}
	else if (this.state === States.CaptiveSexBottom)
	{
		// Nothing to do, bartender in control
	}
	else if (this.state === States.CorruptOrgasmAfterSex)
	{
		// Game ends here
		this.Die();
	}
	else if (this.state === States.Spawning)
	{
		player.allowIdle = false;
		if (this.stateFrames === 1)
		{
			this.animationModel.ChangeState("spawning_wait");
			
			this.fadeOutObjects = [];
			this.fadeOutObjects.push(level.background[level.background.length-2]);
		}
		else if (this.stateFrames === 300)
		{
			this.animationModel.ChangeState("spawning_talk");
			this.deliverDialogue(0,350,0)
			this.introSFX.Play();
		}
		else if (this.stateFrames === 650)
		{
			this.animationModel.ChangeState("spawning_angry");
		}
		else if (this.stateFrames === 800)
		{
			this.animationModel.ChangeState("spawning_scream");
		}
		else if (this.stateFrames === 830)
		{
			this.deliverDialogue(1,280,1)
		}
		else if (this.stateFrames === 1140)
		{
			this.deliverDialogue(2,220,0)
		}
		else if (this.stateFrames === 1400)
		{
			this.animationModel.ChangeState("spawning_transform");
		}
		else if (this.stateFrames === 1500)
		{
			var transformEffect = new EffectAnimation(this.spawnTransformAnim,this,true);
			transformEffect.deathTime = 200;
			level.entities.AddEffect(transformEffect);
		}
		else if (this.stateFrames === 1650)
		{
			this.animationModel.ChangeState("spawn");
		}
		else if (this.stateFrames === 1686)
		{
			this.animationModel.ChangeState("idle");
		}
		else if (this.stateFrames === 1700)
		{
			this.animationModel.ChangeState("talk");
			this.deliverDialogue(3,280,2)
		}
		else if (this.stateFrames === 2000)
		{
			this.animationModel.ChangeState("talk");
			this.deliverDialogue(4,280,2)
		}
		else if (this.stateFrames === 2300)
		{
			this.ChangeState(States.Walk);
			player.allowIdle = true;
			this.fadeOutObjects = [];
		}
		
		// Fade in the audience
		if (this.stateFrames > 1550 && this.stateFrames < 1700)
		{
			for (var i=0; i < this.fadeOutObjects.length; i++)
			{
				this.fadeOutObjects[i].alpha = linearRemap(this.stateFrames, 1550, 1690, 1, 0);
			}
		}
		
	}
	

};

Joe5.prototype.recruit = function(captor)
{
};

Joe5.prototype.unrecruit = function()
{
};

Joe5.prototype.corrupt = function()
{
	//if (!this.corrupted)
	//{
	//	this.corrupted = true;
	//}
};

Joe5.prototype.deliverDialogue = function(index,frames,joeForm)
{	
	var dialog = new EffectAnimation(this.speechBubbles[index]);
	
	if (joeForm === 0)
	{
		dialog.posX = this.posX + 36 * 3 * this.facing;
		dialog.posY = this.posY;
		dialog.posZ = this.posZ + 101 * 3;
	}
	else if (joeForm === 1)
	{
		dialog.posX = this.posX + 8 * 3 * this.facing;
		dialog.posY = this.posY;
		dialog.posZ = this.posZ + 105 * 3;
	}
	else
	{
		dialog.posX = this.posX + 80 * 3 * this.facing;
		dialog.posY = this.posY;
		dialog.posZ = this.posZ + 160 * 3;
	}
	
	dialog.deathTime = frames;

	level.entities.AddEffect(dialog);
};



// All the animation frames associated with the Joe5.
GlobalResourceLoader.AddImageResource("sheet_Joe0_Normal","images/joe0/sheet_Joe0_Normal.txt");
GlobalResourceLoader.AddImageResource("sheet_JoeTransformEffect","images/joe5/sheet_JoeTransformEffect.txt");
GlobalResourceLoader.AddImageResource("sheet_Joe5_Normal","images/joe5/sheet_Joe5_Normal.txt");
GlobalResourceLoader.AddImageResource("sheet_Joe5_Corrupt","images/joe5/sheet_Joe5_Corrupt.txt");
GlobalResourceLoader.AddImageResource("sheet_Joe5_Charge","images/joe5/sheet_Joe5_Charge.txt");
GlobalResourceLoader.AddImageResource("sheet_Joe5_SpeechBubbles","images/joe5/sheet_Joe5_SpeechBubbles.txt");
GlobalResourceLoader.AddImageResource("sheet_Bartender_Joe5Sex_Kiss","images/bartender/sheet_Bartender_Joe5Sex_Kiss.txt");

Joe5.prototype.animationSetup = function()
{
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;									// This animation loops
	idleAnim.inheritFacing = 1;								// It inherits the player's facing property
	idleAnim.sendPosition = false;
	idleAnim.AddSequentialFrames("joe5/idle{0}",1,8);		// All the frames and their timing info
	idleAnim.SetDurationInSeconds(1.0);							// Set how long one loop takes (in seconds)
	
	var screamIdleTransition = new Animation(this);
	screamIdleTransition.repeat = 0;									// This animation loops
	screamIdleTransition.inheritFacing = 1;								// It inherits the player's facing property
	screamIdleTransition.AddFrame("joe5/screamattack13");		// All the frames and their timing info
	screamIdleTransition.SetDurationInSeconds(0.1);							// Set how long one loop takes (in seconds)
	
	var guitarIdleTransition = new Animation(this);
	guitarIdleTransition.repeat = 0;									// This animation loops
	guitarIdleTransition.inheritFacing = 1;								// It inherits the player's facing property
	guitarIdleTransition.AddFrame("joe5/guitarattack17");		// All the frames and their timing info
	guitarIdleTransition.AddFrame("joe5/guitarattack18");		// All the frames and their timing info
	guitarIdleTransition.SetDurationInSeconds(0.2);							// Set how long one loop takes (in seconds)
	
	// Add the idle animation and all its transitions to the idle animation state
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	idleState.AddTransitionAnimation("screamAttack", screamIdleTransition);
	idleState.AddTransitionAnimation("guitarAttack", guitarIdleTransition);
	
	// Add all the animation states to the animations collection
	this.animationModel.AddState("idle",idleState);
	
	// Define the hitstun animation
	var hitStunAnim = new Animation(this);
	hitStunAnim.repeat = 0;							// This animation is one-shot
	hitStunAnim.inheritFacing = 1;					// It inherits the player's facing property
	hitStunAnim.matchPosition = false;
	hitStunAnim.AddFrame("joe5/hitstun");		// All the frames and their timing info
	hitStunAnim.SetDurationInSeconds(0.5);
	var hitStunState = new AnimationState();
	hitStunState.SetMainAnimation(hitStunAnim);
	this.animationModel.AddState("hitstun",hitStunState);
	
	// Define the guitarAttack animation
	var attackAnim = new Animation(this);
	attackAnim.repeat = 1;							// This animation is one-shot
	attackAnim.inheritFacing = 1;					// It inherits the player's facing property
	attackAnim.matchPosition = false;
	attackAnim.AddSequentialTimedFrames("joe5/guitarattack{0}",1,7,0,0.1);
	attackAnim.AddSequentialTimedFrames("joe5/guitarattack{0}",9,16,0.7,0.05);
	attackAnim.SetDurationInSecondsWithoutRetime(1.1);
	attackAnim.loopStartPosition = (0.7 / 1.1);
	attackAnim.loopEndPosition = (1.0);
	
	var attackState = new AnimationState();
	attackState.SetMainAnimation(attackAnim);
	this.animationModel.AddState("guitarAttack",attackState);
	
	// Define the screamAttack animation
	var attackAnim = new Animation(this);
	attackAnim.repeat = 1;							// This animation is one-shot
	attackAnim.inheritFacing = 1;					// It inherits the player's facing property
	attackAnim.matchPosition = false;
	attackAnim.AddSequentialTimedFrames("joe5/screamattack{0}",1,10,0,0.1);
	attackAnim.AddSequentialTimedFrames("joe5/screamattack{0}",11,12,1.0,(1/30));	
	attackAnim.SetDurationInSecondsWithoutRetime(32/30);
	attackAnim.loopStartPosition = (30/32);
	attackAnim.loopEndPosition = (32/32);
	var attackState = new AnimationState();
	attackState.SetMainAnimation(attackAnim);
	this.animationModel.AddState("screamAttack",attackState);
	
	// Define the charge animation
	var attackAnim = new Animation(this);
	attackAnim.repeat = 1;							// This animation is one-shot
	attackAnim.inheritFacing = 1;					// It inherits the player's facing property
	attackAnim.matchPosition = false;
	attackAnim.AddSequentialFrames("joe5/chargeattack{0}",1,4);
	attackAnim.loopStartPosition = (2/4);
	attackAnim.loopEndPosition = (4/4);
	attackAnim.SetDurationInSeconds(0.4);
	var attackState = new AnimationState();
	attackState.SetMainAnimation(attackAnim);
	this.animationModel.AddState("dashAttackWarmup",attackState);
	
	// Define the charge animation
	var attackAnim = new Animation(this);
	attackAnim.repeat = 1;							// This animation is one-shot
	attackAnim.inheritFacing = 1;					// It inherits the player's facing property
	attackAnim.matchPosition = false;
	attackAnim.AddSequentialFrames("joe5/chargeattack{0}",5,9);
	attackAnim.SetDurationInSeconds(0.5);
	attackAnim.loopStartPosition = (2.0/5.0);	
	var attackState = new AnimationState();
	attackState.SetMainAnimation(attackAnim);
	this.animationModel.AddState("dashAttack",attackState);
	
	var attackAnim = new Animation(this);
	attackAnim.repeat = 0;							// This animation is one-shot
	attackAnim.inheritFacing = 1;					// It inherits the player's facing property
	attackAnim.matchPosition = false;
	attackAnim.AddFrame("joe5/chargeattack8");
	attackAnim.AddFrame("joe5/chargeattack7");
	attackAnim.AddFrame("joe5/chargeattack2");
	attackAnim.SetDurationInSeconds(0.3);
	idleState.AddTransitionAnimation("dashAttack", attackAnim);
	
	
	// Define the death animation
	var deathAnim = new Animation(this);
	deathAnim.repeat = 1;							// This animation is one-shot
	deathAnim.inheritFacing = 1;					// It inherits the player's facing property
	deathAnim.matchPosition = false;
	deathAnim.AddSequentialFrames("joe5/death{0}",1,3);  // 23 frames to here
	deathAnim.loopStartPosition = (1.0/3.0);	
	deathAnim.SetDurationInSeconds(0.3);
	var deathState = new AnimationState();
	deathState.SetMainAnimation(deathAnim);
	this.animationModel.AddState("predeath",deathState);
	
	// Define the death animation
	var deathAnim = new Animation(this);
	deathAnim.repeat = 1;							// This animation is one-shot
	deathAnim.inheritFacing = 1;					// It inherits the player's facing property
	deathAnim.matchPosition = false;
	deathAnim.AddSequentialFrames("joe5/death{0}",4,21); 	
	deathAnim.loopStartPosition = (16.0/18.0);	
	deathAnim.SetDurationInSeconds(1.8);
	var deathState = new AnimationState();
	deathState.SetMainAnimation(deathAnim);
	this.animationModel.AddState("death",deathState);
	
	// Define the thrown animation
	var anim = new Animation(this);
	anim.repeat = 1;
	anim.inheritFacing = 1;
	anim.sendPosition = false;
	anim.AddFrame("joe5/sex/before1");
	anim.SetDurationInSeconds(1.0);
	var animState = new AnimationState();
	animState.SetMainAnimation(anim);
	this.animationModel.AddState("thrown",animState);
	
	// Define the corrupt animation
	var anim = new Animation(this);
	anim.repeat = 1;
	anim.inheritFacing = 1;
	anim.AddSequentialFrames("joe5/sex/preparealt{0}",1,4);
	anim.AddSequentialFrames("joe5/sex/preparealt{0}",4,4);
	anim.AddSequentialFrames("joe5/sex/prepare{0}",3,1);
	anim.AddSequentialFrames("joe5/sex/prepare{0}",1,4);
	anim.AddSequentialFrames("joe5/sex/prepare{0}",4,1);
	anim.SetDurationInSeconds(2.8);
	var animState = new AnimationState();
	animState.SetMainAnimation(anim);
	this.animationModel.AddState("precorrupt",animState);
	
	// Define the corrupt animation
	var anim = new Animation(this);
	anim.repeat = 1;
	anim.inheritFacing = 1;
	anim.sendPosition = false;
	
	anim.AddSequentialFrames("joe5/sex/before{0}cocktwitch",2,5);
	anim.AddSequentialFrames("joe5/sex/before{0}",5,2);
	
	anim.AddSequentialFrames("joe5/sex/before{0}",2,5);
	anim.AddFrame("joe5/sex/before5");
	anim.AddSequentialFrames("joe5/sex/before{0}",5,2);
	
	anim.AddSequentialFrames("joe5/sex/before{0}",2,5);
	anim.AddFrame("joe5/sex/before5");
	anim.AddSequentialFrames("joe5/sex/before{0}",5,2);
	
	anim.SetDurationInSeconds(3.6);
	var animState = new AnimationState();
	animState.SetMainAnimation(anim);
	this.animationModel.AddState("corrupt",animState);
	
	
	// Define the spawning wait animation
	var anim = new Animation(this);
	anim.repeat = 1;
	anim.inheritFacing = 1;
	anim.AddFrame("joe0/talk1");
	anim.SetDurationInSeconds(1.0);
	var animState = new AnimationState();
	animState.SetMainAnimation(anim);
	this.animationModel.AddState("spawning_wait",animState);
	
	// Define the spawning talk animation
	var anim = new Animation(this);
	anim.repeat = 1;
	anim.inheritFacing = 1;
	anim.AddSequentialFrames("joe0/talk{0}",2,5);
	anim.SetDurationInSeconds(0.5);
	var animState = new AnimationState();
	animState.SetMainAnimation(anim);
	this.animationModel.AddState("spawning_talk",animState);
	
	// Define the spawning angry animation
	var anim = new Animation(this);
	anim.repeat = 1;
	anim.inheritFacing = 1;
	anim.AddSequentialFrames("joe0/angry{0}",1,2);
	anim.AddSequentialFrames("joe0/angry{0}loop",3,4);
	anim.loopStartPosition = (2.0/4.0);	
	anim.SetDurationInSeconds(0.4);
	var animState = new AnimationState();
	animState.SetMainAnimation(anim);
	this.animationModel.AddState("spawning_angry",animState);
	
	// Define the spawning screaming animation
	var anim = new Animation(this);
	anim.repeat = 1;
	anim.inheritFacing = 1;
	anim.AddSequentialFrames("joe0/scream{0}",1,6);
	anim.AddSequentialFrames("joe0/scream{0}loop",7,8);
	anim.loopStartPosition = (6.0/8.0);
	anim.SetDurationInSeconds(0.8);
	var animState = new AnimationState();
	animState.SetMainAnimation(anim);
	this.animationModel.AddState("spawning_scream",animState);
	
	// Define the spawning transform animation
	var anim = new Animation(this);
	anim.repeat = 1;
	anim.inheritFacing = 1;
	anim.AddSequentialFrames("joe0/transform{0}",1,2);
	anim.AddSequentialFrames("joe0/transform{0}loop",3,4);
	anim.loopStartPosition = (2.0/4.0);
	anim.SetDurationInSeconds(0.4);
	var animState = new AnimationState();
	animState.SetMainAnimation(anim);
	this.animationModel.AddState("spawning_transform",animState);
	
		// Define the talking animation
	var anim = new Animation(this);
	anim.repeat = 0;
	anim.inheritFacing = 1;
	anim.AddSequentialFrames("joe5/spawn{0}",1,6);
	anim.SetDurationInSeconds(0.6);
	var animState = new AnimationState();
	animState.SetMainAnimation(anim);
	this.animationModel.AddState("spawn",animState);
	
	// Define the talking animation
	var anim = new Animation(this);
	anim.repeat = 1;
	anim.inheritFacing = 1;
	anim.AddSequentialFrames("joe5/talk{0}",1,8);
	anim.SetDurationInSeconds(1.0);
	var animState = new AnimationState();
	animState.SetMainAnimation(anim);
	this.animationModel.AddState("talk",animState);
	
	// The spawning animation transform effect
	var anim = new Animation(this);
	anim.AddSequentialFramesAtFramerate("joe5/transformeffect/start{0}",1,4,10);
	anim.AddSequentialFramesAtFramerate("joe5/transformeffect/loop{0}",1,10,20);
	anim.AddSequentialFramesAtFramerate("joe5/transformeffect/end{0}",1,6,10);
	anim.NormalizeAnimationTiming();
	anim.SetLoopByFrame(4,13);
	anim.repeat = 1;
	anim.inheritFacing = 0;
	this.spawnTransformAnim = anim;
	
	
	// Speech bubble setup
	var anim = new Animation(this);
	anim.AddFrameAtFramerate("joe5/whatamidoingAPPEAR1",10);
	anim.AddFrameAtFramerate("joe5/whatamidoingAPPEAR2",10);
	anim.AddFrameAtFramerate("joe5/whatamidoingLOOPSLOW1",2.5);
	anim.AddFrameAtFramerate("joe5/whatamidoingLOOPSLOW2",2.5);
	anim.AddFrameAtFramerate("joe5/whatamidoingAPPEAR2",10);
	anim.AddFrameAtFramerate("joe5/whatamidoingAPPEAR1",10);
	anim.NormalizeAnimationTiming();
	anim.SetLoopByFrame(2,3);
	anim.repeat = 1;
	anim.inheritFacing = 0;
	this.speechBubbles.push(anim);
	
	var anim = new Animation(this);
	anim.AddFrameAtFramerate("joe5/officedroneAPPEAR1",10);
	anim.AddFrameAtFramerate("joe5/officedroneAPPEAR2",10);
	anim.AddFrameAtFramerate("joe5/officedroneLOOPFAST1",20);
	anim.AddFrameAtFramerate("joe5/officedroneLOOPFAST2",20);
	anim.AddFrameAtFramerate("joe5/officedroneLOOPFAST3",20);
	anim.AddFrameAtFramerate("joe5/officedroneAPPEAR2",10);
	anim.AddFrameAtFramerate("joe5/officedroneAPPEAR1",10);
	anim.NormalizeAnimationTiming();
	anim.SetLoopByFrame(2,4);
	anim.repeat = 1;
	anim.inheritFacing = 0;
	this.speechBubbles.push(anim);
	
	var anim = new Animation(this);
	anim.AddFrame("joe5/punkgodAPPEAR1");
	anim.AddFrame("joe5/punkgodAPPEAR2");
	anim.AddFrame("joe5/punkgodLOOP1");
	anim.AddFrame("joe5/punkgodLOOP2");
	anim.AddFrame("joe5/punkgodAPPEAR2");
	anim.AddFrame("joe5/punkgodAPPEAR1");
	anim.SetDurationInSeconds(0.6);
	anim.SetLoopByFrame(2,3);
	anim.repeat = 1;
	anim.inheritFacing = 0;
	this.speechBubbles.push(anim);
	
	var anim = new Animation(this);
	anim.AddFrame("joe5/nothingAPPEAR1");
	anim.AddFrame("joe5/nothingAPPEAR2");
	anim.AddFrame("joe5/nothingLOOP1");
	anim.AddFrame("joe5/nothingLOOP2");
	anim.AddFrame("joe5/nothingAPPEAR2");
	anim.AddFrame("joe5/nothingAPPEAR1");
	anim.SetDurationInSeconds(0.6);
	anim.SetLoopByFrame(2,3);
	anim.repeat = 1;
	anim.inheritFacing = 0;
	this.speechBubbles.push(anim);
	
	var anim = new Animation(this);
	anim.AddFrame("joe5/groupieAPPEAR1");
	anim.AddFrame("joe5/groupieAPPEAR2");
	anim.AddFrame("joe5/groupieLOOP1");
	anim.AddFrame("joe5/groupieLOOP2");
	anim.AddFrame("joe5/groupieAPPEAR2");
	anim.AddFrame("joe5/groupieAPPEAR1");
	anim.SetDurationInSeconds(0.6);
	anim.SetLoopByFrame(2,3);
	anim.repeat = 1;
	anim.inheritFacing = 0;
	this.speechBubbles.push(anim);
	
	var anim = new Animation(this);
	anim.AddFrame("joe5/uselessAPPEAR1");
	anim.AddFrame("joe5/uselessAPPEAR2");
	anim.AddFrame("joe5/uselessLOOP1");
	anim.AddFrame("joe5/uselessLOOP2");
	anim.AddFrame("joe5/uselessAPPEAR2");
	anim.AddFrame("joe5/uselessAPPEAR1");
	anim.SetDurationInSeconds(0.6);
	anim.SetLoopByFrame(2,3);
	anim.repeat = 1;
	anim.inheritFacing = 0;
	this.speechBubbles.push(anim);
};

Joe5.prototype.ChangeAlliance = function(newAlliance)
{
	this.alliance = newAlliance;
	this.guitarAttack.alliance = newAlliance;
	this.screamAttack.alliance = newAlliance;
	this.dashAttack.alliance = newAlliance;
};

Joe5.prototype.ChangeState = function(newState)
{
	if (newState === States.HitStun && this.health > 1 && (this.state === States.BasicAttack || this.state === States.VulnerableDash))
	{
		return;
	}
	else
	{
		EntityChangeState.call(this, newState);
	}
};

Joe5.prototype.Hit = function(attack, isCaptive)
{
	if (IsInvulnerable(this.state) && !(this.state === States.Taunt && this.health === 1))
		return;
	if (this.state === States.BasicAttack && this.attack === this.screamAttack && this.orcSpeaker !== null)
		return;

	// If this isn't the last hit, don't bother doing anything special
	if (this.health > (attack.damageDealt + attack.corruptionDealt))
	{
		EntityHit.call(this, attack, isCaptive);
	}
	else
	{
		// If no corruption is part of this attack, then bring Joe down to 1 HP
		if (attack.corruptionDealt === 0)
		{
			this.health = 1;
			attack.NotifyDamage(this, attack.damageDealt, attack.corruptionDealt); // Notify the attack that it connected
			this.hitStunFrames = this.maxHitStunFrames * 2;
			this.ChangeState(States.HitStun);
			enemyinfo.NotifyHit(this);
			
			var posZ = attack.visualContactZ;
			if (attack.positionOwner !== null)
				posZ+=attack.positionOwner.posZ;
			var sparks = new HitSpark(this, 0, posZ);
			sparks.scale = 2.8 + attack.staminaDrained * 2;
			level.entities.AddEffect(sparks);
			
			this.lightHitSFX.Play(1.0);
			
			this.vibrateHitstunTimer = 15;
		}
		else
		{
			EntityHit.call(this, attack, isCaptive);
			//this.ChangeState(States.CorruptionTransform);
		}
	}
};

Joe5.prototype.ReInit = function(pos)
{
 	if (this.aiPhase === 0)
 	{
 		this.ChangeState(States.Spawning);
 		this.animationModel.ChangeState("spawning_wait");
 	}
};

// Boilerplate Entity Code
Joe5.prototype.Init = EntityInit;
//Joe5.prototype.ChangeState = EntityChangeState;
Joe5.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
Joe5.prototype.Speed = EntitySpeed;
Joe5.prototype.Kill = EntityKill;
Joe5.prototype.ReleaseOrbs = EntityReleaseOrbs;
Joe5.prototype.Die = EntityDie;
Joe5.prototype.CancelAttack = EntityCancelAttack;
Joe5.prototype.Respawn = EntityRespawn;		
Joe5.prototype.GetGroundFriction = EntityGetGroundFriction;
// Joe5.prototype.DrawSprite = EntityDrawSprite;		// Overridden
Joe5.prototype.Draw = EntityDraw;
Joe5.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//Joe5.prototype.UpdateState = EntityUpdateState;	// Overridden
Joe5.prototype.Update = EntityUpdate;
Joe5.prototype.Push = EntityPush;
//Joe5.prototype.Hit = EntityHit;
Joe5.prototype.Capture = EntityCapture;
Joe5.prototype.Release = EntityRelease;
//Joe5.prototype.ChangeAlliance = EntityChangeAlliance;
Joe5.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
Joe5.prototype.CollisionDetection = EntityCollisionDetection;
Joe5.prototype.WatchSex = EntityWatchSex;
Joe5.prototype.DoneWatchingSex = EntityDoneWatchingSex;
Joe5.prototype.OnRemovalFromGame = EntityOnRemovalFromGame;

include("AICore.js");

function BossPhase0AI(owner)
{
	AICore.call(this, owner);
};

BossPhase0AI.prototype.GenerateNewAction = function()
{
	// If there's nothing to do, wait 15 frames before evaluating again to lower CPU usage
	// And to make the AI seem more human by giving it some reaction time.
	this.QueueAction(new WaitAction(180));
};

BossPhase0AI.prototype.QueueAction = AICore.prototype.QueueAction;
BossPhase0AI.prototype.Flush = AICore.prototype.Flush;
BossPhase0AI.prototype.CancelCurrentAction = AICore.prototype.CancelCurrentAction;
BossPhase0AI.prototype.Update = AICore.prototype.Update;
BossPhase0AI.prototype.Draw = AICore.prototype.Draw;
BossPhase0AI.prototype.UpdateTargetPosition = AICore.prototype.UpdateTargetPosition;


function BossPhase1AI(owner)
{
	AICore.call(this, owner);
	this.sideA = 816 + 600;
	this.sideB = 3777 - 600;
	this.targetY = (800 + 1150) / 2.0 - 60;  // 800 - 1150
	this.flyHeight = 0;
	this.backAndForthCounter = 1;
	this.stepCounter = 0;
};

BossPhase1AI.prototype.GenerateNewAction = function()
{
	// Fly to a corner 
	if (this.stepCounter === 0)
	{
		var fakeTarget = {"posX": this.sideA, "posY": this.targetY , "posZ": this.flyHeight};
		if (this.backAndForthCounter % 2 !== 0)
			fakeTarget.posX = this.sideB;
			
		this.QueueAction(new FlyToPointAction(fakeTarget, 100, false));
			
		this.backAndForthCounter++;
		this.stepCounter = 1;
	}
	// Fly at the player
	else if (this.stepCounter === 1)
	{
		var chargeTarget = {"posX": (this.sideA + this.sideB) / 2.0, "posY": player.posY, "posZ": 0 };
		var fakeTarget = {"posX": this.sideA, "posY": this.targetY , "posZ": 0};
		if (this.backAndForthCounter % 2 !== 0)
			fakeTarget.posX = this.sideB;
		
		// If the player is cheesing charge directly at them
		if (signWithoutZero(this.owner.posX-player.posX) !== signWithoutZero(this.owner.posX-chargeTarget.posX))
		{
			var playerTarget = clonePosition(player);
			this.QueueAction( new FaceTargetAction(30, playerTarget)); 
			this.QueueAction( new ChargeAtPosition(playerTarget, this.owner, true) );
			this.QueueAction( new FaceTargetAction(60, chargeTarget)); //clonePosition(player)));
		}
		else
		{
			this.QueueAction( new FaceTargetAction(90, chargeTarget)); //clonePosition(player)));
		}

		this.QueueAction( new ChargeAtPosition(chargeTarget, this.owner, true) );
		this.QueueAction( new ChargeAtPosition(chargeTarget, this.owner, true) );
		this.QueueAction( new WaitAction(80) );
		
		this.stepCounter = 0;
	}
	
};

BossPhase1AI.prototype.QueueAction = AICore.prototype.QueueAction;
BossPhase1AI.prototype.Flush = AICore.prototype.Flush;
BossPhase1AI.prototype.CancelCurrentAction = AICore.prototype.CancelCurrentAction;
BossPhase1AI.prototype.Update = AICore.prototype.Update;
BossPhase1AI.prototype.Draw = AICore.prototype.Draw;
BossPhase1AI.prototype.UpdateTargetPosition = AICore.prototype.UpdateTargetPosition;

function BossPhase2AI(owner)
{
	AICore.call(this, owner);
	this.sideA = 816 + 600;
	this.sideB = 3777 - 600;
	this.targetY = (800 + 1150) / 2.0 - 60;  // 800 - 1150
	this.flyHeight = 300;
	this.backAndForthCounter = 1;
};

BossPhase2AI.prototype.GenerateNewAction = function()
{
	var chargeTarget = {"posX": (this.sideA + this.sideB) / 2.0, "posY": this.targetY + 100, "posZ": 0 };
	var flyTarget = {"posX": this.sideA, "posY": this.targetY, "posZ": 50 };
	var facingTarget = {"posX": this.sideB, "posY": this.targetY, "posZ": 50 };
	if (this.backAndForthCounter % 2 == 0)
	{
		flyTarget.posX = this.sideB;
		facingTarget.posX = this.sideA;
	}
	
	this.QueueAction( new ChargeAtPosition(chargeTarget, this.owner, false));
	this.QueueAction( new FlyToPointAction(flyTarget, 50, false));
	this.QueueAction( new FaceTargetAction(45, facingTarget) );
	this.QueueAction( new BasicAttackAction(facingTarget, 360, 1) );
	this.backAndForthCounter++;
};

BossPhase2AI.prototype.QueueAction = AICore.prototype.QueueAction;
BossPhase2AI.prototype.Flush = AICore.prototype.Flush;
BossPhase2AI.prototype.CancelCurrentAction = AICore.prototype.CancelCurrentAction;
BossPhase2AI.prototype.Update = AICore.prototype.Update;
BossPhase2AI.prototype.Draw = AICore.prototype.Draw;
BossPhase2AI.prototype.UpdateTargetPosition = AICore.prototype.UpdateTargetPosition;

function BossPhase3AI(owner)
{
	AICore.call(this, owner);
	this.sideA = 816;
	this.sideB = 3777;
	this.targetY = (800 + 1150) / 2.0 - 60;  // 800 - 1150
	this.flyHeight = 200;
	this.backAndForthCounter = 1;
};

BossPhase3AI.prototype.GenerateNewAction = function()
{
	this.QueueAction( new FaceTargetAction(1, {"posX": this.sideA, "posY": 0, "posZ": 0 }) );
	this.QueueAction( new ChargeAtPosition({"posX": this.sideA, "posY": this.targetY + (Math.random()-0.5) * 300, "posZ": 0 }, this.owner, false) );
	
	this.QueueAction(new FlyToPointAction({"posX": this.sideA + 600, "posY": this.targetY, "posZ": this.flyHeight }, 100, false));
	this.QueueAction( new FaceTargetAction(1, player) );
	this.QueueAction( new BasicAttackAction(player, 240, 0) );
	
	this.QueueAction( new FaceTargetAction(1, {"posX": this.sideB, "posY": 0, "posZ": 0 }) );
	this.QueueAction( new ChargeAtPosition({"posX": this.sideB, "posY": this.targetY + (Math.random()-0.5) * 300, "posZ": 0 }, this.owner, false) );
	
	this.QueueAction( new FaceTargetAction(1, {"posX": this.sideA, "posY": 0, "posZ": 0 }) );
	this.QueueAction( new ChargeAtPosition({"posX": this.sideA, "posY": this.targetY + (Math.random()-0.5) * 300, "posZ": 0 }, this.owner, false) );
	
	this.QueueAction( new FaceTargetAction(1, {"posX": this.sideB, "posY": 0, "posZ": 0 }) );
	this.QueueAction( new ChargeAtPosition({"posX": this.sideB, "posY": this.targetY + (Math.random()-0.5) * 300, "posZ": 0 }, this.owner, false) );
	
	this.QueueAction(new FlyToPointAction({"posX": this.sideB - 600, "posY": this.targetY, "posZ": this.flyHeight }, 100, false));
	this.QueueAction( new FaceTargetAction(1, player) );

	this.QueueAction( new BasicAttackAction(player, 240, 0) );
	
	this.QueueAction( new WaitAction(90) );
};

BossPhase3AI.prototype.QueueAction = AICore.prototype.QueueAction;
BossPhase3AI.prototype.Flush = AICore.prototype.Flush;
BossPhase3AI.prototype.CancelCurrentAction = AICore.prototype.CancelCurrentAction;
BossPhase3AI.prototype.Update = AICore.prototype.Update;
BossPhase3AI.prototype.Draw = AICore.prototype.Draw;
BossPhase3AI.prototype.UpdateTargetPosition = AICore.prototype.UpdateTargetPosition;

function BossPhase4AI(owner)
{
	AICore.call(this, owner);
	this.sideA = 816 + 300;
	this.sideB = 3777 - 300;
	this.targetY = (800 + 1150) / 2.0 - 60;  // 800 - 1150
	this.flyHeight = 0;
};

BossPhase4AI.prototype.GenerateNewAction = function()
{
	var attack1 = Math.random() >= 0.5 ? 0 : 1;
	var attack2 = Math.random() >= 0.5 ? 0 : 1;

	// Face, charge, fly back, face, attack
	this.QueueAction( new FaceTargetAction(1, {"posX": this.sideA, "posY": 0, "posZ": 0 }) );
	this.QueueAction( new ChargeAtPosition({"posX": this.sideA, "posY": this.targetY + (Math.random()-0.5) * 300, "posZ": 0 }, this.owner, false) );
	this.QueueAction(new FlyToPointAction({"posX": this.sideA, "posY": this.targetY, "posZ": this.flyHeight }, 100, false));
	this.QueueAction( new FaceTargetAction(1, {"posX": this.sideA, "posY": 0, "posZ": 0 }) );
	this.QueueAction( new BasicAttackAction(player, 180, attack1) );
	
	// Face, charge, fly back, face, attack
	this.QueueAction( new FaceTargetAction(1, {"posX": this.sideB, "posY": 0, "posZ": 0 }) );
	this.QueueAction( new ChargeAtPosition({"posX": this.sideB, "posY": this.targetY + (Math.random()-0.5) * 300, "posZ": 0 }, this.owner, false) );
	this.QueueAction(new FlyToPointAction({"posX": this.sideB, "posY": this.targetY, "posZ": this.flyHeight }, 100, false));
	this.QueueAction( new FaceTargetAction(1, player) );
	this.QueueAction( new BasicAttackAction(player, 180, attack2) );
};

BossPhase4AI.prototype.QueueAction = AICore.prototype.QueueAction;
BossPhase4AI.prototype.Flush = AICore.prototype.Flush;
BossPhase4AI.prototype.CancelCurrentAction = AICore.prototype.CancelCurrentAction;
BossPhase4AI.prototype.Update = AICore.prototype.Update;
BossPhase4AI.prototype.Draw = AICore.prototype.Draw;
BossPhase4AI.prototype.UpdateTargetPosition = AICore.prototype.UpdateTargetPosition;


// This action ends upon reaching a location or a timeout
function FlyToPointAction(target, dist, flushable)
{
	BasicAction.call(this);
		
	this.target = target;
	this.dist = dist;
	this.deadZoneX = 0;  // 30
	this.deadZoneY = 0; // 30
	this.deadZoneZ = 10;
	
	this.goingUp = false;
	
	this.flushable = flushable;
};

FlyToPointAction.prototype.Update = function()
{
	this.timer += 1;
	

	// Float up and down logic
 	var distZ = this.target.posZ - this.owner.posZ;
    
	if (distZ > this.deadZoneZ)
	{
		this.owner.controller.jumpKeyDown();
		this.goingUp = true;
	}
	else if (distZ < -this.deadZoneZ)
	{
		this.goingUp = false;
	}
	else if (this.goingUp)
	{
		this.owner.controller.jumpKeyDown();
	}
	
	
	// To try and feather our way in, let's alter the duty cycle of adjustments based on distance in 15 frames
	var distX = this.target.posX - this.owner.posX;
	var distY = this.target.posY - this.owner.posY;
	var distXPredicted = this.target.posX - (this.owner.posX + this.owner.velX * 15);
	var distYPredicted = this.target.posY - (this.owner.posY + this.owner.velY * 15);
	
	var tryAdjustX = Math.abs(distX) > this.deadZoneX || Math.abs(distX) > Math.abs(distY);
	var tryAdjustY = true;
	
	tryAdjustX = tryAdjustX && (sign(distXPredicted) === sign(distX));
	tryAdjustY = tryAdjustY && (sign(distYPredicted) === sign(distY));

	if (speed2(distX,distY*5.0) > this.dist)
	{
		// Adjust the X position if X is the principle component of error
		// or if it's out of spec
		
	
		if (distX > 0 && tryAdjustX)
		{
			this.owner.controller.rightKeyDown();
		}
		else if (distX < 0 && tryAdjustX)
		{
			this.owner.controller.leftKeyDown();
		}
		
		if (distY < 0 && Math.abs(distY) > this.deadZoneY && tryAdjustY)
		{
			this.owner.controller.upKeyDown();
		}
		else if (distY > 0 && Math.abs(distY) > this.deadZoneY && tryAdjustY)
		{
			this.owner.controller.downKeyDown();
		}
	}
	else if (distZ < this.dist)
	{
		this.ended = true;
	}
	
	if (this.timer > this.timeout && this.timeout !== -1)
	{
		this.ended = true;
	}
	
};

FlyToPointAction.prototype.Complete = function()
{
	this.ended = true;
};

// This action ends upon reaching a location or a timeout
function ChargeAtPosition(target, owner, flushable)
{
	BasicAction.call(this);
		
	this.target = target;
	this.deadZoneX = 30;
	this.deadZoneY = 60;
	this.deadZoneZ = 10;
	this.timeout = 240;
	
	this.owner = owner;
	
	this.flushable = flushable;
};

ChargeAtPosition.prototype.Update = function()
{
	this.timer += 1;
	
	var distX = this.target.posX - this.owner.posX;
	var distY = this.target.posY - this.owner.posY;
 	var distZ = this.target.posZ - this.owner.posZ;
 	
 	if (distX * this.owner.facing > 0)
 	{
    	this.owner.controller.grabKeyDown();
		
		if (distY < 0 && Math.abs(distY) > this.deadZoneY)
		{
			this.owner.controller.upKeyDown();
		}
		else if (distY > 0 && Math.abs(distY) > this.deadZoneY)
		{
			this.owner.controller.downKeyDown();
		}
	}
	else
	{
		this.ended = true;
	}
	
	if (this.timer > this.timeout && this.timeout !== -1)
	{
		this.ended = true;
	}
	
};

ChargeAtPosition.prototype.Complete = function()
{
	this.ended = true;
};