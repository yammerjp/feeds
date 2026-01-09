import { fetchRss, rssToJsonFeed } from "../lib/rss.js";
import type { FeedItem } from "../lib/types.js";

export async function fetchPhotosFeed(rssUrl: string): Promise<FeedItem[]> {
  const rssXml = await fetchRss(rssUrl);

  const jsonFeed = rssToJsonFeed(rssXml, {
    title: "yammer's photos",
    homePageUrl: "https://toycamera.yammer.jp/@yammer",
    feedUrl: rssUrl,
  });

  return jsonFeed.items.map((item) => ({
    ...item,
    tags: ["photos"],
  }));
}
