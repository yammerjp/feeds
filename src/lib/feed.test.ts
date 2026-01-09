import { describe, it, expect } from "vitest";
import { sortFeedItems, createCombinedJsonFeed, createCombinedRss } from "./feed.js";
import type { FeedItem } from "./types.js";

describe("sortFeedItems", () => {
  it("should sort items by date in descending order (newest first)", () => {
    const items: FeedItem[] = [
      {
        id: "1",
        url: "https://example.com/1",
        content_text: "First",
        date_published: "2026-01-01T00:00:00.000Z",
        tags: ["test"],
      },
      {
        id: "3",
        url: "https://example.com/3",
        content_text: "Third",
        date_published: "2026-01-03T00:00:00.000Z",
        tags: ["test"],
      },
      {
        id: "2",
        url: "https://example.com/2",
        content_text: "Second",
        date_published: "2026-01-02T00:00:00.000Z",
        tags: ["test"],
      },
    ];

    const sorted = sortFeedItems(items);
    expect(sorted[0].id).toBe("3");
    expect(sorted[1].id).toBe("2");
    expect(sorted[2].id).toBe("1");
  });

  it("should filter out items without date_published", () => {
    const items: FeedItem[] = [
      {
        id: "1",
        url: "https://example.com/1",
        content_text: "First",
        date_published: "2026-01-01T00:00:00.000Z",
        tags: ["test"],
      },
      {
        id: "2",
        url: "https://example.com/2",
        content_text: "Second",
        tags: ["test"],
      },
    ];

    const sorted = sortFeedItems(items);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].id).toBe("1");
  });
});

describe("createCombinedJsonFeed", () => {
  it("should create a combined JSON feed", () => {
    const items: FeedItem[] = [
      {
        id: "1",
        url: "https://example.com/1",
        content_text: "Test",
        date_published: "2026-01-01T00:00:00.000Z",
        tags: ["test"],
      },
    ];

    const feed = createCombinedJsonFeed(items, {
      title: "Test Feed",
      homePageUrl: "https://example.com",
      feedUrl: "https://example.com/feed.json",
    });

    expect(feed.version).toBe("https://jsonfeed.org/version/1.1");
    expect(feed.title).toBe("Test Feed");
    expect(feed.home_page_url).toBe("https://example.com");
    expect(feed.feed_url).toBe("https://example.com/feed.json");
    expect(feed.items).toHaveLength(1);
    expect(feed.items[0].id).toBe("1");
    expect(feed.items[0].tags).toEqual(["test"]);
  });
});

describe("createCombinedRss", () => {
  it("should create a combined RSS feed with category tags", () => {
    const items: FeedItem[] = [
      {
        id: "1",
        url: "https://example.com/1",
        title: "Test Title",
        content_text: "Test Content",
        date_published: "2026-01-01T00:00:00.000Z",
        tags: ["test", "example"],
      },
    ];

    const rss = createCombinedRss(items, {
      title: "Test Feed",
      link: "https://example.com",
      description: "Test Description",
    });

    expect(rss).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(rss).toContain('<rss version="2.0">');
    expect(rss).toContain("<title>Test Feed</title>");
    expect(rss).toContain("<link>https://example.com</link>");
    expect(rss).toContain("<description>Test Description</description>");
    expect(rss).toContain("<title>Test Title</title>");
    expect(rss).toContain("<description>Test Content</description>");
    expect(rss).toContain("<category>test</category>");
    expect(rss).toContain("<category>example</category>");
  });

  it("should escape XML special characters", () => {
    const items: FeedItem[] = [
      {
        id: "1",
        url: "https://example.com/1",
        content_text: "Test & <Content>",
        date_published: "2026-01-01T00:00:00.000Z",
        tags: ["test"],
      },
    ];

    const rss = createCombinedRss(items, {
      title: "Test Feed",
      link: "https://example.com",
      description: "Test Description",
    });

    expect(rss).toContain("Test &amp; &lt;Content&gt;");
  });
});
