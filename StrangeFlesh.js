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

if (typeof(process) !== "undefined" && process.versions.electron)
{
    app = require('@electron/remote').app;
	BrowserWindow = require('@electron/remote').BrowserWindow;
}

// Some globals that our includes might want to use
var levelcache = {};

var devDebug = false;
var enableDebug = false;
var debug = 0;
var playernoclip = false;
var permadrunk = false;
var isEditor = false;
var enableCameraCollision = false;
var pause = false;
var nextObjectID = 0;

var watermarkEnabled = false;
var watermarkOwner = ""

var lives = 1;
var startingLives = 5;
var continuesUsed = 0;
var neverSaved = true;
var windowSettingsStale = true;
var windowSizeStale = true;

var gameOverResumeSaved = false;
var settings = {};

var entityFrameskip = 0;
var entityFrameskipCounter = 0;

var debugSpawnerList = [	"Joe0",
							"Joe1",
							"Joe2",
							"Joe3",
							"Joe4",
							"Joe5",
							"OfficeAngel",
							"Admonitor",
							"ColombianRescue",
							"Bottley",
							"EDRider",
							"StarvingArtist",
							"FartherFigure",
							"Dissolution",
							"PunkPuppy",
							"PartyAnimal",
							"Fister",
							"VirusFromVenus", 
							"Bartender",
							"PottedPlant",
							"WaterCooler",
							"VendingMachine",
							"DestructableItem",
							"Car",
							"CollectableOrb",
							"LifeOrb",
							"OrcSpeaker",
							"BallGag",
							"Checkpoint",
							"GlassDoor"
						  ];
var debugSpawnerSelection = 0;

// Controller object
var controller = null;

// Engine stuff
var fps = 60;
var measuredFps = 0;
var frameTimes = [];
var lowFPSCount = 0;
var lowFramerateDetected = false;
var pxScale = 3.0;
var c;
var ctx;
var displayC;
var displayCtx;
var updateTimer;
var camera;
var player;
var playerStack = [];
var playerFirstSpawn = true;
var startupTimer = 0;
var respawnCounter = 0;
var hud;
var enemyinfo;
var debugoverlay;

var level = null;
var overlays=[];
var menuStack=[];

// Define global acceleration due to gravity.
var gravity = 2.4;

var soundWaveTrigger = 0;

// Define a function that appends other scripts to the HTML file header
function include(url)
{
	try 
	{
		// Get the header of the HTML file
		var head = document.getElementsByTagName('head')[0];
	
		// Create a new script element
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;
		script.async = false;

		// Append the script element
		head.appendChild(script);
	}
	catch(err) 
	{
		GlobalResourceLoader.loadingError = true;
		GlobalResourceLoader.errorMessages.push("An ad blocker has prevented the game from loading.");
		GlobalResourceLoader.errorMessages.push(err);
		GlobalResourceLoader.allReady = false;
		GlobalResourceLoader.allReadyCheckValid = false;
	}
};

// Now use that function to include other files we want.
// It's almost like using a non-shitty language!
include("Font.js");
include("SupersampledTextRenderer.js");
include("FileSaver.js");
include("ResourceLoader.js"); // Load this guy first, it creates GlobalResourceLoader
include("SuspendableSound.js");
include("RandomSoundCollection.js");
include("DrawingUtility.js");
include("MathUtility.js");
include("StackBlur.js");
include("GlobalLight.js");
include("CollisionShapes.js");
include("SkirmishBox.js");
include("TransitionBox.js");
include("EntityList.js");
include("MatrixTransformation2D.js");
include("CanvasCamera.js");
include("Controller.js");
include("PlayerInputController.js");
include("Combat.js");
include("Animation.js");
include("EffectAnimation.js");
include("DualOwnerEffectAnimation.js");
include("RepeatingBackground.js");
include("SkewRectangle.js");
include("Rectangle.js");
include("LevelCollisionMask.js");
include("BlownSmoke.js");
include("HitSpark.js");
include("SmokeVolume.js");
include("SmokePuff.js");
include("SmokeKissPuff.js");
include("SmokeKissFallSmoke.js");
include("EntityStates.js");
include("AICore.js");
include("WalkingEntity.js");
include("DroppedItem.js");
include("EntitySpawner.js");
include("Level.js");
include("Bartender.js");
include("Music.js");
include("HUD.js");
include("CollectableOrb.js");
include("EnemyInfo.js");
include("MainMenu.js");
include("ModalMessage.js");
include("GameOver.js");
include("SettingsMenu.js");
include("TitleCardMenu.js");
include("Cutscene.js");
include("LevelStartTransition.js");
include("DebugOverlay.js");
include("Checkpoint.js");
// almost

function StrangeFlesh() 
{   
	// Load all the image resources our included objects want
	GlobalResourceLoader.LoadAll();
	
	// Locate the canvas element and size it
	displayC = document.getElementById("gameCanvas");
	displayCtx = displayC.getContext("2d",{alpha: false});
	
	// Setup the internal drawing canvas
	c = document.createElement("canvas");
	c.width = 640;
	c.height = 360;
	ctx = c.getContext("2d");

	editPanel = document.getElementById("editPanel");

	fileInput = document.getElementById('levelLoader');
    fileInput.addEventListener('change', chooseLevelFile)
    document.addEventListener("fullscreenchange", onFullScreenChanged);
    
    camera = new CanvasCamera();
	camera.clipEnabled = true;
	resizeCanvas(false);

	// Setup the controller object to enhance keyboard input
	controller = new PlayerInputController();
	enableKeyInput();

    // Load the settings
	loadSettings();
	
	// Setup a timer to update the canvas on set intervals
	var timerInterval = (1/fps)*1000;
	updateTimer = setInterval(tick,timerInterval);
	
	// Start the drawing loop
	drawAll();
	
	// Push out the global lighting overlay
	//var light = new GlobalLight();
	//light.lightColor = "#6c1732";
	//light.alpha = 0;
	//overlays.push(light);
	
	try 
	{
		var admonitorTest = new Admonitor();
		var maxMoveVelocity = admonitorTest.GetMoveMaxVelocity();
		if (maxMoveVelocity !== 11)
			throw "Load error";
	}
	catch(err) 
	{
		GlobalResourceLoader.loadingError = true;
		GlobalResourceLoader.errorMessages.push("Your ad blocker has blocked Strange Flesh!");
		GlobalResourceLoader.errorMessages.push("Disable your ad blocker and try again");
		GlobalResourceLoader.errorMessages.push("You may also need to clear your cache");
		GlobalResourceLoader.allReady = false;
		GlobalResourceLoader.allReadyCheckValid = false;
	}
	
	ctx.imageSmoothingEnabled = (settings.renderMode == 2);
	ctx.webkitImageSmoothingEnabled = (settings.renderMode == 2);
	ctx.mozImageSmoothingEnabled = (settings.renderMode == 2);
	
	// Create the HUD and push it on to the overlays collection
	enemyinfo = new EnemyInfo();
	overlays.push(enemyinfo);
	hud = new HUD();
	overlays.push(hud);
	debugoverlay = new DebugOverlay();
	overlays.push(debugoverlay);
	
	GlobalMusic.setVolume(settings.musicLevelGameplay);
	GlobalMusic.setTrack("title");
	GlobalMusic.play();
	
	var gbTitle = new TitleCardMenu(resetGame);
	gbTitle.Show();
	
	GlobalResourceLoader.GameReady();
};

function resetGame()
{
	// Create the player
	player = new Bartender();
	player.disableSpawnOnScroll = true;
	player.ChangeAlliance(1)
	player.controller = controller;
	
	enemyinfo.Clear();
	hud.Reset();
	ClearSuspendableSounds();
	
	neverSaved = true;
	lives = startingLives;
	enemiesDispatched = 0;
	enemiesCorrupted = 0;
	totalEnemies = 948;
    
	playerFirstSpawn = true;
	startupTimer = 0;
	respawnCounter = 0;
	entityFrameskip = 0;
	entityFrameskipCounter = 0;
	
	GlobalResourceLoader.GameNotReady();
	menuStack = [];
	clearLevelCache();
	loadLevelFromURL("level0", false);
	
	gameOverResumeSaved = false;
	
	var lst = new LevelStartTransition();
	lst.Show();
	
	ShowOpeningCutscene("level0");

	var mainMenu = new MainMenu();
	mainMenu.Show();
};

function saveGame()
{
	var levelCacheDescriptors = {};
	
	for (var property in levelcache) 
	{
		if (levelcache.hasOwnProperty(property))
		{
			levelCacheDescriptors[property] = levelcache[property].GenerateDescriptor();
		}
	}
	
	var savedGame = { 
						"lives": lives,
						"playerHealth": player.health,
						"playerState": player.state,
						"playerStateFrames": player.stateFrames,
						"playerGravity": player.gravity,
						"playerSexMeter": player.sexMeter,
						"continuesUsed": continuesUsed,
						"levelCacheDescriptors": levelCacheDescriptors,
						"currentLevel": level.levelName,
						"startupTimer": startupTimer,
						"enemiesDispatched": enemiesDispatched,
						"enemiesCorrupted": enemiesCorrupted,
						"totalEnemies": totalEnemies
					};
					
	gameOverResumeSaved = true;
	neverSaved = false;
					
	var savedGameString = JSON.stringify(savedGame);
	localStorage.setItem("SavedGame",savedGameString);
};

function savedGameExists()
{
	return localStorage.getItem("SavedGame") !== null;	
};

function loadGame()
{
	var savedGameString = localStorage.getItem("SavedGame");
	if (savedGameString !== null)
	{
		neverSaved = false;
		
		var savedGame = JSON.parse(savedGameString);
		GlobalResourceLoader.GameNotReady();
		
		lives = savedGame.lives;
		continuesUsed = savedGame.continuesUsed;
		
		clearLevelCache();
		
		for (var property in savedGame.levelCacheDescriptors) 
		{
			if (savedGame.levelCacheDescriptors.hasOwnProperty(property))
			{
				var levelObj = new Level();
				levelObj.LoadFromLevelDescriptor(savedGame.levelCacheDescriptors[property]);
				levelObj.levelName = property;
				levelcache[property] = levelObj;
			}
		}
		
		playerFirstSpawn = false;
		hud.Reset();
		
		if(savedGame.hasOwnProperty("startupTimer"))
			startupTimer = savedGame.startupTimer;
		
		if(savedGame.hasOwnProperty("enemiesDispatched"))
		{
			enemiesDispatched = savedGame.enemiesDispatched;
			enemiesCorrupted = savedGame.enemiesCorrupted;
			totalEnemies = savedGame.totalEnemies;
		}
		
		loadLevelFromURL(savedGame.currentLevel, true);
		
		
		player.health = savedGame.playerHealth;
		player.sexMeter = savedGame.playerSexMeter;
		player.ChangeState(savedGame.playerState);
		player.stateFrames = savedGame.playerStateFrames;
		player.gravity = savedGame.playerGravity;
		
		gameOverResumeSaved = true;
		
		return savedGame.currentLevel;
		
	}
	
	return null;
};

function saveSettings()
{
	if (BrowserWindow)
	{
		if (!settings.fullscreenMode)
		{
			settings.windowLocationX = BrowserWindow.getFocusedWindow().x;
			settings.windowLocationY = BrowserWindow.getFocusedWindow().y;
			settings.windowSizeX = BrowserWindow.getFocusedWindow().width;
			settings.windowSizeY = BrowserWindow.getFocusedWindow().height;
		}
	}

    settings["upButtonConfig"] = controller.upButtonMonitor.GetConfig();
    settings["downButtonConfig"] = controller.downButtonMonitor.GetConfig();
    settings["leftButtonConfig"] = controller.leftButtonMonitor.GetConfig();
    settings["rightButtonConfig"] = controller.rightButtonMonitor.GetConfig();
    settings["punchButtonConfig"] = controller.punchButtonMonitor.GetConfig();
    settings["smokeButtonConfig"] = controller.smokeButtonMonitor.GetConfig();
    settings["grabButtonConfig"] = controller.grabButtonMonitor.GetConfig();
    settings["specialButtonConfig"] = controller.specialButtonMonitor.GetConfig();
    settings["jumpButtonConfig"] = controller.jumpButtonMonitor.GetConfig();
    settings["startButtonConfig"] = controller.startButtonMonitor.GetConfig();

	var settingsString = JSON.stringify(settings);
	localStorage.setItem("GameSettings", settingsString);	
};

function loadSettings()
{
	windowSettingsStale = true;
	windowSizeStale = true;

	settings = {
						// Basic settings
						"renderMode": 0,
						"scalingQuality": 0,
						"enableRetina" : false,
						"musicLevelGameplay" : 0.5,
						"baseSFXBoost" : 1.0,
						"fullscreenMode" : true,
						"windowSizeX" : 1300,
						"windowSizeY" : 750,
						"windowLocationX" : 100,
						"windowLocationY" : 100,
					
						// Game progress
						"gameBeaten": false,
						"gameBeatenDomination": false,
						"gameBeatenCorruption": false,
						"gameBeatenWithoutSaves": false,
						"cutsceneIntro": false,
						"cutsceneSmokeTunnel": false,
						"cutsceneGameOverLevel1": false,
						"cutsceneGameOverLevel2": false,
						"cutsceneGameOverLevel3": false,
						"cutsceneGameOverLevel4": false,
						"cutsceneGameOverLevel5": false,
						"cutsceneEndingDomination": false,
						"cutsceneEndingCorruption": false,
						"cutsceneEndingBoyfriend": false,
						"galleryUnlockMessage": false,
						"debugUnlockMessage": false,
						"seenCredits":false,
					
						// Keybinds
						"upKeyCode": 87,
						"downKeyCode": 83,
						"leftKeyCode": 65,
						"rightKeyCode": 68,
						"punchKeyCode": 74,
						"smokeKeyCode": 75,
						"grabKeyCode": 76,
						"specialKeyCode": 186,
						"jumpKeyCode": 32,
						"startKeyCode": 13,

                        // Controller binds
                        "upButtonConfig":      [0, 12, 0],
						"downButtonConfig":    [0, 13, 0],
						"leftButtonConfig":    [0, 14, 0],
						"rightButtonConfig":   [0, 15, 0],
						"punchButtonConfig":   [0, 0, 0 ],
						"smokeButtonConfig":   [0, 1, 0 ],
						"grabButtonConfig":    [0, 2, 0 ],
						"specialButtonConfig": [0, 4, 0 ],
						"jumpButtonConfig":    [0, 3, 0 ],
						"startButtonConfig":   [0, 9, 0 ] 
					};
	
	var settingsString = localStorage.getItem("GameSettings");
	
	if (settingsString !== null)
	{
		var loadedSettings = JSON.parse(settingsString);
		
		// Iterate over all the properties in the loaded settings and set them
		for (var property in loadedSettings) 
		{
    		if (loadedSettings.hasOwnProperty(property) && settings.hasOwnProperty(property)) 
    		{
        		settings[property] = loadedSettings[property];
    		}
		}

        // Set the controller keybinds
        controller.upButtonMonitor.SetConfig(settings["upButtonConfig"]);
        controller.downButtonMonitor.SetConfig(settings["downButtonConfig"]);
        controller.leftButtonMonitor.SetConfig(settings["leftButtonConfig"]);
        controller.rightButtonMonitor.SetConfig(settings["rightButtonConfig"]);
        controller.punchButtonMonitor.SetConfig(settings["punchButtonConfig"]);
        controller.smokeButtonMonitor.SetConfig(settings["smokeButtonConfig"]);
        controller.grabButtonMonitor.SetConfig(settings["grabButtonConfig"]);
        controller.specialButtonMonitor.SetConfig(settings["specialButtonConfig"]);
        controller.jumpButtonMonitor.SetConfig(settings["jumpButtonConfig"]);
        controller.startButtonMonitor.SetConfig(settings["startButtonConfig"]);
		
		// Some of the properties changed needed a little kick to take effect immediately
		GlobalMusic.setVolume(settings.musicLevelGameplay);
		resizeCanvas(true);
	}

};

function useContinue()
{	
	level.Reset();
	
	if (savedGameExists() && gameOverResumeSaved)
	{
		// Load the game
		loadGame();
	}
	
	lives = startingLives;
	playerFirstSpawn = true;
	startupTimer = 0;
	respawnCounter = 0;
	entityFrameskip = 0;
	entityFrameskipCounter = 0;
	enemyinfo.Clear();
	continuesUsed += 1;

	if (playerFirstSpawn)
	{
		playerFirstSpawn = false;
		player.Respawn({'x':player.posX,'y':player.posY,'z':1080});
	}
	
	GlobalMusic.stop();
	GlobalMusic.setTrack(level.levelName);
	GlobalMusic.setVolume(settings.musicLevelGameplay);
	GlobalMusic.play(0.5);
};

var isFullscreen = false;
function fullscreenAvailable()
{
	if (
		document.fullscreenEnabled || 
		document.webkitFullscreenEnabled || 
		document.mozFullScreenEnabled ||
		document.msFullscreenEnabled
	)
		return true;
	else
		return false;
};

function goFullscreen()
{
	if (!isFullscreen)
	{
		var d = document.documentElement;
	
		if (d.requestFullscreen) 
			d.requestFullscreen();
		 else if (d.webkitRequestFullscreen) 
			d.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		 else if (d.mozRequestFullScreen)
			d.mozRequestFullScreen();
		else if (d.msRequestFullscreen)
			d.msRequestFullscreen();
	}
};

function onFullScreenChanged()
{
	if (document.fullscreenElement ||
		document.webkitFullscreenElement ||
		document.mozFullScreenElement ||
		document.msFullscreenElement ) 
	{
		isFullscreen = true;
	}
	else
	{
		isFullscreen = false;
	}
}

function goWindowed()
{
	isFullscreen = false;
	
	if (document.exitFullscreen) 
		document.exitFullscreen();
	else if (document.webkitExitFullscreen) 
		document.webkitExitFullscreen();
	else if (document.mozCancelFullScreen) 
		document.mozCancelFullScreen();
	else if (document.msExitFullscreen) 
		document.msExitFullscreen();
};

function setFPS(newFPS)
{
	clearInterval( updateTimer );
	fps = newFPS;
	var timerInterval = (1/fps)*1000;
	updateTimer = setInterval(tick,timerInterval);
};

function enableKeyInput()
{
	document.addEventListener("keydown", keyDown, false);
	document.addEventListener("keyup", keyUp, false);
};

function enableTouchInput()
{
	c.addEventListener('touchstart', touchStart, false);
	c.addEventListener('touchend', touchEnd, false);
};

function touchStart(evt) 
{
	evt.preventDefault();
	if (GlobalResourceLoader.AllReady())
	{
		controller.punchKeyDown();
		controller.anyKeyDown();
	}
}

function touchEnd(evt) 
{
	evt.preventDefault();
	controller.punchKeyUp();
	controller.anyKeyUp();
}

function keyDown(evt) 
{
	controller.keyDown(evt);
	
	if (evt.keyCode === 66 && (enableDebug || devDebug || (settings.gameBeatenDomination && settings.gameBeatenCorruption && settings.gameBeatenWithoutSaves)))
	{
		debug = (debug + 1) % 3;
	}
	
	if (debug !== 0 && evt.keyCode === 70)	// F = Refill all meters
	{
		if (player !== null)
		{
			player.health = player.maxHealth;
			player.sexMeter = player.maxSexMeter;
			lives = startingLives;
		}
	}
	
	if (debug !== 0 && evt.keyCode === 90)	// Z = play soundwave
	{
		soundWaveTrigger = 2;
	}
	
	
	else if (debug !== 0 && evt.keyCode === 71)	// G = Drain all meters
	{
		if (player !== null)
		{
			player.health = 1;
			player.sexMeter = 0;
			lives = 1;
		}
	}
	
	else if (debug !== 0 && evt.keyCode === 72)	// H = Get the player drunk
	{
		if (player !== null)
		{
			var attack = new Attack();
			attack.damageDealt = 0;
			attack.hitStunDealt = 0.0;
			attack.corruptionDealt = 0.0;
			attack.staminaDrained = 0.0;
			attack.intoxicationDealt = 150;
			player.Hit(attack, false);
		}
	}
	
	else if (debug !== 0 && evt.keyCode === 86)	// V = Get the player drunk permanently
	{
		permadrunk = !permadrunk;
		
		if (player !== null && permadrunk)
		{
			var attack = new Attack();
			attack.damageDealt = 0;
			attack.hitStunDealt = 0.0;
			attack.corruptionDealt = 0.0;
			attack.staminaDrained = 0.0;
			attack.intoxicationDealt = 1;
			player.Hit(attack, false);
		}
		else if (player !== null && !permadrunk)
		{
			player.drunkTimer = 1;
		}
	}
	
	else if (debug !== 0 && evt.keyCode === 84)	// T = Transform to demon bartender
	{
		if (player !== null)
		{
			if (player.state === States.FinishBoss)
				player.ChangeState(States.Walk);
			else
				player.ChangeState(States.FinishBoss);
		}
	}
	
	else if (debug !== 0 && evt.keyCode === 89)	// Y = Kill player
	{
		if (player !== null)
		{
			player.Die();
		}
	}


	
	else if (debug !== 0 &&  (evt.keyCode == 46 || evt.keyCode == 8))		// Delete or Del = clear everything in the level
	{
		changeLevel(new Level(),false);
	}
	
	else if (debug !== 0 && evt.keyCode == 73)	// I = decrement spawn actor
	{
		debugSpawnerSelection -= 1;
		if (debugSpawnerSelection < 0)
			debugSpawnerSelection = debugSpawnerList.length-1;
	}
	
	else if (debug !== 0 && evt.keyCode == 79)	// O = increment spawn actor
	{
		debugSpawnerSelection += 1;
		if (debugSpawnerSelection >= debugSpawnerList.length)
			debugSpawnerSelection = 0;
	}
	
	else if (debug !== 0 && evt.keyCode == 80)	// P = spawn actor
	{	
		var testEnemy = null;
		var className = debugSpawnerList[debugSpawnerSelection];
		if (className === "HeathOrb")
		{
			var MyClass = stringToFunction("CollectableOrb");
			testEnemy = new MyClass(ORB_HEALTH);
		}
		else if (className === "CorruptionOrb")
		{
			var MyClass = stringToFunction("CollectableOrb");
			testEnemy = new MyClass(ORB_CORRUPT);
		}
		else if (className === "DominationOrb")
		{
			var MyClass = stringToFunction("CollectableOrb");
			testEnemy = new MyClass(ORB_DOMINATE);
		}
		else if (className === "LifeOrb")
		{
			var MyClass = stringToFunction("CollectableOrb");
			testEnemy = new MyClass(ORB_LIFE);
		}
		else
		{
			var MyClass = stringToFunction(className);
			testEnemy = new MyClass();
		}
		
		if (testEnemy !== null)
		{
			if ("ReInit" in testEnemy)
				testEnemy.ReInit(level);
		
			if ("Respawn" in testEnemy)
				testEnemy.Respawn({'x':player.posX + 300*player.facing, 'y':player.posY, 'z':1000});
			if (testEnemy.hasOwnProperty("facing"))
				testEnemy.facing = -player.facing;
				
			if (testEnemy.hasOwnProperty("controller"))
			{
				if (controller.punch && "ai" in testEnemy )
				{
					testEnemy.ai = null;
				}
			}
			if (controller.smoke)
				testEnemy.state = States.Corrupt;
			if (testEnemy.hasOwnProperty("controller"))
			{
				if (controller.grab)
				{
					if ("Respawn" in testEnemy)
						testEnemy.Respawn({'x':player.posX, 'y':player.posY, 'z':player.posZ+player.zHeight / 2.0 - testEnemy.zHeight / 2.0});
					if (testEnemy.hasOwnProperty("facing"))
						testEnemy.facing = player.facing;
						
					SpawnEntityTransitionPuff(player, testEnemy);
					TakeoverEnemy(testEnemy);
				}
			}
			level.entities.AddEntity(testEnemy);
		}
		
	}
	
	else if (debug !== 0 && evt.keyCode == 53)	// 5 = refill sex meter
	{
		player.sexMeter = player.maxSexMeter;
	}
	
	else if (debug !== 0 && evt.keyCode == 78)	// N = No Clip Mode (plus speed boost)
	{
		playernoclip = !playernoclip;
	}
	else if (debug !== 0 && evt.keyCode == 77)	// N = No Clip Mode (plus speed boost)
	{
		optimizationDebug = !optimizationDebug;
	}
	
	
	
	else if (debug !== 0 && evt.keyCode == 192)	// Framerate toggle
	{
		if (fps !== 60)
			setFPS(60,0);
		else
			setFPS(2,0);
	}
};

function keyUp(evt) 
{
	controller.keyUp(evt);
};

function tick()
{	
	updateAll();
};

var storedWidth = 0;
var storedHeight = 0;
function resizeCanvas(force)
{
	if (force || window.innerWidth !==  storedWidth || window.innerHeight !== storedHeight)
	{
		storedWidth = window.innerWidth;
		storedHeight = window.innerHeight;
		
		var devicePixelRatio = 1;
		
		if (settings.enableRetina)
			devicePixelRatio = window.devicePixelRatio;
		
		var w = window.innerWidth;
		var h = window.innerHeight;
		var snapH = 640;
		var snapW = 360;
		var snapMultipleH = 640;
		var snapMultipleV = 360;
		
		if (settings.renderMode == 0)
		{
			snapMultipleH = 640;
			snapMultipleV = 360;
		}
		else if (settings.renderMode === 1)
		{
			snapMultipleH = 64;
			snapMultipleV = 36;
		}
		else if (settings.renderMode === 2)
		{
			snapMultipleH = 1;
			snapMultipleV = 1;
		}
		
		// If we need to size by height...
		if ((w * 9.0/16.0) > h)
		{
			// Snap h to the nearest multiple of 360
			snapH = Math.round(Math.floor(h / snapMultipleV) * snapMultipleV);
			if (snapH < snapMultipleV)
				snapH = snapMultipleV;
			snapW = Math.round(snapH * (16.0/9.0));
		}
		else
		{
			// Snap h to the nearest multiple of 640
			snapW = Math.round(Math.floor(w / snapMultipleH) * snapMultipleH);
			if (snapW < snapMultipleH)
				snapW = snapMultipleH;
			snapH = Math.round(snapW * (9.0/16.0));
		}
		
		if (settings.scalingQuality == 1 || (settings.scalingQuality == 0 && lowFramerateDetected))
		{
			var mul = snapW / 640.0;
			
			if (settings.renderMode == 0)
				mul = Math.round(mul);
				
			displayC.width = 640;
			displayC.height = 360;
			displayC.style.width = 640 + "px";
			displayC.style.height = 360 + "px";
			displayC.style.transformOrigin = "0% 0%";
			displayC.style.transform = "scale("+mul+", "+mul+")";
		}
		else
		{
			var mul = 1;
			displayC.style.transform = "scale("+mul+", "+mul+")";
			if (snapW * devicePixelRatio > 1920 || snapH * devicePixelRatio > 1080)
			{
				displayC.width = 1920;
				displayC.height = 1080;
			}
			else
			{
				displayC.width = snapW * devicePixelRatio;
				displayC.height = snapH * devicePixelRatio;
			}
		
			displayC.style.width = snapW + "px";
			displayC.style.height = snapH + "px";
		}
		
		displayC.style.marginTop = Math.round((h - snapH) / 2.0).toString() + "px";
		displayC.style.marginLeft = Math.round((w - snapW) / 2.0).toString() + "px";
		
		displayCtx.imageSmoothingEnabled = (settings.renderMode == 2);
		displayCtx.webkitImageSmoothingEnabled = (settings.renderMode == 2);
		displayCtx.mozImageSmoothingEnabled = (settings.renderMode == 2);
	
		camera.canvasResized();
  	}
};


function drawAll() 
{				
	if (updated === false)
	{
		requestAnimationFrame(drawAll);
		return;
	}
	
	resizeCanvas(false);
	
	if (GlobalResourceLoader.AllReady())
	{
		if (menuStack.length > 0)
		{
			frameTimes = [];
			measuredFps = 0;
			menuStack[menuStack.length-1].Draw();
			
			if (watermarkEnabled)
			{
				sstext.textBaseline = "top";
				sstext.textAlign = "left";
				sstext.fillStyle = "#FFF";
				sstext.alpha = 0.5;
				sstext.fontSize = 24;
				sstext.DrawTextWithShadow("Private Beta Build for " + watermarkOwner, 10, 300, "#FFF");
				sstext.fontSize = 16;
				sstext.DrawTextWithShadow("Please do not share or redistribute.", 10, 326, "#FFF");
			}
			
			updated = false;
			requestAnimationFrame(drawAll);
			blitInternalBuffer();
			return;
		}
		
		frameTimes.push(audioContext.currentTime);
		while (frameTimes.length > 60)
			frameTimes.shift();
		if (frameTimes.length > 10)
		{
			measuredFps = Math.round((frameTimes.length-1) / (frameTimes[frameTimes.length-1] - frameTimes[1]));
	
			if (measuredFps < (fps*0.92))
			{
				if (lowFPSCount < 240)
					lowFPSCount += 1;
		
				if (lowFPSCount == 240 && !lowFramerateDetected)
				{
					lowFramerateDetected = true;
					resizeCanvas(true);
				}
			}
			else if (measuredFps > (fps*0.95))
			{
				if (lowFPSCount > 0)
					lowFPSCount -= 1;
			}
		}
		
		// Draw the background
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.fillStyle = level.backgroundColor;
		ctx.fillRect(0,0, c.width , c.height);

		// Apply the current camera transformation
		camera.matrix.setCanvasTransform();
	
		// Draw all background objects
		level.DrawBackground();
	
		// Draw all entities
		var drawList = level.entities.GetOrderedDrawList();
		for (var i = 0; i < drawList.length; i++) 
		{
			//if (drawList[i].posX < (camera.posX + 960) && drawList[i].posX > (camera.posX - 960))
			drawList[i].Draw();
		}
		
		if (startupTimer < 180)
		{
			ctx.save();
			var ratioTo1080p =  c.height / 1080.0;
			ctx.setTransform(ratioTo1080p, 0, 0, ratioTo1080p, 0, 0);
			ctx.globalAlpha = linearRemap(startupTimer, 60, 180, 1, 0);
			ctx.fillStyle = "#e30f4b";
			ctx.fillRect(0,0,1920,1080);
			ctx.globalAlpha = 1.0
			ctx.restore();
			player.Draw();
		}
		
		// Draw all foreground objects
		level.DrawForeground();
		
		
		if (debug === 2)
		{
			// Draw all the combat objects if we're in debug mode
			for (var i = 0; i < activeAttacks.length; i++) 
			{
				activeAttacks[i].Draw();
			}
			
			level.collisionMask.Draw();
			level.cameraMask.Draw();

			ctx.lineWidth = 6.0 / camera.scale;
			ctx.strokeStyle = "#FF0";
			
			drawCircle(camera.posX,camera.posY, camera.boundingRect.height() / 2.0);
		}
		
		// Lastly, draw all overlays
		for (var i = 0; i < overlays.length; i++) 
		{
			overlays[i].Draw();
		}
		
		if (startupTimer < 60)
		{
			ctx.save();
			var ratioTo1080p =  c.height / 1080.0;
			ctx.setTransform(ratioTo1080p, 0, 0, ratioTo1080p, 0, 0);
			ctx.globalAlpha = linearRemap(startupTimer, 0, 60, 1, 0);
			ctx.fillStyle = "#e30f4b";
			ctx.fillRect(0,0,1920,1080);
			ctx.globalAlpha = 1.0
			ctx.restore();
		}
		
		if (watermarkEnabled)
		{
			sstext.textBaseline = "top";
			sstext.textAlign = "left";
			sstext.fillStyle = "#FFF";
			sstext.alpha = 0.5;
			sstext.fontSize = 24;
			sstext.DrawTextWithShadow("Private Beta Build for " + watermarkOwner, 10, 300, "#FFF");
			sstext.fontSize = 16;
			sstext.DrawTextWithShadow("Please do not share or redistribute.", 10, 326, "#FFF");
		}
		
    }
    else
    {
    	GlobalResourceLoader.Draw();
    }
    
    blitInternalBuffer();
    
    updated = false;
    requestAnimationFrame(drawAll);
};

function blitInternalBuffer()
{
	// Now actually draw the contents of ctx to displayCtx
	displayCtx.drawImage(c, 0, 0, displayC.width, displayC.height);
	
	// Clear the internal render canvas
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, c.width, c.height);
	ctx.restore();
	
	sstext.BlitAndClear();
};

var updated = false;
function updateAll()
{	
	// if the global image loader isn't ready, don't update anything.
	if (!GlobalResourceLoader.AllReady())
	{
		updated = true;
		return;
	}
	
	if (windowSettingsStale)
	{
		if (BrowserWindow)
		{
			BrowserWindow.getFocusedWindow().setFullScreen(settings.fullscreenMode);				
			windowSettingsStale = false;
			if (!settings.fullscreenMode)
				windowSizeStale = true;
		}
		else
		{
			windowSettingsStale = false;
		}
		
	}
	else if (windowSizeStale && !settings.fullscreenMode)
	{
		try 
		{
			if (BrowserWindow)
			{
				BrowserWindow.getFocusedWindow().setPosition(settings.windowLocationX,settings.windowLocationY);
				BrowserWindow.getFocusedWindow().setSize(settings.windowSizeX,settings.windowSizeY);
			}
			windowSizeStale = false;
		}
		catch(err) 
		{
			// Just silently fail and try again next time around
		}
	}
	
	GlobalMusic.Update();
	
	if (menuStack.length > 0)
	{
		menuStack[menuStack.length-1].Update();
		controller.update();
		updated = true;
		return;
	}
	

	
	if (startupTimer < 300)
	{
		startupTimer += 1;
	}
	
	if (startupTimer > 150)
	{
		hud.enableLifeDisplay = true;
	}
	
	if (entityFrameskipCounter <= 0)
	{
	     // Tell the camera to track the player
	     if (player !== null)
	     	camera.addObjectToTrack(player);
	     
		// Update all entities
		for (var i = 0; i < level.entities.list.length; i++) 
		{
			level.entities.list[i].Update();
		
			// Remove any entities that are fully dead.
			if (level.entities.list[i].state == States.Dead)
			{
				if ("OnRemovalFromGame" in level.entities.list[i])
					level.entities.list[i].OnRemovalFromGame();
				
				level.entities.RemoveFromListAt(i);
			}
		}
	
		// Update attacks
		for (var i = 0; i < activeAttacks.length; i++) 
		{
			// Update returns true if the attack was removed from the list
			if (activeAttacks[i].Update())
			{
				// Roll our index back by one so we don't miss the next attack
				i-=1;
			}
		}
	
		// Update all effects
		for (var i = 0; i < level.entities.effects.length; i++) 
		{
			level.entities.effects[i].Update();
		
			// Remove any entities that are fully dead.
			if (level.entities.effects[i].state == States.Dead)
			{
				if ("OnRemovalFromGame" in level.entities.effects[i])
					level.entities.effects[i].OnRemovalFromGame();
				level.entities.RemoveFromEffectsAt(i);
			}
		}
		
		// Update the scream attack timer
		if (soundWaveTrigger > 0)
			soundWaveTrigger = soundWaveTrigger - 1;
	
		// Update the level
		level.Update();
		
		// Update the camera position at the end
		camera.Update();
		
		entityFrameskipCounter = entityFrameskip;
	}
	else
	{
		entityFrameskipCounter -= 1;
	}
	
	// Open the start menu
	if (controller.startActivate())
	{
		GlobalMusic.SetAlternate();
		ShowPauseMenu();
		updated = true;
		return;
	}

    // Update all overlays
    for (var i = 0; i < overlays.length; i++) 
	{
    	overlays[i].Update();
    }
	
	// Update the global AI info
	UpdateAIGlobals();
	
	// Update the inputs
	controller.update();

	// Respawn the player if they've died.
	if (player.state === States.Dead || (!(player instanceof Bartender) && player.health === 0))
	{
		if (playerStack.length > 0)
		{
			player = playerStack.pop();
		}
		else
		{
			if (lives <= 0)
			{
				ShowGameOverCutscene();
			}
			else if (respawnCounter > 180)
			{
				player.OnRemovalFromGame();
				player.Respawn({'x':player.posX,'y':player.posY,'z':1080});
				level.entities.AddEntity(player);
			}
			else
			{
				respawnCounter++;
			}
		}
	}
	else
	{
		respawnCounter = 0;
	}
	updated = true;
	
};

var entitiesOnScreen = [];
var activeCombatTimer = 0;
function UpdateAIGlobals()
{
	entitiesOnScreen.length = 0
	if (activeCombatTimer > 0)
		activeCombatTimer -= 1;	
	
	level.entities.AddEnemiesInRect(entitiesOnScreen,camera.boundingRect);
};

function SpawnEntityTransitionPuff(entity1, entity2)
{
	var smokeWidth = entity1.hitRect.width() * 1;
	var smokeHeight = entity1.zHeight * 1;
	if (entity2.hitRect.width() > smokeWidth)
		smokeWidth = entity2.hitRect.width();
	if (entity2.zHeight > smokeHeight)
		smokeHeight = entity2.zHeight;
	
	// A nice smoke puff to make the change look fancy
	var smoke = new SmokeExplosion(	entity1.posX,
									entity1.posY,
									entity1.posZ + entity1.zHeight / 2.0,
									smokeWidth,
									smokeHeight,
									3.0 );
	level.entities.AddEffect(smoke);
}

function TakeoverEnemy(testEnemy)
{
	// Push the player to the internalObjects of the enemy
	testEnemy.internalObjects.push(player);
	
	// Remove the player from the game
	level.entities.Remove(player);
	
	if ("recruit" in testEnemy)
	{
		testEnemy.recruit(player);
		testEnemy.recruitmentTime = Number.MAX_VALUE;
	}
	else
	{
		testEnemy.ChangeAlliance(1);
	}
	
	testEnemy.controller = controller;
	
	if ("ai" in testEnemy)
		testEnemy.ai = null;
	
	// Push the player into the player stack
	// Switch the enemy to become the new player
	playerStack.push(player);
	player = testEnemy;
};

function KillPlayerAndExchange(testEnemy,killExisting)
{
	if (killExisting)
	{
		player.Die();
	}
	else
	{
		player.controller = new Controller();
	}
	player = testEnemy;
	player.ChangeAlliance(1);
	player.controller = controller;
};

function clearLevelCache()
{
	levelcache = {};
};

function chooseLevelFile(e)
{
    var file = fileInput.files[0];

    if(file)
    {
      	var fileReader = new FileReader();
      	fileReader.levelName = "_File_" + fileInput.files[0].name.replace(/\..+$/, '');
		fileReader.onload = loadLevelFromLocalFile;
		fileReader.readAsText(file);
    } 
};

function loadLevelFromLocalFile(e)
{
	loadLevel(new Level(), e.target.result, e.target.levelName,true);
};

function loadLevelFromURL(urlStr, inGameTransition, onStarted)
{
	if (levelcache.hasOwnProperty(urlStr))
	{
		changeLevel(levelcache[urlStr], inGameTransition, onStarted);
	}
	else
	{
		GlobalResourceLoader.GameNotReady();
		levelcache[urlStr] = new Level();
		var xmlHttp = new XMLHttpRequest(); 
		xmlHttp.open("GET", "levels/" + urlStr + ".txt");
		xmlHttp.overrideMimeType("application/json");
		xmlHttp.onreadystatechange = loadLevelCallback;
		xmlHttp.levelName = urlStr;
		xmlHttp.inGameTransition = inGameTransition;
		xmlHttp.onStarted = onStarted;
		
		xmlHttp.send(null);
	}
};

function loadLevelCallback(e)
{
	if (e.target.readyState == 4)
	{
		loadLevel(levelcache[e.target.levelName], e.target.responseText, e.target.levelName, e.target.inGameTransition, e.target.onStarted);
	}
};

function loadLevel(levelObj, levelStr, levelName, inGameTransition, onStarted)
{		
	// Parse the descriptor
	var descriptor = JSON.parse(levelStr);
	
	// Load the descriptor into the level object
	levelObj.LoadFromLevelDescriptor(descriptor);
	levelObj.levelName = levelName;
	
	changeLevel(levelObj, inGameTransition, onStarted);
	
	GlobalResourceLoader.GameReady();
};

function changeLevel(levelObj, inGameTransition, onStarted)
{	
	ResetAllAttacks();
		
	// Allow the player to carry stuff from one level to another.
	if (level !== null && player !== null && player.captive !== null)
	{
		level.entities.Remove(player.captive);
	}
	
	// Reset the attackable AI stuff
	if (player !== null)
		player.OnRemovalFromGame();
	
	if (player !== null && player.captive !== null)
	{
		levelObj.entities.AddEntity(player.captive)
	}
	
	// Freeze the level, saving its camera and player positions
	if (level !== null)
		level.Freeze();
	
	level = levelObj;
	
	// If the new level has not been started, start it
	if (!level.started)
	{
		level.Start();
		if (playerFirstSpawn)
		{
			playerFirstSpawn = false;
			player.Respawn({'x':player.posX,'y':player.posY,'z':1080});
		}
	}
	// If the new level is frozen, thaw it
	if (level.frozen)
	{
		level.Thaw();
	}
	
	if (inGameTransition)
	{
		GlobalMusic.stop(1.0);
		GlobalMusic.setTrack(level.levelName);
		GlobalMusic.setVolume(settings.musicLevelGameplay);
		GlobalMusic.play(0.5);
	}
	
	if(typeof(onStarted)!=='undefined')
	{
		onStarted();
	}
	
};