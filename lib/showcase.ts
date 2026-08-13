import { getDB } from "@/lib/db";

export interface ShowcaseItem {
  name: string;
  url: string;
}

// Fallback used when D1 is not available (e.g. plain `next start` on Node,
// or before the first migration run). Kept in sync with the seed inserts in
// migrations/0001_init.sql.
const SEED_ITEMS: ShowcaseItem[] = [
  { name: "Happy Horse 2", url: "https://happyhorse2.com/" },
  { name: "Hubble Birthday", url: "https://hubblebirthday.com/" },
  { name: "vget", url: "https://www.vget.io/" },
  { name: "submitnow", url: "https://www.submitnow.dev/" },
  { name: "OG Image Generator", url: "https://myogimage.com" },
  { name: "Black's Screen", url: "https://www.blacksscreen.com/" },
  { name: "Pinpoint Answer", url: "https://pinpointanswer.today/" },
  { name: "Dead Pixel Test", url: "https://deadpixelstest.com/" },
  { name: "Ouke Machinery", url: "https://www.oukemac.com/" },
  { name: "Ouke Machinery", url: "https://oukepoultry.com/" },
  { name: "Robot Apex", url: "https://ai-apex.top/" },
  { name: "PicArt - Online Puzzle Tool", url: "https://www.puzzletool.online/" },
  { name: "Escape From Duckov Wiki", url: "https://www.escapefromduckov.io/" },
  { name: "FileMerges", url: "https://filemerges.net/" },
  { name: "Khuzama Valley Investment", url: "https://khuzamainv.com/" },
];

/**
 * Returns the showcase items. Reads from D1 when the binding is available
 * (dynamic routes only — see the note in lib/db.ts), otherwise falls back
 * to the seed list.
 */
export async function getShowcaseItems(): Promise<ShowcaseItem[]> {
  const db = getDB();
  if (!db) {
    return SEED_ITEMS;
  }

  try {
    const result = await db
      .prepare(
        "SELECT name, url FROM showcase_items ORDER BY sort_order, id"
      )
      .all<ShowcaseItem>();
    if (result.results && result.results.length > 0) {
      return result.results;
    }
  } catch (err) {
    console.error("Failed to read showcase items from D1:", err);
  }

  return SEED_ITEMS;
}
