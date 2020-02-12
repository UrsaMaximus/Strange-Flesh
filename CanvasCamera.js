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

// The canvas camera function is intended to simplify some canvas matrix math operations
// and provide an easy-to-use way to track objects and apply translation, rotation, and
// scale on top of that.
//
// Additionally the canvas camera object can map individual points, such as mouse 
// locations from canvas space to camera space, which helps a lot pretty much all the time

function EarthQuakeNoise(amplitude,scale)
{
	this.MAX_VERTICES = 256;
	this.MAX_VERTICES_MASK = this.MAX_VERTICES -1;
	this.amplitude = amplitude;
	this.scale = scale;

	this.r = [];

	for ( var i = 0; i < this.MAX_VERTICES; ++i ) 
	{
		this.r.push(Math.random());
	}
};

/**
* Linear interpolation function.
* @param a The lower integer value
* @param b The upper integer value
* @param t The value between the two
* @returns {number}
*/
var lerp = function(a, b, t ) 
{
	return a * ( 1 - t ) + b * t;
};

EarthQuakeNoise.prototype.getVal = function( x )
{
		var scaledX = x * this.scale;
		var xFloor = Math.floor(scaledX);
		var t = scaledX - xFloor;
		var tRemapSmoothstep = t * t * ( 3 - 2 * t );

		/// Modulo using &
		var xMin = xFloor & this.MAX_VERTICES_MASK;
		var xMax = ( xMin + 1 ) & this.MAX_VERTICES_MASK;

		var y = lerp( this.r[ xMin ], this.r[ xMax ], tRemapSmoothstep );

		return (y-0.5) * this.amplitude;

};

function CanvasCamera() 
{
	this.objectsToTrack = [];
	this.trackObject = true;
	
	this.targetX = 0;
	this.posX = 0;
	this.targetY = 0;
	this.posY = -1080/2;
	this.targetScale = 1.0;
	this.scale = 1.0;
	
	this.posXFloat = 0;
	this.posYFloat = -1080/2;
	
	this.enableRatchet = false;
	this.xRatchetMin = 0;
	this.xRatchetMax = 0;
	this.yRatchetMin = 0;
	this.yRatchetMax = 0;
	
	this.ratioTo1080p = 1.0;
	this.rotation = 0;
	
	this.earthquakeEffect = false;
	this.earthquakeTimer = 0;		
	this.earthquakeX = new EarthQuakeNoise(3,0.2);
	this.earthquakeY = new EarthQuakeNoise(3,0.2);
	this.effectOffsetX = 0;
	this.effectOffsetY = 0;
	
	this.clipEnabled = false;
	
	this.matrix = new MatrixTransformation2D();
	this.canvasResized();
	
	this.boundingRect = this.getBoundingRect();
	
	
};

CanvasCamera.prototype.canvasResized = function()
{
	this.matrix.centerOfRotationX = c.width/2;
	this.matrix.centerOfRotationY = c.height/2;
	this.ratioTo1080p =  c.height / 1080.0;
};

CanvasCamera.prototype.reset = function()
{
	this.targetX = 0;
	this.posX = 0;
	this.targetY = 0;
	this.posY = -1080/2;
	
	this.posXFloat = 0;
	this.posYFloat = -1080/2;
	this.targetScale = 1.0;
	this.scale = 1.0;
	this.earthquakeEffect = false;
};

CanvasCamera.prototype.getBoundingRect = function()
{
	var bRect = new BoundingRect();
	bRect.fitToPoint(this.matrix.mapPointFromWorldToLocal({x:0,y:0}));
	bRect.expandToFit(this.matrix.mapPointFromWorldToLocal({x:0,y:c.height}));
	bRect.expandToFit(this.matrix.mapPointFromWorldToLocal({x:c.width,y:c.height}));
	bRect.expandToFit(this.matrix.mapPointFromWorldToLocal({x:c.width,y:0}));
	return bRect;
}

// Return -1 if offscreen to the left, 1 is offscreen to the right, and 0 if onscreen.
CanvasCamera.prototype.walkingEntityOffscreenSide = function(entity)
{	
	// Get the entity bounding rect...
	var bRect = entity.hitRect.CopyAndMoveTo(entity.posX,entity.posY);
	bRect.yMin -= (bRect.height()/2.0 + entity.zHeight);
	bRect.expandToMinSize(bRect.width() + 200, bRect.height() + 100);
	if (this.boundingRect.ContainsRect(bRect))
		return 0;
	else if (entity.posX < camera.posX)
		return -1;
	else
		return 1;
}

// Return -1 if offscreen to the left, 1 is offscreen to the right, and 0 if onscreen.
CanvasCamera.prototype.walkingEntityOnscreenSide = function(entity)
{
	if (this.boundingRect.PointIntersect(entity.posX, entity.posY))
		return 0;
	else if (entity.posX < camera.posX)
		return -1;
	else
		return 1;
}

CanvasCamera.prototype.addObjectToTrack = function(obj)
{	
	var listIndex = this.objectsToTrack.indexOf(obj);
	if (listIndex === -1)
	{
		this.objectsToTrack.push(obj);
	}
};

CanvasCamera.prototype.removeObjectToTrack = function(obj)
{
	if (this.objectsToTrack.length > 0)
	{
		var listIndex = this.objectsToTrack.indexOf(obj);
		if (listIndex !== -1)
		{
			this.objectsToTrack.splice(listIndex,1);
		}
	}
};

CanvasCamera.prototype.clearTracking = function()
{
	while (this.objectsToTrack.length > 0)
	{
		this.objectsToTrack.pop();
	}
};

CanvasCamera.prototype.setPosition = function(posX, posY)
{
	this.posX = posX;
	this.posY = posY;
	this.posXFloat = posX;
	this.posYFloat = posY;
	this.matrix.copyPosition(this);
	this.boundingRect = this.getBoundingRect();
}

CanvasCamera.prototype.updatePosition = function()
{
	if (this.trackObject && this.objectsToTrack.length > 0)
	{
		// Calculate the center of mass of all tracked objects
		var comX = 0;
		var comY = 0;
		for (var i = 0; i < this.objectsToTrack.length; i++)
		{
			comX += this.objectsToTrack[i].posX + this.objectsToTrack[i].trackingOffsetX;
			comY += this.objectsToTrack[i].posY + this.objectsToTrack[i].trackingOffsetY;
		}
		comX = comX / this.objectsToTrack.length;
		comY = comY / this.objectsToTrack.length;
		
		// The first object in the collection is highest priority. It must ALWAYS
		// stay onscreen
		var cameraTrackingObject = this.objectsToTrack[0];
		var trackX = cameraTrackingObject.posX + cameraTrackingObject.trackingOffsetX;
		var trackY = cameraTrackingObject.posY + cameraTrackingObject.trackingOffsetY;

		// Now, calculate the adjustment from center of mass to the first tracked object position
		// Clamp the adjustment so the first object can't go offscreen
		var adjustX = clamp(comX - trackX, -600, 600);
		var adjustY = clamp(comY - trackY, -200, 200);
		
		// Add the adjustment
		trackX += adjustX;
		trackY += adjustY;
		
		this.objectsToTrack.length = 0;
		
		// Calculate the move the camera will actually make this frame
		var mag = distance(trackX,trackY,this.posXFloat, this.posYFloat) / 12;
		
		var ang = Math.atan2(trackY - this.posYFloat,trackX - this.posXFloat)
		var deltaX = mag*Math.cos(ang);
		var deltaY = mag*Math.sin(ang);
		
		// If clip is enabled, run continuous collision detection to resolve the move
		if (this.clipEnabled && !playernoclip)
		{
			var moveStepSize = 20;
			var steps = Math.floor(speed2(deltaX,deltaY)/moveStepSize)+1;
	
			var dx = deltaX / steps;
			var dy = deltaY / steps;
	
			for (var step=0; step < steps; step++)
			{
				//this.posX += dx;
				//this.posY += dy;
	
				// Eject the camera from the camera guides
				var ejectionVector = level.cameraMask.Collide(this.posXFloat + dx, this.posYFloat + dy, this.boundingRect.height() / 2.0)
				
				var ex = dx + ejectionVector.x;
				var ey = dy + ejectionVector.y;
				
				// Allow the camera to move along X if...
				if (!this.enableRatchet ||	// Ratcheting is off or
					(this.posXFloat < this.xRatchetMin && ex > 0) ||	// The camera is below its ratchet min and movement is in the positive X direction or
					(this.posXFloat > this.xRatchetMax && ex < 0) || 	// The camera is above its ratchet max and movement is in the negative X direction or 
					(this.posXFloat + ex > this.xRatchetMin && this.posXFloat + ex < this.xRatchetMax) )	// The resultant movement will remain in bounds
					
				{
					this.posXFloat += ex;
				}
				
				// Allow the camera to move along Y if...
				if (!this.enableRatchet ||	// Ratcheting is off or
					(this.posYFloat < this.yRatchetMin && ey > 0) ||	// The camera is below its ratchet min and movement is in the positive Y direction or
					(this.posYFloat > this.yRatchetMax && ey < 0) || 	// The camera is above its ratchet max and movement is in the negative Y direction or 
					(this.posYFloat + ey > this.yRatchetMin && this.posYFloat + ey < this.yRatchetMax) )	// The resultant movement will remain in bounds
					
				{
					this.posYFloat += ey;
				}
				
			}
		}
		// If clipping is disabled, just go there
		else
		{
			this.posXFloat += deltaX;
			this.posYFloat += deltaY;
		}
		
		this.scale += (this.targetScale - this.scale) / (10); //(75)
	}
	
	if (this.earthquakeEffect)
	{
		this.earthquakeTimer += 1;
		
		this.earthquakeX.amplitude = linearToSquareRemap(this.earthquakeTimer, 0, 120, 3, 40);
		this.earthquakeY.amplitude = linearToSquareRemap(this.earthquakeTimer, 0, 120, 3, 40);
		
		this.effectOffsetX = this.earthquakeX.getVal(this.earthquakeTimer);
		this.effectOffsetY = this.earthquakeY.getVal(this.earthquakeTimer);
	}
	else
	{
		this.effectOffsetX = 0;
		this.effectOffsetY = 0;
	}
	
	this.posX = Math.round(this.posXFloat/3)*3;
	this.posY = Math.round(this.posYFloat/3)*3;
	
	this.matrix.copyPosition(this);
	
	this.boundingRect = this.getBoundingRect();
};

CanvasCamera.prototype.Update = function()
{
	this.updatePosition();
};

function CameraSpawnLocation() 
{
	this.posX = 0;
	this.posY = 0;
	this.displayName = "Camera Start Location";
};

CameraSpawnLocation.prototype.editorProperties = ['posX','posY'];

CameraSpawnLocation.prototype.Update = function()
{
};

CameraSpawnLocation.prototype.Draw = function()
{
	if (isEditor)
		drawCircle(this.posX,this.posY, camera.boundingRect.height() / 2.0);
};