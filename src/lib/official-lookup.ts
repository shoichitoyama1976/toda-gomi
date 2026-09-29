import { createServerFn } from "@tanstack/react-start";
import {
  matchOfficialPartial,
  matchOfficialRows,
  OFFICIAL_LIST_URL,
  parseOfficialList,
  type OfficialRow,
} from "@/data/official-list";

const TTL_MS = 6 * 60 * 60 * 1000;

let cache: { at: number; rows: OfficialRow[] } | null = null;

async function loadOfficialRows(): Promise<OfficialRow[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rows;
  const response = await fetch(OFFICIAL_LIST_URL, {
    headers: { "user-agent": "toda-gomi-app" },
  });
  if (!response.ok) throw new Error(`official list ${response.status}`);
  const rows = parseOfficialList(await response.text());
  if (rows.length === 0) throw new Error("official list was empty");
  cache = { at: Date.now(), rows };
  return rows;
}

export type OfficialLookup = { exact: OfficialRow[]; partial: OfficialRow[] };

export const lookupOfficial = createServerFn({ method: "POST" })
  .inputValidator((data: { query: string }) => data)
  .handler(async ({ data }): Promise<OfficialLookup> => {
    const rows = await loadOfficialRows();
    return {
      exact: matchOfficialRows(rows, data.query),
      partial: matchOfficialPartial(rows, data.query),
    };
  });
