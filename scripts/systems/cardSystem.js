import { world,system } from "@minecraft/server";

const CARD_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// === カード配布処理 ===
export function distributeCards() {
    system.run(() => {
        world.sendMessage("§d[Debug] scriptevent 稼働");
        const players = world.getPlayers();
        const dimension = world.getDimension("overworld");

        // デバッグ用防具立てを取得
        const debugEntities = dimension.getEntities({
            type: "minecraft:armor_stand",
            name: "Debug_player"
        });

        let targets;

        if (debugEntities.length === 26) {
            // デバッグモード
            targets = debugEntities;
            world.sendMessage("§d[CardSystem] デバッグモード: Debug_player にカードを配布します");
        } else {
            // 通常プレイヤー
            targets = players;
            if (targets.length > CARD_LETTERS.length) {
                world.sendMessage("§c[CardSystem] プレイヤーが多すぎます！(最大26人まで)");
                return;
            }
        }

        // === 配布カード ===
        // ランダム順で対象を並べ替える
        const shuffledTargets = targets.slice().sort(() => Math.random() - 0.5);

        // Aから順番にカードを配布
        shuffledTargets.forEach((entity, idx) => {
            const card = CARD_LETTERS[idx];
            entity.addTag(`Card_${card}`);

            if (entity.typeId === "minecraft:player") {
                entity.sendMessage(`§a[CardSystem] あなたのカードは「${card}」です！`);
            }
        });

        // === 目標カード ===
        shuffledTargets.forEach((entity, idx) => {
            const myCard = CARD_LETTERS[idx];
            // 配布された範囲のカードのみ候補にする
            const distributedCards = CARD_LETTERS.slice(0, shuffledTargets.length);
            const candidates = distributedCards.filter(c => c !== myCard);
            const targetCard = candidates[Math.floor(Math.random() * candidates.length)];

            entity.addTag(`Target_${targetCard}`);

            if (entity.typeId === "minecraft:player") {
                entity.sendMessage(`§eあなたの目標カードは「${targetCard}」です！`);
            }
        });

        world.sendMessage("§b[CardSystem] カード配布が完了しました!");
    });
}


// === リセット処理（テスト用） ===
export function resetCards() {
    world.beforeEvents.chatSend.subscribe((ev) => {
    const player = ev.sender;
    const msg = ev.message.trim();
    if (msg === "!pclear") {
    system.run(() => {
    ev.cancel = true;
    const dimension = world.getDimension("overworld");
    // プレイヤー
    for (const player of world.getPlayers()) {
        clearCardTags(player);
    }
    // Debug_player の防具立ても対象に
    const debugEntities = dimension.getEntities({
        type: "minecraft:armor_stand",
        name: "Debug_player"
    });
    for (const entity of debugEntities) {
        clearCardTags(entity);
    }
    world.sendMessage("§7[CardSystem] 全プレイヤーのカードをリセットしました。");
    });
    }
    if (msg === "!pstart") {
        ev.cancel = true;
        distributeCards()
    }
})
}
export function scripttingsystems(){
    system.afterEvents.scriptEventReceive.subscribe((event) => {
        const { id, message, sourceEntity } = event;
        const player = event.player;
        if (id === "nico:cards") {
        distributeCards()
        }
        if (id === "nico:cardClear") {
        system.run(() => {
            const dimension = world.getDimension("overworld");
            // プレイヤー
            for (const player of world.getPlayers()) {
                clearCardTags(player);
            }
            // Debug_player の防具立ても対象に
            const debugEntities = dimension.getEntities({
                type: "minecraft:armor_stand",
                name: "Debug_player"
            });
            for (const entity of debugEntities) {
                clearCardTags(entity);
            }
            world.sendMessage("§7[Debug] 全プレイヤーのカードをリセットしました。"); // Debug
        });
            }
        })
}
function clearCardTags(entity) {
    for (const card of CARD_LETTERS) {
        entity.removeTag(`Card_${card}`);
        entity.removeTag(`Target_${card}`);
    }
}