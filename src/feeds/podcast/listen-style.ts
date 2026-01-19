import { JSDOM } from "jsdom";

export interface PodcastEpisode {
  id: string;
  url: string;
  title: string;
  content_text: string;
  audio_url: string;
  date_published: string;
}

/**
 * Strip HTML tags and decode entities.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

/**
 * Parse podcast RSS feed into PodcastEpisode array.
 * Handles iTunes podcast extensions and enclosure elements.
 */
export function parsePodcastRss(xml: string): PodcastEpisode[] {
  const dom = new JSDOM(xml, { contentType: "text/xml" });
  const document = dom.window.document;

  const episodes: PodcastEpisode[] = [];
  const items = document.querySelectorAll("item");

  items.forEach((item) => {
    const title = item.querySelector("title")?.textContent || "";
    const link = item.querySelector("link")?.textContent || "";
    const guid = item.querySelector("guid")?.textContent || "";
    const pubDate = item.querySelector("pubDate")?.textContent || "";
    const description = item.querySelector("description")?.textContent || "";
    const enclosure = item.querySelector("enclosure");
    const audioUrl = enclosure?.getAttribute("url") || "";

    episodes.push({
      id: guid,
      url: link,
      title: stripHtml(title),
      content_text: stripHtml(description),
      audio_url: audioUrl,
      date_published: pubDate ? new Date(pubDate).toISOString() : "",
    });
  });

  return episodes;
}

/**
 * Fetch podcast episodes.
 */
export async function fetchPodcast(rssUrl: string): Promise<PodcastEpisode[]> {
  const res = await fetch(rssUrl);
  const xml = await res.text();
  return parsePodcastRss(xml);
}
