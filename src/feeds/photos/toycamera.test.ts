import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parseToycameraRss, type Photo } from "./toycamera.js";

const rssSample = readFileSync(
  new URL("./__fixtures__/toycamera-sample.xml", import.meta.url),
  "utf-8"
);

describe("parseToycameraRss", () => {
  it("should parse toycamera RSS items", () => {
    const photos = parseToycameraRss(rssSample);
    expect(photos.length).toBeGreaterThan(0);
  });

  it("should extract photo title", () => {
    const photos = parseToycameraRss(rssSample);
    expect(photos[0].title).toBeTruthy();
  });

  it("should extract image URL from enclosure", () => {
    const photos = parseToycameraRss(rssSample);
    expect(photos[0].image_url).toMatch(/\.(jpg|jpeg|png|gif)$/i);
  });

  it("should extract guid as id", () => {
    const photos = parseToycameraRss(rssSample);
    expect(photos[0].id).toBeTruthy();
  });

  it("should extract pubDate and convert to ISO", () => {
    const photos = parseToycameraRss(rssSample);
    expect(photos[0].date_published).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("should extract page URL from link", () => {
    const photos = parseToycameraRss(rssSample);
    expect(photos[0].url).toMatch(/^https:\/\//);
  });
});
