import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parseMemosRss, type Memo } from "./memos.js";

const rssSample = readFileSync(
  new URL("./__fixtures__/memos-sample.xml", import.meta.url),
  "utf-8"
);

describe("parseMemosRss", () => {
  it("should parse Memos RSS items", () => {
    const memos = parseMemosRss(rssSample);
    expect(memos.length).toBeGreaterThan(0);
  });

  it("should extract memo URL", () => {
    const memos = parseMemosRss(rssSample);
    expect(memos[0].url).toMatch(/^https:\/\/usememos\.yammer\.jp\/m\//);
  });

  it("should extract description as text", () => {
    const memos = parseMemosRss(rssSample);
    expect(memos[0].text).toBeTruthy();
  });

  it("should strip HTML tags from description", () => {
    const memos = parseMemosRss(rssSample);
    expect(memos[0].text).not.toContain("<p>");
    expect(memos[0].text).not.toContain("</p>");
  });

  it("should extract pubDate and convert to ISO", () => {
    const memos = parseMemosRss(rssSample);
    expect(memos[0].date_published).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("should use link as id", () => {
    const memos = parseMemosRss(rssSample);
    expect(memos[0].id).toBe(memos[0].url);
  });
});
