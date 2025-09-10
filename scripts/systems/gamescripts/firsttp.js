import { system } from "@minecraft/server";
import { joinedPlayers } from "./gamedamon.js";

// === 乱数ユーティリティ ===
function randomCoord(range) {
    return Math.floor(Math.random() * (range * 2 + 1)) - range;
}

// === 一定距離以上離れているか確認 ===
function isFarEnough(newPos, existing, minDist) {
    for (const pos of existing) {
        const dx = pos.x - newPos.x;
        const dz = pos.z - newPos.z;
        if (Math.sqrt(dx * dx + dz * dz) < minDist) {
            return false;
        }
    }
    return true;
}

// === 初期ランダムTP処理 ===
export function doFirstTP() {
    const players = Array.from(joinedPlayers.values());

    if (players.length === 0) {
        console.warn("[Death_Swap] 参加プレイヤーがいません。");
        return;
    }

    const usedPositions = [];
    const minDistance = 500; // プレイヤー同士の最小距離

    for (const player of players) {
        let pos;
        let attempts = 0;

        // 有効な座標が見つかるまで試行
        do {
            pos = {
                x: randomCoord(10000),
                y: 150, // 仮の高さ（安全処理を後で追加）
                z: randomCoord(10000)
            };
            attempts++;
            if (attempts > 50) {
                console.warn(`[Death_Swap] ${player.name} のTP座標が決められませんでした。強制採用します。`);
                break;
            }
        } while (!isFarEnough(pos, usedPositions, minDistance));

        usedPositions.push(pos);

        // TP実行
        player.runCommand(`tp @s ${pos.x} ${pos.y} ${pos.z}`);
        player.sendMessage("§a[Death_Swap] ゲーム開始地点にテレポートしました。");
    }

    console.warn("[Death_Swap] 初期ランダムTPを完了しました。");
}
