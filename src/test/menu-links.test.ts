import { describe, expect, it } from "vitest";
import { availableSectionLinks, defaultSectionLinks, sectionAnchor } from "@/lib/menu-links";

describe("Section menu anchors", () => {
  it("links the farm story to its replacement flexible section when the original is removed", () => {
    const links = defaultSectionLinks([{ id: "farm-custom", type: "section" }], (key) => key);
    expect(links).toEqual([{ id: "story", sectionId: "farm-custom", sr: "nav.story", en: "nav.story" }]);
  });
  it("does not show broken links to removed sections", () => {
    expect(availableSectionLinks([{ id: "milk", sectionId: "deleted", sr: "Mlijeko", en: "Milk" }], [{ id: "farm", type: "section" }])).toEqual([]);
  });
  it("keeps a selected section anchor unchanged when sections are reordered", () => {
    const link = { id: "custom", sectionId: "farm", sr: "Farma", en: "Farm" };
    const blocks = [{ id: "farm", type: "section" }, { id: "gallery", type: "gallery" }];
    expect(availableSectionLinks([link], blocks.reverse())[0]?.sectionId).toBe("farm");
    expect(sectionAnchor(link.sectionId)).toBe("section-farm");
  });
});