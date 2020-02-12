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

function SupersampledTextRenderer()
{
	this.canvas = document.createElement("canvas");
	this.canvas.width = 1920;
	this.canvas.height = 1080;
	this.context = this.canvas.getContext("2d");
	this.context.imageSmoothingEnabled = false;
	this.context.webkitImageSmoothingEnabled = false;
	this.context.mozImageSmoothingEnabled = false;
	this.context.setTransform(1, 0, 0, 1, 0.0, 0.0);
	
	this.alpha = 1.0;
	this.font = "alagard";
	this.fontSize = 20;
	this.textAlign = "center";
	this.fillStyle = "#FFF";
	this.textBaseline = 'alphabetic';
	
	this.isClear = true;
};

SupersampledTextRenderer.prototype.DrawText = function(text, x, y, fontSize, fillStyle, alpha, textAlign, textBaseline)
{
	this.isClear = false;
	
	if (typeof fontSize !== 'undefined')
		this.fontSize = fontSize;
	if (typeof fillStyle !== 'undefined')
		this.fillStyle = fillStyle;
	if (typeof alpha !== 'undefined')
		this.alpha = alpha;
	if (typeof textAlign !== 'undefined')
		this.textAlign = textAlign;
	if (typeof textBaseline !== 'undefined')
		this.textBaseline = textBaseline;
	
	this.context.globalAlpha = this.alpha;
	this.context.textAlign = this.textAlign;
	this.context.font = (this.fontSize*3) + "px " + this.font;
	this.context.fillStyle = this.fillStyle;
	this.context.textBaseline = this.textBaseline;
	this.context.fillText(text,x*3,y*3);
};

SupersampledTextRenderer.prototype.DrawTextWithShadow = function(text, x, y, color)
{	
	if (typeof color === "undefined" )
		color = "#FFF";
		
	var shadowColor = "#000";
	if (color === "#000" || color === "#000000")
	{
		shadowColor = "#FFF";
	}
	
	this.DrawText(text,x-2,y+2,this.fontSize, shadowColor);
	this.DrawText(text,x,y,this.fontSize, color);
};

SupersampledTextRenderer.prototype.MeasureText = function(measureString)
{
	this.context.font = (this.fontSize) + "px " + this.font;
	return this.context.measureText(measureString);
};

SupersampledTextRenderer.prototype.DrawTextWithOutline = function(text, x, y, color)
{
	if (typeof color === "undefined" )
		color = "#FFF";
		
	var shadowColor = "#000";
	if (color === "#000" || color === "#000000")
	{
		shadowColor = "#FFF";
	}
	
	this.DrawText(text,x-2,y-2,this.fontSize, shadowColor);
	this.DrawText(text,x+2,y-2);
	this.DrawText(text,x+2,y+2);
	this.DrawText(text,x-2,y+2);
	this.DrawText(text,x,y-2);
	this.DrawText(text,x,y+2);
	this.DrawText(text,x-2,y);
	this.DrawText(text,x+2,y);
	
	this.DrawText(text,x,y,this.fontSize, color);
};

SupersampledTextRenderer.prototype.Blit = function()
{
	if (!this.isClear)
	{
		// Draw the contents of the internal canvas to the game's render context
		displayCtx.drawImage(this.canvas, 0, 0, displayC.width, displayC.height);
	}
};

SupersampledTextRenderer.prototype.Clear = function()
{
	if (!this.isClear)
	{
		this.context.clearRect(0, 0, 1920, 1080);
		this.isClear = true;
	}
};

SupersampledTextRenderer.prototype.BlitAndClear = function()
{
	this.Blit();
	this.Clear();
};

var sstext = new SupersampledTextRenderer();