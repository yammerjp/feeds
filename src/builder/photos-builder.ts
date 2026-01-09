import { writeFileSync, mkdirSync } from "node:fs";
import { fetchPhotosFeed } from "../sources/photos.js";
import { createCombinedJsonFeed, createCombinedRss } from "../lib/feed.js";

export interface PhotosBuildOptions {
  photosRssUrl: string;
  baseUrl: string;
  outDir: string;
}

export async function buildPhotosFeed(options: PhotosBuildOptions): Promise<void> {
  const { photosRssUrl, baseUrl, outDir } = options;

  mkdirSync(outDir, { recursive: true });

  console.log(`Fetching Photos RSS...`);
  const photosItems = await fetchPhotosFeed(photosRssUrl);
  console.log(`Fetched ${photosItems.length} photos`);

  const photosJsonFeed = createCombinedJsonFeed(photosItems, {
    title: "yammer's photos",
    homePageUrl: "https://toycamera.yammer.jp/@yammer",
    feedUrl: `${baseUrl}/photos/feed.json`,
  });
  writeFileSync(`${outDir}/feed.json`, JSON.stringify(photosJsonFeed, null, 2));

  const photosRss = createCombinedRss(photosItems, {
    title: "yammer's photos",
    link: "https://toycamera.yammer.jp/@yammer",
    description: "Photos from yammer's toycamera",
  });
  writeFileSync(`${outDir}/feed.xml`, photosRss);

  console.log(`Saved Photos to ${outDir}/feed.json and ${outDir}/feed.xml`);
}
