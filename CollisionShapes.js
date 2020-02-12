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

function BoundingRect()
{
	this.xMin = 0;
	this.xMax = 0;
	this.yMin = 0;
	this.yMax = 0;
};

BoundingRect.prototype.SetBounds = function(x1,y1,x2,y2)
{
	this.fitToPoint({x:x1,y:y1});
	this.expandToFit({x:x2,y:y2});
};

BoundingRect.prototype.fitToPoint = function(pos)
{
	this.xMin = pos.x;
	this.xMax = pos.x;	
	this.yMin = pos.y;
	this.yMax = pos.y;
};

BoundingRect.prototype.expandToFit = function(pos)
{
	if (pos.x < this.xMin)
		this.xMin = pos.x;
	if (pos.x > this.xMax)
		this.xMax = pos.x;	
	if (pos.y < this.yMin)
		this.yMin = pos.y;
	if (pos.y > this.yMax)
		this.yMax = pos.y;
};


BoundingRect.prototype.expandToMinSize = function(width, height)
{
	var addedWidth = (width - this.width()) / 2.0;
	var addedHeight = (height - this.height()) / 2.0;
	
	if (addedWidth > 0)
	{
		this.xMin -= addedWidth;
		this.xMax += addedWidth;
	}
	
	if (addedHeight > 0)
	{
		this.yMin -= addedHeight;
		this.yMax += addedHeight;
	}
};

BoundingRect.prototype.centerX = function()
{
	return (this.xMin + this.xMax)/2.0;
};

BoundingRect.prototype.centerY = function()
{
	return (this.yMin + this.yMax)/2.0;
};

BoundingRect.prototype.width = function()
{
	return this.xMax - this.xMin;
};

BoundingRect.prototype.height = function()
{
	return this.yMax - this.yMin;
};

BoundingRect.prototype.CircleIntersect = function(posX,posY,radius)
{
	// First check, expand the rectangle and do AABB
	if (posX >= this.xMin-radius && posX <= this.xMax+radius && 
		posY >= this.yMin-radius && posY <= this.yMax+radius )
	{
		// Don't bother with more expensive checks to rule out bits at the corners, it's not worth it.
		return true;
	}
	return false;
};

BoundingRect.prototype.PointIntersect = function(posX,posY)
{
	if (posX > this.xMin && posX < this.xMax && 
		posY > this.yMin && posY < this.yMax )
	{
		return true;
	}
	return false;
};


BoundingRect.prototype.Copy = function()
{
	var newRect = new BoundingRect();
	
	newRect.xMin = this.xMin;
	newRect.xMax = this.xMax;
	newRect.yMin = this.yMin;
	newRect.yMax = this.yMax;

	return newRect;
};

BoundingRect.prototype.CopyAndMoveTo = function(posX,posY,reflectX)
{
	if(typeof(reflectX)==='undefined') reflectX = 1.0;
	var newRect = new BoundingRect();
	if (reflectX == -1)
	{
		newRect.xMin = this.xMax*-1 + posX;
		newRect.xMax = this.xMin*-1 + posX;
		newRect.yMin = this.yMin + posY;
		newRect.yMax = this.yMax + posY;
	}
	else
	{
		newRect.xMin = this.xMin + posX;
		newRect.xMax = this.xMax + posX;
		newRect.yMin = this.yMin + posY;
		newRect.yMax = this.yMax + posY;

	}
	return newRect;
};

BoundingRect.prototype.RelMove = function(posX,posY)
{
	this.xMin = this.xMin + posX;
	this.xMax = this.xMax + posX;
	this.yMin = this.yMin + posY;
	this.yMax = this.yMax + posY;
};

BoundingRect.prototype.CenterOnPoint = function(posX,posY)
{
	var halfwidth = this.width()/2.0;
	var halfheight = this.height()/2.0;
	this.xMin = posX - halfwidth;
	this.xMax = posX + halfwidth;
	this.yMin = posY - halfheight;
	this.yMax = posY + halfheight;
};

BoundingRect.prototype.Resize = function(width,height)
{
	var centerX = this.centerX();
	var centerY = this.centerY();
	this.xMin = centerX - width / 2.0;
	this.xMax = centerX + width / 2.0;
	this.yMin = centerY - height / 2.0;
	this.yMax = centerY + height / 2.0;
};

BoundingRect.prototype.ContainsRect = function(rect)
{
	// Diagnosis by exclusion
	if (rect.xMax < this.xMin || rect.xMin > this.xMax || rect.yMax < this.yMin || rect.yMin > this.yMax)
	{
		return false;
	}
	return true;
};

function LineSegment(x1, y1, x2, y2, playerOnly)
{
	if(typeof(playerOnly)==='undefined')
			playerOnly = false;
	this.x1 = x1;
	this.x2 = x2;
	this.y1 = y1;
	this.y2 = y2;
	
	this.playerOnly = playerOnly;
};

LineSegment.prototype.GetLineBoundingRect = function() 
{
  var lineBounds = new BoundingRect();
  lineBounds.fitToPoint({x:this.x1,y:this.y1});
  lineBounds.expandToFit({x:this.x2,y:this.y2});
  return lineBounds;
}

LineSegment.prototype.EjectBoundingRect = function(rect) 
{
	var popUpDownOverlap = 0.1;
	
  // Perform some really cheap checks before going crazy.
  var bounds = this.GetLineBoundingRect()
  
  // Is there any overlap at all?
  if (!rect.ContainsRect(bounds))
  	return {x:0,y:0};

  // Ok now go crazy :0
  var lengthSq = distanceSquared(this.x1,this.y1,this.x2,this.y2);
  var lineAngle = 0;
  var ejectDist = 0;

  /*
  var t = ((rect.centerX() - this.x1) * (this.x2 - this.x1) + (rect.centerY() - this.y1) * (this.y2 - this.y1)) / lengthSq;
  if (t < 0 || t > 1)
  {
  	return {x:0,y:0};
  }
  */
  
  var s = ( this.x2 - this.x1 ) * ( rect.centerY() - this.y1 ) - (this.y2- this.y1 ) * ( rect.centerX() - this.x1 ); 
  
  if (s > 0)
	lineAngle = Math.atan2(this.x2-this.x1, -(this.y2-this.y1));
  else
	lineAngle = Math.atan2(-(this.x2-this.x1), (this.y2-this.y1));
	
	// Find the corner of the box with an s-value with a sign that is opposite 
	// the center's s-value and has the greatest eject distance. This is the corner
	// that has penetrated most deeply.
	var tlS = ( this.x2 - this.x1 ) * ( rect.yMin - this.y1 ) - (this.y2- this.y1 ) * ( rect.xMin - this.x1 ); 
	var blS = ( this.x2 - this.x1 ) * ( rect.yMax - this.y1 ) - (this.y2- this.y1 ) * ( rect.xMin - this.x1 ); 
	var trS = ( this.x2 - this.x1 ) * ( rect.yMin - this.y1 ) - (this.y2- this.y1 ) * ( rect.xMax - this.x1 ); 
	var brS = ( this.x2 - this.x1 ) * ( rect.yMax - this.y1 ) - (this.y2- this.y1 ) * ( rect.xMax - this.x1 ); 
	
	var tlD = 0;
	var blD = 0;
	var trD = 0;
	var brD = 0;
	var tlT = 0;
	var blT = 0;
	var trT = 0;
	var brT = 0;


	if (sign(s) != sign(tlS))
	{
		tlT = ((rect.xMin - this.x1) * (this.x2 - this.x1) + (rect.yMin - this.y1) * (this.y2 - this.y1)) / lengthSq;
		if (!(tlT < 0 || tlT > 1))
		tlD = distance(rect.xMin, rect.yMin, this.x1 + tlT * (this.x2 - this.x1), this.y1 + tlT * (this.y2 - this.y1));
	}
	
	if (sign(s) != sign(blS))
	{
		blT = ((rect.xMin - this.x1) * (this.x2 - this.x1) + (rect.yMax - this.y1) * (this.y2 - this.y1)) / lengthSq;
		if (!(blT < 0 || blT > 1))
		blD = distance(rect.xMin, rect.yMax, this.x1 + blT * (this.x2 - this.x1), this.y1 + blT * (this.y2 - this.y1));
	}
	
	if (sign(s) != sign(trS))
	{
		trT = ((rect.xMax - this.x1) * (this.x2 - this.x1) + (rect.yMin - this.y1) * (this.y2 - this.y1)) / lengthSq;
		if (!(trT < 0 || trT > 1))
		trD = distance(rect.xMax, rect.yMin, this.x1 + trT * (this.x2 - this.x1), this.y1 + trT * (this.y2 - this.y1));
	}
	
	if (sign(s) != sign(brS))
	{
		brT = ((rect.xMax - this.x1) * (this.x2 - this.x1) + (rect.yMax - this.y1) * (this.y2 - this.y1)) / lengthSq;
		if (!(brT < 0 || brT > 1))
		brD = distance(rect.xMax, rect.yMax, this.x1 + brT * (this.x2 - this.x1), this.y1 + brT * (this.y2 - this.y1));
	}
	
	// If there is any clipping at all, try a simpler up/down bump
	// to reduce player frustration.
	if (trD > 0 || brD > 0 || tlD > 0 || blD > 0)
	{
		if ((rect.yMax - bounds.yMin) < popUpDownOverlap)
		{
			return {	x: 0,
  		  				y: -(rect.yMax - bounds.yMin)};
		}
	}
	
	if (tlD >= blD && tlD >= trD && tlD >= brD)
	{
		  return {	x: tlD*Math.cos(lineAngle),
  		  			y: tlD*Math.sin(lineAngle)};
	}
	else if (blD >= tlD && blD >= trD && blD >= brD)
	{
		  return {	x: blD*Math.cos(lineAngle),
  		  			y: blD*Math.sin(lineAngle)};
	}
	else if (trD >= tlD && trD >= brD && trD >= blD)
	{
		  return {	x: trD*Math.cos(lineAngle),
  		  			y: trD*Math.sin(lineAngle)};
	}
	else if (brD >= tlD && brD >= trD && brD >= blD)
	{
		  return {	x: brD*Math.cos(lineAngle),
  		  			y: brD*Math.sin(lineAngle)};
	}
	
	
  	  //ejectDist = distance(posX, posY, this.x1 + t * (this.x2 - this.x1), this.y1 + t * (this.y2 - this.y1));
	  
  return {x: ejectDist*Math.cos(lineAngle),
  		  y: ejectDist*Math.sin(lineAngle)};
};

LineSegment.prototype.Draw = function()
{
	  ctx.strokeStyle = "#FF5500";
	  ctx.lineWidth = 8.0 / camera.scale;
      ctx.beginPath();
      ctx.moveTo(this.x1, this.y1);
      ctx.lineTo(this.x2, this.y2);
      ctx.stroke();
};

LineSegment.prototype.EjectCircle = function(posX,posY,radius) 
{
  var linesOnly = false;
  
  // Perform some really cheap checks before going crazy.
  var bounds = this.GetLineBoundingRect()
  // Is there any overlap at all?
  if (!bounds.CircleIntersect(posX,posY,radius))
  	return {x:0,y:0};

  var lengthSq = distanceSquared(this.x1,this.y1,this.x2,this.y2);
  var ejectAngle = 0;
  var lineAngle = 0;
  var ejectDist = 0;
  var dist = 10000;
  
  // If the segment is really just a point, do point to point
  if (!linesOnly && lengthSq == 0)
  {
  	ejectAngle = Math.atan2(this.y1-posY,this.x1-posX);
  	lineAngle = ejectAngle;
  	dist = distance(this.x1,this.y1,posX,posY);
  	ejectDist = radius - dist;
  	if (ejectDist < 0)
  		ejectDist = 0;
  	return {x:ejectDist*Math.cos(ejectAngle), y:ejectDist*Math.sin(ejectAngle)};
  	//return {dist: dist, ejectDist:ejectDist, ejectAngle:ejectAngle, lineAngle:lineAngle};
  }
  
  var t = ((posX - this.x1) * (this.x2 - this.x1) + (posY - this.y1) * (this.y2 - this.y1)) / lengthSq;
  var s = ( this.x2 - this.x1 ) * ( posY - this.y1 ) - (this.y2- this.y1 ) * ( posX - this.x1 ); 
  if (s > 0)
	lineAngle = Math.atan2(this.x2-this.x1, -(this.y2-this.y1));
  else
	lineAngle = Math.atan2(-(this.x2-this.x1), (this.y2-this.y1));
  
  // If the circle is closer to the starting point than any other...
  if (!linesOnly && t < 0) 
  {
    ejectAngle = Math.atan2(posY - this.y1,posX - this.x1);
  	dist = distance(this.x1,this.y1,posX,posY);
  	ejectDist = radius - dist;
  }
  
  // If the circle is closer to the ending point than any other...
  else if (!linesOnly && t > 1) 
  {
    ejectAngle = Math.atan2(posY-this.y2,posX-this.x2);
  	dist = distance(this.x2,this.y2,posX,posY);
  	ejectDist = radius - dist;
  }
  else if (t <= 1 && t >= 0)
  {
	  ejectAngle = lineAngle;
  	  dist = distance(posX, posY, this.x1 + t * (this.x2 - this.x1), this.y1 + t * (this.y2 - this.y1));
	  ejectDist = radius - dist;
  }
  
    if (ejectDist < 0)
  		ejectDist = 0;
  		
  // If the circle is somewhere in between, find the length of the normal vector that reaches the circle center
  	return {x:ejectDist*Math.cos(ejectAngle), y:ejectDist*Math.sin(ejectAngle)};
  	//return {dist: dist, ejectDist:ejectDist, ejectAngle:ejectAngle, lineAngle:lineAngle};
  
};


function LineSegmentHandle(linesegment, startPoint)
{
	this.owner = linesegment;
	this.startPoint = startPoint;
	this.posX = 0;
	this.posY = 0;

	this.OwnerToHandle();
};

LineSegmentHandle.prototype.editorProperties = [];


LineSegmentHandle.prototype.OwnerToHandle = function() 
{
	if (this.startPoint)
	{
		this.posX = this.owner.x1;
		this.posY = this.owner.y1;
	}
	else
	{
		this.posX = this.owner.x2;
		this.posY = this.owner.y2;
	}
}

LineSegmentHandle.prototype.HandleToOwner = function() 
{
  	if (this.startPoint)
	{
		this.owner.x1 = this.posX;
		this.owner.y1 = this.posY;
	}
	else
	{
		this.owner.x2 = this.posX;
		this.owner.y2 = this.posY;
	}
}

LineSegmentHandle.prototype.getBoundingRect = function() 
{
  	var rect = new BoundingRect();
  	  
	rect.xMin = -15.0 / camera.scale + this.posX;
	rect.xMax = 15.0 / camera.scale + this.posX;
	rect.yMin = -15.0 / camera.scale + this.posY;
	rect.yMax = 15.0 / camera.scale + this.posY;
  	
  	return rect;
}

LineSegmentHandle.prototype.DrawEditControl = function() 
{
  	  ctx.beginPath();
      ctx.arc(this.posX, this.posY, 15.0 / camera.scale, 0, 2 * Math.PI, false);
      ctx.stroke();
}

function BoundingRectHandle(boundingRect, corner)
{
	this.owner = boundingRect;
	this.corner = corner;		// 0 = tl, 1 = tr, 2 = bl, 3 = br
	this.posX = 0;
	this.posY = 0;

	this.OwnerToHandle();
};

BoundingRectHandle.prototype.editorProperties = [];


BoundingRectHandle.prototype.OwnerToHandle = function() 
{
	if (this.corner == 0)
	{
		this.posX = this.owner.xMin;	// Left
		this.posY = this.owner.yMin;	// Top
	}
	else if (this.corner == 1)	
	{
		this.posX = this.owner.xMax;	// Right
		this.posY = this.owner.yMin;	// Top
	}
	else if (this.corner == 2)
	{
		this.posX = this.owner.xMin;	// Left
		this.posY = this.owner.yMax;	// Bottom
	}
	else if (this.corner == 3)	
	{
		this.posX = this.owner.xMax;	// Right
		this.posY = this.owner.yMax;	// Bottom
	}
}

BoundingRectHandle.prototype.HandleToOwner = function() 
{
  	if (this.corner == 0)
	{
		this.owner.SetBounds(this.posX, this.posY, this.owner.xMax, this.owner.yMax);
	}
	else if (this.corner == 1)	
	{
		this.owner.SetBounds(this.owner.xMin, this.posY, this.posX, this.owner.yMax);
	}
	else if (this.corner == 2)
	{
		this.owner.SetBounds(this.posX, this.owner.yMin, this.owner.xMax, this.posY);
	}
	else if (this.corner == 3)	
	{
		this.owner.SetBounds(this.owner.xMin, this.owner.yMin, this.posX, this.posY);
	}
}

BoundingRectHandle.prototype.getBoundingRect = function() 
{
  	var rect = new BoundingRect();
  	  
	rect.xMin = -15.0 / camera.scale + this.posX;
	rect.xMax = 15.0 / camera.scale + this.posX;
	rect.yMin = -15.0 / camera.scale + this.posY;
	rect.yMax = 15.0 / camera.scale + this.posY;
  	
  	return rect;
}

BoundingRectHandle.prototype.DrawEditControl = function() 
{
  	  ctx.beginPath();
      ctx.arc(this.posX, this.posY, 15.0 / camera.scale, 0, 2 * Math.PI, false);
      ctx.stroke();
}