import { world, system } from "@minecraft/server";
import { clearCardTags } from "./cardSystem";
// 制限時間（秒）
const GAME_LIMIT_TIME = 900;
let gameElapsedSeconds = 0;
let gameTimer = null;

export function startGameTimer() {
    gameElapsedSeconds = 0;
    checkPlayerCount();
    if (gameTimer) system.clearRun(gameTimer);

    gameTimer = system.runInterval(() => {
        gameElapsedSeconds++;

        const remaining = GAME_LIMIT_TIME - gameElapsedSeconds;
        if (remaining <= 0) {
            world.sendMessage("§c[Game] Time Up!");
            gameEnd(); // ゲーム終了処理呼び出し
            return;
        }

        // successKilled を持つプレイヤーのみに表示
        for (const player of world.getPlayers()) {
            if (player.hasTag("successKilled")) {
                player.runCommand(
                    `title @s actionbar §e残り時間: ${remaining}秒`
                );
            }
        }
    }, 20); // 1秒ごと
}
function checkPlayerCount() {
    const players = world.getPlayers();
    if (players.length > 16) {
        world.sendMessage("§c[WARNING]プレイヤー数が16人を超えています!");
        return false;
    }
    return true;
}
export function yomikomudake001(){
    console.warn("timeboard.js was loading.")
}
export function gameEnd(){ // ここに終了処理を追加
    system.clearRun(gameTimer);
    gameElapsedSeconds = 1000;
    for (const player of world.getPlayers()) {
        clearCardTags(player);
    }
    system.run(() => {
    const dim = world.getDimension("overworld");
    dim.runCommand("scriptevent nico:end");
    dim.runCommand("scriptevent nico:cardClear");
    dim.runCommand('tp @a 0 0 0');
});
}