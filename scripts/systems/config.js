import { world, system, Player } from "@minecraft/server";
import { ModalFormData, ActionFormData } from "@minecraft/server-ui";

export const config = {
    killPearl: true,        // キルパール有効化
    tpRange: 10000,         // 初期TP範囲
    tpMinDistance: 500,     // 初期TPでの最小距離
    swapMinTime: 2,         // スワップ最短時間（分）
    swapMaxTime: 3,         // スワップ最長時間（分）
    warningTime: 10         // 警報時間（秒）
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
        .slider("プレイヤー間の最小距離", 1000, 2000, 500, config.tpMinDistance)
        .textField("スワップまでの最大時間", "(分)", { defaultValue: String(config.swapMaxTime ?? 4)})
        .textField("スワップまでの最小時間", "(分)", { defaultValue: String(config.swapMinTime ?? 3)})
        .textField("警告時間", "(秒)前からカウントダウンを始める", { defaultValue: String(config.warningTime ?? 30)});

    form.show(player).then((res) => {
        if (res.canceled) return;

        // 設定を反映
        config.killPearl = res.formValues[0];
        config.tpRange = res.formValues[1];
        config.tpMinDistance = res.formValues[2];
        config.swapMaxTime = res.formValues[3];
        config.swapMinTime = res.formValues[4];
        config.warningTime = res.formValues[5];

        player.sendMessage("§a[Death_Swap] 設定を更新しました。");
    });
}
