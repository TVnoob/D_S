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
    const elapsedMin = Math.floor(elapsedSeconds / 60);
    const elapsedSec = elapsedSeconds % 60;
    const elapsedStr = `${String(elapsedMin).padStart(2, "0")}:${String(elapsedSec).padStart(2, "0")}`;

    let remainingStr = "--:--";
    if (swapTargetTime !== null) {
        const remaining = swapTargetTime - elapsedSeconds;
        if (remaining <= 0) {
            remainingStr = "00:00";
        } else {
            const rMin = Math.floor(remaining / 60);
            const rSec = remaining % 60;
            remainingStr = `${String(rMin).padStart(2, "0")}:${String(rSec).padStart(2, "0")}`;
        }
    }

    const message = `§e残り人数: ${remainingPlayers} §7| §a経過: ${elapsedStr} §7`;
    dim.runCommand(`title @a actionbar "${message}"`);
}

/**
 * 次回スワップ時刻を決定
 */
function setNextSwapTime() {
    const minSec = config.swapMinTime * 60;
    const maxSec = config.swapMaxTime * 60;
    const rand = Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec;
    swapTargetTime = elapsedSeconds + rand;
    countdownActive = false;
    console.warn(`[Death_Swap] 次のスワップは ${rand} 秒後 (残り: ${swapTargetTime - elapsedSeconds}s)`);
}

/**
 * 毎秒処理
 */
function tickBoard() {
    elapsedSeconds++;

    // スワップ時間に近づいたら警告
    if (swapTargetTime !== null) {
        const remaining = swapTargetTime - elapsedSeconds;

        if (remaining > 0 && remaining <= config.warningTime) {
            world.sendMessage(`§e[Death_Swap] スワップまで残り ${remaining} 秒！`);
        }

        if (remaining <= 0) {
            // スワップ発動イベント送信
            system.run(() => {
                // キルパール処理（有効時のみ）
                if (config.killPearl) {
                    try {
                        world.getDimension("overworld").runCommand("kill @e[type=ender_pearl]");
                    } catch {}
                }
                world.sendMessage("§c[Death_Swap] Swap!");
                elapsedSeconds = 0;
                swapPlayers();
            });
            setNextSwapTime(); // 次のスワップを予約
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