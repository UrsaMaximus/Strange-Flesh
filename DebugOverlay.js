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

function DebugOverlay(owner)
{	
	// State
	this.enabled = true;
	this.fontSize = 8;
};

DebugOverlay.prototype.Draw = function()
{
if (this.enabled && debug > 0)
{
		// Basically draw over everything
		// Store the current transformation matrix
		ctx.save();
	
		var ratioTo360p =  c.height / 360.0;
		
		// Arrange drawing so that we are in a frame that is 1920x1080 with the origin
		// on the upper right
		ctx.setTransform(ratioTo360p, 0, 0, ratioTo360p, 0, 0);
		
		var line = 0;
		

		if (player !== null && debug === 2)
		{
			this.WriteTextLine("FPS: " + measuredFps, line++);
			this.WriteTextLine("Low Perf Frames: " + lowFPSCount, line++);
			this.WriteTextLine("Clipping: " + (!playernoclip), line++);
			this.WriteTextLine("Health: " + player.health + " / " + player.maxHealth, line++);
			this.WriteTextLine("Stamina: " + player.stamina.toFixed(3) + " / 1.000", line++);
			this.WriteTextLine("Sexual Energy: " + player.sexMeter.toFixed(0) + " / " + player.maxSexMeter, line++);
			this.WriteTextLine("Drunkenness: " + player.drunkTimer, line++);
			this.WriteTextLine("Hitstun: " + player.hitStunFrames + " / " + player.maxHitStunFrames, line++);
			this.WriteTextLine("Pos X: " + player.posX.toFixed(3), line++);
			this.WriteTextLine("Pos Y: " + player.posY.toFixed(3), line++);
			this.WriteTextLine("Pos Z: " + player.posZ.toFixed(3), line++);
			this.WriteTextLine("Vel X: " + player.velX.toFixed(3), line++);
			this.WriteTextLine("Vel Y: " + player.velY.toFixed(3), line++);
			this.WriteTextLine("Vel Z: " + player.velZ.toFixed(3), line++);
			this.WriteTextLine("Entity State: " + GetStateName(player.state) + " (" + player.state + ")", line++);
			this.WriteTextLine("State Frames: " + player.stateFrames, line++);
			this.WriteTextLine("Last Entity State: " + GetStateName(player.lastState) + " (" + player.lastState + ")", line++);
			this.WriteTextLine("Animation State: " + player.animationModel.state, line++);
			this.WriteTextLine("Domination Orbs: " + enemiesDispatched + " / " + totalEnemies, line++);
			this.WriteTextLine("Corruption Orbs: " + enemiesCorrupted + " / " + totalEnemies, line++);
			line++;
		}
		
		if (debug === 1)
		{
			this.WriteTextLine("* Debug Mode Enabled *", line++);
		}
		
		// Show what the spawner is going to spawn
    	this.WriteTextLine("I <  " + debugSpawnerList[debugSpawnerSelection] + "  > O", line++);
    	this.WriteTextLine("Press 'P' to Spawn", line++);
		
    	ctx.restore();
	}
};

DebugOverlay.prototype.WriteTextLine = function(str,line)
{
	sstext.fontSize = this.fontSize;
	var margin = 4;
	var width = sstext.MeasureText(str).width;
	var height = this.fontSize;
	var leftEdge = 40;
	var topEdge = 70 + line * (height+margin);
	
	sstext.textAlign = "left";
	sstext.textBaseline = "hanging";
	ctx.fillStyle = "#000000";
	ctx.globalAlpha = 0.4;
	ctx.fillRect(leftEdge-margin, topEdge - margin, width+margin+margin,height+margin);
	ctx.globalAlpha = 1.0;
	sstext.alpha = 1.0;
	sstext.fillStyle = "#FFFFFF";
	sstext.DrawText(str,leftEdge,topEdge);
};

DebugOverlay.prototype.Update = function()
{
	if (this.enabled)
	{
		
	}
};