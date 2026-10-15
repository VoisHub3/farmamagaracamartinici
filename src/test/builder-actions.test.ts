import { describe, expect, it } from "vitest";
import { safeBuilderLink } from "@/components/builder-actions";

describe("builder links", () => {
  it("accepts web, local, section, email and telephone links", () => {
    for (const link of ["https://example.com", "http://example.com/path", "/p/proizvodi", "#kontakt", "mailto:farma@example.com", "tel:+38267000000"]) {
      expect(safeBuilderLink(link)).toBe(link);
    }
  });
  it("rejects executable and ambiguous links", () => {
    for (const link of ["javascript:alert(1)", "data:text/html,test", "//example.com", "/\\example.com", "https://exa mple.com", "", "relative-link"]) {
      expect(safeBuilderLink(link)).toBeUndefined();
    }
  });
});