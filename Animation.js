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

function AnimationModel(owner)
{
	this.animations = {};
	this.state = "idle";
	this.scale = 3.0;
	this.owner = owner;
	
	this.prefixes = [];
};

AnimationModel.prototype.Clear = function()
{
	this.animations = {};
	this.state = "idle";
};

AnimationModel.prototype.ApplyPrefix = function(prefix)
{
	for (var i=0; i < this.prefixes.length; i++)
	{
		if (this.prefixes[i] === prefix)
		{
			// Don't add the same prefix twice
			return;
		}
	}
	this.prefixes.push(prefix);
	
	for (var property in this.animations) 
	{
		if (this.animations.hasOwnProperty(property)) 
		{
			this.animations[property].ApplyPrefix(prefix);
		}
	}
};

AnimationModel.prototype.ClearPrefix = function(prefix)
{
	var prefixFound = false;
	for (var i=0; i < this.prefixes.length; i++)
	{
		if (this.prefixes[i] === prefix)
		{
			this.prefixes.splice(i,1);
			prefixFound = true;
			break;
		}
	}
	if (!prefixFound)
		return;
	
	for (var property in this.animations) 
	{
		if (this.animations.hasOwnProperty(property)) 
		{
			this.animations[property].ClearPrefix(prefix);
		}
	}
};

AnimationModel.prototype.AddState = function(stateName, state)
{
	this.animations[stateName] = state;
};

AnimationModel.prototype.ChangeState = function(newState)
{
	if (this.state != newState)
	{
		var lastState = null;
		if (this.animations.hasOwnProperty(this.state))
		{
			lastState = this.animations[this.state];
		}
		
		if (this.animations.hasOwnProperty(newState))
		{
			this.animations[newState].EnterState(this.state,lastState);
		}
		this.state = newState;
	}
};

AnimationModel.prototype.AnimationIsComplete = function(state)
{
	if (this.animations.hasOwnProperty(state))
	{
		return this.animations[state].mainAnimation.done;
	}
	else
	{
		return true;
	}
}

AnimationModel.prototype.AnimationLoopHitEnd = function(state)
{
	if (this.animations.hasOwnProperty(state))
	{
		return this.animations[state].mainAnimation.hitLoopEnd;
	}
	else
	{
		return true;
	}
}

AnimationModel.prototype.Reset = function(state)
{
	if (this.animations.hasOwnProperty(state))
	{
		return this.animations[state].mainAnimation.Reset();
	}
}

AnimationModel.prototype.SetAllPositions = function(state,pos)
{
	if (this.animations.hasOwnProperty(state))
	{
		this.animations[state].SetAllPositions(pos);
	}
}

AnimationModel.prototype.SetDurationInSeconds = function(state,duration)
{
	if (this.animations.hasOwnProperty(state))
	{
		this.animations[state].mainAnimation.SetDurationInSeconds(duration);
	}
}

AnimationModel.prototype.GetDurationInFrames = function(state)
{
	if (this.animations.hasOwnProperty(state))
	{
		return Math.round(1.0 / this.animations[state].mainAnimation.baseRate);
	}
	return 0;
}

AnimationModel.prototype.Draw = function()
{
	this.DrawBase();
	
	var state = null;
	if (this.animations.hasOwnProperty(this.state))
		state = this.animations[this.state];
	else
		state = this.animations["idle"];
		
	for (var i = 0; i < state.decoratorAnimations.length; i++)
		this.DrawDecorator(i);
};

AnimationModel.prototype.GetBaseFrame = function()
{
	var image = null;
	var state = null;
	if (this.animations.hasOwnProperty(this.state))
		state = this.animations[this.state];
	else
		state = this.animations["idle"];
		
	image = state.GetFrame();
	
	return image;
};

AnimationModel.prototype.DrawBase = function()
{
	var image = null;
	var state = null;
	if (this.animations.hasOwnProperty(this.state))
		state = this.animations[this.state];
	else
		state = this.animations["idle"];
		
	image = state.GetFrame();
	
	if (image !== null)
	{
		ctx.globalCompositeOperation = state.mainAnimation.blendMode;
		if (this.owner !== null)
			ctx.globalAlpha=state.mainAnimation.alpha * this.owner.alpha;
		else
			ctx.globalAlpha=state.mainAnimation.alpha;
	
		image.DrawSprite3x(this.owner.effectOffsetX, -this.owner.posZ + this.owner.effectOffsetY, state.GetFlipped());
		
		ctx.globalCompositeOperation = "source-over";
		ctx.globalAlpha=1.0;
	
	}
};

AnimationModel.prototype.DrawDecorator = function(decoratorIndex)
{
	var state = null;
	if (this.animations.hasOwnProperty(this.state))
		state = this.animations[this.state];
	else
		state = this.animations["idle"];

	if (state.decoratorAnimations.length <= decoratorIndex)
		return;
		
	var decoratorImage = null;
	var decoratorOffsetX = 0;
	var decoratorOffsetY = 0;
	var flipped = false;
	
	if (this.animations.hasOwnProperty(this.state))
	{
			decoratorImage = state.decoratorAnimations[decoratorIndex].GetFrame();
			flipped = state.decoratorAnimations[decoratorIndex].GetFlipped();
			if (state.decoratorAnimations[decoratorIndex].useDecoratorOffset)
			{
				var frame = state.GetFrame();
				decoratorOffsetX = state.lastDisplayedFrame.offsetX;
				decoratorOffsetY = state.lastDisplayedFrame.offsetY;
			}
	}
	
	if (decoratorImage !== null)
	{
		ctx.globalCompositeOperation = state.decoratorAnimations[decoratorIndex].blendMode;
		if (this.owner !== null)
			ctx.globalAlpha=state.decoratorAnimations[decoratorIndex].alpha * this.owner.alpha;
		else
			ctx.globalAlpha=state.decoratorAnimations[decoratorIndex].alpha;
		
		decoratorImage.DrawSprite3x((decoratorOffsetX*this.owner.facing)*3.0+this.owner.effectOffsetX,(decoratorOffsetY)*3.0-this.owner.posZ + this.owner.effectOffsetY, flipped);
		
		ctx.globalCompositeOperation = "source-over";
		ctx.globalAlpha=1.0;
	}
};

AnimationModel.prototype.GetState = function()
{
	if (this.animations.hasOwnProperty(this.state))
	{
		return this.animations[this.state];
	}
	else
	{
		return this.animations["idle"];
	}
};

AnimationModel.prototype.GetLastFrameIndex = function()
{
	if (this.animations.hasOwnProperty(this.state))
	{
		return this.animations[this.state].GetLastFrameIndex();
	}
	else
	{
		return this.animations["idle"].GetLastFrameIndex();
	}
};

AnimationModel.prototype.GetLastFrameWasTransition = function()
{
	if (this.animations.hasOwnProperty(this.state))
	{
		return this.animations[this.state].GetLastFrameWasTransition();
	}
	else
	{
		return this.animations["idle"].GetLastFrameWasTransition();
	}
};

AnimationModel.prototype.WasLastFrameActivation = function(frameIndex)
{
	return this.GetLastFrameWasTransition() && this.GetLastFrameIndex() === frameIndex;
};

AnimationModel.prototype.Update = function()
{
	if (this.animations.hasOwnProperty(this.state))
	{
		this.animations[this.state].Update();
	}
};

function AnimationState()
{
	this.mainAnimation = null;
	this.decoratorAnimations = [];
	this.transitions = {};
	this.activeTransition = null;
	this.lastDisplayedFrame = null;
};

AnimationState.prototype.ApplyPrefix = function(prefix)
{
	if (this.mainAnimation !== null)
		this.mainAnimation.ApplyPrefix(prefix)
	for (var i=0; i < this.decoratorAnimations.length; i++) 
	{
		this.decoratorAnimations[i].ApplyPrefix(prefix);
	}
	
	for (var transition in this.transitions) 
	{
 		if( this.transitions.hasOwnProperty( transition ) ) 
 		{
 			this.transitions[transition].ApplyPrefix(prefix);
  		}
  	}
};

AnimationState.prototype.ClearPrefix = function(prefix)
{
	if (this.mainAnimation !== null)
		this.mainAnimation.ClearPrefix(prefix)
		
	for (var i=0; i < this.decoratorAnimations.length; i++) 
	{
		this.decoratorAnimations[i].ClearPrefix(prefix);
	}
	
	for (var transition in this.transitions) 
	{
 		if( this.transitions.hasOwnProperty( transition ) ) 
 		{
 			this.transitions[transition].ClearPrefix(prefix);
  		}
  	}
};

AnimationState.prototype.Update = function()
{
	for (var i = 0; i < this.decoratorAnimations.length; i++)
	{
		this.decoratorAnimations[i].Update();
	}
	
	// If we are not in a transition...
	if (this.activeTransition == null)
	{
		// Update the main animation
		this.mainAnimation.Update();
	}
	else
	{
		// If the transition animation is complete, reset the main animation and use it next time.
		if (this.transitions[this.activeTransition].done)
		{
			this.mainAnimation.Reset(0);
			this.activeTransition = null;
		}
		// Otherwise update the transition animation
		else
		{
			// Update the transition animation
			this.transitions[this.activeTransition].Update();
		}
	}
};

AnimationState.prototype.SetMainAnimation = function(animation)
{
	this.mainAnimation = animation;
};

AnimationState.prototype.AddTransitionAnimation = function(stateName, animation)
{
	this.transitions[stateName] = animation;
};

AnimationState.prototype.AddDecoratorAnimation = function(animation)
{
	this.decoratorAnimations.push(animation);
};

AnimationState.prototype.SetAllPositions = function(position)
{
	this.mainAnimation.position = position;
	for (var i=0; i < this.decoratorAnimations.length; i++)
	{
			this.decoratorAnimations[i].position = position;
	}
}

AnimationState.prototype.GetFlipped = function()
{
	// If we are not in a transition...
	if (this.activeTransition == null)
	{
		return this.mainAnimation.GetFlipped();
	}
	else //if (this.transitions.hasOwnProperty(this.activeTransition))
	{
		return this.transitions[this.activeTransition].GetFlipped();
	}
};

AnimationState.prototype.GetFrame = function()
{
	// If we are not in a transition...
	if (this.activeTransition == null)
	{
		var img = this.mainAnimation.GetFrame();
		this.lastDisplayedFrame = this.mainAnimation.lastDisplayedFrame;
		return img;
	}
	else //if (this.transitions.hasOwnProperty(this.activeTransition))
	{
		var img = this.transitions[this.activeTransition].GetFrame();
		this.lastDisplayedFrame = this.transitions[this.activeTransition];
		return img;
	}
};

AnimationState.prototype.GetLastFrameIndex = function()
{
	return this.mainAnimation.lastDisplayedFrameIndex;
};

AnimationState.prototype.GetLastFrameWasTransition = function()
{
	return this.mainAnimation.lastFrameWasTransition;
};

AnimationState.prototype.GetAnimation = function()
{
	// If we are not in a transition...
	if (this.activeTransition == null)
	{
		return this.mainAnimation;
	}
	else //if (this.transitions.hasOwnProperty(this.activeTransition))
	{
		return this.transitions[this.activeTransition];
	}
};

AnimationState.prototype.EnterState = function(lastStateName, lastState)
{	
	var lastPosition = 0;
	if(lastState !== null)
	{
		if (lastState.mainAnimation.sendPosition)
			lastPosition = lastState.mainAnimation.position;
	}
	
	if (this.transitions.hasOwnProperty(lastStateName))
	{
		this.activeTransition = lastStateName;
		this.transitions[this.activeTransition].Reset(lastPosition);
	}
	else
	{
		this.activeTransition = null;
		this.mainAnimation.Reset(lastPosition);
	}
	
	// If this state has decorator animations (and they not shared with the last state), reset them.
	for (var i=0; i < this.decoratorAnimations.length; i++)
	{
		if (lastState !== null && lastState.decoratorAnimations.length > i)
		{
			if (lastState.decoratorAnimations[i] !== this.decoratorAnimations[i])
				this.decoratorAnimations[i].Reset(lastPosition);
		}
		else
		{
			this.decoratorAnimations[i].Reset(lastPosition);
		}
	}
	
};

// Transition loops are copies of, for example, the walk loop. They are one-shots animations
// that start in the same place as the loop, then zip to a target frame, frontwards or backwards
// whichever is faster, to smoothly push the loop into the optimal frame to transition.

function Animation(owner, name, lastFrameID, loopTime, repeat)
{
	// In repeat modes 1 and 2, this indicates where the loop starts
	this.loopStartPosition = 0.0;
	this.loopEndPosition = 1.0;
	this.hitLoopEnd = false;
	
	this.endFrame = false;
	this.startFrame = false;
	
	this.endPosition = 0;  // Used only while building animations, before normalization
	
	// 0 = Disabled, 1 = Owner velocity
	this.dynamicRate = 0;
	// 0 = Always normal orientation, 1 = Flip horizontal when facing left, 2 = Flip horizontal when facing right, 3 = always flipped
	this.inheritFacing = 0;
	// Multiplied by the dynamic rate to get animation advance per frame
	this.baseRate = (1.0 / 240.0);
	// Max rate is the highest 
	this.maxRate = (1.0 / 60.0);
	this.frames = [];
	// 0.0 = start of animation, 1.0 = end of animation
	this.position = 0;
	// 0 = always start at position 0, 1 = start lastPos, 2 = start at 1-lastPos
	this.matchPosition = 0;
	this.sendPosition = true;
	this.done = 0;
	this.owner = owner;
	this.direction = 1;
	this.flippedFrames = false;
	this.scale = 3.0;
	this.useDecoratorOffset = true;
	
	this.alpha = 1.0;
	this.blendMode = "source-over";
	
	this.lastDisplayedFrame = null;
	this.lastDisplayedFrameIndex = 0;
	this.lastFrameWasTransition = true;
	this.lastPosition = -1;
	
	
	// Let's check if this is being called with the slick one-line animation definition parameters
	// new Animation(owner, name, lastFrameID, loopTime)
	if (arguments.length >= 4)
	{
		if(typeof(repeat)==='undefined') repeat = 1;
			
		this.AddSequentialFrames(name, 1, lastFrameID);
		this.SetDurationInSeconds(loopTime);
	}
	else if (arguments.length == 2)
	{
		this.AddFrame(name);
		this.SetDurationInSeconds(1.0);
	}
	
	// 0 = One-shot, 1 = Loop, 2 = Bounce, 3 = Complete Loop
	if(typeof(repeat)==='undefined') repeat = 0;
	this.repeat = repeat;
	
	this.prefixes = [];
};

Animation.prototype.Clone = function()
{
	var clone = new Animation(this.owner);
	clone.repeat = this.repeat;
	clone.loopStartPosition = this.loopStartPosition;
	clone.loopEndPosition = this.loopEndPosition;
	clone.hitLoopEnd = this.hitLoopEnd;
	clone.endFrame = this.endFrame;
	clone.startFrame = this.startFrame;
	clone.dynamicRate = this.dynamicRate;
	clone.inheritFacing = this.inheritFacing;
	clone.baseRate = this.baseRate;
	clone.maxRate = this.maxRate;
	clone.frames = this.frames;
	clone.position = this.position;
	clone.matchPosition = this.matchPosition;
	clone.sendPosition = this.sendPosition;
	clone.done = this.done;
	clone.direction = this.direction;
	clone.flippedFrames = this.flippedFrames;
	clone.scale = this.scale;
	clone.useDecoratorOffset = this.useDecoratorOffset;
	clone.alpha = this.alpha;
	clone.blendMode = this.blendMode;
	clone.lastDisplayedFrame = this.lastDisplayedFrame;
	clone.lastDisplayedFrameIndex = this.lastDisplayedFrameIndex;
	clone.lastFrameWasTransition = this.lastFrameWasTransition;
	clone.lastPosition = this.lastPosition;
	return clone;
};

Animation.prototype.ApplyPrefix = function(prefix)
{
	for (var i=0; i < this.prefixes.length; i++)
	{
		if (this.prefixes[i] === prefix)
		{
			return;
		}
	}
	this.prefixes.push(prefix);
	
	for (var i=0; i < this.frames.length; i++) 
	{
		if (this.frames[i].image !== null)
		{	
			var path, name;
			var pathDelim = this.frames[i].name.indexOf('/');
			if (pathDelim !== -1)
			{
				path = this.frames[i].name.substr(0,pathDelim + 1);
				name = this.frames[i].name.substr(pathDelim + 1, this.frames[i].name.length - pathDelim - 1);
			}
			else
			{
				path = "";
				name = this.frames[i].name;
			}
			
			var newname = path + prefix + "_" + name;
			if (GlobalResourceLoader.IsSpriteLoaded(newname))
			{
				var newframe = GlobalResourceLoader.GetSprite(newname);
				this.frames[i].name = newname;
				this.frames[i].image = newframe;
			}
		}
	}
};

Animation.prototype.ClearPrefix = function(prefix)
{
	var prefixFound = false;
	for (var i=0; i < this.prefixes.length; i++)
	{
		if (this.prefixes[i] === prefix)
		{
			this.prefixes.splice(i,1);
			prefixFound = true;
			break;
		}
	}
	if (!prefixFound)
		return;
	
	for (var i=0; i < this.frames.length; i++) 
	{
		// Don't bother screwing with null frames
		if (this.frames[i].image !== null)
		{	
		
			var path, name;
			var pathDelim = this.frames[i].name.indexOf('/');
			if (pathDelim !== -1)
			{
				path = this.frames[i].name.substr(0,pathDelim + 1);
				name = this.frames[i].name.substr(pathDelim + 1, this.frames[i].name.length - pathDelim - 1);
			}
			else
			{
				path = "";
				name = this.frames[i].name;
			}
			
			
			// Determine if this frame has this prefix
			if (name.indexOf(prefix + "_") !== -1)
			{
				
				
				var prefixDelimIndex = name.indexOf(prefix + "_");
				
				
				// If it does have a prefix, try to remove it
				if (prefixDelimIndex !== -1)
				{
					
					var newname = path + 
								  name.substr(0,prefixDelimIndex) +
								  name.substr(prefixDelimIndex+1+prefix.length);

					if (GlobalResourceLoader.IsSpriteLoaded(newname))
					{
						var newframe = GlobalResourceLoader.GetSprite(newname);
						this.frames[i].name = newname;
						this.frames[i].image = newframe;
					}
				
				}
			}
		}
	}
};

Animation.prototype.AddSequentialFrames = function(name,start,stop,offsetX,offsetY)
{
	if(typeof(offsetX)==='undefined') offsetX = 0.0;
	if(typeof(offsetY)==='undefined') offsetY = 0.0;
	
	if (start > stop)
	{
		for (var i=start; i >= stop; i--)
		{
			this.AddFrame(String.format(name, i.toString()),offsetX,offsetY);
		}
	}
	else
	{
		for (var i=start; i <= stop; i++)
		{
			this.AddFrame(String.format(name, i.toString()),offsetX,offsetY);
		}
	}
};

Animation.prototype.AddFrameAtFramerate = function(name,fps,offsetX,offsetY)
{
	if(typeof(offsetX)==='undefined') offsetX = 0.0;
	if(typeof(offsetY)==='undefined') offsetY = 0.0;

	this.frames.push({"image":GlobalResourceLoader.GetSprite(name), "position":this.endPosition, "offsetX":offsetX, "offsetY":offsetY, "name":name});	
	this.endPosition += (60.0 / fps);
}

Animation.prototype.AddSequentialFramesAtFramerate = function(name,start,stop,fps,offsetX,offsetY)
{
	if(typeof(offsetX)==='undefined') offsetX = 0.0;
	if(typeof(offsetY)==='undefined') offsetY = 0.0;

	if (start > stop)
	{
		for (var i=start; i >= stop; i--)
			this.AddFrameAtFramerate(String.format(name, i.toString()), fps, offsetX, offsetY);	
	}
	else
	{
		for (var i=start; i <= stop; i++)
			this.AddFrameAtFramerate(String.format(name, i.toString()), fps, offsetX, offsetY);	
	}
};

Animation.prototype.NormalizeAnimationTiming = function()
{
	this.baseRate = (1.0 / this.endPosition);
	
	for (var i=0; i < this.frames.length; i++)
	{
		this.frames[i].position = this.frames[i].position / this.endPosition;
	}
};



Animation.prototype.AddFrame = function(name,offsetX,offsetY)
{
	if(typeof(offsetX)==='undefined') offsetX = 0.0;
	if(typeof(offsetY)==='undefined') offsetY = 0.0;
	this.frames.push({"image":GlobalResourceLoader.GetSprite(name), "position":0, "offsetX":offsetX, "offsetY":offsetY, "name":name});	
	
	// Re-space frames
	for (var i=0; i < this.frames.length; i++)
	{
		this.frames[i].position = (i/this.frames.length);
	}
};

Animation.prototype.AddTimedFrame = function(name,time,offsetX,offsetY)
{
	if(typeof(offsetX)==='undefined') offsetX = 0.0;
	if(typeof(offsetY)==='undefined') offsetY = 0.0;
	var durationInSeconds = (1.0 / (60.0 * this.baseRate));
	var frame = {"image":GlobalResourceLoader.GetSprite(name), "position":time / durationInSeconds, "offsetX":offsetX, "offsetY":offsetY, "name":name};
	this.frames.push(frame);
};

Animation.prototype.AddSequentialTimedFrames = function(name,start,stop,startTime,intervalTime,offsetX,offsetY)
{
	if(typeof(offsetX)==='undefined') offsetX = 0.0;
	if(typeof(offsetY)==='undefined') offsetY = 0.0;
	
	if (start > stop)
	{
		for (var i=start; i >= stop; i--)
		{
			this.AddTimedFrame(String.format(name, i.toString()),startTime,offsetX,offsetY);
			startTime += intervalTime;
		}
	}
	else
	{
		for (var i=start; i <= stop; i++)
		{
			this.AddTimedFrame(String.format(name, i.toString()),startTime,offsetX,offsetY);
			startTime += intervalTime;
		}
	}
};

// Change the duration of the animation without changing frame timing
Animation.prototype.SetDurationInSecondsWithoutRetime = function(time)
{
	// First, figure out how long the new duration is in terms of multiplication
	var durationInSeconds = (1.0 / (60.0 * this.baseRate));
	
	this.baseRate = this.baseRate * (durationInSeconds / time);
	

	// Re-space the existing frames
	for (var i=0; i < this.frames.length; i++)
	{
		this.frames[i].position = this.frames[i].position * (durationInSeconds / time);
	}
};

Animation.prototype.SetLoopByPosition = function(startFrame,endFrame)
{
	this.loopStartPosition = startFrame;
	this.loopEndPosition = endFrame;
};

Animation.prototype.SetLoopByFrame = function(startFrame,endFrame)
{
	this.loopStartPosition = 0.0;
	this.loopEndPosition = 1.0;

	if (this.frames.length > startFrame && startFrame >= 0)
	{
		this.loopStartPosition = this.frames[startFrame].position;
	}
	
	if(typeof(endFrame)!=='undefined')
	{
		if (this.frames.length > endFrame+1 && endFrame+1 >= 0)
		{
			this.loopEndPosition = this.frames[endFrame+1].position;
		}
	}
};

Animation.prototype.HoldFrame = function(name, holdframes, offsetX,offsetY)
{
	if(typeof(offsetX)==='undefined') offsetX = 0.0;
	if(typeof(offsetY)==='undefined') offsetY = 0.0;
	for (var i=0; i < holdframes; i++)
	{
		this.AddFrame(name, offsetX,offsetY)
	}
}

Animation.prototype.AddBlankFrame = function(offsetX,offsetY)
{
	if(typeof(offsetX)==='undefined') offsetX = 0.0;
	if(typeof(offsetY)==='undefined') offsetY = 0.0;
	this.frames.push({"image":null, "position":0, "offsetX":offsetX, "offsetY":offsetY, "name":null});
	
	// Re-space frames
	for (var i=0; i < this.frames.length; i++)
	{
		this.frames[i].position = (i/this.frames.length);
	}
}

Animation.prototype.AddBlankFrames = function(numFrames,offsetX,offsetY)
{
	if(typeof(offsetX)==='undefined') offsetX = 0.0;
	if(typeof(offsetY)==='undefined') offsetY = 0.0;
	for (var i=0; i < numFrames; i++)
	{
		this.AddBlankFrame(offsetX,offsetY);
	}
}

// SetPosition allows frame retiming but note AddFrame will overwrite any changes you make
Animation.prototype.SetPosition = function(index,position)
{
	this.frames[index].position = position;
};
Animation.prototype.SetDecoratorOffset = function(index,offsetX,offsetY)
{
	this.frames[index].offsetX = offsetX;
	this.frames[index].offsetY = offsetY;
};

Animation.prototype.SetDurationInSeconds = function(durationInSeconds)
{
	this.baseRate = (1.0 / (60.0 * durationInSeconds));
};

Animation.prototype.SetDurationByFramerate = function(framerate)
{
	this.baseRate = (1.0 / this.frames.length) * (framerate / 60.0);
};

Animation.prototype.MatchFramerate = function(otherAnimation)
{
	this.baseRate = (otherAnimation.frames.length / this.frames.length) * otherAnimation.baseRate;
};

Animation.prototype.Update = function()
{
	this.endFrame = false;
	this.startFrame = false;
	var stepSize = 0;
	
	if (this.dynamicRate == 0)
	{
		stepSize = this.baseRate;
	}
	else
	{
		stepSize = this.baseRate * this.owner.Speed();
	}
	
	this.position += (stepSize * this.direction);
	
	if (this.repeat == 0)
	{
		if (this.position > 1.0)
		{
			this.position = 1.0;
			this.done = true;
		}
		else if (this.position < 0)
		{
			this.position = 0.0;
			this.done = true;
		}
	}
	else if (this.repeat == 1)
	{
		while (this.position > this.loopEndPosition)
		{
			this.hitLoopEnd = true;
			this.position -= (this.loopEndPosition - this.loopStartPosition);
			this.endFrame = true;
			this.startFrame = true;
		}
	}
	else if (this.repeat == 2)
	{
		if (this.position > this.loopEndPosition)
		{
			this.hitLoopEnd = true;
			this.position -= (this.position - 1.0);
			this.direction = -1.0;
			this.endFrame = true;
		}
		else if (this.hitLoopEnd && this.position < this.loopStartPosition)
		{
			this.position = this.loopStartPosition - this.position + this.loopStartPosition;
			this.direction = 1.0;
			this.startFrame = true;
		}
		else if (this.position < 0)
		{
			this.position = -this.position;
			this.direction = 1.0;
		}
	}
	else if (this.repeat == 3)
	{
		// Check if we are done
		if (this.direction == 1.0 && this.position >= 1.0)
		{
			this.done = true;
		}
		else if (this.direction == -1.0 && this.position <= 0.0)
		{
			this.done = true;
		}
		
		// Rectify position
		if (this.position > 1.0)
		{
			while (this.position > 1.0)
			{
				this.position -= 1.0;
			}
		}
		else
		{
			while (this.position < 0.0)
			{
				this.position += 1.0;
			}
		}
	}
};

Animation.prototype.GetFlipped = function()
{
	return ((this.inheritFacing === 1 && this.owner.facing === -1) || (this.inheritFacing === 2 && this.owner.facing === 1) || (this.inheritFacing === 3));
}

Animation.prototype.GetFrame = function()
{		
	if (this.position === this.lastPosition)
	{
		return this.lastDisplayedFrame.image;
	}
	

	// This is stupidly inefficient too
	var lastFrame = this.frames[0];
	var lastFrameIndex = 0;
	for (var i=0; i < this.frames.length; i++)
	{
		if (this.frames[i].position > this.position)
			break;
		lastFrame = this.frames[i];
		lastFrameIndex = i;
	}
	
	this.lastDisplayedFrame = lastFrame;
	if (lastFrameIndex !== this.lastDisplayedFrameIndex)
	{
		this.lastDisplayedFrameIndex = lastFrameIndex;
		this.lastFrameWasTransition = true;
	}
	else
	{
		this.lastFrameWasTransition = false;
	}
	
	this.lastPosition = this.position;
	
	return lastFrame.image;
};

Animation.prototype.Reset = function(position)
{
	if(typeof(position)==='undefined') position = 0.0;
	this.done = false;
	this.hitLoopEnd = false;

	this.lastDisplayedFrameIndex = 0;
	this.lastFrameWasTransition = true;
	
	if (this.matchPosition == 1)
		this.position = position;
	else if (this.matchPosition == 0)
		this.position = 0;
	else if (this.matchPosition == 2)
		this.position = 1.0-position;
	
	// If this is a complete loop, find the quickest direction towards the target...
	if (this.repeat == 3)
	{
		if (position > 0.5)
			this.direction = 1.0;
		else
			this.direction = -1.0;
	}
	else
	{
		this.direction = 1.0;
	}
};