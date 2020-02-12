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

var cutsceneToLevelTransition = null;

GlobalResourceLoader.AddImageResource("keyicon","images/menus/keyicon.png");
GlobalResourceLoader.AddImageResource("keyicon_wide","images/menus/keyicon_wide.png");

GlobalResourceLoader.AddImageResource("credits1","images/menus/credits1_name.png");
GlobalResourceLoader.AddImageResource("credits2","images/menus/credits2_name.png");
GlobalResourceLoader.AddImageResource("credits2_codelayer","images/menus/credits2_codelayer.png");
GlobalResourceLoader.AddImageResource("credits3","images/menus/credits3_name.png");
GlobalResourceLoader.AddImageResource("art_bg1","images/menus/art_bg1.png");
GlobalResourceLoader.AddImageResource("art_bg2","images/menus/art_bg2.png");
GlobalResourceLoader.AddImageResource("art_bg3","images/menus/art_bg3.png");
GlobalResourceLoader.AddImageResource("art_bg4","images/menus/art_bg4.png");
GlobalResourceLoader.AddImageResource("art_bg5","images/menus/art_bg5.png");

GlobalResourceLoader.AddAudioResource("menu_boop","sound/menu/menu_boop.mp3");
GlobalResourceLoader.AddAudioResource("text_click","sound/menu/text_click.mp3");


function Cutscene()
{	
	this.activateSound = GlobalResourceLoader.GetSound("menu_boop");
	this.textSound = GlobalResourceLoader.GetSound("text_click");
	this.textSound.loop = true;
	this.textSoundPlayback = null;
	
	this.currentAmbientLoop = null;
	this.currentAmbientSource = null;
	
	this.requestClose = false;
	this.closing = false;
	this.close = false;
	this.pulse = 0;
	
	this.screens = [];
	
	this.screenIndex = 0;
	this.updateTimer = 60;
	this.autoAdvance = false;
	
	this.charDelay = 3;
	this.periodDelay = 30;
	this.screenDelay = 30;
	this.updateTimer = this.screenDelay;
	
	this.fadeInFrame = null;
	this.fadeInColor = "#000";
	this.fadeInTimer = 0;
	this.fadeInTime = 60;
	
	this.fadeOutFrame = null;
	this.fadeOutColor = "#000";
	this.fadeOutTimer = 0;
	this.fadeOutTime = 60;
	
	this.onClose = null;
	this.onClosing = null;
	
	this.keyicon = GlobalResourceLoader.GetSprite("keyicon");
	this.keyicon_wide = GlobalResourceLoader.GetSprite("keyicon_wide");
};

Cutscene.prototype.AddSingleLineScreens = function(frameName, layerNames, x, y, justify, lines, valign)
{
	if(typeof(valign)==='undefined')
	{
		valign = "bottom";
	}
	var lineSpacing = 30;
	
	for (var i=0; i < lines.length; i++)
	{
		var layers = null;
		
		if (layerNames !== null)
		{
			layers = [];
			for (var j=0; j < layerNames.length; j++)
			{
				layers.push(GlobalResourceLoader.GetSprite(layerNames[j]));
			}
		}
		
		var linesThisScreen = [];
		if(typeof lines[i] === 'string' )
		{
			linesThisScreen.push({"x": x, "y": y,  "text": lines[i], "i":0, "justify":justify})
		}
		else
		{
			var startY = y - (lines[i].length-1)*lineSpacing;
			if (valign === "top")
				startY = y;
			
			for (var k=0; k < lines[i].length; k++)
			{
				linesThisScreen.push({"x": x, "y": startY+lineSpacing*k,  "text": lines[i][k], "i":0, "justify":justify})
			}
		}
		
		var screen = {   "frame": GlobalResourceLoader.GetSprite(frameName),
						 "layers": layers,
						 "ambientLoop": null,
						 "lines": linesThisScreen
					  };
					
		this.screens.push(screen);
	}
};

Cutscene.prototype.Show = function()
{	
	this.close = false;
	this.closing = false;
	cutsceneToLevelTransition = null;
	menuStack.push(this);
}

Cutscene.prototype.DrawScreen = function(screen)
{
	// Draw the background frame
	if (screen.hasOwnProperty("frame") && screen.frame !== null)
	{
		screen.frame.DrawSprite(0, 0, false);
	}
	else if (screen.hasOwnProperty("frameObj") && screen.frameObj !== null)
	{
		screen.frameObj.Draw();
	}
	else if (screen.hasOwnProperty("bgColor") && screen.bgColor !== null)
	{
		ctx.fillStyle = screen.bgColor;
		ctx.fillRect(0, 0, 640, 360);
	}
	
	if (screen.hasOwnProperty("layers") && screen.layers !== null)
	{
		for (var i=0; i < screen.layers.length; i++)
			screen.layers[i].DrawSprite(0, 0, false);
	}
	
	// Draw all the lines of text up to the "i" variable
	sstext.textBaseline = 'alphabetic';
	sstext.textAlign = "left";
	sstext.alpha = 1.0;
	
	for (var i=0; i < screen.lines.length; i++)
	{
		var line = screen.lines[i];
		var width = 0;
		
		if (line.hasOwnProperty("size"))
			sstext.fontSize = line.size;
		else
			sstext.fontSize = 28;
		
		// If the line is right justify, calculate the text width
		if (line.hasOwnProperty("justify") && line.justify === "right")
		{
			var lastChar = line.text[line.text.length-1];
			var measureString = line.text;
			if (lastChar === '.' || lastChar === ',' || lastChar === ';') 
				measureString = line.text.substring(0,line.text.length-1);
			
			width = sstext.MeasureText(measureString).width;
		}
		else if (line.hasOwnProperty("justify") && line.justify === "center")
		{
			var lastChar = line.text[line.text.length-1];
			var measureString = line.text;
			if (lastChar === '.' || lastChar === ',' || lastChar === ';') 
				measureString = line.text.substring(0,line.text.length-1);
			
			width = sstext.MeasureText(measureString).width / 2.0;
		}
		
		if (line.hasOwnProperty("color"))
		{
			//ctx.fillStyle = line.color;
			//ctx.fillText(line.text.substring(0,line.i), line.x * 3 - width, line.y * 3);
			sstext.DrawTextWithOutline(line.text.substring(0,line.i), line.x - width, line.y, line.color);	
		}
		else
		{
			sstext.DrawTextWithOutline(line.text.substring(0,line.i), line.x - width, line.y);	
		}
	}
	
	// This forces a copy to display buffer operation, which allows subsequent draw calls to paint over supersampled text
	blitInternalBuffer();
	
	if (screen.hasOwnProperty("onDraw"))
	{
		screen.onDraw();
	}
}

Cutscene.prototype.Draw = function()
{
	// Basically draw over everything
	// Store the current transformation matrix
	ctx.save();

	var ratioTo360p =  c.height / 360.0;

	// Arrange drawing so that we are in a frame that is 1920x1080 with the origin
	// on the upper right
	ctx.setTransform(ratioTo360p, 0, 0, ratioTo360p, 0.0, 0.0);
	
	var screen = this.screens[this.screenIndex];

	if (this.screenIndex > 0 && screen.hasOwnProperty("fadeInTime") && screen.fadeInTimer < screen.fadeInTime)
	{
		this.DrawScreen(this.screens[this.screenIndex-1]);	
		ctx.globalAlpha=normalizeValue(screen.fadeInTimer, 0, screen.fadeInTime);
		this.DrawScreen(screen);
		ctx.globalAlpha=1;
	}
	else
	{
		this.DrawScreen(screen);
	}
	
	// Draw the "requestClose" message
	if (this.requestClose)
	{
		sstext.textBaseline = 'alphabetic';
		sstext.textAlign = "right";
		sstext.fontSize = 16;
		//ctx.fillStyle = "#000";
		//ctx.fillRect(1500, 0, 420, 80);
		sstext.alpha=0.75+0.25*Math.cos(this.pulse);
		sstext.DrawTextWithShadow("Press Enter to Skip...", 633, 16);
		//ctx.globalAlpha=1.0;
	}
	
	// Draw the keyicon that advances the cutscene.
	if (this.allLinesAreExpanded() && !this.autoAdvance)
	{
		sstext.alpha=0.75+0.25*Math.cos(this.pulse);
		ctx.globalAlpha=0.75+0.25*Math.cos(this.pulse);
		
		// Draw the keycap
		this.keyicon.DrawSprite(600,320,false);

		sstext.textBaseline = 'middle';
		sstext.textAlign = "center";
		sstext.fontSize = 16;
		sstext.DrawTextWithShadow(getStringFromKeyCode(settings.punchKeyCode), 617, 337);
		sstext.alpha=1.0;
		ctx.globalAlpha = 1;
	}
	
	// This forces a copy to display buffer operation, which allows subsequent draw calls to paint over supersampled text
	blitInternalBuffer();
	
	// Draw the fade in / fade out
	if (this.closing)
	{
		ctx.globalAlpha = normalizeValue(this.fadeOutTimer,0,this.fadeOutTime);
		if (this.fadeOutTimer <= this.fadeOutTime)
		{
			// Draw the background frame
			if (this.fadeOutFrame !== null)
			{
				ctx.drawImage(this.fadeOutFrame, 0, 0, 640, 360);
			}
			else
			{
				ctx.fillStyle = this.fadeOutColor;
				ctx.fillRect(0, 0, 640, 360);
			}
		}
		ctx.globalAlpha = 1;
	}
	else
	{
		ctx.globalAlpha = 1-normalizeValue(this.fadeInTimer,0,this.fadeInTime);
		if (this.fadeInTimer < this.fadeInTime)
		{
			// Draw the background frame
			if (this.fadeInFrame !== null)
			{
				ctx.drawImage(this.fadeInFrame, 0, 0, 640, 360);
			}
			else
			{
				ctx.fillStyle = this.fadeInColor;
				ctx.fillRect(0, 0, 640, 360);
			}
		}
		ctx.globalAlpha = 1;
	}
	
	ctx.restore();
};

Cutscene.prototype.allLinesAreExpanded = function()
{
	var linesExpanded = true;
	
	var screen = this.screens[this.screenIndex];

	for (var i=0; i < screen.lines.length; i++)
	{
		var line = screen.lines[i];
		if (line.i !== line.text.length)
		{
			linesExpanded = false;
			break;
		}
	}
	
	return linesExpanded;
};

Cutscene.prototype.expandAllLines = function()
{
	var expandedLines = false;
	
	var screen = this.screens[this.screenIndex];

	for (var i=0; i < screen.lines.length; i++)
	{
		var line = screen.lines[i];
		if (line.i !== line.text.length)
		{
			line.i = line.text.length;
			expandedLines = true;
		}
	}
	
	return expandedLines;
};

Cutscene.prototype.updateAmbientLoop = function()
{
	var newLoop = null;
	if (this.screens[this.screenIndex].hasOwnProperty("ambientLoop"))
	{
		newLoop = this.screens[this.screenIndex].ambientLoop;
	}
	
	if (this.currentAmbientLoop !== this.screens[this.screenIndex].ambientLoop)
	{
		if (this.currentAmbientLoop !== null)
		{
			this.currentAmbientLoop = null;
			this.currentAmbientSource.stop();
			this.currentAmbientSource = null;
		}
		
		if (newLoop !== null)
		{
			newLoop.loop = true;
			this.currentAmbientSource = newLoop.Play(0.5*settings.baseSFXBoost);
			this.currentAmbientLoop = newLoop;
		}
	}
};

Cutscene.prototype.Update = function()
{
	// Select the current screen and if it has a frameObj, update it.
	var screen = this.screens[this.screenIndex];
	
	var enableInput = (this.fadeInTime <= this.fadeInTimer && !this.closing);
	if (this.screenIndex > 0 && screen.hasOwnProperty("fadeInTime"))
	{
		enableInput = enableInput && !(screen.fadeInTimer < screen.fadeInTime)
	}

	if (enableInput)
	{
		if (controller.startActivate() && this.screenIndex < this.screens.length-1)
		{
			if (this.requestClose)
			{
				this.closing = true;
				if (this.onClosing !== null)
				{
					this.onClosing();
				}
			}
			else
			{
				this.requestClose = true;
			}
		}
		else if (!this.autoAdvance && (controller.leftActivate() || controller.upActivate() || controller.smokeActivate()))
		{
			this.requestClose = false;
			this.expandAllLines();
		
			if (this.screenIndex > 0)
			{
				this.screenIndex--;
				this.requestClose = false;
			
				//this.updateAmbientLoop();
			}
		}
		else if (!this.autoAdvance && controller.anyActivate())
		{
			this.requestClose = false;
			// Expand all the writing on the current screen
			var expandedLines = this.expandAllLines();
		
			if (!expandedLines && this.screenIndex < this.screens.length-1)
			{
				this.updateTimer = this.screenDelay;
				this.screenIndex++;
				if (screen.hasOwnProperty("onFirstAdvance") && screen.onFirstAdvance !== null)
				{
					screen.onFirstAdvance();
					screen.onFirstAdvance = null
				}
			}
			else if (!expandedLines && !controller.rightActivate()&& !controller.downActivate())
			{
				this.closing = true;
				if (this.onClosing !== null)
				{
					this.onClosing();
				}
			}
		}
	}
	
	this.pulse = normalizeAngle(this.pulse + 0.05);
	
	if (screen.hasOwnProperty("frameObj") && screen.frameObj !== null)
	{
		screen.frameObj.Update();
	}
	
	if (screen.hasOwnProperty("autoAdvanceTimer"))
	{
		if (screen.autoAdvanceTimer > 0)
		{
			screen.autoAdvanceTimer--;
		}
		else
		{
			if (this.screenIndex < this.screens.length-1)
			{
				this.screenIndex++;
				if (screen.hasOwnProperty("onFirstAdvance") && screen.onFirstAdvance !== null)
				{
					screen.onFirstAdvance();
					screen.onFirstAdvance = null
				}
			}
			this.updateTimer = 0;
		}
	}
	
	if (screen.hasOwnProperty("onFirstShow") && screen.onFirstShow !== null)
	{
		screen.onFirstShow();
		screen.onFirstShow = null
	}
	
	if (screen.hasOwnProperty("onUpdate"))
	{
		screen.onUpdate();
	}
	
	if (screen.hasOwnProperty("fadeInTime"))
	{
		if (screen.fadeInTimer < screen.fadeInTime)
		{
			screen.fadeInTimer += 1;
		}
	}
	
	if (this.closing)
	{
		if (this.fadeOutTimer < this.fadeOutTime)
		{
			this.fadeOutTimer += 1;
		}
		if (this.fadeOutTimer >= this.fadeOutTime)
		{	
			this.close = true;
		}
	}
	else
	{
		if (this.fadeInTimer < this.fadeInTime)
		{
			this.fadeInTimer += 1;
		}
	}
	
	if (this.updateTimer > 0 && enableInput)
	{
		this.updateTimer--;
	}
	else if (enableInput)
	{		
		for (var i=0; i < screen.lines.length; i++)
		{
			var line = screen.lines[i];
			
			if (line.i < line.text.length)
			{
				if (line.i < line.text.length &&
					line.text[line.i] === '.')
				{
					this.updateTimer = this.periodDelay;
				}
				else
				{
					this.updateTimer = this.charDelay;
					if (this.textSoundPlayback === null)
					{
						this.textSoundPlayback = this.textSound.Play();
					}
				}
				
				line.i++;
				
				break;
			}
		}
	}
	
	if (this.textSoundPlayback !== null && (this.allLinesAreExpanded() || this.updateTimer > this.charDelay))
	{
		this.textSoundPlayback.stop();
		this.textSoundPlayback = null;
	}
	
	this.updateAmbientLoop();
	

	if (this.close)
	{
		menuStack.splice(menuStack.length-1,1);
		
		if (this.textSoundPlayback !== null)
		{
			this.textSoundPlayback.stop();
			this.textSoundPlayback = null;
		}
		
		if (this.onClose !== null)
		{
			this.onClose();
		}
	}
};

GlobalResourceLoader.AddSequentialImageResources("intro{0}","images/cutscene/intro{0}.png", 1, 15);
GlobalResourceLoader.AddImageResource("sheet_EndingPanels","images/cutscene/sheet_EndingPanels.txt");
GlobalResourceLoader.AddAudioResource("intro1","sound/cutscene/Intro_1_Office.mp3");
GlobalResourceLoader.AddAudioResource("intro4","sound/cutscene/Intro_2_Street.mp3");
GlobalResourceLoader.AddAudioResource("intro5","sound/cutscene/Intro_3_Alley.mp3");
GlobalResourceLoader.AddAudioResource("intro7","sound/cutscene/Intro_4_Bar.mp3");	
GlobalResourceLoader.AddAudioResource("intro13","sound/cutscene/Intro_5_BarBreath.mp3");

function ShowOpeningCutscene(musicTrackAfter)
{	
	var cutscene = new Cutscene();
	cutscene.screens = [ 
					{
					 "frame": GlobalResourceLoader.GetSprite("intro1"),
					 "ambientLoop": GlobalResourceLoader.GetSound("intro1"),
					 "lines": [
								{"x": 620, "y": 86,  "text": "Joe sat in front of his computer.", "i":0, "justify":"right"},
								{"x": 620, "y": 170,  "text": "He shook the mouse", "i":0, "justify":"right"},
								{"x": 620, "y": 199, "text": "to keep the screen", "i":0, "justify":"right"},
								{"x": 620, "y": 228, "text": "from turning off.", "i":0, "justify":"right"},
								{"x": 620, "y": 311, "text": "The office was quiet.", "i":0, "justify":"right"}
							   ]
					},
					{
					 "frame": GlobalResourceLoader.GetSprite("intro2"),
					 "ambientLoop": GlobalResourceLoader.GetSound("intro1"),
					 "lines": [
								{"x": 620, "y": 48, "text": "The time on the screen", "i":0, "justify":"right"},
								{"x": 620, "y": 76, "text": "seemed frozen.", "i":0, "justify":"right"},
								{"x": 620, "y": 132, "text": "An email arrived", "i":0, "justify":"right"},
								{"x": 620, "y": 160, "text": "from his boss.", "i":0, "justify":"right"}
							   ]
					},
					{
					 "frame": GlobalResourceLoader.GetSprite("intro3"),
					 "ambientLoop": GlobalResourceLoader.GetSound("intro1"),
					 "lines": [
								{"x": 31, "y": 50, "text": "The email didn't tell him", "i":0},
								{"x": 31, "y": 78, "text": "anything new.", "i":0},
								{"x": 31, "y": 302, "text": "He would deal", "i":0},
								{"x": 31, "y": 330, "text": "with this tomorrow.", "i":0}
							   ]
					},
					{
					 "frame": GlobalResourceLoader.GetSprite("intro4"),
					 "ambientLoop": GlobalResourceLoader.GetSound("intro4"),
					 "lines": [
								{"x": 110, "y": 41-10, "text":  "It was late but Joe", "i":0},
								{"x": 110, "y": 69-10, "text":  "wasn't hungry.", "i":0},
								{"x": 110, "y": 110-10, "text": "His hands shook", "i":0},
								{"x": 110, "y": 138-10, "text": "and his head pounded.", "i":0},
								{"x": 110, "y": 180-10,"text": "He needed a drink.", "i":0}
							   ]
					},
					{
					 "frame": GlobalResourceLoader.GetSprite("intro5"),
					 "ambientLoop": GlobalResourceLoader.GetSound("intro5"),
					 "lines": [
					 			{"x": 620, "y": 74, "text":  "Joe looked for a bar.", "i":0, "justify":"right"},
								{"x": 620, "y": 214, "text": "Distracted and", "i":0, "justify":"right"},
								{"x": 620, "y": 241, "text": "hungover, he lost", "i":0, "justify":"right"},
								{"x": 620, "y": 269, "text": "his way.", "i":0, "justify":"right"}
							   ]
					},
					{
					 "frame": GlobalResourceLoader.GetSprite("intro6"),
					 "ambientLoop": null, //GlobalResourceLoader.GetSound("intro5"),
					 "lines": [
								{"x": 620, "y": 234-40, "text": "After some time, Joe found", "i":0, "justify":"right"},
								{"x": 620, "y": 264-40, "text": "what he was looking for.", "i":0, "justify":"right"},
								{"x": 620, "y": 320-40, "text": "The bar looked like it was", "i":0, "justify":"right"},
								{"x": 620, "y": 350-40, "text": "created just for him.", "i":0, "justify":"right"}
							   ],
					 "onFirstShow": function()
					  	{ 	
					  		GlobalMusic.setVolume(0.4*settings.musicLevelGameplay);
							GlobalMusic.setTrack("title");
							GlobalMusic.play(); 
						}
					},
					{
					 "frame": GlobalResourceLoader.GetSprite("intro7"),
					 "ambientLoop": GlobalResourceLoader.GetSound("intro7"),
					 "lines": [
								{"x": 200, "y": 37, "text": "Joe stepped inside.", "i":0}, //  No music was playing.
								{"x": 107, "y": 346, "text": "He felt uncomfortable.", "i":0}
							   ]
					},
					{
					 "frame": GlobalResourceLoader.GetSprite("intro8"),
					 "ambientLoop": GlobalResourceLoader.GetSound("intro7"),
					 "lines": [
								{"x": 15, "y": 30, "text": "The Bartender beckoned ", "i":0},
								{"x": 15, "y": 57, "text": "him without a word.", "i":0}
							   ]
					},
					{
					 "frame": GlobalResourceLoader.GetSprite("intro9"),
					 "ambientLoop": GlobalResourceLoader.GetSound("intro7"),
					 "lines": [
								{"x": 620, "y": 141, "text": "Joe walked over", "i":0, "justify":"right"},
								{"x": 620, "y": 170, "text": "and sat down.", "i":0, "justify":"right"},
							   ]
					},
					{
					 "frame": GlobalResourceLoader.GetSprite("intro10"),
					 "ambientLoop": GlobalResourceLoader.GetSound("intro7"),
					 "lines": [
					 			{"x": 620, "y": 141, "text": "Joe walked over", "i":15, "justify":"right"},
								{"x": 620, "y": 170, "text": "and sat down.", "i":13, "justify":"right"},
					 			{"x": 620, "y": 226, "text": "He was served a pint", "i":0, "justify":"right"},
					 			{"x": 620, "y": 256, "text": "on the house.", "i":0, "justify":"right"}
							   ]
					},
					{
					 "frame": GlobalResourceLoader.GetSprite("intro11"),
					 "ambientLoop": GlobalResourceLoader.GetSound("intro7"),
					 "lines": [
								{"x": 160, "y": 46, "text": "The Bartender asked Joe", "i":0},
								{"x": 160, "y": 73, "text": "what was troubling him.", "i":0}
							   ]
					},
					{
					 "frame": GlobalResourceLoader.GetSprite("intro12"),
					 "ambientLoop": GlobalResourceLoader.GetSound("intro7"),
					 "lines": [
					 			{"x": 620, "y": 77, "text":  "Unable to resist a free drink,", "i":0, "justify":"right"},
								{"x": 620, "y": 107, "text": "Joe gave the ale a taste.", "i":0, "justify":"right"},
								{"x": 620, "y": 160, "text": "As he relaxed, he told", "i":0, "justify":"right"},
								{"x": 620, "y": 189, "text": "The Bartender about", "i":0, "justify":"right"},
								{"x": 620, "y": 216, "text": "how much he hated", "i":0, "justify":"right"},
								{"x": 620, "y": 244, "text": "his job.", "i":0, "justify":"right"}
							   ]
					},
					{
					 "frame": GlobalResourceLoader.GetSprite("intro13"),
					 "ambientLoop": GlobalResourceLoader.GetSound("intro13"),
					 "lines": [
								{"x": 15, "y": 30, "text": "The Bartender smoked ", "i":0},
								{"x": 15, "y": 57, "text": "as he listened.", "i":0}
							   ]
					},
					{
					 "frame": GlobalResourceLoader.GetSprite("intro14"),
					 "ambientLoop": GlobalResourceLoader.GetSound("intro13"),
					 "lines": [
								{"x": 620, "y": 35, "text": "Stress gave way to calm,", "i":0, "justify":"right"},
								{"x": 620, "y": 63, "text": "then calm to stupor.", "i":0, "justify":"right"},
								{"x": 620, "y": 147,"text": "Joe trailed off,", "i":0, "justify":"right"},
								{"x": 620, "y": 175,"text": "content to drink", "i":0, "justify":"right"},
								{"x": 620, "y": 203,"text": "and breathe the", "i":0, "justify":"right"},
								{"x": 620, "y": 233,"text": "sweet smoke.", "i":0, "justify":"right"}
							   ]
					},
					{
					 "frame": GlobalResourceLoader.GetSprite("intro15"),
					 "ambientLoop": GlobalResourceLoader.GetSound("intro13"),
					 "lines": [
								{"x": 95, "y": 330, "text": "The Bartender got to work.", "i":0}
							   ]
					}
				   ];
				   
	cutscene.onClose = function() 
	{	
		settings.cutsceneIntro = true;
		saveSettings();
		
		if (cutscene.screenIndex === cutscene.screens.length-1)
		{
			// Draw the current frame to an offscreen canvas
			cutsceneToLevelTransition = cloneCanvas1080p(displayC);
		}
		
		if (cutscene.currentAmbientSource !== null)
			cutscene.currentAmbientSource.stop();
		
		//GlobalMusic.stop(1.0);
		
		GlobalMusic.stop(4.0);  // Stop the music over the course of 4 seconds
		GlobalMusic.setTrack(musicTrackAfter);	// Set the music track to the level's music
		GlobalMusic.setVolume(settings.musicLevelGameplay);
		GlobalMusic.play(5.0);	// Play the music on a 5 second delay
	};
	
	// There's a custom transition for this cutscene handled in the onClose, so don't fade out.
	cutscene.fadeOutTime = 0;
				   
	cutscene.Show();
};

function ShowEndingCutsceneDomination(musicTrackAfter, takeAction)
{	
	var cutscene = new Cutscene();
	
	cutscene.fadeInTime = 180;
	cutscene.fadeInFrame = cloneCanvas1080p(displayC);
	
	var singleLineX = 75;
	var singleLineY = 330;
	var singleLineJustification = "left";
	
	
	cutscene.screens.push({
					 "bgColor": "#FFF",
					 "ambientLoop": null,
					 "onFirstShow": function() 
					 { 
					 	if (!takeAction)
					 		GlobalMusic.stop(1.0);
					 	GlobalMusic.setTrack("ending_dominate"); 
					 	if (!takeAction)
					 		GlobalMusic.play();
					 },
					 "lines": [
								{"x": 320, "y": 160,  "text": "Joe's mind could fight no more.", "i":0, "justify":"center", "color":"#000"},
								{"x": 320, "y": 200,  "text": "The Bartender found the last vestige", "i":0, "justify":"center", "color":"#000"},
								{"x": 320, "y": 230,  "text": "of Joe's will and cut it loose.", "i":0, "justify":"center", "color":"#000"},
							   ]
					});
	
	//[Joe at the bar, waking up from a trance]
	//Joe's eyes came back into focus. 
	//His head was swimming with booze.
	//He wasn't sure what to do. He drank way too much.
	cutscene.AddSingleLineScreens("endings/domination/1", null, singleLineX, singleLineY, singleLineJustification, 
							[
								"Joe's eyes came back into focus.",
								"His head was swimming with booze.",
								"He wasn't sure what to do."
							]);
							
	cutscene.screens[1].fadeInTime = 180;
	cutscene.screens[1].fadeInTimer = 0;				
	
	//[Joe preparing to leave]
	//He left some money on the bar stumbled away.
	//The Bartender asked Joe why he was leaving.
	cutscene.AddSingleLineScreens("endings/domination/2", ["endings/domination/a"], singleLineX, singleLineY, singleLineJustification, 
							[
								["He left some money on the bar", "and stumbled away."],
								["The Bartender asked Joe why","he was leaving."]
							]);
	
//[Edit walking away]
//Joe tried to think of a reason to go home.
//Nothing was waiting there for him.
	cutscene.AddSingleLineScreens("endings/domination/2", ["endings/domination/b"], singleLineX, singleLineY, singleLineJustification, 
							[
								["Joe tried to remember why", "he had gotten up."],
								"It was so hard to think."
								
							]);

//He realized he didn't have a reason.
//Joe began to worry about his life.
//The Bartender told Joe to relax. 
	cutscene.AddSingleLineScreens("endings/domination/2", ["endings/domination/c"], singleLineX, singleLineY, singleLineJustification, 
							[
								"Maybe he didn't have a reason.",
								"Joe began to worry.",
								"The Bartender told him to relax."
							]);

//[Edit stopped]
//The words were firm, without a hint of uncertainty.
//Joe felt himself relax.
//The Bartender told him to come back to the bar.
//Joe couldn't think of anything better to do.

	cutscene.AddSingleLineScreens("endings/domination/2", ["endings/domination/d"], singleLineX, singleLineY, singleLineJustification, 
							[
								["The stress in Joe's mind", "melted to empty bliss."],
								["The Bartender told Joe to come back", "to the bar."],
								["Joe couldn't think of anything", "he'd like more."]
							]);

//He returned to his seat.
//The Bartender praised him.
//Joe smiled.
//
//[black screen]
//Years passed.
	cutscene.screens.push({
					 "bgColor": "#000",
					 //"onFirstAdvance": function() { GlobalMusic.changeTrackWithMatching("ending_dominate"); },
					 "ambientLoop": null,
					 "lines": [
								{"x": 320, "y": 160, "text": "Years passed.", "i":0, "justify":"center"}
							   ]
					});

//[at a table, drinking with a patron, both on same side]
//Joe never returned to his life outside of the bar.
//Each day he let more and more of himself go:
//His stressful job
//His sexual repression
//His need to do anything other than what he was told.
//He wouldn't have to burden himself with thinking ever again.

	cutscene.AddSingleLineScreens("endings/domination/3", null, singleLineX, singleLineY, singleLineJustification, 
							[
								["Joe never returned to his life", "outside of the bar."],
								["Each day it became harder to", "remember his old life:"],
								"His stressful job..." ,
								"His sexual repression...",
								["His need to do anything other", "than obey his masters."],
								["He wouldn't have to burden himself", "with thinking ever again."]
							]);

//[Joe servicing a patron off to the side of the bar]
//Sometimes Joe forgot things. 
//He forgot how much he loved to suck cock.
//He forgot how badly he needed to be fucked.
//He forgot how unbelievably horny he was all the time.
//The Patrons of the bar helped Joe remember.
//He was grateful they were always there to remind him.

	cutscene.AddSingleLineScreens("endings/domination/4", null, singleLineX, singleLineY, singleLineJustification, 
							[
								"Sometimes Joe forgot things.",
								["He forgot how much he", "loved to suck cock."],
								["He forgot how badly he", "needed to be fucked."],
								["He forgot how unbelievably", "horny he was all the time."],
								["The Patrons of the bar", "helped Joe remember."],
								["He always thanked them", "for reminding him."]
							]);

//
//[View of bar with bartender looking at cop entering]
//From time to time, somebody would come looking for Joe.
//But Joe didn't want to leave.

	cutscene.AddSingleLineScreens("endings/domination/5", null, singleLineX, singleLineY, singleLineJustification, 
							[
								["From time to time, somebody", "would come looking for Joe."]
							]);

//
//[Bartender smoke kissing policeman while Joe sucks him off. Patron involved somehow, maybe fucking Joe still? Bee Cheeks, help me I cannot envision such sinful acts.]
//The Bartender made sure he would never have to.
//The police would give up the search eventually. 

	cutscene.AddSingleLineScreens("endings/domination/6", null, 620, 40, "right", 
							[
								["The Bartender made certain", "they always found him."],
								["The police would give", "up their search eventually."]
							], "top");


//[Recycle Bartender's eye]
//They always did.

	cutscene.AddSingleLineScreens("intro15", null, singleLineX, singleLineY, singleLineJustification, 
							[
								"They were running out of detectives.",
							]);



				   
	cutscene.onClose = function() 
	{	
		if (takeAction)
		{
			settings.gameBeaten = true;
			settings.gameBeatenDomination = true;
			settings.cutsceneEndingDomination = true;
			saveSettings();
			
			ShowTheEnd(musicTrackAfter, takeAction);
		}
		else
		{
			GlobalMusic.stop(1.0);
			GlobalMusic.setTrack("title"); 
			GlobalMusic.play();
		}
	};
				   
	cutscene.Show();
};

function ShowEndingCutsceneCorruption(musicTrackAfter, takeAction)
{	
	var cutscene = new Cutscene();
	
	cutscene.fadeInTime = 180;
	cutscene.fadeInFrame = cloneCanvas1080p(displayC);
	
	var singleLineX = 75;
	var singleLineY = 330;
	var singleLineJustification = "left";
	
	
	cutscene.screens.push({
					 "bgColor": "#FFF",
					 "ambientLoop": null,
					 "onFirstShow": function() 
					 { 
					 	if (!takeAction)
					 		GlobalMusic.stop(1.0);
					 	GlobalMusic.setTrack("ending_corrupt"); 
					 	if (!takeAction)
					 		GlobalMusic.play();
					 },
					 "lines": [
								{"x": 320, "y": 130,  "text": "Joe's mind could fight no more.", "i":0, "justify":"center", "color":"#000"},
								{"x": 320, "y": 170,  "text": "The Bartender planted a seed", "i":0, "justify":"center", "color":"#000"},
								{"x": 320, "y": 200,  "text": "of his perversion deep inside Joe", "i":0, "justify":"center", "color":"#000"},
								{"x": 320, "y": 230,  "text": "and let it take root.", "i":0, "justify":"center", "color":"#000"},
							   ]
					});
	
	//[joe at the bar waking up from the trance ]
	//Joe opened his eyes. 
	//His head was still swimming in a sea of booze but, 
	//ironically, the world seemed clear for the first time in years.
	cutscene.AddSingleLineScreens("endings/corruption/1", null, singleLineX, singleLineY, singleLineJustification, 
							[
								"Joe opened his eyes.",
								"His head was swimming with booze.",
								["But the world seemed clear", "for the first time in years."]
							]);
							
	cutscene.screens[1].fadeInTime = 180;
	cutscene.screens[1].fadeInTimer = 0;				
	
 	// [joe preparing to leave]
 	// He paid The Bartender, tipping him generously.
 	// He was about to stumble home to get ready for work the next day
 	// when a question emerged from the fog of inebriation.
	cutscene.AddSingleLineScreens("endings/domination/2", ["endings/corruption/a"], singleLineX, singleLineY, singleLineJustification, 
							[
								["He paid The Bartender,", "tipping him generously."],
								["He was about to stumble home to", "get ready for work the next day"],
								["when a question emerged", "from the fog of inebriation."]
							]);
	
// -small edit with joe looking at the bartender
// Joe asked if the bar ever needed a live musician.
// He was a guitarist, he told the Bartender.
// He would be willing to play for free.
// He would do anything to play again. 
	cutscene.AddSingleLineScreens("endings/domination/2", ["endings/corruption/c"], singleLineX, singleLineY, singleLineJustification, 
							[
								["Joe asked if the bar ever", "needed a live musician."],
								["He was a guitarist, he told", "the Bartender."],
								["He would be willing to play for free."],
								["He would do anything to play again."],
							]);

// -small edit with the bartender smiling
// The Bartender smirked.
	cutscene.AddSingleLineScreens("endings/corruption/2", ["endings/corruption/d"], singleLineX, singleLineY, singleLineJustification, 
							[
								["The Bartender smirked and", 
								 "beckoned Joe back to the bar."]
							]);

//[black screen]
//Years passed.
	cutscene.screens.push({
					 "bgColor": "#000",
					 "ambientLoop": null,
					 "onFirstAdvance": function() { GlobalMusic.SetAlternate(); },
					 "lines": [
								{"x": 320, "y": 160, "text": "Years passed.", "i":0, "justify":"center"}
							   ]
					});

// [two hunky guys at the bar looking at joe performing on stage]
// The patrons of the bar were pumped after 
// listening to Rancid Joe's last track. 
// It was a true punk revival.

	cutscene.AddSingleLineScreens("endings/corruption/3", null, singleLineX, singleLineY, singleLineJustification, 
							[
								["The patrons of the bar", "were pumped after listening", "to Rancid Joe's last track."],
								"It was a true punk revival."
							]);

// -small edit with the men looking at the bartender
// Two men asked The Bartender if they could meet the artist after the show.
// They were clearly enraptured by the man.
	cutscene.AddSingleLineScreens("endings/corruption/4", null, singleLineX, singleLineY, singleLineJustification, 
							[
								["Two men asked The Bartender", "if they could meet the artist", "after the show."],
								["They were clearly enraptured", "by Joe's swagger."],
							]);

// -small edit with the bartender nodding
// The Bartender, as always, nodded.
	cutscene.AddSingleLineScreens("endings/corruption/5", null, singleLineX, singleLineY, singleLineJustification, 
							[
								["The Bartender nodded."]
							]);

// [joe in his room waiting for the guys, stroking his cock]
// Joe was living in the moment, 
// riding the wave of his dreams and emotions, 
// a wild and rebellious stallion.
	cutscene.AddSingleLineScreens("endings/corruption/6", null, singleLineX + 30, singleLineY, "singleLineJustification", 
							[
								["Joe was living in the moment,", "a wild and rebellious stallion." ],
							]);


// [joe having sex with the guys,the bartender is in the background watching]
// He sang what he wanted, 
// he drank how much he wanted, 
// and he fucked whoever he pleased.
// 
// He acted upon every urge and 
// basked in the mindless pleasure of it all.
// 
// He was finally free to be the beast he'd always been inside.
	cutscene.AddSingleLineScreens("endings/corruption/7", null, singleLineX, singleLineY, singleLineJustification, 
							[
								["He sang what he wanted,", 
 								 "he drank himself wild,", 
								 "and he fucked whomever he pleased."],
								["He acted on every urge and",
								  "basked in the mindless pleasure",
								  "of it all."],
								["He was finally free to be",
								 "the beast he'd always been inside."],
							]);

// [recycle the bartender's eye]
// Or at least the beast that the bar needed him to be.
	cutscene.AddSingleLineScreens("intro15", null, singleLineX, singleLineY, singleLineJustification, 
							[
								["He was the beast the bar",
								"needed him to be."]
							]);
				   
	cutscene.onClose = function() 
	{	
		if (takeAction)
		{
			settings.gameBeaten = true;
			settings.gameBeatenCorruption = true;
			settings.cutsceneEndingCorruption = true;
			saveSettings();
			
			ShowTheEnd(musicTrackAfter, takeAction);
		}
		else
		{
			GlobalMusic.stop(1.0);
			GlobalMusic.setTrack("title"); 
			GlobalMusic.play();
		}
	};
				   
	cutscene.Show();
};

function ShowEndingCutsceneExit(musicTrackAfter, takeAction)
{	
	var cutscene = new Cutscene();
	
	cutscene.fadeInTime = 180;
	cutscene.fadeInFrame = cloneCanvas1080p(displayC);
	
	var singleLineX = 75;
	var singleLineY = 330;
	var singleLineJustification = "left";
	
	
	cutscene.screens.push({
					 "bgColor": "#FFF",
					 "ambientLoop": null,
					 "onFirstShow": function() 
					 { 
					 	if (!takeAction)
					 		GlobalMusic.stop(1.0);
					 	GlobalMusic.setTrack("ending_boyfriend"); 
					 	if (!takeAction)
					 		GlobalMusic.play();
					 },
					 "lines": [
								{"x": 320, "y": 130,  "text": "Joe's mind could fight no more.", "i":0, "justify":"center", "color":"#000"},
								{"x": 320, "y": 170,  "text": "Having crushed Joe's last defense,", "i":0, "justify":"center", "color":"#000"},
								{"x": 320, "y": 200,  "text": "The Bartender left quietly, allowing", "i":0, "justify":"center", "color":"#000"},
								{"x": 320, "y": 230,  "text": "him to rebuild on his own terms.", "i":0, "justify":"center", "color":"#000"},
							   ]
					});
	
//[joe at the bar waking up from the trance ]
//
//Joe opened his eyes. 
//He was lost and confused but felt a sense of calm.
//The stress he'd felt for years, 
//the stress that twisted his stomach into knots,
//was gone.
	cutscene.AddSingleLineScreens("endings/domination/1", null, singleLineX, singleLineY, singleLineJustification, 
							[
								"Joe opened his eyes.",
								["He was lost and confused", "but felt a sense of calm."],
								["The stress he'd felt for years,", "that twisted his stomach into knots..."],
								"The stress was gone."
							]);
							
	cutscene.screens[1].fadeInTime = 180;
	cutscene.screens[1].fadeInTimer = 0;				
	
//[joe preparing to leave]
//He paid The Bartender, tipping him generously,
//and stumbled out of the bar. He never looked back.
	cutscene.AddSingleLineScreens("endings/domination/2", ["endings/corruption/a"], singleLineX, singleLineY, singleLineJustification, 
							[
								["He paid The Bartender,", "tipping him generously,", "and stumbled towards the door."],
							]);
	
//
//Joe couldn't remember what had happened that night. 
//He held on to fragments of memories: 
//clouds of smoke, 
//an exhausting struggle, 
//a piercing red gaze.
//But it didn't matter. From that moment on, his life began to change.
	cutscene.AddSingleLineScreens("endings/domination/2", ["endings/corruption/b"], singleLineX, singleLineY, singleLineJustification, 
							[
								["Joe didn't remember", "what had happened that night."],
								["He held on to fragments of memories:"],
								["Clouds of smoke,"],
								["An exhausting struggle,"],
							]);
		
	cutscene.AddSingleLineScreens("intro15", null, singleLineX, singleLineY, singleLineJustification, 
							[
								["A piercing red gaze..."],
							]);

	cutscene.AddSingleLineScreens("endings/domination/2", ["endings/corruption/c"], singleLineX, singleLineY, singleLineJustification, 
							[
								["But it didn't matter."],
								["From that moment on,", "his life began to change."],
								["He never looked back."]
							]);

//[black screen]
//Years passed.
	cutscene.screens.push({
					 "bgColor": "#000",
					 "ambientLoop": null,
					 //"onFirstAdvance": function() { GlobalMusic.changeTrackWithMatching("ending_boyfriend"); },
					 "lines": [
								{"x": 320, "y": 160, "text": "Years passed.", "i":0, "justify":"center"}
							   ]
					});

//[joe and boyfriend looking at joe's new cd]
//
//It finally arrived. 
//After years of sweat and sacrifice, 
//Joe's debut album was finally a reality. 
//He cradled the first pressing like a newborn baby.
	cutscene.AddSingleLineScreens("endings/exit/1", null, singleLineX, singleLineY, singleLineJustification, 
							[
								 "It finally arrived.",
								["After years of sweat and sacrifice,",
								 "Joe's debut album was finally a reality."],
								["He cradled the first pressing", 
								 "like a newborn baby."]
							]);

//[joe hugs happily his boyfriend]
//Things had finally turned around. 
//
//It was hard at first: quitting his job, accepting his sexuality, 
//and risking it all on a musical career. He could have never done it alone. 

	cutscene.AddSingleLineScreens("endings/exit/2", null, singleLineX, singleLineY, singleLineJustification, 
							[
								["Things had finally turned around."],
								["It was hard at first: quitting his job,", 
								 "accepting his sexuality,",
								 "and risking it all on a musical career."],
								 "He could have never done it alone."
							]);

//[joe looks lovingly at his boyfriend]
//
//Joe met John online. They sent each other messages about music 
//for a month before Joe found courage to open up.
//Within a week, they met in person and started dating.
//
//John was a loving and kind person. 
//He supported Joe unconditionally, 
//and in turn, Joe helped him in every way he could.
	cutscene.AddSingleLineScreens("endings/exit/3", null, singleLineX, singleLineY, singleLineJustification, 
							[
								["Joe met John online."],
								["They exchanged messages about music",
								 "for a month before Joe found courage", 
								 "to open up."],
								["Within a week, they met in person",
								 "and started dating."],
								 "John was a loving and kind person.",
								["He supported Joe unconditionally, ",
								 "and in turn, Joe helped him",
								 "any way he could."],
							]);

//[small edit with joe giving john a naughty look]
//Still...
//
//From time to time, something stirred deep in Joe's soul.
//A low fire burned from that night in the seedy bar.
//He didn't know what it was, but it
//was powerful, hungry and it demanded attention.
	cutscene.AddSingleLineScreens("endings/exit/4", null, singleLineX, singleLineY, "singleLineJustification", 
							[
								"Still...",
								["From time to time, something stirred", 
								"deep in Joe's soul."],
								["A low fire burned from that night",
								 "in the seedy bar."],
								"He didn't know what it was,",
								"But it was powerful,",
								"It was hungry,",
								"And it demanded attention.",
							]);


//[joe and john in their bedroom having wild sex in s/m gear]
//
//John must have wondered why his unassuming boyfriend 
//turned into such a beast in the sheets, 
//but he never complained. 
//
//Joe let himself go completely.
//He knew that John would never tame the caged animal lurking inside of him. 
//He knew that John would never let it break free.
//
//Joe was happy to have somebody he could trust.
//Joe was happy.
	cutscene.AddSingleLineScreens("endings/exit/5", null, 615, 40, "right", 
							[
								["John must have wondered why his", 
 								 "unassuming boyfriend turned into", 
								 "such a beast in the sheets."],
								 "But he never complained.",
								 "Joe let himself go completely.",
								["He knew that John would never tame",
								 "the caged animal lurking inside of him."],
								["He also knew that John would never",
							     "let it break free."],
							     ["Joe was happy to have somebody", "he could trust."],
							     "Joe was happy.",
							], "top");
				   
	cutscene.onClose = function() 
	{	
		if (takeAction)
		{
			settings.gameBeaten = true;
			settings.gameBeatenWithoutSaves = true;
			settings.cutsceneEndingBoyfriend = true;
			saveSettings();
			
			ShowTheEnd(musicTrackAfter, takeAction);
		}
		else
		{
			GlobalMusic.stop(1.0);
			GlobalMusic.setTrack("title"); 
			GlobalMusic.play();
		}
	};
				   
	cutscene.Show();
};

function ShowTheEnd(musicTrackAfter, takeAction)
{	
	var cutscene = new Cutscene();
	
	cutscene.fadeInTime = 90;

	cutscene.screens.push({
					 "onFirstShow": function() 
					 { 
					 	//GlobalMusic.stop(4.0);
					 },
					 "bgColor": "#000",
					 "ambientLoop": null,
					 "lines": [
								{"x": 320, "y": 160, "text": "The End", "i":0, "justify":"center"}
							   ]
					});
				   
	cutscene.onClose = function() 
	{	
		if (takeAction)
		{
			GlobalMusic.ClearAlternate();
			GlobalMusic.stop(2.0);
			DismissAllMenus();
			resetGame();
		}
		
		if (settings.gameBeatenDomination && settings.gameBeatenCorruption && settings.gameBeatenWithoutSaves && !settings.debugUnlockMessage)
		{
			var fullscreenNotification = new ModalMessage("Debug mode unlocked!");
			//fullscreenNotification.autoDismiss = true;
			fullscreenNotification.Show();
			settings.debugUnlockMessage = true;
		}
		if (!settings.galleryUnlockMessage)
		{
			var fullscreenNotification = new ModalMessage("Cutscene gallery unlocked!");
			//fullscreenNotification.autoDismiss = true;
			fullscreenNotification.Show();
			settings.galleryUnlockMessage = true;
		}
		
		ShowCreditsCutscene();
		
		saveSettings();
		
	};
				   
	cutscene.Show();
};

function ShowGameOverCutscene(screen)
{
	var takeAction = true;
	if(typeof(screen)==='undefined')
	{
		screen = level.gameOverScreen;
	}
	else
	{
		takeAction = false;
	}
	
	var posX = 150;
	var posY = 190;
	var color = "#FFF";
	var bgColor = "#FFF";
	var frame = GlobalResourceLoader.GetSprite(screen);
	var gameOverStr = "Game Over";
	var line1 = "Joe's will proved too strong.";
	var line2 = "The Bartender's mind was";
	var line3 = "swallowed whole.";
	
	
	var screenNameParts = screen.split("_");
	if (screenNameParts[0]==="gameover0")
	{
	    line1 = "The Bartender couldn't resist.";
	    line2 = "The smoke was too sweet.";
	    line3 = "The buzz, too potent.";
	    gameOverStr = "Smoking Kills";
	}
	if (screenNameParts.length === 3)
	{
		var pos = screenNameParts[2].split("x");
		posX = parseInt(pos[0]);
		posY = parseInt(pos[1]);
		color = "#" + screenNameParts[1];
		bgColor = "#FFF";
		
	}
	else
	{
		posX = 220;
		posY = 190;
		frame = null;
		screen = null;
		bgColor = "#000";
	}
	
	var cutscene = new Cutscene();
	cutscene.screens = [ 
					{
					 "bgColor": "#FFF",
					 "ambientLoop": null,
					 "onFirstShow": function() { GlobalMusic.stop(4.0); },
					 "lines": [
								{"x": 150, "y": 140,  "text": line1, "i":0, "justify":"left", "color":"#000"},
								{"x": 150, "y": 170,  "text": line2, "i":0, "justify":"left", "color":"#000"},
								{"x": 150, "y": 200,  "text": line3, "i":0, "justify":"left", "color":"#000"}
							   ]
					},
					{
					 "bgColor": bgColor,
					 "frame": frame,
					 "fadeInTime": 180,
					 "fadeInTimer": 0,
					 "ambientLoop": null,
					 "lines": [
					 			{"x": posX, "y": posY, "text": gameOverStr, "i":0, "justify":"left", "size":40, "color":color}
							  ]
					}
				   ];
				   
	cutscene.fadeInTime = 180;
	cutscene.fadeInFrame = cloneCanvas1080p(displayC);
	cutscene.fadeOutColor = ctx.fillStyle = "#e30f4b";
	
	cutscene.onClosing = function() 
	{	
		if (screen !== null)
		{
			if (screen.startsWith("gameover1_"))
				settings.cutsceneGameOverLevel1 = true;
			else if (screen.startsWith("gameover2_"))
				settings.cutsceneGameOverLevel2 = true;
			else if (screen.startsWith("gameover3_"))
				settings.cutsceneGameOverLevel3 = true;
			else if (screen.startsWith("gameover4_"))
				settings.cutsceneGameOverLevel4 = true;
			else if (screen.startsWith("gameover5_"))
				settings.cutsceneGameOverLevel5 = true;
		}
		saveSettings();
		
		if (savedGameExists() && gameOverResumeSaved)
		{
			var menu2 = new SettingsMenu();
			menu2.useGlobalBackground = false;	// Inherit whatever is behind, even if other menus are open
			menu2.allowBackout = false;
		
			menu2.title = "Continue?";
			menu2.items = [	
							{ "element":"spacer", "size":67},
							{ "element":"button", "label":"Yes", "onClick":function()
								{ 
									if (takeAction)
									{
										useContinue();
									}
									menu2.startCloseTime = menu2.timer;
									menu2.endCloseTime = menu2.timer + 60;
									menu2.closing = true;
							
								} 
							},
							{ "element":"button", "label":"No", "onClick":function()
								{ 
									if (takeAction)
									{
										GlobalMusic.ClearAlternate();
										GlobalMusic.stop(0.25);
										DismissAllMenus();
										resetGame();
									}
									else
									{
										menu2.startCloseTime = menu2.timer;
										menu2.endCloseTime = menu2.timer + 60;
										menu2.closing = true;
									}
								} 
							}
						];
			menu2.Show();
		}
		else
		{
			if (takeAction)
			{
				GlobalMusic.ClearAlternate();
				GlobalMusic.stop(0.25);
				DismissAllMenus();
				resetGame();
			}
			//else
			//{
			//	menu2.startCloseTime = menu2.timer;
			//	menu2.endCloseTime = menu2.timer + 60;
			//	menu2.closing = true;
			//}
		}
	};
	
	cutscene.Show();
};


function ShowCreditsCutscene()
{	
	var introOfficeAngel = new OfficeAngel();
	introOfficeAngel.animationModel.ChangeState("walk");
	introOfficeAngel.velX = 8.0;
	introOfficeAngel.velY = 0.0;
	introOfficeAngel.posX = -100;
	introOfficeAngel.posY = 280;
	
	var introPunkPuppy = new PunkPuppy();
	introPunkPuppy.animationModel.ChangeState("walk");
	introPunkPuppy.velX = 16;
	introPunkPuppy.velY = 0.0;
	introPunkPuppy.posX = 890;
	introPunkPuppy.posY = 280;
	
	var introTimer = 0;
	
	var soundShake = new EarthQuakeNoise(12,0.7);
	var soundBackground = GlobalResourceLoader.CloneSprite("credits1");
	var soundShakeTimer = 0;
	
	var codeBackground = GlobalResourceLoader.CloneSprite("credits2");
	var codeForeground = GlobalResourceLoader.GetSprite("credits2");
	var codeLayer = GlobalResourceLoader.GetSprite("credits2_codelayer");
	var codeCtx = codeBackground.sourceImage.getContext("2d");
	var codeScroll = 0;
	
	var artBackground = GlobalResourceLoader.CloneSprite("credits3");
	var artForeground = GlobalResourceLoader.GetSprite("credits3");
	var artLevel1 = GlobalResourceLoader.GetSprite("art_bg1");
	var artLevel2 = GlobalResourceLoader.GetSprite("art_bg2");
	var artLevel3 = GlobalResourceLoader.GetSprite("art_bg3");
	var artLevel4 = GlobalResourceLoader.GetSprite("art_bg4");
	var artLevel5 = GlobalResourceLoader.GetSprite("art_bg5");
	var artLevels = [artLevel2,artLevel4,artLevel5];
	var levelIndex = 0;
	var artCtx = artBackground.sourceImage.getContext("2d");
	var artTimer = 0;
	var artScroll = 80;
	var artAlpha = 0.8;
	var artY = [100,40,80];

	// Blit the foreground back over it
	artCtx.fillStyle = "#FFF";
	artCtx.fillRect(artScroll,artY[0],320,180);
	artCtx.globalAlpha = artAlpha;
	artCtx.drawImage(artLevels[0].sourceImage,0,0,640,360,artScroll,artY[0],320,180);
	artCtx.globalAlpha = 1.0;
	artCtx.fillRect(0,225,640,100);
	artCtx.globalCompositeOperation = "multiply";
	artCtx.drawImage(artForeground.sourceImage,0,0);
	artCtx.globalCompositeOperation = "source-over";
	
	var lastAudioCheck = 0;
	
	var cutscene = new Cutscene();
	cutscene.screens = [ 
					{
					 "bgColor": "#000",
					 "autoAdvanceTimer":860,
					 "onFirstShow": function() 
					 	{ 
							GlobalMusic.stop(1.0); 
							GlobalMusic.setTrack("credits");
							GlobalMusic.play(); 
					 	},
					 "lines": [
								{"x": 320, "y": 180,  "text": "Strange Flesh Staff", "i":0, "size":30, "justify":"center", "color":"#FFF"}
							   ],
					 "onUpdate": function()
					 {
					 	if (introTimer < 420)
					 	{
							introOfficeAngel.animationModel.Update();
							introOfficeAngel.posX += 2.0;
					 	}
					 	
					 	if (introTimer > 520)
					 	{
							introOfficeAngel.animationModel.Update();
							introOfficeAngel.posX -= 4.0;
							introOfficeAngel.velX = -16;
							introOfficeAngel.facing = -1;
							
							introPunkPuppy.animationModel.Update();
							introPunkPuppy.posX -= 4.2;
							introPunkPuppy.facing = -1;
							introPunkPuppy.velX = -16;
					 	}
					 	
					 	introTimer++;
					 },
					 "onDraw": function()
					 {
					 	var image = introOfficeAngel.animationModel.GetBaseFrame();
					 	if (image !== null)
					 		image.DrawSprite(introOfficeAngel.posX, introOfficeAngel.posY, introOfficeAngel.facing===-1);
					 		
					 	image = introPunkPuppy.animationModel.GetBaseFrame();
					 	if (image !== null)
					 		image.DrawSprite(introPunkPuppy.posX, introPunkPuppy.posY, introPunkPuppy.facing===-1);
					 }
					},
					
					{
					 "frame": soundBackground,
					 "autoAdvanceTimer":860,
					 "lines": [],
					 "onUpdate": function()
					 {
					 	// If we aren't pulsing, pulse on the next intro or loop track beat
						var now = audioContext.currentTime;
		
						if (GlobalMusic.lastQueuedTrack !== null && GlobalMusic.lastQueuedTrack.trackName === "credits")
						{
							// Get the current sample...
							var startSample = (lastAudioCheck - GlobalMusic.lastQueuedTrack.startTime) * 44100;
							var endSample = (now - GlobalMusic.lastQueuedTrack.startTime) * 44100;
			
							// Check if the current segment has a beat between this sample and the last
							if (startSample > 0 && GlobalMusic.lastQueuedTrack.segment.IsBeatInSampleInterval(startSample,endSample))
							{
								// Vibrate the sound logo
								soundShakeTimer = 20;
							}
						}
						lastAudioCheck = now;
						
						
						if (soundShakeTimer > 0)
						{
							soundShakeTimer--;
							if (soundShakeTimer < 10)
								soundBackground.info.centerX = soundShake.getVal(soundShakeTimer);
						}
						else
						{
							soundBackground.info.centerX = 0;
						}
						
					 }
					},
					{
					 "frame": codeBackground,
					 "autoAdvanceTimer":860,
					 "lines": [],
					 "onUpdate": function()
					 {
					 	// If we aren't pulsing, pulse on the next intro or loop track beat
						var now = audioContext.currentTime;
		
						if (GlobalMusic.lastQueuedTrack !== null && GlobalMusic.lastQueuedTrack.trackName === "credits")
						{
							// Get the current sample...
							var startSample = (lastAudioCheck - GlobalMusic.lastQueuedTrack.startTime) * 44100;
							var endSample = (now - GlobalMusic.lastQueuedTrack.startTime) * 44100;
			
							// Check if the current segment has a beat between this sample and the last
							if (startSample > 0 && GlobalMusic.lastQueuedTrack.segment.IsBeatInSampleInterval(startSample,endSample))
							{
								// Vibrate the sound logo
							}
						}
						lastAudioCheck = now;
						
						
						// Blit the foreground back over it
						codeCtx.drawImage(codeLayer.sourceImage,255,100-codeScroll);
						codeCtx.fillStyle = "#FFF";
						codeCtx.fillRect(0,225,640,100);
						codeCtx.globalCompositeOperation = "multiply";
						codeCtx.drawImage(codeForeground.sourceImage,0,0);
						codeCtx.globalCompositeOperation = "source-over";
						
						codeScroll += 1;
						
					 }
					},
					
					{
					 "frame": artBackground,
					 "autoAdvanceTimer":860,
					 "lines": [],
					 "onUpdate": function()
					 {
					 	artTimer++;
					 	
					 	// If we aren't pulsing, pulse on the next intro or loop track beat
						var now = audioContext.currentTime;
		
						if (GlobalMusic.lastQueuedTrack !== null && GlobalMusic.lastQueuedTrack.trackName === "credits")
						{
							// Get the current sample...
							var startSample = (lastAudioCheck - GlobalMusic.lastQueuedTrack.startTime) * 44100;
							var endSample = (now - GlobalMusic.lastQueuedTrack.startTime) * 44100;
			
							// Check if the current segment has a beat between this sample and the last
							if (artTimer < 740 && startSample > 0 && GlobalMusic.lastQueuedTrack.segment.IsBeatInSampleInterval(startSample,endSample))
							{
								// Change the background
								levelIndex += 1;
								
							}
						}
						lastAudioCheck = now;
						
						var ind = clamp(Math.floor(levelIndex / 12),0,artLevels.length-1);
						
						// Blit the foreground back over it
						artCtx.fillStyle = "#FFF";
						artCtx.fillRect(artScroll,artY[ind],320,180);
						artCtx.globalAlpha = artAlpha;
						artCtx.drawImage(artLevels[ind].sourceImage,0,0,640,360,artScroll,artY[ind],320,180);
						artCtx.globalAlpha = 1.0;
						artCtx.fillRect(0,225,640,100);
						artCtx.globalCompositeOperation = "multiply";
						artCtx.drawImage(artForeground.sourceImage,0,0);
						artCtx.globalCompositeOperation = "source-over";
						
						if (ind % 2 == 0)
							artScroll += 0.5;
						else
							artScroll -= 0.5;
							
						artScroll = clamp(artScroll,-70,250);
						
					 }
					},
					{
					 "bgColor": "#000",
					 "fadeInTime": 0,
					 "fadeInTimer": 0,
					 "autoAdvanceTimer":600,
					 "onFirstShow": function() 
					 	{ 
					 		cutscene.autoAdvance = true;
							//GlobalMusic.stop(4.0);
					 	},
					 "lines": [
					 			{"x": 320, "y": 80,  "text": "Voices", "i":0, "size":30, "justify":"center", "color":"#FFF"},
					 			
					 			{"x": 310, "y": 180,  "text": "The Bartender", "i":0, "size":20, "justify":"right", "color":"#FFF"},
								{"x": 330, "y": 180,  "text": "Aaron \"HumDog\" Scott", "i":0, "size":20, "justify":"left", "color":"#FFF"},
								
								{"x": 310, "y": 210,  "text": "Joe 1/2, Misc", "i":0, "size":20, "justify":"right", "color":"#FFF"},
								{"x": 330, "y": 210,  "text": "Fann", "i":0, "size":20, "justify":"left", "color":"#FFF"},

								{"x": 310, "y": 240,  "text": "Joe 3/4/Boss", "i":0, "size":20, "justify":"right", "color":"#FFF"},
								{"x": 330, "y": 240,  "text": "bearpad", "i":0, "size":20, "justify":"left", "color":"#FFF"},
							   ]
					},
					
					{
					 "bgColor": "#000",
					 "fadeInTime": 0,
					 "fadeInTimer": 0,
					 "autoAdvanceTimer":800,
					 "onFirstShow": function() 
					 	{ 
					 		cutscene.autoAdvance = true;
							//GlobalMusic.stop(4.0);
					 	},
					 "lines": [
					 			{"x": 320, "y": 80,  "text": "Special Thanks To", "i":0, "size":30, "justify":"center", "color":"#FFF"},
					 			
					 			{"x": 310, "y": 120,  "text": "Captaingerbear", "i":0, "size":20, "justify":"center", "color":"#FFF"},
					 			{"x": 310, "y": 140,  "text": "Donkey Punch", "i":0, "size":20, "justify":"center", "color":"#FFF"},
					 			{"x": 310, "y": 160,  "text": "Majkol \"Zaru\" Robuschi", "i":0, "size":20, "justify":"center", "color":"#FFF"},
					 			{"x": 310, "y": 180,  "text": "Bellua", "i":0, "size":20, "justify":"center", "color":"#FFF"},
					 			{"x": 310, "y": 200,  "text": "The Punk Puppy", "i":0, "size":20, "justify":"center", "color":"#FFF"},
					 			{"x": 310, "y": 220,  "text": "Satan, Lord of Darkness", "i":0, "size":20, "justify":"center", "color":"#FFF"},
					 			{"x": 310, "y": 260,  "text": "and", "i":0, "size":16, "justify":"center", "color":"#FFF"},
					 			{"x": 310, "y": 300,  "text": "Our Very Patient Fans", "i":0, "size":20, "justify":"center", "color":"#FFF"},

							   ]
					},
					
					{
					 "bgColor": "#000",
					 "fadeInTime": 90,
					 "fadeInTimer": 0,
					 "onFirstShow": function() 
					 	{ 
					 		cutscene.autoAdvance = false;
							//GlobalMusic.stop(4.0);
					 	},
					 "lines": [
								{"x": 320, "y": 180,  "text": "Thanks for Playing!", "i":0, "size":40, "justify":"center", "color":"#FFF"}
							   ]
					},
				   ];
		
	cutscene.autoAdvance = true;		   
	cutscene.fadeInTime = 60;
	//cutscene.fadeInFrame = cloneCanvas1080p(displayC);
	cutscene.fadeOutColor = "#000";
	
	cutscene.onClosing = function() 
	{	
		GlobalMusic.stop(4.0); 
		settings.seenCredits = true;
		saveSettings();
		GlobalMusic.setTrack("title");
		GlobalMusic.play(2.0); 
	};
	
	cutscene.Show();
};
