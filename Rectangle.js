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

function Rectangle(width,height,color)
{
	if(typeof(width)==='undefined') width = 250;
	if(typeof(height)==='undefined') height = 250;
	if(typeof(color)==='undefined') color = '#f4d7bd';
	
	// Editor properties are always reinited when changed
	this.editorProperties = ['width','height','color','alpha'];

	this.width = width;
	this.height = height;
	this.color = color;
	this.alpha = 1.0;
	
	// Don't reset these properties on re-init
	this.posX = 0;
	this.posY = 0;
	this.facing = 0;
};

Rectangle.prototype.Die = function()
{
	this.state = States.Dead;
};

Rectangle.prototype.Respawn = function(pos)
{
	this.posX = pos.x;
	this.posY = pos.y;
	this.posZ = pos.z;
	this.state = States.Unknown;
};

Rectangle.prototype.Draw = function()
{
	if (this.alpha > 0)
	{
		ctx.globalAlpha = this.alpha;
		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.rect(this.posX,this.posY,this.width,this.height);
		ctx.fill();
		ctx.closePath();
		ctx.globalAlpha = 1.0;
	}

};

Rectangle.prototype.Update = function()
{
};