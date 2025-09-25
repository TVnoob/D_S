// main.js
// import { test } from "./systems/test";
import { Detecthit00154 } from "./systems/testcode";
import { testloadingfunction } from "./systems/shopUI"; 
import { resetCards,scripttingsystems } from "./systems/cardSystem";
import { kinnsisystems,setupLocalChat } from "./systems/kinnsi";
import { setupDeathRules,setupKeyItemTracker,trackPlayerLocations } from "./systems/death";
import { yomikomudake001 } from "./systems/timeboard";
import { yomikomi_hannteiC } from "./systems/jobs/kirifuda_subclass/hannteiC";
import { yomikomi_kirifuda } from "./systems/jobs/kirifuda";
import { originalitemscript } from "./systems/jobs/itemsScript";
// test();
Detecthit00154(); 
testloadingfunction(); 
resetCards();
scripttingsystems()
kinnsisystems();
setupLocalChat();
setupDeathRules();
setupKeyItemTracker();
yomikomudake001();
trackPlayerLocations();
originalitemscript();
yomikomi_hannteiC();
yomikomi_kirifuda();