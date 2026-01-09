import { buildMicroblogFeed } from "../builder/microblog-builder.js";
import { buildPhotosFeed } from "../builder/photos-builder.js";

const BLUESKY_HANDLE = "yammer.jp";
const MEMOS_RSS_URL = "https://usememos.yammer.jp/u/yammer/rss.xml";
const PHOTOS_RSS_URL = "https://toycamera.yammer.jp/@yammer/feed.xml";
const BASE_URL = "https://yammerjp.github.io/feed";

async function main() {
  const username = process.argv[2] || "yammerjp";

  // Build microblog feed
  await buildMicroblogFeed({
    username,
    blueskyHandle: BLUESKY_HANDLE,
    memosRssUrl: MEMOS_RSS_URL,
    baseUrl: BASE_URL,
    outDir: "docs/microblog",
  });

  // Build photos feed
  await buildPhotosFeed({
    photosRssUrl: PHOTOS_RSS_URL,
    baseUrl: BASE_URL,
    outDir: "docs/photos",
  });

  console.log("\nAll feeds built successfully!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
