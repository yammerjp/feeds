import { describe, expect, it } from "vitest";
import { parseYamapActivitiesResponse } from "./yamap.js";

const sampleResponse = {
  activities: [
    {
      id: 48587100,
      public_type: "public",
      title: "菅平牧場→四阿山→根子岳",
      description: "菅平牧場に車中泊して、朝から四阿山へ。",
      start_at: 1779568669,
      finish_at: 1779588932,
      distance: 9717.231780404505,
      duration: 20220,
      elevation: 766,
      created_at: 1779588941,
      updated_at: 1779618661,
      public_at: 1779618661,
      time_zone: 9,
      activity_type: {
        id: 20,
        name: "Trekking",
      },
      image: {
        medium_url: "https://example.com/yamap.jpg",
      },
    },
  ],
  meta: {
    current_page: 1,
    prev_page: -1,
    next_page: -1,
    total_pages: 1,
    total_count: 1,
  },
};

describe("parseYamapActivitiesResponse", () => {
  it("normalizes the public activity into a feed item", () => {
    const items = parseYamapActivitiesResponse(sampleResponse);

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe("48587100");
    expect(items[0].url).toBe("https://yamap.com/activities/48587100");
    expect(items[0].title).toBe("菅平牧場→四阿山→根子岳");
    expect(items[0].content_text).toContain("菅平牧場に車中泊して、朝から四阿山へ。");
    expect(items[0].content_text).toContain("9.7km");
    expect(items[0].content_html).toBe('<img src="https://example.com/yamap.jpg" alt="菅平牧場→四阿山→根子岳" />');
    expect(items[0].image_url).toBe("https://example.com/yamap.jpg");
    expect(items[0].date_published).toBe("2026-05-24T05:37:49+09:00");
    expect(items[0].source).toBe("yamap");
  });
});
