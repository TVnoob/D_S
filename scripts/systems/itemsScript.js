import { world } from "@minecraft/server";

// === アイテム使用イベント ===
export function originalitemscriptfucktion(){
    world.afterEvents.itemUse.subscribe((ev) => {
        const player = ev.source;
        const item = ev.itemStack;
        if (!item) return;

        switch (item.typeId) {
            case "item:join":
                // 観戦者解除
                if (player.hasTag("spec")) {
                    player.removeTag("spec");
                }
                // エントリー付与
                if (!player.hasTag("entry")) {
                    player.addTag("entry");
                    player.sendMessage("§aゲームに参加しました!");
                } else {
                    player.sendMessage("§eすでに参加登録済みです。");
                }
                break;

            case "item:spectator":
                // 参加解除
                if (player.hasTag("entry")) {
                    player.removeTag("entry");
                }
                // 観戦者付与
                if (!player.hasTag("spec")) {
                    player.addTag("spec");
                    player.sendMessage("§7観戦者になりました。");
                } else {
                    player.sendMessage("§eすでに観戦者です。");
                }
                break;

            default:
                break;
        }
    });
}
