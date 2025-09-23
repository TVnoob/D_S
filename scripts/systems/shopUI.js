import { world, system } from "@minecraft/server";
import { ModalFormData, ActionFormData } from "@minecraft/server-ui";

function openShopsenntakuUI(player) { // playerは@p
    const form = new ActionFormData()
        .title("Shopメニュー")
        .body("開くショップを選択してください")
        .button("通常shop商品", "textures/items/diamond")
        .button("メンバーズショップ商品", "textures/items/emerald");

    form.show(player).then((res) => {
        if (res.canceled) return;
        if (res.selection === 0) {
            testOpenUI(player);
        } else if (res.selection === 1) {
            othershopUI(player);
        }
    });
}

function othershopUI(player) {
        const form = new ActionFormData()
            .title("Shop")
            .body("通常shop商品")
            .button("インスタントテレポーター", "リソースパックの方のテクスチャのパス")
            .button("§eモンスターパワー", "リソースパックの方のテクスチャのパス")
            .button("リデンプション", "リソースパックの方のテクスチャのパス")
            .button("みとおしメガネ", "リソースパックの方のテクスチャのパス")
            .button("充電器", "リソースパックの方のテクスチャのパス")
            .button("無限の板チョコ", "リソースパックの方のテクスチャのパス")
            .button("ニコの悲劇", "リソースパックの方のテクスチャのパス")
            .button("ねむれよいこよ", "リソースパックの方のテクスチャのパス")
            .button("§b瞬足", "リソースパックの方のテクスチャのパス")
            .button("ファイヤーバー", "リソースパックの方のテクスチャのパス")
            .button("DBバッジ", "リソースパックの方のテクスチャのパス")
            .button("§e特殊召喚", "リソースパックの方のテクスチャのパス")
            .button("ふしぎなおまもり", "リソースパックの方のテクスチャのパス")
            .button("妖精のビン", "リソースパックの方のテクスチャのパス")
            .button("豚の貯金箱", "リソースパックの方のテクスチャのパス")
            .button("強い木の剣", "リソースパックの方のテクスチャのパス");  // ここでフォーム15
        // 必要に応じて.buttonを増やす

        form.show(player).then((res) => {
            if (res.canceled) return;
            if (res.selection === 0) {
                if (!byusystem001(player, 10)) return;
                player.runCommand("give @s iron_horse_armor");
            }
            if (res.selection === 1) {
                if (!byusystem001(player, 10)) return;
                player.runCommand("give @s dragon_breath");
            }
            if (res.selection === 2) {
                if (!byusystem001(player, 10)) return;
                player.runCommand("give @s magma_cream");
            }
            if (res.selection === 3) {
                if (!byusystem001(player, 10)) return;
                player.runCommand("give @s white_harness");
            }
            if (res.selection === 4) {
                if (!byusystem001(player, 10)) return;
                player.runCommand("give @s golden_horse_armor");
            }
            if (res.selection === 5) {
                if (!byusystem001(player, 10)) return;
                player.runCommand("give @s dark_oak_slab");
            }
            if (res.selection === 6) {
                if (!byusystem001(player, 10)) return;
                player.runCommand("give @s breeze_rod");
            }
            if (res.selection === 7) {
                if (!byusystem001(player, 10)) return;
                player.runCommand("give @s sheep_spawn_egg");
            }
            if (res.selection === 8) {
                if (!byusystem001(player, 10)) return;
                player.runCommand("give @s nico:speed");
            }
            if (res.selection === 9) {
                if (!byusystem001(player, 10)) return;
                player.runCommand("give @s nico:firebar");
            }
            if (res.selection === 10) {
                if (!byusystem001(player, 10)) return;
                player.runCommand("give @s prismarine_shard");
            }
            if (res.selection === 11) {
                if (!byusystem001(player, 10)) return;
                player.runCommand("give @s music_disc_13");
            }
            if (res.selection === 12) {
                if (!byusystem001(player, 10)) return;
                player.runCommand("give @s golden_carrot");
            }
            if (res.selection === 13) {
                if (!byusystem001(player, 10)) return;
                player.runCommand("give @s glass_bottle");
            }
            if (res.selection === 14) {
                if (!byusystem001(player, 5)) return;
                player.runCommand("give @s pig_spawn_egg");
            }
            if (res.selection === 15) {
                if (!byusystem001(player, 4)) return;
                player.runCommand("give @s wooden_sword");
            }
    });
}

function testOpenUI(player) {
        const form = new ActionFormData()
            .title("Shop")
            .body("通常shop商品")
            .button("§b攻略本:1", "textures/items/book_normal")
            .button("§b水晶玉:1", "textures/items/magma_cream")
            .button("§b名札:1", "textures/items/name_tag")
            .button("木刀:14", "textures/items/wood_sword")
            .button("小さな鍵:1", "textures/blocks/trip_wire_source")
            .button("拡声器", "リソースパックの方のテクスチャのパス") // ここでフォーム5
            .button("§2汚いハートの器:3", "textures/items/health")
            .button("§b足が速くなるクスリ:10", "textures/items/seeds_pumpkin")
            .button("§7煙幕:1", "textures/items/dye_powder_gray")
            .button("§4戦いの律動:7", "textures/items/blaze_powder")
            .button("§b巨人の勇気:7", "textures/items/diamond_chestplate")
            .button("§gスペルシールド:7", "textures/items/gold_chestplate")
            .button("§6粘着ボール:4", "textures/items/snowball")
            .button("生命探知機", "リソースパックの方のテクスチャのパス")
            .button("千里眼", "リソースパックの方のテクスチャのパス")
            .button("セルフケア", "リソースパックの方のテクスチャのパス") // ここでフォーム15
            .button("ヘナトス", "リソースパックの方のテクスチャのパス")
            .button("手錠", "リソースパックの方のテクスチャのパス")
            .button("おなべのふた", "リソースパックの方のテクスチャのパス")
            .button("シールドバッテリー", "リソースパックの方のテクスチャのパス")
            .button("デプロテ", "リソースパックの方のテクスチャのパス")
            .button("にころんぱポイント", "リソースパックの方のテクスチャのパス")
            .button("弓", "リソースパックの方のテクスチャのパス")
            .button("矢", "リソースパックの方のテクスチャのパス"); // 23
        // 必要に応じて.buttonを増やす

        form.show(player).then((res) => {
            if (res.canceled) return;
            if (res.selection === 0) {
                if (!byusystem001(player, 1)) return;
                player.runCommand("give @s nico:book");
                // if (!byusystem001(player, 消費数)) return;
                // player.runCommand("command");
            }
            if (res.selection === 1) {
                if (!byusystem001(player, 1)) return;
                player.runCommand("give @s nico:suisyou");
            }
            if (res.selection === 2) {
                if (!byusystem001(player, 1)) return;
                player.runCommand("give @s nico:name");
            }
            if (res.selection === 3) {
                if (!byusystem001(player, 14)) return;
                player.runCommand("give @s nico:wood_sword");
            }
            if (res.selection === 4) {
                if (!byusystem001(player, 1)) return;
                player.runCommand("give @s nico:key");
            }
            if (res.selection === 5) {
                if (!byusystem001(player, 2)) return;
                player.runCommand("give @s hopper");
            }
            if (res.selection === 6) {
                if (!byusystem001(player, 3)) return;
                player.runCommand("give @s nico:health");
            }
            if (res.selection === 7) {
                if (!byusystem001(player, 10)) return;
                player.runCommand("give @s nico:kusuri");
            }
            if (res.selection === 8) {
                if (!byusystem001(player, 1)) return;
                player.runCommand("give @s nico:enmaku");
            }
            if (res.selection === 9) {
                if (!byusystem001(player, 7)) return;
                player.runCommand("give @s nico:ritudou");
            }
            if (res.selection === 10) {
                if (!byusystem001(player, 7)) return;
                player.runCommand("give @s nico:yuuki");
            }
            if (res.selection === 11) {
                if (!byusystem001(player, 7)) return;
                player.runCommand("give @s nico:superu");
            }
            if (res.selection === 12) {
                if (!byusystem001(player, 4)) return;
                player.runCommand("give @s nico:nenchaku");
            }
            if (res.selection === 13) {
                if (!byusystem001(player, 3)) return;
                player.runCommand("give @s iron_horse_armor");
            }
            if (res.selection === 14) {
                if (!byusystem001(player, 5)) return;
                player.runCommand("give @s ender_pearl");
            }
            if (res.selection === 15) {
                if (!byusystem001(player, 4)) return;
                player.runCommand("give @s end_crystal");
            }
            if (res.selection === 16) {
                if (!byusystem001(player, 7)) return;
                player.runCommand("give @s allium");
            }
            if (res.selection === 17) {
                if (!byusystem001(player, 7)) return;
                player.runCommand("give @s lead");
            }
            if (res.selection === 18) {
                if (!byusystem001(player, 10)) return;
                player.runCommand("give @s bowl");
            }
            if (res.selection === 19) {
                if (!byusystem001(player, 7)) return;
                player.runCommand("give @s light_blue_bed");
            }
            if (res.selection === 20) {
                if (!byusystem001(player, 7)) return;
                player.runCommand("give @s blue_orchid");
            }
            if (res.selection === 21) {
                if (!byusystem001(player, 20)) return;
                player.runCommand("give @s light_blue_dye");
            }
            if (res.selection === 22) {
                if (!byusystem001(player, 14)) return;
                player.runCommand("give @s bow");
            }
            if (res.selection === 23) {
                if (!byusystem001(player, 5)) return;
                player.runCommand("give @s arrow");
            }
            // 必要に応じてif (res.selection === Num) {}を増やす
    });
}
/** 
 * コマンド
 * 
 * scriptevent nico:shop
 * 
 * */ 
export function testloadingfunction() {
    system.afterEvents.scriptEventReceive.subscribe(ev => {
    if (ev.id === "nico:shop") {
            for (const player of world.getPlayers()) {
                if (player.hasTag("ShopP")) {
                    system.runTimeout(() => {
                        openShopsenntakuUI(player);
                        player.removeTag("ShopP");
                    },20);
                }
            }
        }
    });
}
export function byusystem001(player, requiredCount) {
    const invComp = player.getComponent("minecraft:inventory");
    if (!invComp) return false;
    const inventory = invComp.container;

    // 持っている合計数を数える
    let total = 0;
    for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (item && item.typeId === "nico:houseki") {
            total += item.amount;
        }
    }

    if (total < requiredCount) {
        player.sendMessage(`§c宝石が足りません (${total}/${requiredCount})`);
        return false;
    }

    // 必要分を消費する
    let remaining = requiredCount;
    for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (!item) continue;
        if (item.typeId !== "nico:houseki") continue;

        if (item.amount > remaining) {
            // スロット内の数を減らして戻す
            item.amount = item.amount - remaining;
            inventory.setItem(i, item);
            remaining = 0;
            break;
        } else {
            // スロットを空にする
            remaining -= item.amount;
            inventory.setItem(i, null);
        }
    }

    player.sendMessage(`§a${requiredCount}個の宝石を消費しました！`);
    return true;
}