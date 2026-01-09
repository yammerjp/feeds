import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchPhotosFeed } from "./photos.js";

describe("fetchPhotosFeed", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch and parse Photos RSS feed", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      text: async () => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Test Photo</title>
      <link>https://toycamera.yammer.jp/photo/123</link>
      <description>Test photo description</description>
      <pubDate>Wed, 01 Jan 2026 12:00:00 +0000</pubDate>
      <guid>https://toycamera.yammer.jp/photo/123</guid>
    </item>
  </channel>
</rss>`,
    });

    const items = await fetchPhotosFeed("https://toycamera.yammer.jp/@yammer/feed.xml");

    expect(items).toHaveLength(1);
    expect(items[0].content_text).toBe("Test photo description");
    expect(items[0].url).toBe("https://toycamera.yammer.jp/photo/123");
    expect(items[0].tags).toEqual(["photos"]);
  });
});
