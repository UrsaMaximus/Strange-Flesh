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

// All the images associated with the Menu.
GlobalResourceLoader.AddImageResource("greatestbearlogo","images/menus/greatest-bear-studios-3.png");

function TitleCardMenu(onCloseCallback)
{
	if(typeof(onCloseCallback)==='undefined') onCloseCallback = null;
	this.onCloseCallback = onCloseCallback;
	
	// Get image references from the loader
	this.card = GlobalResourceLoader.GetSprite("greatestbearlogo");
	this.fadeInFrames = 90;
	this.holdFrames = 240;
	this.fadeOutFrames = 90;
	this.waitBeforeCloseFrames = 30;
	this.anyKeyCloses = true;
	this.alpha = 0;
	
	this.timer = 0;
	this.close = false;
};

TitleCardMenu.prototype.Show = function()
{
	this.timer = 0;
	this.close = false;
	menuStack.push(this);
}

TitleCardMenu.prototype.Draw = function()
{
		// Basically draw over everything
		// Store the current transformation matrix
		ctx.save();
	
		var ratioTo360p =  c.height / 360.0;
		
		// Arrange drawing so that we are in a frame that is 1920x1080 with the origin
		// on the upper right
		ctx.setTransform(ratioTo360p, 0, 0, ratioTo360p, 0, 0);
		ctx.globalAlpha = 1.0;
		ctx.fillStyle = "#000000";
		ctx.fillRect(0,0,640,360);
    	ctx.globalAlpha = this.alpha;
    	this.card.Draw( 0, 0, 640, 360);
		ctx.globalAlpha = 1.0;
    	ctx.restore();
};

TitleCardMenu.prototype.Update = function()
{
	this.timer += 1;
	
	if (this.timer < this.fadeInFrames)
		this.alpha = normalizeValue(this.timer,0,this.fadeInFrames);
	else if (this.timer >= this.fadeInFrames && this.timer < this.fadeInFrames+this.holdFrames)
		this.alpha = 1.0;
	else
		this.alpha = 1-normalizeValue(this.timer,this.fadeInFrames+this.holdFrames,this.fadeInFrames+this.holdFrames+this.fadeOutFrames);
	
	if (this.anyKeyCloses)
	{
		if (controller.anyActivate())
		{
			if (this.timer > this.fadeInFrames && this.timer < this.fadeInFrames+this.holdFrames)
				this.timer = this.fadeInFrames+this.holdFrames;
			else if (this.timer < this.fadeInFrames)
				this.timer = (1-(this.timer / this.fadeInFrames))*this.fadeOutFrames + this.fadeInFrames+this.holdFrames;
		}
	}
	
	if (this.timer > this.fadeInFrames+this.holdFrames+this.fadeOutFrames+this.waitBeforeCloseFrames)
		this.close = true;
	
	if (this.close)
	{
		if (this.onCloseCallback === null)
			menuStack.splice(menuStack.length-1,1);
		else
			this.onCloseCallback();
	}
};