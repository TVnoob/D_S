// trumpSystem.js
import { world, system } from "@minecraft/server";
import { ModalFormData,ActionFormData } from "@minecraft/server-ui";
import { evaluateHand } from "./kirifuda_subclass/hannteiC";

// デッキ定義（52枚）
const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const DECK = [];
for (const s of SUITS) for (const r of RANKS) DECK.push(`${s}${r}`);

// プレイヤーごとの手札を管理
const playerHands = new Map(); // { playerId: { cards: [null,null,null,null,null], result: null } }

// === 切り札UIを開く ===
export function openTrumpUI(player) {
  if (!playerHands.has(player.id)) {
    playerHands.set(player.id, { cards: [null, null, null, null, null], result: null });
  }
  showTrumpUI(player);
}

// === UIの描画 ===
function showTrumpUI(player) {
  const handData = playerHands.get(player.id);
  const form = new ModalFormData()
  .title("ポーカーテーブル")

  const options = handData.cards.map((card, i) => card ?? `カード${i + 1}: めくる (消費:トランプ1枚)`);

  form.dropdown("カードを選んでめくる", options, { defaultValueIndex: 0 });

  if (handData.cards.some(c => c === null)){
  form.submitButton("test");
  } else {
  form.submitButton("引く!");
  }
    // どのカードをめくったか判定
  form.show(player).then(res => {
    if (res.canceled || res.selection === undefined) return;

    const idx = res.selection; // ドロップダウンで選ばれたカード番号
    if (handData.cards[idx] === null) {
      // ここでトランプを消費して新しいカードを引く処理
      const newCard = drawRandomCard();
      handData.cards[idx] = newCard;
      player.sendMessage(`カード${idx + 1} をめくった: ${newCard}`);

      // まだ未確定カードが残っていれば UI を再度開く
      if (handData.cards.some(c => c === null)) {
        showTrumpUI(player);
      } else {
        player.sendMessage("5枚揃いました!役を判定します…");
        const hand = evaluateHand(handData.cards);
        applyPokerEffect(player, hand); // 役に応じた効果を付与
      }
    }
  });
}

// === カード1枚引く ===
function drawCard() {
  const shuffled = DECK.slice().sort(() => Math.random() - 0.5);
  return shuffled[0];
}

// === トランプを消費 ===
function consumeTrump(player) {
  const inv = player.getComponent("inventory").container;
  for (let i = 0; i < inv.size; i++) {
    const item = inv.getItem(i);
    if (item && item.typeId === "nico:toranpu") { // アイテムIDが変化する可能性
      if (item.amount > 1) {
        item.amount -= 1;
        inv.setItem(i, item);
      } else {
        inv.setItem(i, null);
      }
      return true;
    }
  }
  return false;
}

// === 効果付与 ===
function applyEffect(player, role) {
  switch (role) {
    case "ワンペア":
    case "ツーペア":
    case "スリーカード":
      addKiruFuda(player, 3);
      giveHouseki(player, 3);
      player.sendMessage("§a切札+3、宝石+3を得ました!");
      break;

    case "ストレート":
      addEffect(player, "speed", 1, "infinite");
      addEffect(player, "saturation", 1, "infinite"); // 毎秒満腹度回復
      giveHouseki(player, 3);
      player.sendMessage("§a移動速度+1、毎秒満腹度回復、宝石+3を得ました!");
      break;

    case "フラッシュ":
      addEffect(player, "health_boost", 40, "infinite"); // 最大体力+40
      addEffect(player, "regeneration", 1, "infinite"); // 毎秒体力回復
      giveHouseki(player, 3);
      player.sendMessage("§a最大体力+40、毎秒体力回復、宝石+3を得ました!");
      break;

    case "フルハウス":
      addEffect(player, "resistance", 5, "infinite"); // 受けるダメージ半減
      giveHouseki(player, 3);
      player.sendMessage("§aダメージ半減、宝石+3を得ました!");
      break;

    case "フォーカード":
      addKiruFuda(player, 4);
      giveHouseki(player, 4);
      player.sendMessage("§a切札+4、宝石+4を得ました!");
      break;

    case "ストレートフラッシュ":
      addEffect(player, "speed", 2, "infinite");
      addEffect(player, "health_boost", 40, "infinite");
      giveHouseki(player, 10);
      player.sendMessage("§a移動速度+2、最大体力+40、宝石+10を得ました!");
      break;

    case "ロイヤルストレートフラッシュ":
      addKiruFuda(player, 99);
      player.sendMessage("§6伝説の役を完成!切札+99を得ました!");
      break;

    default:
      player.sendMessage(`§7役「${role}」に効果はありません。`);
      break;
  }
}


function addKiruFuda(player, amount) {
  const score = world.scoreboard.getObjective("KIRUFUDA") ??
    world.scoreboard.addObjective("KIRUFUDA", "KIRUFUDA");
  const current = score.getScore(player) ?? 0;
  score.setScore(player, current + amount);
}

function giveHouseki(player, amount) {
  player.runCommand(`give @s nico:houseki ${amount}`);
}

// 効果付与（統合版なので effect コマンドで付与）
function addEffect(player, effect, amplifier, duration) {
  const dur = duration === "infinite" ? 999999 : duration;
  player.runCommand(`effect @s ${effect} ${dur} ${amplifier} true`);
}
export function yomikomi_kirifuda(){
    console.warn("kirifuda.js was loading.");
}