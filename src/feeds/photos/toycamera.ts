import { JSDOM } from "jsdom";

export interface Photo {
  id: string;
  url: string;
  title: string;
  image_url: string;
  date_published: string;
}

/**
 * Parse toycamera RSS feed into Photo array.
 * Extracts image URL from enclosure element.
 */
export function parseToycameraRss(xml: string): Photo[] {
  const dom = new JSDOM(xml, { contentType: "text/xml" });
  const document = dom.window.document;

  const photos: Photo[] = [];
  const items = document.querySelectorAll("item");

  items.forEach((item) => {
    const title = item.querySelector("title")?.textContent || "";
    const link = item.querySelector("link")?.textContent || "";
    const guid = item.querySelector("guid")?.textContent || "";
    const pubDate = item.querySelector("pubDate")?.textContent || "";
    const enclosure = item.querySelector("enclosure");
    const imageUrl = enclosure?.getAttribute("url") || link;

    photos.push({
      id: guid,
      url: link,
      title,
      image_url: imageUrl,
      date_published: pubDate ? new Date(pubDate).toISOString() : "",
    });
  });

  return photos;
}

/**
 * Fetch toycamera photos.
 */
export async function fetchToycamera(rssUrl: string): Promise<Photo[]> {
  const res = await fetch(rssUrl);
  const xml = await res.text();
  return parseToycameraRss(xml);
}
