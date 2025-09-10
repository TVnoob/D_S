import { world, GameMode } from "@minecraft/server";
import { joinedPlayers } from "./gamedamon.js";

export let mainPlayers = []; // 固定観戦リスト

// === ゲーム開始時にリストを確定 ===
export function setupSpectatorList() {
    mainPlayers = Array.from(joinedPlayers.values());
    world.sendMessage("§7[Death_Swap] 観戦用リストを作成しました。");
}

// === 観戦TPコマンド ===
world.beforeEvents.chatSend.subscribe((ev) => {
    const player = ev.sender;
    const message = ev.message.trim();

    // 観戦者専用コマンド
    if (message === "!spectp") {
        ev.cancel = true; // チャットに表示しない

        if (!player.hasTag("spec") || player.getGameMode() !== GameMode.spectator) {
            player.sendMessage("§c[Death_Swap] あなたは観戦者ではありません！");
            return;
        }

        doSpectatorTP(player);
    }
});

// === 観戦者TP処理 ===
function doSpectatorTP(spectator) {
    if (mainPlayers.length === 0) {
        spectator.sendMessage("§e[Death_Swap] 観戦リストが存在しません。");
        return;
    }

    // 現在の観戦インデックスを保持（dynamicProperty利用）
    let index = spectator.getDynamicProperty("spectIndex");
    if (index === undefined || index === null) index = -1;

    let target = null;
    let attempts = 0;

    while (!target && attempts < mainPlayers.length) {
        index = (index + 1) % mainPlayers.length;
        const candidate = mainPlayers[index];

        // 生存確認
        if (candidate && candidate.isValid()) {
            target = candidate;
        }
        attempts++;
    }

    if (target) {
        spectator.teleport(
            target.location,
            target.dimension,
            target.rotation.x,
            target.rotation.y
        );
        spectator.setDynamicProperty("spectIndex", index);
        spectator.sendMessage(`§a[Death_Swap] ${target.nameTag} を観戦中`);
    } else {
        spectator.sendMessage("§e[Death_Swap] 観戦できるプレイヤーがいません。");
    }
}

