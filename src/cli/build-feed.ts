import { writeFileSync, mkdirSync } from "node:fs";
import { fetchTwilog, parseTwilogDateTime, type Tweet } from "../feeds/microblog/twilog.js";
import { fetchBluesky, type BlueskyPost } from "../feeds/microblog/bluesky.js";
import { fetchMemos, type Memo } from "../feeds/microblog/memos.js";
import { fetchToycamera, type Photo } from "../feeds/photos/toycamera.js";
import { fetchBlogFeed, type BlogPost } from "../feeds/posts/blog-feed.js";
import { fetchPodcast, type PodcastEpisode } from "../feeds/podcast/listen-style.js";
import { staticEpisodes } from "../feeds/podcast/static-episodes.js";
import { buildJsonFeed, type JsonFeedItem } from "../lib/json-feed/builder.js";

// Configuration
const CONFIG = {
  twilogUsername: "yammerjp",
  blueskyHandle: "yammer.jp",
  memosRssUrl: "https://usememos.yammer.jp/u/yammer/rss.xml",
  photosRssUrl: "https://toycamera.yammer.jp/@yammer/feed.xml",
  podcastRssUrl: "https://listen.style/p/yammer/rss",
  blogFeeds: [
    { name: "memo", url: "https://memo.yammer.jp/posts/index.xml", title: "memo.yammer.jp" },
    { name: "hatena", url: "https://basd4g.hatenablog.com/feed", title: "はてなブログ" },
    { name: "awkblog", url: "https://awkblog.net/@yammerjp/rss.xml", title: "awkblog.net" },
    { name: "qiita", url: "https://qiita.com/yammerjp/feed", title: "Qiita" },
    { name: "zenn", url: "https://zenn.dev/basd4g/feed?include_scraps=1", title: "Zenn" },
  ],
  baseUrl: "https://yammerjp.github.io/feeds",
};

interface FeedItem extends JsonFeedItem {
  source: string;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function guessYear(month: number, day: number): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  if (month > currentMonth || (month === currentMonth && day > currentDay)) {
    return currentYear - 1;
  }
  return currentYear;
}

function buildRss(items: FeedItem[], options: { title: string; link: string; description: string }): string {
  const rssItems = items
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title || item.content_text?.slice(0, 100) || "")}</title>
      <link>${escapeXml(item.url)}</link>
      <description>${escapeXml(item.content_text || "")}</description>
      <guid>${escapeXml(item.id)}</guid>
      <pubDate>${item.date_published ? new Date(item.date_published).toUTCString() : ""}</pubDate>
      <source>${escapeXml(item.source)}</source>
    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(options.title)}</title>
    <link>${escapeXml(options.link)}</link>
    <description>${escapeXml(options.description)}</description>
${rssItems}
  </channel>
</rss>`;
}

async function main() {
  const microblogDir = "docs/microblog";
  const photosDir = "docs/photos";
  const postsDir = "docs/posts";
  const podcastDir = "docs/podcast";

  mkdirSync(microblogDir, { recursive: true });
  mkdirSync(photosDir, { recursive: true });
  mkdirSync(postsDir, { recursive: true });
  mkdirSync(podcastDir, { recursive: true });

  const allMicroblogItems: FeedItem[] = [];

  // 1. Twilog (tweets)
  console.log(`Fetching tweets from Twilog...`);
  const tweets = await fetchTwilog(CONFIG.twilogUsername);
  console.log(`  Fetched ${tweets.length} tweets`);

  const tweetItems: FeedItem[] = tweets.map((tweet) => {
    const dateMatch = tweet.date.match(/(\d+)月(\d+)日/);
    let datePublished: string | undefined;
    if (dateMatch) {
      const month = parseInt(dateMatch[1], 10);
      const day = parseInt(dateMatch[2], 10);
      const year = guessYear(month, day);
      datePublished = parseTwilogDateTime(tweet.date, tweet.time, year);
    }
    return {
      id: tweet.id || tweet.url || tweet.text.slice(0, 50),
      url: tweet.url || `https://twilog.togetter.com/${CONFIG.twilogUsername}`,
      content_text: tweet.text,
      date_published: datePublished,
      source: "twitter",
    };
  });
  allMicroblogItems.push(...tweetItems);

  // 2. Bluesky
  console.log(`Fetching Bluesky posts...`);
  const blueskyPosts = await fetchBluesky(CONFIG.blueskyHandle);
  console.log(`  Fetched ${blueskyPosts.length} posts`);

  const blueskyItems: FeedItem[] = blueskyPosts.map((post) => ({
    id: post.id,
    url: post.url,
    content_text: post.text,
    date_published: post.date_published,
    source: "bluesky",
  }));
  allMicroblogItems.push(...blueskyItems);

  // 3. Memos
  console.log(`Fetching Memos...`);
  const memos = await fetchMemos(CONFIG.memosRssUrl);
  console.log(`  Fetched ${memos.length} memos`);

  const memosItems: FeedItem[] = memos.map((memo) => ({
    id: memo.id,
    url: memo.url,
    content_text: memo.text,
    date_published: memo.date_published,
    source: "memos",
  }));
  allMicroblogItems.push(...memosItems);

  // Save microblog feeds
  const sortedMicroblog = allMicroblogItems
    .filter((item) => item.date_published)
    .sort((a, b) => new Date(b.date_published!).getTime() - new Date(a.date_published!).getTime());

  writeFileSync(
    `${microblogDir}/all.json`,
    buildJsonFeed(sortedMicroblog, {
      title: "yammer's microblog",
      homePageUrl: "https://yammer.jp",
      feedUrl: `${CONFIG.baseUrl}/microblog/all.json`,
    })
  );
  writeFileSync(
    `${microblogDir}/all.xml`,
    buildRss(sortedMicroblog, {
      title: "yammer's microblog",
      link: "https://yammer.jp",
      description: "Combined feed from Twitter, Bluesky, and Memos",
    })
  );
  console.log(`Saved microblog feeds (${sortedMicroblog.length} items)`);

  // 4. Photos
  console.log(`Fetching Photos...`);
  const photos = await fetchToycamera(CONFIG.photosRssUrl);
  console.log(`  Fetched ${photos.length} photos`);

  const photoItems: JsonFeedItem[] = photos.map((photo) => ({
    id: photo.id,
    url: photo.url,
    title: photo.title,
    content_html: `<img src="${photo.image_url}" alt="${photo.title}" />`,
    date_published: photo.date_published,
  }));

  writeFileSync(
    `${photosDir}/feed.json`,
    buildJsonFeed(photoItems, {
      title: "yammer's photos",
      homePageUrl: "https://toycamera.yammer.jp/@yammer",
      feedUrl: `${CONFIG.baseUrl}/photos/feed.json`,
    })
  );
  console.log(`Saved photos feed`);

  // 5. Blog posts
  console.log(`Fetching Blog feeds...`);
  const allBlogItems: FeedItem[] = [];

  for (const feed of CONFIG.blogFeeds) {
    try {
      console.log(`  Fetching ${feed.name}...`);
      const posts = await fetchBlogFeed(feed.url, feed.name);
      console.log(`    Fetched ${posts.length} posts`);

      const postItems: FeedItem[] = posts.map((post) => ({
        id: post.id,
        url: post.url,
        title: post.title,
        content_text: post.content_text,
        date_published: post.date_published,
        source: post.source,
      }));
      allBlogItems.push(...postItems);
    } catch (err) {
      console.error(`  Failed to fetch ${feed.name}:`, err);
    }
  }

  const sortedPosts = allBlogItems
    .filter((item) => item.date_published)
    .sort((a, b) => new Date(b.date_published!).getTime() - new Date(a.date_published!).getTime());

  writeFileSync(
    `${postsDir}/all.json`,
    buildJsonFeed(sortedPosts, {
      title: "yammer's blog posts",
      homePageUrl: "https://yammer.jp",
      feedUrl: `${CONFIG.baseUrl}/posts/all.json`,
    })
  );
  writeFileSync(
    `${postsDir}/all.xml`,
    buildRss(sortedPosts, {
      title: "yammer's blog posts",
      link: "https://yammer.jp",
      description: "Keisuke Nakayama RSS Feed",
    })
  );
  console.log(`Saved blog feeds (${sortedPosts.length} items)`);

  // 6. Podcast
  console.log(`Fetching Podcast...`);
  const episodes = await fetchPodcast(CONFIG.podcastRssUrl);
  console.log(`  Fetched ${episodes.length} episodes`);
  console.log(`  Adding ${staticEpisodes.length} static episodes`);

  const allEpisodes = [...episodes, ...staticEpisodes]
    .sort((a, b) => new Date(b.date_published).getTime() - new Date(a.date_published).getTime());

  const podcastItems: JsonFeedItem[] = allEpisodes.map((ep) => ({
    id: ep.id,
    url: ep.url,
    title: ep.title,
    content_text: ep.content_text,
    date_published: ep.date_published,
  }));

  writeFileSync(
    `${podcastDir}/feed.json`,
    buildJsonFeed(podcastItems, {
      title: "yammerの日記 (podcast)",
      homePageUrl: "https://listen.style/p/yammer",
      feedUrl: `${CONFIG.baseUrl}/podcast/feed.json`,
    })
  );

  const podcastRssItems = podcastItems
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title || "")}</title>
      <link>${escapeXml(item.url)}</link>
      <description>${escapeXml(item.content_text || "")}</description>
      <guid>${escapeXml(item.id)}</guid>
      <pubDate>${item.date_published ? new Date(item.date_published).toUTCString() : ""}</pubDate>
    </item>`
    )
    .join("\n");

  const podcastRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>yammerの日記 (podcast)</title>
    <link>https://listen.style/p/yammer</link>
    <description>awkや日常のことを話します</description>
${podcastRssItems}
  </channel>
</rss>`;
  writeFileSync(`${podcastDir}/feed.xml`, podcastRss);
  console.log(`Saved podcast feed (${podcastItems.length} episodes)`);

  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
