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

include("JoeLevelAssets.js");

var enemiesDispatched = 0;
var enemiesCorrupted = 0;
var totalEnemies = 0;

function Level()
{
	this.editorProperties = [	"musicTrack",
								"displayName",
								"zombiesCanSpawn",
								"gameOverScreen",
								"frozen",
								"spawnPosition",
								"cameraSpawnPosition",
								"storedPlayerPosition",
								"storedCameraPosition",
								"dominationCollected",
								"corruptionCollected"
							];
	
	this.levelName = "UnknownLevel";
	this.levelDescriptor = {};
	
	// Create the core game engine collections
	this.entities = new EntityList();
	this.foreground = [];
	this.background = [];
	this.skirmishes = [];
	this.transitions = [];
	this.cameraMask = new LevelCollisionMask();
	this.collisionMask = new LevelCollisionMask();
	
	// Serialized properties
	this.musicTrack = "unknown";
	this.displayName = "Title of Location";
	this.gameOverScreen = "gameover1";
	this.zombiesCanSpawn = false;
	
	this.entitiesToSpawn = [];
	
	// Mark the level as having not started
	this.started = false;
	this.frozen = false;
	
	this.spawnPosition = {'x':0, 'y':-240};
	this.cameraSpawnPosition = {'x':0, 'y':-240};
	
	this.storedPlayerPosition = {'x':0, 'y':0};
	this.storedCameraPosition = {'x':0, 'y':0};
	
	this.dominationCollected = 0;
	this.corruptionCollected = 0;
	
	this.backgroundColor = "#5c4458";
};

Level.prototype.FindClosestEnemy = function(owner,searchDistance)
{
	// Try to find an enemy ignoring max distance, by looking inside the current skirmish box
	// regardless of distance inside the currently active skirmish box
	
	
	// First, find an active skirmish enclosing the owner
	for (var i=0; i < this.skirmishes.length; i++)
	{
		// If this skirmish is active...
		if (this.skirmishes[i].started && !this.skirmishes[i].finished)
		{
			// And this entity is inside of it...
			if (this.skirmishes[i].box.PointIntersect(owner.posX,owner.posY))
			{
				// Then disable search distance.
				searchDistance = Number.MAX_VALUE;
				break;
			}
		}
	}
	
	return this.entities.FindClosestEnemy(owner,searchDistance);
};

Level.prototype.IsSkirmishActive = function()
{
	var skirmishActive = false;
	for (var i=0; i < this.skirmishes.length; i++)
	{
		// If this skirmish is active...
		if (this.skirmishes[i].started && !this.skirmishes[i].finished)
		{
			skirmishActive = true;
			break;
		}
	}
	return skirmishActive;
};

// When the player spawns in, this function is called to find out where
Level.prototype.GetPlayerSpawnPosition = function()
{
	return this.spawnPosition;
};

Level.prototype.Start = function()
{	
	if (!isEditor)
	{
		hud.DisplayMessage(this.displayName);
	}
	
	player.posX = this.spawnPosition.x;
	player.posY = this.spawnPosition.y;
	if (this.spawnPosition.hasOwnProperty("z"))
		player.posZ = this.spawnPosition.z;
	
	player.facing = 1;
	
	this.entities.AddEntity(player);
	
	// Position the camera over the player.
	camera.setPosition(player.posX + player.trackingOffsetX,player.posY + player.trackingOffsetY);
	camera.enableRatchet = false;
	
	for (var j=0; j < this.foreground.length; j++)
	{
		if (this.foreground[j] instanceof CameraSpawnLocation)
		{
			camera.setPosition(this.foreground[j].posX,this.foreground[j].posY);
			break;
		}
	}
	
	if (!isEditor)
	{
		// Capture all the enemies inside skirmish boxes
		for (var i=0; i < this.skirmishes.length; i++)
		{
			for (var j=0; j < this.entities.list.length; j++)
			{
				// If an entity is inside a skirmish box, add it to the skirmish box's entity collection
				if (this.skirmishes[i].box.PointIntersect(this.entities.list[j].posX,this.entities.list[j].posY))
				{
					// If the entity is marked spawnOnSkirmish, also remove it from the level entity collection
					if (this.entities.list[j].spawnOnSkirmish)
					{
						this.skirmishes[i].entities.AddEntity(this.entities.list[j]);
						this.entities.Remove(this.entities.list[j]);
						j--; // Back up one entity to prevent skipping over something because we deleted an item
					}
				}
			}
			
			// Also look for spawners
			for (var j=0; j < this.entities.effects.length; j++)
			{
				// If an effect is inside a skirmish box, add it to the skirmish box's entity collection
				if (this.entities.effects[j] instanceof EntitySpawner &&
					this.skirmishes[i].box.PointIntersect(this.entities.effects[j].posX,this.entities.effects[j].posY))
				{
					// If the entity is marked spawnOnSkirmish, also remove it from the level entity collection
					if (this.entities.effects[j].spawnOnSkirmish)
					{
						this.skirmishes[i].entities.AddEffect(this.entities.effects[j]);
						this.entities.Remove(this.entities.effects[j]);
						j--; // Back up one entity to prevent skipping over something because we deleted an item
					}
				}
			}
			
			// Resume any skirmishes stopped for serialization
			if (this.skirmishes[i].started && !this.skirmishes[i].finished)
			{
				this.skirmishes[i].started = false;
				this.skirmishes[i].finished = false;
				this.skirmishes[i].Start(this);
			}
		}
	
	
		// Suck up all remaining entities and add them to a list of entities to spawn.
		// Sort this list by X position
		for (var j=0; j < this.entities.list.length; j++)
		{
			if (!this.entities.list[j].hasOwnProperty("disableSpawnOnScroll") || !this.entities.list[j].disableSpawnOnScroll)
			{
				if ((this.entities.list[j].posX + this.entities.list[j].hitRect.xMin) >= (camera.boundingRect.xMax + 50) && this.entities.list[j] !== player)
				{
					// Push this entity to the list of entities to spawn
					this.entitiesToSpawn.push(this.entities.list[j]);
			
					// Remove the entity from play and back up one to make sure we don't miss anything
					this.entities.Remove(this.entities.list[j]);
					j--; // Back up one entity to prevent skipping over something because we deleted an item
				}
			}
		}
	
		// Now sort the entities to spawn list left to right
		this.entitiesToSpawn.sort(XPosCompareEntities);
	
	}

	this.started = true;
};

function XPosCompareEntities(a,b)
{
  if (a.posX + a.hitRect.xMin > b.posX + b.hitRect.xMin) 
  {
    return 1;
  }
  if (a.posX + a.hitRect.xMin < b.posX + b.hitRect.xMin) 
  {
    return -1;
  }
  if (a.objectID > b.objectID) 
  {
	return 1;
  }
  if (a.objectID < b.objectID) 
  {
    return -1;
  }
  
  return 0;
};

Level.prototype.Freeze = function()
{
	if (!this.frozen)
	{
		// Store player location
		this.storedPlayerPosition = {'x':player.posX, 'y':player.posY};
	
		// Store camera location
		this.storedCameraPosition = {'x':camera.posX, 'y':camera.posY};
	
		// Remember the camera's ratcheting settings
		this.enableRatchet = camera.enableRatchet;
		this.xRatchetMin = camera.xRatchetMin;
		this.xRatchetMax = camera.xRatchetMax;
		this.yRatchetMin = camera.yRatchetMin;
		this.yRatchetMax = camera.yRatchetMax;
		
		// Go through all entities and if they have AI, flush it
		// Also freeze them
		for (var i=0; i < this.entities.list.length; i++)
		{
			if ("Freeze" in this.entities.list[i])
			{
				this.entities.list[i].Freeze(this);
			}
			
			if ("ai" in this.entities.list[i])
			{
				if (this.entities.list[i].ai != null)
					this.entities.list[i].ai.Flush();
			}
		}
	
		this.frozen = true;
	}
};

Level.prototype.Thaw = function()
{
	if (this.frozen)
	{
		// Place the player where he used to be
		player.posX = this.storedPlayerPosition.x;
		player.posY = this.storedPlayerPosition.y;
	
		// Put the camera back too
		camera.setPosition(this.storedCameraPosition.x,this.storedCameraPosition.y);
	
		// Restore the camera's ratcheting settings
		camera.enableRatchet = this.enableRatchet;
		camera.xRatchetMin = this.xRatchetMin;
		camera.xRatchetMax = this.xRatchetMax;
		camera.yRatchetMin = this.yRatchetMin;
		camera.yRatchetMax = this.yRatchetMax;
	
		this.frozen = false;
		
		// Go through all entities and thaw them
		for (var i=0; i < this.entities.list.length; i++)
		{
			if ("Thaw" in this.entities.list[i])
			{
				this.entities.list[i].Thaw(this);
			}
		}
			
		
		hud.DisplayMessage(this.displayName);
	}
};

// Update any objects in the level that need updating
Level.prototype.Update = function()
{
	// Spawn any entities that should be spawned based on camera position
	for (var i = 0; i < this.entitiesToSpawn.length; i++)
	{
		if ((this.entitiesToSpawn[i].posX + this.entitiesToSpawn[i].hitRect.xMin) < (camera.boundingRect.xMax + 50))
		{
			this.entities.AddEntity(this.entitiesToSpawn[i]);
			this.entitiesToSpawn.splice(i,1);
			i--;
		}
		else
		{
			break;
		}
	}
	
	for (var i=0; i < this.background.length; i++)
	{
		this.background[i].Update();
	}
	for (var i=0; i < this.foreground.length; i++)
	{
		this.foreground[i].Update();
	}
	for (var i=0; i < this.skirmishes.length; i++)
	{
		this.skirmishes[i].Update();
	}
	for (var i=0; i < this.transitions.length; i++)
	{
		if (this.transitions[i].Update())
			break;
	}
};

// Draw the background
Level.prototype.DrawBackground = function()
{
	for (var i=0; i < this.background.length; i++)
	{
		this.background[i].Draw();
	}
};

// Draw the foreground (and any debug graphics)
Level.prototype.DrawForeground = function()
{
	for (var i=0; i < this.foreground.length; i++)
	{
		this.foreground[i].Draw();
	}
};

// This function accepts a bounding box and returns a position adjustment to resolve any level collisions
Level.prototype.Collide = function(posX, posY, radius, entity)
{
	return this.collisionMask.Collide(posX, posY, radius, entity);
};

Level.prototype.PlaceWithCollision = function(startX, startY, destX, destY, radius, moveStepSizeOverride)
{
	// Use continuous collision detection...
	var moveStepSize = 20;
	
	if(typeof(moveStepSizeOverride)!=='undefined') 
		moveStepSize = moveStepSizeOverride
	
	var deltaX = (destX-startX);
	var deltaY = (destY-startY);
	
	var steps = Math.floor(speed2(deltaX,deltaY)/moveStepSize)+1;

	var dx = deltaX / steps;
	var dy = deltaY / steps;

	for (var step=0; step < steps; step++)
	{
		startX += dx;
		startY += dy;

		var ejectionVector = this.Collide(startX, startY, radius, null);
		startX += ejectionVector.x;
		startY += ejectionVector.y;
	}
	
	return {'posX':startX, 'posY': startY};
};

Level.prototype.Reset = function()
{
	enemiesDispatched -= this.dominationCollected;
	enemiesCorrupted -= this.corruptionCollected;
	this.entitiesToSpawn = [];
	this.started = false;
	this.frozen = false;
	this.dominationCollected = 0;
	this.corruptionCollected = 0;
	this.LoadFromLevelDescriptor(this.levelDescriptor);
	this.Start();
};

Level.prototype.LoadFromLevelDescriptor = function(descriptor)
{	
	if (!isEditor && descriptor.hasOwnProperty("levelDescriptor"))
	{
		this.levelDescriptor = descriptor.levelDescriptor;
	}
	else
	{
		this.levelDescriptor = descriptor;
	}
	
	// Serialized properties
	for (var i = 0; i < this.editorProperties.length; i++)
	{
		if (descriptor.hasOwnProperty(this.editorProperties[i]))
		{
			this[this.editorProperties[i]] = descriptor[this.editorProperties[i]];
		}
	}

	this.spawnPosition = {'x':0, 'y':-240};
	if (descriptor.hasOwnProperty("spawnPosition"))
	{
		if (descriptor.z === 0)
			delete descriptor.spawnPosition;
		this.spawnPosition = descriptor.spawnPosition;
	}
	
	this.entities = new EntityList();
	
	if (descriptor.hasOwnProperty("entities"))
	{
		for (var i = 0; i < descriptor.entities.length; i++)
		{
			var obj = this.GenerateObjectFromSubDescriptor(descriptor.entities[i]);
			if (obj !== null)
				this.entities.AddEntity(obj);
		}
	}
	
	if (descriptor.hasOwnProperty("effects"))
	{
		for (var i = 0; i < descriptor.effects.length; i++)
		{
			var obj = this.GenerateObjectFromSubDescriptor(descriptor.effects[i]);
			if (obj !== null)
				this.entities.AddEffect(obj);
		}
	}
	
	this.foreground = [];
	if (descriptor.hasOwnProperty("foreground"))
	{
		for (var i = 0; i < descriptor.foreground.length; i++)
		{
			var obj = this.GenerateObjectFromSubDescriptor(descriptor.foreground[i]);
			if (obj !== null)
				this.foreground.push(obj);
		}
	}
	
	this.background = [];
	if (descriptor.hasOwnProperty("background"))
	{
		for (var i = 0; i < descriptor.background.length; i++)
		{
			var obj = this.GenerateObjectFromSubDescriptor(descriptor.background[i]);
			if (obj !== null)
				this.background.push(obj);
		}
	}
	
	this.skirmishes = [];
	if (descriptor.hasOwnProperty("skirmishes"))
	{
		for (var i = 0; i < descriptor.skirmishes.length; i++)
		{
			var obj = this.GenerateObjectFromSubDescriptor(descriptor.skirmishes[i]);
			if (obj !== null)
				this.skirmishes.push(obj);
		}
	}
	
	this.transitions = [];
	if (descriptor.hasOwnProperty("transitions"))
	{
		for (var i = 0; i < descriptor.transitions.length; i++)
		{
			var obj = this.GenerateObjectFromSubDescriptor(descriptor.transitions[i]);
			if (obj !== null)
				this.transitions.push(obj);
		}
	}
	
	this.collisionMask = new LevelCollisionMask();
	if (descriptor.hasOwnProperty("collisionMask"))
	{
		for (var i = 0; i < descriptor.collisionMask.length; i++)
		{
			var obj = this.GenerateObjectFromSubDescriptor(descriptor.collisionMask[i]);
			if (obj !== null)
				this.collisionMask.AddLineObject(obj);
		}
	}
	
	this.cameraMask = new LevelCollisionMask();
	if (descriptor.hasOwnProperty("cameraMask"))
	{
		for (var i = 0; i < descriptor.cameraMask.length; i++)
		{
			var obj = this.GenerateObjectFromSubDescriptor(descriptor.cameraMask[i]);
			if (obj !== null)
				this.cameraMask.AddLineObject(obj);
		}
	}
};

Level.prototype.GenerateObjectFromSubDescriptor = function(descriptor)
{
	if (!descriptor.hasOwnProperty("descriptorObjectType"))
	{
		return null;
	}
	
	var MyClass = stringToFunction(descriptor.descriptorObjectType);
	
	var entity = new MyClass();
	if (entity !== null)
	{
		// Crawl through the descriptor checking if each property is an editor property
		// if it is, store it in the descriptor
		for (var property in descriptor) 
		{
			if (descriptor.hasOwnProperty(property) && entity.hasOwnProperty(property) && globalPropertyBlacklist.indexOf(property) === -1) 
			{
				if (property === "imageName")
				{
					var selectedName = descriptor[property];
					var newValue = "";				
					if (selectedName.length > 12 && selectedName.substring(0, 12) === "(Animation) ")
					{
						// Search the animation library for this animation
						var animationName = selectedName.substring(12, selectedName.length);
						newValue = animatedElementLibrary[animationName];
					}
					else
					{
						newValue = descriptor[property];
					}
					
					entity[property] = newValue; 
				}
				else if (property === "box" || property === "triggerRegion")
				{
					entity[property] = new BoundingRect();
					entity[property].xMin =  descriptor[property].xMin;
					entity[property].xMax =  descriptor[property].xMax;
					entity[property].yMin =  descriptor[property].yMin;
					entity[property].yMax =  descriptor[property].yMax;
				}
				else
				{
					entity[property] = descriptor[property];
				}
			}
		}
		
		// If the object has a ReInit property, call it to load up animations and such
		if ("ReInit" in entity)
			entity.ReInit(this);
			
		if ("recruited" in entity && entity.recruited)
		{
			entity.posX += 1;
		}
		
		// Make sure nobody has more than max health
		if (entity.hasOwnProperty("health") && entity.hasOwnProperty("maxHealth"))
		{
			if (entity.health > entity.maxHealth)
				entity.health = entity.maxHealth;
		}
		
	}
	return entity;
};

Level.prototype.GenerateDescriptor = function()
{
	var descriptor = {};
	
	var isLiveLevel = !this.frozen;
	if (!isEditor && isLiveLevel)
	{
		this.Freeze();
	}
	
	// Serialized properties
	for (var i = 0; i < this.editorProperties.length; i++)
	{
		if (this.hasOwnProperty(this.editorProperties[i]))
		{
			descriptor[this.editorProperties[i]] = this[this.editorProperties[i]];
		}
	}
	
	// Create a new entity list as a copy of the original
	var entityList = new EntityList();
	entityList.AddEntityList(this.entities);
	
	// If this is a live level, we need to do some stuff to prepare it for serialization
	if (!isEditor)
	{
		descriptor.levelDescriptor = this.levelDescriptor;
		
		// Drain the skirmishes of entities
		for (var i = 0; i < this.skirmishes.length; i++)
		{
			entityList.AddEntityList(this.skirmishes[i].entities);
		}
		
		// Put all the entities waiting to be spawned back into the entity list
		for (var i = 0; i < this.entitiesToSpawn.length; i++)
		{
			entityList.AddEntity(this.entitiesToSpawn[i]);
		}
		
		// Stop all skirmishes (but leave them in a state where they look like they are running)
		for (var i = 0; i < this.skirmishes.length; i++)
		{
			if (this.skirmishes[i].started && ! this.skirmishes[i].finished)
			{
				this.skirmishes[i].Finish(this);
				this.skirmishes[i].started = true;
				this.skirmishes[i].finished = false;
			}
		}
		
	}
	
	// Iterate over the entities, generating sub-descriptors for each
	descriptor.entities = [];
	for (var i = 0; i < entityList.list.length; i++)
	{
		if (entityList.list[i] === player)
		{
			descriptor.spawnPosition = {'x':player.posX, 'y':player.posY, 'z':player.posZ};
		}
		else if (!(entityList.list[i] instanceof RepeatingBackground)) // Make sure we don't accidentally include the repeating background as a real entity
		{
			descriptor.entities.push(GenerateObjectSubDescriptor(entityList.list[i]));
		}
	}
	
	descriptor.effects = [];
	for (var i = 0; i < entityList.effects.length; i++)
	{
		descriptor.effects.push(GenerateObjectSubDescriptor(entityList.effects[i]));
	}
	
	descriptor.foreground = [];
	for (var i = 0; i < this.foreground.length; i++)
	{
		descriptor.foreground.push(GenerateObjectSubDescriptor(this.foreground[i]));
	}
	
	descriptor.background = [];
	for (var i = 0; i < this.background.length; i++)
	{
		descriptor.background.push(GenerateObjectSubDescriptor(this.background[i]));
	}
	
	descriptor.skirmishes = [];
	for (var i = 0; i < this.skirmishes.length; i++)
	{
		descriptor.skirmishes.push(GenerateObjectSubDescriptor(this.skirmishes[i]));
	}
	
	descriptor.transitions = [];
	for (var i = 0; i < this.transitions.length; i++)
	{
		descriptor.transitions.push(GenerateObjectSubDescriptor(this.transitions[i]));
	}
	
	descriptor.collisionMask = [];
	for (var i = 0; i < this.collisionMask.lines.length; i++)
	{
		descriptor.collisionMask.push(GenerateObjectSubDescriptor(this.collisionMask.lines[i]));
	}
	
	descriptor.cameraMask = [];
	for (var i = 0; i < this.cameraMask.lines.length; i++)
	{
		descriptor.cameraMask.push(GenerateObjectSubDescriptor(this.cameraMask.lines[i]));
	}
	
	// Some live level post serialization processing...
	if (!isEditor)
	{	
		for (var i = 0; i < this.skirmishes.length; i++)
		{
			// Resume any artificially stopped skirmishes
			if (this.skirmishes[i].started && !this.skirmishes[i].finished)
			{
				this.skirmishes[i].started = false;
				this.skirmishes[i].finished = false;
				this.skirmishes[i].Start(this);
			}
		}
		
		if (isLiveLevel)
			this.Thaw();
	}
	
	return descriptor;
};

function GenerateObjectSubDescriptor(obj)
{
	if (obj.hasOwnProperty("serializable"))
	{
		if (obj.serializable === false)
		{
			return {};
		}
	}
	
	var descriptor = {};
	
	descriptor.descriptorObjectType = obj.constructor.name;
	
	
	// Crawl through the object checking if each property is an editor property
	// if it is, store it in the descriptor
	for (var property in obj) 
	{
		if (isEditorProperty(property, obj)) 
		{
			if (obj[property] instanceof Animation)
			{
				descriptor[property] = "(Animation) Unknown";
				for (var animName in animatedElementLibrary)
				{
					if (animatedElementLibrary.hasOwnProperty(animName) && animatedElementLibrary[animName] === obj[property])
					{
						var animName = "(Animation) " + animName;
						descriptor[property] = animName;
						break;
					}
				}
			}
			else
			{
				// Hack to snap everything loaded to the 1/3 pixel grid
				if (property === 'posX' || property === 'posY' || property === 'posZ')
					descriptor[property] = Math.round(obj[property]/3)*3;
				else
					descriptor[property] = obj[property];
			}
		}
	}
	return descriptor;
};

// Always show these properties if they exist
var globalEditorProperties = ["displayName", "spawnOnSkirmish", "posX", "posY", "posZ", "facing"];
var globalPropertyBlacklist = [	"orbsOnDeath" ];

function isEditorProperty(propName, obj)
{
	// If this property is on the blacklist, return false
	if (globalPropertyBlacklist.indexOf(propName) !== -1)
		return false;
		
	// If the object doesn't have the property in question, return false
	if (!obj.hasOwnProperty(propName))
		return false;
		
	// If this object has no editor or runtime properties, return true
	if (!("editorProperties" in obj) && !("runtimeProperties" in obj))
		return true;
	
	// If the property is in the global list, return true
	if (globalEditorProperties.indexOf(propName) !== -1)
		return true;
	
	// If the property is in the local editor list, return true
	if ("editorProperties" in obj  && obj.editorProperties.indexOf(propName) !== -1)
	{
		return true;
	}
	
	if ( !isEditor && "runtimeProperties" in obj && obj.runtimeProperties.indexOf(propName) !== -1)
	{
		return true;
	}
	
	return false;
};