import { fetchRss, rssToJsonFeed } from "../lib/rss.js";
import type { FeedItem } from "../lib/types.js";

export async function fetchMemosFeed(rssUrl: string): Promise<FeedItem[]> {
  const rssXml = await fetchRss(rssUrl);

  const jsonFeed = rssToJsonFeed(rssXml, {
    title: "yammer's memos",
    homePageUrl: "https://usememos.yammer.jp/u/yammer",
    feedUrl: rssUrl,
  });

  return jsonFeed.items.map((item) => ({
    ...item,
    tags: ["memos"],
  }));
}
