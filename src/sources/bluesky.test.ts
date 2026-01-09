import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveBlueskyHandle, fetchBlueskyFeed } from "./bluesky.js";

describe("resolveBlueskyHandle", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should resolve a Bluesky handle to DID", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ did: "did:plc:test123" }),
    });

    const did = await resolveBlueskyHandle("example.bsky.social");
    expect(did).toBe("did:plc:test123");
  });

  it("should call the correct API endpoint", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: async () => ({ did: "did:plc:test123" }),
    });
    global.fetch = mockFetch;

    await resolveBlueskyHandle("example.bsky.social");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=example.bsky.social"
    );
  });
});

describe("fetchBlueskyFeed", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch and parse Bluesky RSS feed", async () => {
    // Mock resolveBlueskyHandle
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        json: async () => ({ did: "did:plc:test123" }),
      })
      .mockResolvedValueOnce({
        text: async () => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Test Post</title>
      <link>https://bsky.app/profile/test/post/123</link>
      <description>Test content</description>
      <pubDate>Wed, 01 Jan 2026 12:00:00 +0000</pubDate>
      <guid>https://bsky.app/profile/test/post/123</guid>
    </item>
  </channel>
</rss>`,
      });

    const items = await fetchBlueskyFeed("example.bsky.social");

    expect(items).toHaveLength(1);
    expect(items[0].content_text).toBe("Test content");
    expect(items[0].url).toBe("https://bsky.app/profile/test/post/123");
    expect(items[0].tags).toEqual(["bluesky"]);
  });
});
