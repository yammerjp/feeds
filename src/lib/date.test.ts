import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { guessYear } from "./date.js";

describe("guessYear", () => {
  beforeEach(() => {
    // 2026年1月9日にモック
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-09T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return current year for past date in same year", () => {
    // 1月5日（今日より過去）
    expect(guessYear(1, 5)).toBe(2026);
  });

  it("should return current year for same date", () => {
    // 1月9日（今日）
    expect(guessYear(1, 9)).toBe(2026);
  });

  it("should return previous year for future date", () => {
    // 1月15日（今日より未来）
    expect(guessYear(1, 15)).toBe(2025);
  });

  it("should return previous year for future month", () => {
    // 2月1日（来月）
    expect(guessYear(2, 1)).toBe(2025);
  });

  it("should return previous year for past month (December in January)", () => {
    // 12月31日（今は1月なので、去年の12月）
    expect(guessYear(12, 31)).toBe(2025);
  });
});
