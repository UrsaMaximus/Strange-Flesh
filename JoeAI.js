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

include("AICore.js");

function JoeAI(owner)
{
	AICore.call(this,owner);
	
	this.pacifist = false;
	this.enableGrab = false;
	this.enableLeap = false;
	this.punchDist = 50;
};

JoeAI.prototype.GenerateNewAction = function()
{
	
	var followTarget = null;
	
	
	var distFromPlayer = 99999;
	if (player !== null)
		distFromPlayer = distance(player.posX,player.posY,this.owner.posX,this.owner.posY);
	
	// If marked as watching sex, walk a distance away, then stand and watch
	if (this.owner.watchingSex)
	{

		// Calculate the point to walk to...
		var playerX = player.posX + player.facing * 200;
		var playerY = player.posY;
		// Find a point on the line from player to owner that is at least 300px away...
		var distFromPlayer = distance(playerX,playerY,this.owner.posX,this.owner.posY);
		var angleFromPlayer = angle2d(playerX,playerY,this.owner.posX,this.owner.posY);

		
		if (playerX > this.owner.posX)
			angleFromPlayer = Math.PI;
		else
			angleFromPlayer = 0;
		
		if (distFromPlayer < 300)
		{
			// When creating the follow target, place it in-bounds to prevent freakouts
			followTarget = level.PlaceWithCollision(this.owner.posX, 
														 this.owner.posY, 
														 playerX + 300*Math.cos(angleFromPlayer), 
														 this.owner.posY, //playerY + 300*Math.sin(angleFromPlayer), 
														 this.owner.collisionRadius);
														 
			// Queue the walk to point action...
			this.QueueAction(new GoToPointAction(followTarget.posX, followTarget.posY, 10, true));
		}
			
		// And watch sex until sex is done
		this.QueueAction(new WatchSexAction(player.posX + player.facing * 200));
		return;
	}
	
	// If recruited, look for someone to kiss
	if (this.owner.recruited)
	{
		followTarget = level.entities.FindHornyAlly(this.owner, 2000);
		if (followTarget !== null)
		{
			this.QueueAction(new HornyKissAction(followTarget));
			return;
		}
	}
	
	// If otherwise unoccupied, look for someone to attack
	followTarget = level.FindClosestEnemy(this.owner,2000);
	
	// If a target was found, try an attack
	if (followTarget !== null && !this.pacifist)
	{
		// Try to request permission to attack if the entity supports that
		var side = 0;
		if (followTarget !== null && "RequestAttackPermission" in followTarget)
			side = followTarget.RequestAttackPermission(this.owner);
		
		// If the request was not explicitly rejected, attack!
		if (side !== -2)
		{
			var attackAction;
			var distX = followTarget.posX - this.owner.posX;
			var distY = followTarget.posY - this.owner.posY;
			
			var shouldTryGrab = (this.enableGrab && 						// Grabbing is enabled
								 entitiesOnScreen.length > 1 &&				// There's another enemy around to hit the bartender
								!IsCaptive(followTarget.state) && 		    // The bartender isn't already captive
								this.owner.controller.grabFramesSinceKeyup > 360 );			// It's been 6 seconds since last trying a grab
								
			var shouldTryLeap = (this.enableLeap && 						// Leaping is enabled
								 IsAttackable(followTarget.state) &&        // Target is attackable
								 this.owner.controller.jumpFramesSinceKeyup > 120 && // It's been 2 seconds since last trying a leap
								 ((Math.abs(distX) > 400 && Math.abs(distX) < 900) ||  (Math.abs(distY) < 500 && Math.abs(distY) > 200)));	// Target is in range
			
			/*
			// Make sure we are facing the right direction before attacking							
			if (followTarget.posX < this.owner.posX)
				this.owner.facing = -1;
			else
				this.owner.facing = 1;
			*/
				
			if (shouldTryGrab)
				attackAction = new AttackTargetAction(this.owner, 50, 90, followTarget, side, 2);
			else if (shouldTryLeap)
				attackAction = new LeapAttackAction(followTarget);
			else
				attackAction = new AttackTargetAction(this.owner, this.punchDist, 90, followTarget, side, 0);
			
			this.QueueAction(attackAction);
			return;
		}
	}
	
	// If you have no action to do, maybe cheer if some combat is going on?
	if ((this.owner.polite || this.pacifist) && distFromPlayer < 1900 && activeCombatTimer > 0)
	{
		this.QueueAction(new CheerAction(60));
		return;
	}

	// If all else fails and recruited, follow the player 
	if (this.owner.recruited && player !== null && distanceActorToActor(this.owner, player) < 1600)
	{
		this.QueueAction(new FollowTargetAction(player, 60));
		return;
	}
	
	// If there's nothing to do, wait 15 frames before evaluating again to lower CPU usage
	// And to make the AI seem more human by giving it some reaction time.
	var waitAction = new WaitAction(15);
	waitAction.followPlayer = true;
	this.QueueAction(waitAction);
};

JoeAI.prototype.Update = function()
{	
	AICore.prototype.Update.call(this);
};

JoeAI.prototype.QueueAction = AICore.prototype.QueueAction;
JoeAI.prototype.Flush = AICore.prototype.Flush;
JoeAI.prototype.CancelCurrentAction = AICore.prototype.CancelCurrentAction;
//JoeAI.prototype.Update = AICore.prototype.Update;
//JoeAI.prototype.Draw = AICore.prototype.Draw;

JoeAI.prototype.Draw = function()
{
	AICore.prototype.Draw.call(this);
};