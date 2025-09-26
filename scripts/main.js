// main.js
// import { test } from "./systems/test";
import { Detecthit00154 } from "./systems/testcode";
import { testloadingfunction } from "./systems/shopUI"; 
import { resetCards,scripttingsystems } from "./systems/cardSystem";
import { kinnsisystems,setupLocalChat } from "./systems/kinnsi";
import { setupDeathRules,setupKeyItemTracker,trackPlayerLocations } from "./systems/death";
import { yomikomudake001 } from "./systems/timeboard";
import { fromJM } from "./jobmaster";
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
fromJM();