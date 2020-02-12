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

GlobalResourceLoader.AddSequentialImageResources("bartenderflying{0}","images/cutscene/bartender_flying{0}.png",1,5);
GlobalResourceLoader.AddImageResource("laserbeam","images/cutscene/laserbeam.png");
GlobalResourceLoader.AddImageResource("sheet_Cutscene_SmokeRings","images/cutscene/sheet_Cutscene_SmokeRings.txt");
GlobalResourceLoader.AddImageResource("joezonked","images/cutscene/joezonked.png");
GlobalResourceLoader.AddImageResource("joezonkedbrain","images/cutscene/joezonkedbrain.png");

GlobalResourceLoader.AddAudioResource("eyezoom","sound/cutscene/Intro_6_EyeZoom.mp3");
GlobalResourceLoader.AddAudioResource("tunnel","sound/cutscene/Intro_7_Tunnel.mp3");

function LevelStartTransition()
{	
	this.close = false;
	this.timer = 0;
	
	this.focalLength = 6;
	this.transitionInTime = 200;
	this.length = 350;
	this.brainstart = this.length-60;
	this.brainstop = this.length-30;
	this.startDist = 45;
	this.endDist = 0.2;
	
	this.victim = GlobalResourceLoader.GetSprite("joezonked");
	this.victimBrain = GlobalResourceLoader.GetSprite("joezonkedbrain");
	
	this.laserbeam = GlobalResourceLoader.GetSprite("laserbeam");
	this.bartenderflying = new Animation(this, "bartenderflying{0}", 5, 0.8);
	
	this.ring_a =  [GlobalResourceLoader.GetSprite("cutscene/rings/a1"),
					GlobalResourceLoader.GetSprite("cutscene/rings/a2"),
					GlobalResourceLoader.GetSprite("cutscene/rings/a3"),
					GlobalResourceLoader.GetSprite("cutscene/rings/a4"),
					GlobalResourceLoader.GetSprite("cutscene/rings/a5"),
					GlobalResourceLoader.GetSprite("cutscene/rings/a6"),
					GlobalResourceLoader.GetSprite("cutscene/rings/a7"),
					GlobalResourceLoader.GetSprite("cutscene/rings/a8")];
	this.ring_b =  [GlobalResourceLoader.GetSprite("cutscene/rings/b1"),
					GlobalResourceLoader.GetSprite("cutscene/rings/b2"),
					GlobalResourceLoader.GetSprite("cutscene/rings/b3"),
					GlobalResourceLoader.GetSprite("cutscene/rings/b4"),
					GlobalResourceLoader.GetSprite("cutscene/rings/b5"),
					GlobalResourceLoader.GetSprite("cutscene/rings/b6"),
					GlobalResourceLoader.GetSprite("cutscene/rings/b7"),
					GlobalResourceLoader.GetSprite("cutscene/rings/b8")];
					
	this.colors = ["#815884", "#75507a", "#694871", "#5d4067", "#50385d", "#443053", "#38284a", "#2c2040"];
	
	this.rings = [];
	this.ringCount = 21;
	//this.ringCount = 4;
	
	for (var i = 0; i < this.ringCount; i++)
	{
		var ring = {
						"ringStyle":i%2,
						"rotation": (Math.random()-0.5)*Math.PI,
						"rotationVel": (Math.random()-0.5) * 0.003,
						"position": (this.startDist / this.ringCount) * i 
				   };
				   
		this.rings.push(ring);
	}
	
	this.bgColor = "#1e0c38";
	this.smokeBgColorFar = "#2c2040";
	this.smokeBgColorNear = "#815884";
	
	this.eyeZoomSound = null;
	this.tunnelSound = null;
};

LevelStartTransition.prototype.Show = function()
{	
	this.close = false;
	menuStack.push(this);
}

LevelStartTransition.prototype.Draw = function()
{
	// Basically draw over everything
	// Store the current transformation matrix
	ctx.save();

	var ratioTo1080p =  c.height / 1080.0;

	// Arrange drawing so that we are in a frame that is 1920x1080 with the origin
	// on the upper right
	ctx.setTransform(ratioTo1080p, 0, 0, ratioTo1080p, 0, 0);
	
	// Draw the background frame
	ctx.fillStyle = this.bgColor;
	ctx.fillRect(0, 0, 1920, 1080);
	
	var time = normalizeValue(this.timer,0,this.length);
	time = (Math.pow(time+1,3)-1)/7;
	var position = linearRemap(time,0,1,this.startDist,this.endDist);
	
	// Make the bartender's smoke animation speed up
	this.bartenderflying.SetDurationInSeconds(linearRemap(position,this.startDist,this.endDist,0.8,0.2));
	
	var scale = this.focalLength / position;
	
	ctx.save();
	ctx.translate(960,540);
	ctx.scale( scale, scale );
    	
	// Draw Joe (80,35) is center of zoom
	if (this.timer < this.brainstop)
	{
		ctx.globalAlpha = normalizeValue(this.timer, 210, 270);
		
		this.victim.Draw(
					-80 * pxScale, 
					-35 * pxScale, 
					this.victim.width * pxScale,
					this.victim.height * pxScale );
   
    
		ctx.globalAlpha = normalizeValue(this.timer, this.brainstart, this.brainstop);
	}

	this.victimBrain.Draw(
					-80  * pxScale, 
					-35 * pxScale, 
    				this.victimBrain.width  * pxScale,
    				this.victimBrain.height  * pxScale );
    				
	ctx.globalAlpha = 1.0;
	
	// Restore the canvas
	ctx.restore();
	
	// Draw all the rings
	for (var i=0; i < this.rings.length; i++)
	{
    	if (position > this.rings[i].position)
    	{
			ctx.save();
			
			var scale = this.focalLength  / (position - this.rings[i].position);
			
			//var ringColor = Math.floor(linearRemap(scale, 0.2, 1, 0, 7.99));
			//var ringColor = Math.floor(linearRemap(position - this.rings[i].position, 15, 2, 0, 7.99));
			var nearAlphaContinuous = linearRemap(scale, 0.2, 0.8, 0, 1);
			
			// Setup the canvas for drawing the ring
			ctx.translate(960,540);
			ctx.scale( scale, scale );
			ctx.rotate(this.rings[i].rotation);

			// Draw the ring
			if (this.rings[i].ringStyle===0)
			{
				this.ring_a[0].DrawSprite3x(0,0);
				ctx.globalAlpha = nearAlphaContinuous;
				this.ring_a[7].DrawSprite3x(0,0);
				ctx.globalAlpha = 1.0;
			}
			else 
			{
				this.ring_b[0].DrawSprite3x(0,0);
				ctx.globalAlpha = nearAlphaContinuous;
				this.ring_b[7].DrawSprite3x(0,0);
				ctx.globalAlpha = 1.0;
			}
			
			// Draw an extended border for the ring
			ctx.fillStyle = mixColor(normalizeValue(scale, 0.2, 0.8), "#2c2040", "#815884");

			var x = (this.ring_a[0].info.centerX - 1) * 3;
			var y = (this.ring_a[0].info.centerY - 1) * 3;
			
			ctx.beginPath();
			ctx.moveTo(-3*x, -3*y);
			ctx.lineTo( 3*x, -3*y);
			ctx.lineTo( 3*x,  3*y);
			ctx.lineTo(-3*x,  3*y);
			ctx.lineTo(-3*x, -3*y);

			ctx.lineTo(-x, -y);
			ctx.lineTo(-x, y);
			ctx.lineTo(x, y);
			ctx.lineTo(x, -y);
			ctx.lineTo(-x, -y);
			//ctx.lineTo(-2*x, -2*y);
			
			ctx.closePath();
			ctx.fill();
			
				
			ctx.restore();
   		}
    	
	}
	
	// Now absent any scaling, draw the bartender
	frame = this.bartenderflying.GetFrame();
			
	frame.Draw(	
					960 - frame.width/2 * pxScale, 
					1080 -frame.height * pxScale, 
					frame.width * pxScale,
					frame.height * pxScale );
	
	if (cutsceneToLevelTransition !== null && this.timer < this.transitionInTime)
	{
		// Draw the final frame from the last cutscene	
		ctx.save();
	
		var scale = 20 / (linearToSquareRemap(this.timer,0,this.transitionInTime,20,0.1));

		ctx.translate(224*pxScale,221*pxScale);
		ctx.scale( scale, scale );
	
		ctx.globalAlpha = 1-normalizeValue(this.timer, this.transitionInTime-60, this.transitionInTime);

		ctx.drawImage(	cutsceneToLevelTransition , 
					-224*pxScale, 
					-221*pxScale, 
					cutsceneToLevelTransition.width * pxScale,
					cutsceneToLevelTransition.height * pxScale );
		ctx.globalAlpha = 1.0;

		ctx.restore();
	}
	
	ctx.restore();
};

LevelStartTransition.prototype.Update = function()
{
	this.timer += 1;
	
	this.bartenderflying.Update();
	
	if (controller.startActivate())
	{
		GlobalMusic.stop(1.0);
		GlobalMusic.play(0);
		this.close = true;
	}
	
	if (this.timer === 1)
	{
		if (cutsceneToLevelTransition !== null)
		{
			this.eyeZoomSound = GlobalResourceLoader.GetSound("eyezoom").Play(1.0);
			this.tunnelSound = GlobalResourceLoader.GetSound("tunnel").Play(1.0, -1.6);
		}
		else
		{
			this.tunnelSound = GlobalResourceLoader.GetSound("tunnel").Play(1.0, -1.6-(this.transitionInTime)/60.0);
			this.timer = this.transitionInTime;
		}
	}
	
	// Spin the rings
	for (var i=0; i < this.rings.length; i++)
	{
		this.rings[i].rotation += this.rings[i].rotationVel;
	}
	
	if (this.timer > this.length)
		this.close = true;

	if (this.close)
	{	
		settings.cutsceneSmokeTunnel = true;
		saveSettings();
		
		cutsceneToLevelTransition = null;
		menuStack.splice(menuStack.length-1,1);
		
		if (this.eyeZoomSound !== null)
			this.eyeZoomSound.stop();
		if (this.tunnelSound !== null)
			this.tunnelSound.stop();
	}
};