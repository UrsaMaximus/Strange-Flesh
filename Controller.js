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

function Controller(owner)
{
	this.owner = owner;
	
	this.impliedKeyup = false;
	
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
	
	this.special = false;
	this.specialFramesSinceKeydown = 0;
	this.specialFramesSinceKeyup = 1;
	
	this.jump = false;
	this.jumpFramesSinceKeydown = 0;
	this.jumpFramesSinceKeyup = 1;
	
	this.start = false;
	this.startFramesSinceKeydown = 0;
	this.startFramesSinceKeyup = 1;
	
	this.any = false;
	this.anyFramesSinceKeydown = 0;
	this.anyFramesSinceKeyup = 1;
	
	this.upFramesSinceKeydownTry = 1;
	this.downFramesSinceKeydownTry = 1;
	this.leftFramesSinceKeydownTry = 1;
	this.rightFramesSinceKeydownTry = 1;
	this.punchFramesSinceKeydownTry = 1;
	this.smokeFramesSinceKeydownTry = 1;
	this.grabFramesSinceKeydownTry = 1;
	this.specialFramesSinceKeydownTry = 1;
	this.jumpFramesSinceKeydownTry = 1;
	this.startFramesSinceKeydownTry = 1;
};

Controller.prototype.update = function()
{	
	this.upFramesSinceKeydown += 1;
	this.downFramesSinceKeydown += 1;
	this.leftFramesSinceKeydown += 1;
	this.rightFramesSinceKeydown += 1;
	this.punchFramesSinceKeydown += 1;
	this.smokeFramesSinceKeydown += 1;
	this.grabFramesSinceKeydown += 1;
	this.specialFramesSinceKeydown += 1;
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
	this.specialFramesSinceKeyup += 1;
	this.jumpFramesSinceKeyup += 1;
	this.startFramesSinceKeyup += 1;
	this.anyFramesSinceKeyup += 1;
	
	this.upFramesSinceShortTap += 1;
	this.downFramesSinceShortTap += 1;
	this.leftFramesSinceShortTap += 1;
	this.rightFramesSinceShortTap += 1;
	
	// Fire keyup events if a key hasn't been reset this frame
	if (this.impliedKeyup)
	{
		if (this.up && this.upFramesSinceKeydownTry > 0)
			this.upKeyUp();
		if (this.down && this.downFramesSinceKeydownTry > 0)
			this.downKeyUp();
		if (this.left && this.leftFramesSinceKeydownTry > 0)
			this.leftKeyUp();
		if (this.right && this.rightFramesSinceKeydownTry > 0)
			this.rightKeyUp();
		if (this.punch && this.punchFramesSinceKeydownTry > 0)
			this.punchKeyUp();
		if (this.smoke && this.smokeFramesSinceKeydownTry > 0)
			this.smokeKeyUp();
		if (this.grab && this.grabFramesSinceKeydownTry > 0)
			this.grabKeyUp();
		if (this.special && this.specialFramesSinceKeydownTry > 0)
			this.specialKeyUp();
		if (this.jump && this.jumpFramesSinceKeydownTry > 0)
			this.jumpKeyUp();
		if (this.start && this.startFramesSinceKeydownTry > 0)
			this.startKeyUp();
	}
	
	if (this.up)
		this.upFramesSinceKeydownTry += 1;
	if (this.down)
		this.downFramesSinceKeydownTry += 1;
	if (this.left)
		this.leftFramesSinceKeydownTry += 1;
	if (this.right)
		this.rightFramesSinceKeydownTry += 1;
	if (this.punch)
		this.punchFramesSinceKeydownTry += 1;
	if (this.smoke)
		this.smokeFramesSinceKeydownTry += 1;
	if (this.grab)
		this.grabFramesSinceKeydownTry += 1;
	if (this.special)
		this.specialFramesSinceKeydownTry += 1;
	if (this.jump)
		this.jumpFramesSinceKeydownTry += 1;
	if (this.start)
		this.startFramesSinceKeydownTry += 1;
};

Controller.prototype.upKeyUp = function()
{
	this.up = false;
	this.upFramesSinceKeyup = 0;
	if (this.upFramesSinceKeydown <= this.doubleTapFirstPressLength)
		this.upFramesSinceShortTap = 0;
};

Controller.prototype.downKeyUp = function()
{
	this.down = false;
	this.downFramesSinceKeyup = 0;
	if (this.downFramesSinceKeydown <= this.doubleTapFirstPressLength)
		this.downFramesSinceShortTap = 0;
};

Controller.prototype.leftKeyUp = function()
{
	this.left = false;
	this.leftFramesSinceKeyup = 0;
	if (this.leftFramesSinceKeydown <= this.doubleTapFirstPressLength)
		this.leftFramesSinceShortTap = 0;
};

Controller.prototype.rightKeyUp = function()
{
	this.right = false;
	this.rightFramesSinceKeyup = 0;
	if (this.rightFramesSinceKeydown <= this.doubleTapFirstPressLength)
		this.rightFramesSinceShortTap = 0;
};

Controller.prototype.punchKeyUp = function()
{
	this.punch = false;
	this.punchFramesSinceKeyup = 0;
};

Controller.prototype.smokeKeyUp = function()
{
	this.smoke = false;
	this.smokeFramesSinceKeyup = 0;
};

Controller.prototype.grabKeyUp = function()
{
	this.grab = false;
	this.grabFramesSinceKeyup = 0;
};

Controller.prototype.specialKeyUp = function()
{
	this.special = false;
	this.specialFramesSinceKeyup = 0;
};

Controller.prototype.jumpKeyUp = function()
{
	this.jump = false;
	this.jumpFramesSinceKeyup = 0;
};

Controller.prototype.startKeyUp = function()
{
	this.start = false;
	this.startFramesSinceKeyup = 0;
};

Controller.prototype.anyKeyUp = function()
{
	this.any = false;
	this.anyFramesSinceKeyup = 0;
};

Controller.prototype.upKeyDown = function()
{
	if (!this.up)
	{
		this.up = true;
		this.upFramesSinceKeydown = 0;
	}
	this.upFramesSinceKeydownTry = 0;
};

Controller.prototype.downKeyDown = function()
{
	if (!this.down)
	{
		this.down = true;
		this.downFramesSinceKeydown = 0;
	}
	this.downFramesSinceKeydownTry = 0;
};

Controller.prototype.leftKeyDown = function()
{
	if (!this.left)
	{
		this.left = true;
		this.leftFramesSinceKeydown = 0;
	}
	this.leftFramesSinceKeydownTry = 0;
};

Controller.prototype.rightKeyDown = function()
{
	if (!this.right)
	{
		this.right = true;
		this.rightFramesSinceKeydown = 0;
	}
	this.rightFramesSinceKeydownTry = 0;
};

Controller.prototype.punchKeyDown = function()
{
	if (!this.punch)
	{
		this.punch = true;
		this.punchFramesSinceKeydown = 0;
	}
	this.punchFramesSinceKeydownTry = 0;
};

Controller.prototype.smokeKeyDown = function()
{
	if (!this.smoke)
	{
		this.smoke = true;
		this.smokeFramesSinceKeydown = 0;
	}
	this.smokeFramesSinceKeydownTry = 0;
};

Controller.prototype.grabKeyDown = function()
{
	if (!this.grab)
	{
		this.grab = true;
		this.grabFramesSinceKeydown = 0;
	}
	this.grabFramesSinceKeydownTry = 0;
};

Controller.prototype.specialKeyDown = function()
{
	if (!this.special)
	{
		this.special = true;
		this.specialFramesSinceKeydown = 0;
	}
	this.specialFramesSinceKeydownTry = 0;
};

Controller.prototype.jumpKeyDown = function()
{
	if (!this.jump)
	{
		this.jump = true;
		this.jumpFramesSinceKeydown = 0;
	}
	this.jumpFramesSinceKeydownTry = 0;
};

Controller.prototype.startKeyDown = function()
{
	if (!this.start)
	{
		this.start = true;
		this.startFramesSinceKeydown = 0;
	}
	this.startFramesSinceKeydownTry = 0;
};

Controller.prototype.anyKeyDown = function()
{
	if (!this.any)
	{
		this.any = true;
		this.anyFramesSinceKeydown = 0;
	}
};

Controller.prototype.upActivate = function()
{
	return this.up && this.upFramesSinceKeydown == 0;
};

Controller.prototype.downActivate = function()
{
	return this.down && this.downFramesSinceKeydown == 0;
};

Controller.prototype.leftActivate = function()
{
	return this.left && this.leftFramesSinceKeydown == 0;
};

Controller.prototype.rightActivate = function()
{
	return this.right && this.rightFramesSinceKeydown == 0;
};

Controller.prototype.punchActivate = function()
{
	return this.punch && this.punchFramesSinceKeydown == 0;
};

Controller.prototype.smokeActivate = function()
{
	return this.smoke && this.smokeFramesSinceKeydown == 0;
};

Controller.prototype.grabActivate = function()
{
	return this.grab && this.grabFramesSinceKeydown == 0;
};

Controller.prototype.specialActivate = function()
{
	return this.special && this.specialFramesSinceKeydown == 0;
};

Controller.prototype.jumpActivate = function()
{
	return this.jump && this.jumpFramesSinceKeydown == 0;
};

Controller.prototype.startActivate = function()
{
	return this.start && this.startFramesSinceKeydown == 0;
};

Controller.prototype.anyActivate = function()
{
	return this.any && this.anyFramesSinceKeydown == 0;
};

Controller.prototype.upDeactivate = function()
{
	return !this.up && this.upFramesSinceKeyup == 0;
};

Controller.prototype.downDeactivate = function()
{
	return !this.down && this.downFramesSinceKeyup == 0;
};

Controller.prototype.leftDeactivate = function()
{
	return !this.left && this.leftFramesSinceKeyup == 0;
};

Controller.prototype.rightDeactivate = function()
{
	return !this.right && this.rightFramesSinceKeyup == 0;
};

Controller.prototype.punchDeactivate = function()
{
	return !this.punch && this.punchFramesSinceKeyup == 0;
};

Controller.prototype.smokeDeactivate = function()
{
	return !this.punch && this.smokeFramesSinceKeyup == 0;
};

Controller.prototype.grabDeactivate = function()
{
	return !this.grab && this.grabFramesSinceKeyup == 0;
};

Controller.prototype.specialDeactivate = function()
{
	return !this.special && this.specialFramesSinceKeyup == 0;
};

Controller.prototype.jumpDeactivate = function()
{
	return !this.jump && this.jumpFramesSinceKeyup == 0;
};

Controller.prototype.startDeactivate = function()
{
	return !this.start && this.startFramesSinceKeyup == 0;
};

Controller.prototype.anyDeactivate = function()
{
	return !this.any && this.anyFramesSinceKeyup == 0;
};

Controller.prototype.upDoubleTap = function()
{
	return this.upFramesSinceKeydown == 0 && this.upFramesSinceShortTap <= this.doubleTapPressGap;
};

Controller.prototype.downDoubleTap = function()
{
	return this.downFramesSinceKeydown == 0 && this.downFramesSinceShortTap <= this.doubleTapPressGap;
};

Controller.prototype.leftDoubleTap = function()
{
	return this.leftFramesSinceKeydown == 0 && this.leftFramesSinceShortTap <= this.doubleTapPressGap;
};

Controller.prototype.rightDoubleTap = function()
{
	return this.rightFramesSinceKeydown == 0 && this.rightFramesSinceShortTap <= this.doubleTapPressGap;
};