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

function RandomSoundCollection(name,start,stop)
{
	this.sounds = [];
	
	if(typeof(name)!=='undefined')
	{
		if(typeof(start)==='undefined')
		{
			this.sounds.push(GlobalResourceLoader.GetSound(name));
		}
		else if(typeof(stop)==='undefined')
		{
			this.AddSounds(name,1,start);
		}
		else if(typeof(stop)!=='undefined')
		{
			this.AddSounds(name,start,stop);
		}
	}
};

RandomSoundCollection.prototype.AddSounds = function(name,start,stop)
{
	if (start > stop)
	{
		for (var i=start; i >= stop; i--)
		{
			this.sounds.push(GlobalResourceLoader.GetSound(String.format(name, i.toString())));
		}
	}
	else
	{
		for (var i=start; i <= stop; i++)
		{
			this.sounds.push(GlobalResourceLoader.GetSound(String.format(name, i.toString())));
		}
	}
};


RandomSoundCollection.prototype.Play = function(volume, delay)
{
	var index = Math.floor(this.sounds.length*Math.random());
	return this.sounds[index].Play(volume,delay);
};

