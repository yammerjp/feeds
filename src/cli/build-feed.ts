import { writeFileSync, mkdirSync } from "node:fs";
import { fetchTwilog, parseTwilogDateTime } from "../microblog/twilog.js";
import { toJsonFeed, toRss } from "../microblog/feed.js";
import { fetchRss, rssToJsonFeed } from "../microblog/rss.js";

const BLUESKY_HANDLE = "yammer.jp";
const MEMOS_RSS_URL = "https://usememos.yammer.jp/u/yammer/rss.xml";
const PHOTOS_RSS_URL = "https://toycamera.yammer.jp/@yammer/feed.xml";
const BASE_URL = "https://yammerjp.github.io/feed";

interface FeedItem {
  id: string;
  url: string;
  title?: string;
  content_text: string;
  date_published?: string;
  source: string;
}

async function getBlueskyDid(handle: string): Promise<string> {
  const res = await fetch(
    `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`
  );
  const data = await res.json();
  return data.did;
}

function guessYear(month: number, day: number): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  // 未来の日付なら前年
  if (month > currentMonth || (month === currentMonth && day > currentDay)) {
    return currentYear - 1;
  }
  return currentYear;
}

async function main() {
  const username = process.argv[2] || "yammerjp";
  const outDir = process.argv[3] || "docs/microblog";

  mkdirSync(outDir, { recursive: true });

  const allItems: FeedItem[] = [];

  // 1. Twilog (tweets)
  console.log(`Fetching tweets from Twilog for @${username}...`);
  const tweets = await fetchTwilog(username);
  console.log(`Fetched ${tweets.length} tweets`);

  const tweetsJsonFeed = toJsonFeed(tweets, {
    title: `@${username} tweets`,
    homePageUrl: `https://twilog.togetter.com/${username}`,
    feedUrl: `${BASE_URL}/microblog/tweets.json`,
  });
  writeFileSync(`${outDir}/tweets.json`, JSON.stringify(tweetsJsonFeed, null, 2));

  const tweetsRss = toRss(tweets, {
    title: `@${username} tweets`,
    link: `https://twilog.togetter.com/${username}`,
    description: `Tweets from @${username} via Twilog`,
  });
  writeFileSync(`${outDir}/tweets.xml`, tweetsRss);
  console.log(`Saved tweets to ${outDir}/tweets.json and ${outDir}/tweets.xml`);

  // tweetsをallItemsに追加（日時パース）
  for (const tweet of tweets) {
    const dateMatch = tweet.date.match(/(\d+)月(\d+)日/);
    let datePublished: string | undefined;
    if (dateMatch) {
      const month = parseInt(dateMatch[1], 10);
      const day = parseInt(dateMatch[2], 10);
      const year = guessYear(month, day);
      datePublished = parseTwilogDateTime(tweet.date, tweet.time, year);
    }

    allItems.push({
      id: tweet.id || tweet.url || tweet.text.slice(0, 50),
      url: tweet.url || `https://twilog.togetter.com/${username}`,
      content_text: tweet.text,
      date_published: datePublished,
      source: "twitter",
    });
  }

  // 2. Bluesky
  console.log(`Fetching Bluesky posts for @${BLUESKY_HANDLE}...`);
  const did = await getBlueskyDid(BLUESKY_HANDLE);
  const blueskyRssUrl = `https://bsky.app/profile/${did}/rss`;
  const blueskyRssXml = await fetchRss(blueskyRssUrl);
  writeFileSync(`${outDir}/bluesky.xml`, blueskyRssXml);

  const blueskyJsonFeed = rssToJsonFeed(blueskyRssXml, {
    title: `@${BLUESKY_HANDLE} on Bluesky`,
    homePageUrl: `https://bsky.app/profile/${BLUESKY_HANDLE}`,
    feedUrl: `${BASE_URL}/microblog/bluesky.json`,
  });
  writeFileSync(`${outDir}/bluesky.json`, JSON.stringify(blueskyJsonFeed, null, 2));
  console.log(`Saved Bluesky to ${outDir}/bluesky.json and ${outDir}/bluesky.xml`);

  for (const item of blueskyJsonFeed.items) {
    allItems.push({ ...item, source: "bluesky" });
  }

  // 3. Memos
  console.log(`Fetching Memos RSS...`);
  const memosRssXml = await fetchRss(MEMOS_RSS_URL);
  writeFileSync(`${outDir}/memos.xml`, memosRssXml);

  const memosJsonFeed = rssToJsonFeed(memosRssXml, {
    title: "yammer's memos",
    homePageUrl: "https://usememos.yammer.jp/u/yammer",
    feedUrl: `${BASE_URL}/microblog/memos.json`,
  });
  writeFileSync(`${outDir}/memos.json`, JSON.stringify(memosJsonFeed, null, 2));
  console.log(`Saved Memos to ${outDir}/memos.json and ${outDir}/memos.xml`);

  for (const item of memosJsonFeed.items) {
    allItems.push({ ...item, source: "memos" });
  }

  // 4. Photos (toycamera)
  console.log(`Fetching Photos RSS...`);
  const photosOutDir = "docs/photos";
  mkdirSync(photosOutDir, { recursive: true });

  const photosRssXml = await fetchRss(PHOTOS_RSS_URL);
  writeFileSync(`${photosOutDir}/feed.xml`, photosRssXml);

  const photosJsonFeed = rssToJsonFeed(photosRssXml, {
    title: "yammer's photos",
    homePageUrl: "https://toycamera.yammer.jp/@yammer",
    feedUrl: `${BASE_URL}/photos/feed.json`,
  });
  writeFileSync(`${photosOutDir}/feed.json`, JSON.stringify(photosJsonFeed, null, 2));
  console.log(`Saved Photos to ${photosOutDir}/feed.json and ${photosOutDir}/feed.xml`);

  // 5. 統合フィード（時系列ソート）
  console.log("Building combined feed...");
  const sortedItems = allItems
    .filter((item) => item.date_published)
    .sort((a, b) => {
      const dateA = new Date(a.date_published!).getTime();
      const dateB = new Date(b.date_published!).getTime();
      return dateB - dateA; // 新しい順
    });

  const combinedJsonFeed = {
    version: "https://jsonfeed.org/version/1.1",
    title: "yammer's microblog",
    home_page_url: "https://yammer.jp",
    feed_url: `${BASE_URL}/microblog/all.json`,
    items: sortedItems,
  };
  writeFileSync(`${outDir}/all.json`, JSON.stringify(combinedJsonFeed, null, 2));

  // 統合RSS
  const combinedRssItems = sortedItems
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title || item.content_text.slice(0, 100))}</title>
      <link>${escapeXml(item.url)}</link>
      <description>${escapeXml(item.content_text)}</description>
      <guid>${escapeXml(item.id)}</guid>
      <pubDate>${item.date_published ? new Date(item.date_published).toUTCString() : ""}</pubDate>
      <source>${escapeXml(item.source)}</source>
    </item>`
    )
    .join("\n");

  const combinedRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>yammer's microblog</title>
    <link>https://yammer.jp</link>
    <description>Combined feed from Twitter, Bluesky, and Memos</description>
${combinedRssItems}
  </channel>
</rss>`;
  writeFileSync(`${outDir}/all.xml`, combinedRss);

  console.log(`Saved combined feed to ${outDir}/all.json and ${outDir}/all.xml`);
  console.log(`Total items in combined feed: ${sortedItems.length}`);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
