import { chromium } from "playwright";
import { JSDOM } from "jsdom";

export interface Tweet {
  id: string;
  text: string;
  date: string;
  time: string;
  url: string;
}

export interface FeedItem {
  id: string;
  url: string;
  content_text?: string;
  date_published?: string;
  tags?: string[];
}

export function guessYear(month: number, day: number): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  if (month > currentMonth || (month === currentMonth && day > currentDay)) {
    return currentYear - 1;
  }
  return currentYear;
}

export function parseTwilogDateTime(
  date: string,
  time: string,
  year: number
): string | undefined {
  if (!date || !time) return undefined;

  const dateMatch = date.match(/(\d+)月(\d+)日/);
  const timeMatch = time.match(/(\d{2}):(\d{2}):(\d{2})/);

  if (!dateMatch || !timeMatch) return undefined;

  const month = dateMatch[1].padStart(2, "0");
  const day = dateMatch[2].padStart(2, "0");
  const [, hours, minutes, seconds] = timeMatch;

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+09:00`;
}

export function parseTwilogHtml(html: string): Tweet[] {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const results: Tweet[] = [];

  const tweetElements = document.querySelectorAll(".tl-tweet");

  tweetElements.forEach((el) => {
    const textEl = el.querySelector(".tl-text");
    const text = textEl?.textContent?.trim() || "";

    const headLink = el.querySelector(".tl-head .tb-tw");
    const date = headLink?.textContent?.trim() || "";

    const footLink = el.querySelector(".tl-foot .tb-tw");
    const time = footLink?.textContent?.trim() || "";

    const statusLink = el.querySelector('a[href*="/status/"]');
    const url = statusLink?.getAttribute("href") || "";

    const id = url.match(/status\/(\d+)/)?.[1] || "";

    if (text.length > 0) {
      results.push({ id, text, date, time, url });
    }
  });

  const seen = new Set<string>();
  return results.filter((tweet) => {
    if (seen.has(tweet.text)) return false;
    seen.add(tweet.text);
    return true;
  });
}

export async function fetchTwilogHtml(username: string): Promise<string> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const url = `https://twilog.togetter.com/${username}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3000);

  const html = await page.content();
  await browser.close();

  return html;
}

export async function fetchTwilog(username: string): Promise<Tweet[]> {
  const html = await fetchTwilogHtml(username);
  return parseTwilogHtml(html);
}

export function twilogToFeedItems(tweets: Tweet[], username: string): FeedItem[] {
  return tweets.map((tweet) => {
    let datePublished: string | undefined;
    if (tweet.date && tweet.time) {
      const dateMatch = tweet.date.match(/(\d+)月(\d+)日/);
      if (dateMatch) {
        const month = parseInt(dateMatch[1], 10);
        const day = parseInt(dateMatch[2], 10);
        const year = guessYear(month, day);
        datePublished = parseTwilogDateTime(tweet.date, tweet.time, year);
      }
    }

    return {
      id: tweet.id || tweet.url || tweet.text.slice(0, 50),
      url: tweet.url || `https://twilog.togetter.com/${username}`,
      content_text: tweet.text,
      date_published: datePublished,
      tags: ["twitter"],
    };
  });
}

export async function fetchTwilogFeed(username: string): Promise<FeedItem[]> {
  const tweets = await fetchTwilog(username);
  return twilogToFeedItems(tweets, username);
}
