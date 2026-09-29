export type Slot = "moyasu" | "moyasanai" | "shigen" | "sodai" | "none";

export type District = {
  id: string;
  label: string;
  towns: string;
  days: Record<"moyasu" | "moyasanai" | "shigen", number[]>;
};

export type Item = {
  id: string;
  name: string;
  aliases: string[];
  slot: Slot;
  kind: string;
  how: string;
  notes?: string;
};

/** 0=日 … 6=土. 令和6〜8年度の地区割に準拠。 */
export const DISTRICTS: District[] = [
  {
    id: "1",
    label: "喜沢・下戸田・中町1",
    towns: "喜沢1・2丁目、下戸田1・2丁目、中町1丁目",
    days: { moyasu: [3, 6], moyasanai: [2], shigen: [1] },
  },
  {
    id: "2",
    label: "中町2・喜沢南・川岸1-2・下前",
    towns: "中町2丁目、喜沢南1・2丁目、川岸1・2丁目、下前1・2丁目",
    days: { moyasu: [3, 6], moyasanai: [5], shigen: [4] },
  },
  {
    id: "3",
    label: "上戸田・大字新曽・大字下笹目",
    towns: "上戸田1〜5丁目、大字上戸田、大字新曽、大字下笹目",
    days: { moyasu: [2, 5], moyasanai: [1], shigen: [6] },
  },
  {
    id: "4",
    label: "本町・戸田公園・南町・川岸3",
    towns: "本町1〜5丁目、戸田公園、南町、川岸3丁目",
    days: { moyasu: [2, 5], moyasanai: [4], shigen: [3] },
  },
  {
    id: "5",
    label: "新曽南・笹目南・氷川・早瀬・笹目5-8",
    towns: "新曽南1〜4丁目、笹目南町、氷川町1〜3丁目、早瀬1・2丁目、笹目5〜8丁目",
    days: { moyasu: [1, 4], moyasanai: [3], shigen: [2] },
  },
  {
    id: "6",
    label: "笹目1-4・美女木",
    towns: "笹目1〜4丁目、笹目北町、美女木1〜8丁目、美女木東1・2丁目、美女木北1〜3丁目",
    days: { moyasu: [1, 4], moyasanai: [6], shigen: [5] },
  },
];

export const WEEKDAY = ["日", "月", "火", "水", "木", "金", "土"] as const;

export const SLOT_META: Record<
  Slot,
  { title: string; dayLabel: string }
> = {
  moyasu: { title: "もやすごみ", dayLabel: "もやすごみの日" },
  moyasanai: { title: "もやさないごみ", dayLabel: "もやさないごみの日" },
  shigen: { title: "資源物", dayLabel: "資源物の日" },
  sodai: { title: "粗大ごみ", dayLabel: "申込み制" },
  none: { title: "市では収集しません", dayLabel: "収集なし" },
};

const item = (
  id: string,
  name: string,
  aliases: string[],
  slot: Slot,
  kind: string,
  how: string,
  notes?: string,
): Item => ({ id, name, aliases, slot, kind, how, notes });

export const ITEMS: Item[] = [
  item("nama", "生ごみ", ["なまごみ", "食べ残し", "残飯"], "moyasu", "もやすごみ", "水気を切って、白色半透明または透明の袋へ。"),
  item("tissue", "ティッシュ・紙くず", ["ちりがみ", "汚れた紙"], "moyasu", "もやすごみ", "白色半透明または透明の袋。"),
  item("omutsu", "紙おむつ", ["おむつ"], "moyasu", "もやすごみ", "汚物を取り除き、白色半透明または透明の袋。"),
  item("eda", "枝木", ["えだ", "剪定枝"], "moyasu", "もやすごみ", "長さ40cm未満・太さ5cm以下に切り、ひもで結ぶ。", "40cm以上は粗大ごみ（申込み）。"),
  item("sponge", "スポンジ・歯ブラシ", ["たわし"], "moyasu", "もやすごみ", "プラマークのない製品プラスチックはもやすごみ。白色半透明または透明の袋。"),
  item("cd", "CD・DVD", ["コンパクトディスク"], "moyasu", "もやすごみ", "ケースも同じく、白色半透明または透明の袋。"),
  item("pack-silver", "紙パック（内側に銀紙）", ["アルミパック", "牛乳ではないパック"], "moyasu", "もやすごみ", "白色半透明または透明の袋。"),
  item("clothes-padding", "中綿入りの衣類", ["ダウン", "ぬいぐるみ小"], "moyasu", "もやすごみ", "40cm未満に切って、白色半透明または透明の袋。", "40cm以上は粗大ごみ。"),
  item("plastic-product", "プラマークのないプラスチック製品", ["洗面器", "バケツ小"], "moyasu", "もやすごみ", "製品プラスチックはもやすごみ。白色半透明または透明の袋。", "1辺40cm以上は粗大ごみ。"),
  item(
    "faucet-filter",
    "蛇口直結型の浄水器のカートリッジ",
    ["浄水器", "浄水器のカートリッジ", "浄水器用カートリッジ", "浄水器カートリッジ", "浄水カートリッジ", "蛇口直結", "蛇口浄水器"],
    "moyasu",
    "もやすごみ",
    "水気を切って、分解せず、白色半透明または透明の袋。もやすごみの日。",
    "戸田市の品目表にこの名前はない。プラマークのないプラスチック製品として、もやすごみ。メーカーが回収している場合はそちらを優先。1辺40cm以上は粗大ごみ。プリンター用のインクカートリッジとは別。",
  ),
  item("pet", "ペットボトル", ["ペット", "pet"], "moyasanai", "ペットボトル", "中を空にし、キャップを外し、ラベルをはがし、軽くすすいでつぶす。もやさないごみの日に青いかごへ。", "キャップとラベルは素材に応じて別に出す。汚れが落ちないものはもやすごみ。"),
  item("pla", "プラマーク容器包装", ["トレイ", "レジ袋", "菓子袋", "シャンプーボトル", "カップ麺容器"], "moyasanai", "プラマーク容器包装", "プラマークが付いていて、軽くすすいで汚れが落ちるもの。白色半透明または透明の袋で、もやさないごみの日。", "汚れが落ちないものは、マークがあってももやすごみ。"),
  item("tray", "食品トレイ", ["発泡トレイ"], "moyasanai", "プラマーク容器包装", "洗って、白色半透明または透明の袋。もやさないごみの日。"),
  item("fuhai", "不燃物（陶器・ガラス・金属小物）", ["茶碗", "コップ", "傘", "鍋", "フライパン", "はさみ"], "moyasanai", "不燃物等", "黄色のかご。傘は40cm以上でも不燃物として出せる。", "1辺40cm以上の家具・家電は粗大ごみ。"),
  item("cosmetic-bin", "化粧品のびん", ["化粧瓶"], "moyasanai", "不燃物等", "洗って、黄色のかご。もやさないごみの日。"),
  item("battery", "乾電池", ["アルカリ電池", "ボタン電池", "コイン電池"], "moyasanai", "危険物", "もやさないごみの日に、透明な袋で赤いかご。"),
  item(
    "lighter",
    "ライター",
    ["使い捨てライター", "100円ライター", "ガスライター", "オイルライター", "電子ライター", "チャッカマン"],
    "moyasanai",
    "危険物",
    "使い切ってから、白色半透明または透明の袋で赤いかご。もやさないごみの日。",
    "公式の区分は「危険物／乾電池・ボタン電池・ライター」。",
  ),
  item("liion", "リチウムイオン電池・充電式電池", ["モバイルバッテリー", "ニッケル水素", "ニカド"], "moyasanai", "危険物", "端子をテープで絶縁し、電池だけを透明な袋に入れて、もやさないごみの日の赤いかご。", "他のごみに混ぜない。発火のおそれあり。"),
  item("small-appliance", "小型家電（40cm未満）", ["ドライヤー", "携帯電話", "スマホ", "ゲーム機", "炊飯器小", "延長コード"], "moyasanai", "危険物・小型家電", "小型家電だけを透明な袋に入れ、もやさないごみの日の赤いかご。", "40cm以上は粗大ごみ。令和8年4月からこの出し方。"),
  item("fluorescent", "蛍光灯", ["蛍光管"], "moyasanai", "危険物", "割らないように、白色半透明または透明の袋で赤いかご。もやさないごみの日。"),
  item("spray", "スプレー缶・カセットボンベ", ["ガスボンベ", "ヘアスプレー"], "shigen", "スプレー缶", "必ず使い切る。穴はあけない。資源物の日に黄色のかご。"),
  item("dumbbell", "鉄アレイ・ダンベル・バーベル", ["ダンベル", "バーベル", "鉄アレイ", "バーベルシャフト", "バーベルプレート", "ウェイト", "ウエイト", "筋トレ"], "moyasanai", "不燃物等", "もやさないごみの日に、黄色のかご。", "公式の品目名は「鉄アレイ・ダンベル」。バーベルという語はない。1辺が40cm以上（シャフトは通常これ）は粗大ごみ。"),
  item("can", "空き缶・缶詰", ["かん", "アルミ缶", "スチール缶"], "shigen", "カン・金属類", "中を洗って、資源物の日に青い大きなカゴ。"),
  item("bottle", "飲料びん", ["ビール瓶", "一升瓶", "ガラスびん"], "shigen", "びん", "中を軽くすすぎ、資源物の日に出す。", "化粧品びんは不燃物（もやさないごみの日・黄色のかご）。"),
  item("golf-ball", "ゴルフボール", [], "moyasu", "もやすごみ", "白色半透明または透明の袋。", "公式にサッカーボールの項目はない。同じ出し方のボールとしてゴルフボール・テニスボールがある。"),
  item("tennis-ball", "テニスボール", [], "moyasu", "もやすごみ", "白色半透明または透明の袋。"),
  item("paper", "新聞・雑誌・段ボール", ["古紙", "チラシ", "ダンボール"], "shigen", "紙類", "資源物の日に、ひもで結ぶ。"),
  item("pack", "紙パック（内側に銀紙なし）", ["牛乳パック"], "shigen", "紙類", "開いて乾かし、飲み口のプラスチックは外して、資源物の日にひもで結ぶ。"),
  item("cloth", "衣類・布類", ["古着", "タオル", "カーテン", "シーツ"], "shigen", "布類", "資源物の日に、白色半透明または透明の袋。", "汚れ・油がひどいもの、中綿入りはもやすごみ。"),
  item("futon", "布団・カーペット・マットレス", ["敷布団", "掛け布団", "じゅうたん"], "sodai", "粗大ごみ", "事前申込みのうえ、指定日の朝8時までに出す。1点400円のシール（またはLINE申請の用紙）。"),
  item("bike", "自転車", ["チャリンコ"], "sodai", "粗大ごみ", "防犯登録シールをはがして、申込み指定日の朝8時まで。1点400円。"),
  item("sofa", "家具・家電（40cm以上）", ["ソファ", "タンス", "テーブル", "電子レンジ", "扇風機", "掃除機"], "sodai", "粗大ごみ", "1辺が40cm以上は粗大ごみ。電話またはLINEで収集日を予約し、指定日の朝8時までに出す。", "1回10点まで。シール1点400円。"),
  item("tv", "テレビ", ["液晶テレビ"], "none", "リサイクル家電", "市では収集しません。家電量販店などの家電リサイクルで処分。"),
  item("fridge", "冷蔵庫・冷凍庫", ["れいぞうこ"], "none", "リサイクル家電", "市では収集しません。家電リサイクル法の対象。"),
  item("washer", "洗濯機・衣類乾燥機", ["せんたくき"], "none", "リサイクル家電", "市では収集しません。家電リサイクル法の対象。"),
  item("ac", "エアコン", ["クーラー"], "none", "リサイクル家電", "市では収集しません。家電リサイクル法の対象。"),
  item("pc", "パソコン", ["ノートpc", "デスクトップ"], "none", "メーカー回収", "市では収集しません。製造メーカーまたは小型家電リサイクル窓口へ。"),
];

export function normalize(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[\u30a1-\u30f6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

/** 品目番号・種別（1=品目名）・正規化済みの語。オブジェクトは作らない。 */
const keyItem: number[] = [];
const keyIsName: number[] = [];
const keyText: string[] = [];
for (let i = 0; i < ITEMS.length; i++) {
  const it = ITEMS[i];
  keyItem.push(i);
  keyIsName.push(1);
  keyText.push(normalize(it.name));
  for (const alias of it.aliases) {
    keyItem.push(i);
    keyIsName.push(0);
    keyText.push(normalize(alias));
  }
}

/** 3文字グラム → 品目番号。同じ品目は1回だけ。 */
const GRAM = new Map<string, number[]>();
for (let k = 0; k < keyText.length; k++) {
  const text = keyText[k];
  const item = keyItem[k];
  if (text.length < 3) continue;
  const seen = new Set<string>();
  for (let i = 0; i <= text.length - 3; i++) {
    const gram = text.slice(i, i + 3);
    if (seen.has(gram)) continue;
    seen.add(gram);
    const bucket = GRAM.get(gram);
    if (!bucket) GRAM.set(gram, [item]);
    else if (bucket[bucket.length - 1] !== item && !bucket.includes(item)) bucket.push(item);
  }
}

function longestCommon(a: string, b: string): number {
  let best = 0;
  const aLen = a.length;
  const bLen = b.length;
  for (let i = 0; i < aLen; i++) {
    for (let j = 0; j < bLen; j++) {
      let n = 0;
      while (i + n < aLen && j + n < bLen && a[i + n] === b[j + n]) n += 1;
      if (n > best) best = n;
      if (best >= aLen) return best;
    }
  }
  return best;
}

function includesAsWord(key: string, query: string): boolean {
  const qLen = query.length;
  let from = 0;
  while (from <= key.length - qLen) {
    const at = key.indexOf(query, from);
    if (at < 0) return false;
    const prev = at === 0 ? "" : key[at - 1];
    if ((at === 0 || at + qLen === key.length) && prev !== "ー") return true;
    from = at + 1;
  }
  return false;
}

export function searchItems(q: string): Item[] {
  const s = normalize(q);
  if (!s) return [];
  const best = new Map<number, number>();
  for (let k = 0; k < keyText.length; k++) {
    const text = keyText[k];
    const name = keyIsName[k] === 1;
    let score = 0;
    if (text === s) score = name ? 100 : 90;
    else if (s.length >= 2 && text.startsWith(s)) score = 80;
    else if (s.length >= 2 && includesAsWord(text, s)) score = 50;
    else if (text.length >= 3 && s.includes(text)) score = name ? 40 : 30;
    const item = keyItem[k];
    if (score > (best.get(item) ?? 0)) best.set(item, score);
  }
  return [...best.entries()]
    .sort((a, b) => b[1] - a[1] || ITEMS[a[0]].name.localeCompare(ITEMS[b[0]].name, "ja"))
    .slice(0, 8)
    .map(([index]) => ITEMS[index]);
}

export function suggestItems(q: string): Item[] {
  const s = normalize(q);
  if (s.length < 3) return [];
  const ids = new Set<number>();
  for (let i = 0; i <= s.length - 3; i++) {
    const bucket = GRAM.get(s.slice(i, i + 3));
    if (!bucket) continue;
    for (let n = 0; n < bucket.length; n++) ids.add(bucket[n]);
  }
  const ranked: { index: number; share: number }[] = [];
  for (const index of ids) {
    const it = ITEMS[index];
    let share = longestCommon(s, normalize(it.name));
    for (let a = 0; a < it.aliases.length; a++) {
      const n = longestCommon(s, normalize(it.aliases[a]));
      if (n > share) share = n;
    }
    if (share >= 3) ranked.push({ index, share });
  }
  ranked.sort((a, b) => b.share - a.share || ITEMS[a.index].name.localeCompare(ITEMS[b.index].name, "ja"));
  return ranked.slice(0, 5).map((row) => ITEMS[row.index]);
}

export type Guess = {
  typeName: string;
  slot: Slot;
  kind: string;
  how: string;
  notes: string;
  bulky: boolean;
};

const GUESS_RULES: { words: string[]; guess: Guess }[] = [
  {
    words: [
      "トースター",
      "オーブントースター",
      "加湿器",
      "除湿機",
      "空気清浄",
      "ミキサー",
      "ジューサー",
      "コーヒーメーカー",
      "電気ケトル",
      "電気ポット",
      "ホットプレート",
      "アイロン",
      "ヘアアイロン",
      "シェーバー",
      "かみそり",
      "電動歯ブラシ",
      "ラジオ",
      "スピーカー",
      "キーボード",
      "マウス",
      "電卓",
      "ファンヒーター",
      "電気ストーブ",
      "こたつ",
      "ルーター",
      "ルータ",
      "無線",
      "モデム",
    ],
    guess: {
      typeName: "小型家電",
      slot: "moyasanai",
      kind: "危険物・小型家電（推定）",
      how: "40cm未満は、もやさないごみの日に本体だけを透明な袋へ入れ、赤いかごへ出します。",
      notes: "1辺が40cm以上は粗大ごみです。申込み案内も同じ画面に出ます。戸田市の品目表にこの名前はありません。",
      bulky: true,
    },
  },
  {
    words: ["ベッド", "学習机", "本棚", "食器棚", "カーペット", "スーツケース", "ベビーベッド"],
    guess: {
      typeName: "粗大ごみ",
      slot: "sodai",
      kind: "粗大ごみ（推定）",
      how: "1辺が40cm以上なら粗大ごみです。事前に申し込み、指定日の朝8時までに出します。",
      notes: "品目表にこの名前はありません。家具や大型の品として粗大ごみと推定しています。",
      bulky: true,
    },
  },
];

const GUESS_INDEX = GUESS_RULES.map((rule) => ({
  words: rule.words.map((word) => normalize(word)),
  guess: rule.guess,
}));

export function inferType(q: string): Guess | null {
  const s = normalize(q);
  if (s.length < 2) return null;
  let bestLen = 0;
  let best: Guess | null = null;
  for (const rule of GUESS_INDEX) {
    for (const word of rule.words) {
      if (word.length >= 2 && s.includes(word) && word.length > bestLen) {
        bestLen = word.length;
        best = rule.guess;
      }
    }
  }
  return best;
}

export function formatDays(days: number[]): string {
  return days.map((d) => WEEKDAY[d]).join("・");
}

const CLOSURES = new Set(["11-23", "12-31", "1-1", "1-2", "1-3"]);

export type TokyoStamp = { y: number; m: number; day: number; dow: number; hour: number };

export function tokyoStamp(base = new Date(), addDays = 0): TokyoStamp {
  const shifted = new Date(base.getTime() + addDays * 86_400_000);
  const s = shifted.toLocaleString("en-US", { timeZone: "Asia/Tokyo" });
  const t = new Date(s);
  return {
    y: t.getFullYear(),
    m: t.getMonth() + 1,
    day: t.getDate(),
    dow: t.getDay(),
    hour: t.getHours(),
  };
}

export function isClosure(m: number, day: number): boolean {
  return CLOSURES.has(`${m}-${day}`);
}

/** 今日を含む次の収集日。今日が収集日でも8時過ぎなら「過ぎた」フラグ。 */
export function nextCollection(days: number[], now = new Date()): { stamp: TokyoStamp; passedToday: boolean } | null {
  const today = tokyoStamp(now, 0);
  for (let i = 0; i < 21; i++) {
    const stamp = tokyoStamp(now, i);
    if (!days.includes(stamp.dow)) continue;
    if (isClosure(stamp.m, stamp.day)) continue;
    const passedToday = i === 0 && today.hour >= 8;
    if (passedToday) continue;
    return { stamp, passedToday: false };
  }
  return null;
}

export function formatStamp(s: TokyoStamp): string {
  return `${s.m}月${s.day}日（${WEEKDAY[s.dow]}）`;
}
