import { world, system } from "@minecraft/server";

// PvP & アイテム使用禁止時間（秒）
const NO_PVP_TIME = 180; // 3分

let StartGame = false;

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

let timerId = null; // runIntervalIDクリア

// 経過時間カウント開始
function startcount() {
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
      system.clearRun(timerId);
      timerId = null;
      world.sendMessage("§a[通知] 3分経過しました。PvPとアイテム使用が解禁されます");
    }
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
  if (ev.id === "nico:cards"){
    StartGame = true;
    for (const player of world.getPlayers()) {
    player.nameTag = ""; // ネームプレート非表示
    player.sendMessage("§c[Debug] ネームプレートが非表示になりました！"); // Debug
  }
  }
  if (ev.id === "nico:end"){ // ゲーム終了時
    StartGame = false;
    for (const player of world.getPlayers()) {
    player.nameTag = player.name; // 元の名前を戻す
    player.sendMessage("§a[Debug] ネームプレートが表示に戻りました！"); // Debug
  }
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

  world.afterEvents.entityDie.subscribe((ev) => {
        const dead = ev.deadEntity;
        if (dead.typeId !== "minecraft:player") return;
        dead.addTag("dead");
        dead.runCommand("gamemode spectator");
        dead.nameTag = player.name;
    });
}