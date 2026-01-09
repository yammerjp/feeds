import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchMemosFeed } from "./memos.js";

describe("fetchMemosFeed", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch and parse Memos RSS feed", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      text: async () => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Test Memo</title>
      <link>https://usememos.yammer.jp/m/123</link>
      <description>Test memo content</description>
      <pubDate>Wed, 01 Jan 2026 12:00:00 +0000</pubDate>
      <guid>https://usememos.yammer.jp/m/123</guid>
    </item>
  </channel>
</rss>`,
    });

    const items = await fetchMemosFeed("https://usememos.yammer.jp/u/yammer/rss.xml");

    expect(items).toHaveLength(1);
    expect(items[0].content_text).toBe("Test memo content");
    expect(items[0].url).toBe("https://usememos.yammer.jp/m/123");
    expect(items[0].tags).toEqual(["memos"]);
  });
});
