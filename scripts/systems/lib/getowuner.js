import { world } from "@minecraft/server";

const HOST_KEY = "deathswap_host_id"; // DynamicProperty のキー
let hostInitialized = false;

/**
 * ワールド参加時にオーナーを登録する
 */
export function registerHostOnJoin() {
    world.afterEvents.playerSpawn.subscribe((event) => {
        const player = event.player;
        if (!event.initialSpawn) return; // 死に戻りは無視

        if (hostInitialized) return; // すでに処理済みなら終了

        // DynamicProperty にオーナーIDが保存されているか確認
        let hostId = world.getDynamicProperty(HOST_KEY);

        if (!hostId) {
            // まだオーナーがいない場合 → このプレイヤーをオーナーにする
            world.setDynamicProperty(HOST_KEY, player.id);
            hostId = player.id;

            player.sendMessage("§a✅ あなたがワールドオーナーとして登録されました。");
            console.warn(`[Death_Swap] ワールドオーナー登録: ${player.name} (${player.id})`);
        }

        hostInitialized = true;
    });
}

/**
 * 現在のワールドオーナーIDを返す
 */
export function getHostId() {
    return world.getDynamicProperty(HOST_KEY) ?? null;
}

/**
 * このプレイヤーがオーナーかどうかを判定
 * @param {import("@minecraft/server").Player} player
 */
export function isHost(player) {
    return player.id === getHostId();
}
