import { fetchRss, rssToJsonFeed } from "../lib/rss.js";
import type { FeedItem } from "../lib/types.js";

export async function resolveBlueskyHandle(handle: string): Promise<string> {
  const res = await fetch(
    `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`
  );
  const data = await res.json();
  return data.did;
}

export async function fetchBlueskyFeed(handle: string): Promise<FeedItem[]> {
  const did = await resolveBlueskyHandle(handle);
  const rssUrl = `https://bsky.app/profile/${did}/rss`;
  const rssXml = await fetchRss(rssUrl);

  const jsonFeed = rssToJsonFeed(rssXml, {
    title: `@${handle} on Bluesky`,
    homePageUrl: `https://bsky.app/profile/${handle}`,
    feedUrl: `https://bsky.app/profile/${did}/rss`,
  });

  return jsonFeed.items.map((item) => ({
    ...item,
    tags: ["bluesky"],
  }));
}
