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

function LevelCollisionMask()
{
	this.lines = [];
};

LevelCollisionMask.prototype.AddPolyLine = function()
{
	var lines = [];
	for (var i = 1; i < Math.floor(arguments.length/2.0); i++ ) 
	{
    	lines.push(this.AddLine(arguments[2*(i-1)],arguments[2*(i-1)+1],arguments[2*i],arguments[2*i+1]));
  	}
  	return lines;
};

LevelCollisionMask.prototype.AddLine = function(x1,y1,x2,y2)
{
	var line = new LineSegment(x1,y1,x2,y2);
	this.lines.push(line);
	return line;
};

LevelCollisionMask.prototype.AddLineObject = function(line)
{
	this.lines.push(line);
};

LevelCollisionMask.prototype.AddRect = function(rect, playerOnly)
{    
	if (typeof playerOnly == "undefined" ) 
    	playerOnly = false;
	
	var top = new LineSegment(rect.xMin,rect.yMin,rect.xMax,rect.yMin);
	var bot = new LineSegment(rect.xMin,rect.yMax,rect.xMax,rect.yMax);
	var left = new LineSegment(rect.xMin,rect.yMin,rect.xMin,rect.yMax);
	var right = new LineSegment(rect.xMax,rect.yMin,rect.xMax,rect.yMax);
	
	top.playerOnly = playerOnly;
	bot.playerOnly = playerOnly;
	left.playerOnly = playerOnly;
	right.playerOnly = playerOnly;
	
	this.lines.push(top);
	this.lines.push(bot);
	this.lines.push(left);
	this.lines.push(right);
	
	return [top, bot, left, right];
};

LevelCollisionMask.prototype.AddLines = function(lines)
{
	for (var i=0; i < lines.length; i++)
		this.lines.push(lines[i]);
};

LevelCollisionMask.prototype.RemoveLines = function(lines)
{
	for (var i = 0; i < lines.length; i++)
	{
		var index = this.lines.indexOf(lines[i]);
		if (index !== -1)
		{
			this.lines.splice(index, 1);
		}
	}
};

// Update any objects in the level that need updating
LevelCollisionMask.prototype.Update = function()
{
};

// Draw the lines (debug only)
LevelCollisionMask.prototype.Draw = function()
{
	for (var i = 0; i < this.lines.length; i++)
	{
		this.lines[i].Draw();
	}
};

// This function accepts a circle and returns a position adjustment to resolve any level collisions
LevelCollisionMask.prototype.Collide = function(posX,posY,radius,entity)
{
    if (typeof entity == "undefined" ) 
    	entity = null;
    	
	var newPosition = {x:posX,y:posY};
	
	//for (var j = 0; j < 3; j++)
	{
		for (var i = 0; i < this.lines.length; i++)
		{
			if (entity === player || !this.lines[i].playerOnly || (entity !== null && IsKnockedBack(entity.state)))
			{
				var tmp = this.lines[i].EjectCircle(newPosition.x, newPosition.y, radius);
				newPosition.x += tmp.x;
				newPosition.y += tmp.y;
			}
		}
	}
	
	return { x:newPosition.x-posX, y:newPosition.y - posY };
};