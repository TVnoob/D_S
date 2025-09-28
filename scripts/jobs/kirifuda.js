// trumpSystem.js
import { world, system } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { evaluateHand } from "./kirifuda_subclass/hannteiC";

// デッキ定義（52枚）
const SUITS = ["S", "H", "D", "C"];
const RANKS = ["14", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];

const deck = [];
for (const s of SUITS) {
  for (const r of RANKS) {
    deck.push({ rank: r, suit: s });
  }
}

const SUIT_NAMES = {
  "S": "♠の",
  "H": "♥の",
  "D": "♦の",
  "C": "♣の"
};

const RANK_NAMES = {
  "14": "A",
  "2": "2",
  "3":"3",
  "4":"4",
  "5":"5",
  "6":"6",
  "7":"7",
  "8":"8",
  "9":"9",
  "10":"10",
  "11":"J",
  "12":"Q",
  "13":"K"
};

// プレイヤーごとの手札を管理
const playerHands = new Map(); // { cards: [...], result: null, deck: [...] }

// 山札を生成
function createDeck() {
  const deck = [];
  for (const s of SUITS) {
    for (const r of RANKS) {
      deck.push(`${s}${r}`);
    }
  }
  return deck;
}

// === 切り札UIを開く ===
export function openTrumpUI(player) {
  if (!playerHands.has(player.id)) {
    playerHands.set(player.id, { cards: [null, null, null, null, null], result: null, deck: createDeck() });
  }
  showTrumpUI(player);
}

// === UIの描画 ===
function showTrumpUI(player) {
  const handData = playerHands.get(player.id);
  const form = new ModalFormData()
    .title("ポーカーテーブル");

  // 各スロットをリスト化して dropdown にまとめる
  const options = handData.cards.map((card, i) =>
    card ?? `カード${i + 1}: めくる (消費:トランプ1枚)`
  );

  form.dropdown("カードを選んでめくる", options, { defaultValueIndex: 0 });

  if (![handData.cards.some(c => c === null)]){
  form.submitButton("右上の×ボタンを押して閉じよう!");
  } else {
  form.submitButton("引く!");
  }

  form.show(player).then(res => {
    if (res.canceled || !res.formValues) return;

    // res.formValues は 1 要素配列なので取り出す
    const idx = res.formValues[0]; 

    // 未確定スロットならカードを引く
    if (handData.cards[idx] === null) {
      if (!consumeTrump(player)) {
        player.sendMessage("§cトランプが足りません！");
        return;
      }

      const newCard = drawCard(player);
      handData.cards[idx] = newCard;
      player.sendMessage(`カード${idx + 1} をめくった: ${formatCard(newCard)}`);
    }

    // 判定 or 再度UI
    if (handData.cards.every(c => c !== null)) {
      player.sendMessage("5枚揃いました! 役を判定します…");
      const hand = evaluateHand(handData.cards);
      applyEffect(player, hand);
      playerHands.set(player.id, { cards: [null, null, null, null, null], result: null, deck: createDeck() }); // ここでリセット
    } else {
      showTrumpUI(player); // まだ残ってる → もう一度開く
    }
  });
}

// === カード1枚引く ===
function drawCard(player) {
  const data = playerHands.get(player.id);
  if (!data.deck.length) {
    // 山札切れ → 新しいデッキを生成
    data.deck = createDeck();
  }

  // シャッフルして1枚引く
  const idx = Math.floor(Math.random() * data.deck.length);
  const card = data.deck.splice(idx, 1)[0]; // 山札から取り除く
  return card;
}

// === 表示用の変換 ===
function formatCard(card) {
  const suit = card[0];           // 先頭1文字 (S,H,D,K)
  const rank = card.slice(1);     // 残り (A,2..K)
  return `${SUIT_NAMES[suit]}${RANK_NAMES[rank]}`;
}

// === トランプを消費 ===
function consumeTrump(player) {
  const inv = player.getComponent("inventory").container;
  for (let i = 0; i < inv.size; i++) {
    const item = inv.getItem(i);
    if (item && item.typeId === "nico:a-z_card") { // アイテムIDが変化する可能性
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
      player.sendMessage("§b[役]ストレート");
      player.sendMessage("§a移動速度+1、毎秒満腹度回復、宝石+3を得ました!");
      break;

    case "フラッシュ":
      addEffect(player, "health_boost", 40, "infinite"); // 最大体力+40
      addEffect(player, "regeneration", 1, "infinite"); // 毎秒体力回復
      giveHouseki(player, 3);
      player.sendMessage("§b[役]フラッシュ");
      player.sendMessage("§a最大体力+40、毎秒体力回復、宝石+3を得ました!");
      break;

    case "フルハウス":
      addEffect(player, "resistance", 5, "infinite"); // 受けるダメージ半減
      giveHouseki(player, 3);
      player.sendMessage("§b[役]フルハウス");
      player.sendMessage("§aダメージ半減、宝石+3を得ました!");
      break;

    case "フォーカード":
      addKiruFuda(player, 4);
      giveHouseki(player, 4);
      player.sendMessage("§b[激運役]フォーカード");
      player.sendMessage("§a切札+4、宝石+4を得ました!");
      break;

    case "ストレートフラッシュ":
      addEffect(player, "speed", 2, "infinite");
      addEffect(player, "health_boost", 40, "infinite");
      giveHouseki(player, 10);
      player.sendMessage("§b[超激運役]ストレートフラッシュ");
      player.sendMessage("§a移動速度+2、最大体力+40、宝石+10を得ました!");
      break;

    case "ロイヤルストレートフラッシュ":
      addKiruFuda(player, 99);
      player.sendMessage("§l§4(INPOSSIBLE)§r§b[-人生消費-役]ロイヤルストレートフラッシュ");
      player.sendMessage("§6伝説の役を完成!切札+99を得ました!");
      break;

    default:
      player.sendMessage(`§7役「${role}」に効果はありません。`);
      break;
  }
}


function addKiruFuda(player, amount) {
  world.sendMessage("§a[DEBUG] 切札 スコアボードを初期化しました");
  const score = world.scoreboard.getObjective("KIRUFUDA") ??
    world.scoreboard.addObjective("KIRUFUDA", "KIRUFUDA");
  // identity を強制的に確保
  //if (score.getScore(player.name) === undefined) {
  score.setScore(player.name, 0);
  //}
  const current = score.getScore(player.name) ?? 0;
  score.setScore(player.name, current + amount);
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
    createDeck();
}