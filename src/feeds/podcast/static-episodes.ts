import type { PodcastEpisode } from "./listen-style.js";

/**
 * Static podcast episodes that aren't in the main RSS feed.
 * (e.g., guest appearances on other podcasts)
 */
export const staticEpisodes: PodcastEpisode[] = [
  {
    id: "https://listen.style/p/h173club/rbu2xvan",
    url: "https://listen.style/p/h173club/rbu2xvan",
    title: "007: 商業誌への寄稿特集特別号 - h173.club",
    content_text:
      "今年はじめて商業誌に寄稿した@takapi86と@yammerjpに、執筆の経緯や体験談を話していただきました。Software Design 2022年5月号 Software Design 2022年6月号",
    audio_url: "",
    date_published: "2022-06-03T00:00:00+09:00",
  },
];
