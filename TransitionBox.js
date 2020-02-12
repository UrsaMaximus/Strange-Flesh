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

function TransitionBox()
{
	// The TransitionBox is capable to being activated
	this.enabled = true;
	
	this.playerInside = true;
	this.triggered = false;
	
	this.box = new BoundingRect();
	this.changeFakeHeight = false;
	this.fakeHeightYFactor = 1;
	this.changeLevel = false;
	this.targetLevel = "nextLevel";
	
	this.killEnemies = false;
	
	this.limitZHeight = false;
	this.zHeightLimit = 1080;
	
	this.activationZMin = 0;
	this.activationZMax = 1000;
	
	this.relativeWarp = false;
	this.relativeWarpX = 0;
	this.relativeWarpY = 0;
	this.relativeWarpZ = 0;
	
	this.entitiesInside = [];
};

TransitionBox.prototype.editorProperties = ['box','changeFakeHeight','fakeHeightYFactor','limitZHeight','zHeightLimit','changeLevel','targetLevel', 'relativeWarp', 'relativeWarpX', 'relativeWarpY', 'relativeWarpZ', 'activationZMin', 'activationZMax','killEnemies'];

// Draw the box, colored based on state
TransitionBox.prototype.Draw = function()
{
	drawBoundingBox(this.box);
};

// Draw the box, colored based on state
TransitionBox.prototype.DrawEditControl = function()
{
	ctx.font = (42.0 / camera.scale).toString() + "px alagard";
	ctx.textAlign = "center";
	ctx.textBaseline="top";
	ctx.strokeStyle = "#00F";
	drawBoundingBox(this.box);
	drawTextWithShadow(this.targetLevel, this.box.centerX(), this.box.yMin + 20);
};

TransitionBox.prototype.Update = function()
{
	// Check that this object is part of the currently loaded level (bugfix for insane async issue)
	//if (level === null)
	//	return;
	//if (level.transitions.indexOf(this) === -1)
	//	return;
	
	// Reset the trigger each frame
	this.triggered = false;
	var changedLevel = false;
	
	// Check if the player is currently inside
	if (this.enabled && player !== null && !isEditor)
	{
		var playerInside = this.box.PointIntersect(player.posX, player.posY) && 
							player.posZ >= this.activationZMin &&
							player.posZ <= this.activationZMax;
		if (!this.playerInside && playerInside)
		{
			this.triggered = true;
			
			if (this.changeLevel)
			{
				loadLevelFromURL(this.targetLevel, true);
				changedLevel = true;
			}
			
		}
		this.playerInside = playerInside;
	}
	return changedLevel;
};