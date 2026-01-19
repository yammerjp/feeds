import { parseRss } from "../../lib/rss/parser.js";

export interface BlogPost {
  id: string;
  url: string;
  title: string;
  content_text: string;
  date_published: string;
  source: string;
}

/**
 * Parse blog RSS/Atom feed into BlogPost array.
 */
export function parseBlogFeed(xml: string, source: string): BlogPost[] {
  const items = parseRss(xml);

  return items.map((item) => ({
    id: item.guid || item.link,
    url: item.link,
    title: item.title,
    content_text: item.description,
    date_published: item.pubDate ? new Date(item.pubDate).toISOString() : "",
    source,
  }));
}

/**
 * Fetch blog posts from RSS/Atom URL.
 */
export async function fetchBlogFeed(url: string, source: string): Promise<BlogPost[]> {
  const res = await fetch(url);
  const xml = await res.text();
  return parseBlogFeed(xml, source);
}
