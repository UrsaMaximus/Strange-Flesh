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

function PlayerInputController()
{
	Controller.call(this);
	
	this.bindingKey = false;
	this.keyToBind = -1;
	
	this.oneShotCallback = null;
	
	// Reset buttons
	this.upButtonMonitor = new GamepadButtonMonitor(0, 12, controller, 0, PlayerInputController.prototype.upKeyUp, PlayerInputController.prototype.upKeyDown );
	this.downButtonMonitor = new GamepadButtonMonitor(0, 13, controller, 0, PlayerInputController.prototype.downKeyUp, PlayerInputController.prototype.downKeyDown );
	this.leftButtonMonitor = new GamepadButtonMonitor(0, 14, controller, 0, PlayerInputController.prototype.leftKeyUp, PlayerInputController.prototype.leftKeyDown );
	this.rightButtonMonitor = new GamepadButtonMonitor(0, 15, controller, 0, PlayerInputController.prototype.rightKeyUp, PlayerInputController.prototype.rightKeyDown );
	this.punchButtonMonitor = new GamepadButtonMonitor(0, 0, controller, 0, PlayerInputController.prototype.punchKeyUp, PlayerInputController.prototype.punchKeyDown );
	this.smokeButtonMonitor = new GamepadButtonMonitor(0, 1, controller, 0, PlayerInputController.prototype.smokeKeyUp, PlayerInputController.prototype.smokeKeyDown );
	this.grabButtonMonitor = new GamepadButtonMonitor(0, 2, controller, 0, PlayerInputController.prototype.grabKeyUp, PlayerInputController.prototype.grabKeyDown );
	this.specialButtonMonitor = new GamepadButtonMonitor(0, 4, controller, 0, PlayerInputController.prototype.specialKeyUp, PlayerInputController.prototype.specialKeyDown );
	this.jumpButtonMonitor = new GamepadButtonMonitor(0, 3, controller, 0, PlayerInputController.prototype.jumpKeyUp, PlayerInputController.prototype.jumpKeyDown );
	this.startButtonMonitor = new GamepadButtonMonitor(0, 9, controller, 0, PlayerInputController.prototype.startKeyUp, PlayerInputController.prototype.startKeyDown );
	//this.resetBindings();
	
	this.usePermBindings = true;
};

PlayerInputController.prototype.resetBindings = function()
{	
	// Reset Keys
	settings.upKeyCode = 87;
	settings.downKeyCode = 83;
	settings.leftKeyCode = 65;
	settings.rightKeyCode = 68;
	settings.punchKeyCode = 74;
	settings.smokeKeyCode = 75;
	settings.grabKeyCode = 76;
	settings.specialKeyCode = 186;
	settings.jumpKeyCode = 32;
	settings.startKeyCode = 13;

	saveSettings();
};

PlayerInputController.prototype.keyDown = function(evt)
{
	if (this.oneShotCallback !== null)
	{
		this.oneShotCallback(evt);
		this.oneShotCallback = null;
		return;
	}
	
	if (this.bindingKey)
	{
		if (evt.keyCode === 27)
		{
			// Cancel the binding
			this.bindingKey = false;
			this.keyToBind = -1;
			return;
		}
		else if (this.keyToBind === 0)
		{
			if (evt.keyCode !== 37 && /*evt.keyCode !== 38 &&*/ evt.keyCode !== 39 && evt.keyCode !== 40 && evt.keyCode !== 13)
				settings.upKeyCode = evt.keyCode;
		}
		else if (this.keyToBind === 1)
		{
			if (evt.keyCode !== 37 && evt.keyCode !== 38 && evt.keyCode !== 39 && /*evt.keyCode !== 40 &&*/ evt.keyCode !== 13)
				settings.downKeyCode = evt.keyCode;
		}
		else if (this.keyToBind === 2)
		{
			if (/*evt.keyCode !== 37 && */ evt.keyCode !== 38 && evt.keyCode !== 39 && evt.keyCode !== 40 && evt.keyCode !== 13)
				settings.leftKeyCode = evt.keyCode;
		}
		else if (this.keyToBind === 3)
		{
			if (evt.keyCode !== 37 && evt.keyCode !== 38 && /*evt.keyCode !== 39 &&*/ evt.keyCode !== 40 && evt.keyCode !== 13)
				settings.rightKeyCode = evt.keyCode;
		}
		else if (this.keyToBind === 8)
		{
			if (evt.keyCode !== 37 && evt.keyCode !== 38 && evt.keyCode !== 39 && evt.keyCode !== 40 /*&& evt.keyCode !== 13*/)
				settings.startKeyCode = evt.keyCode;
		}
		if (evt.keyCode === 37 || evt.keyCode === 38 || evt.keyCode === 39 || evt.keyCode === 40 || evt.keyCode === 13)
		{
			// Arrows and Enter cannot be reassigned to other keys
		}
		else if (this.keyToBind === 4)
		{
			settings.punchKeyCode = evt.keyCode;
		}
		else if (this.keyToBind === 5)
		{
			settings.smokeKeyCode = evt.keyCode;
		}
		else if (this.keyToBind === 6)
		{
			settings.grabKeyCode = evt.keyCode;
		}
		else if (this.keyToBind === 9)
		{
			settings.specialKeyCode = evt.keyCode;
		}
		else if (this.keyToBind === 7)
		{
			settings.jumpKeyCode = evt.keyCode;
		}

		this.bindingKey = false;
		this.keyToBind = -1;
		return;
	}
	
	if (evt.keyCode == settings.downKeyCode || (this.usePermBindings && evt.keyCode == 40)) // Arrow down = move down
	{
		this.downKeyDown();
	}
	if (evt.keyCode == settings.leftKeyCode || (this.usePermBindings && evt.keyCode == 37))	 // A or left = Move left
	{
		this.leftKeyDown();
	}
	if (evt.keyCode == settings.upKeyCode || (this.usePermBindings && evt.keyCode == 38))	// W or up = move up
	{
		this.upKeyDown();
	}
	if (evt.keyCode == settings.rightKeyCode || (this.usePermBindings && evt.keyCode == 39))	// D or right arrow = Move right
	{
		this.rightKeyDown();
	}
	if (evt.keyCode == settings.punchKeyCode)	// J = punch
	{
		this.punchKeyDown();
	}
	if (evt.keyCode == settings.smokeKeyCode)	// K = kick
	{
		this.smokeKeyDown();
	}
	if (evt.keyCode == settings.grabKeyCode)	// L = special
	{
		this.grabKeyDown();
	}
	if (evt.keyCode == settings.specialKeyCode)	// L = special
	{
		this.specialKeyDown();
	}
	if (evt.keyCode == settings.jumpKeyCode)	// Spacebar
	{
		this.jumpKeyDown();		
	}
	if (evt.keyCode == settings.startKeyCode || (this.usePermBindings && evt.keyCode == 13))	// Enter = start
	{
		this.startKeyDown();
	}
	controller.anyKeyDown();
};

PlayerInputController.prototype.keyUp = function(evt)
{	
	if (evt.keyCode == settings.downKeyCode || evt.keyCode == 40) // S or arrow down = duck
	{
		controller.downKeyUp();
	}
	if (evt.keyCode == settings.leftKeyCode || evt.keyCode == 37)	 // A or left = Move left
	{
		controller.leftKeyUp();
	}
	if (evt.keyCode == settings.upKeyCode || evt.keyCode == 38)	// W or up = jump
	{
		controller.upKeyUp();
	}
	if (evt.keyCode == settings.rightKeyCode || evt.keyCode == 39)	// D or right arrow = Move right
	{
		controller.rightKeyUp();
	}
	if (evt.keyCode == settings.punchKeyCode)	// J = punch
	{
		controller.punchKeyUp();
	}
	if (evt.keyCode == settings.smokeKeyCode)	// K = kick
	{
		controller.smokeKeyUp();
	}
	if (evt.keyCode == settings.grabKeyCode)	// L = special
	{
		controller.grabKeyUp();
	}
	if (evt.keyCode == settings.specialKeyCode)	// L = special
	{
		controller.specialKeyUp();
	}
	if (evt.keyCode == settings.jumpKeyCode)	// Spacebar
	{
		controller.jumpKeyUp();
	}
	if (evt.keyCode == settings.startKeyCode || evt.keyCode == 13)	// Enter = start
	{
		controller.startKeyUp();
	}
	controller.anyKeyUp();
};

// Key binding functions
PlayerInputController.prototype.getUpKeyName = function()
{
	return getStringFromKeyCode(settings.upKeyCode);
};
PlayerInputController.prototype.getDownKeyName = function()
{
	return getStringFromKeyCode(settings.downKeyCode);
};
PlayerInputController.prototype.getLeftKeyName = function()
{
	return getStringFromKeyCode(settings.leftKeyCode);
};
PlayerInputController.prototype.getRightKeyName = function()
{
	return getStringFromKeyCode(settings.rightKeyCode);
};
PlayerInputController.prototype.getPunchKeyName = function()
{
	return getStringFromKeyCode(settings.punchKeyCode);
};
PlayerInputController.prototype.getSmokeKeyName = function()
{
	return getStringFromKeyCode(settings.smokeKeyCode);
};
PlayerInputController.prototype.getGrabKeyName = function()
{
	return getStringFromKeyCode(settings.grabKeyCode);
};
PlayerInputController.prototype.getSpecialKeyName = function()
{
	return getStringFromKeyCode(settings.specialKeyCode);
};
PlayerInputController.prototype.getJumpKeyName = function()
{
	return getStringFromKeyCode(settings.jumpKeyCode);
};
PlayerInputController.prototype.getStartKeyName = function()
{
	return getStringFromKeyCode(settings.startKeyCode);
};

PlayerInputController.prototype.getUpButtonName = function()
{
	return this.upButtonMonitor.getName();
};
PlayerInputController.prototype.getDownButtonName = function()
{
	return this.downButtonMonitor.getName();
};
PlayerInputController.prototype.getLeftButtonName = function()
{
	return this.leftButtonMonitor.getName();
};
PlayerInputController.prototype.getRightButtonName = function()
{
	return this.rightButtonMonitor.getName();
};
PlayerInputController.prototype.getPunchButtonName = function()
{
	return this.punchButtonMonitor.getName();
};
PlayerInputController.prototype.getSmokeButtonName = function()
{
	return this.smokeButtonMonitor.getName();
};
PlayerInputController.prototype.getGrabButtonName = function()
{
	return this.grabButtonMonitor.getName();
};
PlayerInputController.prototype.getSpecialButtonName = function()
{
	return this.specialButtonMonitor.getName();
};
PlayerInputController.prototype.getJumpButtonName = function()
{
	return this.jumpButtonMonitor.getName();
};
PlayerInputController.prototype.getStartButtonName = function()
{
	return this.startButtonMonitor.getName();
};

PlayerInputController.prototype.bindUpKey = function()
{
	// You cannot bind two keys at once
	if (this.bindingKey)
		return;
		
	// Mark the key as being bound
	this.bindingKey = true;
	
	// Set something to say which key is being bound
	this.keyToBind = 0;
};

PlayerInputController.prototype.bindDownKey = function()
{
	// You cannot bind two keys at once
	if (this.bindingKey)
		return;
		
	// Mark the key as being bound
	this.bindingKey = true;
	
	// Set something to say which key is being bound
	this.keyToBind = 1;
};

PlayerInputController.prototype.bindLeftKey = function()
{
	// You cannot bind two keys at once
	if (this.bindingKey)
		return;
		
	// Mark the key as being bound
	this.bindingKey = true;
	
	// Set something to say which key is being bound
	this.keyToBind = 2;
};

PlayerInputController.prototype.bindRightKey = function()
{
	// You cannot bind two keys at once
	if (this.bindingKey)
		return;
		
	// Mark the key as being bound
	this.bindingKey = true;
	
	// Set something to say which key is being bound
	this.keyToBind = 3;
};

PlayerInputController.prototype.bindPunchKey = function()
{
	// You cannot bind two keys at once
	if (this.bindingKey)
		return;
		
	// Mark the key as being bound
	this.bindingKey = true;
	
	// Set something to say which key is being bound
	this.keyToBind = 4;
};

PlayerInputController.prototype.bindSmokeKey = function()
{
	// You cannot bind two keys at once
	if (this.bindingKey)
		return;
		
	// Mark the key as being bound
	this.bindingKey = true;
	
	// Set something to say which key is being bound
	this.keyToBind = 5;
};

PlayerInputController.prototype.bindGrabKey = function()
{
	// You cannot bind two keys at once
	if (this.bindingKey)
		return;
		
	// Mark the key as being bound
	this.bindingKey = true;
	
	// Set something to say which key is being bound
	this.keyToBind = 6;
};

PlayerInputController.prototype.bindSpecialKey = function()
{
	// You cannot bind two keys at once
	if (this.bindingKey)
		return;
		
	// Mark the key as being bound
	this.bindingKey = true;
	
	// Set something to say which key is being bound
	this.keyToBind = 9;
};

PlayerInputController.prototype.bindJumpKey = function()
{
	// You cannot bind two keys at once
	if (this.bindingKey)
		return;
		
	// Mark the key as being bound
	this.bindingKey = true;
	
	// Set something to say which key is being bound
	this.keyToBind = 7;
};

PlayerInputController.prototype.bindStartKey = function()
{
	// You cannot bind two keys at once
	if (this.bindingKey)
		return;
		
	// Mark the key as being bound
	this.bindingKey = true;
	
	// Set something to say which key is being bound
	this.keyToBind = 8;
};

// Inherit all this boilerplate from the standard controller object.
PlayerInputController.prototype.update = Controller.prototype.update;

PlayerInputController.prototype.upKeyUp = Controller.prototype.upKeyUp;
PlayerInputController.prototype.downKeyUp = Controller.prototype.downKeyUp;
PlayerInputController.prototype.leftKeyUp = Controller.prototype.leftKeyUp;
PlayerInputController.prototype.rightKeyUp = Controller.prototype.rightKeyUp;
PlayerInputController.prototype.punchKeyUp = Controller.prototype.punchKeyUp;
PlayerInputController.prototype.smokeKeyUp = Controller.prototype.smokeKeyUp;
PlayerInputController.prototype.grabKeyUp = Controller.prototype.grabKeyUp;
PlayerInputController.prototype.specialKeyUp = Controller.prototype.specialKeyUp;
PlayerInputController.prototype.jumpKeyUp = Controller.prototype.jumpKeyUp;
PlayerInputController.prototype.startKeyUp = Controller.prototype.startKeyUp;
PlayerInputController.prototype.anyKeyUp = Controller.prototype.anyKeyUp;

PlayerInputController.prototype.upKeyDown = Controller.prototype.upKeyDown;
PlayerInputController.prototype.downKeyDown = Controller.prototype.downKeyDown;
PlayerInputController.prototype.leftKeyDown = Controller.prototype.leftKeyDown;
PlayerInputController.prototype.rightKeyDown = Controller.prototype.rightKeyDown;
PlayerInputController.prototype.punchKeyDown = Controller.prototype.punchKeyDown;
PlayerInputController.prototype.smokeKeyDown = Controller.prototype.smokeKeyDown;
PlayerInputController.prototype.grabKeyDown = Controller.prototype.grabKeyDown;
PlayerInputController.prototype.specialKeyDown = Controller.prototype.specialKeyDown;
PlayerInputController.prototype.jumpKeyDown = Controller.prototype.jumpKeyDown;
PlayerInputController.prototype.startKeyDown = Controller.prototype.startKeyDown;
PlayerInputController.prototype.anyKeyDown = Controller.prototype.anyKeyDown;

PlayerInputController.prototype.upActivate = Controller.prototype.upActivate;
PlayerInputController.prototype.downActivate = Controller.prototype.downActivate;
PlayerInputController.prototype.leftActivate = Controller.prototype.leftActivate;
PlayerInputController.prototype.rightActivate = Controller.prototype.rightActivate;
PlayerInputController.prototype.punchActivate = Controller.prototype.punchActivate;
PlayerInputController.prototype.smokeActivate = Controller.prototype.smokeActivate;
PlayerInputController.prototype.grabActivate = Controller.prototype.grabActivate;
PlayerInputController.prototype.specialActivate = Controller.prototype.specialActivate;
PlayerInputController.prototype.jumpActivate = Controller.prototype.jumpActivate;
PlayerInputController.prototype.startActivate = Controller.prototype.startActivate;
PlayerInputController.prototype.anyActivate = Controller.prototype.anyActivate;

PlayerInputController.prototype.upDeactivate = Controller.prototype.upDeactivate;
PlayerInputController.prototype.downDeactivate = Controller.prototype.downDeactivate;
PlayerInputController.prototype.leftDeactivate = Controller.prototype.leftDeactivate;
PlayerInputController.prototype.rightDeactivate = Controller.prototype.rightDeactivate;
PlayerInputController.prototype.punchDeactivate = Controller.prototype.punchDeactivate;
PlayerInputController.prototype.smokeDeactivate = Controller.prototype.smokeDeactivate;
PlayerInputController.prototype.grabDeactivate = Controller.prototype.grabDeactivate;
PlayerInputController.prototype.specialDeactivate = Controller.prototype.specialDeactivate;
PlayerInputController.prototype.jumpDeactivate = Controller.prototype.jumpDeactivate;
PlayerInputController.prototype.startDeactivate = Controller.prototype.startDeactivate;
PlayerInputController.prototype.anyDeactivate = Controller.prototype.anyDeactivate;

PlayerInputController.prototype.upDoubleTap = Controller.prototype.upDoubleTap;
PlayerInputController.prototype.downDoubleTap = Controller.prototype.downDoubleTap;
PlayerInputController.prototype.leftDoubleTap = Controller.prototype.leftDoubleTap;
PlayerInputController.prototype.rightDoubleTap = Controller.prototype.rightDoubleTap;

function GamepadButtonMonitor(gamepadID, index, controller, buttonType, keyUp, keyDown)
{
	this.gamepadID = gamepadID;
	this.index = index;
	this.controller = controller;
	this.buttonType = buttonType;		// 0 = button, 1 = pos axis, 2 = neg axis
	this.keyUp = keyUp;
	this.keyDown = keyDown;
	this.lastState = 0;
};

GamepadButtonMonitor.prototype.getName = function()
{
	if (this.buttonType === 0)
	{
		return "Button " + this.index.toString();
	}
	else if (this.buttonType === 2)
	{
		return "+Axis " + this.index.toString();
	}
	else if (this.buttonType === 3)
	{
		return "-Axis " + this.index.toString();
	}
};

GamepadButtonMonitor.prototype.Update = function()
{
	if (gamepadSupportAvailable)
	{
		var gamepad = navigator.getGamepads()[this.gamepadID];
		if (typeof gamepad !== 'undefined')
		{
			var collection = gamepad.buttons;
			var state = 0;
			if (this.buttonType !== 0)
				collection = gamepad.axes
		
			if (this.index < collection.length)
			{
				if (this.buttonType === 0)
					state = collection[this.index].value;
				else
					state = collection[this.index];
				if (this.buttonType === 2)
				{
					if (this.lastState < -0.5 && state >= -0.5)
					{
						this.keyUp.call(this.controller);
						PlayerInputController.prototype.anyKeyUp.call(this.controller);
					}
					else if (this.lastState >= -0.5 && state < -0.5)
					{
						this.keyDown.call(this.controller);
						PlayerInputController.prototype.anyKeyDown.call(this.controller);
					}
				}
				else
				{
					if (this.lastState > 0.5 && state <= 0.5)
					{
						this.keyUp.call(this.controller);
						PlayerInputController.prototype.anyKeyUp.call(this.controller);
					}
					else if (this.lastState <= 0.5 && state > 0.5)
					{
						this.keyDown.call(this.controller);
						PlayerInputController.prototype.anyKeyDown.call(this.controller);
					}
				}
				this.lastState = state;
			}
		}
	}
};

gamepads = [];

var gamepadSupportAvailable = !!navigator.getGamepads;
if (gamepadSupportAvailable)
{
	var gps = navigator.getGamepads();
	for (var i=0; i<gps.length; i++)
	{
		if (typeof gps[i] !== 'undefined')
			gamepads.push(gps[i]);
	}
}

function gamepadConnected(e)
{
	gamepads.push(event.gamepad);
};

function gamepadDisconnected(e)
{
	listIndex = gamepads.indexOf(e.gamepad);
	if (listIndex !== -1)
		gamepads.splice(listIndex,1);
};

window.addEventListener("gamepadconnected", gamepadConnected);
window.addEventListener("gamepaddisconnected", gamepadDisconnected);