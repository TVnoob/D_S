import { world, system, Player } from "@minecraft/server";
import { ModalFormData, ActionFormData } from "@minecraft/server-ui";

// === 設定オブジェクト ===
export const config = {
    killPearl: true,       // エンダーパール無効化
    tpRange: 10000,        // 初期TP範囲
    tpMinDistance: 500     // プレイヤー間の最小距離
};

// === ConfigUI アイテム使用イベント ===
export function configuisetupfunction(){
world.afterEvents.itemUse.subscribe((ev) => {
    const player = ev.source;
    const item = ev.itemStack;

    if (item?.typeId === "system:configUI") {
        openMainConfigUI(player);
    }
});
}
// === メインメニュー UI ===
function openMainConfigUI(player) {
    const form = new ActionFormData()
        .title("DeathSwap-UI")
        .body("設定を行うか、ゲームを開始してください。")
        .button("⚙ 設定UIを開く")
        .button("▶ ゲームを開始する");

    form.show(player).then((res) => {
        if (res.canceled) return;
        if (res.selection === 0) {
            openSettingsUI(player);
        } else if (res.selection === 1) {
            // ゲーム開始イベント送信
            system.runCommand("scriptevent ds:start");
        }
    });
}

// === 設定 UI ===
function openSettingsUI(player) {
    const form = new ModalFormData()
        .title("ゲーム設定")
        .toggle("キルパールを有効化する", config.killPearl)
        .slider("初期TP範囲（ブロック）", 10000, 20000, 5000, config.tpRange)
        .slider("プレイヤー間の最小距離", 1000, 2000, 500, config.tpMinDistance);

    form.show(player).then((res) => {
        if (res.canceled) return;

        // 設定を反映
        config.killPearl = res.formValues[0];
        config.tpRange = res.formValues[1];
        config.tpMinDistance = res.formValues[2];

        player.sendMessage("§a[Death_Swap] 設定を更新しました。");
    });
}
