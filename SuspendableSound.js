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

// Suspendable sounds can only be triggered one time simultaneously,
// pause when the game enters a menu, and stop when the game resets

var suspendableSounds = [];

function PauseSuspendableSounds()
{
	for (var i=0; i < suspendableSounds.length; i++)
	{
		suspendableSounds[i].Pause();
	}
}

function ResumeSuspendableSounds()
{
	for (var i=0; i < suspendableSounds.length; i++)
	{
		suspendableSounds[i].Resume();
	}
}

function ClearSuspendableSounds()
{
	var temp = suspendableSounds;
	suspendableSounds = [];
	for (var i=0; i < temp.length; i++)
	{
		temp[i].Stop();
	}
}

function SuspendableSound(name)
{
	this.sound = GlobalResourceLoader.GetSound(name);
	this.source = null;
	this.playTime = 0;
	this.playheadLocation = 0;
	this.playVolume;
};

SuspendableSound.prototype.Play = function(volume, delay, resuming)
{
	if (this.source === null)
	{
		if(typeof(volume)==='undefined') volume = 1.0;
		if(typeof(delay)==='undefined') delay = 0;
		if(typeof(resuming)==='undefined') resuming = false;
		
		if (AudioResource.muted)
		{
			volume = 0;
		}
		
		this.playVolume = volume;
	
		volume *= settings.baseSFXBoost;
	
		var startPoint = 0;
		if (delay < 0)
		{
			startPoint = -delay;
			delay = 0;
		}
	
		var when = audioContext.currentTime + delay;
		this.playTime = when - startPoint;
		this.source = audioContext.createBufferSource(); // Create Sound Source
		this.source.buffer = this.sound.buffer; // Add Buffered Data to Object
		this.source.connect(this.sound.destination); // Connect Sound Source to Output
		this.sound.destination.gain.value = volume;
		this.source.loop = false;
		var thisObj = this;
		
		if (!resuming)
		{
			// Make sure this sound isn't in the suspended list	already	
			var index = suspendableSounds.indexOf(thisObj);
			while (index > -1)
			{
				suspendableSounds.splice(index,1);
				index = suspendableSounds.indexOf(thisObj);
			}
		
			// Add it to the suspended list
			suspendableSounds.push(this);
		}
		
		// When this source ends, remove it from the suspendable sounds list, if it's in there
		this.source.onended = function(event) 
		{
  			thisObj.source = null;
			var index = suspendableSounds.indexOf(thisObj);
			while (index > -1)
			{
				suspendableSounds.splice(index,1);
				index = suspendableSounds.indexOf(thisObj);
			}
		}
		
		this.source.start(when, startPoint);
	}
};

SuspendableSound.prototype.Pause = function()
{
	if (this.source !== null)
	{
		// Unsubscribe from this event for pause
		this.source.onended = null;
		
		// Take note of where the playback progress will be when we resume
		var pauseTime = audioContext.currentTime + (1.0/60);
		this.playheadLocation = pauseTime - this.playTime;
		
		// Stop the sound
		this.source.stop(pauseTime);
	}
};

SuspendableSound.prototype.Resume = function()
{
	if (this.source !== null)
	{
		this.source = null;
		this.Play(this.playVolume, -this.playheadLocation - (1.0/60), true);
	}
};

SuspendableSound.prototype.Stop = function()
{
	if (this.source !== null)
	{
		this.source.stop();
	}
};
