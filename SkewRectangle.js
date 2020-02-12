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

function SkewRectangle(width,height,color)
{
	if(typeof(width)==='undefined') width = 250;
	if(typeof(height)==='undefined') height = 250;
	if(typeof(color)==='undefined') color = '#f4d7bd';
	
	// Editor properties are always reinited when changed
	this.editorProperties = ['width','height','color'];

	this.width = width;
	this.height = height;
	this.color = color;
	
	// Don't reset these properties on re-init
	this.posX = 0;
	this.posY = 0;
	this.facing = 0;
	
	this.ReInit();
};

SkewRectangle.prototype.ReInit = function()
{
	this.state = States.Unknown;
	
	// Define the image canvas
	this.canvas = document.createElement('canvas');
	this.canvas.width = this.width;
	this.canvas.height = this.height + this.width;
	this.context = this.canvas.getContext('2d');
	this.context.imageSmoothingEnabled = false;
	
	// Draw the skewed rectangle
	this.context.fillStyle = this.color;
	this.context.beginPath();
	this.context.moveTo(0, this.width);
	this.context.lineTo(0,this.height + this.width);
	this.context.lineTo(this.width, this.height);
	this.context.lineTo(this.width, 0);
	this.context.closePath();
	this.context.fill();
};

SkewRectangle.prototype.PinTopLeftCorner = function(x,y)
{
	this.posX = x;
	this.posY = y - this.width*pxScale;
};

SkewRectangle.prototype.PinBottomLeftCorner = function(x,y)
{
	this.posX = x;
	this.posY = y - this.width*pxScale - this.height*pxScale;
};

SkewRectangle.prototype.PinBottomRightCorner = function(x,y)
{
	this.posX = x - this.width*pxScale;
	this.posY = y - this.height*pxScale;
};

SkewRectangle.prototype.PinTopRightCorner = function(x,y)
{
	this.posX = x - this.width*pxScale;
	this.posY = y;
};

SkewRectangle.prototype.Die = function()
{
	this.state = States.Dead;
};

SkewRectangle.prototype.Respawn = function(pos)
{
	this.posX = pos.x;
	this.posY = pos.y;
	this.posZ = pos.z;
	this.state = States.Unknown;
};

SkewRectangle.prototype.Draw = function()
{
	ctx.drawImage(this.canvas,this.posX,this.posY,this.canvas.width*pxScale,this.canvas.height*pxScale);
};

SkewRectangle.prototype.Update = function()
{
};