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

function EnemyInfo(owner)
{	
	// State
	this.enabled = true;
	
	this.enemy = null;
	this.health = 205;
	this.updateRate = (1/120)*205;
	this.framesSinceUpdate = 0;
	this.framesSinceDeath = 0;
	this.fadeOutTime = 40;
	
	this.cooldown = 500;
	
	this.fontSize = 60;
};

EnemyInfo.prototype.Draw = function()
{
if (this.enabled)
{
		// Basically draw over everything
		// Store the current transformation matrix
		ctx.save();
	
		var ratioTo1080p =  c.height / 1080.0;
		
		// Arrange drawing so that we are in a frame that is 1920x1080 with the origin
		// on the upper right
		ctx.setTransform(ratioTo1080p, 0, 0, ratioTo1080p, 0, 0);
		
    	// Draw the background of the EnemyInfo
    	if (this.enemy !== null && this.framesSinceDeath < 20 && this.framesSinceUpdate < this.cooldown)
    	{
    		var rightEdge = 1800;
    		var topEdge = 150;
    		var margin = 10;
    		sstext.fontSize = this.fontSize/3;
    		sstext.textAlign = "center";
    		sstext.textBaseline = "alphabetic";
    		sstext.fillStyle = "#FFF";
    		var width = 600;
    		var height = this.fontSize;
    		
    		var alpha = 1.0;
    		var flashAlpha = 0.0;
    		if (this.framesSinceDeath === 0 && this.framesSinceUpdate > this.cooldown - this.fadeOutTime)
    		{	
    			alpha = normalizeValue(this.cooldown - this.framesSinceUpdate, 0, this.fadeOutTime)
    		}
    		else if (this.framesSinceDeath > 0)
    		{	
    			alpha = 1-normalizeValue(this.framesSinceDeath, 0, 20);
    			flashAlpha = 1-normalizeValue(this.framesSinceDeath, 0, 10);
    			topEdge -= this.framesSinceDeath * 5;
    			height += this.framesSinceDeath * 2;
    		}
    		
    		ctx.fillStyle = "#000000";
    		ctx.globalAlpha = 0.4 * alpha;
    		ctx.fillRect(rightEdge-width-margin, topEdge - margin, width+margin+margin,height+margin);
    		
    		ctx.fillStyle = "#FFF";
    		ctx.globalAlpha = flashAlpha;
    		ctx.fillRect(rightEdge-width-margin, topEdge - margin, width+margin+margin,height+margin);
    		
    		// Fill in a background bar
    		if (this.health > 205)
    		{
    			ctx.fillStyle = mixColor(normalizeValue(Math.floor(this.health / 205)-1,0,5), "#FF0169", "#005fb7");
				ctx.globalAlpha = 1.0 * alpha;
				ctx.fillRect(rightEdge-width-margin, topEdge - margin, width+margin+margin,height+margin);
    		}
    		
    		ctx.globalAlpha = 1.0 * alpha;
    		
    		
    		if (this.enemy.corrupted || this.enemy.recruited)
    			ctx.fillStyle = "#b3169f";//"#E362FE";
    		else
    			ctx.fillStyle = mixColor(normalizeValue(Math.floor(this.health / 205),0,5), "#FF0169", "#005fb7");
    		
    		ctx.fillRect(rightEdge-width-margin, topEdge - margin, (width+margin+margin) * normalizeValue(this.health % 205,0,205) ,height+margin);
    		
    		sstext.alpha =  1.0 * alpha;
			sstext.DrawText(this.enemy.displayName,Math.floor((rightEdge - width / 2)/3),Math.floor((topEdge+height-15)/3));
			
			ctx.globalAlpha = 1.0;
		}
		
		

    	ctx.restore();
	}
};

EnemyInfo.prototype.Update = function()
{
	if (this.enabled)
	{
		this.framesSinceUpdate += 1;
		if (this.enemy !== null)
    	{
			this.health = crawlValue(this.health, this.enemy.health, this.updateRate);
		
			if (IsDeadOrDying(this.enemy.state) || IsCorruptDying(this.enemy.state))
			{
				this.framesSinceDeath += 1;
			}
			else
			{
				this.framesSinceDeath = 0;
			}
		
		}
	}
};

EnemyInfo.prototype.Clear = function()
{
	this.enemy = null;
};


EnemyInfo.prototype.NotifyHit = function(enemyEntity)
{
	if (enemyEntity !== player)
	{
		if (this.enemy !== null && this.enemy.state !== States.Dead && this.framesSinceUpdate < 60)
    	{
    		// Don't register hits to environmentals if there is an active enemy's hit bar to show instead
    		if (enemyEntity.alliance === 0 && this.enemy.alliance !== 0)
    		{
    			return;
    		}
    	}
    	
		this.framesSinceUpdate = 0;
		
		if (this.enemy !== enemyEntity)
		{
			this.enemy = enemyEntity;
			this.health = enemyEntity.health;
		}
	}
};