import { JSDOM } from "jsdom";

export interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
}

/**
 * Parse RSS 2.0 or Atom feed XML into normalized RssItem array.
 * Supports both <item> (RSS) and <entry> (Atom) elements.
 */
export function parseRss(xml: string): RssItem[] {
  const dom = new JSDOM(xml, { contentType: "text/xml" });
  const document = dom.window.document;

  const items: RssItem[] = [];

  // RSS 2.0 format (<item>)
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

  // Atom format (<entry>)
  const entryElements = document.querySelectorAll("entry");
  entryElements.forEach((el) => {
    const linkEl = el.querySelector("link[rel='alternate']") || el.querySelector("link");
    const link = linkEl?.getAttribute("href") || el.querySelector("url")?.textContent || "";
    items.push({
      title: el.querySelector("title")?.textContent || "",
      link,
      description: el.querySelector("content")?.textContent || el.querySelector("summary")?.textContent || "",
      pubDate: el.querySelector("published")?.textContent || el.querySelector("updated")?.textContent || "",
      guid: el.querySelector("id")?.textContent || link,
    });
  });

  return items;
}

/**
 * Auto-detect feed format and parse.
 * Alias for parseRss which handles both formats.
 */
export function parseFeed(xml: string): RssItem[] {
  return parseRss(xml);
}

/**
 * Fetch RSS/Atom feed from URL.
 */
export async function fetchFeed(url: string): Promise<string> {
  const res = await fetch(url);
  return res.text();
}
