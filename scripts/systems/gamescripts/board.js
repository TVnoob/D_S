import { world, system } from "@minecraft/server";
import { joinedPlayers } from "./gamedamon.js";
import { config } from "../config.js";
import { swapPlayers } from "./tpcode.js";

// === グローバル管理 ===
let elapsedSeconds = 0;
let roundElapsedSeconds = 0;
let swapTargetTime = null;
let countdownActive = false;
let boardIntervalId = null; 



/**
 * アクションバー更新
 */
function updateActionbar() {
    const dim = world.getDimension("overworld");

    const remainingPlayers = joinedPlayers.size;

    // ラウンド経過時間を mm:ss に整形
    const roundMin = Math.floor(roundElapsedSeconds / 60);
    const roundSec = roundElapsedSeconds % 60;
    const roundStr = `${String(roundMin).padStart(2, "0")}:${String(roundSec).padStart(2, "0")}`;

    const message = `§e残り人数: ${remainingPlayers} §7| §a経過: ${roundStr}`;
    dim.runCommand(`title @a actionbar "${message}"`);
}

/**
 * 次回スワップ時刻を決定
 */
function setNextSwapTime() {
    const minSec = config.swapMinTime * 60;
    const maxSec = config.swapMaxTime * 60;
    const rand = Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec;

    swapTargetTime = elapsedSeconds + rand; // 累計経過時間に対して設定
    console.warn(`[Death_Swap] 次のスワップは ${rand} 秒後 (予定時刻=${swapTargetTime})`);
}

/**
 * 毎秒処理
 */
function tickBoard() {
    elapsedSeconds++;
    roundElapsedSeconds++;

    if (swapTargetTime !== null) {
        const remaining = swapTargetTime - elapsedSeconds;

        // カウントダウン
        if (remaining > 0 && remaining <= config.warningTime) {
            world.sendMessage(`§e[Death_Swap] スワップまで残り ${remaining} 秒！`);
        }

        // スワップ発動
        if (remaining <= 0) {
            system.run(() => {
                if (config.killPearl) {
                    try {
                        world.getDimension("overworld").runCommand("kill @e[type=ender_pearl]");
                    } catch {}
                }
                world.sendMessage("§c[Death_Swap] Swap!");
                swapPlayers();
            });

            setNextSwapTime();       // 次回スワップ設定
            roundElapsedSeconds = 0; // ラウンド経過時間をリセット
        }
    }

    updateActionbar();
}


export function setupBoard() {
    elapsedSeconds = 0;
    setNextSwapTime();

    // すでに動いているものがあれば停止してから新しく開始
    if (boardIntervalId !== null) {
        system.clearRun(boardIntervalId);
        boardIntervalId = null;
    }

    // インターバルIDを保存
    boardIntervalId = system.runInterval(() => {
        tickBoard();
    }, 20); // 20tick = 1秒
}

export function stopBoard() {
    if (boardIntervalId !== null) {
        system.clearRun(boardIntervalId);
        boardIntervalId = null;
        console.warn("[Death_Swap] ボードを停止しました");
    }
}

export function sucsesstoloadboard(){
    console.warn("board.js was loaded");
}