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

function GameOver()
{
	this.message = "Game Over";
	this.closing = false;
	this.timer = 0;
	
	this.screenshot = null;
	this.image = null;
};

GameOver.prototype.Show = function()
{
	if (level !== null)
	{
		this.image = GlobalResourceLoader.GetSprite(level.gameOverScreen);
	}
	
	this.screenshot = cloneCanvas1080p(c);
	
	menuStack.push(this);
}

GameOver.prototype.Draw = function()
{
		// Basically draw over everything
		// Store the current transformation matrix
		ctx.save();
	
		var ratioTo1080p =  c.height / 1080.0;
		
		// Arrange drawing so that we are in a frame that is 1920x1080 with the origin
		// on the upper right
		ctx.setTransform(ratioTo1080p, 0, 0, ratioTo1080p, 0, 0);
		ctx.fillStyle = "#000000";
		ctx.fillRect(0,0,1920,1080);
		
		if (this.image !== null)
		{
			this.image.DrawSprite3x(0, 0);
		}
		
		ctx.fillStyle = "#FFF";
		ctx.textAlign = "center";
		ctx.font = "120px alagard";
		drawTextWithShadow(this.message,960,1000);
		
		/*
		ctx.globalAlpha = linearRemap(this.timer,0,60,1,0);
		ctx.fillStyle = "#000000";
		ctx.fillRect(0,0,1920,1080);
		*/
		
		ctx.globalAlpha = linearRemap(this.timer,0,60,1,0);
		if (this.closing)
		{
			ctx.fillStyle = "#e30f4b";
			ctx.fillRect(0,0,1920,1080);
		}
		else
		{
			ctx.drawImage(this.screenshot, 0, 0, 1920, 1080);
			
    	}
    	ctx.globalAlpha = 1.0;
    	
    	ctx.restore();
};

GameOver.prototype.Update = function()
{
	if (this.closing && this.timer > 0)
		this.timer -= 1;
	else if (this.timer < 60)
		this.timer += 1;
	
	
	if (controller.anyActivate())
	{
		if (!this.closing && this.timer === 60)
		{
			this.closing = true;
			
			var menu2 = new SettingsMenu();
			menu2.title = "Continue?";
			menu2.items = [	
							{ "element":"spacer", "size":200},
							{ "element":"button", "label":"Yes", "onClick":function()
								{ 
									useContinue();
									menu2.startCloseTime = menu2.timer;
									menu2.endCloseTime = menu2.timer + 60;
									menu2.closing = true;
								} 
							},
							{ "element":"button", "label":"No", "onClick":function()
								{ 
									GlobalMusic.ClearAlternate();
									GlobalMusic.stop(0.25);
									DismissAllMenus();
									resetGame();
								} 
							},
						];
			menu2.Show();
				
		}
	}
	
	if (this.closing && this.timer === 0)
	{
		menuStack.splice(menuStack.length-1,1);
	}
};