import { parseRss } from "../../lib/rss/parser.js";

export interface ScrapboxPage {
  id: string;
  url: string;
  title: string;
  content_text: string;
  date_published: string;
  source: string;
}

function normalizeTitle(title: string): string {
  const trimmed = title.trim();
  const parts = trimmed.split(" - ");

  if (parts.length >= 3 && parts[parts.length - 1] === "Cosense") {
    return parts.slice(0, -2).join(" - ");
  }

  return trimmed;
}

function normalizeDescription(description: string): string {
  return description
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "\n")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function parseScrapboxFeed(xml: string): ScrapboxPage[] {
  const items = parseRss(xml);

  return items.map((item) => ({
    id: item.guid || item.link,
    url: item.link,
    title: normalizeTitle(item.title || item.link),
    content_text: normalizeDescription(item.description || ""),
    date_published: item.pubDate ? new Date(item.pubDate).toISOString() : "",
    source: "scrapbox",
  }));
}

export async function fetchScrapboxFeed(projectName: string): Promise<ScrapboxPage[]> {
  const res = await fetch(`https://scrapbox.io/api/feed/${projectName}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch Scrapbox feed for ${projectName}: ${res.status} ${res.statusText}`);
  }

  return parseScrapboxFeed(await res.text());
}
