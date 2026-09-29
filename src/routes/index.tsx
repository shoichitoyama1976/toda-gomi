import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import {
  DISTRICTS,
  ITEMS,
  SLOT_META,
  WEEKDAY,
  formatDays,
  formatStamp,
  inferMaterial,
  inferType,
  isBubbleWrap,
  isClosure,
  nextCollection,
  searchItems,
  suggestItems,
  tokyoStamp,
  type District,
  type Item,
} from "@/data/toda";
import { lookupOfficial } from "@/lib/official-lookup";
import type { OfficialRow } from "@/data/official-list";

export const Route = createFileRoute("/")({ component: Home });

const STORAGE_KEY = "toda-gomi-district";

function Home() {
  const [districtId, setDistrictId] = useState("1");
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [officialHits, setOfficialHits] = useState<OfficialRow[]>([]);
  const [officialPick, setOfficialPick] = useState<string | null>(null);
  const [officialState, setOfficialState] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && DISTRICTS.some((d) => d.id === saved)) setDistrictId(saved);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, districtId);
  }, [districtId, ready]);

  const district = DISTRICTS.find((d) => d.id === districtId) ?? DISTRICTS[0];
  const matches = useMemo(() => searchItems(query), [query]);
  const suggestions = useMemo(
    () => (query.trim() && matches.length === 0 ? suggestItems(query) : []),
    [query, matches.length],
  );
  const needOfficial = query.trim().length >= 2 && matches.length === 0;

  useEffect(() => {
    if (!needOfficial) {
      setOfficialHits([]);
      setOfficialPick(null);
      setOfficialState("idle");
      return;
    }
    const q = query.trim();
    let cancelled = false;
    setOfficialHits([]);
    setOfficialPick(null);
    setOfficialState("loading");
    const timer = setTimeout(() => {
      lookupOfficial({ data: { query: q } })
        .then((rows) => {
          if (cancelled) return;
          setOfficialHits(rows);
          setOfficialPick(rows.length === 1 ? rows[0].name : null);
          setOfficialState("ready");
        })
        .catch(() => {
          if (cancelled) return;
          setOfficialHits([]);
          setOfficialPick(null);
          setOfficialState("error");
        });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [needOfficial, query]);

  const guess = useMemo(
    () => (query.trim() && matches.length === 0 ? inferType(query) : null),
    [query, matches.length],
  );
  const bubble =
    query.trim() !== "" && matches.length === 0 && !guess && suggestions.length === 0 && isBubbleWrap(query);
  const material = useMemo(
    () =>
      query.trim() && matches.length === 0 && !guess && suggestions.length === 0 && !bubble
        ? inferMaterial(query)
        : null,
    [query, matches.length, guess, suggestions.length, bubble],
  );
  const picked =
    (pickedId ? ITEMS.find((it) => it.id === pickedId) : undefined) ??
    (matches.length === 1 ? matches[0] : undefined);

  const today = tokyoStamp();

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg px-4 pb-16 pt-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold leading-snug tracking-tight">戸田市のごみ分別アプリ</h1>
        <p className="mt-1 text-sm font-medium text-primary">捨てたいものから、出す日を見つける</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          地区を選んで捨てたいものを入れると、区分・曜日・出し方がこの画面に出ます。
        </p>
      </header>

      <label className="mb-3 block">
        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
          <MapPin className="size-4 text-primary" aria-hidden />
          収集地区
        </span>
        <select
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          className="h-12 w-full rounded-xl border border-line bg-surface px-3 text-base text-ink"
        >
          {DISTRICTS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
        <span className="mt-1.5 block text-xs leading-relaxed text-muted">{district.towns}</span>
      </label>

      <label className="relative mb-4 block">
        <span className="sr-only">捨てたいもの</span>
        <Search className="pointer-events-none absolute left-3 top-3.5 size-5 text-muted" aria-hidden />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPickedId(null);
          }}
          placeholder="捨てたいもの（例: ペットボトル、電池、布団）"
          className="h-12 w-full rounded-xl border border-line bg-surface pr-3 pl-11 text-base text-ink outline-none focus:border-primary"
          autoComplete="off"
        />
      </label>

      {query.trim() && matches.length > 1 && !pickedId ? (
        <ul className="mb-4 overflow-hidden rounded-xl border border-line bg-surface">
          {matches.map((it) => (
            <li key={it.id} className="border-b border-line last:border-b-0">
              <button
                type="button"
                onClick={() => setPickedId(it.id)}
                className="flex min-h-12 w-full items-center justify-between gap-3 px-3 py-2 text-left"
              >
                <span className="font-medium">{it.name}</span>
                <span className="shrink-0 text-xs text-muted">{SLOT_META[it.slot].title}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {query.trim() && matches.length === 0 ? (
        <div className="mb-4 rounded-xl border border-line bg-surface px-4 py-3 text-sm">
          {officialState === "loading" ? <p className="text-muted">戸田市の品目表を確認しています。</p> : null}
          {officialHits.length > 1 && !officialPick ? (
            <>
              <p className="text-muted">抜粋にはありません。戸田市の品目表から選んでください。</p>
              <ul className="mt-2">
                {officialHits.map((row) => (
                  <li key={row.name} className="border-t border-line">
                    <button
                      type="button"
                      onClick={() => setOfficialPick(row.name)}
                      className="flex min-h-12 w-full items-center justify-between gap-3 py-2 text-left"
                    >
                      <span className="font-medium">{row.name}</span>
                      <span className="shrink-0 text-xs text-muted">{row.kind}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {officialHits.length > 0 && officialPick ? (
            <OfficialResult district={district} row={officialHits.find((row) => row.name === officialPick) ?? officialHits[0]} />
          ) : null}
          {officialState !== "loading" && officialHits.length === 0 ? (
            <>
              <p className="text-muted">
                {officialState === "error"
                  ? guess
                    ? "公式の品目表をただいま確認できません。種類から推定します。"
                    : bubble
                      ? "公式の品目表をただいま確認できません。近い言い方もないので、プラマークと汚れで区分が分かれます。"
                      : material
                        ? "公式の品目表をただいま確認できません。近い言い方もないので、材質から推定します。"
                        : "公式の品目表をただいま確認できません。近い言い方を選んでください。"
                  : query.trim().length < 2
                    ? guess
                      ? "1文字のため公式の品目表は見ていません。種類から推定します。"
                      : bubble
                        ? "近い言い方はありません。プラマークと汚れで区分が分かれます。"
                        : material
                          ? "近い言い方はありません。材質から推定します。"
                          : "1文字のため公式の品目表は見ていません。近い言い方を選んでください。"
                    : guess
                      ? `「${query.trim()}」は戸田市の品目表にありません。種類から「${guess.typeName}」と推定します。`
                      : bubble
                        ? `「${query.trim()}」は戸田市の品目表にありません。プラマークと汚れで区分が分かれます。`
                        : material
                          ? `「${query.trim()}」は近い言い方がありません。入力から材質（${material.material}）を推定し、「${material.typeName}」と決めます。`
                        : officialState === "ready"
                          ? `「${query.trim()}」はそのままでは見つかりません。戸田市の品目表にもありません。近い言い方を選んでください。`
                          : `「${query.trim()}」はそのままでは見つかりません。近い言い方を選んでください。`}
              </p>
              {suggestions.length > 0 && !guess ? (
                <ul className="mt-2">
                  {suggestions.map((it) => (
                    <li key={it.id} className="border-t border-line">
                      <button
                        type="button"
                        onClick={() => {
                          setQuery(it.name);
                          setPickedId(it.id);
                        }}
                        className="flex min-h-12 w-full items-center justify-between gap-3 py-2 text-left"
                      >
                        <span className="font-medium">{it.name}</span>
                        <span className="shrink-0 text-xs text-muted">{SLOT_META[it.slot].title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {guess ? (
                <div className="mt-3 border-t border-line pt-3">
                  <Result
                    district={district}
                    item={{
                      id: "guess",
                      name: query.trim(),
                      aliases: [],
                      slot: guess.slot,
                      kind: guess.kind,
                      how: guess.how,
                      notes: guess.notes,
                    }}
                  />
                  {guess.bulky && guess.slot !== "sodai" ? <SodaiGuide /> : null}
                </div>
              ) : bubble ? (
                <div className="mt-3 border-t border-line pt-3">
                  <BubbleAnswer district={district} />
                </div>
              ) : material ? (
                <div className="mt-3 border-t border-line pt-3">
                  <Result
                    district={district}
                    item={{
                      id: "material",
                      name: query.trim(),
                      aliases: [],
                      slot: material.slot,
                      kind: material.kind,
                      how: material.how,
                      notes: material.notes,
                    }}
                  />
                  {material.bulky && material.slot !== "sodai" ? <SodaiGuide /> : null}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}

      {picked && query.trim() ? <Result district={district} item={picked} /> : null}

      {!query.trim() ? <WeekStrip district={district} todayDow={today.dow} todayM={today.m} todayD={today.day} /> : null}

      <p className="mt-8 text-xs leading-relaxed text-muted">
        収集は当日朝8時まで。前日の夜出しはしないでください。休止は勤労感謝の日と12月31日〜1月3日。
        川岸は1・2丁目と3丁目で地区が違います。出典は戸田市「家庭ごみの正しい分け方・出し方」（令和8年度）。最終判断は市の案内を確認してください。
      </p>
      <ul className="mt-2 space-y-1 text-xs leading-relaxed">
        <li>
          <a className="text-primary underline" href="https://www.city.toda.saitama.jp/soshiki/212/kankyo-cl-gomi.html" target="_blank" rel="noreferrer">
            家庭ごみの正しい分け方・出し方について
          </a>
        </li>
        <li>
          <a className="text-primary underline" href="https://www.city.toda.saitama.jp/uploaded/attachment/78306.pdf" target="_blank" rel="noreferrer">
            令和8年度 家庭ごみの正しい分け方・出し方（PDF）
          </a>
        </li>
        <li>
          <a className="text-primary underline" href="https://www.city.toda.saitama.jp/uploaded/attachment/78679.pdf" target="_blank" rel="noreferrer">
            令和8年度 ごみ収集日一覧表（PDF）
          </a>
        </li>
        <li>
          <a className="text-primary underline" href="https://www.city.toda.saitama.jp/soshiki/212/kankyo-cl-gomi-list.html" target="_blank" rel="noreferrer">
            判断に迷う家庭ごみの分け方・出し方
          </a>
        </li>
        <li>
          <a className="text-primary underline" href="https://www.city.toda.saitama.jp/soshiki/212/kankyo-cl-sodainitsuite.html" target="_blank" rel="noreferrer">
            粗大ごみについて
          </a>
        </li>
      </ul>
    </main>
  );
}

function OfficialResult({ district, row }: { district: District; row: OfficialRow }) {
  return (
    <Result
      district={district}
      item={{
        id: `official:${row.name}`,
        name: row.name,
        aliases: [],
        slot: row.slot,
        kind: row.kind,
        how: row.how,
        notes: `戸田市「判断に迷う家庭ごみの分け方・出し方」の品目表より。収集日は「${row.day}」。`,
      }}
    />
  );
}

function Result({ district, item }: { district: District; item: Item }) {
  const meta = SLOT_META[item.slot];
  const days =
    item.slot === "moyasu" || item.slot === "moyasanai" || item.slot === "shigen"
      ? district.days[item.slot]
      : null;
  const upcoming = days ? nextCollection(days) : null;
  const today = tokyoStamp();
  const isToday = days?.includes(today.dow) && !isClosure(today.m, today.day);

  return (
    <article className="rounded-card border border-line bg-surface p-4">
      <p className="text-xs font-medium text-muted">{district.towns}</p>
      <h2 className="mt-1 text-xl font-bold">{item.name}</h2>
      <p className="mt-2 inline-flex rounded-full bg-chip px-3 py-1 text-sm font-medium text-primary">
        {item.kind}
      </p>

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-muted">収集</dt>
          <dd className="mt-0.5 text-lg font-bold">
            {days ? `毎週 ${formatDays(days)}曜日` : meta.dayLabel}
          </dd>
          {upcoming ? (
            <dd className="mt-1 text-primary">次は {formatStamp(upcoming.stamp)}</dd>
          ) : null}
          {isToday && today.hour >= 8 && days ? (
            <dd className="mt-1 text-accent">今日は収集日ですが、朝8時を過ぎています。</dd>
          ) : null}
          {isToday && today.hour < 8 && days ? (
            <dd className="mt-1 text-primary">今日が収集日です。朝8時までに出してください。</dd>
          ) : null}
        </div>
        <div>
          <dt className="text-muted">出し方</dt>
          <dd className="mt-0.5 leading-relaxed">{item.how}</dd>
        </div>
        {item.notes ? (
          <div>
            <dt className="text-muted">注意</dt>
            <dd className="mt-0.5 leading-relaxed">{item.notes}</dd>
          </div>
        ) : null}
      </dl>

      {item.slot === "sodai" ? <SodaiGuide /> : null}
    </article>
  );
}

function BubbleAnswer({ district }: { district: District }) {
  const patterns = [
    {
      when: "プラマークがある",
      kind: "プラマーク容器包装",
      day: `もやさないごみの日（毎週${formatDays(district.days.moyasanai)}曜日）`,
      how: "白色半透明または透明の袋。",
    },
    {
      when: "プラマークがない",
      kind: "もやすごみ",
      day: `もやすごみの日（毎週${formatDays(district.days.moyasu)}曜日）`,
      how: "製品プラスチックとして、白色半透明または透明の袋。",
    },
    {
      when: "汚れが落ちない",
      kind: "もやすごみ",
      day: `もやすごみの日（毎週${formatDays(district.days.moyasu)}曜日）`,
      how: "マークがあっても、もやすごみです。",
    },
  ];
  return (
    <div>
      <ol className="space-y-2">
        {patterns.map((pattern, index) => (
          <li key={pattern.when} className="rounded-xl border border-line px-3 py-3">
            <p className="text-xs font-medium text-muted">パターン{index + 1}</p>
            <p className="mt-0.5 font-bold">{pattern.when}</p>
            <p className="mt-1 inline-flex rounded-full bg-chip px-3 py-1 text-sm font-medium text-primary">{pattern.kind}</p>
            <p className="mt-2">{pattern.day}</p>
            <p className="text-muted">{pattern.how}</p>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-muted">
        空気を抜いてから出します。段ボールとは混ぜません。外側の段ボールは資源物です。資源物の日（毎週
        {formatDays(district.days.shigen)}曜日）に、ひもで結んで出します。
      </p>
    </div>
  );
}

function SodaiGuide() {
  return (
    <div className="mt-4 rounded-xl bg-accent-soft px-3 py-3 text-sm leading-relaxed text-ink">
      <p>
        粗大ごみ専用ダイヤル 048-424-5747（平日9時〜17時、土曜9時〜13時。日祝・年末年始は休み）。1点400円。LINE申請はPayPayまたはクレジットカード払いです。
      </p>
      <a
        href="https://line.me/R/ti/p/%40889cxnvo"
        className="mt-3 inline-flex min-h-11 items-center font-medium text-primary underline"
        target="_blank"
        rel="noreferrer"
      >
        戸田市公式LINEで申し込む
      </a>
      <p className="mt-2 text-xs text-muted">
        友だち追加後、メニューの「ごみ」から「粗大ごみの申込み」を開いてください。
      </p>
    </div>
  );
}
function WeekStrip({
  district,
  todayDow,
  todayM,
  todayD,
}: {
  district: District;
  todayDow: number;
  todayM: number;
  todayD: number;
}) {
  const rows: { key: "moyasu" | "moyasanai" | "shigen"; label: string }[] = [
    { key: "moyasu", label: "もやす" },
    { key: "moyasanai", label: "もやさない" },
    { key: "shigen", label: "資源物" },
  ];

  return (
    <section>
      <h2 className="mb-2 text-sm font-medium text-muted">この地区の毎週</h2>
      <ul className="space-y-2">
        {rows.map((row) => {
          const days = district.days[row.key];
          const hit = days.includes(todayDow) && !isClosure(todayM, todayD);
          return (
            <li
              key={row.key}
              className="flex items-center justify-between rounded-xl border border-line bg-surface px-3 py-3"
            >
              <span className="font-medium">{row.label}</span>
              <span className="text-sm">
                {formatDays(days)}
                {hit ? <span className="ml-2 font-medium text-primary">今日</span> : null}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-muted">
        今日は{todayM}月{todayD}日（{WEEKDAY[todayDow]}）。捨てたいものを入れると出し方まで表示します。
      </p>
    </section>
  );
}
