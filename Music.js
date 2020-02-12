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

// Music bits are queued this many seconds in advance
var musicQueueTime = 0.2;

function Music()
{
	this.playing = false;
	this.volume = -1;
	this.muteVolume = 1;
	this.muted = false;
	this.playStartDelay = 0;
	this.destination = null;
	this.lastQueuedTrack = null;
	this.tracks = {};
	
	this.permitOnlyExplicitTransitions = true;
};

Music.prototype.play = function(delay, fadeIn)
{
	if(typeof(delay)==='undefined') delay = 0.0;
	if(typeof(fadeIn)==='undefined') fadeIn = 0.0;
	
	// If nothing is being played already, then create a new destination
	if (!this.playing && this.tracks.hasOwnProperty(this.selectedTrack))
	{
		this.destination = audioContext.createGain();
		this.destination.connect(audioContext.destination);
		
		this.playStartDelay = delay;
		
		var startTime = audioContext.currentTime + delay;
		var stopTime = startTime + fadeIn;
		if (fadeIn > 0)
		{
			this.destination.gain.setValueAtTime(0.001, audioContext.currentTime);
			this.destination.gain.exponentialRampToValueAtTime(this.volume, stopTime);
		}
		else
		{
			this.destination.gain.value = this.volume;
		}
		
		this.playing = true;
		this.Update();
	}
};

Music.prototype.stop = function(fadeOut, delay)
{
	if(typeof(fadeOut)==='undefined') fadeOut = 0.0;
	if(typeof(delay)==='undefined') delay = 0.0;
	
	// If music is currently playing, stop it.
	if (this.playing)
	{
		this.playing = false;
		if (this.destination !== null)
		{
			var fadeTime = audioContext.currentTime + delay;
			var stopTime = fadeTime + fadeOut;
			if (fadeOut > 0)
			{
				this.destination.gain.setValueAtTime(this.volume, fadeTime);
				this.destination.gain.exponentialRampToValueAtTime(0.001, stopTime);
			}
			this.lastQueuedTrack.source.stop(stopTime);
			this.lastQueuedTrack = null;
			this.destination = null;
		}
	}
};

Music.prototype.changeTrackWithMatching = function(trackName)
{	
	if (this.lastQueuedTrack.segment ===  this.tracks[this.selectedTrack].firstSegment)
	{
		this.tracks[this.selectedTrack].SpliceSegment(this.lastQueuedTrack, this.tracks[trackName],  this.tracks[trackName].firstSegment, this);
		this.selectedTrack = trackName;
	}
	else
	{
		//this.tracks[this.selectedTrack].SpliceSegment(this.lastQueuedTrack, this.tracks[trackName],  this.tracks[trackName].firstSegment.nextSegment, this);
		this.stop(2.0,1.5);
		this.tracks[trackName].firstSegment.skipOnce = true;
		this.selectedTrack = trackName;
		this.play(0.5,2.0);
	}
	
};

Music.prototype.setTrack = function(trackName)
{	
	//if (this.tracks.hasOwnProperty(trackName))
	//{
		this.selectedTrack = trackName;
	//}
};

Music.prototype.setVolume = function(volume, delay)
{
	if(typeof(delay)==='undefined') delay = 0.0;
	
	if (this.volume !== volume)
	{
		//if (delay === 0)
		//	this.destination.gain.cancelScheduledValues(audioContext.currentTime);
	
		this.volume = volume;
		
		if (this.destination != null)
		{
			if (this.muted)
			{
				this.destination.gain.setValueAtTime(0, audioContext.currentTime + delay);
			}
			else
			{
				this.destination.gain.setValueAtTime(this.volume, audioContext.currentTime + delay);
			}
		}
	}
};

Music.prototype.mute = function()
{
	if (!this.muted)
	{
		this.muted = true;
		this.destination.gain.value = 0;
		this.muteVolume = this.volume;
		this.volume = 0;
	}
};

Music.prototype.unmute = function()
{
	if (this.muted)
	{
		this.volume = this.muteVolume;
		this.muted = false;
		this.destination.gain.value = this.volume;
	}
};

Music.prototype.Update = function()
{
	// If the global resource loader isn't ready, don't try to play anything
	if (!GlobalResourceLoader.AllReady())
		return;
		
	// If something is supposed to be playing...
	if (this.playing)
	{
		// If there is no lastQueuedTrack or if the lastQueuedTrack is within 100ms of playback ending...
		if (this.lastQueuedTrack === null || audioContext.currentTime > (this.lastQueuedTrack.finishTime - musicQueueTime))
		{
			// Ask the currently selected track to cue up its next segment
			this.lastQueuedTrack = this.tracks[this.selectedTrack].QueueNext(this.lastQueuedTrack,this.playStartDelay, this);
			
			// If nothing queues, come to a graceful stop
			if (this.lastQueuedTrack == null)
			{
				this.playing = false;
				this.destination = null;
			}
				
		}
	}
	
	// And uh... that's kind of it. This design is friggin' magnificent.
};

Music.prototype.SetAlternate = function()
{
	if (this.tracks.hasOwnProperty(this.selectedTrack))
		this.tracks[this.selectedTrack].SetAlternate(this.lastQueuedTrack, this);
}

Music.prototype.ClearAlternate = function()
{
	if (this.tracks.hasOwnProperty(this.selectedTrack))
		this.tracks[this.selectedTrack].ClearAlternate(this.lastQueuedTrack, this);
}

function MusicTrack(name)
{
	this.trackName = name;
	this.segments = [];
	this.firstSegment = null;
	this.isAlternate = false;
};

MusicTrack.prototype.SpliceSegment = function(lastQueuedTrack, newTrack, newSegment, music)
{
	// If this track is not in alternate mode and it's playing right now...
	if (lastQueuedTrack !== null && newSegment !== null)
	{
		var spliceTime = audioContext.currentTime + 0.1;
		
		// Find out where we are in the currently playing track
		var precentagePlayed = (spliceTime - lastQueuedTrack.startTime) / lastQueuedTrack.source.buffer.duration;
		var newSecondsPlayed = precentagePlayed * newSegment.sound.buffer.duration;
		
		// Stop the current playback
		lastQueuedTrack.source.stop(spliceTime);
		
		// Create a new sound source
		lastQueuedTrack.source = audioContext.createBufferSource(); 
	
		// Connect the first segment's buffer
		lastQueuedTrack.source.buffer = newSegment.sound.buffer;
		
		// Route the source to the volume mixer
		lastQueuedTrack.source.connect( music.destination );

		// Schedule playback to start at the end of the clip
		lastQueuedTrack.source.start(spliceTime, newSecondsPlayed);
		
		// Update the start/finish times
		lastQueuedTrack.finishTime = spliceTime - newSecondsPlayed + lastQueuedTrack.source.buffer.duration - (200.0 / 44100.0);
		lastQueuedTrack.startTime = lastQueuedTrack.finishTime - lastQueuedTrack.source.buffer.duration;
		
		// Update the other metadata
		lastQueuedTrack.trackName = newTrack.trackName;
		lastQueuedTrack.segmentName = newSegment.segmentName;
		lastQueuedTrack.segment = newSegment;
	}
};

MusicTrack.prototype.SetAlternate = function(lastQueuedTrack, music)
{
	// If this track is not in alternate mode and it's playing right now...
	if (!this.isAlternate && lastQueuedTrack !== null && lastQueuedTrack.segment.alternateSegment !== null)
	{
		var spliceTime = audioContext.currentTime + 0.1;
		
		// Find out where we are in the currently playing track
		var secondsPlayed = (spliceTime - lastQueuedTrack.startTime);
		
		while (secondsPlayed < 0)
		{
			secondsPlayed += lastQueuedTrack.segment.alternateSegment.sound.buffer.duration;
		}
		
		while (secondsPlayed >= lastQueuedTrack.segment.alternateSegment.sound.buffer.duration)
		{
			secondsPlayed -= lastQueuedTrack.segment.alternateSegment.sound.buffer.duration;
		}
		
		// Stop the current playback
		lastQueuedTrack.source.stop(spliceTime);
		
		// Create a new sound source
		lastQueuedTrack.source = audioContext.createBufferSource(); 
	
		// Connect the first segment's buffer
		lastQueuedTrack.source.buffer = lastQueuedTrack.segment.alternateSegment.sound.buffer;
		
		// Route the source to the volume mixer
		lastQueuedTrack.source.connect( music.destination );

		// Schedule playback to start at the end of the clip
		lastQueuedTrack.source.start(spliceTime, secondsPlayed);
		
		// Update the start/finish times
		lastQueuedTrack.finishTime = spliceTime - secondsPlayed + lastQueuedTrack.source.buffer.duration - (200.0 / 44100.0);
		lastQueuedTrack.startTime = lastQueuedTrack.finishTime - lastQueuedTrack.source.buffer.duration;
	}
	
	// Set the is alternate flag so that alternate tracks get queued going forward
	this.isAlternate = true;
};

MusicTrack.prototype.ClearAlternate = function(lastQueuedTrack, music)
{
	// If this track is not in alternate mode and it's playing right now...
	if (this.isAlternate && lastQueuedTrack !== null)
	{
		var spliceTime = audioContext.currentTime + 0.1;
		
		// Find out where we are in the currently playing track
		var secondsPlayed = (spliceTime - lastQueuedTrack.startTime);
		
		while (secondsPlayed < 0)
		{
			secondsPlayed += lastQueuedTrack.segment.sound.buffer.duration;
		}
		
		while (secondsPlayed >= lastQueuedTrack.segment.sound.buffer.duration)
		{
			secondsPlayed -= lastQueuedTrack.segment.sound.buffer.duration;
		}
		
		// Stop the current playback
		lastQueuedTrack.source.stop(spliceTime);
		
		// Create a new sound source
		lastQueuedTrack.source = audioContext.createBufferSource(); 
	
		// Connect the first segment's buffer
		lastQueuedTrack.source.buffer = lastQueuedTrack.segment.sound.buffer;
		
		// Route the source to the volume mixer
		lastQueuedTrack.source.connect( music.destination );

		// Schedule playback to start at the end of the clip
		lastQueuedTrack.source.start(spliceTime, secondsPlayed);
		
		// Update the start/finish times
		lastQueuedTrack.finishTime = spliceTime - secondsPlayed + lastQueuedTrack.source.buffer.duration - (200.0 / 44100.0);
		lastQueuedTrack.startTime = lastQueuedTrack.finishTime - lastQueuedTrack.source.buffer.duration;
	}
	
	// Set the is alternate flag so that alternate tracks get queued going forward
	this.isAlternate = false;
};

MusicTrack.prototype.QueueNext = function(lastQueuedTrack,playStartDelay, music)
{
	var playbackStartTime = 0;
	var nextSegment = null;
	var trackName = this.trackName;
	var offset = 0;
	
	if (playStartDelay < 0)
	{
		offset = -playStartDelay;
		playStartDelay = 0;
	}
	
	// If nothing was playing previously, then queue up the intro
	if (lastQueuedTrack === null)
	{
		
		playbackStartTime = musicQueueTime + playStartDelay + audioContext.currentTime;
		
		if (this.firstSegment.skipOnce)
			nextSegment = this.firstSegment.nextSegment;
		else
			nextSegment = this.firstSegment;
			
		this.firstSegment.skipOnce = false;
	}
	// If the last node played was part of this track, go ahead and advance to the next
	// track according to the segment's desired next track
	else if (lastQueuedTrack.trackName === this.trackName)
	{
		playbackStartTime = lastQueuedTrack.finishTime;
		nextSegment = lastQueuedTrack.segment.nextSegment;
	}
	// If the last played segment was outside of this track, select an appropriate 
	// transition, if one exists.
	else
	{
		playbackStartTime = lastQueuedTrack.finishTime;
		
		var sectionFound = false;
		for (var i = 0; i < this.segments.length; i++)
		{
			if (this.segments[i].previousSegment === lastQueuedTrack.segment)
			{
				nextSegment = this.segments[i];
				break;
			}
		}
		
		// If no section was found and only explicit transitions are allowed
		// then don't branch to the newly set track yet
		if (nextSegment == null && this.permitOnlyExplicitTransitions)
		{
			nextSegment = lastQueuedTrack.segment.nextSegment;
			trackName = lastQueuedTrack.trackName;
		}
		else
		{
			if (this.firstSegment.skipOnce)
				nextSegment = this.firstSegment.nextSegment;
			else
				nextSegment = this.firstSegment;
			
			this.firstSegment.skipOnce = false;
		}
		
	}
	
	// Exit gracefully in one-shot songs
	if (nextSegment === null)
		return null;
	
	// Create a new sound source
	var source = audioContext.createBufferSource(); 
	
	// Connect the first segment's buffer
	if (this.isAlternate && nextSegment.alternateSegment !== null)
		source.buffer = nextSegment.alternateSegment.sound.buffer;
	else
		source.buffer = nextSegment.sound.buffer;
		
	// Route the source to the volume mixer
	source.connect( music.destination );
	
	// If the playback start time is longer ago than this track is long, just have it start now
	var playbackFinishTime = playbackStartTime + source.buffer.duration - offset - (200.0 / 44100.0);
	if ((playbackFinishTime - 0.1) < audioContext.currentTime)
	{
		offset = 0;
		playbackStartTime = audioContext.currentTime;
		playbackFinishTime = playbackStartTime + source.buffer.duration - (200.0 / 44100.0);
	}

	// Schedule playback to start at the end of the clip
	
	source.start(playbackStartTime, offset);
	
	return {	"trackName":trackName, 
				"segmentName":nextSegment.segmentName,
				"startTime": playbackStartTime,
				"finishTime": playbackFinishTime,
				"segment": nextSegment,
				"source" : source };
	
};

function MusicSegment(name)
{
	// Used when scanning for transitions
	this.previousSegment = null;
	this.nextSegment = null;
	this.skipOnce = false;
	
	this.alternateSegment = null;
	
	this.segmentName = name;
	this.sound = GlobalResourceLoader.GetSound(this.segmentName);
	
	this.beats = [];
	this.startSearch = 0;
};

MusicSegment.prototype.AddBeatsOnInterval = function(firstSample,sampleSpacing,beatCount)
{
	// If beatCount is undefined, add beats for the whole segment
	if(typeof(beatCount) === 'undefined')
		beatCount = Math.ceil((this.sound.samples - firstSample) / sampleSpacing);
	
	// Add the beats to the collection
	for(var i = 0; i < beatCount; i++)
	{
		this.beats.push(firstSample + sampleSpacing*i);
	}
	
	// Finally, make sure the beat collection is sorted
	this.beats.sort(function(a, b){return a-b});
};

MusicSegment.prototype.AddBeat = function(sample)
{
	this.beats.push(sample);
	
	// Finally, make sure the beat collection is sorted
	this.beats.sort(function(a, b){return a-b});
};

MusicSegment.prototype.IsBeatInSampleInterval = function(start,end)
{
	// If startsearch is an invalid index or the beat it points to is later than the one
	// we are looking for, revert to 0.
	if (this.startSearch >= this.beats.length || this.beats[this.startSearch] > end)
	{
		this.startSearch = 0;
	}
	
	// Find the first beat after start
	for (var i = this.startSearch; i < this.beats.length; i++)
	{
		if (this.beats[i] > start)
		{
			// This beat is greater than the start, check if it's also less than the end
			if (this.beats[i] <= end)
			{
				this.startSearch = i;
				return true;
			}
			else
			{
				this.startSearch = i;
				return false;
			}
		}
	}
	//this.startSearch = 0;
	return false;
};

var GlobalMusic = new Music();