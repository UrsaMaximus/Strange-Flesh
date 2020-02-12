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

function EntityList()
{
	this.drawList = [];
	this.list = [];
	this.effects = [];
};

EntityList.prototype.AddEntity = function(entity)
{
	var listIndex = this.list.indexOf(entity);
	var drawListIndex = this.drawList.indexOf(entity);
	
	if (drawListIndex === -1)
		this.drawList.push(entity);
	if (listIndex === -1)
		this.list.push(entity);
};

EntityList.prototype.AddEffect = function(entity)
{
	var listIndex = this.effects.indexOf(entity);
	var drawListIndex = this.drawList.indexOf(entity);
	
	if (drawListIndex === -1)
		this.drawList.push(entity);
	if (listIndex === -1)
		this.effects.push(entity);
};

EntityList.prototype.Remove = function(entity)
{
	var listIndex = this.list.indexOf(entity);
	var effectsIndex = this.effects.indexOf(entity);
	var drawListIndex = this.drawList.indexOf(entity);
	if (listIndex !== -1)
		this.list.splice(listIndex,1);
	if (effectsIndex !== -1)
		this.effects.splice(effectsIndex,1);
	if (drawListIndex !== -1)
		this.drawList.splice(drawListIndex,1);
};

EntityList.prototype.RemoveFromListAt = function(i)
{
	var drawListIndex = this.drawList.indexOf(this.list[i]);
	this.drawList.splice(drawListIndex,1);
	this.list.splice(i,1);
};

EntityList.prototype.RemoveFromEffectsAt = function(i)
{
	var drawListIndex = this.drawList.indexOf(this.effects[i]);
	this.drawList.splice(drawListIndex,1);
	this.effects.splice(i,1);
};

EntityList.prototype.RemoveFromDrawListAt = function(i)
{
	var listIndex = this.list.indexOf(this.drawList[i]);
	var effectsIndex = this.effects.indexOf(this.drawList[i]);
	if (listIndex !== -1)
		this.list.splice(listIndex,1);
	if (effectsIndex !== -1)
		this.effects.splice(effectsIndex,1);
	this.drawList.splice(i,1);
};

EntityList.prototype.GetOrderedDrawList = function()
{
	this.drawList.sort(DepthCompareEntities);
	return this.drawList;
};

EntityList.prototype.FindClosestEntityOfType = function(entity, searchRadius, targetType)
{
	var minDist = searchRadius;
	var minDistEntity = null;
	for (var i=0; i < this.list.length; i++)
	{
		// Don't find allies or neutral parties
		if (this.list[i] instanceof targetType)
		{
			var dist = distanceActorToActor(entity, this.list[i]);
			if (dist < minDist)
			{
				minDist = dist;
				minDistEntity = this.list[i];
			}
		}
	}
	return minDistEntity;
};

EntityList.prototype.FindClosestEnemy = function(entity, searchRadius)
{
	var minDist = searchRadius;
	var minDistEntity = null;
	for (var i=0; i < this.list.length; i++)
	{
		// Don't find allies or neutral parties
		if (this.list[i].alliance !== 0 && this.list[i].alliance !== entity.alliance && IsAttackable(this.list[i].state))
		{
			if (this.list[i] instanceof Joe0 && this.list[i].recruited === false)
				continue;
				
			var dist = distanceActorToActor(entity, this.list[i]);
			if (dist < minDist)
			{
				minDist = dist;
				minDistEntity = this.list[i];
			}
		}
	}
	return minDistEntity;
};


EntityList.prototype.FindHornyAlly = function(entity, searchRadius)
{
	var minDist = searchRadius;
	var minDistEntity = null;
	for (var i=0; i < this.list.length; i++)
	{
		// Don't find allies or neutral parties
		if (this.list[i].alliance === entity.alliance && entity !== this.list[i] && !IsInvulnerable(this.list[i].state) && this.list[i].hasOwnProperty("recruited") && this.list[i].recruited === true)
		{
			var dist = distanceActorToActor(entity, this.list[i]);
			if (dist < minDist)
			{
				minDist = dist;
				minDistEntity = this.list[i];
			}
		}
	}
	return minDistEntity;
};

EntityList.prototype.GetEntitiesInRadius = function(entity, searchRadius)
{
	var entitiesFound = [];
	for (var i=0; i < this.list.length; i++)
	{
		var dist = distanceActorToActor(entity, this.list[i]);
		if (dist < searchRadius)
		{
			entitiesFound.push(this.list[i]);
		}
	}
	return entitiesFound;
};

EntityList.prototype.AddEnemiesInRect = function(entitiesFound,rect)
{
	for (var i=0; i < this.list.length; i++)
	{
		if (this.list[i].alliance === 2 && !IsCorrupt(this.list[i].state) && rect.PointIntersect(this.list[i].posX,this.list[i].posY))
		{
			entitiesFound.push(this.list[i]);
		}
	}
};

EntityList.prototype.AddEntityList = function(otherEntityList)
{
	for (var i = 0; i < otherEntityList.list.length; i++)
	{
		this.AddEntity(otherEntityList.list[i]);
	}
	for (var i = 0; i < otherEntityList.effects.length; i++)
	{
		this.AddEffect(otherEntityList.effects[i]);
	}
};

function DepthCompareEntities(a,b)
{
	var aPosBonus = 0;
	var bPosBonus = 0;
	
	if (a.hasOwnProperty("orderBonus"))
	{
		aPosBonus = a.orderBonus;
	}
	
	if (b.hasOwnProperty("orderBonus"))
	{
		bPosBonus = b.orderBonus;
	}
	
	if (a.hasOwnProperty("attack"))
	{
		if (a.attack !== null)
			aPosBonus += a.hitRect.height()/2.0;
	}
	if (b.hasOwnProperty("attack"))
	{
		if (b.attack !== null)
			bPosBonus += b.hitRect.height()/2.0;
	}
	
	
  if (a.posY+aPosBonus > b.posY+bPosBonus)
  {
    return 1;
  }
  if (a.posY+aPosBonus < b.posY+bPosBonus) 
  {
    return -1;
  }

    if (a.objectID > b.objectID) 
	{
    return 1;
  	}
  if (a.objectID < b.objectID) {
    return -1;
  }
  
  return 0;
};