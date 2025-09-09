import { joinedPlayers } from "./gamedamon.js";

// === 配列をランダムシャッフルする関数 ===
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// === スワップ処理（円順列TP） ===
export function swapPlayers() {
    const players = Array.from(joinedPlayers.values());

    if (players.length < 2) {
        console.warn("スワップできるプレイヤーが2人未満です。");
        return;
    }

    // ランダムに順番を決める
    const orderedPlayers = shuffleArray(players);

    // 各プレイヤーの位置を記録
    const positions = orderedPlayers.map(p => p.location);

    // 円順列に従ってTP
    for (let i = 0; i < orderedPlayers.length; i++) {
        const current = orderedPlayers[i];
        const targetPos = positions[(i + 1) % orderedPlayers.length];

        try {
            current.runCommand(`tp @s ${targetPos.x} ${targetPos.y} ${targetPos.z}`);
        } catch (e) {
            console.warn(`TPエラー: ${current.nameTag}`, e);
        }
    }

    console.warn("プレイヤーのスワップを実行しました。");
}
