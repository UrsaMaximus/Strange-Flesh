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

// Some globals that our includes might want to use
var debug = 0;
var enableRetina = true;
var enableSmoothing = false;
var playernoclip = false;
var isEditor = true;
var editBackground = true;
var editForeground = true;
var editEntities = true;
var editCollision = true;
var editCamera = false;
var editSkirmish = false;
var editTransition = true;
var pause = false;
var nextObjectID = 0;
var clipboard = [];


var settings = {
					// Basic settings
				    "renderMode": 0,
					"enableRetina" : false,
					"musicLevelGameplay" : 0.5,
					"baseSFXBoost" : 1.0,
					
					// Game progress
					"showDebugMenu" : true,
					"gameBeaten": false,
					
					// Keybinds
					"upKeyCode": 87,
					"downKeyCode": 83,
					"leftKeyCode": 65,
					"rightKeyCode": 68,
					"punchKeyCode": 74,
					"smokeKeyCode": 75,
					"grabKeyCode": 76,
					"jumpKeyCode": 32,
					"startKeyCode": 13
				};

var lastDownTarget = null;
  
  var blendModes = ["source-over",
			        "lighten",
			        "screen",
			        "darken",
			        "multiply",
			        "color-dodge",
			        "color-burn",
			        "hard-light",
			        "soft-light",
			        "difference",
			        "exclusion",
			        "hue",
			        "saturation",
			        "color",
			        "luminosity"];

var entityInsertList = [	"Joe0",
							"Joe1",
							"Joe2",
							"Joe3",
							"Joe4",
							"Joe5",
							"OrcSpeaker",
							"OfficeAngel",
							"Admonitor",
							"ColombianRescue",
							"EDRider",
							"Bottley",
							"StarvingArtist",
							"Dissolution",
							"PunkPuppy",
							"FartherFigure",
							"PartyAnimal",
							"Fister",
							"VirusFromVenus",
							"Bartender",
							"EntitySpawner",
							"DestructableItem",
							"PottedPlant",
							"WaterCooler",
							"VendingMachine",
							"Car",
							"Bench",
							"RepeatingBackground",
							"CollectableOrb",
							"Checkpoint",
							"GlassDoor"
						  ];
						  
						  
var backgroundForegroundInsertList = [ "RepeatingBackground",
									   "Rectangle",
									   "SkewRectangle",
									   "CameraSpawnLocation", 
									   "EndingDoor"
									];
											  
						  
var collisionInsertList = [ "LineSegment" ];

var skirmishInsertList = [ "SkirmishBox" ];

var transitionInsertList = [ "TransitionBox" ];
						  
var insertionLayer = 2;

// Controller object
var controller = null;
var shiftHeld = false;
var nudgeUp = false;
var nudgeDown = false;
var nudgeLeft = false;
var nudgeRight = false;

// Engine stuff
var fps = 60;
var pxScale = 3.0;
var c;
var ctx;
var editPanel;
var insertPanel;
var drawTimer;
var camera;
var cameraTracker = {posX:0, posY:0, trackingOffsetX:0, trackingOffsetY:0};
var player = null;
var enemyinfo;
var debugoverlay;
var canvasNeedsResize = true;

// All of the editor state controls
var collisionControls=[];
var cameraControls=[];
var skirmishControls=[];
var transitionControls=[];
var level = null;

var overlays=[];
var menuStack=[];

// Define global acceleration due to gravity.
var gravity = 2.4;

// Define a function that appends other scripts to the HTML file header
function include(url)
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
};

// Now use that function to include other files we want.
// It's almost like using a non-shitty language!
include("Font.js");
include("FileSaver.js");
include("ResourceLoader.js"); // Load this guy first, it creates GlobalResourceLoader
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
include("CollectableOrb.js");
include("DroppedItem.js");
include("EntitySpawner.js");
include("Checkpoint.js");
include("Level.js");
include("Bartender.js");
include("Music.js");
// almost

function collisionCheckChanged()
{
 	debug = document.getElementById("collisionCheckbox").checked ? 2 : 0;
};

function enableSmoothingCheckChanged()
{
 	enableSmoothing = document.getElementById("enableSmoothingCheckbox").checked;
};

function testCameraCheckChanged()
{
 	camera.clipEnabled = document.getElementById("testCameraCheckbox").checked;
};

function foregroundCheckChanged()
{
 	editForeground = document.getElementById("foregroundCheckbox").checked;
};

function entitiesCheckChanged()
{
 	editEntities = document.getElementById("entitiesCheckbox").checked;
};

function staticCollisionCheckChanged()
{
 	editCollision = document.getElementById("staticCollisionCheckbox").checked;
};

function cameraCollisionCheckChanged()
{
 	editCamera = document.getElementById("cameraCollisionCheckbox").checked;
};

function skirmishCheckChanged()
{
 	editSkirmish = document.getElementById("skirmishCheckbox").checked;
};

function backgroundCheckChanged()
{
 	editBackground = document.getElementById("backgroundCheckbox").checked;
};

function transitionCheckChanged()
{
 	editTransition = document.getElementById("transitionCheckbox").checked;
};

function layerChanged()
{
	if (document.getElementById("backgroundRadioButton").checked)
		insertionLayer = 1;
	else if (document.getElementById("entitiesRadioButton").checked)
		insertionLayer = 2;
	else if (document.getElementById("foregroundRadioButton").checked)
		insertionLayer = 3;
	else if (document.getElementById("staticCollisionRadioButton").checked)
		insertionLayer = 4;
	else if (document.getElementById("cameraCollisionRadioButton").checked)
		insertionLayer = 5;
	else if (document.getElementById("skirmishRadioButton").checked)
		insertionLayer = 6;
	else if (document.getElementById("transitionRadioButton").checked)
		insertionLayer = 7;
		
	setupInsertPanel();
};

function StrangeEdit() 
{   
	// Load all the image resources our included objects want
	GlobalResourceLoader.LoadAll();

	// Locate the canvas element and size it
	c = document.getElementById("gameCanvas");
	editPanel = document.getElementById("editPanel");
	insertPanel = document.getElementById("insertPanel");
	ctx = c.getContext("2d");
	
	fileInput = document.getElementById('levelLoader');
    fileInput.addEventListener('change', chooseLevelFile)
	
    setupInsertPanel();
    
	camera = new CanvasCamera();
	resizeCanvas(true);
	
	// Setup the controller object to enhance keyboard input
	controller = new PlayerInputController();
	controller.usePermBindings = false; // Disable capture of arrow keys and enter
	
	enableInput();
	
	// Create the player
	player = new Bartender();
	player.ChangeAlliance(1)
	player.controller = controller;
	
	// Create the level
	level = new Level();
    
	// Setup a timer to update the canvas on set intervals
	var timerInterval = (1/fps)*1000;
	drawTimer = setInterval(tick,timerInterval);
	
	// Push out the global lighting overlay
	var light = new GlobalLight();
	light.lightColor = "#6c1732";
	light.alpha = 0;
	overlays.push(light);
	
	// Tell the global loader that all the assets have been queued to load
	GlobalResourceLoader.GameReady();
};

function setupInsertPanel()
{
	// Clear all the elements
	while (insertPanel.firstChild) 
	{
		insertPanel.removeChild(insertPanel.firstChild);
	}
	
	var insertList = [];
	if (insertionLayer === 1 || insertionLayer === 3)
		insertList = backgroundForegroundInsertList;
	else if (insertionLayer === 2)
		insertList = entityInsertList;
	else if (insertionLayer === 4 || insertionLayer === 5)
		insertList = collisionInsertList;
	else if (insertionLayer === 6)
		insertList = skirmishInsertList;
	else if (insertionLayer === 7)
		insertList = transitionInsertList;
	
	// For each entry in the insert list, create a button
	for (var i=0; i<insertList.length; i++) 
	{
			// Create the property div
			var insertDiv = document.createElement('div');
			insertDiv.className = 'property';
			var propertyNameDiv = document.createElement('div');
			propertyNameDiv.className = 'propertyName';
			var propertyValueDiv = document.createElement('div');
			propertyValueDiv.className = 'propertyValue';

			propertyNameDiv.innerHTML = insertList[i] + ":";
			
			
			createInsertButton(insertList[i], propertyValueDiv);
			

			// Append the name and value to the property DIV
			insertDiv.appendChild(propertyNameDiv);
			insertDiv.appendChild(propertyValueDiv);

			// Finally, append the property to the edit panel
			insertPanel.appendChild(insertDiv);
	}
};

function createInsertButton(className, propertyValueDiv)
{
	// Create a button
	var input = document.createElement("button");
	// Set the name with a text child node
	var name = document.createTextNode("Insert New");
	input.appendChild(name);
	// Set the onclick action
	input.onclick = function() { 
									insertEntity(className, insertionLayer);
								};
	// Add the button to the enclosing DIV
	propertyValueDiv.appendChild(input);
};

function insertEntity(className, layer)
{
	var MyClass = stringToFunction(className);
	var entity = new MyClass();
	if (entity !== null)
	{
		// Place the entity in the middle of the screen using a few known position variables
		if (entity.hasOwnProperty("posX") && entity.hasOwnProperty("posY"))
		{
			entity.posX = camera.posX;
			entity.posY = camera.posY;
		}
		if (entity.hasOwnProperty("x1") && entity.hasOwnProperty("y1"))
		{
			entity.x1 = camera.posX+200;
			entity.y1 = camera.posY;
		}
		if (entity.hasOwnProperty("x2") && entity.hasOwnProperty("y2"))
		{
			entity.x2 = camera.posX;
			entity.y2 = camera.posY;
		}
		if (entity.hasOwnProperty("xMin") && entity.hasOwnProperty("yMin"))
		{
			entity.xMin = camera.posX-100;
			entity.yMin = camera.posY-100;
		}
		if (entity.hasOwnProperty("xMax") && entity.hasOwnProperty("yMax"))
		{
			entity.xMax = camera.posX+100;
			entity.yMax = camera.posY+100;
		}
		if ("box" in entity)
		{
			entity.box.xMin = camera.posX-100;
			entity.box.yMin = camera.posY-100;
			entity.box.xMax = camera.posX+100;
			entity.box.yMax = camera.posY+100;
		}
		if ("triggerRegion" in entity)
		{
			entity.triggerRegion.xMin = camera.posX-75;
			entity.triggerRegion.yMin = camera.posY-75;
			entity.triggerRegion.xMax = camera.posX+75;
			entity.triggerRegion.yMax = camera.posY+75;
		}
		
		var handles = insertConstructedEntity(entity, layer);
		
		selectEntity(null);
		
		if (handles.length > 0)
			entity = handles[0];
		
		selectEntity(entity);
		
		// Start a fake drag operation
		// Fake a mouse position of (0,0) relative to the objects.
		selectOffsetX.length = 0;
		selectOffsetY.length = 0;
		for (var i=0; i < selectedEntities.length; i++)
		{
			selectOffsetX.push(0);
			selectOffsetY.push(0);
		}
		dragging = true;
		
		// Even though the user just clicked a button off the canvas, 
		// give our fake focus to the canvas
		lastDownTarget = c;
	}
};

function insertConstructedEntity(entity, layer)
{
	var handles = [];
	if (layer === 1)
	{
		level.background.push(entity);
	}
	else if (layer === 2)
	{
		if (entity instanceof RepeatingBackground ||
			entity instanceof Rectangle ||
			entity instanceof SkewRectangle ||
			entity instanceof EffectAnimation ||
			entity instanceof DualOwnerEffectAnimation ||
			entity instanceof HitSpark ||
			entity instanceof EntitySpawner )
		{
			level.entities.AddEffect(entity);
		}
		else
		{
			level.entities.AddEntity(entity);
		}
	}
	else if (layer === 3)
	{
		level.foreground.push(entity);
	}
	else if (layer === 4)
	{
		if (entity instanceof LineSegment)
		{
			level.collisionMask.lines.push(entity);
			var handle1 = new LineSegmentHandle(entity, true);
			var handle2 = new LineSegmentHandle(entity, false);
			collisionControls.push(handle1);
			collisionControls.push(handle2);
			handles.push(handle1);
			handles.push(handle2);
		}
	}
	else if (layer === 5)
	{
		if (entity instanceof LineSegment)
		{
			level.cameraMask.lines.push(entity);
			var handle1 = new LineSegmentHandle(entity, true);
			var handle2 = new LineSegmentHandle(entity, false);
			cameraControls.push(handle1);
			cameraControls.push(handle2);
			handles.push(handle1);
			handles.push(handle2);
		}
	}
	else if (layer === 6)
	{
		if (entity instanceof SkirmishBox)
		{
			level.skirmishes.push(entity);
	
			if ("box" in entity)
			{
				var handle1 = new BoundingRectHandle(entity.box, 0);
				var handle2 = new BoundingRectHandle(entity.box, 1);
				var handle3 = new BoundingRectHandle(entity.box, 2);
				var handle4 = new BoundingRectHandle(entity.box, 3);
				skirmishControls.push(handle1);
				skirmishControls.push(handle2);
				skirmishControls.push(handle3);
				skirmishControls.push(handle4);
				handles.push(handle1);
				handles.push(handle2);
				handles.push(handle3);
				handles.push(handle4);
			}
	
			if ("triggerRegion" in entity)
			{
				var handle5 = new BoundingRectHandle(entity.triggerRegion, 0);
				var handle6 = new BoundingRectHandle(entity.triggerRegion, 1);
				var handle7 = new BoundingRectHandle(entity.triggerRegion, 2);
				var handle8 = new BoundingRectHandle(entity.triggerRegion, 3);
				skirmishControls.push(handle5);
				skirmishControls.push(handle6);
				skirmishControls.push(handle7);
				skirmishControls.push(handle8);
				handles.push(handle5);
				handles.push(handle6);
				handles.push(handle7);
				handles.push(handle8);
			}
		}
	}
	else if (layer === 7)
	{
		if (entity instanceof TransitionBox)
		{
			level.transitions.push(entity);
	
			if ("box" in entity)
			{
				var handle1 = new BoundingRectHandle(entity.box, 0);
				var handle2 = new BoundingRectHandle(entity.box, 1);
				var handle3 = new BoundingRectHandle(entity.box, 2);
				var handle4 = new BoundingRectHandle(entity.box, 3);
				transitionControls.push(handle1);
				transitionControls.push(handle2);
				transitionControls.push(handle3);
				transitionControls.push(handle4);
				handles.push(handle1);
				handles.push(handle2);
				handles.push(handle3);
				handles.push(handle4);
			}
		}
	}

	return handles;
};

var selectedEntities = [];
var tenativeSelectedEntities = [];
var scrollingToNewEntity = false;

function selectEntitiesInBox(selectionBox)
{
	if (shiftHeld)
	{
		for (var i=0; i < tenativeSelectedEntities.length; i++)
		{
			var index = selectedEntities.indexOf(tenativeSelectedEntities[i]);
			if (index !== -1)
				selectedEntities.splice(index, 1);
		}
		tenativeSelectedEntities.length = 0;
	}
	else
	{
		selectedEntities.length = 0;
		tenativeSelectedEntities.length = 0;
	}
	
	
	if (editEntities)
	{
		for (var i=0; i < level.entities.drawList.length; i++)
		{
			if (getBoundingRect(level.entities.drawList[i]).ContainsRect(selectionBox) && selectedEntities.indexOf(level.entities.drawList[i]) === -1)
			{
				selectedEntities.push(level.entities.drawList[i]);
				tenativeSelectedEntities.push(level.entities.drawList[i]);
			}
		}
	}
	
	if (editBackground)
	{
		for (var i=0; i < level.background.length; i++)
		{
			if (getBoundingRect(level.background[i]).ContainsRect(selectionBox) && selectedEntities.indexOf(level.background[i]) === -1)
			{
				selectedEntities.push(level.background[i]);
				tenativeSelectedEntities.push(level.background[i]);
			}
		}
	}
	
	if (editForeground)
	{
		for (var i=0; i < level.foreground.length; i++)
		{
			if (getBoundingRect(level.foreground[i]).ContainsRect(selectionBox) && selectedEntities.indexOf(level.foreground[i]) === -1)
			{
				selectedEntities.push(level.foreground[i]);
				tenativeSelectedEntities.push(level.foreground[i]);
			}
		}
	}
	
	if (editCollision)
	{
		for (var i=0; i < collisionControls.length; i++)
		{
			if (getBoundingRect(collisionControls[i]).ContainsRect(selectionBox) && selectedEntities.indexOf(collisionControls[i]) === -1)
			{
				selectedEntities.push(collisionControls[i]);
				tenativeSelectedEntities.push(collisionControls[i]);
			}
		}
	}
	
	if (editCamera)
	{
		for (var i=0; i < cameraControls.length; i++)
		{
			if (getBoundingRect(cameraControls[i]).ContainsRect(selectionBox) && selectedEntities.indexOf(cameraControls[i]) === -1)
			{
				selectedEntities.push(cameraControls[i]);
				tenativeSelectedEntities.push(cameraControls[i]);
			}
		}
	}
	
	if (editSkirmish)
	{
		for (var i=0; i < skirmishControls.length; i++)
		{
			if (getBoundingRect(skirmishControls[i]).ContainsRect(selectionBox) && selectedEntities.indexOf(skirmishControls[i]) === -1)
			{
				selectedEntities.push(skirmishControls[i]);
				tenativeSelectedEntities.push(skirmishControls[i]);
			}
		}
	}
	
	if (editTransition)
	{
		for (var i=0; i < transitionControls.length; i++)
		{
			if (getBoundingRect(transitionControls[i]).ContainsRect(selectionBox) && selectedEntities.indexOf(transitionControls[i]) === -1)
			{
				selectedEntities.push(transitionControls[i]);
				tenativeSelectedEntities.push(transitionControls[i]);
			}
		}
	}
	
	updatePropertiesDisplay();
};

function selectEntity(inspObj)
{
	var i = selectedEntities.indexOf(inspObj);
	
	// If shift isn't being held and a new item was clicked...
	// Scroll to the item and clear the selection list
	if (!shiftHeld && i === -1)
	{
		//scrollingToNewEntity = true;
		selectedEntities.length = 0;
	}

	// If the new selection is a real entity and not already in the list, add it to the list	
	if (inspObj !== null && i === -1)
		selectedEntities.push(inspObj);
	
	// If the entity was already selected and shift is being held, remove it from the list
	if (inspObj !== null &&  i !== -1 && shiftHeld)
	{
		selectedEntities.splice(i, 1);
	}
	
	updatePropertiesDisplay();
};

function propertyChangeRequiresInit(propName, obj)
{
	if ("editorProperties" in obj)
	{
		if (obj.editorProperties.indexOf(propName) !== -1 && "ReInit" in obj)
		{
			return true;
		}
	}
	
	return false;
};

function updatePropertiesDisplay()
{
	// We need to make a list of all the properties in common between the objects.
	var sharedProperties = [];
	if (selectedEntities.length > 0)
	{
		for (var property in selectedEntities[0]) 
		{
			if (isEditorProperty(property, selectedEntities[0])) 
			{
				var shared = true;
				for (var i=1; i < selectedEntities.length; i++)
				{
					if (isEditorProperty(property, selectedEntities[i])) 
					{
						if (typeof selectedEntities[0][property] !== typeof selectedEntities[i][property])
						{
							shared = false;
							break;
						}
					}
					else
					{
						shared = false;
						break;
					}
				}
			
				if (shared)
					sharedProperties.push(property);
			}
		}
	}

	// Clear all the elements
	while (editPanel.firstChild) 
	{
		editPanel.removeChild(editPanel.firstChild);
	}

	if (selectedEntities.length > 0)
	{
		// Populate the panel with the appropriate DIVs.
		for (var i=0; i<sharedProperties.length; i++) 
		{
		
				// Create the property div
				var propertyDiv = document.createElement('div');
				propertyDiv.className = 'property';
				var propertyNameDiv = document.createElement('div');
				propertyNameDiv.className = 'propertyName';
				var propertyValueDiv = document.createElement('div');
				propertyValueDiv.className = 'propertyValue';
	
				propertyNameDiv.innerHTML = sharedProperties[i] + ":";
				createPropertyInputControl(selectedEntities, sharedProperties[i], propertyValueDiv);
	
				// Append the name and value to the property DIV
				propertyDiv.appendChild(propertyNameDiv);
				propertyDiv.appendChild(propertyValueDiv);
	
				// Finally, append the property to the edit panel
				editPanel.appendChild(propertyDiv);
	
		}
	}
	else
	{
		var propertyDiv = document.createElement('div');
		propertyDiv.className = 'property';
		propertyDiv.innerHTML = "No object selected";
		editPanel.appendChild(propertyDiv);
	}
};

function createPropertyInputControl(entities, property, propertyValueDiv)
{
	var valShared = true;
	for (var i=1; i < entities.length; i++)
	{
		if (entities[0][property] !== entities[i][property])
		{
			valShared = false;
			break;
		}
	}
	
	if (!valShared)
	{
		var asterisk = document.createTextNode("[mix]");
		propertyValueDiv.appendChild(asterisk);
	}
	
	if (property === "blendMode")
	{
		var input = document.createElement("select");
		
		for (var i=0; i < blendModes.length; i++)
		{
			var option = document.createElement("option");
			option.value = blendModes[i];
			
			var optionName = blendModes[i];
			if (optionName === "source-over")
				optionName = "normal";
			var optionText = document.createTextNode(optionName);
			option.appendChild(optionText);
			
			if (blendModes[i] === entities[0][property])
				option.selected = true;
			input.appendChild(option);
		}
		
		input.onchange = function() { 
										if (input.selectedIndex > -1)
										{ 
											for (var j=0; j < entities.length; j++) 
											{ 
												entities[j][property] = input.options[input.selectedIndex].value; 
												if (propertyChangeRequiresInit(property, entities[j])) 
													entities[j].ReInit();
												
												// If this is a control handle, push the position to the owner
												if ("HandleToOwner" in entities[j])
												{
													entities[j].HandleToOwner();
												}
											}
										} 
									};
									
		propertyValueDiv.appendChild(input);
	}
	else if (property === "imageName")
	{
		var input = document.createElement("select");
		
		for (var i=0; i < staticElementLibrary.length; i++)
		{
			var option = document.createElement("option");
			option.value = staticElementLibrary[i];
			var optionName = staticElementLibrary[i];
			var optionText = document.createTextNode(optionName);
			option.appendChild(optionText);
			
			if (staticElementLibrary[i] === entities[0][property])
				option.selected = true;
			input.appendChild(option);
		}
		

			for (var animName in animatedElementLibrary)
			{
				if (animatedElementLibrary.hasOwnProperty(animName))
				{
					var option = document.createElement("option");
					option.value = animName;
					var optionName = "(Animation) " + animName;
					var optionText = document.createTextNode(optionName);
					option.appendChild(optionText);
			
					if (animatedElementLibrary[animName] === entities[0][property])
						option.selected = true;
					input.appendChild(option);
				}
			}
		
		
		input.onchange = function() { 
										if (input.selectedIndex > -1)
										{ 
											// Get the actual object behind this selection
											var selectedName = input.childNodes[input.selectedIndex].firstChild.wholeText;
											var newValue = "";
											
											if (selectedName.length > 12 && selectedName.substring(0, 12) === "(Animation) ")
											{
												// Search the animation library for this animation
												var animationName = selectedName.substring(12, selectedName.length);
												newValue = animatedElementLibrary[animationName];
											}
											else
											{
												newValue = input.options[input.selectedIndex].value;
											}
											
											for (var j=0; j < entities.length; j++) 
											{ 
												entities[j][property] = newValue; 
												if (propertyChangeRequiresInit(property, entities[j])) 
													entities[j].ReInit(); 
												// If this is a control handle, push the position to the owner
												if ("HandleToOwner" in entities[j])
												{
													entities[j].HandleToOwner();
												}
											}
										} 
									};
									
		propertyValueDiv.appendChild(input);
	}
	else if (entities[0][property] === null)
	{
		propertyValueDiv.innerHTML = "null";
	}
	// Property is numeric, attach a textbox w/ parser
	else if (typeof entities[0][property] === 'number')
	{
		var input = document.createElement("input");
		input.type = "text";
		input.value = entities[0][property].toString();
		input.oninput = function() { 
										for (var j=0; j < entities.length; j++) 
										{ 
											entities[j][property] = parseFloat(input.value); 
											if (propertyChangeRequiresInit(property, entities[j])) 
												entities[j].ReInit(); 
											// If this is a control handle, push the position to the owner
											if ("HandleToOwner" in entities[j])
											{
												entities[j].HandleToOwner();
											}
										} 
									};
		propertyValueDiv.appendChild(input);
	}
	// Property is boolean, attach a checkbox
	else if (typeof entities[0][property] === 'boolean')
	{
		var input = document.createElement("input");
		input.type = "checkbox";
		input.checked = entities[0][property];
		input.onchange = function() { 
										for (var j=0; j < entities.length; j++) 
										{ 
											entities[j][property] = input.checked; 
											if (propertyChangeRequiresInit(property, entities[j])) 
												entities[j].ReInit(); 
											// If this is a control handle, push the position to the owner
											if ("HandleToOwner" in entities[j])
											{
												entities[j].HandleToOwner();
											}
										} 
									};
		propertyValueDiv.appendChild(input);
	}
	// Property is string, attach textbox
	else if (typeof entities[0][property] === 'string')
	{
		var input = document.createElement("input");
		input.type = "text";
		input.value = entities[0][property];
		input.oninput = function() { 
										for (var j=0; j < entities.length; j++) 
										{ 
											entities[j][property] = input.value; 
											if (propertyChangeRequiresInit(property, entities[j])) 
												entities[j].ReInit(); 
											// If this is a control handle, push the position to the owner
											if ("HandleToOwner" in entities[j])
											{
												entities[j].HandleToOwner();
											}
										} 
									};
		propertyValueDiv.appendChild(input);
	}
	// Otherwise, read-only
	else
	{
		propertyValueDiv.innerHTML = entities[0][property].toString();
	}
};


function setFPS(framesPerSecond)
{
	clearInterval( drawTimer );
	fps = framesPerSecond;
	var timerInterval = (1/fps)*1000;
	drawTimer = setInterval(tick,timerInterval);
};

function enableInput()
{    
	document.addEventListener('mousedown', mouseDown, false);
	document.addEventListener('mouseup', mouseUp, false);
	document.addEventListener('mousemove', mouseMoved, false);
	document.addEventListener("keydown", keyDown, false);
	document.addEventListener("keyup", keyUp, false);
};

// Some selection and mouse state variables
var selectOffsetX = [];
var selectOffsetY = [];
var dragging = false;
var boxSelection = false;
var boxSelectBox = null;
var boxSelectOrigin = null;

function mouseUp(evt) 
{
	var pos = getMousePos(evt);
	var p = camera.matrix.mapPointFromWorldToLocal(pos);
	
	if (lastDownTarget === c)
	{
		if (dragging)
		{
			dragging = false;
			updatePropertiesDisplay();
		}
		else if (boxSelection)
		{
			boxSelection = false;
			boxSelectBox.fitToPoint(boxSelectOrigin);
			boxSelectBox.expandToFit(p);
			selectEntitiesInBox(boxSelectBox);
			tenativeSelectedEntities.length = 0;
		}
		else 
		{
			// Update all the properties
			updatePropertiesDisplay();
		}
	}
}

function mouseDown(evt) 
{
	if (lastDownTarget === c && evt.target === c)
	{
		if (!dragging && !boxSelection)
		{
			var pos = getMousePos(evt);
			var p = camera.matrix.mapPointFromWorldToLocal(pos);
	
			var closest = getClosestEntity(p.x, p.y);
		
			// Select the object
			selectEntity(closest);
			
			if (closest !== null)
			{
				// Remember the mouse position relative to the objects.
				selectOffsetX.length = 0;
				selectOffsetY.length = 0;
			
				for (var i=0; i < selectedEntities.length; i++)
				{
					if ("posX" in selectedEntities[i] && "posY" in selectedEntities[i])
					{
						selectOffsetX.push(selectedEntities[i].posX - p.x);
						selectOffsetY.push(selectedEntities[i].posY - p.y);
					}
					else if ("box" in selectedEntities[i])
					{
						selectOffsetX.push(selectedEntities[i].box.centerX() - p.x);
						selectOffsetY.push(selectedEntities[i].box.centerY() - p.y);
					}
					else
					{
						selectOffsetX.push(0);
						selectOffsetY.push(0);
					}
				}
				dragging = true;
			}
			else
			{
				boxSelection = true;
				boxSelectOrigin = p;
				boxSelectBox = new BoundingRect();
				boxSelectBox.fitToPoint(p);
			}
		}
	}
	
	lastDownTarget = evt.target;
}

var lastMouseMovePosition = null;

function mouseMoved(evt) 
{
	var pos = getMousePos(evt);
	var p = camera.matrix.mapPointFromWorldToLocal(pos);
	if (lastMouseMovePosition === null)
		lastMouseMovePosition = p;
	
	if (dragging)
	{
		updateSelectedEntityPosition(p.x, p.y);
		
		if ((p.x - 5) > lastMouseMovePosition.x)
		{
			for (var i=0; i < selectedEntities.length; i++)
			{
				if (selectedEntities[i].hasOwnProperty("facing"))
				{
					selectedEntities[i].facing = 1;
				}
			}
		}
		else if ((p.x + 5) < lastMouseMovePosition.x)
		{
			for (var i=0; i < selectedEntities.length; i++)
			{
				if (selectedEntities[i].hasOwnProperty("facing"))
				{
					selectedEntities[i].facing = -1;
				}
			}
		}
		
	}
	else if (boxSelection)
	{
		boxSelectBox.fitToPoint(boxSelectOrigin);
		boxSelectBox.expandToFit(p);
		selectEntitiesInBox(boxSelectBox);
	}
	
	lastMouseMovePosition = p;
};

function updateSelectedEntityPosition(x, y)
{
	// Update the object
	for (var i=0; i < selectedEntities.length; i++)
	{
		if ("posX" in selectedEntities[i] && "posY" in selectedEntities[i])
		{
			selectedEntities[i].posX = roundToMultipleOfThree(x + selectOffsetX[i]);
			selectedEntities[i].posY = roundToMultipleOfThree(y + selectOffsetY[i]);
		}
		else if ("box" in selectedEntities[i])
		{
			if ("triggerRegion" in selectedEntities[i])
			{
				// Calculate an additional offset between triggerbox and box
				var triggerBoxOffsetX = selectedEntities[i].triggerRegion.centerX() - selectedEntities[i].box.centerX();
				var triggerBoxOffsetY = selectedEntities[i].triggerRegion.centerY() - selectedEntities[i].box.centerY();
				selectedEntities[i].triggerRegion.CenterOnPoint(roundToMultipleOfThree(x + selectOffsetX[i] + triggerBoxOffsetX), roundToMultipleOfThree(y + selectOffsetY[i] + triggerBoxOffsetY));
			}
			
			selectedEntities[i].box.CenterOnPoint(roundToMultipleOfThree(x + selectOffsetX[i]), roundToMultipleOfThree(y + selectOffsetY[i]));
			
		}
		
		// If this is a control handle, push the position to the owner
		if ("HandleToOwner" in selectedEntities[i])
		{
			selectedEntities[i].HandleToOwner();
		}
	}
	
	// Now that all the positions are updated, run back over and perform and OwnerToHandle on all the skirmishes
	for (var i = 0; i < skirmishControls.length; i++)
	{
		skirmishControls[i].OwnerToHandle();
	}
	
	// Do level transitions too
	for (var i = 0; i < transitionControls.length; i++)
	{
		transitionControls[i].OwnerToHandle();
	}
	
	updatePropertiesDisplay();
};


function removeSelectedEntities()
{
	for (var i=0; i < selectedEntities.length; i++)
	{
		var index = level.background.indexOf(selectedEntities[i]);
		if (index !== -1)
		{
			level.background.splice(index, 1);
			continue;
		}
		index = level.foreground.indexOf(selectedEntities[i]);
		if (index !== -1)
		{
			level.foreground.splice(index, 1);
			continue;
		}
		
		index = collisionControls.indexOf(selectedEntities[i]);
		if (index !== -1)
		{
			// Remember the owner
			var owner = collisionControls[index].owner;
			
			// Remove all collision controls associated with this owner
			for (var j=0; j < collisionControls.length; j++)
			{
				if (collisionControls[j].owner === owner)
				{
					collisionControls.splice(j,1);
					j--;
				}
			}
			
			// Remove the owner from its collection
			index = level.collisionMask.lines.indexOf(owner);
			if (index !== -1)
			{
				level.collisionMask.lines.splice(index,1);
			}
			
			continue;
		}
		
		index = cameraControls.indexOf(selectedEntities[i]);
		if (index !== -1)
		{
			// Remember the owner
			var owner = cameraControls[index].owner;
			
			// Remove all camera controls associated with this owner
			for (var j=0; j < cameraControls.length; j++)
			{
				if (cameraControls[j].owner === owner)
				{
					cameraControls.splice(j,1);
					j--;
				}
			}
			
			// Remove the owner from its collection
			index = level.cameraMask.lines.indexOf(owner);
			if (index !== -1)
			{
				level.cameraMask.lines.splice(index,1);
			}
			
			continue;
		}
		
		// Remove a skirmish
		index = level.skirmishes.indexOf(selectedEntities[i]);
		if (index !== -1)
		{
			// Remember the owners
			var owner = selectedEntities[i].box;
			var owner2 = selectedEntities[i].triggerRegion;
			
			// Delete the skirmish
			level.skirmishes.splice(index,1);
			
			// Remove all handles associated with this owner
			for (var j=0; j < skirmishControls.length; j++)
			{
				if (skirmishControls[j].owner === owner || skirmishControls[j].owner2)
				{
					skirmishControls.splice(j,1);
					j--;
				}
			}
		}
		
		// Remove a skirmish handle
		index = skirmishControls.indexOf(selectedEntities[i]);
		if (index !== -1)
		{
			// Find the owner skirmish
			var ownerSkirmish = null;
			for (var j=0; j < level.skirmishes.length; j++)
			{
				if (level.skirmishes[j].box === skirmishControls[index].owner || level.skirmishes[j].triggerRegion === skirmishControls[index].owner)
				{
					ownerSkirmish = level.skirmishes[j];
				}
			}
			
			// Remove all controls associated with this skirmish
			for (var j=0; j < skirmishControls.length; j++)
			{
				if (skirmishControls[j].owner === ownerSkirmish.box || skirmishControls[j].owner === ownerSkirmish.triggerRegion)
				{
					skirmishControls.splice(j,1);
					j--;
				}
			}
			
			// Remove the skirmish from its collection
			index = level.skirmishes.indexOf(ownerSkirmish);
			if (index !== -1)
			{
				level.skirmishes.splice(index,1);
			}
			continue;
		}
		
		
		// Remove a transition
		index = level.transitions.indexOf(selectedEntities[i]);
		if (index !== -1)
		{
			// Remember the owners
			var owner = selectedEntities[i].box;
			
			// Delete the transition
			level.transitions.splice(index,1);
			
			// Remove all handles associated with this owner
			for (var j=0; j < transitionControls.length; j++)
			{
				if (transitionControls[j].owner === owner)
				{
					transitionControls.splice(j,1);
					j--;
				}
			}
		}
		
		// Remove a transition handle
		index = transitionControls.indexOf(selectedEntities[i]);
		if (index !== -1)
		{
			// Find the owner transition
			var ownerTransition = null;
			for (var j=0; j < level.transitions.length; j++)
			{
				if (level.transitions[j].box === transitionControls[index].owner)
				{
					ownerTransition = level.transitions[j];
				}
			}
			
			// Remove all controls associated with this transition
			for (var j=0; j < transitionControls.length; j++)
			{
				if (transitionControls[j].owner === ownerTransition.box)
				{
					transitionControls.splice(j,1);
					j--;
				}
			}
			
			// Remove the transition from its collection
			index = level.transitions.indexOf(ownerTransition);
			if (index !== -1)
			{
				level.transitions.splice(index,1);
			}
			continue;
		}
		
		level.entities.Remove(selectedEntities[i]);
		
	}
};

function moveSelectedEntitiesForward()
{
	// Look for the item in the background
	if (editBackground && level.background.length > 0)
	{
		var canMoveForward = false;
		for(var i = level.background.length-1; i >= 0; i--)
		{
			if (selectedEntities.indexOf(level.background[i]) !== -1)
			{
				if (canMoveForward)
				{
					moveForwardInArray(level.background[i],level.background);
					i++;
				}
			}
			else
			{
				// There's a gap in the array that will allow the items to step forward
				canMoveForward = true;
			}
		}
	}
	
	// Look for the item in the foreground
	if (editForeground && level.foreground.length > 0)
	{
		var canMoveForward = false;
		for(var i = level.foreground.length-1; i >= 0; i--)
		{
			if (selectedEntities.indexOf(level.foreground[i]) !== -1)
			{
				if (canMoveForward)
				{
					moveForwardInArray(level.foreground[i],level.foreground);
					i++;
				}
			}
			else
			{
				// There's a gap in the array that will allow the items to step forward
				canMoveForward = true;
			}
		}
	}
};

function moveSelectedEntitiesBackward()
{
	// Look for the item in the background
	if (editBackground && level.background.length > 0)
	{
		var canMoveBackward = false;
		for(var i = 0; i < level.background.length; i++)
		{
			if (selectedEntities.indexOf(level.background[i]) !== -1)
			{
				if (canMoveBackward)
				{
					moveBackwardInArray(level.background[i],level.background);
					i--;
				}
			}
			else
			{
				// There's a gap in the array that will allow the items to step backward
				canMoveBackward = true;
			}
		}
	}
	
	// Look for the item in the foreground
	if (editForeground && level.foreground.length > 0)
	{
		var canMoveBackward = false;
		for(var i = 0; i < level.foreground.length; i++)
		{
			if (selectedEntities.indexOf(level.foreground[i]) !== -1)
			{
				if (canMoveBackward)
				{
					moveBackwardInArray(level.foreground[i],level.foreground);
					i--;
				}
			}
			else
			{
				// There's a gap in the array that will allow the items to step backward
				canMoveBackward = true;
			}
		}
	}
	
};

function nudgeSelectedEntityPosition(x, y)
{
	// Update the object
	for (var i=0; i < selectedEntities.length; i++)
	{
		selectedEntities[i].posX += x;
		selectedEntities[i].posY += y;
		
		// If this is a control handle, push the position to the owner
		if ("HandleToOwner" in selectedEntities[i])
		{
			selectedEntities[i].HandleToOwner();
		}
	}
	
	updatePropertiesDisplay();
};

function initSelectedEntities()
{
	for (var i=0; i < selectedEntities.length; i++)
	{
		if ('Init' in selectedEntities[i])
		{
			selectedEntities[i].Init();
		}
	}
};

function getMousePos(evt) 
{
	var devicePixelRatio = 1;
		if (enableRetina)
			devicePixelRatio = window.devicePixelRatio;
			
	var rect = c.getBoundingClientRect();
	return { 'x': (evt.clientX - rect.left)*devicePixelRatio, 'y': (evt.clientY - rect.top)*devicePixelRatio}
};

function keyDown(evt) 
{
	if (lastDownTarget !== null && lastDownTarget !== c) 
	{
		return;
    }
    
    controller.keyDown(evt);
    
    if (evt.keyCode == 40) // down arrow = nudge down
	{
		nudgeDown = true;
	}
	else if (evt.keyCode == 37)	 // left arrow = nudge left
	{
		nudgeLeft = true;
	}
	else if (evt.keyCode == 38)	// up = nudge up
	{
		nudgeUp = true;
	}
	else if (evt.keyCode == 39)	// right arrow = nudge right
	{
		nudgeRight = true;
	}
	else if (evt.keyCode == 189)	// '-' = Zoom Out
	{
		camera.targetScale *= 0.5;
	}
	else if (evt.keyCode == 187)	// '=' = Zoom In
	{
		camera.targetScale *= 2.0;
	}
	else if (evt.keyCode == 219)	// '[' = Move selected items backward
	{
		moveSelectedEntitiesBackward();
	}
	else if (evt.keyCode == 221)	// ']' = Move selected items forward
	{
		moveSelectedEntitiesForward();
	}
	else if (evt.keyCode == 9)	// tab, cycle selected item
	{
		selectEntity(getNextEntity());
	}
	else if (evt.keyCode == 16)	// shift, select multiple
	{
		shiftHeld = true;
	}
	
	else if (evt.keyCode == 67)	// C, copy
	{
		clipboard = [];
		
		for (var i = 0; i < selectedEntities.length; i++)
		{
			if (!(selectedEntities[i] instanceof BoundingRectHandle) && !(selectedEntities[i] instanceof LineSegmentHandle))
				clipboard.push(GenerateObjectSubDescriptor(selectedEntities[i]));
		}
	}
	else if (evt.keyCode == 86)	// V, paste
	{
		// Select nothing
		selectEntity(null);
		
		// Remember if the shift key was being held before
		var shiftwasheld = shiftHeld;
		
		// Mark the shift key as being held down
		shiftHeld = true;
		
		// Generate objects from all the clipboard descriptors
		for (var i = 0; i < clipboard.length; i++)
		{
			var obj = level.GenerateObjectFromSubDescriptor(clipboard[i]);
			if (obj !== null)
			{
				var handles = insertConstructedEntity(obj,insertionLayer);
				for (var j=0; j < handles.length; j++)
				{
					selectEntity(handles[j]);
				}
				selectEntity(obj);
			}
		}
		
		// restore the shift key state
		shiftHeld = shiftwasheld;
	}
	
	else if (evt.keyCode == 27)	// esc, select none
	{
		selectEntity(null);
	}
	
	else if (evt.keyCode == 46 || evt.keyCode == 8)	// del or backspace, delete items
	{
		removeSelectedEntities();
		selectEntity(null);
	}
	
	// Prevent the default tab behavior
	evt.preventDefault();
};

function keyUp(evt) 
{
	controller.keyUp(evt);
	
	if (evt.keyCode == 40) // down arrow = nudge down
	{
		nudgeDown = false;
	}
	else if (evt.keyCode == 37)	 // left arrow = nudge left
	{
		nudgeLeft = false;
	}
	else if (evt.keyCode == 38)	// up = nudge up
	{
		nudgeUp = false;
	}
	else if (evt.keyCode == 39)	// right arrow = nudge right
	{
		nudgeRight = false;
	}
	else if (evt.keyCode == 16)	// shift, select multiple
	{
		shiftHeld = false;
	}
	
	evt.preventDefault();
};


function getNextEntity()
{
	// Find the currently selected entity
	var i = -1;
	
	var lastItem = null;
	if (selectedEntities.length > 0)
		lastItem = selectedEntities[selectedEntities.length-1];
	
	// Look for the item in the background
	if (editBackground)
		i = level.background.indexOf(lastItem);
		
	// If it was found, increase i by one and see if it's in bounds
	if (i !== -1)
	{
		i++;
		if (i !== level.background.length)
		{
			return level.background[i];
		}
		else	// Wrap to the other collections, back around, or go null
		{
			if (editEntities && level.entities.drawList.length > 0)
				return level.entities.drawList[0];
			else if (editForeground && level.foreground.length > 0)
				return level.foreground[0];
			else if (editBackground && level.background.length > 0)
				return level.background[0];
			else 
				return null;
		}
	}
	
	if (editEntities)
		i = level.entities.drawList.indexOf(lastItem);
	if (i !== -1)
	{
		i++;
		if (i !== level.entities.drawList.length)
		{
			return level.entities.drawList[i];
		}
		else	// Wrap to the other collections, back around, or go null
		{
			if (editForeground && level.foreground.length > 0)
				return level.foreground[0];
			else if (editBackground && level.background.length > 0)
				return level.background[0];
			else if (editEntities && level.entities.drawList.length > 0)
				return level.entities.drawList[0];
			else 
				return null;
		}
	}
		
	
	if (editForeground)
		i = level.foreground.indexOf(lastItem);
	if (i !== -1)
	{
		i++;
		if (i !== level.foreground.length)
		{
			return level.foreground[i];
		}
		else	// Wrap to the other collections, back around, or go null
		{
			if (editBackground && level.background.length > 0)
				return level.background[0];
			else if (editEntities && level.entities.drawList.length > 0)
				return level.entities.drawList[0];
			else if (editForeground && level.foreground.length > 0)
				return level.foreground[0];
			else 
				return null;
		}
	}

	
	return null;
};

function getClosestEntity(x, y)
{
	if (editEntities)
	{
		for (var i=level.entities.drawList.length-1; i >= 0; i--)
		{
			if (getBoundingRect(level.entities.drawList[i]).PointIntersect(x,y) ) 
			{
				return level.entities.drawList[i];
			}
		}
	}
	
	if (editBackground)
	{
		for (var i=level.background.length-1; i >= 0 ; i--)
		{
			if (getBoundingRect(level.background[i]).PointIntersect(x,y)) 
			{
				return level.background[i];
			}
		}
	}
	
	if (editForeground)
	{
		for (var i=level.foreground.length-1; i >= 0; i--)
		{
			if (getBoundingRect(level.foreground[i]).PointIntersect(x,y)) 
			{
				return level.foreground[i];
			}
		}
	}
	
	if (editCollision)
	{
		for (var i=0; i < collisionControls.length; i++)
		{
			if (getBoundingRect(collisionControls[i]).PointIntersect(x,y)) 
			{
				return collisionControls[i];
			}
		}
	}
	
	if (editCamera)
	{
		for (var i=0; i < cameraControls.length; i++)
		{
			if (getBoundingRect(cameraControls[i]).PointIntersect(x,y))
			{
				return cameraControls[i];
			}
		}
	}
	
	if (editSkirmish)
	{
		for (var i=0; i < skirmishControls.length; i++)
		{
			if (getBoundingRect(skirmishControls[i]).PointIntersect(x,y))
			{
				return skirmishControls[i];
			}
		}
		
		for (var i=0; i < level.skirmishes.length; i++)
		{
			if (level.skirmishes[i].box.PointIntersect(x,y))
			{
				return level.skirmishes[i];
			}
		}
	}
	
	if (editTransition)
	{
		for (var i=0; i < transitionControls.length; i++)
		{
			if (getBoundingRect(transitionControls[i]).PointIntersect(x,y))
			{
				return transitionControls[i];
			}
		}
		
		for (var i=0; i < level.transitions.length; i++)
		{
			if (level.transitions[i].box.PointIntersect(x,y))
			{
				return level.transitions[i];
			}
		}
	}
	
	return null;
};

function tick()
{	
	updateAll();
	drawAll();
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
		
		if (enableRetina)
			devicePixelRatio = window.devicePixelRatio;
	
		var w = window.innerWidth - 320;
		var h = window.innerHeight - 260;
		
		// If we need to size by height...
		if ((w * 9.0/16.0) > h)
		{
			// Snap h to the nearest multiple of 36
			var snapH = Math.round(Math.floor(h / 36.0) * 36);
			if (snapH < 36)
				snapH = 36;
				
			var snapW = Math.round(snapH * (16.0/9.0));
			
			c.width = snapW * devicePixelRatio;
			c.height = snapH * devicePixelRatio;
			c.style.width = snapW + "px";
			c.style.height = snapH + "px";
			
			c.style.marginTop = Math.round((h - snapH) / 2.0).toString() + "px";
			c.style.marginLeft = Math.round((w - snapW) / 2.0).toString() + "px";
		}
		else
		{
			// Snap h to the nearest multiple of 64
			var snapW = Math.round(Math.floor(w / 64) * 64);
			if (snapW < 64)
				snapW = 64;
				
			var snapH = Math.round(snapW * (9.0/16.0));
			
			c.width = snapW * devicePixelRatio;
			c.height = snapH * devicePixelRatio;
			c.style.width = snapW + "px";
			c.style.height = snapH + "px";
			
			c.style.marginTop = Math.round((h - snapH) / 2.0).toString() + "px";
			c.style.marginLeft = Math.round((w - snapW) / 2.0).toString() + "px";
		}
		
		editPanel.style.height = (snapH - 42).toString() + "px";
		
		ctx.imageSmoothingEnabled = enableSmoothing;
		ctx.webkitImageSmoothingEnabled = enableSmoothing;
		ctx.mozImageSmoothingEnabled = enableSmoothing;
	
		camera.canvasResized();
  	
  	}
};

function drawAll() 
{	
	//if (canvasNeedsResize)
	{
		resizeCanvas(false);
	//	canvasNeedsResize = false;
	}
	
	if (GlobalResourceLoader.AllReady())
	{
		if (menuStack.length > 0)
		{
			menuStack[menuStack.length-1].Draw();
			return;
		}
		
		// Draw the background
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.fillStyle = "#808080";
		ctx.fillRect(0,0, c.width , c.height);

		// Apply the current camera transformation
		camera.matrix.setCanvasTransform();
	
		// Draw all background objects
		level.DrawBackground();
	
		// Draw all entities
		var drawList = level.entities.GetOrderedDrawList();
		for (var i = 0; i < drawList.length; i++) 
		{
			drawList[i].Draw();
		}
		
		// Draw all foreground objects
		level.DrawForeground();
		
		// Draw all the combat objects if we're in debug mode
		if (debug === 2)
		{
			for (var i = 0; i < activeAttacks.length; i++) 
			{
				activeAttacks[i].Draw();
			}
		}
		
		// Lastly, draw all overlays
		for (var i = 0; i < overlays.length; i++) 
		{
			overlays[i].Draw();
		}
		
		// Draw the selection boxes
		if (editBackground)
		{
			for (var i=0; i < level.background.length; i++)
			{
				drawEditorOverlay(level.background[i], selectedEntities.indexOf(level.background[i]) !== -1);
			}
		}
		if (editEntities)
		{
			for (var i = 0; i < drawList.length; i++) 
			{
				drawEditorOverlay(drawList[i], selectedEntities.indexOf(drawList[i]) !== -1);
			}
		}
		if (editForeground)
		{
			for (var i=0; i < level.foreground.length; i++)
			{
				drawEditorOverlay(level.foreground[i], selectedEntities.indexOf(level.foreground[i]) !== -1);
			}
		}
		if (editCollision)
		{
			level.collisionMask.Draw();
			for (var i=0; i < collisionControls.length; i++)
			{
				drawEditorOverlay(collisionControls[i], selectedEntities.indexOf(collisionControls[i]) !== -1);
			}
		}
		if (editCamera)
		{
			level.cameraMask.Draw();
			for (var i=0; i < cameraControls.length; i++)
			{
				drawEditorOverlay(cameraControls[i], selectedEntities.indexOf(cameraControls[i]) !== -1);
			}
		}
		if (editSkirmish)
		{
			for (var i=0; i < level.skirmishes.length; i++)
			{
				drawEditorOverlay(level.skirmishes[i], selectedEntities.indexOf(level.skirmishes[i]) !== -1);
			}
			for (var i=0; i < skirmishControls.length; i++)
			{
				drawEditorOverlay(skirmishControls[i], selectedEntities.indexOf(skirmishControls[i]) !== -1);
			}
		}
		
		if (editTransition)
		{
			for (var i=0; i < level.transitions.length; i++)
			{
				drawEditorOverlay(level.transitions[i], selectedEntities.indexOf(level.transitions[i]) !== -1);
			}
			for (var i=0; i < transitionControls.length; i++)
			{
				drawEditorOverlay(transitionControls[i], selectedEntities.indexOf(transitionControls[i]) !== -1);
			}
		}
		
		if (boxSelection)
		{
			ctx.lineWidth = 6.0 / camera.scale;
			ctx.strokeStyle = "#FF0";
			drawBoundingBox(boxSelectBox);
		}
		
		if (editCamera)
		{
			ctx.lineWidth = 6.0 / camera.scale;
			ctx.strokeStyle = "#FF0";
			
			//ctx.translate();
			drawCircle(camera.posX,camera.posY, camera.boundingRect.height() / 2.0);
			//ctx.restore();
		}
		
		ctx.lineWidth = 2.0 / camera.scale;
		ctx.strokeStyle = "#FF0";
		drawCrosshairs(cameraTracker.posX, cameraTracker.posY, 50 / camera.scale);
		
    }
    else
    {
    	GlobalResourceLoader.Draw();
    }
};

function drawEditorOverlay(obj, selected)
{
	var rect = getBoundingRect(obj);

	if (selected)
	{
		ctx.globalAlpha = 1.0;
		ctx.lineWidth = 5.0 / camera.scale;
		ctx.strokeStyle = "#FF0";
	}
	else
	{
		ctx.globalAlpha = 0.5;
		ctx.lineWidth = 5.0 / camera.scale;
		ctx.strokeStyle = "#0F5";
	}
	
	if ("DrawEditControl" in obj)
	{
		obj.DrawEditControl();
	}
	else
	{
		drawBoundingBox(rect);
		if (selected)
		{
			var label = "Unknown Object";
		
			if (obj.hasOwnProperty("displayName"))
				label = obj.displayName;
			else if(obj.hasOwnProperty("imageName"))
				label = obj.imageName.toString();
		
			ctx.font = (42.0 / camera.scale).toString() + "px alagard";
			ctx.textAlign = "center";
			ctx.textBaseline="bottom";
			drawTextWithShadow(label, rect.centerX(), rect.yMin - 20);
		}
	}
		
	ctx.globalAlpha = 1.0;
};

function getBoundingRect(obj)
{
	var rect = new BoundingRect();
	
	// Draw the selected entity stuff
	if (obj !== null)
	{
		if ("getBoundingRect" in obj)
		{
			rect = obj.getBoundingRect();
		}
		else
		{
			if (obj.hasOwnProperty("hitRect"))
			{
				rect.xMin = obj.hitRect.xMin - 50 + obj.posX;
				rect.xMax = obj.hitRect.xMax + 50 + obj.posX;
			}
			else
			{
				rect.xMin = -50 + obj.posX;
				rect.xMax = 50 + obj.posX;
			}
		
			if (obj.hasOwnProperty("zHeight"))
			{
				rect.yMin = obj.posY - obj.zHeight - 50;
				rect.yMax = obj.posY + 50;
			}
			else
			{
				rect.yMin = -50 + obj.posY;
				rect.yMax = 50 + obj.posY;
			}
		}
	}
	
	return rect;
};

function updateAll()
{	
	// if the global image loader isn't ready, don't update anything.
	if (!GlobalResourceLoader.AllReady())
		return;
	
	// If the current level has not been started, start it
	if (!level.started)
	{
		level.Start();
		loadLevelObjectsIntoEditor();
	}
	
	if (controller.up)
		cameraTracker.posY -= (10 / camera.targetScale);
	if (controller.down)
		cameraTracker.posY += (10 / camera.targetScale);
	if (controller.left)
		cameraTracker.posX -= (10 / camera.targetScale);
	if (controller.right)
		cameraTracker.posX += (10 / camera.targetScale);
		
	camera.addObjectToTrack(cameraTracker);
		
	var nudgeX = 0;
	var nudgeY = 0;
	if (nudgeDown)
	{
		nudgeDown = false;
		nudgeY += 1;
	}
	if (nudgeLeft)
	{
		nudgeLeft = false;
		nudgeX -= 1;
	}
	if (nudgeUp)
	{
		nudgeUp = false;
		nudgeY -= 1;
	}
	if (nudgeRight)
	{
		nudgeRight = false;
		nudgeX += 1;
	}
	
	if (nudgeX !== 0 || nudgeY !== 0)
	{
		if (shiftHeld)
		{
			nudgeSelectedEntityPosition(nudgeX*10,nudgeY*10);
		}
		else
		{
			nudgeSelectedEntityPosition(nudgeX,nudgeY);
		}
	}
	
	if (selectedEntities.length > 0 && scrollingToNewEntity)
	{
		var lastItem = selectedEntities[selectedEntities.length-1];
		var posX = lastItem.posX;
		var posY = lastItem.posY;
	
		if (lastItem.hasOwnProperty("trackingOffsetX"))
		{
			posX += lastItem.trackingOffsetX * 3;
			posY += lastItem.trackingOffsetY * 3;
		}
		
		// If this position is within 50px of the edge of the screen, nudge the camera
		//var camRect = camera.boundingRect;
		
		var xMin = cameraTracker.posX - 960 / camera.targetScale;
		var xMax = cameraTracker.posX + 960 / camera.targetScale;
		var yMin = cameraTracker.posY - 540 / camera.targetScale;
		var yMax = cameraTracker.posY + 540 / camera.targetScale;
		
		var scrollDone = true;
		
		if ( posX < xMin+50 )
		{
			cameraTracker.posX += (posX - xMin - 50);
			scrollDone = false;
		}
		else if ( posX > xMax-50 )
		{
			cameraTracker.posX += posX - xMax + 50;
			scrollDone = false;
		}

		if ( posY < yMin+50 )
		{
			cameraTracker.posY += (posY - yMin - 50);
			scrollDone = false;
		}
		else if ( posY > yMax-50 )
		{
			cameraTracker.posY += posY - yMax + 50;
			scrollDone = false;
		}
		
		if (scrollDone)
			scrollingToNewEntity = false;
	}
	else
	{
		scrollingToNewEntity = false;
	}
	
	// Update the camera position at the end
	camera.Update();
	
	controller.update();
};

function loadLevelObjectsIntoEditor()
{
	// Reset of the editor state controls
	selectEntity(null);
	collisionControls=[];
	cameraControls=[];
	skirmishControls=[];
	transitionControls=[];

	// Go through the level and add editor handles for everything
	for (var i=0; i < level.collisionMask.lines.length; i++)
	{
		collisionControls.push(new LineSegmentHandle(level.collisionMask.lines[i],true));
		collisionControls.push(new LineSegmentHandle(level.collisionMask.lines[i],false));
	}
	
	for (var i=0; i < level.cameraMask.lines.length; i++)
	{
		cameraControls.push(new LineSegmentHandle(level.cameraMask.lines[i],true));
		cameraControls.push(new LineSegmentHandle(level.cameraMask.lines[i],false));
	}

	for (var i=0; i < level.skirmishes.length; i++)
	{
		var handle1 = new BoundingRectHandle(level.skirmishes[i].box, 0);
		var handle2 = new BoundingRectHandle(level.skirmishes[i].box, 1);
		var handle3 = new BoundingRectHandle(level.skirmishes[i].box, 2);
		var handle4 = new BoundingRectHandle(level.skirmishes[i].box, 3);
		var handle5 = new BoundingRectHandle(level.skirmishes[i].triggerRegion, 0);
		var handle6 = new BoundingRectHandle(level.skirmishes[i].triggerRegion, 1);
		var handle7 = new BoundingRectHandle(level.skirmishes[i].triggerRegion, 2);
		var handle8 = new BoundingRectHandle(level.skirmishes[i].triggerRegion, 3);
		skirmishControls.push(handle1);
		skirmishControls.push(handle2);
		skirmishControls.push(handle3);
		skirmishControls.push(handle4);
		skirmishControls.push(handle5);
		skirmishControls.push(handle6);
		skirmishControls.push(handle7);
		skirmishControls.push(handle8);
	}

	for (var i=0; i < level.transitions.length; i++)
	{
		var handle1 = new BoundingRectHandle(level.transitions[i].box, 0);
		var handle2 = new BoundingRectHandle(level.transitions[i].box, 1);
		var handle3 = new BoundingRectHandle(level.transitions[i].box, 2);
		var handle4 = new BoundingRectHandle(level.transitions[i].box, 3);
		transitionControls.push(handle1);
		transitionControls.push(handle2);
		transitionControls.push(handle3);
		transitionControls.push(handle4);
	}

	// Also setup the camera for the editor
	camera.trackObject = true;
	
	camera.targetScale = 1.0;
	camera.rotation = 0;
}

function saveLevel()
{
	var levelString = JSON.stringify(level.GenerateDescriptor());
    
    var blob = new Blob([levelString], {type: "text/plain;charset=utf-8"});
	saveAs(blob, "Level.txt");
};

function chooseLevelFile(e)
{
    var file = fileInput.files[0];

    if(file)
    {
      	var fileReader = new FileReader();
		fileReader.onload = loadLevelFromLocalFile;
		fileReader.readAsText(file);
    } 
};

function loadLevelFromLocalFile(e)
{
	loadLevel(e.target.result);
};

function loadLevelFromURL(urlStr, callback)
{
  	var xmlHttp = new XMLHttpRequest(); 
	xmlHttp.open("GET", urlStr);
	xmlHttp.onreadystatechange = callback;
	xmlHttp.send(null);
};

function loadLevelAutoComplete(e)
{
	if (e.target.readyState == 4)
	{
		loadLevel(e.target.responseText);
	}
};

function loadLevelInitial(e)
{	
	if (e.target.readyState == 4)
	{
		loadLevel(e.target.responseText);
	}
	
	GlobalResourceLoader.GameReady();
};

function levelComplete(nextLevelUrlStr)
{
	var menu = new LevelCompleteMenu();
	overlays.push(menu);
	loadLevelFromURL(nextLevelUrlStr, function(e){menu.OnLoadComplete(e);});
};

function loadLevel(levelStr)
{		
	// Construct a new level object
	level = new Level();
	
	// Parse the descriptor
	var descriptor = JSON.parse(levelStr);
	
	// Load the descriptor into the level object
	level.LoadFromLevelDescriptor(descriptor);
};

function newLevel()
{	
	// Construct a new level object
	level = new Level();
}

function loadNumberedLevel(num)
{		
	loadLevelFromURL("levels/level" + num.toString() + ".txt", loadLevelAutoComplete);
};