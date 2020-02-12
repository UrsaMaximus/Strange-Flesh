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

function clonePosition(entity)
{
	return {"posX": entity.posX, "posY": entity.posY, "posZ": entity.posZ};
}

// Input a value and some limits and get back a value [0 , 1]
function normalizeValue(linear, min, max)
{
	 var val = (linear-min)/(max-min);
	 if (val > 1)
	 	return 1;
	 else if (val < 0)
	 	return 0;
	 else
	 	return val;
};

// Input a value an input range and an output range, and get the value scaled into the output range
function linearRemap(input, minInput, maxInput, minOutput, maxOutput)
{
	 var val = (input-minInput)/(maxInput-minInput);
	 if (val > 1)
	 	return maxOutput;
	 else if (val < 0)
	 	return minOutput;
	 else
		return (maxOutput - minOutput)*val+minOutput;
};

function placeEntityInsideBox(entity, box)
{
	if (entity === null)
		return;
			
	if (entity.posX < box.xMin)
		entity.posX = box.xMin + entity.collisionRadius;
	if (entity.posX > box.xMax)
		entity.posX = box.xMax - entity.collisionRadius;
	if (entity.posY < box.yMin)
		entity.posY = box.yMin + entity.collisionRadius;
	if (entity.posY > box.yMax)
		entity.posY = box.yMax - entity.collisionRadius;
};

// Input a value [0,1] and a linear path and get back an XY position along the line
function parametric2DPosition(t, minX, maxX, minY, maxY)
{
	 return {x: t*(maxX-minX)+minX, y: t*(maxY-minY)+minY};
};

function distanceActorToActor(obj1, obj2)
{
	return Math.sqrt(Math.pow(obj1.posX-obj2.posX,2)+Math.pow(obj1.posY-obj2.posY,2));
};

function distance3DActorToActor(obj1, obj2)
{
	return Math.sqrt(Math.pow(obj1.posX-obj2.posX,2)+Math.pow(obj1.posY-obj2.posY,2)+Math.pow(obj1.posZ-obj2.posZ,2));
};

function angleActorToActor(obj1, obj2)
{
	return Math.atan2(obj2.posY-obj1.posY,obj2.posX-obj1.posX);
};

function angle2d(x1,y1,x2,y2)
{
	return Math.atan2(y2-y1,x2-x1);
};

function angleDistance(a1,a2)
{
	var distance = a1-a2;
	
	while (distance < -Math.PI)
	{
		distance += Math.PI*2;
	}
	
	while (distance > Math.PI)
	{
		distance -= Math.PI*2;
	}
	
	return distance;
};

function normalizeAngle(angle)
{
	while (angle < -Math.PI)
	{
		angle += Math.PI*2;
	}
	
	while (angle > Math.PI)
	{
		angle -= Math.PI*2;
	}
	
	return angle;
};

function angleDistancePositive(a1,a2)
{
	var distance = a1-a2;
	
	while (distance < -Math.PI/2)
	{
		distance += Math.PI*2;
	}
	
	while (distance > 2*Math.PI)
	{
		distance -= Math.PI*2;
	}
	
	return distance;
};

function angleDistanceNegative(a1,a2)
{
	var distance = a1-a2;
	
	while (distance < -2*Math.PI)
	{
		distance += Math.PI*2;
	}
	
	while (distance > Math.PI/2)
	{
		distance -= Math.PI*2;
	}
	
	return distance;
};

function speed2(velX,velY) 
{ 
	return Math.sqrt(Math.pow(velX,2) + Math.pow(velY,2));
};

function speed3(velX,velY,velZ) 
{ 
	return Math.sqrt(Math.pow(velX,2) + Math.pow(velY,2) + Math.pow(velZ,2));
};

function distance(x1,y1,x2,y2) 
{ 
	return Math.sqrt(Math.pow(x1 - x2,2) + Math.pow(y1 - y2,2));
};

function distanceSquared(x1,y1,x2,y2) 
{ 
	return Math.pow(x1 - x2,2) + Math.pow(y1 - y2,2);
};

function linearToSquareRemap(input, minInput, maxInput, minOutput, maxOutput)
{
	 var val = (input-minInput)/(maxInput-minInput);
	 if (val > 1)
	 	return maxOutput;
	 else if (val < 0)
	 	return minOutput;
	 else
		return (maxOutput - minOutput)*Math.pow(val,2)+minOutput;
};

// Input a value and get back 0 to 1 where it is between min and max, clamped 
// and with a sigmoid transform applied for smooth animations
function linearToSigmoidRemap(linear, min, max)
{
	linear = normalizeValue(linear, min, max);
	
	if (linear <= 0)
		return 0;
	if (linear >= 1)
		return 1;
		
	var sigmoid = 1.01/(1+Math.pow(2,-18*(linear-0.5)))-0.005;
	
	if (sigmoid < 0)
		return 0;
	if (sigmoid > 1)
		return 1;
	
	return sigmoid;
};

function modPositive(m,n) 
{
    return ((m%n)+n)%n;
};

function clamp(val, min, max)
{
	if (val < min)
		return min;
	if (val > max)
		return max;
	return val;
};

function moveForwardInArray(obj, arr)
{
	for (var i=0; i < arr.length-1; i++)
	{
		if (obj === arr[i])
		{
			 arr[i] = arr[i+1];
			 arr[i+1] = obj;
			 return;
		}
	}
};

function moveBackwardInArray(obj, arr)
{
	for (var i=1; i < arr.length; i++)
	{
		if (obj === arr[i])
		{
			 arr[i] = arr[i-1];
			 arr[i-1] = obj;
			 return;
		}
	}
};

function setCookie(cname,cvalue,exdays)
{
	var d = new Date();
	d.setTime(d.getTime()+(exdays*24*60*60*1000));
	var expires = "expires="+d.toGMTString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
};

function getCookie(cname)
{
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) 
	{
	  var c = ca[i].trim();
	  if (c.indexOf(name)==0) 
		return c.substring(name.length,c.length);
	}
	return "";
};

function sign(x) 
{
    return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
};

function signWithoutZero(x) 
{
    return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 1 : NaN : NaN;
};

function roundToMultipleOfThree(num) 
{
  return Math.round(num / 3) * 3;
};

function getRandomItemFromArray(collection)
{
	var index = Math.floor(collection.length*Math.random());
	return collection[index];			
};

function randomVelocity(min, max)
{
	var sign = Math.random();
	if (sign >= 0.5)
	{
		return (Math.random() * (max-min) + min);
	}
	else
	{
		return -(Math.random() * (max-min) + min);
	}
};

function endsWith(str, suffix) 
{
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function crawlValue(currentVal, targetVal, rate)
{
	rate = Math.abs(rate);
	if (Math.abs(currentVal - targetVal) <= rate)
		return targetVal;
	else if (currentVal < targetVal)
		return currentVal + rate;
	else (currentVal > targetVal)
		return currentVal - rate;
};

function crawlValueInFrames(currentVal, targetVal, frames)
{
	if (frames === 0)
		return targetVal;
	rate = (targetVal - currentVal) / frames;
	return currentVal + rate;
};

String.format = function(format) 
{
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number] 
        : match
      ;
    });
};

var stringToFunction = function(str) 
{
  var arr = str.split(".");

  var fn = (window || this);
  for (var i = 0, len = arr.length; i < len; i++) {
    fn = fn[arr[i]];
  }

  if (typeof fn !== "function") {
    throw new Error("function not found");
  }

  return  fn;
};

function getStringFromKeyCode(key)
{
	// A-Z
	if (key >= 65 && key <= 90)
		return String.fromCharCode(key);
	
	// a-z
	if (key >= 97 && key <= 122)
		return String.fromCharCode(key-32);
	
	// Special keys
	if (key === 32)
		return "Space";
	if (key === 13)
		return "Enter";
	if (key === 9)
		return "Tab";
	if (key === 27)
		return "Esc";
	if (key === 8)
		return "Backspace";
	
	// Modifier keys
	if (key === 16)
		return "Shift";
	if (key === 17)
		return "Control";
	if (key === 18)
		return "Alt";
	if (key === 20)
		return "Caps Lock";
	if (key === 144)
		return "Num Lock";
	
	if (key === 186)
		return ";";
		
	// Arrows
	if (key === 37)
		return "Left";
	if (key === 38)
		return "Up";
	if (key === 39)
		return "Right";
	if (key === 40)
		return "Down";

	// More key names...
	if (key === 45)
		return "Insert";
	if (key === 46)
		return "Delete";
	if (key === 36)
		return "Home";
	if (key === 35)
		return "End";
	if (key === 33)
		return "Page Up";
	if (key === 34)
		return "Page Down";
	
	// Function keys
	if (key >= 112 && key <= 123)
		return "F"+(key-111).toString();
	
	// For all other keys, give up and print the code
	return "C" + key.toString();
};