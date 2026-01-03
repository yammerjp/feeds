import { JSDOM } from "jsdom";

interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
}

interface JsonFeedItem {
  id: string;
  url: string;
  title?: string;
  content_text: string;
  date_published?: string;
}

interface JsonFeed {
  version: string;
  title: string;
  home_page_url: string;
  feed_url: string;
  items: JsonFeedItem[];
}

export function parseRss(xml: string): RssItem[] {
  const dom = new JSDOM(xml, { contentType: "text/xml" });
  const document = dom.window.document;

  const items: RssItem[] = [];
  const itemElements = document.querySelectorAll("item");

  itemElements.forEach((el) => {
    items.push({
      title: el.querySelector("title")?.textContent || "",
      link: el.querySelector("link")?.textContent || "",
      description: el.querySelector("description")?.textContent || "",
      pubDate: el.querySelector("pubDate")?.textContent || "",
      guid: el.querySelector("guid")?.textContent || "",
    });
  });

  return items;
}

export function rssToJsonFeed(
  xml: string,
  options: { title: string; homePageUrl: string; feedUrl: string }
): JsonFeed {
  const items = parseRss(xml);

  return {
    version: "https://jsonfeed.org/version/1.1",
    title: options.title,
    home_page_url: options.homePageUrl,
    feed_url: options.feedUrl,
    items: items.map((item) => ({
      id: item.guid || item.link,
      url: item.link,
      title: item.title || undefined,
      content_text: item.description,
      date_published: item.pubDate ? new Date(item.pubDate).toISOString() : undefined,
    })),
  };
}

export async function fetchRss(url: string): Promise<string> {
  const res = await fetch(url);
  return res.text();
}
