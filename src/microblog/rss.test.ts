import { describe, it, expect } from "vitest";
import { parseRss, rssToJsonFeed } from "./rss.js";

const sampleRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <link>https://example.com</link>
    <description>A test feed</description>
    <item>
      <title>First Post</title>
      <link>https://example.com/post/1</link>
      <description>This is the first post</description>
      <pubDate>Sat, 01 Jan 2026 12:00:00 +0000</pubDate>
      <guid>post-1</guid>
    </item>
    <item>
      <title>Second Post</title>
      <link>https://example.com/post/2</link>
      <description>This is the second post</description>
      <pubDate>Sun, 02 Jan 2026 12:00:00 +0000</pubDate>
      <guid>post-2</guid>
    </item>
  </channel>
</rss>`;

describe("parseRss", () => {
  it("should parse RSS items", () => {
    const items = parseRss(sampleRss);
    expect(items).toHaveLength(2);
  });

  it("should extract title", () => {
    const items = parseRss(sampleRss);
    expect(items[0].title).toBe("First Post");
  });

  it("should extract link", () => {
    const items = parseRss(sampleRss);
    expect(items[0].link).toBe("https://example.com/post/1");
  });

  it("should extract description", () => {
    const items = parseRss(sampleRss);
    expect(items[0].description).toBe("This is the first post");
  });

  it("should extract pubDate", () => {
    const items = parseRss(sampleRss);
    expect(items[0].pubDate).toBe("Sat, 01 Jan 2026 12:00:00 +0000");
  });

  it("should extract guid", () => {
    const items = parseRss(sampleRss);
    expect(items[0].guid).toBe("post-1");
  });
});

describe("rssToJsonFeed", () => {
  it("should convert RSS to JSON Feed format", () => {
    const jsonFeed = rssToJsonFeed(sampleRss, {
      title: "Test Feed",
      homePageUrl: "https://example.com",
      feedUrl: "https://example.com/feed.json",
    });

    expect(jsonFeed.version).toBe("https://jsonfeed.org/version/1.1");
    expect(jsonFeed.title).toBe("Test Feed");
    expect(jsonFeed.home_page_url).toBe("https://example.com");
    expect(jsonFeed.feed_url).toBe("https://example.com/feed.json");
  });

  it("should convert items correctly", () => {
    const jsonFeed = rssToJsonFeed(sampleRss, {
      title: "Test Feed",
      homePageUrl: "https://example.com",
      feedUrl: "https://example.com/feed.json",
    });

    expect(jsonFeed.items).toHaveLength(2);
    expect(jsonFeed.items[0].id).toBe("post-1");
    expect(jsonFeed.items[0].url).toBe("https://example.com/post/1");
    expect(jsonFeed.items[0].title).toBe("First Post");
    expect(jsonFeed.items[0].content_text).toBe("This is the first post");
  });

  it("should convert pubDate to ISO format", () => {
    const jsonFeed = rssToJsonFeed(sampleRss, {
      title: "Test Feed",
      homePageUrl: "https://example.com",
      feedUrl: "https://example.com/feed.json",
    });

    expect(jsonFeed.items[0].date_published).toBe("2026-01-01T12:00:00.000Z");
  });
});
