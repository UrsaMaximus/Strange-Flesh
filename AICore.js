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

function AICore(owner)
{
	this.owner = owner;
	
	this.actionQueue = [];
	this.baselineAction = null;
	
	this.targetPosX = 0;
	this.targetPosY = 0;
	
	// Put the owner's controller in implied keyup mode so that we don't have to worry about calling keyups
	this.owner.controller.impliedKeyup = true;
};

AICore.prototype.Flush = function()
{
	for (var i = this.actionQueue.length-1; i >= 0; i--)
	{
		if (this.actionQueue[i].flushable)
		{
			this.actionQueue[i].Complete();
			this.actionQueue.splice(i,1);
		}
	}
};

AICore.prototype.CancelCurrentAction = function()
{
	while (this.actionQueue.length > 0)
	{
		this.actionQueue[0].Complete();
		this.actionQueue.splice(0,1);
	}
};

AICore.prototype.Update = function()
{
	// If the action at the head of the collection is dead, remove it
	while (this.actionQueue.length > 0 && this.actionQueue[0].ended)
	{
		this.actionQueue[0].Complete();
		this.actionQueue.splice(0,1);
	}
	
	if (IsCorrupt(this.owner.state) || this.owner.state === States.KnockedOut)
	{
		this.Flush();
	}
	
	// If there are no actions in the list, generate a new one based on the (likely subclassed) QueueNewAction()
	if (this.actionQueue.length == 0 && IsCapableOfThought(this.owner.state))
		this.GenerateNewAction();
	
	// Update the action at the head of the list
	if (this.actionQueue.length > 0)
		this.actionQueue[0].Update();
};

AICore.prototype.QueueAction = function(action)
{
	action.owner = this.owner;
	this.actionQueue.push(action);
};

AICore.prototype.GenerateNewAction = function()
{
	// Do nothing. Subclasses will be much smarter.
};

AICore.prototype.Draw = function()
{
	if (debug === 2)
	{
		if (this.owner !== null)
		{
			var currentAction = "[None]";
			if (this.actionQueue.length > 0)
			{
				currentAction = this.actionQueue[0].constructor.name
				
				if ("Draw" in this.actionQueue[0])
				{
					this.actionQueue[0].Draw();
				}
				
			}
			
			ctx.font = "32px alagard";
			ctx.textAlign = "center";
			drawTextWithShadow(currentAction, 0, -450);
			
			
		}
	}
};

AICore.prototype.UpdateTargetPosition = function(target)
{
	this.targetPosX = target.posX - target.velX * 8.0;
	this.targetPosY = target.posY - target.velY * 8.0;
};

function FindTarget()
{
	var oldTarget = this.followTarget;
	this.followTarget = null;
	
	if (this.owner.watchingSex)
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

function BasicAction()
{
	this.owner = null;
	this.timer = 0;
	this.timeout = -1;	
	this.ended = false;
	this.flushable = true;
};

// This action does not end and must be cancelled
function FollowTargetAction(followTarget, timeout)
{
	BasicAction.call(this);
	
	this.followTarget = followTarget;
	
	// A flag to set when the owner has gotten the minimum distance away
	this.seekingMinDistance = true;
	this.minDistance = 500;
	this.maxDistance = 800;
	
	if(typeof(timeout)=='undefined') 
		this.timeout = -1;
	else
		this.timeout = timeout;
};

FollowTargetAction.prototype.Update = function()
{
	this.timer += 1;
	
	var distX = this.followTarget.posX - this.owner.posX;
	var distY = this.followTarget.posY - this.owner.posY;
	
	var followDistance = this.maxDistance;
	if (this.seekingMinDistance)
		followDistance = this.minDistance;
	
	// If you are closer in X than necessary and on the wrong Y plane, then back off.
	if (speed2(distX,distY) > followDistance)
	{
		if (distX > 0 && Math.abs(distX) > 10)
		{
			this.owner.controller.rightKeyDown();
		}
		else if (distX < 0 && Math.abs(distX) > 10)
		{
			this.owner.controller.leftKeyDown();
		}
		
		if (distY < 0)
		{
			this.owner.controller.upKeyDown();
		}
		else if (distY > 0)
		{
			this.owner.controller.downKeyDown();
		}
	}
	else
	{
		if (this.seekingMinDistance)
			this.seekingMinDistance = false;
	}
	
	if (this.timer > this.timeout && this.timeout !== -1)
	{		
		this.ended = true;
	}
};

FollowTargetAction.prototype.Complete = function()
{
	this.ended = true;
};

// This action does not end and must be cancelled
function ChaseAttackAction(followTarget, followDistance, attackDistance, attackCoolDown, timeout)
{
	BasicAction.call(this);
	
	this.followTarget = followTarget;
	
	this.followDistance = followDistance;
	this.attackDistance = attackDistance;
	this.attackCoolDown = attackCoolDown;
	this.attackCoolDownTimer = 0;
	this.reverseDirectionOffscreen = true;
	
	if(typeof(timeout)=='undefined')
		this.timeout = -1;
	else
		this.timeout = timeout;
};

ChaseAttackAction.prototype.Update = function()
{
	// If the target is not attackable, realize this and stop trying to attack
	if (!IsAttackable(this.followTarget.state))
	{
		this.ended = true;
		return;
	}

	this.timer += 1;
	if (this.attackCoolDownTimer > 0)
		this.attackCoolDownTimer--;
	
	// If both the owner and target are offscreen, make sure the chase direction is setup
	// to get them both back onscreen
	if (this.reverseDirectionOffscreen)
	{
		var ownerSide = camera.walkingEntityOffscreenSide(this.owner);
		var targetSide = camera.walkingEntityOffscreenSide(this.followTarget);
		
		// If the owner is offscreen to the same side as the target...
		if (ownerSide !== 0 && ownerSide === targetSide)
		{
			// If the owner is on the wrong side, try to mirror the X position about the target...
			if ( sign(this.followTarget.posX - this.owner.posX) === ownerSide)
			{
				var targetX = this.owner.posX;
				var targetY = this.owner.posY;
				this.owner.posX = this.followTarget.posX;
				this.owner.posY = this.followTarget.posY;
				this.followTarget.posX = targetX;
				this.followTarget.posY = targetY;
				/*
				// Calculate the destination X,Y position, mirrored across the target
				var targetX = this.followTarget.posX - (this.owner.posX - this.followTarget.posX);
				var targetY = this.owner.posY;
			
				// Move the owner to the target's location...
				this.owner.posX = this.followTarget.posX;
				this.owner.posY = this.followTarget.posY;
			
				// Starting from the target's location, try to slide into the destination location.
				var deltaX = targetX - this.owner.posX;
				var deltaY = targetY - this.owner.posY;
				this.owner.CollisionDetection(deltaX,deltaY,0,false);
				*/
			}
		}
	}
	
	var distX = this.followTarget.posX - this.owner.posX;
	var distY = this.followTarget.posY - this.owner.posY;
	
	
	if (speed2(distX,distY) > this.followDistance)
	{
		if (distX > 0 && Math.abs(distX) > 10)
		{
			this.owner.controller.rightKeyDown();
		}
		else if (distX < 0 && Math.abs(distX) > 10)
		{
			this.owner.controller.leftKeyDown();
		}
		
		if (distY < -5)
		{
			this.owner.controller.upKeyDown();
		}
		else if (distY > 5)
		{
			this.owner.controller.downKeyDown();
		}
	}
	
	if (speed2(distX,distY) <= this.attackDistance && this.attackCoolDownTimer === 0)
	{
		this.owner.facing = signWithoutZero(distX);
		this.attackCoolDownTimer += this.attackCoolDown;
		this.owner.controller.punchKeyDown();
		this.owner.ai.UpdateTargetPosition(this.followTarget);
	}
	
	if (this.timer > this.timeout && this.timeout !== -1)
	{		
		this.ended = true;
	}
};

ChaseAttackAction.prototype.Complete = function()
{
	this.ended = true;
};

function FleeAction(followTarget, distance)
{
	BasicAction.call(this);
	
	this.followTarget = followTarget;
	this.minDistance = distance;
	this.timeout = 120;
	
	//this.dodge = Math.random() > 0.8;
	this.dodgeVert = Math.random() > 0.4;
	this.dodgeHoriz = Math.random() > 0.8;
	this.dodgeUp = Math.random() > 0.5;
	this.dodgeRight = Math.random() > 0.5;
};

FleeAction.prototype.Update = function()
{
	this.timer += 1;
	
	var distX = this.followTarget.posX - this.owner.posX;
	var distY = this.followTarget.posY - this.owner.posY;
	
	if (this.timer > this.timeout)
	{
		this.ended = true;
	}
	else if (this.followTarget.state === States.Dead)
	{
		this.ended = true;
	}	
	else if (speed2(distX,distY) < this.minDistance)
	{
		if (this.dodgeHoriz)
		{
			if (this.dodgeRight)
				this.owner.controller.rightKeyDown();
			else
				this.owner.controller.leftKeyDown();
		}
		else if (distX < 0)
		{
			this.owner.controller.rightKeyDown();
		}
		else if (distX >= 0)
		{
			this.owner.controller.leftKeyDown();
		}
		
		if (this.dodgeVert)
		{
			if (this.dodgeUp)
				this.owner.controller.upKeyDown();
			else
				this.owner.controller.downKeyDown();
		}
		else if (distY < -5)
		{
			this.owner.controller.upKeyDown();
		}
		else if (distY > 5)
		{
			this.owner.controller.downKeyDown();
		}
	}
	else
	{
		this.ended = true;
	}
};

FleeAction.prototype.Complete = function()
{
	this.ended = true;
};

// This action ends upon reaching a location or a timeout
function GoToPointAction(posX, posY, dist, flushable)
{
	BasicAction.call(this);
		
	this.posX = posX;
	this.posY = posY;
	this.dist = dist;
	this.deadZoneX = 20;
	this.deadZoneY = 5;
	
	this.jumpingMovement = false;
	this.jumpTime = 60;
	this.jumpTimer = 0;
	
	this.flushable = flushable;
};

GoToPointAction.prototype.Update = function()
{
	this.timer += 1;
	
	var distX = this.posX - this.owner.posX;
	var distY = this.posY - this.owner.posY;

	if (this.owner.MustJumpToMove)
	{
		if (this.jumpTimer < this.jumpTime)
		{
			this.owner.controller.jumpKeyDown();
			this.jumpTimer++;
		}
		else
		{
			this.jumpTimer = 0;
		}
	}

	if (speed2(distX,distY) > this.dist)
	{
		// Adjust the X position if X is the principle component of error
		// or if it's out of spec
		var tryAdjustX = Math.abs(distX) > this.deadZoneX || Math.abs(distX) > Math.abs(distY);
	
		if (distX > 0 && tryAdjustX)
		{
			this.owner.controller.rightKeyDown();
		}
		else if (distX < 0 && tryAdjustX)
		{
			this.owner.controller.leftKeyDown();
		}
		
		if (distY < 0 && Math.abs(distY) > this.deadZoneY)
		{
			this.owner.controller.upKeyDown();
		}
		else if (distY > 0 && Math.abs(distY) > this.deadZoneY)
		{
			this.owner.controller.downKeyDown();
		}
	}
	else
	{
		this.ended = true;
	}
	
	if (this.timer > this.timeout && this.timeout !== -1)
	{
		this.ended = true;
	}
	
};

GoToPointAction.prototype.Complete = function()
{
	this.ended = true;
};

// This action ends upon reaching a location or a timeout
function WatchSexAction(posX)
{
	BasicAction.call(this);
	this.posX = posX;
};

WatchSexAction.prototype.Update = function()
{
	this.owner.facing = Math.sign(this.posX - this.owner.posX);
	
	if (!this.owner.watchingSex)
		this.ended = true;
};

WatchSexAction.prototype.Complete = function()
{
	this.ended = true;
};


// This action ends upon reaching a location or a timeout
function WaitAction(framesToWait, followPlayer)
{
	BasicAction.call(this);
	this.framesToWait = framesToWait;
	if(typeof(followPlayer)=='undefined') 
		followPlayer = false;
	this.followPlayer = followPlayer;
};

WaitAction.prototype.Update = function()
{
	if (this.followPlayer && player !== null)
	{
		if (player.posX > this.owner.posX)
			this.owner.facing = 1;
		else 
			this.owner.facing = -1;
	}
	
	this.timer += 1;
	if (this.timer > this.framesToWait)
		this.ended = true;
};

WaitAction.prototype.Complete = function()
{
	this.ended = true;
};

// This action ends upon reaching a location or a timeout
function FaceTargetAction(framesToWait, target)
{
	BasicAction.call(this);
	this.framesToWait = framesToWait;
	this.target = target;
};

FaceTargetAction.prototype.Update = function()
{
	if (this.target !== null)
	{
		if (this.target.posX > this.owner.posX)
			this.owner.facing = 1;
		else 
			this.owner.facing = -1;
	}
	
	this.timer += 1;
	if (this.timer > this.framesToWait)
		this.ended = true;
};

FaceTargetAction.prototype.Complete = function()
{
	this.ended = true;
};


// This action ends upon reaching a location or a timeout
function CheerAction(framesToWait)
{
	BasicAction.call(this);
	this.framesToWait = framesToWait;
	this.followPlayer = true;
};

CheerAction.prototype.Update = function()
{
	this.owner.controller.smokeKeyDown();
	
	if (this.followPlayer && player !== null)
	{
		if (player.posX > this.owner.posX)
			this.owner.facing = 1;
		else 
			this.owner.facing = -1;
	}
	
	this.timer += 1;
	if (this.timer > this.framesToWait)
		this.ended = true;
};

CheerAction.prototype.Complete = function()
{
	this.ended = true;
};

function AttackTargetAction(owner, attackDist, attackTime, target, side, attackType, nodeCount)
{
	BasicAction.call(this);
	
	this.owner = owner;
	this.attackDist = attackDist;
	this.attackTimerDone = attackTime;
	this.target = target;
	this.side = side;
	
	// Basic state
	this.politeAttack = this.owner.polite;
	this.allowFriendlyFire = false;
	this.attackDir = 0;
	this.tryingAttack = false;
	this.attackTimer = 0;
	this.tryNewDirectionTimer = 20;
	this.tryAlternatePaths = true;
	
	this.movementDeadZone = 10;
	this.attackDeadZone = 10;
	
	this.jumpingMovement = false;
	this.jumpTime = 60;
	this.jumpTimer = 0;

	// Define the pathing hexagon
	this.backoffX = this.target.hitRect.width() / 2.0 + this.owner.hitRect.width() / 2.0;
	this.backoffY = this.target.hitRect.height() / 2.0 + this.owner.hitRect.height() / 2.0 + 50;
	
	if(typeof(nodeCount)=='undefined') 
		nodeCount = 6;
		
	if (nodeCount === 2)
	{
		this.path = [	{x:  this.attackDist + this.backoffX, y:      0 },
						{x: -this.attackDist - this.backoffX, y:      0 }
					];
	}
	else
	{
		this.path = [	{x:  this.attackDist + this.backoffX, y:   0 },
						{x:  this.backoffX, y:  this.backoffY },
						{x: -this.backoffX, y:  this.backoffY },
						{x: -this.attackDist - this.backoffX, y:      0 },
						{x: -this.backoffX, y: -this.backoffY },
						{x:  this.backoffX, y: -this.backoffY },
					];
	}
	
	// Decide where to go first
	this.node = this.GetClosestNode();
	
	// Decide on clockwise or counterclockwise motion
	this.PickAttackDirection();
	
	if(typeof(attackType)=='undefined') 
	{
		this.attackButton = this.owner.controller.punchKeyDown;
	}
	else
	{
		if (attackType === 1)
			this.attackButton = this.owner.controller.smokeKeyDown;
		else if (attackType === 2)
			this.attackButton = this.owner.controller.grabKeyDown;
		else if (attackType === 3)
			this.attackButton = this.owner.controller.jumpKeyDown;
		else
			this.attackButton = this.owner.controller.punchKeyDown;
	}
};

AttackTargetAction.prototype.PickAttackDirection = function()
{
	var distX = this.owner.posX - this.target.posX;
	var distY = this.owner.posY - this.target.posY;
	
	// Top left quadrant
	if (distX <= 0 && distY <= 0 && this.side <= 0)		// Left side allowed
		this.attackDir = -1;
	else if (distX <= 0 && distY <= 0 && this.side >= 0)	// Right side allowed
		this.attackDir = 1;
	
	// Bottom left quadrant
	else if (distX <= 0 && distY > 0 && this.side <= 0)	// Left side allowed
		this.attackDir = 1;
	else if (distX <= 0 && distY > 0 && this.side >= 0) // Right side allowed
		this.attackDir = -1;
	
	// Top right quadrant
	else if (distX > 0 && distY <= 0 && this.side >= 0)	// Right side allowed
		this.attackDir = 1;
	else if (distX > 0 && distY <= 0 && this.side <= 0)
		this.attackDir = -1;
		
	// Bottom right quadrant
	else if (distX > 0 && distY > 0 && this.side >= 0)	// Right side allowed
		this.attackDir = -1;
	else if (distX > 0 && distY > 0 && this.side <= 0)	// Left side allowed
		this.attackDir = 1;
}

AttackTargetAction.prototype.GetClosestNode = function()
{
	var mindist = Number.MAX_VALUE;
	var node = -1;
	
	for (var i = 0; i < this.path.length; i++)
	{
		var dist = Math.pow(this.path[i].x + this.target.posX - this.owner.posX,2) + 
				   Math.pow(this.path[i].y + this.target.posY - this.owner.posY,2);
		if (dist < mindist)
		{
			mindist = dist;
			node = i;
		}
	}
	
	return node;
};

AttackTargetAction.prototype.Update = function()
{
	this.timer += 1;
	
	if (this.timeout !== -1 && this.timer > this.timeout)
	{
		this.ended = true;
		return;
	}
	
	// If the target is of the same alliance, stop trying to attack
	if ( !this.allowFriendlyFire && this.owner.alliance === this.target.alliance )
	{
		this.ended = true;
		return;
	}
	
	// If the target is not attackable, realize this and stop trying to attack
	if (!IsAttackable(this.target.state))
	{
		this.ended = true;
		return;
	}
	
	var nodeDistX = this.owner.posX - (this.path[this.node].x + this.target.posX);
	var nodeDistY = this.owner.posY - (this.path[this.node].y + this.target.posY);
	
	var distX = this.owner.posX - this.target.posX;
	var distY = this.owner.posY - this.target.posY;
	
	// If the player is really far away, then cancel out of the attack
	if (speed2(distX,distY) > 2000)
	{
		this.ended = true;
		return;
	}
	
	// Jut a little hack to get Joe4 leaping more often
	if (this.owner instanceof Joe4 && ((Math.abs(distX) > 400 && Math.abs(distX) < 900) ||  (Math.abs(distY) < 500 && Math.abs(distY) > 200)))
	{
		this.ended = true;
		return;
	}
	
	var dz = this.movementDeadZone;
	var fc = this.attackDeadZone;
	

	
	if (!this.tryingAttack)
	{
		// See if it's time to attack or advance nodes
		if (this.path.length === 2)
		{
			if (Math.abs(nodeDistY) <= fc && Math.abs(nodeDistX) <= fc)
			{
				this.tryingAttack = true;
				return
			}
		}
		else
		{
			if (this.node === 0 && this.side >= 0)
			{
				if (Math.abs(nodeDistY) <= fc && nodeDistX <= fc)
				{
					this.tryingAttack = true;
					return
				}
			}
			else if (this.node === 3 && this.side <= 0)
			{
				if (Math.abs(nodeDistY) <= fc && nodeDistX >= -fc)
				{
					this.tryingAttack = true;
					return;
				}
			}
			else if (Math.abs(nodeDistY) <= fc && Math.abs(nodeDistX) <= fc)
			{
				this.AdvanceNode();
			}
		}
		
		// Count down to the time when it's ok to reverse direction and try a new path
		if (this.tryNewDirectionTimer > 0)
			this.tryNewDirectionTimer -= 1;
	
		// If the owner is alive and walking but 
		// effective velocity is close to zero, try to get out of the trap
		if (this.tryNewDirectionTimer === 0 && this.tryAlternatePaths)
		{
			if (IsAttackable(this.owner.state) && speed2(this.owner.velXEffective,this.owner.velYEffective) < 5.0 )
			{
				this.node = this.GetClosestNode();
				this.attackDir = -this.attackDir;
			
				//if (Math.random() > 0.5)
				//	this.AdvanceNode();
			
				this.tryNewDirectionTimer = 40;
			
				nodeDistX = this.owner.posX - (this.path[this.node].x + this.target.posX);
				nodeDistY = this.owner.posY - (this.path[this.node].y + this.target.posY);

			}
		
			// If the target is far away...
		
			if (Math.abs(nodeDistX) > (this.backoffX) * 2 || Math.abs(nodeDistY) > this.backoffY * 1.1)
			{
				// Re-request an attack side
				this.side = 0;
				if (this.politeAttack && "RequestAttackPermission" in this.target)
				{
					this.side = this.target.RequestAttackPermission(this.owner);
					if (this.side === -2)
						this.side = 0;
				}
				
				this.node = this.GetClosestNode();
				this.PickAttackDirection();
				this.tryNewDirectionTimer = 60;
			
				//if (Math.random() > 0.5)
				//	this.AdvanceNode();
			
				nodeDistX = this.owner.posX - (this.path[this.node].x + this.target.posX);
				nodeDistY = this.owner.posY - (this.path[this.node].y + this.target.posY);
			}
		}

		if (!this.tryingAttack)
		{
			if (this.jumpingMovement)
			{
				if (this.jumpTimer < this.jumpTime)
				{
					this.owner.controller.jumpKeyDown();
					this.jumpTimer++;
				}
				else
				{
					this.jumpTimer = 0;
				}
			}
			
			// Approach the nearest node in the hexagon
			if (Math.abs(nodeDistX) > dz)
			{
				if (nodeDistX < 0)
					this.owner.controller.rightKeyDown();
				else
					this.owner.controller.leftKeyDown();
			}
			if (Math.abs(nodeDistY) > dz)
			{
				if (nodeDistY < 0)
					this.owner.controller.downKeyDown();
				else
					this.owner.controller.upKeyDown();
			}
		}
	}
	else
	{
		this.attackTimer += 1;
		
		if (this.attackTimer == 1)
		{
			this.owner.facing = Math.sign(-distX);
		}
		
		if (this.attackTimer >= 15)
		{
			this.attackButton.call(this.owner.controller);
		}
			
		if (this.attackTimer >= this.attackTimerDone)
		{
			this.ended = true;
		}
	}
};

AttackTargetAction.prototype.AdvanceNode = function()
{
	this.node = this.node + this.attackDir;
	while (this.node < 0)
		this.node += this.path.length;
	while (this.node >= this.path.length)
		this.node -= this.path.length;
};

AttackTargetAction.prototype.Complete = function()
{
	this.ended = true;
	
	// Release the hold we have to attack the parent object
	if ("ReleaseAttackPermission" in this.target)
	{
		this.target.ReleaseAttackPermission(this.owner);
	}
};

AttackTargetAction.prototype.Draw = function()
{
	if (debug === 2 && this.target != null && this.path.length > 0)
	{
    	ctx.translate(-this.owner.posX,-this.owner.posY);

		ctx.strokeStyle = "#FF5500";
		ctx.lineWidth = 8.0 / camera.scale;

		for (var i=0; i < this.path.length; i++)
		{
			if (i === this.node)
				ctx.strokeStyle = "#FFFF00";
			else
				ctx.strokeStyle = "#FF5500";
		
			ctx.beginPath();
      		ctx.arc(this.path[i].x + this.target.posX, this.path[i].y + this.target.posY, 15.0 / camera.scale, 0, 2 * Math.PI, false);
      		ctx.stroke();
		}

		ctx.translate(this.owner.posX,this.owner.posY);
	}
};

function HornyKissAction(target)
{
	BasicAction.call(this);
	
	this.target = target;
	this.followDistanceX = 150;
	this.followDistanceY = 0;
	this.followDeadzoneX = 10;
	this.followDeadzoneY = 30;
};

HornyKissAction.prototype.Update = function()
{
	var distX = this.target.posX - this.owner.posX;
	var distY = this.target.posY - this.owner.posY;
	
	// If the owner or target are no longer recruited or dead, bail out of this action
	if (!this.owner.recruited || !this.target.recruited || IsDeadOrDying(this.target) || IsDeadOrDying(this))
	{
		this.ended = true;
		return;
	}
	
	// If close enough to kiss, then kiss
	if (Math.abs(distY) < 30 && Math.abs(distX) < 170)
	{
		// Animation location should be dead center between the two Joes
		var posX = (this.owner.posX + this.target.posX) / 2.0;
		var posY = (this.owner.posY + this.target.posY) / 2.0;
		var posZ = (this.owner.zHeight + this.target.zHeight) / 4.0;
		
		this.owner.Kiss(posX,posY,posZ, this.owner.posX < this.target.posX);
		this.target.Kiss(posX,posY,posZ, this.owner.posX >= this.target.posX);
		this.ended = true;
		return
	}
	

	// If you are closer in X than necessary and on the wrong Y plane, then back off.
	if (Math.abs(distX) < this.followDistanceX-this.followDeadzoneX && Math.abs(distY) > this.followDeadzoneY)
	{
		if (distX < 0)
		{
			this.owner.controller.rightKeyDown();
		}
		else
		{
			this.owner.controller.leftKeyDown();
		}
	}
	else if (Math.abs(distX) > this.followDistanceX+this.followDeadzoneX)
	{
		if (distX - this.followDeadzoneX > 0)
		{
			this.owner.controller.rightKeyDown();
		}
		else if (distX + this.followDeadzoneX < 0)
		{
			this.owner.controller.leftKeyDown();
		}
	}

	if (Math.abs(distY) > this.followDistanceY)
	{
		if (distY + this.followDeadzoneX < 0)
		{
			this.owner.controller.upKeyDown();
			this.kissing = false;
		}
		else if (distY - this.followDeadzoneX > 0)
		{
			this.owner.controller.downKeyDown();
			this.kissing = false;
		}
	}
};

HornyKissAction.prototype.Complete = function()
{
	this.ended = true;
};

// This action ends after leaving a box or a timeout
function AvoidAction(boxToExit)
{
	BasicAction.call(this);
};

// This action does not end and must be cancelled
function PatrolAction(boxToPatrol)
{
	BasicAction.call(this);
};

// This action does not end and must be cancelled
function BasicAttackAction(target, timeout, attackButtonPress)
{
	BasicAction.call(this);
	
	this.target = target;
	this.destX = target.posX;
	this.destY = target.posY;
	
	if(typeof(attackButtonPress)=='undefined') 
		attackButtonPress = 0;
	this.button = attackButtonPress;
	
	if(typeof(timeout)=='undefined') 
		timeout = 240;
	this.timeout = timeout;
};

BasicAttackAction.prototype.Update = function()
{	
	this.timer += 1;
	
	if (this.button === 0)
		this.owner.controller.punchKeyDown();
	else if (this.button === 1)
		this.owner.controller.smokeKeyDown();
	else if (this.button === 2)
		this.owner.controller.grabKeyDown();
	
	if (this.timer > this.timeout && this.timeout !== -1)
	{
		this.ended = true;
	}
};

BasicAttackAction.prototype.Complete = function()
{
	this.ended = true;
};


// This action does not end and must be cancelled
function LeapAttackAction(target)
{
	BasicAction.call(this);
	
	this.target = target;
	this.destX = target.posX;
	this.destY = target.posY;
	this.deadzone = 20;
	this.timeout = 240;
};

LeapAttackAction.prototype.Update = function()
{
	this.timer += 1;
	
	var distX = ((this.destX + this.target.posX) / 2.0) - this.owner.posX;
	var distY = ((this.destY + this.target.posY) / 2.0) - this.owner.posY;
	
	if (this.timer > 20)
		this.owner.controller.jumpKeyDown();
	
	if (Math.abs(distX) > this.deadzone)
	{
		if (distX > 0)
			this.owner.controller.rightKeyDown();
		else if (distX < 0)
			this.owner.controller.leftKeyDown();
	}
	
	if (Math.abs(distY) > this.deadzone)
	{
		if (distY < 0)
			this.owner.controller.upKeyDown();
		else if (distY > 0)
			this.owner.controller.downKeyDown();
	}
	
	// If the jump failed for some reason or completed, end the attack
	if (this.timer > 25 && this.owner.state === States.Walk)
	{
		this.ended = true;
	}
	
	if (this.timer > this.timeout && this.timeout !== -1)
	{
		this.ended = true;
	}
};

LeapAttackAction.prototype.Complete = function()
{
	this.ended = true;
};
