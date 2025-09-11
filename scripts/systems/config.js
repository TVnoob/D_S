// config.js
import { world, system } from "@minecraft/server";
import { ModalFormData, ActionFormData } from "@minecraft/server-ui";

const CONFIG_KEY = "deathswap:config"; // 永続化キー

// === デフォルト設定値 ===
export const config = {
    killPearl: true,        // キルパール有効化
    tpRange: 10000,         // 初期TP範囲
    tpMinDistance: 1000,    // 初期TPでの最小距離
    swapMinTime: 2,         // スワップ最短時間（分）
    swapMaxTime: 3,         // スワップ最長時間（分）
    warningTime: 10         // 警報時間（秒）
};

// === 起動時: 保存された設定をロード ===
export function loadConfig() {
    try {
        const raw = world.getDynamicProperty(CONFIG_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            Object.assign(config, parsed); // デフォルトとマージ
        }
    } catch (e) {
        console.warn("[Death_Swap] Config load error:", e);
    }
}

// === 設定を保存 ===
function saveConfig() {
    try {
        world.setDynamicProperty(CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
        console.warn("[Death_Swap] Config save error:", e);
    }
}

// === ConfigUI アイテム使用イベント ===
export function configuisetupfunction() {
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
        .title("DeathSwap - メニュー")
        .body("設定を行うか、ゲームを開始してください。")
        .button("⚙ 設定UIを開く")
        .button("▶ ゲームを開始する");

    form.show(player).then((res) => {
        if (res.canceled) return;
        if (res.selection === 0) {
            openSettingsUI(player);
        } else if (res.selection === 1) {
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
        .textField("スワップまでの最小時間", "(分)", String(config.swapMinTime ?? 2))
        .textField("スワップまでの最大時間", "(分)", String(config.swapMaxTime ?? 3))
        .textField("警告時間", "(秒)前からカウントダウンを始める", String(config.warningTime ?? 10))
        .submitButton("§9変更を適用する");

    form.show(player).then((res) => {
        if (res.canceled) {
            player.sendMessage("§7[Death_Swap] 設定はキャンセルされました。");
            return;
        }

        const values = res.formValues;

        config.killPearl     = values[0];
        config.tpRange       = Number(values[1]) || config.tpRange;
        config.tpMinDistance = Number(values[2]) || config.tpMinDistance;
        config.swapMinTime   = parseInt(values[3]) || config.swapMinTime;
        config.swapMaxTime   = parseInt(values[4]) || config.swapMaxTime;
        config.warningTime   = parseInt(values[5]) || config.warningTime;

        saveConfig(); // 保存
        player.sendMessage("§a[Death_Swap] 設定を更新しました。");
    }).catch((err) => {
        console.warn("[Death_Swap] UIエラー:", err);
        player.sendMessage("§c⚠ UIの表示に失敗しました。");
    });
}