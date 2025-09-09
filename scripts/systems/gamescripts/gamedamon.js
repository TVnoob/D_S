import { world, system } from "@minecraft/server";
// 開始部分のみです
// === グローバル管理用変数 ===
export let startedGame = false;        // ゲームが開始されているかどうか
export const joinedPlayers = new Map(); // 参加プレイヤー (id → player)

// === スクリプトイベント受信 ===
export function startgameinthedeathswapsurvivalminigame(){
    system.afterEvents.scriptEventReceive.subscribe((ev) => {
        if (ev.id === "ds:start") {
            if (startedGame) {
                ev.sourceEntity?.sendMessage("§eゲームはすでに開始されています。");
                return;
            }
            startGame();
        }
    });
}

// === ゲーム開始処理 ===
function startGame() {
    startedGame = true;
    world.sendMessage("§aゲームが開始されました");

    // 全プレイヤーを取得
    const players = world.getPlayers();

    for (const player of players) {
        if (player.hasTag("entry")) {
            // 参加プレイヤーとして登録
            joinedPlayers.set(player.id, player);

            // 念のため spec タグ削除
            if (player.hasTag("spec")) {
                player.removeTag("spec");
            }
            player.sendMessage("§aあなたはゲームに参加しました！");
        } else {
            // entry タグがない → 強制観戦者
            if (!player.hasTag("spec")) {
                player.addTag("spec");
            }
            player.sendMessage("§7観戦者として登録されました。");
        }
    }

    // === ここで board.js / firsttp.js を呼び出せるようにする ===
    // import { setupBoard } from "./board.js";
    // import { doFirstTP } from "./firsttp.js";
    // setupBoard();
    // doFirstTP(joinedPlayers);

    world.sendMessage(`§e参加人数: ${joinedPlayers.size}人`);
}
