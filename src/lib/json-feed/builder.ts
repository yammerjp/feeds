export interface JsonFeedItem {
  id: string;
  url: string;
  title?: string;
  content_text?: string;
  content_html?: string;
  date_published?: string;
}

export interface JsonFeed {
  version: string;
  title: string;
  home_page_url: string;
  feed_url: string;
  items: JsonFeedItem[];
}

export interface JsonFeedOptions {
  title: string;
  homePageUrl: string;
  feedUrl: string;
}

/**
 * Build a JSON Feed string from items and options.
 * Returns pretty-printed JSON.
 */
export function buildJsonFeed(items: JsonFeedItem[], options: JsonFeedOptions): string {
  const feed: JsonFeed = {
    version: "https://jsonfeed.org/version/1.1",
    title: options.title,
    home_page_url: options.homePageUrl,
    feed_url: options.feedUrl,
    items: items.map((item) => {
      const result: JsonFeedItem = {
        id: item.id,
        url: item.url,
      };
      if (item.title !== undefined) result.title = item.title;
      if (item.content_text !== undefined) result.content_text = item.content_text;
      if (item.content_html !== undefined) result.content_html = item.content_html;
      if (item.date_published !== undefined) result.date_published = item.date_published;
      return result;
    }),
  };

  return JSON.stringify(feed, null, 2);
}
