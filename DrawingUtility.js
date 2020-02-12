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

GlobalResourceLoader.AddFontResource("alagard","images/alagard.ttf");

function cloneCanvas(canvas)
{
	var cloneCanvas = document.createElement("canvas");
	cloneCanvas.width = canvas.width;
	cloneCanvas.height = canvas.height;
	var localctx = cloneCanvas.getContext("2d");
	localctx.drawImage(canvas, 0, 0);
	return cloneCanvas;
};

function cloneCanvas1080p(canvas)
{
	var cloneCanvas = document.createElement("canvas");
	cloneCanvas.width = 640;
	cloneCanvas.height = 360;
	var localctx = cloneCanvas.getContext("2d");
	localctx.drawImage(canvas, 0, 0, 640, 360);
	return cloneCanvas;
};

function makeCanvasGrayscale(canvas)
{
  var localctx = canvas.getContext("2d");
  var imageData = localctx.getImageData(0,0,canvas.width,canvas.height);
  var d = imageData.data;
  
  for (var i=0; i<d.length; i+=4) 
  {
	var r = d[i];
	var g = d[i+1];
	var b = d[i+2];
	// CIE luminance for the RGB
	// The human eye is bad at seeing red and blue, so we de-emphasize them.
	var v = clamp((0.2126*r + 0.7152*g + 0.0722*b) * 0.8 - 50, 0,255);
	d[i] = d[i+1] = d[i+2] = v
  }
  
  localctx.putImageData(imageData, 0, 0);
  
};

function drawTextWithShadow(text, x, y, color)
{
	if (typeof color === "undefined" )
		color = "#FFF";
		
	var shadowColor = "#000";
	if (color === "#000" || color === "#000000")
	{
		shadowColor = "#FFF";
	}
	
	ctx.fillStyle = shadowColor;
	ctx.fillText(text,x-6,y+6);
	ctx.fillStyle = color;
	ctx.fillText(text,x,y);
}

function drawTextWithOutline(text, x, y, color)
{
	if (typeof color === "undefined" )
		color = "#FFF";
		
	var shadowColor = "#000";
	if (color === "#000" || color === "#000000")
	{
		shadowColor = "#FFF";
	}
	
	ctx.fillStyle = shadowColor;
	ctx.fillText(text,x-2,y-2);
	ctx.fillText(text,x-2,y+2);
	ctx.fillText(text,x+2,y-2);
	ctx.fillText(text,x+2,y+2);
	
	ctx.fillText(text,x-2,y);
	ctx.fillText(text,x+2,y);
	ctx.fillText(text,x,y-2);
	ctx.fillText(text,x,y+2);
	
	ctx.fillStyle = color;
	ctx.fillText(text,x,y);
}

function drawBoundingBox(box) 
{
  ctx.beginPath();
  ctx.rect(box.xMin,box.yMin,box.xMax-box.xMin,box.yMax-box.yMin);
  ctx.stroke();
}

function drawCircleInsideBoundingBox(box) 
{
      var centerX = box.centerX();
      var centerY = box.centerY();
      var radius = (box.yMax - box.yMin)/2.0;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
      ctx.stroke();
}

function drawCircle(centerX, centerY, radius) 
{
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
      ctx.stroke();
}

function drawCrosshairs(centerX, centerY, radius) 
{
      ctx.beginPath();
      ctx.moveTo(centerX-radius,centerY);
	  ctx.lineTo(centerX+radius,centerY);
	  ctx.moveTo(centerX,centerY-radius);
	  ctx.lineTo(centerX,centerY+radius);
      ctx.stroke();
}

function mirrorImage(image, destImage)
{
	if (image === null)
		return;
	var tcan = document.createElement("canvas");
	var tctx = tcan.getContext("2d");
	tcan.width = image.width;
	tcan.height = image.height;
	tctx.translate(image.width, 0);
	tctx.scale(-1, 1);
	tctx.drawImage(image, 0, 0, image.width, image.height);
	destImage.src = tcan.toDataURL();
};

function mirrorCanvas(image)
{
	if (image === null)
		return;
	var tcan = document.createElement("canvas");
	var tctx = tcan.getContext("2d");
	tcan.width = image.width;
	tcan.height = image.height;
	tctx.translate(image.width, 0);
	tctx.scale(-1, 1);
	tctx.drawImage(image, 0, 0, image.width, image.height);
	return tcan;
};

function drawRoundRect(x, y, width, height, radius, fill, stroke) 
{
  if (typeof stroke == "undefined" ) 
    stroke = true;
  if (typeof fill == "undefined" ) 
    fill = false;
  if (typeof radius === "undefined") 
    radius = 5;
    
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  
  if (fill)
    ctx.fill(); 
  
  if (stroke) 
    ctx.stroke();
    
  ctx.closePath();
};

function drawEntityRoundShadow(entity, radius, ratio)
{	
	if (typeof ratio === "undefined") 
		ratio = 0.2727;
		
	// Draw shadow
	ctx.globalAlpha = 0.4;
	ctx.fillStyle = "#000000";
	var shadowScale = 500 / (entity.posZ + 500);
	drawEllipse(0,0, shadowScale*radius, shadowScale*radius*ratio);
	ctx.globalAlpha = 1.0;
}

function drawEntityRectShadow(entity, x, y, width, height)
{	
	// Draw shadow
	ctx.globalAlpha = 0.4;
	ctx.fillStyle = "#000000";
	var shadowScale = 1;//500 / (entity.posZ + 500);
	var widthActual = shadowScale * width;
	var heightActual = shadowScale * height * 0.2727;
	ctx.fillRect(-widthActual / 2.0 + x, -heightActual / 2.0 + y, widthActual, heightActual);
	ctx.globalAlpha = 1.0;
}

function drawEllipse(centerX, centerY, width, height) 
{
  ctx.beginPath();
  
  ctx.moveTo(centerX, centerY - height/2); // A1
  
  ctx.bezierCurveTo(
    centerX + width/2, centerY - height/2, // C1
    centerX + width/2, centerY + height/2, // C2
    centerX, centerY + height/2); // A2

  ctx.bezierCurveTo(
    centerX - width/2, centerY + height/2, // C3
    centerX - width/2, centerY - height/2, // C4
    centerX, centerY - height/2); // A1
    
  ctx.fill();
  ctx.closePath();	
};

var pacmanCanvas = null;
var pacmanCtx = null;
function DrawPacmanIndicator(value, zheight, startColor, endColor)
{	
	if (pacmanCanvas === null)
	{
		pacmanCanvas = document.createElement("canvas");
		pacmanCanvas.width = 30;
		pacmanCanvas.height = 30;
		pacmanCtx = pacmanCanvas.getContext("2d");
		pacmanCtx.imageSmoothingEnabled = false;
		pacmanCtx.webkitImageSmoothingEnabled = false;
		pacmanCtx.mozImageSmoothingEnabled = false;
		pacmanCtx.className = "gameCanvas";
	}
	
	// Clear the pacman canvas
	pacmanCtx.clearRect(0, 0, pacmanCanvas.width, pacmanCanvas.height);

	var radius = 8;

	var color = '#00FF00';
	if (typeof startColor != "undefined" && typeof endColor == "undefined") 
		color = startColor;
	else if (typeof startColor != "undefined" && typeof endColor != "undefined") 
		color = mixColor(value, startColor, endColor);

	pacmanCtx.beginPath();
	pacmanCtx.moveTo(15,15);
	pacmanCtx.arc(15, 15, radius, -0.5*Math.PI, ((value * 2)-0.5) * Math.PI, false);
	pacmanCtx.fillStyle = color;
	pacmanCtx.fill();

	pacmanCtx.beginPath();
	pacmanCtx.arc(15, 15, radius, 0, 2 * Math.PI, false);
	pacmanCtx.lineWidth = 1;
	pacmanCtx.strokeStyle = '#FFFFFF';
	pacmanCtx.stroke();

	// Draw the pacman canvas on to the real canvas
	ctx.globalCompositeOperation = "screen";
	ctx.drawImage(pacmanCanvas, 0, 0, 30, 30, -45, -45 + zheight, 90, 90);
	ctx.globalCompositeOperation = "source-over";
};

function mixColor(mix, startColor, endColor)
{
	var rgb1 = parseColor(startColor);
	var rgb2 = parseColor(endColor);
	
	var r = linearRemap(mix, 0, 1, rgb1[0], rgb2[0]);
	var g = linearRemap(mix, 0, 1, rgb1[1], rgb2[1]);
	var b = linearRemap(mix, 0, 1, rgb1[2], rgb2[2]);
		
	return "rgb(" + Math.round(r).toString() + "," + 
				Math.round(g).toString() + "," +
				Math.round(b).toString() + ")";
};

function parseColor(color) {
    color = color.trim().toLowerCase();
    //color = _colorsByName[color] || color;
    var hex3 = color.match(/^#([0-9a-f]{3})$/i);
    if (hex3) {
        hex3 = hex3[1];
        return [
            parseInt(hex3.charAt(0),16)*0x11,
            parseInt(hex3.charAt(1),16)*0x11,
            parseInt(hex3.charAt(2),16)*0x11, 1
        ];
    }
    var hex6 = color.match(/^#([0-9a-f]{6})$/i);
    if (hex6) {
        hex6 = hex6[1];
        return [
            parseInt(hex6.substr(0,2),16),
            parseInt(hex6.substr(2,2),16),
            parseInt(hex6.substr(4,2),16), 1
        ];
    }
    var rgba = color.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+.*\d*)\s*\)$/i) || color.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if( rgba ) {
        return [rgba[1],rgba[2],rgba[3], rgba[4]===undefined?1:rgba[4]];
    }
    var rgb = color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if( rgb ) {
        return [rgb[1],rgb[2],rgb[3],1];
    }
    /*
    if(color.indexOf('hsl')== 0)
        return _hslToRgb(color);
    */
    return [0,0,0,0];
}

function hvToRBGString(h,v)
{
	if (v < 0)
		v = 0;
	else if (v > 1)
		v = 1
		
	var r, g, b;

	if (h > 0 && h < 0.166)
	{
		r = 255 * v;
		g = h * 1530 * v;
		b = 0;
	}
	else if (h >= 0.166 && h < 0.333)
	{
		r = (0.333 - h) * 1530 * v;
		b = 0;
		g = 255 * v;
	}
	else if (h >= 0.333 && h <0.5)
	{
		r = 0;
		g = 255 * v;
		b = (h - 0.333) * 1530 * v;
	}
	else if (h >= 0.5 && h <0.666)
	{
		r = 0;
		g = (0.666- h) * 1530 * v;
		b = 255 * v;
	}
	else if (h >= 0.666 && h <0.833)
	{
		r = (h - 0.666) * 1530 * v;
		g = 0;
		b = 255 * v;
	}
	else if (h >= 0.833 && h <1)
	{
		r = 255 * v;
		g = 0;
		b = (1 - h) * 1530 * v;
	}
	else
	{
		g = 0;
		r = 255 * v;
		b = 0;
	}
	
	
	return "rgb(" + Math.round(r).toString() + "," + 
	                Math.round(g).toString() + "," +
	                Math.round(b).toString() + ")";
};