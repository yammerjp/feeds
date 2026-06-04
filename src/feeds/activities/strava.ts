import { parseRss } from "../../lib/rss/parser.js";

export interface StravaActivity {
  id: string;
  url: string;
  title: string;
  content_text: string;
  date_published: string;
  source: string;
}

function parseOffsetMinutes(value: string): number {
  if (value === "GMT" || value === "UT" || value === "Z") {
    return 0;
  }

  const match = value.match(/^([+-])(\d{2})(\d{2})$/);
  if (!match) {
    return 0;
  }

  const sign = match[1] === "+" ? 1 : -1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

function formatIsoWithOffset(date: Date, offsetMinutes: number): string {
  const shifted = new Date(date.getTime() + offsetMinutes * 60 * 1000);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  const hours = String(shifted.getUTCHours()).padStart(2, "0");
  const minutes = String(shifted.getUTCMinutes()).padStart(2, "0");
  const seconds = String(shifted.getUTCSeconds()).padStart(2, "0");
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absMinutes = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absMinutes / 60)).padStart(2, "0");
  const offsetRemainder = String(absMinutes % 60).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetRemainder}`;
}

export function parseStravaFeed(xml: string): StravaActivity[] {
  const items = parseRss(xml);

  return items.map((item) => ({
    id: item.guid || item.link,
    url: item.link,
    title: item.title || item.link,
    content_text: item.description || "",
    date_published: (() => {
      if (!item.pubDate) {
        return "";
      }

      const match = item.pubDate.match(/\s(GMT|UT|Z|[+-]\d{4})$/);
      const offset = match ? parseOffsetMinutes(match[1]) : 0;
      return formatIsoWithOffset(new Date(item.pubDate), offset);
    })(),
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
