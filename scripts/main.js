// main.js
// import { test } from "./systems/test";
import { playereventinworld } from "./systems/JoinE";
import { originalitemscriptfucktion } from "./systems/itemsScript";
import { loadmainsystem } from "./systems/gamescripts/tpcode";
import { startgameinthedeathswapsurvivalminigame } from "./systems/gamescripts/gamedamon";
// test();
startgameinthedeathswapsurvivalminigame();
loadmainsystem();
playereventinworld();
originalitemscriptfucktion();