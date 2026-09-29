export const OFFICIAL_LIST_URL = "https://www.city.toda.saitama.jp/soshiki/212/kankyo-cl-gomi-list.html";

export type OfficialSlot = "moyasu" | "moyasanai" | "shigen" | "sodai" | "none";

export type OfficialRow = {
  name: string;
  kind: string;
  day: string;
  how: string;
  slot: OfficialSlot;
};

function decodeCell(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

function slotFromDay(day: string): OfficialSlot {
  if (day.includes("収集しません")) return "none";
  if (day.includes("申込")) return "sodai";
  if (day.includes("もやさない")) return "moyasanai";
  if (day.includes("もやす")) return "moyasu";
  if (day.includes("資源")) return "shigen";
  return "none";
}

export function parseOfficialList(html: string): OfficialRow[] {
  const rows: OfficialRow[] = [];
  for (const tr of html.match(/<tr[\s\S]*?<\/tr>/gi) ?? []) {
    const cells = [...tr.matchAll(/<td[\s\S]*?>([\s\S]*?)<\/td>/gi)].map((match) => decodeCell(match[1]));
    if (cells.length < 4) continue;
    const [name, kind, day, how] = cells;
    if (!name || name === "品目") continue;
    rows.push({ name, kind, day, how, slot: slotFromDay(day) });
  }
  return rows;
}

function normalize(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[\u30a1-\u30f6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

export function matchOfficialRows(rows: OfficialRow[], query: string): OfficialRow[] {
  const s = normalize(query);
  if (s.length < 2) return [];
  return rows
    .filter((row) => normalize(row.name) === s)
    .sort((a, b) => a.name.localeCompare(b.name, "ja"));
}
