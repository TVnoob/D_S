import { world, system } from "@minecraft/server";
import { CARD_LETTERS, SEARCH_ITEMS } from "./cardSystem";

// キーアイテム（1種類1個のみ）
const KEY_ITEMS = SEARCH_ITEMS; // 今後追加可能
const playerHasKeyItemPrev = new Map();

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

// === キーアイテム最終所持者を更新 ===
function updateLastOwner(player, itemName) {
  // まず全員から外す
  for (const p of world.getPlayers()) {
    p.removeTag(`LastOwner_${itemName}`);
  }
  // この人を最終所持者にする
  player.addTag(`LastOwner_${itemName}`);
  player.sendMessage(`§6[通知] あなたは ${itemName} の最終所持者になりました!`);
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

// === Hooks ===
export function setupDeathRules() {
  // PvPダメージ制御
  world.afterEvents.entityHurt.subscribe(ev => {
    const attacker = ev.damageSource?.damagingEntity;
    const victim = ev.hurtEntity;

    if (!attacker || !victim) return;
    if (attacker.typeId !== "minecraft:player" || victim.typeId !== "minecraft:player") return;

  });

  // === 正しいキル成立時の処理 ===
  world.afterEvents.entityDie.subscribe(ev => {
    const victim = ev.deadEntity;
    const attacker = ev.damageSource?.damagingEntity;

    if (victim.typeId !== "minecraft:player") return;
    if (!attacker || attacker.typeId !== "minecraft:player") return;

    if (!isKillAllowed(attacker, victim)) {
      // --- 被害者救済 ---
      try {
        const health = victim.getComponent("health");
        health.current = health.value; // HP全回復
        victim.addEffect("resistance", 40, { amplifier: 255, showParticles: false }); // 2秒耐性
        victim.teleport(victim.location, victim.dimension); // その場に再配置（死亡演出対策）
        victim.sendMessage("§a[誤殺救済] あなたは誤殺されていたため復活しました!");

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