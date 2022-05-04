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
    this.buttonToBind = null;
	
	this.oneShotCallback = null;
	
	// Reset buttons
	this.upButtonMonitor = new GamepadButtonMonitor(0, 12, this, 0, PlayerInputController.prototype.upKeyUp, PlayerInputController.prototype.upKeyDown );
	this.downButtonMonitor = new GamepadButtonMonitor(0, 13, this, 0, PlayerInputController.prototype.downKeyUp, PlayerInputController.prototype.downKeyDown );
	this.leftButtonMonitor = new GamepadButtonMonitor(0, 14, this, 0, PlayerInputController.prototype.leftKeyUp, PlayerInputController.prototype.leftKeyDown );
	this.rightButtonMonitor = new GamepadButtonMonitor(0, 15, this, 0, PlayerInputController.prototype.rightKeyUp, PlayerInputController.prototype.rightKeyDown );
	this.punchButtonMonitor = new GamepadButtonMonitor(0, 0, this, 0, PlayerInputController.prototype.punchKeyUp, PlayerInputController.prototype.punchKeyDown );
	this.smokeButtonMonitor = new GamepadButtonMonitor(0, 1, this, 0, PlayerInputController.prototype.smokeKeyUp, PlayerInputController.prototype.smokeKeyDown );
	this.grabButtonMonitor = new GamepadButtonMonitor(0, 2, this, 0, PlayerInputController.prototype.grabKeyUp, PlayerInputController.prototype.grabKeyDown );
	this.specialButtonMonitor = new GamepadButtonMonitor(0, 4, this, 0, PlayerInputController.prototype.specialKeyUp, PlayerInputController.prototype.specialKeyDown );
	this.jumpButtonMonitor = new GamepadButtonMonitor(0, 3, this, 0, PlayerInputController.prototype.jumpKeyUp, PlayerInputController.prototype.jumpKeyDown );
	this.startButtonMonitor = new GamepadButtonMonitor(0, 9, this, 0, PlayerInputController.prototype.startKeyUp, PlayerInputController.prototype.startKeyDown );
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

    // Controller binds
    this.upButtonMonitor.SetConfig([0, 12, 0]);
    this.downButtonMonitor.SetConfig([0, 13, 0]);
    this.leftButtonMonitor.SetConfig([0, 14, 0]);
    this.rightButtonMonitor.SetConfig([0, 15, 0]);
    this.punchButtonMonitor.SetConfig([0, 0, 0 ]);
    this.smokeButtonMonitor.SetConfig([0, 1, 0 ]);
    this.grabButtonMonitor.SetConfig([0, 2, 0 ]);
    this.specialButtonMonitor.SetConfig([0, 4, 0 ]);
    this.jumpButtonMonitor.SetConfig([0, 3, 0 ]);
    this.startButtonMonitor.SetConfig([0, 9, 0 ]);

	saveSettings();
};

PlayerInputController.prototype.buttonWasBound = function(evt)
{
    if (this.oneShotCallback !== null)
	{
		this.oneShotCallback(evt);
		this.oneShotCallback = null;
		return;
	}
	
    this.bindingKey = false;
    this.keyToBind = -1;
    this.buttonToBind = null;
}

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
        this.buttonToBind.bindMode = false;
        this.buttonToBind = null;
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
    this.buttonToBind = this.upButtonMonitor;
    this.buttonToBind.bindMode = true;
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
    this.buttonToBind = this.downButtonMonitor;
    this.buttonToBind.bindMode = true;
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
    this.buttonToBind = this.leftButtonMonitor;
    this.buttonToBind.bindMode = true;
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
    this.buttonToBind = this.rightButtonMonitor;
    this.buttonToBind.bindMode = true;
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
    this.buttonToBind = this.punchButtonMonitor;
    this.buttonToBind.bindMode = true;
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
    this.buttonToBind = this.smokeButtonMonitor;
    this.buttonToBind.bindMode = true;
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
    this.buttonToBind = this.grabButtonMonitor;
    this.buttonToBind.bindMode = true;
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
    this.buttonToBind = this.specialButtonMonitor;
    this.buttonToBind.bindMode = true;
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
    this.buttonToBind = this.jumpButtonMonitor;
    this.buttonToBind.bindMode = true;
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
    this.buttonToBind = this.startButtonMonitor;
    this.buttonToBind.bindMode = true;
};

// Inherit all this boilerplate from the standard controller object.
PlayerInputController.prototype.update = function()
{
    Controller.prototype.update.call(this);

    this.upButtonMonitor.Update();
	this.downButtonMonitor.Update();
	this.leftButtonMonitor.Update();
	this.rightButtonMonitor.Update();
	this.punchButtonMonitor.Update();
	this.smokeButtonMonitor.Update();
	this.grabButtonMonitor.Update();
	this.specialButtonMonitor.Update();
	this.jumpButtonMonitor.Update();
	this.startButtonMonitor.Update();
};

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
    this.bindMode = false;
};

GamepadButtonMonitor.prototype.getName = function()
{
	if (this.buttonType === 0)
	{
		return "Button " + this.index.toString();
	}
	else if (this.buttonType === 1)
	{
		return "+Axis " + this.index.toString();
	}
	else if (this.buttonType === 2)
	{
		return "-Axis " + this.index.toString();
	}
};

GamepadButtonMonitor.prototype.GetConfig = function()
{
    return [this.gamepadID, this.index, this.buttonType];
}

GamepadButtonMonitor.prototype.SetConfig = function(config)
{
    this.gamepadID = config[0];
    this.index = config[1];
    this.buttonType = config[2];
}

GamepadButtonMonitor.prototype.Update = function()
{
	if (gamepadSupportAvailable)
	{
        if (this.bindMode)
        {
            for (var gamepadID = 0; gamepadID < 4; gamepadID++) 
            {
                var gamepad = navigator.getGamepads()[gamepadID];
                if (gamepad)
                {
                    for (var buttonID = 0; buttonID < gamepad.buttons.length; buttonID++)
                    {
                        if (gamepad.buttons[buttonID].pressed && !this.lastState)
                        {
                            this.bindMode = false;
                            this.gamepadID = gamepadID;
                            this.index = buttonID;
                            this.buttonType = 0;
                            this.lastState == true;
                            this.controller.buttonWasBound({});
                            return;
                        }
                    }

                    for (var buttonID = 0; buttonID < gamepad.axes.length; buttonID++)
                    {
                        if (Math.abs(gamepad.axes[buttonID]) > 0.5)
                        {
                            this.bindMode = false;
                            this.gamepadID = gamepadID;
                            this.index = buttonID;
                            this.buttonType = ((gamepad.axes[buttonID] > 0) ? 1 : 2);
                            this.lastState == Math.abs(gamepad.axes[buttonID]);
                            this.controller.buttonWasBound({});
                            return;
                        }
                    }
                }
            }
        }
        else
        {
            var gamepad = navigator.getGamepads()[this.gamepadID];
            if (gamepad)
            {
                if (this.buttonType == 0)
                {
                    var state = gamepad.buttons[this.index].pressed;
                    if (!this.lastState && state)
                    {
                        this.keyDown.call(this.controller);
                        this.controller.anyKeyDown();
                    }
                    else if (this.lastState && !state)
                    {
                        this.keyUp.call(this.controller);
                        this.controller.anyKeyUp();
                    }
                    this.lastState = state;
                }
                else
                {
                    var state = gamepad.axes[this.index] * ((this.buttonType == 1) ? 1 : -1);
                    if (this.lastState > 0.5 && state <= 0.5)
                    {
                        this.keyUp.call(this.controller);
                        this.controller.anyKeyUp();
                    }
                    else if (this.lastState <= 0.5 && state > 0.5)
                    {
                        this.keyDown.call(this.controller);
                        this.controller.anyKeyDown();
                    }
                    this.lastState = state;
                }
            }
        }
	}
};

var gamepadSupportAvailable = !!navigator.getGamepads;


window.addEventListener("gamepadconnected", gamepadConnected);
window.addEventListener("gamepaddisconnected", gamepadDisconnected);