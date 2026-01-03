import type { Tweet } from "./twilog.js";

interface JsonFeed {
  version: string;
  title: string;
  home_page_url: string;
  feed_url: string;
  items: JsonFeedItem[];
}

interface JsonFeedItem {
  id: string;
  url: string;
  content_text: string;
  date_published?: string;
}

export function toJsonFeed(
  tweets: Tweet[],
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
    items: tweets.map((tweet) => ({
      id: tweet.id || tweet.url || tweet.text.slice(0, 50),
      url: tweet.url || options.homePageUrl,
      content_text: tweet.text,
      date_published: tweet.date && tweet.time ? undefined : undefined, // TODO: parse date
    })),
  };
}

export function toRss(
  tweets: Tweet[],
  options: {
    title: string;
    link: string;
    description: string;
  }
): string {
  const escapeXml = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const items = tweets
    .map(
      (tweet) => `    <item>
      <title>${escapeXml(tweet.text.slice(0, 100))}</title>
      <link>${escapeXml(tweet.url || options.link)}</link>
      <description>${escapeXml(tweet.text)}</description>
      <guid>${escapeXml(tweet.id || tweet.url || tweet.text.slice(0, 50))}</guid>
    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(options.title)}</title>
    <link>${escapeXml(options.link)}</link>
    <description>${escapeXml(options.description)}</description>
${items}
  </channel>
</rss>`;
}
