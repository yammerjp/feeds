import { parseRss } from "../../lib/rss/parser.js";

export interface StravaActivity {
  id: string;
  url: string;
  title: string;
  content_text: string;
  date_published: string;
  source: string;
}

export function parseStravaFeed(xml: string): StravaActivity[] {
  const items = parseRss(xml);

  return items.map((item) => ({
    id: item.guid || item.link,
    url: item.link,
    title: item.title || item.link,
    content_text: item.description || "",
    date_published: item.pubDate ? new Date(item.pubDate).toISOString() : "",
    source: "strava",
  }));
}

export async function fetchStravaFeed(rssUrl: string): Promise<StravaActivity[]> {
  const res = await fetch(rssUrl);

  if (!res.ok) {
    throw new Error(`Failed to fetch Strava feed: ${res.status} ${res.statusText}`);
  }

  return parseStravaFeed(await res.text());
}
