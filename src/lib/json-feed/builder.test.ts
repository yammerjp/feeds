import { describe, it, expect } from "vitest";
import { buildJsonFeed, type JsonFeedItem } from "./builder.js";

const sampleItems: JsonFeedItem[] = [
  {
    id: "item-1",
    url: "https://example.com/post/1",
    title: "First Post",
    content_text: "This is the first post content",
    date_published: "2026-01-01T12:00:00.000Z",
  },
  {
    id: "item-2",
    url: "https://example.com/post/2",
    content_text: "Second post without title",
    date_published: "2026-01-02T12:00:00.000Z",
  },
];

describe("buildJsonFeed", () => {
  it("should return valid JSON Feed version", () => {
    const feed = buildJsonFeed(sampleItems, {
      title: "Test Feed",
      homePageUrl: "https://example.com",
      feedUrl: "https://example.com/feed.json",
    });

    const parsed = JSON.parse(feed);
    expect(parsed.version).toBe("https://jsonfeed.org/version/1.1");
  });

  it("should set feed metadata", () => {
    const feed = buildJsonFeed(sampleItems, {
      title: "Test Feed",
      homePageUrl: "https://example.com",
      feedUrl: "https://example.com/feed.json",
    });

    const parsed = JSON.parse(feed);
    expect(parsed.title).toBe("Test Feed");
    expect(parsed.home_page_url).toBe("https://example.com");
    expect(parsed.feed_url).toBe("https://example.com/feed.json");
  });

  it("should include all items", () => {
    const feed = buildJsonFeed(sampleItems, {
      title: "Test Feed",
      homePageUrl: "https://example.com",
      feedUrl: "https://example.com/feed.json",
    });

    const parsed = JSON.parse(feed);
    expect(parsed.items).toHaveLength(2);
  });

  it("should preserve item fields", () => {
    const feed = buildJsonFeed(sampleItems, {
      title: "Test Feed",
      homePageUrl: "https://example.com",
      feedUrl: "https://example.com/feed.json",
    });

    const parsed = JSON.parse(feed);
    expect(parsed.items[0].id).toBe("item-1");
    expect(parsed.items[0].url).toBe("https://example.com/post/1");
    expect(parsed.items[0].title).toBe("First Post");
    expect(parsed.items[0].content_text).toBe("This is the first post content");
    expect(parsed.items[0].date_published).toBe("2026-01-01T12:00:00.000Z");
  });

  it("should handle items without optional fields", () => {
    const feed = buildJsonFeed(sampleItems, {
      title: "Test Feed",
      homePageUrl: "https://example.com",
      feedUrl: "https://example.com/feed.json",
    });

    const parsed = JSON.parse(feed);
    expect(parsed.items[1].title).toBeUndefined();
  });

  it("should produce pretty-printed JSON", () => {
    const feed = buildJsonFeed(sampleItems, {
      title: "Test Feed",
      homePageUrl: "https://example.com",
      feedUrl: "https://example.com/feed.json",
    });

    // Pretty-printed JSON should have newlines
    expect(feed).toContain("\n");
  });
});
