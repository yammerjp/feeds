import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parseBlueskyRss, type BlueskyPost } from "./bluesky.js";

const rssSample = readFileSync(
  new URL("./__fixtures__/bluesky-sample.xml", import.meta.url),
  "utf-8"
);

describe("parseBlueskyRss", () => {
  it("should parse Bluesky RSS items", () => {
    const posts = parseBlueskyRss(rssSample);
    expect(posts.length).toBeGreaterThan(0);
  });

  it("should extract post URL", () => {
    const posts = parseBlueskyRss(rssSample);
    expect(posts[0].url).toMatch(/^https:\/\/bsky\.app\/profile\//);
  });

  it("should extract description as text", () => {
    const posts = parseBlueskyRss(rssSample);
    const withText = posts.find((p) => p.text);
    expect(withText?.text).toBeTruthy();
  });

  it("should extract pubDate and convert to ISO", () => {
    const posts = parseBlueskyRss(rssSample);
    expect(posts[0].date_published).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("should extract guid as id", () => {
    const posts = parseBlueskyRss(rssSample);
    expect(posts[0].id).toMatch(/^at:\/\//);
  });
});
