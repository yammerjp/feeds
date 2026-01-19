import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parsePodcastRss, type PodcastEpisode } from "./listen-style.js";

const rssSample = readFileSync(
  new URL("./__fixtures__/listen-style-sample.xml", import.meta.url),
  "utf-8"
);

describe("parsePodcastRss", () => {
  it("should parse podcast RSS items", () => {
    const episodes = parsePodcastRss(rssSample);
    expect(episodes.length).toBeGreaterThan(0);
  });

  it("should extract episode title", () => {
    const episodes = parsePodcastRss(rssSample);
    expect(episodes[0].title).toBeTruthy();
  });

  it("should extract episode URL", () => {
    const episodes = parsePodcastRss(rssSample);
    expect(episodes[0].url).toMatch(/^https:\/\//);
  });

  it("should extract description", () => {
    const episodes = parsePodcastRss(rssSample);
    expect(episodes[0].content_text).toBeTruthy();
  });

  it("should extract audio URL from enclosure", () => {
    const episodes = parsePodcastRss(rssSample);
    expect(episodes[0].audio_url).toMatch(/\.mp3$/);
  });

  it("should extract pubDate and convert to ISO", () => {
    const episodes = parsePodcastRss(rssSample);
    expect(episodes[0].date_published).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("should extract guid as id", () => {
    const episodes = parsePodcastRss(rssSample);
    expect(episodes[0].id).toBeTruthy();
  });
});
