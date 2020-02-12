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

var States = {
  Unknown: 0,
  Walk: 1,
  Run: 2,
  SmokeWalk: 3,
  BlowSmoke: 4,
  BasicAttack:5,
  Tackle:6,
  Jump:7,
  AirKick:8,
  DiveKick:9,
  Fall:10,
  FallHelpless:11,
  HitStun:12,
  KnockedOut:13,
  GetUp:14,
  Grab:15,
  Drag:16,
  Release:17,
  Throw:18,
  CaptivePunch:19,
  CaptiveFinish:26,
  SmokeKiss:20,
  Grabbed:21,
  Dying:22,
  Dead:23,
  Captive:24,
  CaptiveHitStun:27,
  CaptiveLift:28,
  CaptiveSmokeKiss:29,
  Thrown:25,
  FallAfterSmokeKiss:30,
  CorruptionTransform:31,
  Corrupt:32,
  RunStumble:33,
  Dash:34,
  LoseBoner:35,
  CaptiveSexTop:36,	// Top
  CaptiveSexBottom:37,	// Bottom
  CorruptOrgasm:38,
  LoseBoner:39,
  GrabFail:40,
  CorruptOrgasmAfterSex:41,
  Spawning:42,
  DesperationAttack:43,
  QuickSmokeAttack:44,
  CorruptPrepareBeforeSex:45,
  PrepareSexTop:46,
  BeforeSexTop:47,
  AfterSexTop:48,
  DrunkRun:49,
  DrunkRunFall:50,
  Cheering:51,
  Snared:52,
  Transforming:53,
  TransformedWalk:54,
  FinishBoss:55,
  CutsceneWalk:56,
  PreCorrupt: 57,
  Sidehop: 58,
  VulnerableDash: 59,
  Taunt: 60,
};

function OkToSave(state)
{
	return (state === States.Walk ||
			state === States.Run ||
			state === States.Jump || 
			state === States.Fall    ||
			state === States.FallHelpless ||
			state === States.Spawning);
};

function GetStateName( value ) 
{
    for( var prop in States ) 
    {
        if( States.hasOwnProperty( prop ) ) 
        {
             if( States[ prop ] === value )
                 return prop;
        }
    }
    return "Unknown";
}

function IsCorrupt(state)
{
	return (state === States.CorruptionTransform ||
			state === States.Corrupt ||
			state === States.PreCorrupt ||
			state === States.CorruptPrepareBeforeSex ||
			state === States.CaptiveSexBottom || 
			state === States.CorruptOrgasm    ||
			state === States.CorruptOrgasmAfterSex);
};

function IsCorruptDying(state)
{
	return (state === States.CorruptOrgasm    ||
			state === States.CorruptOrgasmAfterSex);
};

function IsCaptiveVulnerable(state)
{
	return (state === States.Captive);
};
	
function IsCaptive(state)
{
	return (state === States.Captive ||
			state === States.CaptiveHitStun ||
			state === States.CaptiveLift ||
			state === States.CaptiveSmokeKiss ||
			state === States.CaptiveSexBottom || 
			state == States.Hitstun);
};

function IsKnockedBack(state)
{
	return (state === States.Captive ||
			state === States.CaptiveHitStun ||
			state === States.CaptiveLift ||
			state === States.CaptiveSmokeKiss ||
			state === States.CaptiveSexBottom ||  
			state === States.Fall ||
			state === States.FallHelpless ||
			state === States.HitStun ||
			state === States.KnockedOut ||
			state === States.GetUp ||
			state === States.Dying ||
			state === States.Dead ||
			state === States.Thrown ||
			state === States.FallAfterSmokeKiss ||
			state === States.CorruptionTransform ||
			state === States.Corrupt );
};


function IsPassthrough(state)
{
	return (state === States.Captive ||
			state === States.CaptiveHitStun ||
			state === States.CaptiveLift ||
			state === States.CaptiveSmokeKiss ||
			state === States.CorruptPrepareBeforeSex ||
			state === States.CaptiveSexBottom ||
			state === States.CaptiveSexTop ||
			state === States.PrepareSexTop ||
  			state === States.BeforeSexTop ||
  			state === States.AfterSexTop ||
			state === States.Dash ||
			state === States.Sidehop ||
			state === States.AirKick ||
			state === States.DesperationAttack ||
			state === States.Dying ||
			state === States.Dead   ||
			state === States.CorruptOrgasmAfterSex ||
			state === States.Spawning ||
			state === States.Transforming || 
  			state === States.FinishBoss ||
  			state === States.CorruptionTransform || 
  			state === States.CutsceneWalk);
};

function IsDeadOrDying(state)
{
	return (state === States.Dying ||
			state === States.Dead);	
};

function IsAttackable(state)
{
	return (!IsInvulnerable(state) || 
			state === States.Captive ||
			state === States.CaptiveHitStun);
};

function IsInvulnerable(state)
{
	return (state === States.KnockedOut ||
			state === States.DrunkRunFall ||
			state === States.Thrown ||
			IsCaptive(state) ||
			IsDeadOrDying(state) ||
			state === States.DesperationAttack ||
			state === States.FallAfterSmokeKiss ||
			state === States.CorruptionTransform ||
			state === States.Corrupt ||
			state === States.PreCorrupt ||
			state === States.Dash ||
			state === States.Sidehop ||
			state === States.LoseBoner || 
			state === States.CaptiveSexTop ||
			state === States.PrepareSexTop ||
			state === States.BeforeSexTop ||
			state === States.AfterSexTop ||
			state === States.CaptiveSexBottom || 
			state === States.CorruptOrgasm || 
			state === States.CorruptPrepareBeforeSex ||
			// state === States.SmokeKiss   ||
			state === States.CorruptOrgasmAfterSex ||
			state === States.Spawning ||
			state === States.Taunt   );
};

function IsCapableOfThought(state)
{
	return !(IsCorrupt(state) || IsCorruptDying(state) || IsCaptive(state) || IsDeadOrDying(state));
}