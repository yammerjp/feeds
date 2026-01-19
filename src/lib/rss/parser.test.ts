import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parseRss, parseFeed } from "./parser.js";

const rssSample = readFileSync(
  new URL("./__fixtures__/rss-sample.xml", import.meta.url),
  "utf-8"
);

const atomSample = readFileSync(
  new URL("./__fixtures__/atom-sample.xml", import.meta.url),
  "utf-8"
);

describe("parseRss (RSS 2.0 format)", () => {
  it("should parse RSS items", () => {
    const items = parseRss(rssSample);
    expect(items).toHaveLength(2);
  });

  it("should extract title", () => {
    const items = parseRss(rssSample);
    expect(items[0].title).toBe("First Post");
  });

  it("should extract link", () => {
    const items = parseRss(rssSample);
    expect(items[0].link).toBe("https://example.com/post/1");
  });

  it("should extract description", () => {
    const items = parseRss(rssSample);
    expect(items[0].description).toBe("This is the first post");
  });

  it("should extract pubDate", () => {
    const items = parseRss(rssSample);
    expect(items[0].pubDate).toBe("Sat, 01 Jan 2026 12:00:00 +0000");
  });

  it("should extract guid", () => {
    const items = parseRss(rssSample);
    expect(items[0].guid).toBe("post-1");
  });
});

describe("parseRss (Atom format)", () => {
  it("should parse Atom entries", () => {
    const items = parseRss(atomSample);
    expect(items).toHaveLength(2);
  });

  it("should extract title from Atom entry", () => {
    const items = parseRss(atomSample);
    expect(items[0].title).toBe("First Entry");
  });

  it("should extract link from Atom entry with rel=alternate", () => {
    const items = parseRss(atomSample);
    expect(items[0].link).toBe("https://example.com/entry/1");
  });

  it("should extract content from Atom entry", () => {
    const items = parseRss(atomSample);
    expect(items[0].description).toBe("This is the first entry content");
  });

  it("should fallback to summary if no content", () => {
    const items = parseRss(atomSample);
    expect(items[1].description).toBe("This is the second entry summary");
  });

  it("should extract published date from Atom entry", () => {
    const items = parseRss(atomSample);
    expect(items[0].pubDate).toBe("2026-01-01T12:00:00+09:00");
  });

  it("should extract id from Atom entry", () => {
    const items = parseRss(atomSample);
    expect(items[0].guid).toBe("tag:example.com,2026:entry/1");
  });
});

describe("parseFeed (auto-detect)", () => {
  it("should auto-detect and parse RSS format", () => {
    const items = parseFeed(rssSample);
    expect(items).toHaveLength(2);
    expect(items[0].title).toBe("First Post");
  });

  it("should auto-detect and parse Atom format", () => {
    const items = parseFeed(atomSample);
    expect(items).toHaveLength(2);
    expect(items[0].title).toBe("First Entry");
  });
});
