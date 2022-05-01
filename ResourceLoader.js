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

// The ResourceLoader object takes care of requesting all the graphics that are
// required by the game.
 
function ImageResource(key, src)
{
	var ir = this;
		
	this.key = key;
			
	// If the image source ends in .txt, this is a sprite sheet
	if (src.substr(src.length-4,4) === ".txt")
	{
		this.infoSrc = src;
		this.src = src.substr(0,src.length-4) + ".png";
		
		this.xmlHttp = new XMLHttpRequest(); 
		this.xmlHttp.open("GET", this.infoSrc);
		this.xmlHttp.overrideMimeType("application/json");
		this.xmlHttp.onreadystatechange = function(e){ir.onSheetInfoReady(e);};
	}
	else
	{
		this.infoSrc = null;
		this.xmlHttp = null;
		this.src = src;
	}
	
	this.info = null;
	
	this.loading = false;
	this.loaded = false;
	this.error = false;
	this.errorMessage = null;
	
	this.image = document.createElement("canvas");
	this.flippedImage = document.createElement("canvas");
	
	this.domImage = new Image()
	this.domImage.setAttribute('crossOrigin','anonymous');
	this.domImage.onerror=function(){ir.onImageError();};
	this.domImage.onload=function(){ir.onImageLoad();};
};

ImageResource.prototype.onSheetInfoReady = function(e)
{
	if (e.target.readyState == 4)
	{
		this.info = JSON.parse(e.target.responseText);

		if (this.loaded)
		{	
			this.GenerateSprites();
			GlobalResourceLoader.resourceLoadComplete(this);
		}
	}
};

ImageResource.prototype.onImageLoad = function()
{
	if (this.infoSrc === null)
	{
		this.loaded = true;
		this.GenerateSprites();
		GlobalResourceLoader.resourceLoadComplete(this);
	}
	else
	{
		this.loaded = true;
		if (this.info !== null)
		{
			this.GenerateSprites();
			GlobalResourceLoader.resourceLoadComplete(this);
		}
	}
};

ImageResource.prototype.GenerateSprites = function()
{
	printImageToCanvases(this.domImage, this.image, this.flippedImage);
	this.domImage = null;
	if (this.infoSrc === null)
	{
		// Generate a sprite of the whole image
		var info = {'name': this.key,
					'width': this.image.width, 
					'height': this.image.height,
					'originX': 0, 
					'originY': 0,
					'centerX': 0, 
					'centerY': 0,
				    };
				    
		var sprite = GlobalResourceLoader.GetSprite(this.key);
		sprite.Init(this.image, this.flippedImage, info);
	}
	else
	{
		// Generate sprites for each tile
		for (var i=0; i < this.info.frames.length; i++)
		{
			var sprite = GlobalResourceLoader.GetSprite(this.info.frames[i].name);
			sprite.Init(this.image, this.flippedImage, this.info.frames[i]);
		}
	}
};

function printImageToCanvases(domImage, canvas, flippedCanvas)
{
	// Print the sprite and the flipped sprite to the appropriate canvases
	canvas.width = domImage.width;
	canvas.height = domImage.height;
	var imageCtx = canvas.getContext("2d");
	imageCtx.drawImage(domImage, 0, 0);
		
	flippedCanvas.width = domImage.width;
	flippedCanvas.height = domImage.height;
	var flippedCtx = flippedCanvas.getContext("2d");
	flippedCtx.translate(domImage.width, 0);
	flippedCtx.scale(-1, 1);
	flippedCtx.drawImage(domImage, 0, 0);
};

ImageResource.prototype.onImageError = function()
{
	this.error = true;
	this.loaded = false;
	this.errorMessage = "Error loading image: " + this.src;
	GlobalResourceLoader.resourceLoadComplete(this);
};

ImageResource.prototype.load = function()
{
	if (!this.loading)
	{
		this.loaded = false;
		this.error = false;
		this.domImage.src = this.src;
		
		if (this.xmlHttp !== null)
			this.xmlHttp.send(null);
		
		this.loading = true;
	}
};

ImageResource.prototype.unload = function()
{
	this.domImage = null;
	this.image = null;
	this.flippedImage = null;
	this.loading = false;
	this.loaded = false;
	this.error = false;
};

ImageResource.prototype.matchesKey = function(key)
{
	return key === this.key;
};

ImageResource.prototype.isReady = function()
{
	if (this.infoSrc === null)
		return (this.loaded) && !this.error;
	else
		return (this.loaded) && !this.error && this.info !== null;
};

function Sprite()
{
	this.inited = false;
	this.width = 0;
	this.height = 0;
}

Sprite.prototype.Init = function(sourceImage, flippedSourceImage, info)
{
	this.inited = true;
	this.sourceImage = sourceImage;
	this.flippedSourceImage = flippedSourceImage;
	this.info = info;
	this.width = this.info.width;
	this.height = this.info.height;
	
	//this.Optimize();
}

Sprite.prototype.Clone = function()
{
	var clonedSprite = new Sprite();
	
	clonedSprite.inited = true;
	clonedSprite.sourceImage = cloneCanvas(this.sourceImage);
	clonedSprite.flippedSourceImage = cloneCanvas(this.flippedSourceImage);
	clonedSprite.info = {	'name': this.info.name,
							'width': this.info.width, 
							'height': this.info.height,
							'originX': this.info.originX, 
							'originY': this.info.originY,
							'centerX': this.info.centerX, 
							'centerY': this.info.centerY,
						 };
	clonedSprite.width = this.info.width;
	clonedSprite.height = this.info.height;
	
	return clonedSprite;
}

Sprite.prototype.Optimize = function()
{
	// Get rid of any blank space around a sprite with a quick bounds check
	var imageCtx = this.sourceImage.getContext("2d");
	var imgd = imageCtx.getImageData(this.info.originX, this.info.originY, this.info.width, this.info.height);
	var pix = imgd.data;
	
	var minX = this.info.width;
	var maxX = 0;
	var minY = this.info.height;
	var maxY = 0;
	
	// Top bound
	for (var y=0; y < minY; y++) 
	{
		for (var x=0; x < this.info.width; x++) 
		{
			if (pix[y * this.info.width * 4 + x * 4 + 3] !== 0)
			{
				minY = y;
				break;
			}
		}
	}
	
	// Left bound
	for (var x=0; x < minX; x++) 
	{
		for (var y=0; y < this.info.height; y++) 
		{
			if (pix[y * this.info.width * 4 + x * 4 + 3] !== 0)
			{
				minX = x;
				break;
			}
		}
	}
	
	// Bottom bound
	for (var y=this.info.height; y > maxY; y--) 
	{
		for (var x=0; x < this.info.width; x++) 
		{
			if (pix[(y-1) * this.info.width * 4 + x * 4 + 3] !== 0)
			{
				maxY = y;
				break;
			}
		}
	}
	

	
	// Right bound
	for (var x=this.info.width; x > maxX; x--) 
	{
		for (var y=0; y < this.info.height; y++) 
		{
			if (pix[y * this.info.width * 4 + (x-1) * 4 + 3] !== 0)
			{
				maxX = x;
				break;
			}
		}
	}
	
	// Adjust the data in the info object		
	this.info.width = maxX-minX;
	this.info.height = maxY-minY;
	this.info.originX += minX;
	this.info.originY += minY;
	this.info.centerX -= minX;
	this.info.centerY -= minY;
	this.width = this.info.width;
	this.height = this.info.height;
	
	// If there are zero visible pixels, mark the sprite as not loaded to skip drawing it entirely
	if (this.info.width <= 0 || this.info.height <= 0)
		this.inited = false;
	
}

// The DrawEntity function assumes the canvas has been
// totally set up for drawing already and all that needs to happen is sprite
// centering and scaling
Sprite.prototype.DrawSprite = function(x, y, flipped)
{
	if (this.inited)
	{
		if (typeof(flipped)==='undefined' || !flipped)
			ctx.drawImage(this.sourceImage, this.info.originX, this.info.originY, this.info.width, this.info.height, -this.info.centerX + x, -this.info.centerY + y, this.info.width, this.info.height);
		else
			ctx.drawImage(this.flippedSourceImage, this.flippedSourceImage.width - this.info.originX - this.info.width, this.info.originY, this.info.width, this.info.height, -(this.info.width - this.info.centerX) + x, -this.info.centerY + y, this.info.width, this.info.height);
	}
}

// The DrawEntity function assumes the canvas has been
// totally set up for drawing already and all that needs to happen is sprite
// centering and scaling
Sprite.prototype.DrawSprite3x = function(x, y, flipped)
{
	if (this.inited)
	{
		if (typeof(flipped)==='undefined' || !flipped)
			ctx.drawImage(this.sourceImage, this.info.originX, this.info.originY, this.info.width, this.info.height, -this.info.centerX * 3.0 + x, -this.info.centerY * 3.0 + y, this.info.width * 3.0, this.info.height * 3.0);
		else
			ctx.drawImage(this.flippedSourceImage, this.flippedSourceImage.width - this.info.originX - this.info.width, this.info.originY, this.info.width, this.info.height, -(this.info.width - this.info.centerX) * 3.0 + x, -this.info.centerY * 3.0 + y, this.info.width * 3.0, this.info.height * 3.0);
	}
}

//context.drawImage(img,x,y);
//context.drawImage(img,x,y,width,height);
//context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
Sprite.prototype.Draw = function(x, y, width, height, dx, dy, dwidth, dheight, flipped)
{
	if (this.inited)
	{
		if(typeof(width)==='undefined')
		{
			dx = x;
			dy = y;
			x = 0;
			y = 0;
			dwidth = this.width;
			dheight = this.height;
			width = this.width;
			height = this.height;
		}
		else if(typeof(dx)==='undefined')
		{
			dx = x;
			dy = y;
			x = 0;
			y = 0;
			dwidth = width;
			dheight = height;
			width = this.width;
			height = this.height;
		}
		
		// Don't try to draw anything with a negative width or height because Firefox loses
		// its mind.
		if (width < 1 || dwidth < 1 || height < 1 || dheight < 1)
			return;
		
		if (typeof(flipped)==='undefined' || !flipped)
			ctx.drawImage(this.sourceImage, x + this.info.originX, y + this.info.originY, width, height, dx, dy, dwidth, dheight);
		else
			ctx.drawImage(this.flippedSourceImage, x + (this.flippedSourceImage.width - this.info.originX - this.info.width), y + this.info.originY, width, height, dx, dy, dwidth, dheight);
	}
}

// Font resource
function FontResource(key, src)
{
	this.font = new Font();
    this.font.fontFamily = key;
	this.key = key;
	this.src = src;
	this.loading = false;
	this.loaded = false;
	this.error = false;
	this.errorMessage = null;
	var fr = this;
    this.font.onload = function() {
      fr.onFontLoad();
    };
    this.font.onerror = function(error_message) {
      fr.onFontError();
    };
};

FontResource.prototype.onFontLoad = function()
{
	this.loaded = true;
	GlobalResourceLoader.resourceLoadComplete(this);
};

FontResource.prototype.onFontError = function()
{
	this.error = true;
	this.loaded = false;
	this.errorMessage = "Error loading font: " + this.src;
	GlobalResourceLoader.resourceLoadComplete(this);
};

FontResource.prototype.load = function()
{
	if (!this.loading)
	{
		
		this.loaded = false;
		this.error = false;
		this.font.src = this.src;
		this.loading = true;
	}
};

FontResource.prototype.unload = function()
{
	this.image = null;
	this.loading = false;
	this.loaded = false;
	this.error = false;
};

FontResource.prototype.matchesKey = function(key)
{
	return key === this.key;
};

FontResource.prototype.isReady = function()
{
	return (this.loaded) && !this.error;
};

// AudioResource
function AudioResource(key, src, samples)
{
	this.samples = 0;
	this.trimAfterDecode = false;
	
	if(typeof(samples)!=='undefined')
	{
	 this.samples = samples;
	 this.trimAfterDecode = true;
	}
	
	this.key = key;
	this.src = src;
	this.lastPlayFinishTime = -1;
	this.allowOverlap = false;
	this.loading = false;
	this.loaded = false;
	this.error = false;
	this.errorMessage = null;
	this.seekCount = 0;
	this.seekMax = 100;	// A lot of seeks
	this.data = null;
	this.buffer = null;
	this.destination = audioContext.createGain();
	this.destination.connect(audioContext.destination);
	this.destination.gain.value = 1.0;
	this.request = new XMLHttpRequest();
	
	this.loop = false;
};

// A static variable that affects the play function
AudioResource.muted = false;

AudioResource.mute = function()
{
	AudioResource.muted = true;
};

AudioResource.unmute = function()
{
	AudioResource.muted = false;
};

AudioResource.prototype.load = function()
{
	if (!this.loading)
	{
		
		this.loaded = false;
		this.error = false;
		
		this.request.open("GET", this.src, true); // Path to Audio File
		this.request.responseType = "arraybuffer"; // Read as Binary Data

		var ar = this;
		this.request.onload = function() {
			ar.data = ar.request.response
			ar.onSoundLoad();
		};
		
		this.request.onerror = function() {
			ar.onSoundLoadError();
		};

		this.request.send();
		
		
		this.loading = true;
	}
};

AudioResource.prototype.onSoundLoad = function()
{
	var ar = this;
	audioContext.decodeAudioData(this.data, function(buffer) {ar.onSoundDecode(buffer);},  function(error) {ar.onSoundDecodeError(error)});
};

AudioResource.prototype.onSoundLoadError = function()
{
	this.error = true;
	this.loaded = false;
	GlobalResourceLoader.errorMessages.push("Error loading sound: " + this.src);
	GlobalResourceLoader.resourceLoadComplete(this);
};

AudioResource.prototype.onSoundDecode = function(buffer)
{
	// If this file was loaded as a sample-exact sound, then
	if (this.trimAfterDecode)
	{ 
		//console.log("Processing " + this.src + " after decode.");
		
		var samplesScaled = this.samples;
		
		if (buffer.sampleRate !== 44100)
		{
			//console.log("Browser resampled sound to " + buffer.sampleRate.toString() + " Hz.");
			//console.log("Oh iOS, you rapscallion.");
			samplesScaled = Math.round(this.samples * (buffer.sampleRate / 44100));
		}
		
		
		var left = buffer.getChannelData(0);
		var right = buffer.getChannelData(1);
		var difference = left.length - samplesScaled;
		
		if (left.length > samplesScaled)
		{
			console.log("Browser padded front of loop with " + difference.toString() + " samples.");	
			//console.log("Firefox, what the heck, please no.");
			console.log("Trimming padding back off...");
		
			// Trim the difference in decode length from the front of the file
			var trimLeft = left.subarray(difference,left.length);
			var trimRight = right.subarray(difference,right.length);
			this.buffer = audioContext.createBuffer(2, trimLeft.length, 44100);
			var newLeft = this.buffer.getChannelData(0);
			var newRight = this.buffer.getChannelData(1);
			newLeft.set(trimLeft);
			newRight.set(trimRight);
		}
		else if (left.length < samplesScaled)
		{
			//console.log("Browser trimmed " + (samplesScaled - left.length).toString() + " samples from loop.");
			//console.log("Safari, this is helpful but maybe a little naughty.");
			this.buffer = buffer;
		}
		else
		{
			//console.log("Browser cleanly decoded loop.");
			//console.log("Chrome, you are a good citizen.");
			this.buffer = buffer;
		}
	}
	else
	{
		this.buffer = buffer;
	}
	
	this.loaded = true;
	GlobalResourceLoader.resourceLoadComplete(this);
};

AudioResource.prototype.onSoundDecodeError = function(error)
{
	if (error != null)
		GlobalResourceLoader.errorMessages.push(error);

	GlobalResourceLoader.errorMessages.push("Error decoding sound: " + this.src);
	//GlobalResourceLoader.errorMessages.push("Are you using Opera? Opera cannot decode MP3 sound.");
	GlobalResourceLoader.errorMessages.push("Sorry about that!");
	
	this.loaded = true;
	this.error = true;
	GlobalResourceLoader.resourceLoadComplete(this);
};

AudioResource.prototype.unload = function()
{
	this.buffer = null;
	this.loading = false;
	this.loaded = false;
	this.error = false;
};

AudioResource.prototype.Play = function(volume, delay)
{
	if(typeof(volume)==='undefined') volume = 1.0;
	if(typeof(delay)==='undefined') delay = 0;
	
	if (AudioResource.muted)
	{
		volume = 0;
	}
	
	volume *= settings.baseSFXBoost;
	
	var startPoint = 0;
	if (delay < 0)
	{
		startPoint = -delay;
		delay = 0;
	}
	
	var when = audioContext.currentTime + delay;
	
	
	if (when > this.lastPlayFinishTime || this.allowOverlap )
	{
		var source = audioContext.createBufferSource(); // Create Sound Source
		source.buffer = this.buffer; // Add Buffered Data to Object
		source.connect(this.destination); // Connect Sound Source to Output
		this.destination.gain.value = volume;
		source.loop = this.loop;
		source.start(when, startPoint);
		
		this.lastPlayFinishTime = when + 0.2; 
	}
	return source;
};

AudioResource.prototype.matchesKey = function(key)
{
	return key === this.key;
};

AudioResource.prototype.isReady = function()
{
	return (this.loaded) && !this.error;
};
 
 
function ResourceLoader() 
{
	this.images = [];
	this.sounds = [];
	this.fonts = [];
	this.sprites = {};
	
	this.unloadedResources = [];
	
	this.allReadyCheckValid = false;
	this.allReady = false;
	this.animationTimer = 0;
	this.loadPercentage = 0;
	this.gameReady = false;
	this.loadingError = false;
	
	this.maximumActiveRequests = 10;
	this.activeRequests = 0;
	
	this.errorMessages = [];
	
	this.iOS = true;
	this.webAudioLocked = !(typeof(process) != "undefined" && process.versions.electron);
	
	if (this.iOS)
	{
		var gain = audioContext.createGain();
		
		var canvas = document.getElementById("gameCanvas");
		var webAudioUnlocker = null; 
		webAudioUnlocker = function() {

			// create empty buffer
			var buffer = audioContext.createBuffer(1, 4800, 48000);
			var source = audioContext.createBufferSource();
			source.buffer = buffer;

			// connect to output (your speakers)
			source.connect(audioContext.destination);
			
			source.onended = function() {
					canvas.removeEventListener('click', webAudioUnlocker);
					canvas.removeEventListener('touchend', webAudioUnlocker);
					GlobalResourceLoader.webAudioLocked = false;
					enableTouchInput();
				};

			// play the file
			source.start();
			//GlobalResourceLoader.webAudioLocked = false;
		};
		canvas.addEventListener('click', webAudioUnlocker, false);
		canvas.addEventListener('touchend', webAudioUnlocker, false);
	}
	
};

ResourceLoader.prototype.LoadAll = function() 
{
	while (this.activeRequests < this.maximumActiveRequests && this.unloadedResources.length > 0)
	{
		this.unloadedResources[0].load();
		this.unloadedResources.splice(0,1);
		this.activeRequests += 1;
	}
};

ResourceLoader.prototype.resourceLoadComplete = function(resource)
{
	if (resource.error)
		this.loadingError = true;
	this.activeRequests -= 1;
	this.LoadAll();
}

ResourceLoader.prototype.AddSequentialImageResources = function(key,src,start,stop) 
{
	for (var i=start; i <= stop; i++)
	{
		this.AddImageResource(String.format(key, i.toString()), String.format(src, i.toString()));
	}
};

ResourceLoader.prototype.AddImageResource = function(key,src) 
{
	for (var i=0; i < this.images.length; i++)
	{
		if (this.images[i].matchesKey(key))
			return;
	}
	
	this.allReadyCheckValid = false;
	
	var newResource = new ImageResource(key,src);
	this.images.push(newResource);
	this.unloadedResources.push(newResource);
};

ResourceLoader.prototype.AddImageFromCanvas = function(key,canvas) 
{
	for (var i=0; i < this.images.length; i++)
	{
		if (this.images[i].matchesKey(key))
			return;
	}
	
	var newResource = new ImageResource(key,"tile");
	
	newResource.loaded = true;
	newResource.image = canvas;
	newResource.flippedImage = mirrorCanvas(canvas);
	
	this.images.push(newResource);
};

ResourceLoader.prototype.AddAudioResource = function(key,src,samples) 
{
	for (var i=0; i < this.sounds.length; i++)
	{
		if (this.sounds[i].matchesKey(key))
			return;
	}
	
	this.allReadyCheckValid = false;
	
	var newResource = new AudioResource(key,src,samples);
	this.sounds.push(newResource);
	this.unloadedResources.push(newResource);
};

ResourceLoader.prototype.AddSequentialAudioResources = function(key,src,start,stop) 
{
	for (var i=start; i <= stop; i++)
	{
		this.AddAudioResource(String.format(key, i.toString()), String.format(src, i.toString()));
	}
};

ResourceLoader.prototype.AddFontResource = function(key,src) 
{
	for (var i=0; i < this.fonts.length; i++)
	{
		if (this.fonts[i].matchesKey(key))
			return;
	}
	
	this.allReadyCheckValid = false;
	
	var newResource = new FontResource(key,src);
	this.fonts.push(newResource);
	this.unloadedResources.push(newResource);
};

ResourceLoader.prototype.AllReady = function() 
{
	// If there was a loading error, who cares what else went wrong
	if (this.loadingError)
		return false;
		
	if (this.iOS && this.webAudioLocked)
		return false;
		
	if (this.allReadyCheckValid)
		return this.allReady;
	
	for (var i=0; i < this.images.length; i++)
	{
		if (!this.images[i].isReady())
		{
			if (this.images[i].error)
			{
				this.loadingError = true;
				this.errorMessages.push(this.images[i].errorMessage);
			}
				
			this.allReady = false;
			this.allReadyCheckValid = false;
			return false;
		}
	}
	
	for (var i=0; i < this.sounds.length; i++)
	{
		if (!this.sounds[i].isReady())
		{
			if (this.sounds[i].error)
			{
				this.loadingError = true;
				this.errorMessages.push(this.sounds[i].errorMessage);
			}
				
			this.allReady = false;
			this.allReadyCheckValid = false;
			return false;
		}
	}
	
	for (var i=0; i < this.fonts.length; i++)
	{
		if (!this.fonts[i].isReady())
		{
			if (this.fonts[i].error)
			{
				this.loadingError = true;
				this.errorMessages.push(this.fonts[i].errorMessage);
			}
				
			this.allReady = false;
			this.allReadyCheckValid = false;
			return false;
		}
	}
	
	this.allReadyCheckValid = this.gameReady && !this.loadingError;
	this.allReady = this.gameReady && !this.loadingError;
	
	return this.allReady;
};

ResourceLoader.prototype.GetLoadPercentage = function() 
{
	if (this.allReadyCheckValid && this.allReady)
		return 100;
	
	var totalItems =  this.images.length +  this.sounds.length +  this.fonts.length;
	var loadedItems = totalItems - this.unloadedResources.length;
	
	return Math.floor(loadedItems/totalItems*100);
};

ResourceLoader.prototype.AddImageResourceAndLoadImmediately = function(key,src) 
{
	for (var i=0; i < this.images.length; i++)
	{
		if (this.images[i].matchesKey(key))
			return;
	}
	
	this.allReadyCheckValid = false;
	
	this.images.push(new ImageResource(key,src));
	this.images[this.images.length-1].load();
};

ResourceLoader.prototype.AddAudioResourceAndLoadImmediately = function(key,src) 
{
	for (var i=0; i < this.sounds.length; i++)
	{
		if (this.sounds[i].matchesKey(key))
			return;
	}
	
	this.allReadyCheckValid = false;
	
	this.sounds.push(new ImageResource(key,src));
	this.sounds[this.sounds.length-1].load();
};

ResourceLoader.prototype.AddFontResourceAndLoadImmediately = function(key,src) 
{
	for (var i=0; i < this.fonts.length; i++)
	{
		if (this.fonts[i].matchesKey(key))
			return;
	}
	
	this.allReadyCheckValid = false;
	
	this.fonts.push(new ImageResource(key,src));
	this.fonts[this.fonts.length-1].load();
};

/*
ResourceLoader.prototype.GetSprite = function(key) 
{
	for (var i=0; i < this.images.length; i++)
	{
		if (this.images[i].matchesKey(key))
			return this.images[i].image;
	}
	return null;
};

ResourceLoader.prototype.GetFlippedImage = function(key) 
{
	for (var i=0; i < this.images.length; i++)
	{
		if (this.images[i].matchesKey(key))
			return this.images[i].flippedImage;
	}
	return null;
};
*/

ResourceLoader.prototype.GetSprite = function(key) 
{
	// Autocreate sprites that don't exist
	if (!this.sprites.hasOwnProperty(key))
		this.sprites[key] = new Sprite();
	return this.sprites[key];
};

ResourceLoader.prototype.GetRandomSprite = function() 
{
  var keys = Object.keys(this.sprites);
  return this.sprites[keys[Math.floor(keys.length * Math.random())]];
};

ResourceLoader.prototype.CloneSprite = function(key) 
{
	// Autocreate sprites that don't exist
	if (!this.sprites.hasOwnProperty(key))
		this.sprites[key] = new Sprite();
	return this.sprites[key].Clone();
};

ResourceLoader.prototype.IsSpriteLoaded = function(key) 
{
	// Autocreate sprites that don't exist
	return this.sprites.hasOwnProperty(key);
};

ResourceLoader.prototype.GetSound = function(key) 
{
	for (var i=0; i < this.sounds.length; i++)
	{
		if (this.sounds[i].matchesKey(key))
			return this.sounds[i];
	}
	console.log("The sound \"" + key + "\" does not exist.");
	return null;
};

ResourceLoader.prototype.GetFont = function(key) 
{
	for (var i=0; i < this.fonts.length; i++)
	{
		if (this.fonts[i].matchesKey(key))
			return this.fonts[i];
	}
};

ResourceLoader.prototype.GameReady = function() 
{
	this.gameReady = true;
};

ResourceLoader.prototype.GameNotReady = function() 
{
	this.gameReady = false;
};

ResourceLoader.prototype.Draw = function() 
{
	if (!this.AllReady())
	{
		this.animationTimer += 1;
				
		// Basically draw over everything
		// Store the current transformation matrix
		ctx.save();
	
	
		var ratioTo360p =  c.height / 360.0;
		
		// Arrange drawing so that we are in a frame that is 1920x1080 with the origin
		// on the upper right
		ctx.setTransform(ratioTo360p, 0, 0, ratioTo360p, 0.5, 0.5);
		
		// Draw the black background
		ctx.globalCompositeOperation = "none"
		ctx.globalAlpha=1;
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, 640, 360);
		
		if (this.loadingError)
		{
			ctx.fillStyle = hvToRBGString(0.99,1);
			ctx.textAlign = "center";
			ctx.globalAlpha=1.0;
		
			if (this.GetFont("alagard").loaded)
			{
				ctx.font = "16px alagard";
			}
			else
			{
				ctx.font = "12px \"Lucida Console\"";
			}
			
			ctx.fillText("Well, shit.",320,157);
			ctx.fillText("No game for you I guess.",320,180);
			if (this.GetFont("alagard").loaded)
			{
				ctx.font = "10px alagard";
			}
			else
			{
				ctx.font = "8px \"Lucida Console\"";
			}
			for (var i=0; i < this.errorMessages.length; i++)
			{
				if (this.errorMessages[i] !== null)
					ctx.fillText(this.errorMessages[i],320,180 + 24 + i*12);
			}
		}
		else
		{
			var loadPercentageTarget = this.GetLoadPercentage() ;
			
			this.loadPercentage = crawlValueInFrames(this.loadPercentage, loadPercentageTarget, 2);
			
			ctx.fillStyle = hvToRBGString(this.loadPercentage/100,1);
			ctx.textAlign = "center";
			ctx.globalAlpha=Math.sin(this.animationTimer/50)/4 + 0.75;
			
			if (this.GetFont("alagard").loaded)
			{
				ctx.font = "20px alagard";
			}
			else
			{
				ctx.font = "14px \"Lucida Console\"";
			}
			
			ctx.fillText("Getting Stranger...",320,180);
			
			if (this.iOS && this.loadPercentage > 99)
			{
				if (this.webAudioLocked)
					ctx.fillText("Tap to Start", 320, 180 + 16);
				else
					ctx.fillText("Starting...", 320, 180 + 16);
			}
			else
			{
				ctx.fillText(String(Math.round(this.loadPercentage))+"%",320, 180 + 16);
			}
			
			if (this.GetFont("alagard").loaded)
			{
				ctx.font = "14px alagard";
			}
			else
			{
				ctx.font = "9px \"Lucida Console\"";
			}
			
			for (var i=0; i < this.errorMessages.length; i++)
			{
				if (this.errorMessages[i] !== null)
					ctx.fillText(this.errorMessages[i],320,180 + 33 + i*12);
			}
			
		}
		
		ctx.globalAlpha=1;
		ctx.restore();
	
		return;
	}
};


var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var staticElementLibrary = [];
var animatedElementLibrary = {};

var GlobalResourceLoader = new ResourceLoader();

function AddToAnimatedElementLibrary(elements)
{
	for (var property in elements) 
	{
		if (elements.hasOwnProperty(property) && !animatedElementLibrary.hasOwnProperty(property)) 
		{
			animatedElementLibrary[property] = elements[property];
		}
	}
};

function AddToStaticElementLibrary(elements)
{
	for (var i = 0; i < elements.length; i++)
	{
		if (staticElementLibrary.indexOf(elements[i]) === -1)
		{
			staticElementLibrary.push(elements[i]);
		}
	}
};