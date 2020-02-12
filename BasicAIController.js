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

function BasicAIController(owner)
{
	this.owner = owner;
	
	this.pacifist = false;
	if (this.owner instanceof Joe0)
		this.pacifist = true;
	
	this.followTarget = null;

	this.strikeDistanceX = 375;
	this.strikeDistanceY = 20;
	
	// Behaviors active
	this.tryattack = false;
	this.tryhornykiss = false;
	this.tryfollow = false;
	
	this.searchDistance = 2000;
	
	this.reactionTimeMove = 4;
	this.reactionTimeAttack = 40;
	this.reactionCountMove = Math.random()*this.reactionTimeMove;
	this.reactionCountAttack = Math.random()*this.reactionTimeAttack;
	
	this.doubleTapFirstPressLength = 10;
	this.doubleTapPressGap = 10;
	
	this.up = false;
	this.upFramesSinceKeydown = 0;
	this.upFramesSinceKeyup = 1;
	this.upFramesSinceShortTap = this.doubleTapPressGap+1;
	
	this.down = false;
	this.downFramesSinceKeydown = 0;
	this.downFramesSinceKeyup = 1;
	this.downFramesSinceShortTap = this.doubleTapPressGap+1;
	
	this.left = false;
	this.leftFramesSinceKeydown = 0;
	this.leftFramesSinceKeyup = 1;
	this.leftFramesSinceShortTap = this.doubleTapPressGap+1;
	
	this.right = false;
	this.rightFramesSinceKeydown = 0;
	this.rightFramesSinceKeyup = 1;
	this.rightFramesSinceShortTap = this.doubleTapPressGap+1;
	
	this.punch = false;
	this.punchFramesSinceKeydown = 0;
	this.punchFramesSinceKeyup = 1;
	
	this.smoke = false;
	this.smokeFramesSinceKeydown = 0;
	this.smokeFramesSinceKeyup = 1;
	
	this.grab = false;
	this.grabFramesSinceKeydown = 0;
	this.grabFramesSinceKeyup = 1;
	
	this.jump = false;
	this.jumpFramesSinceKeydown = 0;
	this.jumpFramesSinceKeyup = 1;
	
	this.start = false;
	this.startFramesSinceKeydown = 0;
	this.startFramesSinceKeyup = 1;
	
	this.any = false;
	this.anyFramesSinceKeydown = 0;
	this.anyFramesSinceKeyup = 1;
};

BasicAIController.prototype.findTarget = function()
{
	var oldTarget = this.followTarget;
	this.followTarget = null;
	
	if (this.owner.newlySpawned)
	{
		this.followTarget = {'posX': this.owner.newlySpawnedTargetX,
							 'posY': this.owner.newlySpawnedTargetY };
		
		
		if (this.followTarget !== null)
		{
			this.tryattack = false;
			this.tryhornykiss = false;
			this.tryfollow = true;
			return;
		}
	}
	
	else if (this.owner.watchingSex)
	{
		if (oldTarget !== null && oldTarget.hasOwnProperty('watchingSexTarget'))
		{
			this.followTarget = oldTarget;
		}
		else
		{
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
				this.followTarget = level.PlaceWithCollision(this.owner.posX, 
															 this.owner.posY, 
															 playerX + 300*Math.cos(angleFromPlayer), 
															 this.owner.posY, //playerY + 300*Math.sin(angleFromPlayer), 
															 this.owner.collisionRadius);
									 
				this.followTarget.watchingSexTarget = true;
			}
			else
			{
				this.followTarget = this;
			}
		}
	
		if (this.followTarget !== null)
		{
			this.tryattack = false;
			this.tryhornykiss = false;
			this.tryfollow = true;
			return;
		}
	}
	
	// If recruited, look for someone to kiss
	else if (this.owner.recruited)
	{
		this.followTarget = level.entities.FindHornyAlly(this.owner,this.searchDistance);
		
		if (this.followTarget !== null)
		{
			this.tryattack = false;
			this.tryhornykiss = true;
			this.tryfollow = false;
			return;
		}
	}
		
	// Otherwise look for someone to attack
	this.followTarget = level.FindClosestEnemy(this.owner,this.searchDistance);
	
	if (this.followTarget !== null && !this.pacifist)
	{
		this.tryattack = true;
		this.tryhornykiss = false;
		this.tryfollow = false;
		return;
	}

	// If all else fails, follow the player
	if (player !== null && distanceActorToActor(this.owner, player) < 1600)
	{
		this.followTarget = player;
		if (this.followTarget !== null)
		{
			this.tryattack = false;
			this.tryhornykiss = false;
			this.tryfollow = true;
			return;
		}
	}
}

BasicAIController.prototype.update = function()
{
	this.reactionCountMove += 1;
	this.reactionCountAttack += 1;
	
	// Find a new target every once in a while if you don't have one or if something happened to make you invulnerable
	if (this.reactionCountMove > this.reactionTimeMove)
	{
		//if (this.followTarget === null || IsInvulnerable(this.followTarget.state) )
		{
			this.findTarget();
		}
	}
	
	// If the AI has a target...
	if (this.followTarget !== null && !IsInvulnerable(this.owner.state))
	{
		var distX = this.followTarget.posX - this.owner.posX;
		var distY = this.followTarget.posY - this.owner.posY;
		
		if (this.tryhornykiss)
		{
			this.MoveIntoAttackPosition(distX, distY, 150, 0, 10, 30);
			if (this.owner.recruited && this.followTarget.recruited && Math.abs(distY) < 30 && Math.abs(distX) < 170)
			{
				// Animation location should be dead center between the two Joes
				var posX = (this.owner.posX + this.followTarget.posX) / 2.0;
				var posY = (this.owner.posY + this.followTarget.posY) / 2.0;
				var posZ = (this.owner.zHeight + this.followTarget.zHeight) / 4.0;
				
				this.owner.Kiss(posX,posY,posZ, this.owner.posX < this.followTarget.posX);
				this.followTarget.Kiss(posX,posY,posZ, this.owner.posX >= this.followTarget.posX);
			}
		}
		else if (this.tryfollow)
		{
			var followdist = 700;
			
			if (this.owner.newlySpawned)
				followdist = 0;
			else if (this.owner.watchingSex)
				followdist = 50;
				
			this.Follow(distX, distY, followdist);
		}
		else if (this.tryattack)
		{
			// Move
			if (this.reactionCountMove > this.reactionTimeMove)
			{
				this.MoveIntoAttackPosition(distX, distY, 350, 0, 10, 30);
			}
			
			// Attack
			if (this.reactionCountAttack > this.reactionTimeAttack)
			{
				this.reactionCountAttack = 0;
		
				if (this.punch && this.punchFramesSinceKeydown > 20)
					this.punchKeyUp();
				else if (IsAttackable(this.followTarget.state) &&  Math.abs(distX) < this.strikeDistanceX &&  Math.abs(distY) < this.strikeDistanceY)
				{
					if (this.followTarget.posX < this.owner.posX)
						this.owner.facing = -1;
					else
						this.owner.facing = 1;
					this.punchKeyDown();
				}
			}
		}
	}
	else
	{
		// Release all keys
		if (this.reactionCountMove > this.reactionTimeMove)
		{
			this.reactionCountMove = 0;
			if (this.up)
				this.upKeyUp();
			if (this.down)
				this.downKeyUp();
			if (this.left)
				this.leftKeyUp();
			if (this.right)
				this.rightKeyUp();
		}
	}
	
		
	this.upFramesSinceKeydown += 1;
	this.downFramesSinceKeydown += 1;
	this.leftFramesSinceKeydown += 1;
	this.rightFramesSinceKeydown += 1;
	this.punchFramesSinceKeydown += 1;
	this.smokeFramesSinceKeydown += 1;
	this.grabFramesSinceKeydown += 1;
	this.jumpFramesSinceKeydown += 1;
	this.startFramesSinceKeydown += 1;
	this.anyFramesSinceKeydown += 1;
	
	this.upFramesSinceKeyup += 1;
	this.downFramesSinceKeyup += 1;
	this.leftFramesSinceKeyup += 1;
	this.rightFramesSinceKeyup += 1;
	this.punchFramesSinceKeyup += 1;
	this.smokeFramesSinceKeyup += 1;
	this.grabFramesSinceKeyup += 1;
	this.jumpFramesSinceKeyup += 1;
	this.startFramesSinceKeyup += 1;
	this.anyFramesSinceKeyup += 1;
	
	this.upFramesSinceShortTap += 1;
	this.downFramesSinceShortTap += 1;
	this.leftFramesSinceShortTap += 1;
	this.rightFramesSinceShortTap += 1;
	
};


BasicAIController.prototype.MoveIntoAttackPosition = function(distX, distY, followDistanceX, followDistanceY, followDeadzoneX, followDeadzoneY)
{
	// If you are closer in X than necessary and on the wrong Y plane, then back off.
	if (Math.abs(distX) < followDistanceX-followDeadzoneX && Math.abs(distY) > followDeadzoneY)
	{
		if (distX < 0)
		{
			if (this.left)
				this.leftKeyUp();
			if (!this.right)
				this.rightKeyDown();
		}
		else
		{
			if (!this.left)
				this.leftKeyDown();
			if (this.right)
				this.rightKeyUp();
		}
	}
	else if (Math.abs(distX) > followDistanceX+followDeadzoneX)
	{
		if (distX - followDeadzoneX > 0)
		{
			if (this.left)
				this.leftKeyUp();
			if (!this.right)
				this.rightKeyDown();
		}
		else if (distX + followDeadzoneX < 0)
		{
			if (!this.left)
				this.leftKeyDown();
			if (this.right)
				this.rightKeyUp();
		}
		else
		{
			if (this.left)
				this.leftKeyUp();
			if (this.right)
				this.rightKeyUp();
		}
	}
	else
	{
		if (this.left)
			this.leftKeyUp();
		if (this.right)
			this.rightKeyUp();
	}

	if (Math.abs(distY) > followDistanceY)
	{
		if (distY + followDeadzoneX < 0)
		{
			if (this.down)
				this.downKeyUp();
			if (!this.up)
				this.upKeyDown();
		}
		else if (distY - followDeadzoneX > 0)
		{
			if (!this.down)
				this.downKeyDown();
			if (this.up)
				this.upKeyUp();
		}
		else
		{
			if (this.down)
				this.downKeyUp();
			if (this.up)
				this.upKeyUp();
		}
	}
	else
	{
		if (this.down)
			this.downKeyUp();
		if (this.up)
			this.upKeyUp();
	}
}

BasicAIController.prototype.Follow = function(distX, distY, followDistance)
{
	// If you are closer in X than necessary and on the wrong Y plane, then back off.
	if (speed2(distX,distY) > followDistance)
	{
		if (distX > 0 && Math.abs(distX) > 10)
		{
			if (this.left)
				this.leftKeyUp();
			if (!this.right)
				this.rightKeyDown();
		}
		else if (distX < 0 && Math.abs(distX) > 10)
		{
			if (!this.left)
				this.leftKeyDown();
			if (this.right)
				this.rightKeyUp();
		}
		else
		{
			this.rightKeyUp();
			this.leftKeyUp();
		}
		
		if (distY < 0)
		{
			if (this.down)
				this.downKeyUp();
			if (!this.up)
				this.upKeyDown();
		}
		else if (distY > 0)
		{
			if (!this.down)
				this.downKeyDown();
			if (this.up)
				this.upKeyUp();
		}
		else
		{
			this.downKeyUp();
			this.upKeyUp();
		}
	}
	else
	{
		if (this.owner.watchingSex)
		{
			if (this.owner.posX > player.posX)
				this.owner.facing = -1;
			else
				this.owner.facing = 1;
		}
		
		this.rightKeyUp();
		this.leftKeyUp();
		this.downKeyUp();
		this.upKeyUp();
	}
};

BasicAIController.prototype.upKeyUp = function()
{
	this.up = false;
	this.upFramesSinceKeyup = 0;
	if (this.upFramesSinceKeydown <= this.doubleTapFirstPressLength)
		this.upFramesSinceShortTap = 0;
};

BasicAIController.prototype.downKeyUp = function()
{
	this.down = false;
	this.downFramesSinceKeyup = 0;
	if (this.downFramesSinceKeydown <= this.downTapFirstPressLength)
		this.downFramesSinceShortTap = 0;
};

BasicAIController.prototype.leftKeyUp = function()
{
	this.left = false;
	this.leftFramesSinceKeyup = 0;
	if (this.leftFramesSinceKeydown <= this.doubleTapFirstPressLength)
		this.leftFramesSinceShortTap = 0;
};

BasicAIController.prototype.rightKeyUp = function()
{
	this.right = false;
	this.rightFramesSinceKeyup = 0;
	if (this.rightFramesSinceKeydown <= this.doubleTapFirstPressLength)
		this.rightFramesSinceShortTap = 0;
};

BasicAIController.prototype.punchKeyUp = function()
{
	this.punch = false;
	this.punchFramesSinceKeyup = 0;
};

BasicAIController.prototype.smokeKeyUp = function()
{
	this.smoke = false;
	this.smokeFramesSinceKeyup = 0;
};

BasicAIController.prototype.grabKeyUp = function()
{
	this.grab = false;
	this.grabFramesSinceKeyup = 0;
};

BasicAIController.prototype.jumpKeyUp = function()
{
	this.jump = false;
	this.jumpFramesSinceKeyup = 0;
};

BasicAIController.prototype.startKeyUp = function()
{
	this.start = false;
	this.startFramesSinceKeyup = 0;
};

BasicAIController.prototype.anyKeyUp = function()
{
	this.any = false;
	this.anyFramesSinceKeyup = 0;
};

BasicAIController.prototype.upKeyDown = function()
{
	if (!this.up)
	{
		this.up = true;
		this.upFramesSinceKeydown = 0;
	}
};

BasicAIController.prototype.downKeyDown = function()
{
	if (!this.down)
	{
	this.down = true;
	this.downFramesSinceKeydown = 0;
	}
};

BasicAIController.prototype.leftKeyDown = function()
{
	if (!this.left)
	{
	this.left = true;
	this.leftFramesSinceKeydown = 0;
	}
};

BasicAIController.prototype.rightKeyDown = function()
{
	if (!this.right)
	{
	this.right = true;
	this.rightFramesSinceKeydown = 0;
	}
};

BasicAIController.prototype.punchKeyDown = function()
{
	if (!this.punch)
	{
	this.punch = true;
	this.punchFramesSinceKeydown = 0;
	}
};

BasicAIController.prototype.smokeKeyDown = function()
{
	if (!this.punch)
	{
	this.smoke = true;
	this.smokeFramesSinceKeydown = 0;
	}
};

BasicAIController.prototype.grabKeyDown = function()
{
	if (!this.grab)
	{
	this.grab = true;
	this.grabFramesSinceKeydown = 0;
	}
};

BasicAIController.prototype.jumpKeyDown = function()
{
	if (!this.jump)
	{
	this.jump = true;
	this.jumpFramesSinceKeydown = 0;
	}
};

BasicAIController.prototype.startKeyDown = function()
{
	if (!this.start)
	{
	this.start = true;
	this.startFramesSinceKeydown = 0;
	}
};

BasicAIController.prototype.anyKeyDown = function()
{
	if (!this.any)
	{
	this.any = true;
	this.anyFramesSinceKeydown = 0;
	}
};

BasicAIController.prototype.upActivate = function()
{
	return this.up && this.upFramesSinceKeydown == 0;
};

BasicAIController.prototype.downActivate = function()
{
	return this.down && this.downFramesSinceKeydown == 0;
};

BasicAIController.prototype.leftActivate = function()
{
	return this.left && this.leftFramesSinceKeydown == 0;
};

BasicAIController.prototype.rightActivate = function()
{
	return this.right && this.rightFramesSinceKeydown == 0;
};

BasicAIController.prototype.punchActivate = function()
{
	return this.punch && this.punchFramesSinceKeydown == 0;
};

BasicAIController.prototype.smokeActivate = function()
{
	return this.smoke && this.smokeFramesSinceKeydown == 0;
};

BasicAIController.prototype.grabActivate = function()
{
	return this.grab && this.grabFramesSinceKeydown == 0;
};

BasicAIController.prototype.jumpActivate = function()
{
	return this.jump && this.jumpFramesSinceKeydown == 0;
};

BasicAIController.prototype.startActivate = function()
{
	return this.start && this.startFramesSinceKeydown == 0;
};

BasicAIController.prototype.anyActivate = function()
{
	return this.any && this.anyFramesSinceKeydown == 0;
};

BasicAIController.prototype.upDeactivate = function()
{
	return !this.up && this.upFramesSinceKeyup == 0;
};

BasicAIController.prototype.downDeactivate = function()
{
	return !this.down && this.downFramesSinceKeyup == 0;
};

BasicAIController.prototype.leftDeactivate = function()
{
	return !this.left && this.leftFramesSinceKeyup == 0;
};

BasicAIController.prototype.rightDeactivate = function()
{
	return !this.right && this.rightFramesSinceKeyup == 0;
};

BasicAIController.prototype.punchDeactivate = function()
{
	return !this.punch && this.punchFramesSinceKeyup == 0;
};

BasicAIController.prototype.smokeDeactivate = function()
{
	return !this.punch && this.smokeFramesSinceKeyup == 0;
};

BasicAIController.prototype.grabDeactivate = function()
{
	return !this.grab && this.grabFramesSinceKeyup == 0;
};

BasicAIController.prototype.jumpDeactivate = function()
{
	return !this.jump && this.jumpFramesSinceKeyup == 0;
};

BasicAIController.prototype.startDeactivate = function()
{
	return !this.start && this.startFramesSinceKeyup == 0;
};

BasicAIController.prototype.anyDeactivate = function()
{
	return !this.any && this.anyFramesSinceKeyup == 0;
};

BasicAIController.prototype.upDoubleTap = function()
{
	return this.upFramesSinceKeydown == 0 && this.upFramesSinceShortTap <= this.doubleTapPressGap;
};

BasicAIController.prototype.downDoubleTap = function()
{
	return this.downFramesSinceKeydown == 0 && this.downFramesSinceShortTap <= this.doubleTapPressGap;
};

BasicAIController.prototype.leftDoubleTap = function()
{
	return this.leftFramesSinceKeydown == 0 && this.leftFramesSinceShortTap <= this.doubleTapPressGap;
};

BasicAIController.prototype.rightDoubleTap = function()
{
	return this.rightFramesSinceKeydown == 0 && this.rightFramesSinceShortTap <= this.doubleTapPressGap;
};
