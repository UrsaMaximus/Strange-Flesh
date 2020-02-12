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

function EntitySpawner()
{
	// Editor properties are always reinited when changed
	this.editorProperties = ['entityList','entityLimit','spawnInRelX','spawnInRelY','spawnInRelZ','spawnOnSkirmish'];
	
	this.displayName = "Entity Spawner";
	
	this.entityList = "Joe,Joe,Joe";
	this.entityLimit = 1;
	this.activeEntities = [];
	
	this.spawnOnSkirmish = true;
	this.spawnInRelX = 0;
	this.spawnInRelY = 0;
	this.spawnInRelZ = 0;
	
	// Don't reset these properties on re-init
	this.posX = 0;
	this.posY = 0;
	this.posZ = 0;
	this.facing = 0;
	this.state = States.Unknown;
	this.alliance = 2;
	
	this.spawnCooldownMax = 75;
	this.spawnTimer = 0;
};

EntitySpawner.prototype.Die = function()
{
	this.state = States.Dead;
};

EntitySpawner.prototype.Respawn = function(pos)
{
	this.posX = pos.x;
	this.posY = pos.y;
	this.posZ = pos.z;
	this.state = States.Unknown;
};

EntitySpawner.prototype.DequeueEntityName = function()
{
	// If the list is empty, return null
	if (this.entityList === null || this.entityList.length === 0)
		return null;
	
	var names = this.entityList.split(",");
	
	// Return the first name and splice it out
	var name = names[0];
	names.splice(0,1);
	
	if (names.length === 0)
		this.entityList = "";
	else if (names.length === 1)
		this.entityList = names[0];
	else
		this.entityList = names.join(",");
		
	return name;
};

EntitySpawner.prototype.QueuedEntityCount = function()
{
	if (this.entityList === null || this.entityList.length === 0)
		return 0;
	else
		return (this.entityList.split(",").length);
};

EntitySpawner.prototype.Draw = function()
{
	if (debug === 2 || isEditor)
	{
		ctx.save();
    	ctx.translate(this.posX,this.posY);

		// Figure out what the label will say, setup the text render settings
		// and measure how large the text will be
		var labelTxt = "Remaining: " + this.QueuedEntityCount();
		
		ctx.font = "48px alagard";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		var margin = 20;
		var width = ctx.measureText(labelTxt).width;
		var height = 24.0;
	
		// Draw a translucent black backing fo the text
		ctx.fillStyle = "#000000";
		ctx.globalAlpha = 0.4;
		ctx.fillRect(-width/2-margin, -margin-height/2, width+margin+margin,height+margin+margin);
		ctx.globalAlpha = 1.0;
		
		ctx.strokeStyle = "#F00";
		ctx.lineWidth = 4.0 / camera.scale;
		drawCrosshairs(this.spawnInRelX, this.spawnInRelY - this.spawnInRelZ, 50) 
	
		// Draw the text in white
		ctx.fillStyle = "#FFFFFF";
		ctx.fillText(labelTxt,0,0);

    	ctx.restore();
	}
};

EntitySpawner.prototype.Update = function()
{
	var recruitedCount = 0;
	
	// Scan through the active entities list and perform a few functions...
	for (var i = 0; i < this.activeEntities.length; i++)
	{
		// Remove any dead or corrupt entities
		if (IsDeadOrDying(this.activeEntities[i].state) || IsCorrupt(this.activeEntities[i].state))
		{
			this.activeEntities.splice(i,1);
			i--;
		}
		
		else if (this.activeEntities[i].alliance === player.alliance)
		{
			recruitedCount += 1;
		}
	}
	
	if (this.spawnTimer > 0)
		this.spawnTimer--;
	
	// Spawn new entities up to the limit
	while(this.activeEntities.length < this.entityLimit + recruitedCount && this.QueuedEntityCount() > 0 && this.spawnTimer === 0)
	{
		var MyClass = stringToFunction(this.DequeueEntityName());
		var testEnemy = new MyClass();
		
		if (testEnemy !== null)
		{
			if ("ChangeAlliance" in testEnemy)
				testEnemy.ChangeAlliance(2);
			if ("Respawn" in testEnemy)
				testEnemy.Respawn({'x':this.posX + this.spawnInRelX, 'y':this.posY + this.spawnInRelY, 'z':this.posZ + this.spawnInRelZ});
			if (testEnemy.hasOwnProperty("facing"))
				testEnemy.facing = this.facing;
			if ("spawnOnSkirmish" in testEnemy)
				testEnemy.spawnOnSkirmish = true;
			
			// Tell the new enemy to walk onscreen (OLD TECHNIQUE)
			testEnemy.newlySpawned = true;
			testEnemy.newlySpawnedTargetX = this.posX;
			testEnemy.newlySpawnedTargetY = this.posY;
			
			// Tell the new enemy to walk onscreen (NEW TECHNIQUE)
			if (testEnemy.ai != null)
			{
				testEnemy.ai.QueueAction(new GoToPointAction(this.posX, this.posY, 10, false));
			}
			
			this.activeEntities.push(testEnemy);
			level.entities.AddEntity(testEnemy);
			this.spawnTimer = this.spawnCooldownMax;
		}
	}
	
	// Perform a check to see if all the entities have been spawned and if they're all dead.
	// If they are, also kill the spawner.
	if (this.QueuedEntityCount()===0 && this.activeEntities.length === recruitedCount)
	{
		this.Die();
	}
};