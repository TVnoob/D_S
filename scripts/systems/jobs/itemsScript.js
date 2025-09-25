import { world } from "@minecraft/server";
import { openTrumpUI } from "./kirifuda";

// === アイテム使用イベント ===
export function originalitemscript(){
    world.afterEvents.itemUse.subscribe((ev) => {
        const player = ev.source;
        const item = ev.itemStack;
        if (!item) return;

        switch (item.typeId) {
            case "nico:pocker":
            openTrumpUI(player);
                break;

            case "item:spectator":



                break;

            default:
                break;
        }
    });
}