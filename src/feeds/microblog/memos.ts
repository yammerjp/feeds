import { parseRss } from "../../lib/rss/parser.js";

export interface Memo {
  id: string;
  url: string;
  text: string;
  date_published: string;
}

/**
 * Strip HTML tags from text.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .trim();
}

/**
 * Parse Memos RSS feed into Memo array.
 */
export function parseMemosRss(xml: string): Memo[] {
  const items = parseRss(xml);

  return items.map((item) => ({
    id: item.link,
    url: item.link,
    text: stripHtml(item.description),
    date_published: item.pubDate ? new Date(item.pubDate).toISOString() : "",
  }));
}

/**
 * Fetch Memos for a user.
 */
export async function fetchMemos(rssUrl: string): Promise<Memo[]> {
  const res = await fetch(rssUrl);
  const xml = await res.text();
  return parseMemosRss(xml);
}
