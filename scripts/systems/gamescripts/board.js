import { world, system } from "@minecraft/server";
import { config } from "../config.js";
import { doSwap } from "./tpcode.js"; // スワップ処理を呼び出す

// === 内部状態 ===
let elapsedTime = 0; // 経過秒
let swapTime = 0;    // 次のスワップまでの秒
let countdownActive = false;
let intervalHandle = null;

// === スコアボードの初期化 ===
export function initScoreboards() {
    try {
        world.getDimension("overworld").runCommand("scoreboard objectives add elapsed dummy 経過時間");
    } catch {}
    try {
        world.getDimension("overworld").runCommand("scoreboard objectives add countdown dummy 残り時間");
    } catch {}
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

    // 経過時間を更新
    dim.runCommand(`scoreboard players set timer elapsed ${elapsedTime}`);

    if (countdownActive) {
        const remaining = swapTime - elapsedTime;
        dim.runCommand(`scoreboard players set timer countdown ${remaining}`);
    } else {
        // ランダムな数字を表示（00〜59秒のダミー）
        const fake = Math.floor(Math.random() * 3600); 
        dim.runCommand(`scoreboard players set timer countdown ${fake}`);
    }
}


// === 新しいスワップ時間を設定 ===
function scheduleNextSwap() {
    const minSec = config.swapMinTime * 60;
    const maxSec = config.swapMaxTime * 60;

    swapTime = Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec;
    countdownActive = false;

    world.sendMessage(`§7[Death_Swap] 次のスワップは ${config.swapMinTime}〜${config.swapMaxTime} 分の間に発生します。`);
}

// === メイン進行 ===
function tick() {
    elapsedTime++;

    // カウントダウン開始判定
    if (!countdownActive && elapsedTime >= swapTime - config.warningTime) {
        countdownActive = true;
        world.sendMessage(`§eスワップまで残り ${config.warningTime} 秒`);
    }

    // スワップ発生
    if (elapsedTime >= swapTime) {
        // キルパール処理（有効時のみ）
        if (config.killPearl) {
            try {
                world.getDimension("overworld").runCommand("kill @e[type=ender_pearl]");
            } catch {}
        }

        // スワップ処理呼び出し
        doSwap();

        // 次のスワップをスケジュール
        scheduleNextSwap();
        elapsedTime = 0; // 経過時間リセット
    }

    updateScoreboards();
}

// === ゲーム開始時に呼び出す ===
export function setupBoard() {
    initScoreboards();
    elapsedTime = 0;
    scheduleNextSwap();

    if (intervalHandle) system.clearRun(intervalHandle);
    intervalHandle = system.runInterval(tick, 20); // 20tick=1秒
    world.sendMessage("§a[Death_Swap] スコアボードとタイマーを開始しました。");
}

// === ゲーム終了時に呼び出す ===
export function stopBoard() {
    if (intervalHandle) {
        system.clearRun(intervalHandle);
        intervalHandle = null;
    }
    world.sendMessage("§c[Death_Swap] タイマーを停止しました。");
}
