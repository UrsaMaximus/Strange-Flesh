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

GlobalResourceLoader.AddImageResource("keyicon","images/menus/keyicon.png");
GlobalResourceLoader.AddImageResource("keyicon_wide","images/menus/keyicon_wide.png");

function ModalMessage(message)
{
	this.message = message;
	this.close = false;
	this.onClose = null;
	
	this.autoDismiss = false;
	this.dismissTimer = 120;
	this.pulse = 0;
	
	this.keyicon = GlobalResourceLoader.GetSprite("keyicon");
	this.keyicon_wide = GlobalResourceLoader.GetSprite("keyicon_wide");
};

ModalMessage.prototype.Show = function()
{
	controller.update();
	this.close = false;
	menuStack.push(this);
}

ModalMessage.prototype.Draw = function()
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
		
		sstext.fillStyle = "#FFF";
		sstext.textAlign = "center";
		sstext.fontSize = 20;
		sstext.DrawText(this.message,640/2,360/2);
		
		// Draw the keyicon that advances the cutscene.
		if (!this.autoDismiss)
		{
			sstext.alpha=0.75+0.25*Math.cos(this.pulse);
			ctx.globalAlpha=0.75+0.25*Math.cos(this.pulse);
			// Draw the keycap
			this.keyicon.DrawSprite(600,320,false);

			sstext.textBaseline = 'middle';
			sstext.textAlign = "center";
			sstext.fontSize = 16;
			sstext.DrawTextWithShadow(getStringFromKeyCode(settings.punchKeyCode), 617, 337);
			sstext.alpha=1.0;
			ctx.globalAlpha = 1.0;
		}
	
		// This forces a copy to display buffer operation, which allows subsequent draw calls to paint over supersampled text
		//blitInternalBuffer();
    	
    	ctx.restore();
};

ModalMessage.prototype.Update = function()
{
	this.pulse = normalizeAngle(this.pulse + 0.05);
	
	if (controller.anyActivate())
		this.close = true;
		
	if (this.dismissTimer > 0)
	{
		this.dismissTimer -= 1;
	}
	else if (this.autoDismiss)
	{
		this.close = true;
	}
		
	if (this.close)
	{
		menuStack.splice(menuStack.length-1,1);
		if (this.onClose !== null)
		{
			this.onClose();
		}
	}
};