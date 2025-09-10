// config.js
import { world, system, Player } from "@minecraft/server";
import { ModalFormData, ActionFormData } from "@minecraft/server-ui";

export const config = {
    killPearl: true,        // キルパール有効化
    tpRange: 10000,         // 初期TP範囲
    tpMinDistance: 1000,     // 初期TPでの最小距離
    swapMinTime: 2,         // スワップ最短時間（分）
    swapMaxTime: 3,         // スワップ最長時間（分）
    warningTime: 10         // 警報時間（秒）
};

// === ConfigUI アイテム使用イベント ===
export function configuisetupfunction(){
    world.afterEvents.itemUse.subscribe((ev) => {
        const player = ev.source;
        const item = ev.itemStack;

        if (item?.typeId === "system:configui") {
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
        .toggle("キルパールを有効化する", { defaultValue: config.killPearl })
        .slider("初期TP範囲（ブロック）", 5000, 100000, { valueStep: 1000, defaultValue: config.tpRange })
        .slider("プレイヤー間の最小距離", 500, 2000, { valueStep: 100, defaultValue: config.tpMinDistance })
        .textField("スワップまでの最小時間", { placeholderText: "(分)", defaultValue: config.swapMinTime.toString() })
        .textField("スワップまでの最大時間", { placeholderText: "(分)", defaultValue: config.swapMaxTime.toString() })
        .textField("警告時間", { placeholderText: "(秒)前からカウントダウンを始める", defaultValue: config.warningTime.toString() })
        .submitButton("§9変更を適応する");

        console.warn(`[Death_Swap] openSettingsUI called for player: ${player.name} (${player.id})`);

    form.show(player).then((res) => {
        if (res.canceled) {
            player.sendMessage("§7[Death_Swap] 設定はキャンセルされました。");
            return;
        }

        console.warn(JSON.stringify(res.formValues)); // ← ここでデバッグ出力

        config.killPearl = res.formValues[0];
        config.tpRange = Number(res.formValues[1]) || config.tpRange;
        config.tpMinDistance = Number(res.formValues[2]) || config.tpMinDistance;
        config.swapMinTime = parseInt(res.formValues[3]) || config.swapMinTime;
        config.swapMaxTime = parseInt(res.formValues[4]) || config.swapMaxTime;
        config.warningTime = parseInt(res.formValues[5]) || config.warningTime;


        player.sendMessage("§a[Death_Swap] 設定を更新しました。");
    });
}
