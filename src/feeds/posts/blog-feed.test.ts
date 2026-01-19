import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parseBlogFeed, type BlogPost } from "./blog-feed.js";

const memoSample = readFileSync(
  new URL("./__fixtures__/memo-sample.xml", import.meta.url),
  "utf-8"
);

const hatenaSample = readFileSync(
  new URL("./__fixtures__/hatena-sample.xml", import.meta.url),
  "utf-8"
);

describe("parseBlogFeed (RSS format - memo)", () => {
  it("should parse RSS blog posts", () => {
    const posts = parseBlogFeed(memoSample, "memo");
    expect(posts.length).toBeGreaterThan(0);
  });

  it("should extract title", () => {
    const posts = parseBlogFeed(memoSample, "memo");
    expect(posts[0].title).toBeTruthy();
  });

  it("should extract URL", () => {
    const posts = parseBlogFeed(memoSample, "memo");
    expect(posts[0].url).toMatch(/^https:\/\//);
  });

  it("should extract description as content", () => {
    const posts = parseBlogFeed(memoSample, "memo");
    expect(posts[0].content_text).toBeTruthy();
  });

  it("should set source", () => {
    const posts = parseBlogFeed(memoSample, "memo");
    expect(posts[0].source).toBe("memo");
  });

  it("should extract date and convert to ISO", () => {
    const posts = parseBlogFeed(memoSample, "memo");
    expect(posts[0].date_published).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe("parseBlogFeed (Atom format - hatena)", () => {
  it("should parse Atom blog posts", () => {
    const posts = parseBlogFeed(hatenaSample, "hatena");
    expect(posts.length).toBeGreaterThan(0);
  });

  it("should extract title from Atom entry", () => {
    const posts = parseBlogFeed(hatenaSample, "hatena");
    expect(posts[0].title).toBeTruthy();
  });

  it("should extract URL from Atom entry", () => {
    const posts = parseBlogFeed(hatenaSample, "hatena");
    expect(posts[0].url).toMatch(/^https:\/\//);
  });

  it("should set source for Atom feed", () => {
    const posts = parseBlogFeed(hatenaSample, "hatena");
    expect(posts[0].source).toBe("hatena");
  });
});
