import type { FeedItem, JsonFeed } from "./types.js";
import { escapeXml } from "./utils.js";

export function sortFeedItems(items: FeedItem[]): FeedItem[] {
  return items
    .filter((item) => item.date_published)
    .sort((a, b) => {
      const dateA = new Date(a.date_published!).getTime();
      const dateB = new Date(b.date_published!).getTime();
      return dateB - dateA; // 新しい順
    });
}

export function createCombinedJsonFeed(
  items: FeedItem[],
  options: {
    title: string;
    homePageUrl: string;
    feedUrl: string;
  }
): JsonFeed {
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: options.title,
    home_page_url: options.homePageUrl,
    feed_url: options.feedUrl,
    items,
  };
}

export function createCombinedRss(
  items: FeedItem[],
  options: {
    title: string;
    link: string;
    description: string;
  }
): string {
  const rssItems = items
    .map((item) => {
      const categories = item.tags
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join("\n");

      return `    <item>
      <title>${escapeXml(item.title || item.content_text.slice(0, 100))}</title>
      <link>${escapeXml(item.url)}</link>
      <description>${escapeXml(item.content_text)}</description>
      <guid>${escapeXml(item.id)}</guid>
      <pubDate>${item.date_published ? new Date(item.date_published).toUTCString() : ""}</pubDate>
${categories}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(options.title)}</title>
    <link>${escapeXml(options.link)}</link>
    <description>${escapeXml(options.description)}</description>
${rssItems}
  </channel>
</rss>`;
}
