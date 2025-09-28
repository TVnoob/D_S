import { world, system, GameRule } from "@minecraft/server";
import { gameEnd } from "./timeboard";
// PvP & アイテム使用禁止時間（秒）
const NO_PVP_TIME = 20; // 3分

let StartGame = false;

// デバッグ強制フラグ
let DebugForbiddance = false;

// 禁止アイテムリスト
const BANNED_ITEMS = [
  "nico:name",
  "nico:book",     // 攻略本
  "nico:suisyou"   // 水晶玉
];

// 経過時間（秒）
let elapsedSeconds = 0;

let timerId = null; // runIntervalIDクリア

// 経過時間カウント開始
function startcount() {
  system.run(() => {
  const dim = world.getDimension("overworld");
  dim.runCommand("gamerule pvp false");
  });
  // すでに動作中なら止める
  if (timerId !== null) {
    system.clearRun(timerId);
    timerId = null;
  }

  elapsedSeconds = 0;

  timerId = system.runInterval(() => {
    elapsedSeconds++;

    if (elapsedSeconds >= NO_PVP_TIME) {
      // タイマー終了
      const dim = world.getDimension("overworld");
      system.clearRun(timerId);
      timerId = null;
      dim.runCommand("gamerule pvp true");
      world.sendMessage("§a[通知] 3分経過しました。PvPとアイテム使用が解禁されます");
    }
  }, 20);
}

export function kinnsisystems(){
// PvP禁止処理
/*world.afterEvents.entityHurt.subscribe(ev => {
  const { damageSource, hurtEntity } = ev;
  if (damageSource.damagingEntity?.typeId === "minecraft:player" &&
      hurtEntity.typeId === "minecraft:player") {

    if (DebugForbiddance || elapsedSeconds < NO_PVP_TIME) {
      damageSource.damagingEntity.sendMessage("§c[通知]PVPは現在無効です");
    }
  }
});
*/

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
  const dim = world.getDimension("overworld");
  if (ev.id === "nico:kinnsiD") {
    DebugForbiddance = !DebugForbiddance;
    world.sendMessage(`§d[Debug] 禁止モードを ${DebugForbiddance ? "ON" : "OFF"} にしました`);
    console.warn(`${DebugForbiddance}`);
    if (DebugForbiddance){
      dim.runCommand("gamerule pvp true");
    } else {
      dim.runCommand("gamerule pvp false");
    }
  }

  if (ev.id === "nico:kinnsi") {
    DebugForbiddance = false;
    elapsedSeconds = 0; // タイマーをリセット
    world.sendMessage("§a[Debug] PvP & アイテム使用禁止タイマーをリセットしました（3分禁止開始）"); // Debug
    startcount();
  }
  if (ev.id === "nico:cards"){
    StartGame = true;
    for (const player of world.getPlayers()) {
    player.nameTag = ""; // ネームプレート非表示
  }
  }
  if (ev.id === "nico:end"){ // ゲーム終了時
    StartGame = false;
    for (const player of world.getPlayers()) {
    player.nameTag = player.name; // 元の名前を戻す
  }
  }
  if(ev.id === "nico:endD"){
    gameEnd();
  }
});
}

export function setupLocalChat() {
  if (!StartGame) return;
  world.beforeEvents.chatSend.subscribe(ev => {
    ev.cancel = true; // デフォルトのチャット送信を止める

    const sender = ev.sender;
    const msg = ev.message;

    // 半径5ブロックのプレイヤーにだけ送信
    for (const player of world.getPlayers()) {
      const dx = player.location.x - sender.location.x;
      const dy = player.location.y - sender.location.y;
      const dz = player.location.z - sender.location.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist <= 5) {
        player.sendMessage(`§7${sender.name}: §f${msg}`);
      }
    }
  });
}