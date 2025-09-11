import { world, system } from "@minecraft/server";
import { config } from "../config.js";
import { swapPlayers } from "./tpcode.js";
import { joinedPlayers } from "./gamedamon.js";

let elapsedTime = 0;
let swapTime = 0;
let countdownActive = false;
let intervalHandle = null;

// === スコアボード初期化 ===
export function initScoreboards() {
    if (scoreboardInitialized) return;

    // 0.5秒 遅延して試行（軽量な安定策）
    setTimeout(() => {
        system.run(() => {
            try {
                world.getDimension("overworld").runCommand("scoreboard objectives add deathswap dummy DeathSwap");
            } catch {}
            try {
                world.getDimension("overworld").runCommand("scoreboard objectives setdisplay sidebar deathswap");
            } catch {}
            scoreboardInitialized = true;
            console.warn("[Death_Swap] Scoreboard initialized");
        });
    },500);
}

// === 経過時間を mm:ss に変換 ===
function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
}

// === スコアボード更新 ===
function updateScoreboards() {
    const dim = world.getDimension("overworld");

    // 経過時間
    const elapsedStr = formatTime(elapsedTime);
    dim.runCommand(`scoreboard players set "経過 ${elapsedStr}" deathswap 0`);

    // 残り時間
    if (countdownActive) {
        const remaining = swapTime - elapsedTime;
        const remainStr = formatTime(remaining);
        dim.runCommand(`scoreboard players set "残り ${remainStr}" deathswap 0`);
    } else {
        // ランダム表示
        const fake = formatTime(Math.floor(Math.random() * 3600));
        dim.runCommand(`scoreboard players set "残り ${fake}" deathswap 0`);
    }

    // 生存プレイヤー数
    dim.runCommand(`scoreboard players set "生存 ${joinedPlayers.size}" deathswap 0`);
}

// === 新しいスワップ時間を決定 ===
function scheduleNextSwap() {
    const minSec = config.swapMinTime * 60;
    const maxSec = config.swapMaxTime * 60;
    swapTime = Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec;
    countdownActive = false;
}

// === 進行ループ ===
function tick() {
    elapsedTime++;

    if (!countdownActive && elapsedTime >= swapTime - config.warningTime) {
        countdownActive = true;
        world.sendMessage(`§e[Death_Swap] 残り ${config.warningTime} 秒でスワップが発生します！`);
    }

    if (elapsedTime >= swapTime) {
        if (config.killPearl) {
            try {
                world.getDimension("overworld").runCommand("kill @e[type=ender_pearl]");
            } catch {}
        }
        swapPlayers();
        scheduleNextSwap();
        elapsedTime = 0;
    }

    updateScoreboards();
}

// === 外部公開 ===
export function setupBoard() {
    initScoreboards();
    elapsedTime = 0;
    scheduleNextSwap();

    if (intervalHandle) system.clearRun(intervalHandle);
    intervalHandle = system.runInterval(tick, 20);
}

export function stopBoard() {
    if (intervalHandle) {
        system.clearRun(intervalHandle);
        intervalHandle = null;
    }
    world.sendMessage("§c[Death_Swap] タイマーを停止しました。");
}
