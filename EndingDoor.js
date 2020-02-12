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

function EndingDoor()
{
	this.blendMode = "source-over";
	this.alpha = 1.0;
	this.posX = 0;
	this.posY = 0;
	this.orderBonus = 0;
	this.facing = 0;
	this.scale = 3.0;
	
	this.endingType = 0;
	this.open = false;
	
	this.collisionGuides = [];
	this.blockForegorundTile = null;
	
	this.openAnimations = [];
	this.closedAnimations = [];
	this.corruptNeuronAnim = null;
	
	this.animationSetup();
};

EndingDoor.prototype.Freeze = function(targetLevel)
{
	if(typeof(targetLevel)==='undefined')
		targetLevel = level;
	
	targetLevel.collisionMask.RemoveLines(this.collisionGuides);
	this.collisionGuides = [];
	
	if (this.blockForegorundTile !== null)
	{
		var index = targetLevel.foreground.indexOf(this.blockForegorundTile);
		if (index !== -1)
		{
			targetLevel.foreground.splice(index,1);
		}
	}
}

EndingDoor.prototype.Thaw = function(targetLevel)
{
	if(typeof(targetLevel)==='undefined')
		targetLevel = level;
	
	// Determine if we will unlock each ending type
	if (this.endingType === 0)	// Dominate
	{
		this.open = (enemiesDispatched >= enemiesCorrupted && enemiesDispatched > 0) || (enemiesDispatched >= Math.floor(totalEnemies * 0.45)) || debug>0;
	}
	else if (this.endingType === 1)	// Corrupt
	{
		this.open = (enemiesCorrupted >= enemiesDispatched && enemiesCorrupted > 0) || (enemiesCorrupted >= Math.floor(totalEnemies * 0.45)) || debug>0;
	}
	else if (this.endingType === 2)	// Exit
	{
		this.open = (neverSaved) || debug > 0;
	}
	
	if (!this.open)
	{
		if (this.endingType === 2)
		{
			// Vertical line
			this.collisionGuides = targetLevel.collisionMask.AddPolyLine(this.posX-30, -60 * this.scale + this.posY, this.posX-30, 60 * this.scale + this.posY);
		}
		else
		{
			// Horizontal line
			this.collisionGuides = targetLevel.collisionMask.AddPolyLine(-20 * this.scale + this.posX, this.posY-38*3, 20 * this.scale + this.posX, this.posY-38*3);
		}
	}
	else
	{
		this.collisionGuides = [];
	}
	
	if (this.endingType === 2 && !this.open)
	{
		if (this.blockForegorundTile === null)
			this.blockForegorundTile = new RepeatingBackground("endingdoors/blockade");
		this.blockForegorundTile.posX = this.posX - 69*3;
		this.blockForegorundTile.posY = this.posY - 223*3;
		
		targetLevel.foreground.push(this.blockForegorundTile);
	}

}

EndingDoor.prototype.editorProperties = ['endingType'];

EndingDoor.prototype.ReInit = function(targetLevel)
{		
	if(typeof(targetLevel)==='undefined')
		targetLevel = level;
	this.Freeze(targetLevel);
	this.Thaw(targetLevel);
};

EndingDoor.prototype.Draw = function()
{
	if (this.open)
	{
		if (this.endingType < this.openAnimations.length)
		{
			this.openAnimations[this.endingType].GetFrame().DrawSprite3x(this.posX,this.posY, false);
		}
	}
	else
	{
		if (this.endingType < this.closedAnimations.length)
		{
		
			this.closedAnimations[this.endingType].GetFrame().DrawSprite3x(this.posX,this.posY, false);
			if (this.endingType === 2)
				this.corruptNeuronAnim.GetFrame().DrawSprite3x(this.posX-10,this.posY, true);
		
		}
	}
};

EndingDoor.prototype.Update = function()
{
	// This is a hacky way to update the collision map
	this.Freeze();
	this.Thaw();
	
	if (this.open)
	{
		if (this.endingType < this.openAnimations.length)
		{
			if (Math.abs(player.posX-this.posX) < 240)
				this.openAnimations[this.endingType].direction = 1;
			else
				this.openAnimations[this.endingType].direction = -1;
		
			this.openAnimations[this.endingType].Update();
		}
		
		
		// Check if the player is inside the door...
		
		if (this.endingType === 0)
		{
			if (Math.abs(player.posX-this.posX) < 40 && player.posY < this.posY-45*3)
			{
				ShowEndingCutsceneDomination("title", true)
			}
		}
		else if (this.endingType === 1)
		{
			if (Math.abs(player.posX-this.posX) < 40 && player.posY < this.posY-45*3)
			{
				ShowEndingCutsceneCorruption("title", true)
			}
		}
		else if (this.endingType === 2)
		{
			if (Math.abs(player.posY-this.posY) < 140 && player.posX > this.posX+45*3)
			{
				ShowEndingCutsceneExit("title", true)
			}
		}
													
		
	}
	else
	{
		this.corruptNeuronAnim.Update();
		if (this.endingType < this.closedAnimations.length)
		{
			this.closedAnimations[this.endingType].Update();
		}
	}
};

// All the animation frames associated with the ending doors.
GlobalResourceLoader.AddImageResource("sheet_Checkpoint","images/checkpoint/sheet_Checkpoint.txt");
GlobalResourceLoader.AddImageResource("sheet_EndingDoors","images/level6/sheet_EndingDoors.txt");

EndingDoor.prototype.animationSetup = function()
{
	// Dominate Door Closed
	var anim = new Animation(this);
	anim.AddFrame("endingdoors/dominate0");
	anim.SetDurationInSeconds(1.0);
	this.closedAnimations.push(anim);
	
	// Corrupt Door Closed
	var anim = new Animation(this);
	anim.AddFrame("endingdoors/corrupt0");
	anim.SetDurationInSeconds(1.0);
	this.closedAnimations.push(anim);
	
	// Exit Door Closed
	var anim = new Animation(this);
	anim.AddFrame("endingdoors/exit_bg");
	anim.SetDurationInSeconds(1.0);
	this.closedAnimations.push(anim);
	
	// Dominate Door Open
	var anim = new Animation(this);
	anim.AddSequentialFrames("endingdoors/dominate{0}", 1, 8);
	anim.SetDurationInSeconds(1.0);
	this.openAnimations.push(anim);
	
	// Corrupt Door Open
	var anim = new Animation(this);
	anim.AddSequentialFrames("endingdoors/corrupt{0}", 1, 8);
	anim.SetDurationInSeconds(1.0);
	this.openAnimations.push(anim);
	
	// Exit Door Open
	var anim = new Animation(this);
	anim.AddFrame("endingdoors/exit_bg");
	anim.SetDurationInSeconds(1.0);
	this.openAnimations.push(anim);
	
	// Corrupt animation
	this.corruptNeuronAnim = new Animation(this);
	this.corruptNeuronAnim.AddSequentialFrames("checkpoint/corrupt{0}",4,15);
	this.corruptNeuronAnim.SetDurationInSeconds(1.1);
	this.corruptNeuronAnim.repeat = 1;
};