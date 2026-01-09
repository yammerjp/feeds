export interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
}

export interface JsonFeedItem {
  id: string;
  url: string;
  title?: string;
  content_text: string;
  date_published?: string;
  tags?: string[];
}

export interface JsonFeed {
  version: string;
  title: string;
  home_page_url: string;
  feed_url: string;
  items: JsonFeedItem[];
}

export interface FeedItem extends JsonFeedItem {
  tags: string[];
}
