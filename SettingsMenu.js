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

var blurredBackgroundImage = null;
var backgroundImage = null;

GlobalResourceLoader.AddAudioResource("menu_boop","sound/menu/menu_boop.mp3");
GlobalResourceLoader.AddAudioResource("text_click","sound/menu/text_click.mp3");

function SettingsMenu()
{	
	this.title = "Menu";
	this.selectedItem = 0;
	this.items = [];
	
	this.internalCanvas = null;
	
	this.activateSound = GlobalResourceLoader.GetSound("menu_boop");
	
	// Animation Vars
	this.timer = 0;
	this.startCloseTime = 0;
	this.endCloseTime = 0;
	this.closing = false;
	this.close = false;
	this.pulse = Math.PI / 2.0;
	
	this.onClose = null;
	
	this.scroll = 0;
	this.scrollTarget = 0;
	
	this.allowBackout = true;
	
	this.topLevelMenu = false;
	
	this.useGlobalBackground = true;
};

function DismissAllMenus()
{
	saveSettings();
	blurredBackgroundImage = null;
	backgroundImage = null;
	menuStack = [];
	ResumeSuspendableSounds();
}

SettingsMenu.prototype.Show = function()
{
	// Take the current canvas and dupe it
	if (blurredBackgroundImage === null || !this.useGlobalBackground)
	{
		this.blurredBackgroundImage = cloneCanvas(displayC);
		this.backgroundImage = cloneCanvas(displayC);
	
		makeCanvasGrayscale(this.blurredBackgroundImage);
	
		// Now blur the old canvas
		stackBlurCanvasRGB( this.blurredBackgroundImage, 0, 0, this.blurredBackgroundImage.width, this.blurredBackgroundImage.height, 20 );
		
		this.topLevelMenu = true;
		
		if (blurredBackgroundImage === null && this.useGlobalBackground)
		{
			blurredBackgroundImage = this.blurredBackgroundImage;
			backgroundImage = this.backgroundImage;
		}
	}
	
	if (this.useGlobalBackground)
	{
		this.blurredBackgroundImage = blurredBackgroundImage;
		this.backgroundImage = backgroundImage;
	}
	
	if (!this.topLevelMenu)
		this.internalCanvas = cloneCanvas(displayC);
	
	this.pulse = Math.PI / 2.0;
	
	this.timer = 0;
	this.startCloseTime = 0;
	this.endCloseTime = 0;
	this.closing = false;
	this.close = false;
	
	// Find the first non-spacer item and select it
	for (var i=0; i < this.items.length; i++)
	{
		if (this.items[i].element !== "spacer")
		{
			this.selectedItem = i;
			break;
		}
	}
	
	menuStack.push(this);
}

SettingsMenu.prototype.Draw = function()
{
		// Basically draw over everything
		// Store the current transformation matrix
		ctx.save();
	
		var ratioTo360p =  c.height / 360.0;
		
		// Arrange drawing so that we are in a frame that is 640x360 with the origin
		// on the upper right
		ctx.setTransform(ratioTo360p, 0, 0, ratioTo360p, 0, 0);
		
		// Draw the screencap
		if (this.timer < 60 || this.closing)
		{
			if (this.topLevelMenu)
				ctx.drawImage(this.backgroundImage, 0, 0, 640, 360);
			else
				ctx.drawImage(this.internalCanvas,  0, 0, 640, 360);
		}
		
		var alpha = 1;
		if (this.closing)
			alpha = normalizeValue(this.timer,this.endCloseTime,this.startCloseTime);
		else
			alpha = normalizeValue(this.timer,0,60);
		
		ctx.globalAlpha = alpha;
		
		// Draw the blurred buffer
		ctx.drawImage(this.blurredBackgroundImage, 0, 0, 640, 360);
    	
    	sstext.textBaseline = 'middle';
		
		var xPosition = 320;
		var yPosition = 0;
		
		ctx.save();
		ctx.translate(0,this.scroll + 125);
		
		sstext.globalAlpha = alpha;
		
		if (alpha > 0)
		{
			for (var i=0; i < this.items.length; i++)
			{ 		
				// Update the scroll target
				if (i === this.selectedItem)
				{
					// If the selected item is above the top of the screen, make it the top item
					if (yPosition + this.scroll > 166)
					{
						this.scrollTarget = 166-yPosition;
					}
					// If the selected item is below the bottom of the screen, make it the bottom item
					if (yPosition + this.scroll < 0)
					{
						this.scrollTarget = -yPosition;
					}
				}
			
				if (this.items[i].element === "multi")
				{
					if ( i === this.selectedItem)
					{
						ctx.globalAlpha = alpha * 0.75+0.20*Math.cos(this.pulse);
						ctx.fillStyle = "#e03068";
					}
					else
					{
						ctx.globalAlpha = alpha * 0.6;
						ctx.fillStyle = "#6c1732";
					}
				
					sstext.fontSize = 26;
					var textWidth = sstext.MeasureText(this.items[i].options[this.items[i].selected]).width;
					ctx.fillRect(xPosition + 13 - 6, yPosition - 17, textWidth + 13, 33);
				
					sstext.globalAlpha = alpha;
					sstext.fillStyle = "#FFFFFF";
					sstext.textAlign = "right";
					sstext.DrawText(this.items[i].label + ":", xPosition, yPosition + this.scroll+ 125);
			
					sstext.textAlign = "left";
					sstext.DrawText(this.items[i].options[this.items[i].selected], xPosition+13, yPosition + this.scroll+ 125);
					yPosition += 33;
				}
				else if (this.items[i].element === "keybind")
				{
					if ( i === this.selectedItem)
					{
						if (controller.bindingKey)
						{
							ctx.fillStyle = "#ffea00";
						}
						else
						{
							ctx.fillStyle = "#e03068";
						}
						ctx.globalAlpha = alpha * 0.75+0.20*Math.cos(this.pulse);
					
					}
					else
					{
						ctx.globalAlpha = alpha * 0.6;
						ctx.fillStyle = "#6c1732";
					}
				
					sstext.fontSize = 12;
				
					var text = "[" + this.items[i].assignedKeyboardFunction.call(controller) + "] or " + this.items[i].assignedControllerFunction.call(controller);

					if (controller.bindingKey && i === this.selectedItem)
					{
						text = " ? "
					}
					var textWidth = sstext.MeasureText(text).width;
					ctx.fillRect(xPosition + 14 - 7, yPosition - 8, textWidth + 14, 16);
				
					sstext.globalAlpha = alpha;
					sstext.fillStyle = "#FFFFFF";
					sstext.textAlign = "right";
					sstext.DrawText(this.items[i].label + ":", xPosition, yPosition + this.scroll + 125);
			
					sstext.textAlign = "left";
					sstext.DrawText(text, xPosition+13, yPosition + this.scroll + 125);
					yPosition += 17;
				}
				else if (this.items[i].element === "spacer")
				{
					yPosition += this.items[i].size/2;
				
					if (this.items[i].hasOwnProperty("text"))
					{
						sstext.fillStyle = "#AAA";
						if (this.items[i].hasOwnProperty("fontSize"))
							sstext.fontSize = this.items[i].fontSize;
						else
							sstext.fontSize = 20;
							
						if (this.items[i].hasOwnProperty("isBlockText") && this.items[i].isBlockText)
						{
							sstext.textAlign = "left";
							sstext.DrawText(this.items[i].text, xPosition - 150, yPosition + this.scroll+ 125);
						}
						else
						{
							sstext.textAlign = "center";
							sstext.DrawText(this.items[i].text, xPosition, yPosition + this.scroll+ 125);
						}
					}
				
					yPosition += this.items[i].size/2;

				}
				else if (this.items[i].element === "button")
				{	
					if ( i === this.selectedItem)
					{
						ctx.globalAlpha = alpha * 0.75+0.20*Math.cos(this.pulse);
						if (!this.items[i].hasOwnProperty("enabled")  || this.items[i].enabled === true)
							ctx.fillStyle = "#e03068";
						else
							ctx.fillStyle = "#e0e0e0";
					}
					else
					{
						ctx.globalAlpha = alpha * 0.6;
					
						if (!this.items[i].hasOwnProperty("enabled")  || this.items[i].enabled === true)
							ctx.fillStyle = "#6c1732";
						else
							ctx.fillStyle = "#6c6c6c";
					}
				
					sstext.fontSize = 26;
				
					var textWidth = sstext.MeasureText(this.items[i].label).width;
				
					ctx.fillRect(xPosition - textWidth / 2 - 7, yPosition - 13 - 3, textWidth + 13, 33);
				
					sstext.alpha = alpha;
					sstext.fillStyle = "#FFFFFF";
					sstext.textAlign = "center";
					sstext.DrawText(this.items[i].label, xPosition, yPosition+this.scroll+125);
				
					yPosition += 40;
				}
			}
    	}
    	
    	blitInternalBuffer();
    	
    	ctx.restore();
    	
    	// Draw some background stripes to make sure the title is always visible
    	
    	// Draw the screencap
    	ctx.globalAlpha = 1.0;
		if (this.timer < 60 || this.closing)
		{
			if (this.topLevelMenu)
				ctx.drawImage(this.backgroundImage, 0, 0, this.backgroundImage.width, this.backgroundImage.height / 360 * 100, 0, 0, 640, 100);
			else
				ctx.drawImage(this.internalCanvas, 0, 0, this.internalCanvas.width, this.internalCanvas.height / 360 * 100, 0, 0, 640, 100);
		}
		
		ctx.globalAlpha = alpha;
		ctx.drawImage(this.blurredBackgroundImage, 0, 0, this.blurredBackgroundImage.width, this.blurredBackgroundImage.height / 360 * 100, 0, 0, 640, 100);
    	
    	// Now draw the title
    	sstext.alpha = alpha;
    	sstext.textAlign = "center";
		sstext.fontSize = 46;
		sstext.fillStyle = "#FFFFFF";
		sstext.DrawTextWithShadow(this.title, 320, 67);
		
		ctx.globalAlpha=1.0;
    	
    	ctx.restore();
};

SettingsMenu.prototype.Update = function()
{
	if (!this.closing && this.timer > 20)
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
				//if (!this.items[this.selectedItem].hasOwnProperty("enabled")  || this.items[this.selectedItem] === true)
				this.items[this.selectedItem].onClick();
				
				this.activateSound.Play();
			}
			else if (this.items[this.selectedItem].element === "keybind")
			{
				this.items[this.selectedItem].onClick();
				
				//this.activateSound.Play();
			}
		}
		
		if (this.allowBackout && controller.smokeActivate())
		{
			this.startCloseTime = this.timer;
			this.endCloseTime = this.timer + 60;
			this.closing = true;
			
			this.activateSound.Play();
		}
		
	}
	if (this.closing && this.timer >= this.endCloseTime)
	{
		this.close = true;
		saveSettings();
	}
	
	//if (this.scroll < this.scrollTarget)
	//{
	//	this.scroll += (this.scrollTarget + 700 - this.scroll)/5;
	//}
	
	//else if (this.scroll > this.scrollTarget + 700)
	//{
		this.scroll += (this.scrollTarget - this.scroll)/5;
	//}
	
	if (this.close)
	{
		menuStack.splice(menuStack.length-1,1);
		
		if (this.onClose != null)
			this.onClose();
		
		// If this is the top level menu that blurred the background, clear those items
		if (this.topLevelMenu && this.useGlobalBackground)
		{
			blurredBackgroundImage = null;
			backgroundImage = null;
			GlobalMusic.ClearAlternate();
			ResumeSuspendableSounds();
		}
	}
	
	if (this.timer < 60 || this.closing)
		this.timer += 1;
		
	this.pulse = normalizeAngle(this.pulse + 0.05);
};

function ShowPauseMenu()
{
	var menu = new SettingsMenu();
	
	PauseSuspendableSounds();
	
	menu.title = "Game Paused";
	menu.items = [	
					{ "element":"button", "label":"Resume Game", "onClick":function()
						{ 
							menu.startCloseTime = menu.timer;
							menu.endCloseTime = menu.timer + 60;
							menu.closing = true;
						} 
					},
					/*
					{ "element":"button", "label":"Save Game", "enabled": (player !== null && OkToSave(player.state) && player.captive === null), "onClick":function()
						{ 
							if (player !== null && OkToSave(player.state) && player.captive === null)
							{	
								saveGame();
								var fullscreenNotification = new ModalMessage("Game Saved!");
								fullscreenNotification.autoDismiss = true;
								fullscreenNotification.Show();
							}
							else
							{
								var fullscreenNotification = new ModalMessage("Cannot save. You must be idle to save.");
								fullscreenNotification.autoDismiss = false;
								fullscreenNotification.Show();
							}
						 } 
					},
					*/
					{ "element":"button", "label":"Settings", "onClick":function()
						{ 
							ShowSettingsMenu(true);
						} 
					},
					{ "element":"button", "label":"Controls", "onClick":function()
						{ 
							ShowControlsMenu();
						} 
					},
					{ "element":"button", "label":"Exit", "onClick":function()
						{ 
							var menu2 = new SettingsMenu();
							menu2.title = "Exit to Title?";
							menu2.items = [	
											{ "element":"spacer", "size":33},
											{ "element":"button", "label":"Yes", "onClick":function()
												{ 
													GlobalMusic.ClearAlternate();
													GlobalMusic.stop(0.25);
													DismissAllMenus();
													resetGame();
												} 
											},
											{ "element":"button", "label":"No", "onClick":function()
												{ 
													menu2.startCloseTime = menu.timer;
													menu2.endCloseTime = menu.timer + 60;
													menu2.closing = true;
												} 
											},
										];
							menu2.Show();
							menu2.selectedItem = 2;
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
		menu.items.splice(3, 0, debugMenu);
	}
				
	menu.Show();
};

function newLockedEntry()
{
	return { "element":"button", "enabled":false, "label":"[ Locked ]", "onClick":function(){} };
};

function ShowGalleryMenu()
{
	var menu = new SettingsMenu();

	menu.title = "Cutscene Gallery";
	menu.items = [];
	
	if (settings.cutsceneIntro)
		menu.items.push({ "element":"button", "label":"Opening Cutscene", "onClick":function()
						{
							var lst = new LevelStartTransition();
							lst.Show();
							ShowOpeningCutscene("title");
						} 
					});
	else 
		menu.items.push(newLockedEntry());
		
	
	 if (settings.cutsceneSmokeTunnel)
		menu.items.push({ "element":"button", "label":"Smoke Tunnel", "onClick":function()
						{
							var lst = new LevelStartTransition();
							lst.Show();
						} 
					});
	else 
		menu.items.push(newLockedEntry());
		
if (settings.cutsceneGameOverLevel1)
		menu.items.push({ "element":"button", "label":"Game Over Cutscene (Level 1)", "onClick":function()
						{
							ShowGameOverCutscene("gameover1_000_400x44");
						} 
					});
	else 
		menu.items.push(newLockedEntry());
		
if (settings.cutsceneGameOverLevel2)
		menu.items.push({ "element":"button", "label":"Game Over Cutscene (Level 2)", "onClick":function()
						{
							ShowGameOverCutscene("gameover2_FFF_206x219");
						} 
					});
	else 
		menu.items.push(newLockedEntry());
		
if (settings.cutsceneGameOverLevel3)
		menu.items.push({ "element":"button", "label":"Game Over Cutscene (Level 3)", "onClick":function()
						{
							ShowGameOverCutscene("gameover3_FFF_300x329");
						} 
					});
	else 
		menu.items.push(newLockedEntry());
		
if (settings.cutsceneGameOverLevel4)
		menu.items.push({ "element":"button", "label":"Game Over Cutscene (Level 4)", "onClick":function()
						{
							ShowGameOverCutscene("gameover4_FFF_223x331");
						} 
					});
	else 
		menu.items.push(newLockedEntry());
		
if (settings.cutsceneGameOverLevel5)
		menu.items.push({ "element":"button", "label":"Game Over Cutscene (Level 5)", "onClick":function()
						{
							ShowGameOverCutscene("gameover5_FFF_426x55");
						} 
					});
	else 
		menu.items.push(newLockedEntry());
		
if (settings.cutsceneEndingDomination)
		menu.items.push({ "element":"button", "label":"Domination Ending", "onClick":function()
						{
							ShowEndingCutsceneDomination("title",false);
						} 
					});
	else 
		menu.items.push(newLockedEntry());
		
if (settings.cutsceneEndingCorruption)
		menu.items.push({ "element":"button", "label":"Corruption Ending", "onClick":function()
						{
							ShowEndingCutsceneCorruption("title",false);
						} 
					});
	else 
		menu.items.push(newLockedEntry());
		
if (settings.cutsceneEndingBoyfriend)
		menu.items.push({ "element":"button", "label":"Boyfriend Ending", "onClick":function()
						{
							ShowEndingCutsceneExit("title",false);
						} 
					});
	else 
		menu.items.push(newLockedEntry());
		
		
	if (settings.seenCredits)
		menu.items.push({ "element":"button", "label":"Credits", "onClick":function()
						{
							ShowCreditsCutscene();
						} 
					});
	else 
		menu.items.push(newLockedEntry());
		
		
		
	menu.items.push({ "element":"spacer", "size":16});
					
	menu.items.push({ "element":"button", "label":"Back", "onClick":function()
						{ 
							menu.startCloseTime = menu.timer;
							menu.endCloseTime = menu.timer + 60;
							menu.closing = true;
						} 
					});
					
	menu.Show();
};

function ShowSettingsMenu(ingame)
{
	var menu = new SettingsMenu();
	
	
	var musicLevelSelection = 0;
	var sfxLevelSelection = 0;
	var fullscreenSelection = 0;
	
	if (settings.musicLevelGameplay === 0)
		musicLevelSelection = 2;
	else if (settings.musicLevelGameplay <= 0.5)
		musicLevelSelection = 1;

	if (settings.baseSFXBoost === 0)
		sfxLevelSelection = 2;
	else if (settings.baseSFXBoost <= 0.5)
		sfxLevelSelection = 1;
		
	if (settings.fullscreenMode)
		fullscreenSelection = 1;

	menu.title = "Settings";
	menu.items = [	
					{ "element":"multi", "label":"Music Volume", "options":["Full","Half","Mute"], "selected":musicLevelSelection, "onChange":function()
						{ 
							if (this.selected === 0)
							{
								settings.musicLevelGameplay = 1.0;
							}
							else if (this.selected === 1)
							{
								settings.musicLevelGameplay = 0.5;
							}
							else if (this.selected === 2)
							{
								settings.musicLevelGameplay = 0;
							}
							
							// Set the music volume so this actually applies right away
							GlobalMusic.setVolume(settings.musicLevelGameplay);
 						}
 					},
 					{ "element":"multi", "label":"SFX Volume", "options":["Full","Half","Mute"], "selected":sfxLevelSelection, "onChange":function()
						{ 
							if (this.selected === 0)
							{
								settings.baseSFXBoost = 1;
							}
							else if (this.selected === 1)
							{
								settings.baseSFXBoost = 0.5;
							}
							else if (this.selected === 2)
							{
								settings.baseSFXBoost = 0;
							}
 						}
 					},
 					
 					{ "element":"spacer", "size":9},
 					
					{ "element":"multi", "label":"Video Mode", "options":["Window","Full Screen"], "selected":fullscreenSelection, "onChange":function()
						{
							settings.fullscreenMode = (this.selected === 1);
							saveSettings();
							windowSettingsStale = true;
						},
						"onClick":function()
						{
							if (!app)
							{
								if (this.selected === 0)
								{
									goWindowed();
								}
								else
								{
									var fullscreenNotification = new ModalMessage("Press Any Key to Go Fullscreen");
									controller.oneShotCallback = function()
										{ 
											goFullscreen(); 
											fullscreenNotification.close = true;
										};
									fullscreenNotification.Show();
								}
							}
						} 
					},
					{ "element":"multi", "label":"Render Mode", "options":["Perfect","Rough","Blurry"], "selected":settings.renderMode, "onChange":function()
						{ 
							settings.renderMode = this.selected;
 							resizeCanvas(true);
 						}
 					},
 					{ "element":"multi", "label":"Scaling Quality", "options":["Auto","Low","High"], "selected":settings.scalingQuality, "onChange":function()
						{ 
							settings.scalingQuality = this.selected;
 							resizeCanvas(true);
 						}
 					},
 					/*
					{ "element":"multi", "label":"Hi-DPI Support", "options":["Enabled","Disabled"], "selected":settings.enableRetina?0:1, "onChange":function()
						{
							settings.enableRetina = (this.selected === 0);
 							resizeCanvas(true);
						}
					},
					*/
					{ "element":"button", "label":"Erase Data...", "enabled":!ingame, "onClick":function()
						{
							if (!ingame)
								ShowEraseDataMenu();
						} 
					},
					{ "element":"spacer", "size":16},
					
					{ "element":"button", "label":"Back", "onClick":function()
						{ 
							menu.startCloseTime = menu.timer;
							menu.endCloseTime = menu.timer + 60;
							menu.closing = true;
						} 
					}   
				];
	menu.Show();
};

function ShowDevelopmentMenu()
{
	var menu = new SettingsMenu();
	
	// Generate a list of levels for the levelselect
	var levelSelectOptions = ["level0", "level1","level2", "level3", "level4", "level5", "level6", "staircase_test"];
	for (var levelName in levelcache) 
	{
    	if (levelcache.hasOwnProperty(levelName) && levelSelectOptions.indexOf(levelName) === -1)
    	{
        	levelSelectOptions.push(levelName);
    	}
	}
	
	// Find the currently selected item
	var selectedLevelIndex = 0;
	for (var i=0; i < levelSelectOptions.length; i++) 
	{
		if (level.levelName === levelSelectOptions[i])
		{
			selectedLevelIndex = i;
			break;
		}
	}
	
	menu.title = "Development Menu";
	menu.items = [	
					{ "element":"multi", "label":"Level Select", "options":levelSelectOptions, "selected":selectedLevelIndex, "onChange":function()
						{ 
							
 						}, 
 						"onClick":function()
 						{
 							GlobalMusic.ClearAlternate();
 							loadLevelFromURL(this.options[this.selected], true);
 							DismissAllMenus();
 						}
 					},
					{ "element":"multi", "label":"Debug Mode", "options":["Disabled","Enabled"], "selected":(debug>0)?1:0, "onChange":function()
						{
							debug  = (this.selected === 1)?2:0;
						} 
					},
					{ "element":"button", "label":"Debug Mode Keys...", "onClick":function()
						{
							ShowDevelopmentControlsMenu();
						} 
					},
					{ "element":"multi", "label":"No Clip Mode", "options":["Disabled","Enabled"], "selected":playernoclip?1:0, "onChange":function()
						{
							playernoclip  = (this.selected === 1);
						} 
					},
					{ "element":"button", "label":"Cutscenes...", "onClick":function()
						{
							ShowCutscenesMenu();
						} 
					},
					{ "element":"button", "label":"Erase Data...", "onClick":function()
						{
							ShowEraseDataMenu();
						} 
					},
					{ "element":"spacer", "size":16},
					
					{ "element":"button", "label":"Back", "onClick":function()
						{ 
							menu.startCloseTime = menu.timer;
							menu.endCloseTime = menu.timer + 60;
							menu.closing = true;
						} 
					}
				];
	menu.Show();
};

function ShowDevelopmentControlsMenu()
{
	var menu = new SettingsMenu();
	
	// Generate a list of levels for the levelselect
	var levelSelectOptions = ["level0", "level1","level2", "level3", "level4", "level5", "level6"];
	for (var levelName in levelcache) 
	{
    	if (levelcache.hasOwnProperty(levelName) && levelSelectOptions.indexOf(levelName) === -1)
    	{
        	levelSelectOptions.push(levelName);
    	}
	}
	
	// Find the currently selected item
	var selectedLevelIndex = 0;
	for (var i=0; i < levelSelectOptions.length; i++) 
	{
		if (level.levelName === levelSelectOptions[i])
		{
			selectedLevelIndex = i;
			break;
		}
	}
	
	menu.title = "Debug Mode Keys";
	menu.items = [	
					{ "element":"spacer", "size":12, "text": "B = Toggle debug overlay, enable all other debug keys", "isBlockText":true, "fontSize": 10},
					{ "element":"spacer", "size":12, "text": "F = Fill all meters and set lives to 5           G = Drain health to 1, sex to 0, lives to 1", "isBlockText":true, "fontSize": 10 },
					{ "element":"spacer", "size":12, "text": "5 = Refill sex meter only                           H = Add 2.5 seconds of drunkenness     V = Toggle drunk", "isBlockText":true, "fontSize": 10 },
					{ "element":"spacer", "size":4 },
					{ "element":"spacer", "size":12, "text": "I = Change spawned entity type                  O = Change spawned entity type", "isBlockText":true, "fontSize": 10 },
					{ "element":"spacer", "size":12, "text": "P = Spawn entity of selected type", "isBlockText":true, "fontSize": 10 },
					{ "element":"spacer", "size":12, "text": "   Spawn modifiers (hold while tapping P):       ", "isBlockText":true, "fontSize": 10 },
					{ "element":"spacer", "size":12, "text": "      Punch = Entity has no AI | Smoke = Entity spawns corrupted | Grab = Entity set as Player", "isBlockText":true, "fontSize": 10 },
					{ "element":"spacer", "size":4 },
					{ "element":"spacer", "size":12, "text": "N = No clip mode                                                  ` = Toggle framerate 1 FPS mode", "isBlockText":true, "fontSize": 10 },
					{ "element":"spacer", "size":12, "text": "T = Toggle demon bartender transform state       Z = Force a soundwave spawn event", "isBlockText":true, "fontSize": 10 },
					{ "element":"spacer", "size":12, "text": "Del = Change level to an empty void              Y = Force kill player", "isBlockText":true, "fontSize": 10 },
					{ "element":"spacer", "size":4 },
					{ "element":"spacer", "size":14, "text": "WARNING: Use of these keys can crash the game." , "fontSize": 12},
					{ "element":"spacer", "size":14, "text": "Enjoy at your own risk!" , "fontSize": 12},
					{ "element":"spacer", "size":24 },

					{ "element":"button", "label":"Back", "onClick":function()
						{ 
							menu.startCloseTime = menu.timer;
							menu.endCloseTime = menu.timer + 60;
							menu.closing = true;
						} 
					}
				];
	menu.Show();
};

function ShowEraseDataMenu()
{
	var menu = new SettingsMenu();
	var erasedSomething = false;
	menu.title = "Erase Data";
	menu.items = [	
					{ "element":"button", "label":"Erase Saved Game", "onClick":function()
						{
							var menu2 = new SettingsMenu();
							menu2.useGlobalBackground = false;	// Inherit whatever is behind, even if other menus are open
							menu2.allowBackout = false;

							menu2.title = "Really Erase?";
							menu2.items = [	
											{ "element":"spacer", "size":25, "text":"Are you sure you want to erase your saved game data?"},
											{ "element":"spacer", "size":25, "text":"Gallery and debug unlocks will not be affected."},
											{ "element":"spacer", "size":67},
											{ "element":"button", "label":"No", "onClick":function()
												{ 
														menu2.startCloseTime = menu2.timer;
														menu2.endCloseTime = menu2.timer + 60;
														menu2.closing = true;
												} 
											},
											{ "element":"button", "label":"Yes", "onClick":function()
												{ 
													localStorage.removeItem("SavedGame");
													menu2.startCloseTime = menu2.timer;
													menu2.endCloseTime = menu2.timer + 60;
													menu2.closing = true;
													erasedSomething = true;
													
													var fullscreenNotification = new ModalMessage("All saved game data erased!");
													fullscreenNotification.autoDismiss = true;
													fullscreenNotification.Show();
												} 
											}
										];
							menu2.Show();
						} 
					},
					{ "element":"button", "label":"Erase Settings", "onClick":function()
						{
							var menu2 = new SettingsMenu();
							menu2.useGlobalBackground = false;	// Inherit whatever is behind, even if other menus are open
							menu2.allowBackout = false;

							menu2.title = "Really Erase?";
							menu2.items = [	
											{ "element":"spacer", "size":25, "text":"Are you sure you want to erase your settings?"},
											{ "element":"spacer", "size":25, "text":"This includes gallery and debug unlocks!"},
											{ "element":"spacer", "size":67},
											{ "element":"button", "label":"No", "onClick":function()
												{ 
														menu2.startCloseTime = menu2.timer;
														menu2.endCloseTime = menu2.timer + 60;
														menu2.closing = true;
												} 
											},
											{ "element":"button", "label":"Yes", "onClick":function()
												{ 
													localStorage.removeItem("GameSettings");
													loadSettings();
													menu2.startCloseTime = menu2.timer;
													menu2.endCloseTime = menu2.timer + 60;
													menu2.closing = true;
													erasedSomething = true;
													
													var fullscreenNotification = new ModalMessage("All game settings restored to default!");
													fullscreenNotification.autoDismiss = true;
													fullscreenNotification.Show();
				
												} 
											}
										];
							menu2.Show();
						} 
					},
					{ "element":"spacer", "size":16},
					
					{ "element":"button", "label":"Back", "onClick":function()
						{ 
							if (erasedSomething)
							{
								GlobalMusic.ClearAlternate();
								GlobalMusic.stop(0.25);
								DismissAllMenus();
								resetGame();
							}
							else
							{	
								menu.startCloseTime = menu.timer;
								menu.endCloseTime = menu.timer + 60;
								menu.closing = true;
							}
						} 
					}
				];
	menu.Show();
};

function ShowCutscenesMenu()
{
	var menu = new SettingsMenu();

	menu.title = "Cutscenes";
	menu.items = [	
					{ "element":"button", "label":"Opening Cutscene", "onClick":function()
						{
							var lst = new LevelStartTransition();
							lst.Show();
							ShowOpeningCutscene("title");
						} 
					},
					{ "element":"button", "label":"Smoke Tunnel", "onClick":function()
						{
							var lst = new LevelStartTransition();
							lst.Show();
						} 
					},
					{ "element":"button", "label":"Game Over Cutscene (Level 1)", "onClick":function()
						{
							ShowGameOverCutscene("gameover1_000_400x44");
						} 
					},
					{ "element":"button", "label":"Game Over Cutscene (Level 2)", "onClick":function()
						{
							ShowGameOverCutscene("gameover2_FFF_206x219");
						} 
					},
					{ "element":"button", "label":"Game Over Cutscene (Level 3)", "onClick":function()
						{
							ShowGameOverCutscene("gameover3_FFF_300x329");
						} 
					},
					{ "element":"button", "label":"Game Over Cutscene (Level 4)", "onClick":function()
						{
							ShowGameOverCutscene("gameover4_FFF_223x331");
						} 
					},
					{ "element":"button", "label":"Game Over Cutscene (Level 5)", "onClick":function()
						{
							ShowGameOverCutscene("gameover5_FFF_426x55");
						} 
					},
					{ "element":"button", "label":"Domination Ending", "onClick":function()
						{
							ShowEndingCutsceneDomination("title",false);
						} 
					},
					{ "element":"button", "label":"Corruption Ending", "onClick":function()
						{
							ShowEndingCutsceneCorruption("title",false);
						} 
					},
					{ "element":"button", "label":"Boyfriend Ending", "onClick":function()
						{
							ShowEndingCutsceneExit("title",false);
						} 
					},
					{ "element":"button", "label":"Credits", "onClick":function()
						{
							ShowCreditsCutscene();
						} 
					},
					
					
					{ "element":"spacer", "size":16},
					
					{ "element":"button", "label":"Back", "onClick":function()
						{ 
							menu.startCloseTime = menu.timer;
							menu.endCloseTime = menu.timer + 60;
							menu.closing = true;
						} 
					}
				];
	menu.Show();
};

function ShowControlsMenu()
{
	var menu = new SettingsMenu();
	
	menu.title = "Controls";
	menu.items = [	
					{ "element":"keybind", "label":"Move Up", "assignedKeyboardFunction":controller.getUpKeyName, "assignedControllerFunction":controller.getUpButtonName, "onClick":function()
						{
							controller.bindUpKey();
						} 
					},
					{ "element":"keybind", "label":"Move Down", "assignedKeyboardFunction":controller.getDownKeyName, "assignedControllerFunction":controller.getDownButtonName, "onClick":function()
						{
							controller.bindDownKey();
						} 
					},
					{ "element":"keybind", "label":"Move Left", "assignedKeyboardFunction":controller.getLeftKeyName, "assignedControllerFunction":controller.getLeftButtonName, "onClick":function()
						{
							controller.bindLeftKey();
						} 
					},
					{ "element":"keybind", "label":"Move Right", "assignedKeyboardFunction":controller.getRightKeyName, "assignedControllerFunction":controller.getRightButtonName, "onClick":function()
						{
							controller.bindRightKey();
						} 
					},
					{ "element":"keybind", "label":"Attack", "assignedKeyboardFunction":controller.getPunchKeyName, "assignedControllerFunction":controller.getPunchButtonName, "onClick":function()
						{
							controller.bindPunchKey();
						} 
					},
					{ "element":"keybind", "label":"Smoke", "assignedKeyboardFunction":controller.getSmokeKeyName, "assignedControllerFunction":controller.getSmokeButtonName, "onClick":function()
						{
							controller.bindSmokeKey();
						} 
					},
					{ "element":"keybind", "label":"Grab", "assignedKeyboardFunction":controller.getGrabKeyName, "assignedControllerFunction":controller.getGrabButtonName, "onClick":function()
						{
							controller.bindGrabKey();
						} 
					},
					{ "element":"keybind", "label":"Special", "assignedKeyboardFunction":controller.getSpecialKeyName, "assignedControllerFunction":controller.getSpecialButtonName, "onClick":function()
						{
							controller.bindSpecialKey();
						} 
					},
					{ "element":"keybind", "label":"Jump", "assignedKeyboardFunction":controller.getJumpKeyName, "assignedControllerFunction":controller.getJumpButtonName, "onClick":function()
						{
							controller.bindJumpKey();
						} 
					},
					{ "element":"keybind", "label":"Select", "assignedKeyboardFunction":controller.getStartKeyName, "assignedControllerFunction":controller.getStartButtonName, "onClick":function()
						{
							controller.bindStartKey();
						} 
					},
					{ "element":"spacer", "size":15},
					
					{ "element":"button", "label":"Done", "onClick":function()
						{ 
							menu.startCloseTime = menu.timer;
							menu.endCloseTime = menu.timer + 60;
							menu.closing = true;
						} 
					},
					{ "element":"button", "label":"Restore Defaults", "onClick":function()
						{ 
							controller.resetBindings();
						} 
					},
					{ "element":"spacer", "size":5, "text": "Note: Arrow keys and Enter cannot be reassigned."}
				];
	menu.Show();
};