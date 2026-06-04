import { describe, expect, it } from "vitest";
import { parseStravaFeed } from "./strava.js";

const sampleRss = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>nido→多摩サイ→等々力渓谷→環七</title>
      <link>https://strava.com/activities/18728792651</link>
      <description>Ride: Distance: 57.9km, Elevation Gain: 206m, Moving Time: 03:53:35, Average Speed: 14.9km/h</description>
      <guid isPermaLink="true">https://strava.com/activities/18728792651</guid>
      <pubDate>Sun, 31 May 2026 12:03:52 +0900</pubDate>
    </item>
  </channel>
</rss>`;

describe("parseStravaFeed", () => {
  it("parses the feedmyride RSS format", () => {
    const items = parseStravaFeed(sampleRss);

    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("nido→多摩サイ→等々力渓谷→環七");
    expect(items[0].url).toBe("https://strava.com/activities/18728792651");
    expect(items[0].content_text).toContain("Ride: Distance: 57.9km");
    expect(items[0].date_published).toBe("2026-05-31T12:03:52+09:00");
    expect(items[0].source).toBe("strava");
  });
});
