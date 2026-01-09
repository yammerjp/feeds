import type { Tweet } from "../sources/twilog.js";
import type { JsonFeed, JsonFeedItem } from "../lib/types.js";
import { escapeXml } from "../lib/utils.js";
import { guessYear } from "../lib/date.js";
import { parseTwilogDateTime } from "../sources/twilog.js";

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
    items: tweets.map((tweet) => {
      let datePublished: string | undefined;
      if (tweet.date && tweet.time) {
        const dateMatch = tweet.date.match(/(\d+)月(\d+)日/);
        if (dateMatch) {
          const month = parseInt(dateMatch[1], 10);
          const day = parseInt(dateMatch[2], 10);
          const year = guessYear(month, day);
          datePublished = parseTwilogDateTime(tweet.date, tweet.time, year);
        }
      }

      return {
        id: tweet.id || tweet.url || tweet.text.slice(0, 50),
        url: tweet.url || options.homePageUrl,
        content_text: tweet.text,
        date_published: datePublished,
      };
    }),
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
  const items = tweets
    .map((tweet) => {
      let datePublished: string | undefined;
      if (tweet.date && tweet.time) {
        const dateMatch = tweet.date.match(/(\d+)月(\d+)日/);
        if (dateMatch) {
          const month = parseInt(dateMatch[1], 10);
          const day = parseInt(dateMatch[2], 10);
          const year = guessYear(month, day);
          datePublished = parseTwilogDateTime(tweet.date, tweet.time, year);
        }
      }

      const pubDate = datePublished ? new Date(datePublished).toUTCString() : "";

      return `    <item>
      <title>${escapeXml(tweet.text.slice(0, 100))}</title>
      <link>${escapeXml(tweet.url || options.link)}</link>
      <description>${escapeXml(tweet.text)}</description>
      <guid>${escapeXml(tweet.id || tweet.url || tweet.text.slice(0, 50))}</guid>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
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
