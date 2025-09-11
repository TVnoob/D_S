//JoinE.js
import { world, ItemStack } from "@minecraft/server";
import { startedGame, joinedPlayers, Endgame } from "./gamescripts/gamedamon.js";
import { mainPlayers } from "./gamescripts/notjoins.js";
import { isHost, getHostId } from "./getowuner.js";

// === プレイヤー初参加処理 ===
export function playereventinworld(){
    world.afterEvents.playerSpawn.subscribe((ev) => {
        const player = ev.player;
        if (!ev.initialSpawn) return; // 死に戻りは無視

        // === 参加/観戦アイテムを最初に配布 ===
        if (startedGame === false) {
            distributeJoinSpectatorItems(player);
        }
        // === オーナーに configUI を必ず持たせる ===
        if (isHost(player)) { // issuse
            giveOwnerConfigUI(player);
            console.warn("判別ができました");
        }

        // === ゲーム開始後に入ってきたプレイヤーは観戦者にする ===
        if (startedGame === true) {
            player.addTag("spec");
            player.sendMessage("§7[Death_Swap] ゲームはすでに開始されています。観戦者として参加します。");
            player.runCommand("gamemode spectator");
            return;
        }

    });

    // === プレイヤー退出処理 ===
    world.afterEvents.playerLeave.subscribe((ev) => {
        const pid = ev.player;

        // joinedPlayers から削除
        if (joinedPlayers.has(pid.id)) {
            joinedPlayers.delete(pid.id);
        }

        // mainPlayers からも削除（配列版）
        const idx = mainPlayers.findIndex(p => p.id === pid.id);
        if (idx !== -1) {
            mainPlayers.splice(idx, 1);
        }
    });

    // === 脱落者処理（観戦者化） ===
    world.afterEvents.entityDie.subscribe((ev) => {
        const dead = ev.deadEntity;
        if (dead.typeId !== "minecraft:player") return;
        if (startedGame !== true) return;

        // joinedPlayers から削除
        if (joinedPlayers.has(dead.id)) {
            joinedPlayers.delete(dead.id);
        }

        // 観戦者タグを付与
        dead.addTag("spec");
        dead.runCommand("gamemode spectator");
        // アナウンス
        world.sendMessage(`§c[Death_Swap] ${dead.nameTag} は脱落しました。`);
        if (joinedPlayers.size === 1) { // 勝者トリガー
            Endgame(); // gamedamon.jsに
        }
    });
}

/**
 * オーナー専用の ConfigUI を再配布する
 * @param {Player} player - プレイヤー
 */
export function giveOwnerConfigUI(player) {

    player.runCommand("give @s system:configui")
    player.sendMessage("§a[Death_Swap] 設定UIを再度配布しました。");
    console.warn("[Death_Swap] 設定UIを再度配布しました。");

}

/**
 * プレイヤーに参加/観戦アイテムを配布する
 * @param {Player} player - プレイヤー
 */
export function distributeJoinSpectatorItems(player) {
    try {
        player.runCommand("clear @s");

        player.runCommand('replaceitem entity @s slot.hotbar 0 item:join 1 0 {"item_lock":{"mode":"lock_in_slot"}}')
        player.runCommand('replaceitem entity @s slot.hotbar 1 item:spectator 1 0 {"item_lock":{"mode":"lock_in_slot"}}');

        player.removeTag("spec");
        player.removeTag("entry");

    } catch (e) {
        console.warn("アイテム配布エラー:", e);
    }
}

/**
 * ゲーム終了時：全員にアイテム再配布
 */
export function redistributeItems() {
    const players = world.getPlayers();

    for (const player of players) {
        distributeJoinSpectatorItems(player);
        // オーナーなら ConfigUI を確認・再配布
        if (isHost(player)) {
            giveOwnerConfigUI(player);
        }
    }

    world.sendMessage("§a[Death_Swap] 全プレイヤーにアイテムを再配布しました。");
}
