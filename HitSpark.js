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

GlobalResourceLoader.AddImageResource("sheet_Spark","images/effect/sheet_Spark.txt");

function HitSpark(owner,posX,posZ)
{
	this.serializable = false;
	
	this.objectID = nextObjectID++;
	
	// State
	this.state = States.Unknown;
	this.enabled = true;
	this.owner = owner;
	this.facing = owner.facing;
	this.alliance = owner.alliance;
	this.timer = 0;
	this.attack = null;
	this.alpha = 1.0;
	
	// Physics
	this.posX = this.owner.posX + posX;
	this.posY = this.owner.posY;
	this.posZ = this.owner.posZ + posZ;
	this.rotation = 0;
	this.scale = 3.0;
	this.velX = this.owner.velX;
	this.velY = this.owner.velY;
	this.velZ = this.owner.velZ;
	
	// Drawing
	this.orderBonus = 50;
	//this.spriteCenterX = 34.5;
	//this.spriteCenterY = 34.5;
	
	// Define the main animation
	this.HitSparkAnim = new Animation(this);
	this.HitSparkAnim.repeat = 0;
	this.HitSparkAnim.AddFrame("Effect/spark1");
	this.HitSparkAnim.AddFrame("Effect/spark2");
	this.HitSparkAnim.AddFrame("Effect/spark3");
	this.HitSparkAnim.AddFrame("Effect/spark4");
	this.HitSparkAnim.AddFrame("Effect/spark5");
	this.HitSparkAnim.AddFrame("Effect/spark6");
	this.HitSparkAnim.SetDurationInSeconds(0.2);
};

HitSpark.prototype.Die = function()
{
	this.enabled = false;
	this.state = States.Dead;
};

HitSpark.prototype.Respawn = function(pos)
{
	this.enabled = true;
	this.posX = pos.x;
	this.posY = pos.y;
	this.posZ = pos.z;
	this.velX = 0;
	this.velY = 0;
	this.velZ = 0;
	this.state = States.Unknown;
};

HitSpark.prototype.Draw = function()
{
	if (this.enabled)
	{
		ctx.translate(this.posX,this.posY);
    	
    	// Draw the animation
    	var image = this.HitSparkAnim.GetFrame();
    		
    	ctx.globalCompositeOperation = "lighter";
    	ctx.globalAlpha=this.alpha;
		image.DrawSprite3x(0,-this.posZ,this.HitSparkAnim.GetFlipped());
    	ctx.globalAlpha=1.0;
    	ctx.globalCompositeOperation = "source-over";
    	
    	// If it's late enough, draw all smoke effect children
    	ctx.translate(-this.posX,-this.posY);
	}
};

HitSpark.prototype.Update = function()
{
	if (this.enabled)
	{
		// Update the timer
		this.timer += 1;
		this.posX+=this.velX;
		this.posY+=this.velY;
		this.posZ+=this.velZ;
		
		// Update the animations
		this.HitSparkAnim.Update();
		
		// If it's time to die, then die
		if (this.HitSparkAnim.done)
		{
			this.state = States.Dead;
		}
	}
};

HitSpark.prototype.Push = function(otherEntity)
{
	// This object cannot be moved
};

HitSpark.prototype.Hit = function(attack)
{
	// This object cannot be hurt
};