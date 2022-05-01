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

include("SupersampledTextRenderer.js");

// All the images associated with the Menu.
GlobalResourceLoader.AddImageResource("mainmenu","images/menus/mainmenu.png");
GlobalResourceLoader.AddImageResource("mainmenu_pulse","images/menus/mainmenu_pulse.png");
GlobalResourceLoader.AddImageResource("mainmenu_logo","images/menus/mainmenu_logo.png");
GlobalResourceLoader.AddImageResource("mainmenu_logo_small","images/menus/logo_med.png");
GlobalResourceLoader.AddImageResource("mainmenu_logo_pulse","images/menus/mainmenu_logo_pulse.png");
GlobalResourceLoader.AddImageResource("mainmenu_logo_small_pulse","images/menus/logo_med_pulse.png");
GlobalResourceLoader.AddSequentialImageResources("mainmenu_smoke{0}","images/menus/mainmenu_smoke{0}.png",1,8);
GlobalResourceLoader.AddImageResource("sheet_OrcSpeaker","images/joe5/sheet_OrcSpeaker.txt");

GlobalResourceLoader.AddAudioResource("menu_boop","sound/menu/menu_boop.mp3");
GlobalResourceLoader.AddAudioResource("text_click","sound/menu/text_click.mp3");

function MainMenu()
{
	this.logoY = 142;
		
	this.activateSound = GlobalResourceLoader.GetSound("menu_boop");
	this.activateSound.allowOverlap = true;

		
	this.backgroundSmoke = new SmokeVolume();
	this.backgroundSmoke.locationXMin = 67;
	this.backgroundSmoke.locationXMax = 550;
	this.backgroundSmoke.locationYMin = this.logoY - 6;
	this.backgroundSmoke.locationYMax = this.logoY + 6;
	this.backgroundSmoke.velocityXMin = -0.2;
	this.backgroundSmoke.velocityXMax = 0.2;
	this.backgroundSmoke.velocityYMin = -0.5;
	this.backgroundSmoke.velocityYMax = 0.2;
	this.backgroundSmoke.velocityRMin = -0.001;
	this.backgroundSmoke.velocityRMax = 0.001;
	this.backgroundSmoke.lifespanMin = 200;
	this.backgroundSmoke.lifespanMax = 600;
	this.backgroundSmoke.killDistance = 0;
	this.backgroundSmoke.scaleMin = 1;
	this.backgroundSmoke.scaleMax = 3;
	this.backgroundSmoke.darkSmokeProportion = 0;
	this.backgroundSmoke.maxChildren = 50;
	
	this.image = GlobalResourceLoader.GetSprite("mainmenu");
	this.image_pulse = GlobalResourceLoader.GetSprite("mainmenu_pulse");
	this.logo = GlobalResourceLoader.GetSprite("mainmenu_logo");
	this.logo_pulse = GlobalResourceLoader.GetSprite("mainmenu_logo_pulse");
	this.logoSmall = GlobalResourceLoader.GetSprite("mainmenu_logo_small");
	this.logoSmall_pulse = GlobalResourceLoader.GetSprite("mainmenu_logo_small_pulse");
	
	this.menuTimer = 0;
	this.menuMode = false;
	
	//if (settings.gameBeaten)
	//{
	//   this.triggerSpeakerTime = -1;
	//   this.spriteAnim = new Animation(null);
	//   this.spriteAnim.AddSequentialFrames("orcspeaker/orcspeaker_{0}",1,14);
	//   this.spriteAnim.SetDurationByFramerate(30);
	//   this.spriteAnim.repeat = 1;
	//   this.spriteAnim.loopStartPosition = 12/14;
	//}
	//else
	//{
		this.spriteAnim = new Animation(this,"mainmenu_smoke{0}",8,1.0);
	//}
	
	this.oneshotPulse = 0;
	this.pulsedOnce = false;
	this.pulse = Math.PI / 2.0;
	this.lastAudioCheck = 0;
	this.timer = 0;
	this.closing = false;
	
	this.selectedItem = 0;
	
	var menu = this;
	this.items = [	
					{ "element":"button", "label":"New Game", "onClick":function()
						{ 
							GlobalMusic.stop(1.0);
							menu.closing = true;
						} 
					},
					{ "element":"button", "label":"Settings", "onClick":function()
						{ 
							ShowSettingsMenu(false);
						} 
					},
					{ "element":"button", "label":"Controls", "onClick":function()
						{ 
							ShowControlsMenu();
						} 
					},
					{ "element":"button", "label":"Exit", "onClick":function()
						{ 
							 saveSettings();
							if (typeof(app)!=='undefined')
							{	
								 
								  app.quit()
							}
							else
							 {
							 	GlobalMusic.stop(0.25);
								DismissAllMenus();
								resetGame();
							 }
						} 
					}
				];
	
	if (enableDebug || devDebug || (settings.gameBeatenDomination && settings.gameBeatenCorruption && settings.gameBeatenWithoutSaves))
	{
		var debugMenu = { "element":"button", "label":"Debug", "onClick":function()
							{ 
								ShowDevelopmentMenu();
							} 
						};
		this.items.splice(3, 0, debugMenu);
	}
	
	if (enableDebug || devDebug || (settings.gameBeatenDomination || settings.gameBeatenCorruption || settings.gameBeatenWithoutSaves))
	{
		var galleryMenu = { "element":"button", "label":"Gallery", "onClick":function()
						{ 
							ShowGalleryMenu();
						} 
					};
		this.items.splice(3, 0, galleryMenu);
	}
	
	
	if (savedGameExists())
	{
		var resumeItem = { "element":"button", "label":"Resume Game", "onClick":function()
							{ 
								// Clear all menus below this one
								DismissAllMenus();
								menuStack.push(menu);
								
								// Stop the music and close this menu
								GlobalMusic.stop(1.0);
								menu.closing = true;
								
								// Load the game
								loadGame();
							} 
						};
		this.items.splice(0, 0, resumeItem);
	}
	
};

MainMenu.prototype.Show = function()
{
	this.fadeAlpha = 1;
	
	if (!GlobalMusic.playing)
	{
		GlobalMusic.setVolume(settings.musicLevelGameplay, 0.25);
		GlobalMusic.setTrack("title");
		GlobalMusic.play(0.5);
	}
	
	for (var j=0; j < this.backgroundSmoke.lifespanMax*2; j++)
	{
		this.backgroundSmoke.Update();
		for (var i = 0; i < this.backgroundSmoke.children.length; i++)
		{
			this.backgroundSmoke.children[i].Update();
		}
	}
	
	menuStack.push(this);
}

MainMenu.prototype.Draw = function()
{
	// Basically draw over everything
	// Store the current transformation matrix
	ctx.save();
	var ratioTo360p =  c.height / 360.0;
	// Arrange drawing so that we are in a frame that is 640x360 with the origin
	// on the upper right
	ctx.setTransform(ratioTo360p, 0, 0, ratioTo360p, 0, 0);
	ctx.globalAlpha = 1.0;
	
	// Draw the background
	ctx.fillStyle = "#000011";
	ctx.fillRect(0,0,640,360);
	
	
	var menuAnim = linearToSigmoidRemap(this.menuTimer,0,60);
	var bartenderPos = menuAnim * -100;
	var logoPos = menuAnim * -100;
	
	this.image.Draw( bartenderPos , 0, 640, 360);
	var frame = this.spriteAnim.GetFrame();
	if (frame !== null)
		frame.Draw( 320-frame.width/2 + bartenderPos, 0, frame.width, frame.height);
	
	if (this.menuTimer)
	{
		this.backgroundSmoke.locationXMin = linearRemap(menuAnim,0,1,66,44);
		this.backgroundSmoke.locationXMax = linearRemap(menuAnim,0,1,550,355);
		this.backgroundSmoke.locationYMin =  linearRemap(menuAnim,0,1,this.logoY - 6,90);
		this.backgroundSmoke.locationYMax = linearRemap(menuAnim,0,1,this.logoY + 6,138);
	}
	
	for (var i = 0; i < this.backgroundSmoke.children.length; i++)
	{
		this.backgroundSmoke.children[i].Draw();
	}
	
	if (this.menuTimer > 35)
	{
	    this.logoSmall.Draw(  linearRemap(menuAnim,0,1,50, 30), 
							  linearRemap(menuAnim,0,1,13, 26), 
							  linearRemap(menuAnim,0,1,526, 352),
							  linearRemap(menuAnim,0,1,180, 121));
		
	}
	else
	{
		this.logo.Draw(          linearRemap(menuAnim,0,1, 0, -4) , 
								 linearRemap(menuAnim,0,1, 0, 17) , 
								 linearRemap(menuAnim,0,1, 640, 427), 
								 linearRemap(menuAnim,0,1, 360, 240) );
	}
	

	if (this.oneshotPulse > 0)
	{
		ctx.globalAlpha = normalizeValue(this.oneshotPulse, 0, 20);
		ctx.globalCompositeOperation = "screen";
		this.image_pulse.Draw( bartenderPos , 0, 640, 360);
		if (this.menuTimer)
		{
		   this.logoSmall_pulse.Draw( linearRemap(menuAnim,0,1,50, 30), 
							  linearRemap(menuAnim,0,1,13, 26), 
							  linearRemap(menuAnim,0,1,526, 352),
							  linearRemap(menuAnim,0,1,180, 121));
		}
		else
		{
		   this.logo_pulse.Draw( linearRemap(menuAnim,0,1, 0, -4) , 
								 linearRemap(menuAnim,0,1, 0, 17) , 
								 linearRemap(menuAnim,0,1, 640, 427), 
								 linearRemap(menuAnim,0,1, 360, 240) );
		}
		ctx.globalCompositeOperation = "source-over";
		ctx.globalAlpha = 1.0;
	}
	
	sstext.textBaseline = "top";
	sstext.textAlign = "right";
	sstext.fillStyle = "#FFF";
	sstext.alpha = 0.5;
	
	sstext.DrawText("v1.5", linearRemap(menuAnim,0,1,557,367), linearRemap(menuAnim,0,1,193,145), 16);
	
	// And finally the press any key pulsing message
	if (this.menuMode)
	{
		var alpha = normalizeValue(this.menuTimer,0,60);
		var xPosition = linearRemap(menuAnim,0,1,830,600);
		var yPosition = Math.round((360 - ((this.items.length-1) * 40)) / 2.0);
		
		for (var i=0; i < this.items.length; i++)
		{ 		
			if (this.items[i].element === "spacer")
			{
				yPosition += this.items[i].size/2;
				
				if (this.items[i].hasOwnProperty("text"))
				{
					sstext.DrawText(this.items[i].text, xPosition, yPosition, 20, "#AAA", 1.0, "center");
				}
				
				yPosition += this.items[i].size/2;

			}
			else if (this.items[i].element === "button")
			{	
				var txtAlpha = 1.0;
				if ( i === this.selectedItem)
				{
					if (this.pulsedOnce)
						txtAlpha = alpha * (0.6 + 0.4 * normalizeValue(this.oneshotPulse, 0, 20));
					else
						txtAlpha = alpha * (0.6 + 0.4 * Math.cos(this.pulse));
				}
				else
				{
					txtAlpha = alpha * 0.4;
				}
								//(text, x, y, fontSize, fillStyle, alpha, textAlign, textBaseline)
				sstext.DrawText(this.items[i].label, xPosition, yPosition, 26,  "#FFFFFF", txtAlpha, "right");
				
				yPosition += 40;
			}
    	}
	}
	else if (this.pulsedOnce)
	{
		sstext.DrawText("Press Any Key", 566, 316, 20, "#FFF", 0.6 + 0.4 * normalizeValue(this.oneshotPulse, 0, 20), "right");
	}
	
	// This forces a copy to display buffer operation, which allows subsequent draw calls to paint over supersampled text
	blitInternalBuffer();
	
	// Fade out
	ctx.globalAlpha = 1-normalizeValue(this.timer, 0, 60);
	ctx.fillStyle = "#000000";
	ctx.fillRect(0,0,640,360);
	ctx.globalAlpha = 1.0;
	ctx.restore();
};

MainMenu.prototype.Update = function()
{
	this.pulse = normalizeAngle(this.pulse + 0.05);
	
	//if (settings.gameBeaten)
	//{
	//	// If the trigger speaker time is -1, then calculate when it should actually be
	//	if (this.triggerSpeakerTime === -1)
	//	{
	//		if (GlobalMusic.lastQueuedTrack !== null && GlobalMusic.lastQueuedTrack.trackName === "title" && GlobalMusic.lastQueuedTrack.segmentName === "titletheme_intro")
	//		{
	//			this.triggerSpeakerTime = GlobalMusic.lastQueuedTrack.startTime + 9.3;
	//		}
	//	}
	//	if (audioContext.currentTime > this.triggerSpeakerTime)
	//		this.spriteAnim.Update();
	//}
	//else
	//{
		this.spriteAnim.Update();
		
		if (this.oneshotPulse > 0)
			this.oneshotPulse--;
		
		// If we aren't pulsing, pulse on the next intro or loop track beat
		var now = audioContext.currentTime;
		
		if (GlobalMusic.lastQueuedTrack !== null && GlobalMusic.lastQueuedTrack.trackName === "title")
		{
			// Get the current sample...
			var startSample = (this.lastAudioCheck - GlobalMusic.lastQueuedTrack.startTime) * 44100;
			var endSample = (now - GlobalMusic.lastQueuedTrack.startTime) * 44100;
			
			// Check if the current segment has a beat between this sample and the last
			if (GlobalMusic.lastQueuedTrack.segment.IsBeatInSampleInterval(startSample,endSample))
			{
				this.oneshotPulse = 20;
				this.pulsedOnce = true;
			}
		}
		this.lastAudioCheck = now;
	//}

	this.backgroundSmoke.Update();
	
	for (var i = 0; i < this.backgroundSmoke.children.length; i++)
	{
		this.backgroundSmoke.children[i].Update();
	}	
	
	if (!this.menuMode && controller.anyActivate())
	{
		this.menuMode = true;
		this.activateSound.Play();
	}
	
	if (this.menuMode && this.menuTimer > 40)
	{
		if (!this.closing)
		{
			if (controller.upActivate())
			{
				do
				{
					this.selectedItem -= 1;
					if (this.selectedItem < 0)
						this.selectedItem = this.items.length-1;
				}
				while (this.items[this.selectedItem].element === "spacer");
				
				this.activateSound.Play();
				
			}
		
			if (controller.downActivate())
			{
				do
				{
				this.selectedItem += 1;
				if (this.selectedItem >= this.items.length)
					this.selectedItem = 0;
				}
				while (this.items[this.selectedItem].element === "spacer");
				
				this.activateSound.Play();
			}
	
			if (controller.leftActivate())
			{
				if (this.items[this.selectedItem].element === "multi")
				{
					this.items[this.selectedItem].selected -= 1;
					if (this.items[this.selectedItem].selected < 0)
						this.items[this.selectedItem].selected = this.items[this.selectedItem].options.length-1;
					this.items[this.selectedItem].onChange();
					
					this.activateSound.Play();
				}
			}
		
			if (controller.rightActivate())
			{
				if (this.items[this.selectedItem].element === "multi")
				{
					this.items[this.selectedItem].selected += 1;
					if (this.items[this.selectedItem].selected >= this.items[this.selectedItem].options.length)
						this.items[this.selectedItem].selected = 0;
					this.items[this.selectedItem].onChange();
					
					this.activateSound.Play();
				}
			}
	
			if (controller.startActivate() || controller.punchActivate())
			{
				if (this.items[this.selectedItem].element === "multi")
				{
					if(typeof(this.items[this.selectedItem].onClick)==='undefined') 
					{
						this.items[this.selectedItem].selected += 1;
						if (this.items[this.selectedItem].selected >= this.items[this.selectedItem].options.length)
							this.items[this.selectedItem].selected = 0;
						this.items[this.selectedItem].onChange();
						
						this.activateSound.Play();
					}
					else
					{
						this.items[this.selectedItem].onClick();
						this.activateSound.Play();
					}
				}
				else if (this.items[this.selectedItem].element === "button")
				{
					this.items[this.selectedItem].onClick();
					this.activateSound.Play();
				}
				else if (this.items[this.selectedItem].element === "keybind")
				{
					this.items[this.selectedItem].onClick();
				}
			}
		}
	}
	
	if (this.closing)
		this.timer -= 1;
	else if (this.timer < 60)
		this.timer += 1;
	
	if (this.menuMode && this.menuTimer < 60)
		this.menuTimer += 1;
	
	if (this.closing && this.timer <= 0)
	{
		menuStack.splice(menuStack.length-1,1);
		for (var i = 0; i < this.backgroundSmoke.children.length; i++)
		{
			this.backgroundSmoke.children[i].Die();
		}
	}
	
};