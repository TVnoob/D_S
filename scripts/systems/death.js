import { world, system } from "@minecraft/server";
import { CARD_LETTERS, SEARCH_ITEMS } from "./cardSystem";

// キーアイテム（1種類1個のみ）
const KEY_ITEMS = SEARCH_ITEMS; // 今後追加可能
const playerHasKeyItemPrev = new Map();
const lastPlayerLocation = new Map()

// === Utility ===
function getCard(entity) {
  const tag = entity.getTags().find(t => t.startsWith("Card_"));
  console.warn(`Card_${tag}`);
  return tag ? tag.replace("Card_", "") : null;
}

function getTarget(entity) {
  const tag = entity.getTags().find(t => t.startsWith("Target_"));
  console.warn(`Target_${tag}`);
  return tag ? tag.replace("Target_", "") : null;
}

function getSearchItems(entity) {
  return entity.getTags()
    .filter(t => t.startsWith("Item_"))
    .map(t => t.replace("Item_", ""));
}
function getTagSearchItem(player,itemName){
  const needitem = player.getTags().filter(t => t.startsWith("Item_")).map(t => t.replace("Item_", ""));
  console.warn(`Item:${needitem},but:${itemName}`);
  console.warn("tested",String(needitem) === String(itemName));
  return String(needitem) === String(itemName);
}
function updateLastOwner(player, itemName) {
  if (!getTagSearchItem(player, itemName)){
    console.warn("!つき",!getTagSearchItem(player, itemName));
    console.warn("[Debug] falseを検知");
    // player.addTag(`Misspick_${itemName}`); // ←　無効化
    const health = player.getComponent("minecraft:health");
    console.warn(`現在HP: ${health.currentValue}`);
    console.warn(`基本最大HP: ${health.defaultValue}`);
    console.warn(`実効最大HP: ${health.effectiveMax}`);
    const currentMax = health.currentValue;       // 現在の最大HP
    const newMax = Math.max(1, Math.floor(currentMax / 2)); // 1未満にはしない
    player.runCommand(`damage @s ${newMax}`);
    player.sendMessage(`§c[キーアイテム所持違反ペナルティ] 最大HPが半減しました (${currentMax} → ${newMax})`);
    return;
  }
  // まず全員から外す
  for (const p of world.getPlayers()) {
    p.removeTag(`LastOwner_${itemName}`);
  }
  // この人を最終所持者にする
  player.addTag(`LastOwner_${itemName}`);
  player.sendMessage(`§6[通知] あなたは ${itemName} の最終所持者になりました!`);

  // --- 追加: replaceitem でロック付きに差し替える ---
  const inv = player.getComponent("minecraft:inventory")?.container;
  if (!inv) return;

  for (let slot = 0; slot < inv.size; slot++) {
    const item = inv.getItem(slot);
    if (!item) continue;
    const id = item.typeId.split(":").pop();
    if (id !== itemName) continue;

    // スロットタイプと番号を判定
    let slotStr = null;
    if (slot >= 0 && slot <= 8) {
      slotStr = `slot.hotbar ${slot}`;
    } else if (slot >= 9 && slot <= 35) {
      slotStr = `slot.inventory ${slot - 9}`;
    } else if (slot === 36) {
      slotStr = "slot.armor feet";
    } else if (slot === 37) {
      slotStr = "slot.armor legs";
    } else if (slot === 38) {
      slotStr = "slot.armor chest";
    } else if (slot === 39) {
      slotStr = "slot.armor head";
    }

    if (!slotStr) continue;

    // 置換コマンドを実行
    player.runCommand(
      `replaceitem entity @s ${slotStr} ${itemName} 1 0 {"item_lock":{"mode":"lock_in_inventory"}}`
    );
  }
}

// === キル可否判定 ===
function isKillAllowed(attacker, victim) {
  const attackerCard = getCard(attacker);
  const victimCard = getCard(victim);
  const attackerTarget = getTarget(attacker);
  const victimTarget = getTarget(victim);

  const attackerSearch = getSearchItems(attacker);

  // ルール1
  if (attackerTarget === victimCard) return true;

  // ルール2
  if (victimTarget === attackerCard) return true;

  // ルール3（同じ捜索アイテム）
  const victimSearch = getSearchItems(victim);
  if (attackerSearch.some(item => victimSearch.includes(item))) return true;

  // ルール4（被害者が攻撃者の探索アイテムを所持）
  if (victimSearch.some(item => attackerSearch.includes(item))) return true;

  // ルール5（最終所持者が自分の捜索アイテム）
  for (const searchItem of attackerSearch) {
    if (victim.hasTag(`LastOwner_${searchItem}`)) return true;
  }

  return false;
}

export function trackPlayerLocations() {
  system.runInterval(() => {
    for (const player of world.getPlayers()) {
      lastPlayerLocation.set(player.id, {
        pos: { x: player.location.x, y: player.location.y, z: player.location.z },
        dim: player.dimension
      });
    }
  }, 20); // 1秒ごとに記録
}

export function setupDeathRules() {
  // PvPダメージ制御
  world.afterEvents.entityHurt.subscribe(ev => {
    const attacker = ev.damageSource?.damagingEntity;
    const victim = ev.hurtEntity;
    
    if (!attacker || !victim) return;
    if (attacker.typeId !== "minecraft:player" || victim.typeId !== "minecraft:player") return;
    try{
      const health = victim.getComponent("minecraft:health");
      const before = health.currentValue;
      const identity = attacker.scoreboardIdentity;
      console.warn(`test!!!${score.getScore(identity)}`);
      console.warn(`現在HP: ${health.currentValue}`);
      const score = world.scoreboard.getObjective("KIRUFUDA");
      const plusAttackpoint = score.getScore(attacker);
      console.warn(`/damage ${victim.name} ${plusAttackpoint}`);
      attacker.runCommand(`damage ${victim.name} ${plusAttackpoint}`);
      const after = health.currentValue;
      console.warn(`[DEBUG]拳(1)+追加ダメージ${plusAttackpoint} HP${before} → ${after}`);
    } catch(e){
      console.warn("切り札ダメージに関するエラー:",e);
    /*
    console.warn(`damage +1 if test: ${attackerTarget} ${victimCard}`,attackerTarget === victimCard);
    if (attackerTarget === victimCard){
      attacker.sendMessage(`attackerの${attacker.name}のconstは正常です。被害者は${victim.name}`);
      console.warn("damage +1 if test: success?");
      system.runTimeout(() => {
      attacker.runCommand(`damage ${victim.name} 1`);
      },10);
    }
      不完全なため未実装
      */
    }
  });

  // === 正しいキル成立時の処理 ===
  world.afterEvents.entityDie.subscribe(ev => {
    const victim = ev.deadEntity;
    const attacker = ev.damageSource?.damagingEntity;
    const saved = lastPlayerLocation.get(victim.id);

    if (victim.typeId !== "minecraft:player") return;
    if (!attacker || attacker.typeId !== "minecraft:player") return;

    if (!isKillAllowed(attacker, victim)) {
      // --- 被害者救済 ---
      try {
        const health = victim.getComponent("health");
        health.current = health.value; // HP全回復
        victim.addEffect("resistance", 40, { amplifier: 255, showParticles: false }); // 2秒耐性
        if (saved) {
          console.warn(`location: x=${saved.pos.x}, y=${saved.pos.y}, z=${saved.pos.z}, dim=${saved.dim.id}`);
        }
        victim.sendMessage("§a[誤殺救済] あなたは誤殺されていたため復活しました!");
        system.runTimeout(() => {
        victim.runCommand(`tp @s ${saved.pos.x} ${saved.pos.y} ${saved.pos.z }`);
        },10);

        // --- 加害者処刑 ---
        attacker.kill();
        attacker.sendMessage("§c[誤殺ペナルティ]あなたは重大な過ちを犯しました");
      } catch (e) {
        console.warn("[誤殺処理エラー]", e);
      }
      return;
    }

    victim.nameTag = victim.name;
    victim.addTag("dead");
    victim.runCommand("gamemode spectator");

    // 正当キル → メッセージとタグ付与
    attacker.sendMessage("§a殺害に成功しました!");

    if (!attacker.hasTag("successKilled")) {
      attacker.addTag("successKilled");
      attacker.sendMessage("§b[Info] あなたに残り時間が表示されるようになりました");
    }
  });
}
export function setupKeyItemTracker() {
  // 定期実行
  system.runInterval(() => {
    for (const player of world.getPlayers()) {
      const invComp = player.getComponent("minecraft:inventory");
      if (!invComp) continue;
      const container = invComp.container;
      if (!container) continue;

      // 今のキーアイテム所持セット
      const nowSet = new Set();

      for (let slot = 0; slot < container.size; slot++) {
        const item = container.getItem(slot);
        if (!item) continue;
        // typeId は "namespace:name" 形式なので最後の部分や全体で KEY_ITEMS と比較
        const itemId = item.typeId.split(":").pop();
        if (KEY_ITEMS.includes(itemId)) {
          nowSet.add(itemId);
        }
      }

      const prevSet = playerHasKeyItemPrev.get(player.id) || new Set();

      // 新しく取得されたキーアイテムがあれば
      for (const keyItem of nowSet) {
        if (!prevSet.has(keyItem)) {
          // このプレイヤーが keyItem を取得したとみなす
          updateLastOwner(player, keyItem);
        }
      }

      // 更新
      playerHasKeyItemPrev.set(player.id, nowSet);
    }
  }, 20); // 20 tick = 約1秒
}