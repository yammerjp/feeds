import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parseTwilogHtml, parseTwilogDateTime, twilogToFeedItems } from "./twilog.js";
import type { Tweet } from "./twilog.js";

const html = readFileSync("src/sources/__fixtures__/twilog-yammerjp.html", "utf-8");

describe("parseTwilogHtml", () => {
  it("should parse tweets from HTML", () => {
    const tweets = parseTwilogHtml(html);
    expect(tweets.length).toBeGreaterThan(0);
  });

  it("should extract tweet text", () => {
    const tweets = parseTwilogHtml(html);
    const first = tweets[0];
    expect(first.text).toBeTruthy();
    expect(first.text.length).toBeGreaterThan(0);
  });

  it("should extract date and time", () => {
    const tweets = parseTwilogHtml(html);
    const first = tweets[0];
    expect(first.date).toMatch(/\d+月\d+日/);
    expect(first.time).toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  it("should extract tweet URL", () => {
    const tweets = parseTwilogHtml(html);
    const withUrl = tweets.find((t) => t.url);
    expect(withUrl?.url).toMatch(/x\.com.*\/status\//);
  });

  it("should remove duplicates", () => {
    const tweets = parseTwilogHtml(html);
    const texts = tweets.map((t) => t.text);
    const unique = new Set(texts);
    expect(texts.length).toBe(unique.size);
  });

  it("should not start with username header", () => {
    const tweets = parseTwilogHtml(html);
    for (const tweet of tweets) {
      // ツイート本文がユーザー名ヘッダーで始まっていないことを確認
      expect(tweet.text).not.toMatch(/^やんまー.*@yammerjp/);
    }
  });
});

describe("parseTwilogDateTime", () => {
  it("should parse date and time to ISO string", () => {
    const result = parseTwilogDateTime("1月1日", "00:15:25", 2026);
    expect(result).toBe("2026-01-01T00:15:25+09:00");
  });

  it("should handle double digit month and day", () => {
    const result = parseTwilogDateTime("10月26日", "20:52:38", 2025);
    expect(result).toBe("2025-10-26T20:52:38+09:00");
  });

  it("should return undefined for invalid input", () => {
    const result = parseTwilogDateTime("", "", 2025);
    expect(result).toBeUndefined();
  });
});

describe("twilogToFeedItems", () => {
  it("should convert tweets to FeedItems", () => {
    const tweets: Tweet[] = [
      {
        id: "123",
        text: "Test tweet",
        date: "1月1日",
        time: "00:15:25",
        url: "https://x.com/user/status/123",
      },
    ];

    const items = twilogToFeedItems(tweets, "testuser");
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe("123");
    expect(items[0].content_text).toBe("Test tweet");
    expect(items[0].url).toBe("https://x.com/user/status/123");
    expect(items[0].tags).toEqual(["twitter"]);
    expect(items[0].date_published).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/);
  });

  it("should use default URL when tweet URL is empty", () => {
    const tweets: Tweet[] = [
      {
        id: "123",
        text: "Test tweet",
        date: "1月1日",
        time: "00:15:25",
        url: "",
      },
    ];

    const items = twilogToFeedItems(tweets, "testuser");
    expect(items[0].url).toBe("https://twilog.togetter.com/testuser");
  });

  it("should handle undefined date_published", () => {
    const tweets: Tweet[] = [
      {
        id: "123",
        text: "Test tweet",
        date: "",
        time: "",
        url: "https://x.com/user/status/123",
      },
    ];

    const items = twilogToFeedItems(tweets, "testuser");
    expect(items[0].date_published).toBeUndefined();
  });
});
