export interface Photo {
  id: string;
  url: string;
  title: string;
  image_url: string;
  date_published: string;
}

function extractTag(item: string, tagName: string): string {
  const match = item.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)</${tagName}>`, "i"));
  return match?.[1]?.trim() || "";
}

function extractAttribute(item: string, tagName: string, attributeName: string): string {
  const match = item.match(new RegExp(`<${tagName}\\b[^>]*${attributeName}="([^"]*)"`, "i"));
  return match?.[1] || "";
}

/**
 * Parse toycamera RSS feed into Photo array.
 * Extracts image URL from enclosure element.
 */
export function parseToycameraRss(xml: string): Photo[] {
  const items = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];

  return items.map((item) => {
    const title = extractTag(item, "title");
    const link = extractTag(item, "link");
    const guid = extractTag(item, "guid");
    const pubDate = extractTag(item, "pubDate");
    const imageUrl = extractAttribute(item, "enclosure", "url") || link;

    return {
      id: guid || link,
      url: link,
      title,
      image_url: imageUrl,
      date_published: pubDate ? new Date(pubDate).toISOString() : "",
    };
  });
}

/**
 * Fetch toycamera photos.
 */
export async function fetchToycamera(rssUrl: string): Promise<Photo[]> {
  const res = await fetch(rssUrl);
  const xml = await res.text();
  return parseToycameraRss(xml);
}
