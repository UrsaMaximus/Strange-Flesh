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

function SkirmishBox()
{
	// The SkirmishBox is capable to being activated
	this.enabled = true;
	
	this.box = new BoundingRect();
	this.started = false;
	this.finished = false;
	
	this.triggerRegion = new BoundingRect();
	
	this.cameraGuides = null;
	this.collisionGuides = null;
	this.entities = new EntityList();
};

SkirmishBox.prototype.editorProperties = ['triggerRegion','box'];
SkirmishBox.prototype.runtimeProperties = ['started','finished'];

SkirmishBox.prototype.ReInit = function()
{
};

SkirmishBox.prototype.Start = function(targetLevel)
{
	if(typeof(targetLevel)==='undefined')
		targetLevel = level;
		
	if (!this.started)
	{
		this.started = true;
	
		// Install the new camera guides
		/*
		var cameraBox = this.box.Copy();
		cameraBox.xMin += 420
		cameraBox.xMax -= 420;
		cameraBox.expandToMinSize(1080,1080);
		this.cameraGuides = level.cameraMask.AddRect(cameraBox);
		*/
		camera.enableRatchet = true;
		camera.xRatchetMin = Math.floor((this.box.xMin + 960)/3)*3;
		camera.xRatchetMax = Math.floor((this.box.xMax - 960)/3)*3;
		camera.yRatchetMin = Math.floor((this.box.yMin + 540)/3)*3;
		camera.yRatchetMax = Math.floor((this.box.yMax - 540)/3)*3;
	
		// Add the box's borders to the level collision map
		this.collisionGuides = level.collisionMask.AddRect(this.box, true);
		
		// Pop the player inside of the box
		placeEntityInsideBox(player, this.box);
	
		// Activate all the disabled enemies inside the box
		for (var i = 0; i < this.entities.list.length; i++)
		{
			if (this.entities.list[i].spawnOnSkirmish)
			{
				targetLevel.entities.AddEntity(this.entities.list[i]);
			}
		}
		
		for (var i = 0; i < this.entities.effects.length; i++)
		{
			if (this.entities.effects[i].spawnOnSkirmish)
			{
				targetLevel.entities.AddEffect(this.entities.effects[i]);
			}
		}
	}
};

SkirmishBox.prototype.Finish = function(targetLevel)
{
	if(typeof(targetLevel)==='undefined')
		targetLevel = level;
	
	
	if (!this.finished)
	{
		this.finished = true;
		
		// Delete the camera guides
		/*
		level.cameraMask.RemoveLines(this.cameraGuides);
		this.cameraGuides = null;
		*/
		camera.enableRatchet = false;
		
		// Delete the skirmish locks on the level collision map
		targetLevel.collisionMask.RemoveLines(this.collisionGuides);
		this.collisionGuides = null;
	}
};

SkirmishBox.prototype.Update = function()
{
	// If the box has not yet been triggered,
	// Check if the player is sufficiently inside to trigger it
	if (!this.started && player !== null && this.enabled)
	{
		if (this.triggerRegion.PointIntersect(player.posX,player.posY))
		{
			this.Start();
		}
	}
	// If the box has been triggered
	else if (this.started && !this.finished)
	{
		// Pop the player inside of the box
		placeEntityInsideBox(player, this.box);
		
		// Check if all the entities are dead.
		for(var i = 0; i < this.entities.drawList.length; i++)
		{
			// If there's an enemy that isn't dead or dying, abort the finish process
			if (this.entities.drawList[i].alliance > 1 && !IsDeadOrDying(this.entities.drawList[i].state))
				return;
		}
		
		this.Finish();
	}
};

// Draw the box, colored based on state
SkirmishBox.prototype.Draw = function()
{
	drawBoundingBox(this.box);
	drawBoundingBox(this.triggerRegion);
};

// Draw the box, colored based on state
SkirmishBox.prototype.DrawEditControl = function()
{
	ctx.font = (42.0 / camera.scale).toString() + "px alagard";
	ctx.textAlign = "center";
	ctx.textBaseline="top";
			
	drawBoundingBox(this.box);
	ctx.strokeStyle = "#F00";
	drawBoundingBox(this.triggerRegion);
	drawTextWithShadow("Trigger", this.triggerRegion.centerX(), this.triggerRegion.yMin + 20);
};