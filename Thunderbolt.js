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

GlobalResourceLoader.AddAudioResource("fartherfigure_attack","sound/enemies/fartherfigure_attack.mp3");
GlobalResourceLoader.AddAudioResource("fartherfigure_charge","sound/enemies/fartherfigure_charge.mp3");

function Thunderbolt(color)
{
	this.displayName = "Thunderbolt";
	this.serializable = false;
	
	this.attackSFX = GlobalResourceLoader.GetSound("fartherfigure_attack");
	this.chargeSFX = GlobalResourceLoader.GetSound("fartherfigure_charge");
	
	if(typeof(color)==='undefined') 
		color = "red";
	this.color = color;
	
	// State
	this.state = States.Unknown;
	this.facing = 1;
	this.alliance = 2;
	this.timer = 0;
	
    this.attack = null;
	
	// Physics
	this.rotation = 0;
	this.scale = 3.0;
	this.posX = 0;
	this.posY = 0;
	this.posZ = 0;
	this.velX = 0;
	this.velY = 0;
	this.velZ = 0;
	
	// Drawing
	this.orderBonus = 50;

	this.animationSetup();
};

Thunderbolt.prototype.Draw = function()
{
};

Thunderbolt.prototype.Update = function()
{	
	this.posZ = 0;
	this.timer += 1;
	
	
	// Start the marker
	if (this.timer === 1)
	{
		// Sound wave effect animation
		var marker = new EffectAnimation(this.markerAnim);
		marker.posX = this.posX;
		marker.posY = this.posY;
		marker.facing = this.facing;
		level.entities.AddEffect(marker);
		
		this.chargeSFX.Play();
	}
	// Start the bolt +  attack then die
	else if (this.timer === 80)
	{
		// Sound wave effect animation
		var thunder = new EffectAnimation(this.thunderAnim);
		//thunder.spriteCenterX = 95;
		//thunder.spriteCenterY = 342;
		thunder.posX = this.posX;
		thunder.posY = this.posY;
		thunder.facing = this.facing;
		level.entities.AddEffect(thunder);
		
		// Thunder attack
		var thunderAttack = new Attack(this);
		thunderAttack.positionOwner = thunder;	// This attack is attached to the soundwave
		thunderAttack.damageDealt = 75;
		thunderAttack.staminaDrained = 0.7;
		var box = new BoundingRect();
		box.Resize(100,75);
		thunderAttack.attackbox = box;
		thunderAttack.zHeight = 0;
		thunderAttack.zSize = 2000;
		thunderAttack.visualContactX = 0;
		thunderAttack.visualContactZ = 150;
		thunderAttack.alliance = this.alliance;
		thunderAttack.warmupframes = 8;
		thunderAttack.attackFrames = 1;
		thunderAttack.remainActiveUntil = 0;
		thunderAttack.Attack();
		
		this.attackSFX.Play();
			
		this.state = States.Dead;
	}
	
};

// All the animation frames associated with the Thunderbolt. These are in a sprite sheet.
GlobalResourceLoader.AddImageResource("sheet_Thunderbolt","images/effect/sheet_Thunderbolt.txt");

Thunderbolt.prototype.animationSetup = function()
{
	if (this.color === "red")
	{
		this.thunderAnim = new Animation(this, "RedThunderbolt/thunder{0}", 7, 1/15*7);
		this.thunderAnim.repeat = 0;
		this.thunderAnim.inheritFacing = 1;
	
		this.markerAnim = new Animation(this, "RedThunderbolt/marker{0}", 17, 1.4);
		this.markerAnim.repeat = 0;
		this.markerAnim.inheritFacing = 1;
	}
	else
	{
		this.thunderAnim = new Animation(this, "BlueThunderbolt/thunder{0}", 7, 1/15*7);
		this.thunderAnim.repeat = 0;
		this.thunderAnim.inheritFacing = 1;
	
		this.markerAnim = new Animation(this, "BlueThunderbolt/marker{0}", 17, 1.4);
		this.markerAnim.repeat = 0;
		this.markerAnim.inheritFacing = 1;
	}
};