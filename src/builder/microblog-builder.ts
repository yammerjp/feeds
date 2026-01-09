import { writeFileSync, mkdirSync } from "node:fs";
import { fetchTwilogFeed } from "../sources/twilog.js";
import { fetchBlueskyFeed } from "../sources/bluesky.js";
import { fetchMemosFeed } from "../sources/memos.js";
import { sortFeedItems, createCombinedJsonFeed, createCombinedRss } from "../lib/feed.js";
import type { FeedItem } from "../lib/types.js";

export interface MicroblogBuildOptions {
  username: string;
  blueskyHandle: string;
  memosRssUrl: string;
  baseUrl: string;
  outDir: string;
}

export async function buildMicroblogFeed(options: MicroblogBuildOptions): Promise<void> {
  const { username, blueskyHandle, memosRssUrl, baseUrl, outDir } = options;

  mkdirSync(outDir, { recursive: true });

  const allItems: FeedItem[] = [];

  // 1. Twilog (tweets)
  console.log(`Fetching tweets from Twilog for @${username}...`);
  const tweetsItems = await fetchTwilogFeed(username);
  console.log(`Fetched ${tweetsItems.length} tweets`);

  const tweetsJsonFeed = createCombinedJsonFeed(tweetsItems, {
    title: `@${username} tweets`,
    homePageUrl: `https://twilog.togetter.com/${username}`,
    feedUrl: `${baseUrl}/microblog/tweets.json`,
  });
  writeFileSync(`${outDir}/tweets.json`, JSON.stringify(tweetsJsonFeed, null, 2));

  const tweetsRss = createCombinedRss(tweetsItems, {
    title: `@${username} tweets`,
    link: `https://twilog.togetter.com/${username}`,
    description: `Tweets from @${username} via Twilog`,
  });
  writeFileSync(`${outDir}/tweets.xml`, tweetsRss);
  console.log(`Saved tweets to ${outDir}/tweets.json and ${outDir}/tweets.xml`);

  allItems.push(...tweetsItems);

  // 2. Bluesky
  console.log(`Fetching Bluesky posts for @${blueskyHandle}...`);
  const blueskyItems = await fetchBlueskyFeed(blueskyHandle);
  console.log(`Fetched ${blueskyItems.length} Bluesky posts`);

  const blueskyJsonFeed = createCombinedJsonFeed(blueskyItems, {
    title: `@${blueskyHandle} on Bluesky`,
    homePageUrl: `https://bsky.app/profile/${blueskyHandle}`,
    feedUrl: `${baseUrl}/microblog/bluesky.json`,
  });
  writeFileSync(`${outDir}/bluesky.json`, JSON.stringify(blueskyJsonFeed, null, 2));

  const blueskyRss = createCombinedRss(blueskyItems, {
    title: `@${blueskyHandle} on Bluesky`,
    link: `https://bsky.app/profile/${blueskyHandle}`,
    description: `Bluesky posts from @${blueskyHandle}`,
  });
  writeFileSync(`${outDir}/bluesky.xml`, blueskyRss);
  console.log(`Saved Bluesky to ${outDir}/bluesky.json and ${outDir}/bluesky.xml`);

  allItems.push(...blueskyItems);

  // 3. Memos
  console.log(`Fetching Memos RSS...`);
  const memosItems = await fetchMemosFeed(memosRssUrl);
  console.log(`Fetched ${memosItems.length} memos`);

  const memosJsonFeed = createCombinedJsonFeed(memosItems, {
    title: "yammer's memos",
    homePageUrl: "https://usememos.yammer.jp/u/yammer",
    feedUrl: `${baseUrl}/microblog/memos.json`,
  });
  writeFileSync(`${outDir}/memos.json`, JSON.stringify(memosJsonFeed, null, 2));

  const memosRss = createCombinedRss(memosItems, {
    title: "yammer's memos",
    link: "https://usememos.yammer.jp/u/yammer",
    description: "Memos from yammer",
  });
  writeFileSync(`${outDir}/memos.xml`, memosRss);
  console.log(`Saved Memos to ${outDir}/memos.json and ${outDir}/memos.xml`);

  allItems.push(...memosItems);

  // 4. 統合フィード（時系列ソート）
  console.log("Building combined feed...");
  const sortedItems = sortFeedItems(allItems);

  const combinedJsonFeed = createCombinedJsonFeed(sortedItems, {
    title: "yammer's microblog",
    homePageUrl: "https://yammer.jp",
    feedUrl: `${baseUrl}/microblog/all.json`,
  });
  writeFileSync(`${outDir}/all.json`, JSON.stringify(combinedJsonFeed, null, 2));

  const combinedRss = createCombinedRss(sortedItems, {
    title: "yammer's microblog",
    link: "https://yammer.jp",
    description: "Combined feed from Twitter, Bluesky, and Memos",
  });
  writeFileSync(`${outDir}/all.xml`, combinedRss);

  console.log(`Saved combined feed to ${outDir}/all.json and ${outDir}/all.xml`);
  console.log(`Total items in combined feed: ${sortedItems.length}`);
}
