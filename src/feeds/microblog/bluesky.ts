import { parseRss } from "../../lib/rss/parser.js";

export interface BlueskyPost {
  id: string;
  url: string;
  text: string;
  date_published: string;
}

/**
 * Parse Bluesky RSS feed into BlueskyPost array.
 */
export function parseBlueskyRss(xml: string): BlueskyPost[] {
  const items = parseRss(xml);

  return items.map((item) => ({
    id: item.guid,
    url: item.link,
    text: item.description,
    date_published: item.pubDate ? new Date(item.pubDate).toISOString() : "",
  }));
}

/**
 * Resolve Bluesky handle to DID.
 */
export async function resolveBlueskyDid(handle: string): Promise<string> {
  const res = await fetch(
    `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`
  );
  const data = await res.json();
  return data.did;
}

/**
 * Fetch Bluesky posts for a handle.
 */
export async function fetchBluesky(handle: string): Promise<BlueskyPost[]> {
  const did = await resolveBlueskyDid(handle);
  const rssUrl = `https://bsky.app/profile/${did}/rss`;
  const res = await fetch(rssUrl);
  const xml = await res.text();
  return parseBlueskyRss(xml);
}
