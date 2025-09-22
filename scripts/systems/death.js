import { world, system } from "@minecraft/server";
import { CARD_LETTERS, SEARCH_ITEMS } from "./cardSystem";

// キーアイテム（1種類1個のみ）
const KEY_ITEMS = SEARCH_ITEMS; // 今後追加可能

// === Utility ===
function getCard(entity) {
  const tag = entity.getTags().find(t => t.startsWith("Card_"));
  return tag ? tag.replace("Card_", "") : null;
}

function getTarget(entity) {
  const tag = entity.getTags().find(t => t.startsWith("Target_"));
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
  world.beforeEvents.entityHurt.subscribe(ev => {
    const attacker = ev.damageSource.damagingEntity;
    const victim = ev.hurtEntity;

    if (!attacker || !victim) return;
    if (attacker.typeId !== "minecraft:player") return;
    if (victim.typeId !== "minecraft:player") return;

    // 標的へのダメージ +1
    const victimCard = getCard(victim);
    if (victimCard && attacker.hasTag(`Target_${victimCard}`)) {
      ev.damage += 1;
    }

    // 誤殺ペナルティ
    if (!isKillAllowed(attacker, victim)) {
      ev.cancel = true;
      attacker.kill();
      attacker.sendMessage("§c[誤殺ペナルティ]あなたは死亡しました!");
    }
  });

  // === 正しいキル成立時の処理 ===
  world.afterEvents.entityDie.subscribe(ev => {
    const victim = ev.deadEntity;
    const attacker = ev.damageSource?.damagingEntity;

    if (!attacker || attacker.typeId !== "minecraft:player") return;
    if (victim.typeId !== "minecraft:player") return;

    // ここで再度チェック（誤殺の場合 attacker.kill() で既に死んでいるはずだけど保険）
    if (!isKillAllowed(attacker, victim)) return;

    // 正当キル → メッセージとタグ付与
    attacker.sendMessage("§a殺害に成功しました！");

    if (!attacker.hasTag("successKilled")) {
      attacker.addTag("successKilled");
      attacker.sendMessage("§b[Info] あなたに残り時間が表示されるようになりました");
    }
  });

  // === キーアイテムの最終所持者更新 ===
  world.afterEvents.itemPickup.subscribe(ev => {
    const { itemStack, player } = ev;
    if (!itemStack) return;

    const itemId = itemStack.typeId.split(":").pop(); // "minecraft:diamond" → "diamond"
    if (KEY_ITEMS.includes(itemId)) {
      updateLastOwner(player, itemId);
    }
  });
}
