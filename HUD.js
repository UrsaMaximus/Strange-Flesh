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

// Load all the images associated with the HUD.
GlobalResourceLoader.AddImageResource("domination_bar_reflection","images/menus/domination_bar_reflection.png");
GlobalResourceLoader.AddImageResource("domination_bar","images/menus/domination_bar.png");
GlobalResourceLoader.AddImageResource("domination_bar_filled","images/menus/domination_bar_filled.png");
GlobalResourceLoader.AddImageResource("domination_bar_symbol","images/menus/domination_bar_symbol.png");
GlobalResourceLoader.AddImageResource("corruption_bar_symbol","images/menus/corruption_bar_symbol.png");
GlobalResourceLoader.AddImageResource("corruption_bar_reflection","images/menus/corruption_bar_reflection.png");
GlobalResourceLoader.AddImageResource("corruption_bar_filled","images/menus/corruption_bar_filled.png");
GlobalResourceLoader.AddImageResource("corruption_bar","images/menus/corruption_bar.png");
GlobalResourceLoader.AddImageResource("sex_bar_symbol","images/menus/sex_bar_symbol.png");
GlobalResourceLoader.AddImageResource("sex_bar_filled","images/menus/sex_bar_filled.png");
GlobalResourceLoader.AddImageResource("sex_bar","images/menus/sex_bar.png");
GlobalResourceLoader.AddImageResource("health_bar_symbol","images/menus/health_bar_symbol.png");
GlobalResourceLoader.AddImageResource("health_bar_reflection","images/menus/health_bar_reflection.png");
GlobalResourceLoader.AddImageResource("health_bar_filled","images/menus/health_bar_filled.png");
GlobalResourceLoader.AddImageResource("health_bar","images/menus/health_bar.png");
GlobalResourceLoader.AddImageResource("life_symbol","images/menus/life_symbol.png");
GlobalResourceLoader.AddImageResource("life_symbol_lit","images/menus/life_symbol_lit.png");
GlobalResourceLoader.AddImageResource("sheet_Smoke_Puff","images/smoke/sheet_Smoke_Puff.txt");

function HUD(owner)
{
	// Get image references from the loader
	this.dominationBarReflectionImage = GlobalResourceLoader.GetSprite("domination_bar_reflection");
	this.dominationBarImage = GlobalResourceLoader.GetSprite("domination_bar");
	this.dominationBarFilledImage = GlobalResourceLoader.GetSprite("domination_bar_filled");
	this.dominationBarSymbolImage = GlobalResourceLoader.GetSprite("domination_bar_symbol");
	
	this.corruptionBarSymbolImage = GlobalResourceLoader.GetSprite("corruption_bar_symbol");
	this.corruptionBarReflectionImage = GlobalResourceLoader.GetSprite("corruption_bar_reflection");
	this.corruptionBarFilledImage = GlobalResourceLoader.GetSprite("corruption_bar_filled");
	this.corruptionBarImage = GlobalResourceLoader.GetSprite("corruption_bar");
	
	this.sexBarSymbolImage = GlobalResourceLoader.GetSprite("sex_bar_symbol");
	this.sexBarFilledImage = GlobalResourceLoader.GetSprite("sex_bar_filled");
	this.sexBarImage = GlobalResourceLoader.GetSprite("sex_bar");
	
	this.healthBarSymbolImage = GlobalResourceLoader.GetSprite("health_bar_symbol");
	this.healthBarReflectionImage = GlobalResourceLoader.GetSprite("health_bar_reflection");
	this.healthBarFilledImage = GlobalResourceLoader.GetSprite("health_bar_filled");
	this.healthBarImage = GlobalResourceLoader.GetSprite("health_bar");
	
	this.lifeSymbol = GlobalResourceLoader.GetSprite("life_symbol");
	this.lifeSymbolLit = GlobalResourceLoader.GetSprite("life_symbol_lit");
	
	this.playerHealthFraction = 0;
	this.dominationFraction = 0;
	this.corruptionFraction = 0;
	this.sexFraction = 0;
	this.animationCycle = 0;
	
	this.hudMessage = [];
	this.hudMessageDisplayTime = 360;
	this.hudMessageTimer = 0;
	
	this.lives = 0;
	this.lifeSmokePuffs = [];
	this.enableLifeDisplay = false;
	
	// Create the smoke puff animation for use by the HUD
	this.puff = new Animation(this);
	this.puff.repeat = 0;
	this.puff.AddSequentialFrames("smoke/puff{0}",1,8);
	this.puff.AddBlankFrame();
	this.puff.SetDurationInSeconds(1.0);
	
	this.updateRate = (1/120);
	this.sexReadyPulse = 0;
	
	this.hudHidden = false;
	this.hudAlpha = 0;
	
	//// Create a new canvas, 640x360
	//this.internalCanvas = document.createElement("canvas");
	//this.internalCanvas.width = 640;
	//this.internalCanvas.height = 360;
	//
	//// Make sure blurring is off
	//this.ctx = this.internalCanvas.getContext("2d");
	//this.ctx.imageSmoothingEnabled = false;
	//this.ctx.webkitImageSmoothingEnabled = false;
	//this.ctx.mozImageSmoothingEnabled = false;
	
	this.orbs = [];
	
	// State
	this.enabled = true;
};

HUD.prototype.Reset = function()
{
	this.playerHealthFraction = 0;
	this.dominationFraction = 0;
	this.corruptionFraction = 0;
	this.sexFraction = 0;
	this.animationCycle = 0;
	
	this.hudMessage = [];
	this.hudMessageDisplayTime = 360;
	this.hudMessageTimer = 0;
	
	this.lives = 0;
	this.lifeSmokePuffs = [];
	this.enableLifeDisplay = false;
	
	this.hudAlpha = 0;
	this.hudHidden = false;
}

HUD.prototype.Draw = function()
{
if (this.enabled)
{
		// Basically draw over everything
		// Store the current transformation matrix
		ctx.save();
	
		var ratioTo1080p =  c.height / 1080.0;
		
		// Arrange drawing so that we are in a frame that is 1920x1080 with the origin
		// on the upper right
		ctx.setTransform(ratioTo1080p, 0, 0, ratioTo1080p, 0, 0);
		
		// Layout the bars
		var healthBarPosX = 8;
		var healthBarPosY = 8;
	
		var sexBarPosX = 41;
		var sexBarPosY = 62;
	
		var corruptionBarPosX = 1920 - this.corruptionBarImage.width * pxScale - 8;
		var corruptionBarPosY = 8;
	
		var dominationBarPosX = 1920 - this.dominationBarImage.width * pxScale - 8;
		var dominationBarPosY = 62;
		
		ctx.globalAlpha = this.hudAlpha;
	
		// Draw the background of the bars
		ctx.globalCompositeOperation = "screen";
		this.healthBarImage.DrawSprite3x( healthBarPosX, healthBarPosY);
		this.sexBarImage.DrawSprite3x( sexBarPosX , sexBarPosY);
		this.corruptionBarImage.DrawSprite3x(corruptionBarPosX, corruptionBarPosY);
		this.dominationBarImage.DrawSprite3x(dominationBarPosX, dominationBarPosY);
		ctx.globalCompositeOperation = "source-over";
	
		// Draw the filled bars
		var healthWidth = Math.round(this.playerHealthFraction * this.healthBarFilledImage.width);
		var sexWidth = Math.round(this.sexFraction * this.sexBarFilledImage.width);
		var corruptionWidth = Math.round(this.corruptionFraction * this.corruptionBarFilledImage.width);
		var dominationWidth = Math.round(this.dominationFraction * this.dominationBarFilledImage.width);
	
		if (healthWidth > 0)
		{
			this.healthBarFilledImage.Draw( 
						0,
						0, 
						healthWidth, 
						this.healthBarFilledImage.height, 
						healthBarPosX + 1 * pxScale, 
						healthBarPosY + 1 * pxScale, 
						healthWidth * pxScale, 
						this.healthBarFilledImage.height * pxScale
					  );
		}
			
		if (sexWidth > 0)
		{	  
			this.sexBarFilledImage.Draw(	
							0,
							0, 
							sexWidth, 
							this.sexBarFilledImage.height,  
							sexBarPosX + 1 * pxScale, 
							sexBarPosY + 1 * pxScale, 
							sexWidth * pxScale, 
							this.sexBarFilledImage.height * pxScale
						  );
		}	  
		if (corruptionWidth > 0)
		{
			this.corruptionBarFilledImage.Draw(
							this.corruptionBarFilledImage.width - corruptionWidth, 
							0, 
							corruptionWidth,
							this.corruptionBarFilledImage.height, 
							corruptionBarPosX + (this.corruptionBarFilledImage.width - corruptionWidth + 1) * pxScale,
							corruptionBarPosY + 1 * pxScale, 
							corruptionWidth * pxScale, 
							this.corruptionBarFilledImage.height * pxScale
						);
			if (this.corruptionFraction === 1.0)
			{
				ctx.globalCompositeOperation = "screen";
				ctx.globalAlpha = this.hudAlpha * (Math.sin(this.animationCycle) + 1.0) / 2.0;
				this.corruptionBarFilledImage.Draw(
							this.corruptionBarFilledImage.width - corruptionWidth, 
							0, 
							corruptionWidth,
							this.corruptionBarFilledImage.height, 
							corruptionBarPosX + (this.corruptionBarFilledImage.width - corruptionWidth + 1) * pxScale,
							corruptionBarPosY + 1 * pxScale, 
							corruptionWidth * pxScale, 
							this.corruptionBarFilledImage.height * pxScale
						);
				ctx.globalCompositeOperation = "source-over";
				ctx.globalAlpha = this.hudAlpha;
			}
		}		
		if (dominationWidth > 0)
		{
			this.dominationBarFilledImage.Draw(	
							this.dominationBarFilledImage.width - dominationWidth, 
							0, 
							dominationWidth,
							this.dominationBarFilledImage.height, 
							dominationBarPosX + (this.dominationBarFilledImage.width - dominationWidth + 1) * pxScale,
							dominationBarPosY + 1 * pxScale, 
							dominationWidth * pxScale, 
							this.dominationBarFilledImage.height * pxScale
						);
						
			if (this.dominationFraction === 1.0)
			{
				ctx.globalCompositeOperation = "screen";
				ctx.globalAlpha = this.hudAlpha * (Math.sin(this.animationCycle) + 1.0) / 2.0;
				this.dominationBarFilledImage.Draw(	
							this.dominationBarFilledImage.width - dominationWidth, 
							0, 
							dominationWidth,
							this.dominationBarFilledImage.height, 
							dominationBarPosX + (this.dominationBarFilledImage.width - dominationWidth + 1) * pxScale,
							dominationBarPosY + 1 * pxScale, 
							dominationWidth * pxScale, 
							this.dominationBarFilledImage.height * pxScale
						);
				ctx.globalCompositeOperation = "source-over";
				ctx.globalAlpha = this.hudAlpha;
			}
    	
		}
		// Draw the icons
		this.healthBarSymbolImage.DrawSprite3x( healthBarPosX + 9,  healthBarPosY + 9);
		this.sexBarSymbolImage.DrawSprite3x( sexBarPosX + (this.sexBarImage.width - this.sexBarSymbolImage.width - 8) * 3.0, sexBarPosY + 6);
		this.corruptionBarSymbolImage.DrawSprite3x( corruptionBarPosX-this.corruptionBarSymbolImage.width * 3.0 - 6, corruptionBarPosY + 3);
		this.dominationBarSymbolImage.DrawSprite3x( dominationBarPosX-this.dominationBarSymbolImage.width * 3.0 - 6, dominationBarPosY + 3);
	
		// Draw reflections
		ctx.globalCompositeOperation = "screen";
		this.healthBarReflectionImage.DrawSprite3x(healthBarPosX + 6, healthBarPosY + 6);
		this.corruptionBarReflectionImage.DrawSprite3x(ctx ,corruptionBarPosX + 6,corruptionBarPosY + 3);
		this.dominationBarReflectionImage.DrawSprite3x(dominationBarPosX + 6,dominationBarPosY + 3);
		ctx.globalCompositeOperation = "source-over";
	
		if (this.enableLifeDisplay)
		{
			// Draw the lives
			for (var i = 0; i < this.lives; i++)
			{
				if (i === this.lives - 1)
				{
					this.lifeSymbolLit.DrawSprite3x( 20 * 3.0 + i * 80 - 21, 50 * 3.0 - 21);
				}
				else
				{
					this.lifeSymbol.DrawSprite3x( 20 * 3.0 + i * 80 - 21, 50 * 3.0 - 21);
				}
			}
	
			ctx.globalCompositeOperation = "lighter";
			for (var i = 0; i < this.lifeSmokePuffs.length; i++)
			{
				var frame = this.lifeSmokePuffs[i].animation.GetFrame();
				if (frame !== null)
				{
					frame.DrawSprite3x( this.lifeSmokePuffs[i].posX, this.lifeSmokePuffs[i].posY);
				}
			}
			ctx.globalCompositeOperation = "source-over";
		}
		
    	
    	//Finally, on top of everything else, draw the orbs.
    	ctx.globalAlpha = 1.0;
    	for (var i = 0; i < this.orbs.length; i++)
		{
			this.orbs[i].Draw();
		}
		ctx.globalAlpha = 1.0;
		
		if (this.hudMessageTimer > 0 && this.hudMessage.length > 0)
		{
			if (this.hudMessageTimer > this.hudMessageDisplayTime)
				sstext.alpha = linearRemap(this.hudMessageTimer,this.hudMessageDisplayTime+60, this.hudMessageDisplayTime, 0, 1);
			else if (this.hudMessageTimer <= 60)
				sstext.alpha = linearRemap(this.hudMessageTimer,0, 60, 0, 1);
			else
				sstext.alpha = 1.0;
			
    		sstext.textAlign = "center";
    		sstext.textBaseline = "middle";
    		sstext.fontSize = 30;
    		
    		for (var i=0; i < this.hudMessage.length; i++)
    		{
    			sstext.DrawTextWithShadow(this.hudMessage[i],320,87+i*33);
    		}
		}
		
		ctx.globalAlpha = this.hudAlpha;
		if (this.sexReadyPulse > 0)
    	{
    		ctx.globalCompositeOperation = "screen";
    		var scale = linearRemap(this.sexReadyPulse, 60, 40, 1.0, 2.0);
    		var scaleWidth = sexWidth * scale;
    		var scaleHeight = this.sexBarFilledImage.height * scale;
    		ctx.globalAlpha = linearRemap(this.sexReadyPulse, 50, 40, 0.6, 0);
			this.sexBarFilledImage.Draw(	
				0,
				0, 
				sexWidth, 
				this.sexBarFilledImage.height,  
				(sexBarPosX + 3) - (scaleWidth - sexWidth) / 2.0 * pxScale, 
				sexBarPosY + 3 - (scaleHeight - this.sexBarFilledImage.height) / 2.0 * pxScale, 
				scaleWidth * pxScale, 
				scaleHeight * pxScale
			  );
			  ctx.globalCompositeOperation = "source-over";
    	}
    	
    	 ctx.globalAlpha = 1.0;
		
    	ctx.restore();
	}
};

HUD.prototype.DisplayMessage = function(message)
{
	this.hudMessage = message.split(";");
	this.hudMessageTimer = this.hudMessageDisplayTime + 120;
};

HUD.prototype.CollectOrb = function(orb)
{
	// Mark the orb as collected
	orb.collected = true;
	
	// Remove the orb from the level
	//level.entities.Remove(orb); // VERY BAD NO. BAD.
	orb.state = States.Dead;	// YES GOOD DO THIS.
	
	// "Flatten" the orb's position from 3D to 2D
	orb.posY -= orb.posZ;
	orb.velY -= orb.velZ;
	orb.posZ = 0;
	orb.velZ = 0;
	
	// Translate the orb's position to HUD coordinates
	var newPos = camera.matrix.mapPointFromLocalToWorld({x:orb.posX,y:orb.posY});
	orb.posX = linearRemap(newPos.x, 0, c.width, 0, 1920);
	orb.posY = linearRemap(newPos.y, 0, c.height, 0, 1080);
	
	// Set the orb's destination
	if (orb.kind === ORB_HEALTH)
	{
		var healthWidth = Math.round(this.playerHealthFraction * this.healthBarFilledImage.width);
		orb.destX = 32 + healthWidth * pxScale;
		orb.destY = 32;    	
	}
	else if (orb.kind === ORB_DOMINATE)
	{
		var dominationWidth = Math.round(this.dominationFraction * this.dominationBarFilledImage.width);
		orb.destX = 1908 - dominationWidth * pxScale;
		orb.destY = 87;
	}
	else if (orb.kind === ORB_CORRUPT)
	{
		var corruptionWidth = Math.round(this.corruptionFraction * this.corruptionBarFilledImage.width);
		orb.destX = 1908 - corruptionWidth * pxScale;
		orb.destY = 32;
	}
	else if (orb.kind === ORB_LIFE)
	{
		orb.destX = 20 * pxScale + (lives+1) * 80;
		orb.destY = 50 * pxScale;
	}
	
	// Play the orb's collection SFX
	orb.pickupSFX.Play(0.5);
	
	this.orbs.push(orb);
};

HUD.prototype.Update = function()
{
	this.animationCycle = normalizeAngle(this.animationCycle+0.1);
	
	if (this.sexReadyPulse > 0)
		this.sexReadyPulse -= 1;
	
	if (this.orbs.length !== 0)
		this.hudAlpha = crawlValue(this.hudAlpha, 1.0, 0.3);
	else if (this.hudHidden || level.levelName === "level0")
		this.hudAlpha = crawlValue(this.hudAlpha, 0.0, this.updateRate / 2.5);
	else
		this.hudAlpha = crawlValue(this.hudAlpha, 1.0, this.updateRate)
	
	for (var i = 0; i < this.orbs.length; i++)
	{
		// If the orb has arrived at its destination, remove it
		if (this.orbs[i].state === States.Dying)
		{
			this.orbs.splice(i,1);
			i -= 1;
		}
		else
		{
			// Update the position
			this.orbs[i].Update();
		}
	}
	
	for (var i = 0; i < this.lifeSmokePuffs.length; i++)
	{
		this.lifeSmokePuffs[i].animation.Update();
		if (this.lifeSmokePuffs[i].animation.done)
		{
			this.lifeSmokePuffs.splice(i,1);
			i--;			
		}
	}
	
	if (this.enableLifeDisplay && lives !== this.lives)
	{
		// Draw a smoke puff over each changed value
		
		var start = lives;
		var end = this.lives;
		if (lives > this.lives)
		{
			start = this.lives;
			end = lives;
		}
		
		for (var i = start; i < end; i++)
		{
			var puff = {
							"animation": this.puff.Clone(),
							"posX": (20 * pxScale + i * 80),
							"posY": (50 * pxScale )
					   };
			
			this.lifeSmokePuffs.push(puff);
		}
		
		this.lives = lives;
	}
	
	if (this.hudMessageTimer > 0)
	{
		this.hudMessageTimer -= 1;
	}
	
	if (this.enabled)
	{
		var te = Math.floor(totalEnemies * 0.45);
		this.playerHealthFraction = crawlValue(this.playerHealthFraction, normalizeValue(player.health, 0, player.maxHealth), this.updateRate);
    	this.dominationFraction = crawlValue(this.dominationFraction, normalizeValue(enemiesDispatched, 0, te), this.updateRate);
    	this.corruptionFraction = crawlValue(this.corruptionFraction, normalizeValue(enemiesCorrupted, 0, te), this.updateRate);
    	this.sexFraction = crawlValue(this.sexFraction, normalizeValue(player.sexMeter, 0, player.maxSexMeter), this.updateRate*0.5);
	}
};

HUD.prototype.ShowHud = function()
{
	this.hudHidden = false;
}

HUD.prototype.HideHud = function()
{
	this.hudHidden = true;
}

HUD.prototype.EntityReadyForSex = function()
{
	if (player != null && player.sexMeter >= player.maxSexMeter)
	{
		if (this.sexReadyPulse === 0)
		{
			this.sexReadyPulse = 60;
		}
	}
};