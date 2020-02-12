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

function GlobalLight(owner)
{	
	// State
	this.enabled = true;
	
	this.targetLight = 0;
	this.lightColor = "#C8BDCA";
	this.alpha = 0.0;
	
	this.fadeAlphaStart = 0;
	this.fadeTime = -1;
	this.fadeTimer = -1;
	
	this.dead = false;
};

GlobalLight.prototype.Draw = function()
{
	
		// Basically draw over everything
		// Store the current transformation matrix
		ctx.save();
	
		var ratioTo1080p =  c.height / 1080.0;
		
		// Arrange drawing so that we are in a frame that is 1920x1080 with the origin
		// on the upper right
		ctx.setTransform(ratioTo1080p, 0, 0, ratioTo1080p, 0, 0);
		
    	//ctx.globalCompositeOperation = "overlay";
    	ctx.globalAlpha=this.alpha;
		ctx.fillStyle = this.lightColor;
		ctx.fillRect(0,0,1920,1080);
    	ctx.globalAlpha=1.0;
    	//ctx.globalCompositeOperation = "source-over";

    	ctx.restore();
};


GlobalLight.prototype.Die = function()
{
	this.dead = true;
};

GlobalLight.prototype.FadeOutAndDie = function(frames)
{
	this.fadeTime = frames;
	this.fadeAlphaStart = this.alpha;
	this.fadeTimer = 0;
};

GlobalLight.prototype.Update = function()
{
	if (this.fadeTime != -1)
	{
		this.alpha = linearToSquareRemap(this.fadeTimer, 0, this.fadeTime, this.fadeAlphaStart, 0);	
		this.fadeTimer += 1;
		
		if (this.alpha === 0)
		{
			this.Die();
		}
	}
		
		
	if (this.dead)
	{
		var index = overlays.indexOf(this);
		if (index > -1) 
		{
    		overlays.splice(index, 1);
    	}
	}
};