import { describe, it, expect } from "vitest";
import { escapeXml } from "./utils.js";

describe("escapeXml", () => {
  it("should escape ampersand", () => {
    expect(escapeXml("foo & bar")).toBe("foo &amp; bar");
  });

  it("should escape less than", () => {
    expect(escapeXml("foo < bar")).toBe("foo &lt; bar");
  });

  it("should escape greater than", () => {
    expect(escapeXml("foo > bar")).toBe("foo &gt; bar");
  });

  it("should escape double quote", () => {
    expect(escapeXml('foo " bar')).toBe("foo &quot; bar");
  });

  it("should escape single quote", () => {
    expect(escapeXml("foo ' bar")).toBe("foo &apos; bar");
  });

  it("should escape multiple special characters", () => {
    expect(escapeXml("<tag attr=\"value\">Text & 'more'</tag>")).toBe(
      "&lt;tag attr=&quot;value&quot;&gt;Text &amp; &apos;more&apos;&lt;/tag&gt;"
    );
  });

  it("should handle empty string", () => {
    expect(escapeXml("")).toBe("");
  });

  it("should handle string without special characters", () => {
    expect(escapeXml("Hello World")).toBe("Hello World");
  });
});
