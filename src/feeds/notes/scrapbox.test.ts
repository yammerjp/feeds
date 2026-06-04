import { describe, expect, it } from "vitest";
import { parseScrapboxFeed } from "./scrapbox.js";

const sampleRss = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title><![CDATA[シニアと一緒に働く機会をとりに行く、技を盗む - /var/log/yammer.log - Cosense]]></title>
      <link>https://scrapbox.io/yammer/%E3%82%B7%E3%83%8B%E3%82%A2%E3%81%A8%E4%B8%80%E7%B7%92%E3%81%AB%E5%83%8D%E3%81%8F%E6%A9%9F%E4%BC%9A%E3%82%92%E3%81%A8%E3%82%8A%E3%81%AB%E8%A1%8C%E3%81%8F%E3%80%81%E6%8A%80%E3%82%92%E7%9B%97%E3%82%80</link>
      <guid isPermaLink="true">https://scrapbox.io/yammer/%E3%82%B7%E3%83%8B%E3%82%A2%E3%81%A8%E4%B8%80%E7%B7%92%E3%81%AB%E5%83%8D%E3%81%8F%E6%A9%9F%E4%BC%9A%E3%82%92%E3%81%A8%E3%82%8A%E3%81%AB%E8%A1%8C%E3%81%8F%E3%80%81%E6%8A%80%E3%82%92%E7%9B%97%E3%82%80</guid>
      <pubDate>Tue, 02 Jun 2026 15:05:38 GMT</pubDate>
      <description><![CDATA[ふとしたタイミングで、<br /><br />自分がジュニアだった時の話。]]></description>
    </item>
  </channel>
</rss>`;

describe("parseScrapboxFeed", () => {
  it("normalizes the page title and strips HTML from the description", () => {
    const items = parseScrapboxFeed(sampleRss);

    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("シニアと一緒に働く機会をとりに行く、技を盗む");
    expect(items[0].url).toMatch(/^https:\/\/scrapbox\.io\/yammer\//);
    expect(items[0].content_text).toContain("ふとしたタイミングで");
    expect(items[0].content_text).not.toContain("<br");
    expect(items[0].date_published).toBe("2026-06-02T15:05:38.000Z");
  });
});
