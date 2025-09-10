// main.js
// import { test } from "./systems/test";
import { playereventinworld } from "./systems/JoinE";
import { originalitemscriptfucktion } from "./systems/itemsScript";
import { loadmainsystem } from "./systems/gamescripts/tpcode";
import { startgameinthedeathswapsurvivalminigame } from "./systems/gamescripts/gamedamon";
import { loadmainsystematfirsttp } from "./systems/gamescripts/firsttp";
import { configuisetupfunction } from "./systems/config";
import { sendchatchecker } from "./systems/gamescripts/notjoins";
// test();
startgameinthedeathswapsurvivalminigame();
loadmainsystem();
playereventinworld();
originalitemscriptfucktion();
loadmainsystematfirsttp();
configuisetupfunction();
sendchatchecker();