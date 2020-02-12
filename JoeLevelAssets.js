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

include("SmokeExplosion.js");
include("BallGag.js");
include("OrcSpike.js");
include("OrcSpeaker.js");
include("Thunderbolt.js");
include("FloatingSmoke.js");
include("Joe1.js");
include("Joe2.js");
include("Joe3.js");
include("Joe4.js");
include("Joe5.js");
include("Joe0.js");
include("EDRider.js");
include("PottedPlant.js");
include("WaterCooler.js");
include("VendingMachine.js");
include("Car.js");
include("Bench.js");
include("DestructableItem.js");
include("OfficeAngel.js");
include("Admonitor.js");
include("Dissolution.js");
include("StarvingArtist.js");
include("PartyAnimal.js");
include("PunkPuppy.js");
include("Bottley.js");
include("ColombianRescue.js");
include("VirusFromVenus.js");
include("FartherFigure.js");
include("Fister.js");
include("GlassDoor.js");
include("EndingDoor.js");

// Setup the music. Because the music needs to be seamless, also include the number of samples in the file
GlobalResourceLoader.AddAudioResource("titletheme_intro","sound/music/Title Track - Intro.m4a", 864192);
GlobalResourceLoader.AddAudioResource("titletheme_loop","sound/music/Title Track - Loop.m4a", 4320192);

GlobalResourceLoader.AddAudioResource("level0_loop","sound/music/Level 0 - Loop.m4a", 2117568);
GlobalResourceLoader.AddAudioResource("level0_pause","sound/music/Level 0 - Pause Music.m4a", 529344);

GlobalResourceLoader.AddAudioResource("level1_intro","sound/music/Level 1 - Intro.m4a", 433088);
GlobalResourceLoader.AddAudioResource("level1_loop","sound/music/Level 1 - Loop.m4a", 4234176);
GlobalResourceLoader.AddAudioResource("level1_pause","sound/music/Level 1 - Pause Music.m4a", 384960);

GlobalResourceLoader.AddAudioResource("level2_intro","sound/music/Level 2 - Intro.m4a", 1841088);
GlobalResourceLoader.AddAudioResource("level2_loop","sound/music/Level 2 - Loop.m4a", 3497920);
GlobalResourceLoader.AddAudioResource("level2_pause","sound/music/Level 2 - Pause Music.m4a", 184256);

GlobalResourceLoader.AddAudioResource("level3_intro","sound/music/Level 3 - Intro.m4a", 1016768);
GlobalResourceLoader.AddAudioResource("level3_loop","sound/music/Level 3 - Loop.m4a", 3387328);
GlobalResourceLoader.AddAudioResource("level3_pause","sound/music/Level 3 - Pause Music.m4a", 338880);

GlobalResourceLoader.AddAudioResource("level4_intro","sound/music/Level 4 - Intro.m4a", 677824);
GlobalResourceLoader.AddAudioResource("level4_loop", "sound/music/Level 4 - Loop.m4a", 4742080);
GlobalResourceLoader.AddAudioResource("level4_pause","sound/music/Level 4 - Pause Music.m4a", 677824);

GlobalResourceLoader.AddAudioResource("level5_intro","sound/music/Level 5 - Intro.m4a", 1679296);
GlobalResourceLoader.AddAudioResource("level5_loop", "sound/music/Level 5 - Loop.m4a", 8175552);
GlobalResourceLoader.AddAudioResource("level5_pause","sound/music/Level 5 - Pause Music.m4a", 584640);

GlobalResourceLoader.AddAudioResource("final_sex_pause", "sound/music/Final Sex Scene - Pause.m4a", 784320);
GlobalResourceLoader.AddAudioResource("final_sex_loop","sound/music/Final Sex Scene - Loop.m4a", 7840704);

//GlobalResourceLoader.AddAudioResource("level6_intro","sound/music/Level 6 - Intro.m4a", 1412032);
GlobalResourceLoader.AddAudioResource("level6_ticking","sound/music/Level 6 - Ticking.m4a", 353216);
//GlobalResourceLoader.AddAudioResource("level6_loop", "sound/music/Level 6 - Loop.m4a", 7056320);
GlobalResourceLoader.AddAudioResource("level6_pause","sound/music/Level 6 - Pause Music.m4a", 353216);

GlobalResourceLoader.AddAudioResource("ending_dominate_intro","sound/music/Ending - Dominate - Intro.m4a",706496);
GlobalResourceLoader.AddAudioResource("ending_dominate_loop","sound/music/Ending - Dominate - Loop.m4a", 6350784);

GlobalResourceLoader.AddAudioResource("ending_corrupt_intro","sound/music/Ending - Corrupt 2 - Intro.m4a", 1078208);
GlobalResourceLoader.AddAudioResource("ending_corrupt_loop1","sound/music/Ending - Corrupt 2 - Loop 1.m4a", 2352064);
GlobalResourceLoader.AddAudioResource("ending_corrupt_loop2","sound/music/Ending - Corrupt 2 - Loop 2.m4a",2823104);

GlobalResourceLoader.AddAudioResource("ending_boyfriend_intro","sound/music/Ending - Normal - Intro.m4a",1312704);
GlobalResourceLoader.AddAudioResource("ending_boyfriend_loop","sound/music/Ending - Normal - Loop.m4a",7698368);

GlobalResourceLoader.AddAudioResource("credits","sound/music/Credits.m4a", 4229056);

GlobalMusic.tracks["title"] = new MusicTrack("title");
var introSegment = new MusicSegment("titletheme_intro");
var loopSegment = new MusicSegment("titletheme_loop");
introSegment.nextSegment = loopSegment;
loopSegment.nextSegment = loopSegment;
GlobalMusic.tracks["title"].firstSegment = introSegment;

introSegment.AddBeatsOnInterval(432872,27000);
loopSegment.AddBeatsOnInterval(0,27000, 77);
loopSegment.AddBeat(2072102);
loopSegment.AddBeat(2092524);
loopSegment.AddBeat(2112536);
loopSegment.AddBeat(2132958);
loopSegment.AddBeat(2146527);
loopSegment.AddBeat(2160096);
loopSegment.AddBeatsOnInterval(2187868,27000);

// ---------------
GlobalMusic.tracks["level0"] = new MusicTrack("level0");
var loopSegment = new MusicSegment("level0_loop");
var pauseSegment = new MusicSegment("level0_pause");

loopSegment.nextSegment = loopSegment;
loopSegment.alternateSegment = pauseSegment;

GlobalMusic.tracks["level0"].firstSegment = loopSegment;

// ---------------
GlobalMusic.tracks["level1"] = new MusicTrack("level1");
var introSegment = new MusicSegment("level1_intro");
var loopSegment = new MusicSegment("level1_loop");
var pauseSegment = new MusicSegment("level1_pause");

introSegment.nextSegment = loopSegment;
introSegment.alternateSegment = pauseSegment;
loopSegment.nextSegment = loopSegment;
loopSegment.alternateSegment = pauseSegment;

GlobalMusic.tracks["level1"].firstSegment = introSegment;
// ---------------
GlobalMusic.tracks["level2"] = new MusicTrack("level2");
var introSegment = new MusicSegment("level2_intro");
var loopSegment = new MusicSegment("level2_loop");
var pauseSegment = new MusicSegment("level2_pause");

introSegment.nextSegment = loopSegment;
introSegment.alternateSegment = pauseSegment;
loopSegment.nextSegment = loopSegment;
loopSegment.alternateSegment = pauseSegment;

GlobalMusic.tracks["level2"].firstSegment = introSegment;
// ---------------
GlobalMusic.tracks["level3"] = new MusicTrack("level3");
var introSegment = new MusicSegment("level3_intro");
var loopSegment = new MusicSegment("level3_loop");
var pauseSegment = new MusicSegment("level3_pause");

introSegment.nextSegment = loopSegment;
introSegment.alternateSegment = pauseSegment;
loopSegment.nextSegment = loopSegment;
loopSegment.alternateSegment = pauseSegment;

GlobalMusic.tracks["level3"].firstSegment = introSegment;
// ---------------
GlobalMusic.tracks["level4"] = new MusicTrack("level4");
var introSegment = new MusicSegment("level4_intro");
var loopSegment =  new MusicSegment("level4_loop");
var pauseSegment = new MusicSegment("level4_pause");

introSegment.nextSegment = loopSegment;
introSegment.alternateSegment = pauseSegment;
loopSegment.nextSegment = loopSegment;
loopSegment.alternateSegment = pauseSegment;

GlobalMusic.tracks["level4"].firstSegment = introSegment;

// ---------------
GlobalMusic.tracks["level5"] = new MusicTrack("level5");
var introSegment = new MusicSegment("level5_intro");
var loopSegment =  new MusicSegment("level5_loop");
var pauseSegment = new MusicSegment("level5_pause");

introSegment.nextSegment = loopSegment;
introSegment.alternateSegment = pauseSegment;
loopSegment.nextSegment = loopSegment;
loopSegment.alternateSegment = pauseSegment;

GlobalMusic.tracks["level5"].firstSegment = introSegment;

// ---------------
GlobalMusic.tracks["final_sex"] = new MusicTrack("final_sex");
var loopSegment =  new MusicSegment("final_sex_loop");
var pauseSegment = new MusicSegment("final_sex_pause");

loopSegment.nextSegment = loopSegment;
loopSegment.alternateSegment = pauseSegment;

GlobalMusic.tracks["final_sex"].firstSegment = loopSegment;

// ---------------
GlobalMusic.tracks["level6"] = new MusicTrack("level6");
var loopSegment =  new MusicSegment("level6_ticking");
var pauseSegment = new MusicSegment("level6_pause");

loopSegment.nextSegment = loopSegment;
loopSegment.alternateSegment = pauseSegment;

GlobalMusic.tracks["level6"].firstSegment = loopSegment;

// ---------------
GlobalMusic.tracks["ending_dominate"] = new MusicTrack("ending_dominate");
var introSegment = new MusicSegment("ending_dominate_intro");
var loopSegment =  new MusicSegment("ending_dominate_loop");
introSegment.nextSegment = loopSegment;
loopSegment.nextSegment = loopSegment;
GlobalMusic.tracks["ending_dominate"].firstSegment = introSegment;

// ---------------
GlobalMusic.tracks["ending_corrupt"] = new MusicTrack("ending_corrupt");
var introSegment = new MusicSegment("ending_corrupt_intro");
var loopSegment =  new MusicSegment("ending_corrupt_loop1");
var pauseSegment = new MusicSegment("ending_corrupt_loop2");
introSegment.nextSegment = loopSegment;
introSegment.alternateSegment = introSegment;
loopSegment.nextSegment = loopSegment;
loopSegment.alternateSegment = pauseSegment;
GlobalMusic.tracks["ending_corrupt"].firstSegment = introSegment;

// ---------------
GlobalMusic.tracks["ending_boyfriend"] = new MusicTrack("ending_boyfriend");
var introSegment = new MusicSegment("ending_boyfriend_intro");
var loopSegment =  new MusicSegment("ending_boyfriend_loop");
introSegment.nextSegment = loopSegment;
loopSegment.nextSegment = loopSegment;
GlobalMusic.tracks["ending_boyfriend"].firstSegment = introSegment;

// ---------------
GlobalMusic.tracks["credits"] = new MusicTrack("credits");
var introSegment = new MusicSegment("credits");
GlobalMusic.tracks["credits"].firstSegment = introSegment;

introSegment.AddBeatsOnInterval(605860*(44100/48000),18900*(44100/48000));    //662654 - 3rd beat
												  // 605860 - 0th beat

// Create the background

// Area 0
GlobalResourceLoader.AddImageResource("level0/dash_sign","images/level0/dash_sign.png");
GlobalResourceLoader.AddImageResource("level0/grab_sign","images/level0/grab_sign.png");
GlobalResourceLoader.AddImageResource("level0/jab_sign","images/level0/jab_sign.png");
GlobalResourceLoader.AddImageResource("level0/kiss_sign","images/level0/kiss_sign.png");
GlobalResourceLoader.AddImageResource("level0/parallax1","images/level0/parallax1.png");
GlobalResourceLoader.AddImageResource("level0/parallax2","images/level0/parallax2.png");
GlobalResourceLoader.AddImageResource("level0/parallax3","images/level0/parallax3.png");
GlobalResourceLoader.AddImageResource("level0/repeat_bg","images/level0/repeat_bg.png");
GlobalResourceLoader.AddImageResource("level0/sex_sign","images/level0/sex_sign.png");
GlobalResourceLoader.AddImageResource("level0/skybox","images/level0/skybox.png");
GlobalResourceLoader.AddImageResource("level0/skylight_inside","images/level0/skylight_inside.png");
GlobalResourceLoader.AddImageResource("level0/skylight_outside_background","images/level0/skylight_outside_background.png");
GlobalResourceLoader.AddImageResource("level0/skylight_outside_foreground","images/level0/skylight_outside_foreground.png");
GlobalResourceLoader.AddImageResource("level0/skylight_outside","images/level0/skylight_outside.png");
GlobalResourceLoader.AddImageResource("level0/smoking_sign","images/level0/smoking_sign.png");
GlobalResourceLoader.AddImageResource("level0/start_bg","images/level0/start_bg.png");

// Area 1
GlobalResourceLoader.AddImageResource("grid_test","images/background/grid_test.png");
GlobalResourceLoader.AddImageResource("bannister_frame","images/level1/bannister_frame.png");
GlobalResourceLoader.AddImageResource("bannister_glass","images/level1/bannister_glass.png");
GlobalResourceLoader.AddImageResource("bannister_reflection","images/level1/bannister_reflection.png");
GlobalResourceLoader.AddImageResource("carpet_foreground","images/level1/carpet_foreground.png");
GlobalResourceLoader.AddImageResource("no_smoking_poster","images/level1/no_smoking_poster.png");
GlobalResourceLoader.AddSequentialImageResources("level1_background{0}","images/level1/background{0}.png",1,2);

GlobalResourceLoader.AddImageResource("carpet_background","images/level1/carpet.png");
GlobalResourceLoader.AddImageResource("cubiclerow_shadow","images/level1/cubiclerow_shadow.png");
GlobalResourceLoader.AddImageResource("cubiclerow1","images/level1/cubiclerow1.png");
GlobalResourceLoader.AddImageResource("cubiclerow2","images/level1/cubiclerow2.png");

GlobalResourceLoader.AddImageResource("diagonal-wall","images/level1/diagonal-wall.png");
GlobalResourceLoader.AddImageResource("wallleft","images/level1/wall_left.png");
GlobalResourceLoader.AddImageResource("wallmiddle","images/level1/wall_middle.png");
GlobalResourceLoader.AddImageResource("wallright","images/level1/wall_right.png");
GlobalResourceLoader.AddImageResource("wallleftlight","images/level1/wall_left_light.png");
GlobalResourceLoader.AddImageResource("wallmiddlelight","images/level1/wall_middle_light.png");
GlobalResourceLoader.AddImageResource("wallrightlight","images/level1/wall_right_light.png");
GlobalResourceLoader.AddImageResource("stairs","images/level1/stairs.png");
GlobalResourceLoader.AddImageResource("glassdoor_exit_left","images/level1/glassdoor_exit_left.png");
GlobalResourceLoader.AddImageResource("glassdoor_exit_right","images/level1/glassdoor_exit_right.png");
GlobalResourceLoader.AddImageResource("level1_exit_foreground","images/level1/exit_foreground.png");
GlobalResourceLoader.AddImageResource("level1_exit","images/level1/exit.png");
GlobalResourceLoader.AddImageResource("employee_of_the_month","images/level1/employee_of_the_month.png");
GlobalResourceLoader.AddImageResource("joe_co_logo","images/level1/joe_co_logo.png");
GlobalResourceLoader.AddImageResource("secretary_desk","images/level1/secretary_desk.png");
GlobalResourceLoader.AddImageResource("wall_panel_slope","images/level1/wall_panel_slope.png");
GlobalResourceLoader.AddImageResource("wallpaper","images/level1/wallpaper.png");


GlobalResourceLoader.AddImageResource("office_street_transition","images/level2/transition_start.png");

// Area 2
GlobalResourceLoader.AddImageResource("street","images/level2/street.png");
GlobalResourceLoader.AddImageResource("sidewalk","images/level2/sidewalk.png");
GlobalResourceLoader.AddImageResource("grate","images/level2/grate.png");
GlobalResourceLoader.AddImageResource("glassdoor-openleft","images/level2/glassdoor-openleft.png");
GlobalResourceLoader.AddImageResource("glassdoor-openright","images/level2/glassdoor-openright.png");
GlobalResourceLoader.AddImageResource("glassdoor-pub","images/level2/glassdoor-pub.png");
GlobalResourceLoader.AddImageResource("poster-evilboss","images/level2/poster-evilboss.png");
GlobalResourceLoader.AddImageResource("poster-joesmusic","images/level2/poster-joesmusic.png");
GlobalResourceLoader.AddImageResource("poster-men","images/level2/poster-men.png");
GlobalResourceLoader.AddImageResource("wall-alley","images/level2/wall-alley.png");
GlobalResourceLoader.AddImageResource("wall-doorway","images/level2/wall-doorway.png");
GlobalResourceLoader.AddImageResource("wall-end-alley","images/level2/wall-end-alley.png");
GlobalResourceLoader.AddImageResource("wall-end-road","images/level2/wall-end-road.png");
GlobalResourceLoader.AddImageResource("wall","images/level2/wall.png");
GlobalResourceLoader.AddImageResource("window-barempty","images/level2/window-barempty.png");
GlobalResourceLoader.AddImageResource("window-joegiant1","images/level2/window-joegiant1.png");
GlobalResourceLoader.AddImageResource("window-joegiant2","images/level2/window-joegiant2.png");
GlobalResourceLoader.AddImageResource("window-joegiant3","images/level2/window-joegiant3.png");
GlobalResourceLoader.AddImageResource("window-joesjunk1","images/level2/window-joesjunk1.png");
GlobalResourceLoader.AddImageResource("window-joesjunk2","images/level2/window-joesjunk2.png");
GlobalResourceLoader.AddImageResource("window-officesupplies","images/level2/window-officesupplies.png");
GlobalResourceLoader.AddImageResource("window-pub1","images/level2/window-pub1.png");
GlobalResourceLoader.AddImageResource("window-pub2","images/level2/window-pub2.png");
GlobalResourceLoader.AddImageResource("window-pub3","images/level2/window-pub3.png");
GlobalResourceLoader.AddImageResource("window-pubdancing1","images/level2/window-pubdancing1.png");
GlobalResourceLoader.AddImageResource("window-pubdancing2","images/level2/window-pubdancing2.png");
GlobalResourceLoader.AddImageResource("window-pubdancing3","images/level2/window-pubdancing3.png");
GlobalResourceLoader.AddImageResource("window-pubsign","images/level2/window-pubsign.png");
GlobalResourceLoader.AddImageResource("wooddoor-green","images/level2/wooddoor-green.png");
GlobalResourceLoader.AddImageResource("wooddoor-purple","images/level2/wooddoor-purple.png");

// Area 3

GlobalResourceLoader.AddImageResource("street_park_transition","images/level3/transition_start.png");
GlobalResourceLoader.AddImageResource("park_arch_foreground","images/level3/arch_foreground.png");
GlobalResourceLoader.AddImageResource("park_arch_background","images/level3/arch_background.png");
GlobalResourceLoader.AddImageResource("parkbg","images/level3/parkbg.png");
GlobalResourceLoader.AddImageResource("parkbg_trees_bottles_graffiti", "images/level3/parkbg_trees_bottles_graffiti.png");
GlobalResourceLoader.AddImageResource("parkbg_trees_bottles_graffiti2","images/level3/parkbg_trees_bottles_graffiti2.png");
GlobalResourceLoader.AddImageResource("parkbg_trees","images/level3/parkbg_trees.png");
GlobalResourceLoader.AddImageResource("parkbg_trees_bottles","images/level3/parkbg_trees_bottles.png");
GlobalResourceLoader.AddSequentialImageResources("dancingjoes{0}","images/level3/dancingjoes{0}.png",1,4);
GlobalResourceLoader.AddSequentialImageResources("sittingjoes{0}","images/level3/sittingjoes{0}.png",1,3);
GlobalResourceLoader.AddSequentialImageResources("standingjoes{0}","images/level3/standingjoes{0}.png",1,3);
GlobalResourceLoader.AddImageResource("parkfg","images/level3/parkfg.png");
GlobalResourceLoader.AddImageResource("lamppost","images/level3/lamppost.png");

// Area 4
GlobalResourceLoader.AddImageResource("park_club_transition","images/level4/transitionstart.png");
GlobalResourceLoader.AddImageResource("park_club_transition_fg","images/level4/transitionstart_fg.png");

GlobalResourceLoader.AddSequentialImageResources("club_bg{0}","images/level4/club_bg{0}.png",1,3);
var clubbg = new Animation(this);
clubbg.AddSequentialFrames("club_bg{0}",1,3);
clubbg.AddFrame("club_bg2");
clubbg.SetDurationInSeconds(1.0);
clubbg.repeat = 1;

GlobalResourceLoader.AddSequentialImageResources("club_bg_end{0}","images/level4/club_bg_end{0}.png",1,4);
var clubbg_end = new Animation(this);
clubbg_end.AddSequentialFrames("club_bg_end{0}",1,4);
clubbg_end.SetDurationInSeconds(1.0);
clubbg_end.repeat = 1;

GlobalResourceLoader.AddSequentialImageResources("club_bg_end_thunder1_{0}","images/level4/club_bg_end_thunder1_{0}.png",1,4);
GlobalResourceLoader.AddSequentialImageResources("club_bg_end_thunder2_{0}","images/level4/club_bg_end_thunder2_{0}.png",1,4);
GlobalResourceLoader.AddSequentialImageResources("club_bg_end_thunder3_{0}","images/level4/club_bg_end_thunder3_{0}.png",1,4);
GlobalResourceLoader.AddSequentialImageResources("club_bg_end_thunder4_{0}","images/level4/club_bg_end_thunder4_{0}.png",1,4);

var clubthunder1 = new Animation(this);
clubthunder1.AddSequentialFrames("club_bg_end_thunder1_{0}",1,4);
clubthunder1.AddBlankFrames(60);
clubthunder1.SetDurationByFramerate(20);
clubthunder1.repeat = 1;

var clubthunder2 = new Animation(this);
clubthunder2.AddSequentialFrames("club_bg_end_thunder2_{0}",1,4);
clubthunder2.AddBlankFrames(70);
clubthunder2.SetDurationByFramerate(20);
clubthunder2.repeat = 1;

var clubthunder3 = new Animation(this);
clubthunder3.AddSequentialFrames("club_bg_end_thunder3_{0}",1,4);
clubthunder3.AddBlankFrames(80);
clubthunder3.SetDurationByFramerate(20);
clubthunder3.repeat = 1;

var clubthunder4 = new Animation(this);
clubthunder4.AddSequentialFrames("club_bg_end_thunder4_{0}",1,4);
clubthunder4.AddBlankFrames(90);
clubthunder4.SetDurationByFramerate(20);
clubthunder4.repeat = 1;

// Area 5
GlobalResourceLoader.AddSequentialImageResources("joes1bg{0}","images/level4/joes1bg{0}.png",1,4);
var joes1bg = new Animation(this, "joes1bg{0}", 4, 1.0);

GlobalResourceLoader.AddSequentialImageResources("joes2bg{0}","images/level4/joes2bg{0}.png",1,4);
var joes2bg = new Animation(this, "joes2bg{0}", 4, 1.0);

GlobalResourceLoader.AddSequentialImageResources("joes1fg{0}","images/level4/joes1fg{0}.png",1,4);
var joes1fg = new Animation(this, "joes1fg{0}", 4, 1.0);

GlobalResourceLoader.AddSequentialImageResources("joes2fg{0}","images/level4/joes2fg{0}.png",1,4);
var joes2fg = new Animation(this, "joes2fg{0}", 4, 1.0);

GlobalResourceLoader.AddSequentialImageResources("joes3fg{0}","images/level4/joes3fg{0}.png",1,4);
var joes3fg = new Animation(this, "joes3fg{0}", 4, 1.0);

GlobalResourceLoader.AddSequentialImageResources("joes4fg{0}","images/level4/joes4fg{0}.png",1,4);
var joes4fg = new Animation(this, "joes4fg{0}", 4, 1.0);

GlobalResourceLoader.AddImageResource("foreground_smoke1","images/level4/foreground_smoke1.png");
GlobalResourceLoader.AddImageResource("foreground_smoke2","images/level4/foreground_smoke2.png");
GlobalResourceLoader.AddImageResource("foreground_smoke1_end","images/level4/foreground_smoke1_end.png");
GlobalResourceLoader.AddImageResource("foreground_smoke2_end","images/level4/foreground_smoke2_end.png");


GlobalResourceLoader.AddSequentialImageResources("club_table{0}","images/level4/club_table{0}.png",1,3);
var club_table = new Animation(this);
club_table.AddSequentialFrames("club_table{0}",3,1);
club_table.AddFrame("club_table2");
club_table.SetDurationInSeconds(1.0);
club_table.repeat = 1;

GlobalResourceLoader.AddSequentialImageResources("club_couch{0}","images/level4/club_couch{0}.png",1,3);
var club_couch = new Animation(this);
club_couch.AddSequentialFrames("club_couch{0}",1,3);
club_couch.AddFrame("club_couch2");
club_couch.SetDurationInSeconds(1.0);
club_couch.repeat = 1;

GlobalResourceLoader.AddSequentialImageResources("club_2couch{0}","images/level4/club_2couch{0}.png",1,3);
var club_2couch = new Animation(this);
club_2couch.AddSequentialFrames("club_2couch{0}",1,3);
club_2couch.AddFrame("club_2couch2");
club_2couch.SetDurationInSeconds(1.0);
club_2couch.repeat = 1;

GlobalResourceLoader.AddSequentialImageResources("club_bgtable{0}","images/level4/club_bgtable{0}.png",1,3);
var club_bgtable = new Animation(this);
club_bgtable.AddSequentialFrames("club_bgtable{0}",3,1);
club_bgtable.AddFrame("club_bgtable2");
club_bgtable.SetDurationInSeconds(1.0);
club_bgtable.repeat = 1;

GlobalResourceLoader.AddSequentialImageResources("club_bgcouch{0}","images/level4/club_bgcouch{0}.png",1,3);
var club_bgcouch = new Animation(this);
club_bgcouch.AddSequentialFrames("club_bgcouch{0}",1,3);
club_bgcouch.AddFrame("club_bgcouch2");
club_bgcouch.SetDurationInSeconds(1.0);
club_bgcouch.repeat = 1;

GlobalResourceLoader.AddSequentialImageResources("club_bg2couch{0}","images/level4/club_bg2couch{0}.png",1,3);
var club_bg2couch = new Animation(this);
club_bg2couch.AddSequentialFrames("club_bg2couch{0}",1,3);
club_bg2couch.AddFrame("club_bg2couch2");
club_bg2couch.SetDurationInSeconds(1.0);
club_bg2couch.repeat = 1;

// Area 5
GlobalResourceLoader.AddSequentialImageResources("crowd_back_{0}","images/level5/crowd_back_{0}.png",1,3);
var crowdback = new Animation(this, "crowd_back_{0}", 3, 1.0);
crowdback.AddFrame("crowd_back_2");
crowdback.SetDurationInSeconds(0.72);

GlobalResourceLoader.AddSequentialImageResources("crowd_mid_{0}","images/level5/crowd_mid_{0}.png",1,3);
var crowdmid = new Animation(this, "crowd_mid_{0}", 3, 1.0);
crowdmid.AddFrame("crowd_mid_2");
crowdmid.SetDurationInSeconds(0.65);

GlobalResourceLoader.AddSequentialImageResources("crowd_front_{0}","images/level5/crowd_front_{0}.png",1,3);
var crowdfront = new Animation(this, "crowd_front_{0}", 3, 1.0);
crowdfront.AddFrame("crowd_front_2");
crowdfront.SetDurationInSeconds(0.7);


GlobalResourceLoader.AddImageResource("stagefloor","images/level5/stagefloor.png");
GlobalResourceLoader.AddImageResource("stagefloor_taller","images/level5/stagefloor_taller.png");

GlobalResourceLoader.AddImageResource("drumkit_fg","images/level5/drumkit_fg.png");
GlobalResourceLoader.AddImageResource("flags_fg","images/level5/flags_fg.png");
GlobalResourceLoader.AddImageResource("spotlights_fg","images/level5/spotlights_fg.png");
GlobalResourceLoader.AddImageResource("micstand","images/level5/micstand.png");
GlobalResourceLoader.AddImageResource("stageshadow","images/level5/edge_of_stage_shadow.png");

GlobalResourceLoader.AddSequentialImageResources("giantjoebg{0}","images/level5/giantjoebg{0}.png",1,4);
var giantjoebg = new Animation(this, "giantjoebg{0}", 4, 1.5);

GlobalResourceLoader.AddSequentialImageResources("orcs{0}","images/level5/orcs{0}.png",1,4);
var orcsbg = new Animation(this, "orcs{0}", 4, 1.0);
orcsbg.repeat = 2;

GlobalResourceLoader.AddImageResource("haze","images/level5/haze.png");

// Area 6
GlobalResourceLoader.AddImageResource("controlcenter_bg","images/level6/controlcenter_bg.png");


GlobalResourceLoader.AddImageResource("gameover0_FFF_50x50","images/cutscene/gameover0_FFF_50x50.png");
GlobalResourceLoader.AddImageResource("gameover1_000_400x44","images/cutscene/gameover1_000_400x44.png");
GlobalResourceLoader.AddImageResource("gameover2_FFF_206x219","images/cutscene/gameover2_FFF_206x219.png");
GlobalResourceLoader.AddImageResource("gameover3_FFF_300x329","images/cutscene/gameover3_FFF_300x329.png");
GlobalResourceLoader.AddImageResource("gameover4_FFF_223x331","images/cutscene/gameover4_FFF_223x331.png");
GlobalResourceLoader.AddImageResource("gameover5_FFF_426x55","images/cutscene/gameover5_FFF_426x55.png");



// Animations and libraries
// Animations used in the level background
// (owner, frame name format, last frame ID, loop time)
var cubiclerowAnim = new Animation(this,"level1_background{0}", 2, 0.3);
var window_joegiant = new Animation(this, "window-joegiant{0}", 3, 1.0);
var window_joesjunk = new Animation(this, "window-joesjunk{0}",2,0.5);
var window_pub = new Animation(this, "window-pub{0}",3, 1.0);
var window_pubdancing = new Animation(this, "window-pubdancing{0}",3, 1.0);

var standingjoes = new Animation(this, "standingjoes{0}",3, 1.0);
standingjoes.repeat = 2;
standingjoes.inheritFacing = 1;
var sittingjoes = new Animation(this, "sittingjoes{0}",3, 1.0);
sittingjoes.repeat = 2;
sittingjoes.inheritFacing = 1;
var dancingjoes = new Animation(this, "dancingjoes{0}",4, 1.0);
dancingjoes.inheritFacing = 1;

// EDITOR PROPERTIES
	
	AddToStaticElementLibrary( [   "grid_test",
									"level0/dash_sign",
									"level0/grab_sign",
									"level0/jab_sign",
									"level0/kiss_sign",
									"level0/parallax1",
									"level0/parallax2",
									"level0/parallax3",
									"level0/repeat_bg",
									"level0/sex_sign",
									"level0/skybox",
									"level0/skylight_inside",
									"level0/skylight_outside_background",
									"level0/skylight_outside_foreground",
									"level0/skylight_outside",
									"level0/smoking_sign",
									"level0/start_bg",
									"bannister_frame",
									"bannister_glass",
									"bannister_reflection",
									"carpet_foreground",
									"carpet_background",
									"cubiclerow_shadow",
									"cubiclerow1",
									"cubiclerow2",
									"diagonal-wall",
									"wallleft",
									"wallmiddle",
									"wallright",
									"wallleftlight",
									"wallmiddlelight",
									"wallrightlight",
									"stairs",
									"glassdoor_exit_left",
									"glassdoor_exit_right",
									"level1_exit_foreground",
									"level1_exit",
									"employee_of_the_month",
									"joe_co_logo",
									"secretary_desk",
									"wall_panel_slope",
									"wallpaper",
									"no_smoking_poster",
									
									"office_street_transition",
									
									"street",
									"sidewalk",
									"grate",
									"glassdoor-openleft",
									"glassdoor-openright",
									"glassdoor-pub",
									"poster-evilboss",
									"poster-joesmusic",
									"poster-men",
									"wall-alley",
									"wall-doorway",
									"wall-end-alley",
									"wall-end-road",
									"wall",
									"window-barempty",
									"window-officesupplies",
									"window-pubsign",
									"wooddoor-green",
									"wooddoor-purple",
									
									"street_park_transition",
									"park_arch_foreground",
									"park_arch_background",
									"parkbg",
									"parkbg_trees_bottles_graffiti", 
									"parkbg_trees_bottles_graffiti2",
									"parkbg_trees",
									"parkbg_trees_bottles",
									"parkfg",
									"lamppost",
									
									"park_club_transition",
									"park_club_transition_fg",
									
									"foreground_smoke1",
									"foreground_smoke2",
									"foreground_smoke1_end",
									"foreground_smoke2_end",
									
									"stagefloor",
									"stagefloor_taller",
									"drumkit_fg",
									"flags_fg",
									"spotlights_fg",
									"micstand",
									"stageshadow",
									"haze",
									
									"controlcenter_bg",
									"endingdoors/exit_fg"
									
									]);
									
	AddToAnimatedElementLibrary( {  "cubiclerow":cubiclerowAnim,
									"window_joegiant": window_joegiant,
									"window_joesjunk": window_joesjunk ,
									"window_pub": window_pub,
									"window_pubdancing": window_pubdancing,
									"standingjoes": standingjoes,
									"sittingjoes": sittingjoes, 
									"dancingjoes": dancingjoes,
									"clubbg": clubbg,
									"clubbg_end": clubbg_end,
									"clubthunder1": clubthunder1,
									"clubthunder2": clubthunder2,
									"clubthunder3": clubthunder3,
									"clubthunder4": clubthunder4,
									"joes1bg": joes1bg,
									"joes2bg": joes2bg,
									"joes1fg": joes1fg,
									"joes2fg": joes2fg,
									"joes3fg": joes3fg,
									"joes4fg": joes4fg,
									"club_table": club_table,
									"club_couch": club_couch,
									"club_2couch": club_2couch,
									"club_bgtable": club_bgtable,
									"club_bgcouch": club_bgcouch,
									"club_bg2couch": club_bg2couch,
									"crowdback":crowdback,
									"crowdmid":crowdmid,
									"crowdfront":crowdfront,
									"giantjoebg": giantjoebg,
									"orcsbg":orcsbg
								  });