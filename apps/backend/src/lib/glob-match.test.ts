import { describe, expect, it } from "vitest";
import type { Website } from "../generated/prisma";
import { formatUrlMatch } from "./glob-match";

describe("formatUrlMatch", () => {
  const website: Website = {
    id: "1",
    page_identifier_rules: [
      {
        url: "https://example.com/blog/**",
        format: "{$1}",
      },
      {
        url: "http://www.example.com/user/*/profile",
        format: "User-{title($1)}",
      },
      {
        url: "https://www1.www2.example.com:443/docs/*/section/*",
        format: "{dash($1)}-{snake($2)}",
      },
    ],
  } as any;

  it("returns formatted string for matching glob pattern", () => {
    expect(formatUrlMatch(website, "https://example.com/blog/hello-world")).toBe("hello-world");
    expect(formatUrlMatch(website, "http://www.example.com/user/john/profile")).toBe("User-John");
    expect(
      formatUrlMatch(website, "https://www1.www2.example.com:443/docs/Getting Started/section/Intro Section")
    ).toBe("getting-started-intro_section");
  });

  it("returns null if no match is found", () => {
    expect(formatUrlMatch(website, "https://example.com/no/match/here")).toBeNull();
  });

  it("removes unmatched placeholders", () => {
    const websiteWithExtraPlaceholder: Website = {
      ...website,
      page_identifier_rules: [
        {
          url: "https://example.com/blog/**",
          format: "{$1}-{$2}-{$3}",
        },
      ],
    } as any;
    expect(formatUrlMatch(websiteWithExtraPlaceholder, "https://example.com/blog/one/two")).toBe(
      "one-two-"
    );
  });

  it("returns null for empty matches", () => {
    const websiteWithNoRules: Website = {
      ...website,
      page_identifier_rules: [
        {
          url: "https://example.org/blog/**",
          format: "{$1}-{$2}-{$3}",
        },
      ],
    } as any;
    expect(formatUrlMatch(websiteWithNoRules, "https://example.com/blog/hello")).toBeNull();
  });
});
