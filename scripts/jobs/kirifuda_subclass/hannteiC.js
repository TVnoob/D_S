// hannteiC.js
// 役判定ロジックをリスト化したファイル

// === 基本判定ユーティリティ ===

// カードは { rank: number, suit: string } の形式を想定
// rank: 2〜14 (A=14), suit: "hearts" | "spades" | "diamonds" | "clubs"

function isFlush(cards) {
  console.warn(JSON.stringify(cards));
  console.warn("test",cards.every(c => c.suit === cards[0].suit));
  return cards.every(c => c.suit === cards[0].suit);
}

function isStraight(cards) {
  const ranks = [...new Set(cards.map(c => c.rank))].sort((a, b) => a - b);

  // 通常のストレート
  if (ranks.length === 5 && ranks[4] - ranks[0] === 4) return true;

  // A-2-3-4-5 (ホイール)
  if (ranks.includes(14) && ranks[0] === 2 && ranks[3] === 5) return true;

  return false;
}

function groupByRank(cards) {
  const counts = {};
  for (const c of cards) {
    counts[c.rank] = (counts[c.rank] || 0) + 1;
  }
  return Object.values(counts).sort((a, b) => b - a); // 出現回数を大きい順にソート
}

// === 各役の判定関数 ===
function isRoyalStraightFlush(cards) {
  return isFlush(cards) && isStraight(cards) && cards.some(c => c.rank === 14) && cards.some(c => c.rank === 13);
}

function isStraightFlush(cards) {
  return isFlush(cards) && isStraight(cards);
}

function isFourOfAKind(cards) {
  return groupByRank(cards)[0] === 4;
}

function isFullHouse(cards) {
  const groups = groupByRank(cards);
  return groups[0] === 3 && groups[1] === 2;
}

function isFlushOnly(cards) {
  return isFlush(cards);
}

function isStraightOnly(cards) {
  return isStraight(cards);
}

function isThreeOfAKind(cards) {
  return groupByRank(cards)[0] === 3;
}

function isTwoPair(cards) {
  const groups = groupByRank(cards);
  return groups[0] === 2 && groups[1] === 2;
}

function isOnePair(cards) {
  return groupByRank(cards)[0] === 2;
}

// === 役判定リスト ===
const HAND_CHECKERS = [
  { name: "ロイヤルストレートフラッシュ", check: isRoyalStraightFlush },
  { name: "ストレートフラッシュ", check: isStraightFlush },
  { name: "フォーカード", check: isFourOfAKind },
  { name: "フルハウス", check: isFullHouse },
  { name: "フラッシュ", check: isFlushOnly },
  { name: "ストレート", check: isStraightOnly },
  { name: "スリーカード", check: isThreeOfAKind },
  { name: "ツーペア", check: isTwoPair },
  { name: "ワンペア", check: isOnePair },
];

// === 役を評価する関数 ===
export function evaluateHand(cards) {
  const parsed = cards.map(parseCard);
  for (const { name, check } of HAND_CHECKERS) {
    if (check(parsed)) return name;
  }
  return "ブタ(役なし)";
}

function parseCard(cards) {
  const suit = cards[0];            // 先頭の1文字 → "C" (クラブ)
  const rank = parseInt(cards.slice(1), 10); // 残り → "14" → 数字14
  return { suit, rank };              // { suit: "C", rank: 14 }
}



export function yomikomi_hannteiC(){
  console.warn("hannteiC.js was loading.");
}