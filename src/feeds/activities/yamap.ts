export interface YamapActivityType {
  id: number;
  name?: string;
  name_ja?: string;
}

export interface YamapActivity {
  id: number;
  public_type?: string;
  title?: string;
  description?: string;
  start_at?: number;
  finish_at?: number;
  distance?: number | null;
  duration?: number | null;
  elevation?: number | null;
  created_at?: number;
  updated_at?: number;
  public_at?: number | null;
  activity_type?: YamapActivityType;
}

export interface YamapActivitiesResponse {
  activities: YamapActivity[];
  meta?: {
    current_page?: number;
    prev_page?: number;
    next_page?: number;
    total_pages?: number;
    total_count?: number;
  };
}

export interface YamapActivityFeedItem {
  id: string;
  url: string;
  title: string;
  content_text: string;
  content_html?: string;
  image_url?: string;
  date_published: string;
  source: string;
}

const YAMAP_API_BASE_URL = "https://api.yamap.com/v6";
const YAMAP_WEB_BASE_URL = "https://yamap.com";

function toIsoTimestamp(epochSeconds?: number | null): string {
  if (!epochSeconds) {
    return "";
  }

  return new Date(epochSeconds * 1000).toISOString();
}

function formatDistance(distance?: number | null): string | undefined {
  if (distance == null) {
    return undefined;
  }

  return `${(distance / 1000).toFixed(1)}km`;
}

function formatDuration(durationSeconds?: number | null): string | undefined {
  if (durationSeconds == null) {
    return undefined;
  }

  const totalSeconds = Math.max(0, Math.round(durationSeconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value, index) => (index === 0 ? String(value) : String(value).padStart(2, "0")))
    .join(":");
}

function resolveTitle(activity: YamapActivity): string {
  const title = activity.title?.trim();
  if (title) {
    return title;
  }

  const fallback = activity.activity_type?.name_ja?.trim() || activity.activity_type?.name?.trim();
  return fallback || `YAMAP activity ${activity.id}`;
}

function buildContentText(activity: YamapActivity): string {
  const summaryParts = [
    formatDistance(activity.distance),
    activity.elevation != null ? `標高 ${Math.round(activity.elevation)}m` : undefined,
    formatDuration(activity.duration),
  ].filter((part): part is string => Boolean(part));

  const description = activity.description?.trim();
  const summary = summaryParts.length > 0 ? summaryParts.join(" / ") : undefined;

  return [description, summary].filter((part): part is string => Boolean(part)).join("\n\n");
}

function buildContentHtml(activity: YamapActivity): string | undefined {
  const imageUrl = activity.image?.medium_url || activity.image?.url;
  if (!imageUrl) {
    return undefined;
  }

  const alt = resolveTitle(activity)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<img src="${imageUrl}" alt="${alt}" />`;
}

function mapActivity(activity: YamapActivity): YamapActivityFeedItem | null {
  const datePublished = toIsoTimestamp(activity.public_at ?? activity.updated_at ?? activity.created_at ?? activity.start_at);
  if (!datePublished) {
    return null;
  }

  return {
    id: String(activity.id),
    url: `${YAMAP_WEB_BASE_URL}/activities/${activity.id}`,
    title: resolveTitle(activity),
    content_text: buildContentText(activity),
    content_html: buildContentHtml(activity),
    image_url: activity.image?.medium_url || activity.image?.url,
    date_published: datePublished,
    source: "yamap",
  };
}

export function parseYamapActivitiesResponse(data: YamapActivitiesResponse): YamapActivityFeedItem[] {
  return (data.activities ?? []).map(mapActivity).filter((item): item is YamapActivityFeedItem => item !== null);
}

export async function fetchYamapActivities(userId: string, per = 100): Promise<YamapActivityFeedItem[]> {
  const allItems: YamapActivityFeedItem[] = [];
  let page = 1;

  while (true) {
    const response = await fetch(`${YAMAP_API_BASE_URL}/users/${userId}/activities?page=${page}&per=${per}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch YAMAP activities for ${userId}: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as YamapActivitiesResponse;
    const pageItems = parseYamapActivitiesResponse(data);
    allItems.push(...pageItems);

    const nextPage = data.meta?.next_page ?? -1;
    if (nextPage <= 0 || pageItems.length === 0) {
      break;
    }

    page = nextPage;
  }

  return allItems;
}
