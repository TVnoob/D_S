import { world, ItemStack } from "@minecraft/server";
import { startedGame } from "./gamescripts/gamedamon.js";

// === グローバル変数 ===
let hostPlayerId = null; // 最初のプレイヤーをオーナーとして固定

// === プレイヤー初参加処理 ===
export function playereventinworld(){
    world.afterEvents.playerSpawn.subscribe((ev) => {
        const player = ev.player;
        if (!ev.initialSpawn) return; // 死に戻りは無視

        // === ワールド主登録 ===
        if (!hostPlayerId) {
            hostPlayerId = player.id;
            player.sendMessage("§a[Death_Swap] あなたはワールドオーナーに登録されました。");
        }

        // === オーナーに configUI を必ず持たせる ===
        if (player.id === hostPlayerId) {
            giveOwnerConfigUI(player);
        }

        // === ゲーム開始後に入ってきたプレイヤーは観戦者にする ===
        if (startedGame === true && player.id !== hostPlayerId) {
            player.addTag("spec");
            player.sendMessage("§7[Death_Swap] ゲームはすでに開始されています。観戦者として参加します。");
            player.runCommand("gamemode spectator");
            return;
        }

        // === ゲーム開始前：全員にアイテム配布 ===
        if (startedGame === false) {
            distributeJoinSpectatorItems(player);
        }
    });

    // === プレイヤー退出処理 ===
    world.afterEvents.playerLeave.subscribe((ev) => {
        world.sendMessage(`§e${ev.playerName} がワールドを退出しました。`);
    });

    // === 脱落者処理（観戦者化） ===
    world.afterEvents.entityDie.subscribe((ev) => {
        const dead = ev.deadEntity;
        if (dead.typeId !== "minecraft:player") return;

        // 観戦者タグを付与
        dead.addTag("spec");
        dead.runCommand("gamemode spectator");
        // アナウンス
        world.sendMessage(`§c[Death_Swap] ${dead.nameTag} は脱落しました。`);
    });
}

// ==================================================
// === ヘルパー関数 ===
// ==================================================

/**
 * オーナー専用の ConfigUI を再配布する
 * @param {Player} player - プレイヤー
 */
export function giveOwnerConfigUI(player) {
    try {
        const inv = player.getComponent("minecraft:inventory").container;
        const configItem = new ItemStack("system:configUI", 1);

        // すでに持っているか確認
        let hasConfig = false;
        for (let i = 0; i < inv.size; i++) {
            const slot = inv.getItem(i);
            if (slot && slot.typeId === "system:configUI") {
                hasConfig = true;
                break;
            }
        }

        if (!hasConfig) {
            inv.addItem(configItem);
            player.sendMessage("§a[Death_Swap] 設定UIを再度配布しました。");
        }
    } catch (e) {
        console.warn("ConfigUI 配布エラー:", e);
    }
}

/**
 * プレイヤーに参加/観戦アイテムを配布する
 * @param {Player} player - プレイヤー
 */
export function distributeJoinSpectatorItems(player) {
    try {
        player.runCommand("clear @s");

        const joinItem = new ItemStack("item:join", 1);
        const specItem = new ItemStack("item:spectator", 1);

        const inv = player.getComponent("minecraft:inventory").container;
        inv.setItem(0, joinItem);
        inv.setItem(1, specItem);
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
        // オーナーなら ConfigUI を確認・再配布
        if (player.id === hostPlayerId) {
            giveOwnerConfigUI(player);
        }
        // 参加/観戦アイテムを再配布
        distributeJoinSpectatorItems(player);
    }

    world.sendMessage("§a[Death_Swap] 全プレイヤーにアイテムを再配布しました。");
}
