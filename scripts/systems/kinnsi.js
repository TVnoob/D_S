import { world, system } from "@minecraft/server";

// ============================
// 設定値
// ============================

// PvP & アイテム使用禁止時間（秒）
const NO_PVP_TIME = 180; // 3分

// デバッグ強制フラグ
let DebugForbiddance = false;

// 禁止アイテムリスト
const BANNED_ITEMS = [ // 仮
  "minecraft:name_tag",
  "nico:book",     // 攻略本
  "nico:suisyou"   // 水晶玉
];

// 経過時間（秒）
let elapsedSeconds = 0;

// 経過時間カウント
function startcount(){
    system.runInterval(() => {
    elapsedSeconds++;
    }, 20);
}

export function kinnsisystems(){
// PvP禁止処理
world.beforeEvents.entityHurt.subscribe(ev => {
  const { damageSource, hurtEntity } = ev;

  if (damageSource.damagingEntity?.typeId === "minecraft:player" &&
      hurtEntity.typeId === "minecraft:player") {

    if (DebugForbiddance || elapsedSeconds < NO_PVP_TIME) {
      ev.cancel = true;
      damageSource.damagingEntity.sendMessage("§c[通知]PVPは現在無効です");
    }
  }
});

// アイテム使用禁止処理
world.beforeEvents.itemUse.subscribe(ev => {
  const { itemStack, source } = ev;
  if (!itemStack) return;

  if (DebugForbiddance || elapsedSeconds < NO_PVP_TIME) {
    if (BANNED_ITEMS.includes(itemStack.typeId)) {
      ev.cancel = true;
      source.sendMessage(`§c[アイテム使用不可] ${itemStack.typeId} は今は使用できません！`);
    }
  }
});

system.afterEvents.scriptEventReceive.subscribe(ev => {
  if (ev.id === "nico:kinnsiD") {
    DebugForbiddance = !DebugForbiddance;
    world.sendMessage(`§d[Debug] 禁止モードを ${DebugForbiddance ? "ON" : "OFF"} にしました`);
  }

  if (ev.id === "nico:kinnsi") {
    DebugForbiddance = false;
    elapsedSeconds = 0; // タイマーをリセット
    world.sendMessage("§a[Debug] PvP & アイテム使用禁止タイマーをリセットしました（3分禁止開始）"); // Debug
    startcount();
  }
});
}