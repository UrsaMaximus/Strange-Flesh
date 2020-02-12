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

include("JoeAI.js");

GlobalResourceLoader.AddAudioResource("Joe_Drop_Cell_Instant","sound/joe/Joe_Drop_Cell_Instant.mp3");
GlobalResourceLoader.AddAudioResource("Joe_Drop_Coffee_Instant","sound/joe/Joe_Drop_Coffee_Instant.mp3");
GlobalResourceLoader.AddAudioResource("joe1_ejac","sound/joe/Joe_BlowLoad.mp3");
GlobalResourceLoader.AddSequentialAudioResources("joe1_grabbed{0}","sound/joe/Joe_Grabbed_{0}.mp3",1,3);
//GlobalResourceLoader.AddSequentialAudioResources("joe1_hit{0}","sound/joe/Joe_Hit_{0}.mp3",1,5);
GlobalResourceLoader.AddSequentialAudioResources("joe1_knockout{0}","sound/joe/Joe_Shoulder_Hit_{0}.mp3",1,3);

GlobalResourceLoader.AddSequentialAudioResources("joe1_attack{0}","sound/joe/joe1_attack{0}.mp3",1,2);
GlobalResourceLoader.AddSequentialAudioResources("joe1_hit{0}","sound/joe/joe1_hit{2}.mp3",1,2);

function Joe0()
{
	EntityInit.call(this);
	this.regularNames = ["Neutral Joe","Disinterested Joe","Detached Joe","Passive Joe"];
	this.corruptNames = ["Corrupted Joe","Aroused Joe","Lewd Joe","Filthy Joe","Horny Joe","Lust-Mad Joe","Zonked Joe"];
	var randName = Math.floor((Math.random() * this.regularNames.length));
	this.displayName = this.regularNames[randName];
	
	// Decide if this is a phone joe or a coffee joe
	this.itemHeld = 0;
	if (Math.random() > 0.5)
		this.itemHeld = 1;	// Coffee
	else
		this.itemHeld = 2;	// Phone
		
	this.cowerTimer = 0;
	
	this.ai = new JoeAI(this);
	this.ai.pacifist = true;
	
	// SFX
	this.attackSFX = new RandomSoundCollection("joe1_attack{0}",2);
	this.hitSFX = new RandomSoundCollection("joe1_hit{0}",2);
	this.grabbedSFX = new RandomSoundCollection("joe1_grabbed{0}",1);
	this.knockoutSFX = new RandomSoundCollection("joe1_knockout{0}",3);
	this.ejacSFX = GlobalResourceLoader.GetSound("joe1_ejac");
	this.smokeKissSFX = GlobalResourceLoader.GetSound("joe1_hit5");
	this.smokeKissFallSFX = GlobalResourceLoader.GetSound("joe1_hit4");
	
	// Combat flags
	this.alliance = 2;
	this.grabbable = true;
	this.fuckable = true;
	this.kissable = true;
	this.throwable = true;
	
	// Orbs
	this.orbsOnDeath = 2;
	this.orbsAfterSex = 5;
	this.heathOrbsHeld = 0;
	this.corruptionOrbsHeld = 0;
	this.dominationOrbsHeld = 0;
	
	// Stats
	this.maxHealth = 55;
	this.maxHitStunFrames = 60;
	this.staminaRecoveryPerFrame = 1.0 / (60 * 10);	// Stamina fully recovers in 10 seconds when not dazed
	this.staminaRecoveryPerFrameWhenKOed = 1.0 / (60 * 4);	// Stamina fully recovers in 4 seconds
	this.weight = 50;

	// Collision
	this.zHeight = this.scale * 100;
	this.collisionRadius = this.scale * 10;
	
	//////////////////////////////
	// COMBAT
	//////////////////////////////
	// Hitbox
	this.hitRect = new BoundingRect();
	this.hitRect.fitToPoint({x:-this.scale * 50 / 2,y:-this.scale * 20 / 2});
	this.hitRect.expandToFit({x:this.scale * 50 / 2,y:this.scale * 20 / 2});

	this.animationSetup();
};

Joe0.prototype.ReInit = function()
{
	this.animationSetup();
	if (this.recruited)
		this.animationModel.ApplyPrefix("boner");
};

Joe0.prototype.editorProperties = ['displayName','alliance','health','itemHeld','orbsOnDeath', 'orbsAfterSex', 'heathOrbsHeld', 'corruptionOrbsHeld', 'dominationOrbsHeld','lifeOrbsHeld'];
Joe0.prototype.runtimeProperties = ['newlySpawned','newlySpawnedTargetX','newlySpawnedTargetY','state','stateFrames','corrupted','recruited'];


Joe0.prototype.GetMoveMaxVelocity = function()
{		
	if (this.state === States.Cheering)
		return 0;
	else if (this.recruited || this.watchingSex)
		return 5;
	return 0;
};

Joe0.prototype.GetStaminaRecovery = function()
{
	if (IsInvulnerable(this.state))
		return this.staminaRecoveryPerFrameWhenKOed;
	else
		return this.staminaRecoveryPerFrame; // Stamina fully recovers in 5 seconds when not dazed
};

Joe0.prototype.DrawSprite = function()
{
	// Draw shadow
	ctx.globalAlpha = 0.4 * this.alpha;
	ctx.fillStyle = "#000000";
	var shadowScale = 500 / (this.posZ + 500);
	drawEllipse(0,-6,shadowScale*180,shadowScale*40);

	ctx.globalAlpha = this.alpha;
	this.animationModel.Draw();
	ctx.globalAlpha = 1.0;
	
	if (debug === 2 && this.ai != null)
		this.ai.Draw();
};

Joe0.prototype.dropItem = function(dropSpeedX,dropSpeedZ,cower)
{
	if(typeof(dropSpeedX)==='undefined') dropSpeedX = -10;
	if(typeof(dropSpeedZ)==='undefined') dropSpeedZ = 30;
	if(typeof(cower)==='undefined') cower = true;
	
	if (this.cowerTimer === 0)
	{
		var animation = null;
		var elasticity = 0;
		var sfx = null;
		if (this.itemHeld === 1)
		{
			animation = this.coffeeCupAnim.Clone();
			sfx = GlobalResourceLoader.GetSound("Joe_Drop_Coffee_Instant");
		}
		else if (this.itemHeld === 2)
		{
			animation = this.phoneAnim.Clone();
			elasticity = 0.3
			sfx = GlobalResourceLoader.GetSound("Joe_Drop_Cell_Instant");
		}
		if (animation !== null)
		{
			var heldItem = new DroppedItem(animation, this, 300, 17*this.facing, 300, sfx);
			heldItem.velX = dropSpeedX*this.facing;
			heldItem.velZ = dropSpeedZ;
			heldItem.elasticity = elasticity;
			level.entities.AddEffect(heldItem);
		}
	}
	if (cower)
	{
		this.cowerTimer = 300;
	}
};

Joe0.prototype.UpdateState = function()
{
	var mag = Math.sqrt(Math.pow(this.velX,2)+Math.pow(this.velY,2));
	var ang = Math.atan2(this.velY,this.velX);
	
	if (this.cowerTimer > 0 && !IsInvulnerable(this.state))
		this.cowerTimer -= 1;
	
	// Do what needs to be done in each state and change the state if needed
	if (this.state === States.Walk)
	{
		if (this.recruited || this.watchingSex)
		{
			if (mag < 2.6 && !this.controller.up && !this.controller.down && !this.controller.left && !this.controller.right)
			{
				if (this.watchingSex)
					this.animationModel.ChangeState("sexidle");
				else
					this.animationModel.ChangeState("regularidle");
			}
			else
			{
				if (this.watchingSex && !this.controller.up && !this.controller.down && !this.controller.left && !this.controller.right)
					this.animationModel.ChangeState("sexidle");
				else
					this.animationModel.ChangeState("walk");
			}
	
			// Move the character based on controller input
			this.ProcessDirectionalInput();
			
		}
		else if (this.cowerTimer > 0 && !this.recruited)
		{
			this.animationModel.ChangeState("cower");
		}
		else
		{
			this.animationModel.ChangeState("idle");
		}
		
		if (this.controller.smoke && !this.recruited)
		{
			this.ChangeState(States.Cheering);
		}
		
		// If the ground is missing, go to the fall helpless state
		if (this.posZ > 0)
		{
			this.ChangeState(States.FallHelpless);
		}
		
		if (this.recruited && this.recruitedFrames > this.recruitmentTime)
		{
			this.unrecruit();
			if (!this.watchingSex)
				this.ChangeState(States.LoseBoner);
		}
		
	}
	else if (this.state === States.LoseBoner)
	{
		this.animationModel.ChangeState("loseboner");
		if (this.animationModel.animations["loseboner"].mainAnimation.done)
		{
			this.ChangeState(States.Walk);
		}
	}
	else if (this.state === States.Cheering)
	{
		this.ProcessDirectionalInput();
		
		if (this.cowerTimer > 0 && !this.recruited)
			this.animationModel.ChangeState("cower");
		else
			this.animationModel.ChangeState("cheering");
			
		if (this.stateFrames === 1)
			this.animationModel.SetAllPositions("cheering",Math.random());
		if (!this.controller.smoke)
		{
			this.ChangeState(States.Walk);
		}
	}
	else if (this.state === States.Fall)
	{
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		if (this.velZ > 0)
			this.animationModel.ChangeState("jump");
		else
			this.animationModel.ChangeState("fall");
		
		if (this.posZ <= 0)
			this.ChangeState(States.Walk);
	}
	else if (this.state === States.FallHelpless)
	{
		// Move the character based on controller input
		this.ProcessDirectionalInput();
		
		this.animationModel.ChangeState("fall");
		if (this.posZ <= 0)
			this.ChangeState(States.Walk);
	}
	else if (this.state === States.HitStun)
	{
		if (this.stateFrames === 1)
		{
			this.animationModel.animations["hitstun"].mainAnimation.Reset();
			this.dropItem();
		}
		this.animationModel.ChangeState("hitstun");
		this.hitStunFrames -= 1.0;
		
		this.CancelAttack();
		
		if (this.hitStunFrames <= 0)
		{
			this.hitStunFrames = 0;
			this.ChangeState(States.Walk);
		}
	}
	else if (this.state === States.CaptiveHitStun)
	{
		if (this.stateFrames === 1)
			this.animationModel.animations["captivehitstun"].mainAnimation.Reset();
		this.animationModel.ChangeState("captivehitstun");
		this.hitStunFrames -= 3.0;
		
		this.CancelAttack();
		
		if (this.hitStunFrames <= 0)
		{
			this.hitStunFrames = 0;
			this.ChangeState(States.Captive);
		}
	}
	else if (this.state === States.KnockedOut)
	{
		this.animationModel.ChangeState("knockout");
		
		if (this.ai !== null)
			this.ai.Flush();
		
		this.CancelAttack();
		this.dropItem();
		
		if (this.stateFrames === 1)
			this.stamina = 0.0	
		
		if (this.health <= 0 && this.stateFrames > this.framesBeforeDeath)
		{
			level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,player.posZ+25,200,100,2.0));
			this.ReleaseOrbs();
			this.Die();
		}
		
		if (this.stamina >= 1.0 && this.health > 0)
		{
			this.ChangeState(States.GetUp);
		}
	}
	else if (this.state === States.Thrown)
	{
		this.animationModel.ChangeState("thrown");
		
		this.CancelAttack();
		
		if (this.health <= 0 && this.stateFrames > 50)
		{
			level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,player.posZ+25,200,100,2.0));
			this.ReleaseOrbs();
			this.Die();
		}
		
		if (this.stamina >= 1.0)
		{
			if (this.health > 0)
			{
				this.ChangeState(States.GetUp);
			}
		}
	}
	else if (this.state === States.GetUp)
	{
		this.animationModel.ChangeState("getup");
		if (this.animationModel.AnimationIsComplete("getup"))
			this.ChangeState(States.Walk);
	}
	else if (this.state === States.CaptiveSmokeKiss)
	{
		this.animationModel.ChangeState("captivesmokekiss");
		if (this.stateFrames === 1)
		{
			this.smokeKissSFX.Play(1.0);
		}
	}
	else if (this.state === States.FallAfterSmokeKiss)
	{
		if (this.stateFrames === 1)
		{
			var fallsmoke = new SmokeKissFallSmoke(this);
			level.entities.AddEffect(fallsmoke);
		}
		if (this.stateFrames === 20)
		{
			this.smokeKissFallSFX.Play(1.0);
		}
		this.animationModel.ChangeState("fallaftersmokekiss");
		if (this.animationModel.AnimationIsComplete("fallaftersmokekiss"))
		{	
			//this.recruit(player);
			this.ChangeState(States.Walk);
		}
	}
	else if (this.state === States.CorruptionTransform)
	{
		this.animationModel.ChangeState("corruptiontransform");
		this.corrupt();
		if (this.stateFrames <= 1 && this.lastState !== States.KnockedOut)
		{
			var fallsmoke = new SmokeKissFallSmoke(this);
			level.entities.AddEffect(fallsmoke);
		}
		else if (this.stateFrames <= 1 && this.lastState === States.KnockedOut)
		{
			this.animationModel.animations["corruptiontransform"].SetAllPositions(7/18);
		}
		
		if (this.animationModel.AnimationIsComplete("corruptiontransform"))
			this.ChangeState(States.Corrupt);
	}
	else if (this.state === States.Corrupt)
	{
		this.corrupt();
		this.animationModel.ChangeState("corrupt");
		
		var fapSpeed = 1.5 - 1.0*normalizeValue(this.stateFrames, 1, 700);
		this.animationModel.animations["corrupt"].mainAnimation.SetDurationInSeconds(fapSpeed);
		
		if (fapSpeed === 0.5 && this.animationModel.animations["corrupt"].mainAnimation.endFrame)
		{
			this.ChangeState(States.CorruptOrgasm);
		}
	}
	else if (this.state === States.CorruptOrgasm)
	{
		this.animationModel.ChangeState("faporgasm");
		
		if (this.stateFrames === 30)
		{
			this.ejacSFX.Play(1.0);
		}
		
		if (this.animationModel.animations["faporgasm"].mainAnimation.done)
		{
			level.entities.AddEffect(new SmokeExplosion(this.posX,this.posY,player.posZ+25,200,100,2.0));
			this.ReleaseOrbs();
			this.Die();
		}
	}
	else if (this.state === States.Captive)
	{
		if (this.stateFrames === 1)
		{
			this.dropItem();
		}
		
		if (this.prepareForThrow)
			this.animationModel.ChangeState("thrown");
		else
			this.animationModel.ChangeState("captive");
	}
	else if (this.state === States.CorruptPrepareBeforeSex)
	{
		if (this.sexType === 0 || this.sexType === 1)
		{
			this.animationModel.ChangeState("beforesex");
		}
		else
		{
			this.animationModel.ChangeState("beforesex2");
		}
	}
	else if (this.state === States.CaptiveSexBottom)
	{
		if (this.stateFrames === 310)
		{
			this.ejacSFX.Play(1.0);
		}
	}
	else if (this.state === States.CorruptOrgasmAfterSex)
	{
		if (this.sexType === 0)
		{
			this.animationModel.ChangeState("aftersex");
		
			if (this.animationModel.AnimationIsComplete("aftersex"))
			{
				level.entities.AddEffect(new SmokeExplosion(this.posX + 150 * this.facing,this.posY - 50,this.posZ+25,200,100,2.0));
				this.ReleaseOrbs();
				this.Die();
			}
		}
		else if (this.sexType === 1)
		{
			this.animationModel.ChangeState("aftersex/drunk");
		
			if (this.animationModel.AnimationIsComplete("aftersex/drunk"))
			{
				level.entities.AddEffect(new SmokeExplosion(this.posX + 150 * this.facing,this.posY - 50,this.posZ+25,200,100,2.0));
				this.ReleaseOrbs();
				this.Die();
			}
		}
		else if (this.sexType === 2)
		{
			this.animationModel.ChangeState("aftersex2");
		
			if (this.animationModel.AnimationIsComplete("aftersex2"))
			{
				level.entities.AddEffect(new SmokeExplosion(this.posX + 150 * this.facing,this.posY - 50,this.posZ+25,200,100,2.0));
				this.ReleaseOrbs();
				this.Die();
			}
		}
	}
	else if (this.state === States.Dying)
	{
		this.orderBonus = -10;
		
		if (this.stateFrames > 60)
			this.alpha = crawlValue(this.alpha, 0, 0.01);
		
		if (this.alpha === 0)
			this.Die();
	}
};

Joe0.prototype.recruit = function(captor)
{
	if (!this.recruited)
	{
		this.ChangeAlliance(captor.alliance)
		
		this.recruited = true;
		this.lastDisplayName = this.displayName;
		this.displayName = "Horny Neutral Joe";
		this.animationModel.ApplyPrefix("boner");
		this.cowerTimer = 0;
	}
	else
	{
		this.recruitedFrames = 0;
	}
};

Joe0.prototype.unrecruit = function()
{
	if (this.recruited)
	{
		this.recruited = false;
		this.displayName = this.lastDisplayName;
		this.ChangeAlliance(2);
		this.animationModel.ClearPrefix("boner");
	}
};

Joe0.prototype.corrupt = function()
{
	if (!this.corrupted)
	{
		this.corrupted = true;
		if (!this.recruited)
		{
			var randName = Math.floor((Math.random() * this.corruptNames.length));
			this.displayName = this.corruptNames[randName];
		}
	}
};

// All the animation frames associated with the Joe0.
GlobalResourceLoader.AddImageResource("sheet_Joe1_Normal","images/joe1/sheet_Joe1_Normal.txt");
GlobalResourceLoader.AddImageResource("sheet_Joe0_Normal","images/joe0/sheet_Joe0_Normal.txt");
GlobalResourceLoader.AddImageResource("sheet_Joe0_DroppedItems","images/joe0/sheet_Joe0_DroppedItems.txt");

Joe0.prototype.animationSetup = function()
{
	this.animationModel.Clear();
	
	Joe1.prototype.animationSetup.call(this);
	
	// Define the idle animation
	var idleAnim = new Animation(this);
	idleAnim.repeat = 1;						// This animation loops
	idleAnim.inheritFacing = 1;					// It inherits the player's facing property
	
	if (this.itemHeld === 0)
	{
		idleAnim.sendPosition = false;
		idleAnim.AddFrame("joe1/idle");		// All the frames and their timing info
		idleAnim.SetDurationInSeconds(1.0);				// Set how long one loop takes (in seconds)
	}
	else if (this.itemHeld === 1)
	{
		idleAnim.sendPosition = false;
		idleAnim.HoldFrame("joe0/idle_coffee1",20);
		idleAnim.AddFrame( "joe0/idle_coffee2");
		idleAnim.AddFrame( "joe0/idle_coffee3");
		idleAnim.AddFrame( "joe0/idle_coffee4");
		idleAnim.AddFrame( "joe0/idle_coffee3");
		idleAnim.AddFrame( "joe0/idle_coffee2");
		idleAnim.SetDurationInSeconds(4.0);
	}
	else if (this.itemHeld === 2)
	{
		idleAnim.sendPosition = false;
		idleAnim.AddFrame("joe0/idle_phone1");
		idleAnim.AddFrame("joe0/idle_phone2");
		idleAnim.AddFrame("joe0/idle_phone3");
		idleAnim.SetDurationInSeconds(0.7);
	}
	
	var idleState = new AnimationState();
	idleState.SetMainAnimation(idleAnim);
	this.animationModel.AddState("idle",idleState);
	
	var anim = new Animation(this);
	anim.repeat = 1;						// This animation loops
	anim.inheritFacing = 1;					// It inherits the player's facing property
	if (this.itemHeld === 0)
		anim.AddSequentialFrames("joe1/waitcheering{0}",1,4);
	else if (this.itemHeld === 1)
		anim.AddSequentialFrames("joe1/waitcoffee{0}",1,5);
	else if (this.itemHeld === 2)
		anim.AddSequentialFrames("joe1/waitcell{0}",1,5);
	anim.SetDurationInSeconds(0.7);
	var animState = new AnimationState();
	animState.SetMainAnimation(anim);
	this.animationModel.AddState("cheering",animState);
	
	var cowerAnim = new Animation(this);
	cowerAnim.repeat = 1;						// This animation loops
	cowerAnim.inheritFacing = 1;					// It inherits the player's facing property
	cowerAnim.AddFrame("joe0/cower1");
	cowerAnim.AddFrame("joe0/cower2");
	cowerAnim.SetDurationInSeconds(0.2);
	var cowerState = new AnimationState();
	cowerState.SetMainAnimation(cowerAnim);
	this.animationModel.AddState("cower",cowerState);
	
	var boneridleAnim = new Animation(this);
	boneridleAnim.repeat = 1;						// This animation loops
	boneridleAnim.inheritFacing = 1;					// It inherits the player's facing property
	boneridleAnim.AddFrame("joe1/idle");
	boneridleAnim.SetDurationInSeconds(1.0);
	var boneridleState = new AnimationState();
	boneridleState.SetMainAnimation(boneridleAnim);
	this.animationModel.AddState("regularidle",boneridleState);
	
	this.coffeeCupAnim = new Animation(this);
	this.coffeeCupAnim.repeat = 0;
	this.coffeeCupAnim.inheritFacing = 1;
	this.coffeeCupAnim.AddSequentialFrames("props/coffee{0}",1,12);
	this.coffeeCupAnim.SetDurationInSeconds(1.0);
	
	this.phoneAnim = new Animation(this);
	this.phoneAnim.repeat = 0;
	this.phoneAnim.inheritFacing = 1;
	this.phoneAnim.AddSequentialFrames("props/phone{0}",1,6);
	this.phoneAnim.SetDurationInSeconds(1.0);
};

Joe0.prototype.Kiss = function(posX,posY,posZ, isLeft)
{	
	// Replace self with kissing effectanimation
	var selfKissAnim, otherKissAnim;
	if (isLeft)
		selfKissAnim = new EffectAnimation(this.hornyKissLeftAnim, null, false);
	else
		selfKissAnim = new EffectAnimation(this.hornyKissRightAnim, null, false);
	
	// Place the kiss animation properly
	selfKissAnim.posX = posX;
	selfKissAnim.posY = posY;
	//selfKissAnim.spriteCenterX = 70;
	//selfKissAnim.spriteCenterY = 148;
	if (!isLeft)
		selfKissAnim.orderBonus=0;
	
	// Also plant a smoke explosion for when the effect animation dies
	var smoke = new SmokeExplosion(posX,posY,posZ,200,200,1.0);
	
	this.corrupted = true;
	smoke.TransferOrbs(this);
	
	smoke.deathTriggerEntity = selfKissAnim;
	
	// Spawn in all the new entities
	level.entities.AddEffect(selfKissAnim);
	level.entities.AddEffect(smoke);
	
	// Kill self
	this.Die();
};

Joe0.prototype.ChangeAlliance = function(newAlliance)
{
	this.alliance = newAlliance;
};

Joe0.prototype.Capture = function(captor)
{
	var captured = EntityCapture.call(this,captor);
	
	//if (captured !== null)
	//{
	//	if (this.state !== States.CorruptPrepareBeforeSex)
	//	{
	//		this.grabbedSFX.Play(1.0);
	//	}
	//}
	
	return captured;
};

Joe0.prototype.WatchSex = function(frames)
{
	// If we are holding an item, drop it
	if (!this.watchingSex && !this.recruited)
		this.dropItem(4,0,false);
		
	EntityWatchSex.call(this,frames);
};

Joe0.prototype.DoneWatchingSex = function()
{
	// If we are recruited, don't lose the boner
	if (!this.recruited)
		this.ChangeState(States.LoseBoner);
		
	EntityDoneWatchingSex.call(this);
};

// Boilerplate Entity Code
Joe0.prototype.Init = EntityInit;
Joe0.prototype.ChangeState = EntityChangeState;
Joe0.prototype.ChangeStateOnAttackComplete = EntityChangeStateOnAttackComplete;
Joe0.prototype.Speed = EntitySpeed;
Joe0.prototype.Kill = EntityKill;
Joe0.prototype.ReleaseOrbs = EntityReleaseOrbs;
Joe0.prototype.Die = EntityDie;
Joe0.prototype.CancelAttack = EntityCancelAttack;
Joe0.prototype.Respawn = EntityRespawn;		
Joe0.prototype.GetGroundFriction = EntityGetGroundFriction;
// Joe0.prototype.DrawSprite = EntityDrawSprite;		// Overridden
Joe0.prototype.Draw = EntityDraw;
Joe0.prototype.ProcessDirectionalInput = EntityProcessDirectionalInput;
//Joe0.prototype.UpdateState = EntityUpdateState;	// Overridden
Joe0.prototype.Update = EntityUpdate;
Joe0.prototype.Push = EntityPush;
Joe0.prototype.Hit = EntityHit;
//Joe0.prototype.Capture = EntityCapture;
Joe0.prototype.Release = EntityRelease;
//Joe0.prototype.ChangeAlliance = EntityChangeAlliance;
Joe0.prototype.NotifyDamageDealt = EntityNotifyDamageDealt;
Joe0.prototype.CollisionDetection = EntityCollisionDetection;
//Joe0.prototype.WatchSex = EntityWatchSex;
//Joe0.prototype.DoneWatchingSex = EntityDoneWatchingSex;
Joe0.prototype.OnRemovalFromGame = EntityOnRemovalFromGame;