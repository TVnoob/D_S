import { world, system } from "@minecraft/server";
import { clearCardTags } from "./cardSystem";
// 制限時間（秒）
const GAME_LIMIT_TIME = 900;
let gameElapsedSeconds = 0;
let gameTimer = null;

export function startGameTimer() {
    gameElapsedSeconds = 0;
    checkPlayerCount();
    N2025no09no26no18no29noVCwaChaos();
    if (gameTimer) system.clearRun(gameTimer);

    gameTimer = system.runInterval(() => {
        gameElapsedSeconds++;

        const remaining = GAME_LIMIT_TIME - gameElapsedSeconds;
        if (remaining <= 0) {
            world.sendMessage("§c[Game] Time Up!");
            system.clearRun(gameTimer);
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
    gameElapsedSeconds =1000;
    for (const player of world.getPlayers()) {
        clearCardTags(player);
        player.runCommand("effect @s saturation 1 255");
        player.runCommand("effect @s instant_health 1 255");

    }
    system.run(() => {
    const dim = world.getDimension("overworld");
    dim.runCommand("scriptevent nico:end");
    dim.runCommand("scriptevent nico:cardClear");
    dim.runCommand('tp @a 0 -60 0');
    dim.runCommand("gamemode a @a");
    dim.runCommand("effect @a clear");
});
}
function N2025no09no26no18no29noVCwaChaos(){
    system.run(() => {
    try {
    world.scoreboard.removeObjective("KIRUFUDA");
    } catch (e) {
    // 存在しないときはエラーが出るので無視
    }
    world.scoreboard.addObjective("KIRUFUDA", "KIRUFUDA");
});
}