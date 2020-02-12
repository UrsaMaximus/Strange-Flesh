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

function MatrixTransformation2D() 
{
	this.a = 1;
	this.b = 0;
	this.c = 0;
	this.d = 1;
	this.e = 0;
	this.f = 0;
	
	this.aInv = 1;
	this.bInv = 0;
	this.cInv = 0;
	this.dInv = 1;
	this.eInv = 0;
	this.fInv = 0;
	
	this.posX = 0;
	this.posY = 0;
	
	this.centerOfRotationX = 0;
	this.centerOfRotationY = 0;
	
	this.scale = 1;
	this.rotation = 0;
	
	this.invalid = true;
};

MatrixTransformation2D.prototype.setXYTS = function(x, y, theta, scale)
{
	this.posX = x;
	this.posY = y;
	this.scale = scale;
	this.rotation = theta;
	this.invalid = true;
};

MatrixTransformation2D.prototype.copyPosition = function(otherObject)
{
	this.posX = otherObject.posX + otherObject.effectOffsetX;
	this.posY = otherObject.posY + otherObject.effectOffsetY;
	this.scale = otherObject.scale * otherObject.ratioTo1080p;
	this.rotation = otherObject.rotation;
	this.invalid = true;
};

MatrixTransformation2D.prototype.setCanvasTransform = function()
{
	this.updateTransform();
	ctx.setTransform(this.a,this.b,this.c,this.d,this.e,this.f);
};

MatrixTransformation2D.prototype.mapPointFromLocalToWorld = function(pos)
{
	this.updateTransform();
	var x = pos.x*this.a + pos.y*this.c + 1*this.e;
	var y = pos.x*this.b + pos.y*this.d + 1*this.f;
	return {'x':x, 'y':y};
};

MatrixTransformation2D.prototype.mapPointFromWorldToLocal = function(pos)
{
	this.updateTransform();
	var x = pos.x*this.aInv + pos.y*this.cInv + 1*this.eInv;
	var y = pos.x*this.bInv + pos.y*this.dInv + 1*this.fInv;
	return {'x':x, 'y':y};
};

MatrixTransformation2D.prototype.updateTransform = function()
{
	if (this.invalid)
	{
		this.a = 1;
		this.b = 0;
		this.c = 0;
		this.d = 1;
		this.e = 0;
		this.f = 0;

		// Rotate
		this.rotateMatrixRHS(this.rotation);
	
		// Place the point we want to expand / rotate around at 0,0
		this.multiplyMatrixRHS(1,0,0,1,-this.posX,-this.posY);
	
		// Scale
		this.multiplyMatrixLHS(this.scale,0,0,this.scale,0,0);
	
		// Move the center point to the center of the canvas
		this.multiplyMatrixLHS(1,0,0,1,this.centerOfRotationX,this.centerOfRotationY);
	
		this.calculateInverse();
		this.invalid = false;
	}
};

MatrixTransformation2D.prototype.multiplyMatrixRHS = function(g,h,i,j,k,l)
{
	this.a = this.a*g + this.c*h;
	this.c = this.a*i+this.c*j;
	this.e = this.e + this.a*k + this.c*l;
	this.b = this.b*g + this.d*h;
	this.d = this.b*i+this.d*j;
	this.f = this.f + this.b*k + this.d*l;
};

MatrixTransformation2D.prototype.multiplyMatrixLHS = function(g,h,i,j,k,l)
{
	this.a = this.a*g + this.b*i;
	this.c = this.c*g+this.d*i;
	this.e = this.e*g + this.f*i + k;
	this.b = this.a*h + this.b*j;
	this.d = this.c*h+this.d*j;
	this.f = this.e*h + this.f*j + l;
};

MatrixTransformation2D.prototype.rotateMatrixRHS = function(angle)
{
	var c = Math.cos(angle);
	var s = Math.sin(angle);
	var m11 = this.a * c + this.c * s;
	var m12 = this.b * c + this.d * s;
	var m21 = this.a * -s + this.c * c;
	var m22 = this.b * -s + this.d * c;
	this.a = m11;
	this.b = m12;
	this.c = m21;
	this.d = m22;
};

MatrixTransformation2D.prototype.calculateInverse = function()
{
	this.aInv = this.d/(this.a*this.d-this.b*this.c);
	this.cInv = this.c/(this.b*this.c-this.a*this.d);
	this.eInv = (this.d*this.e-this.c*this.f)/(this.b*this.c-this.a*this.d);
	this.bInv = (this.b)/(this.b*this.c-this.a*this.d);
	this.dInv = (this.a)/(this.a*this.d-this.b*this.c);
	this.fInv = (this.b*this.e-this.a*this.f)/(this.a*this.d-this.b*this.c);
};