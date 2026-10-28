export type MenuBlock = { id: string; type: string };
export type SectionMenuLink = { id: string; sectionId: string; sr: string; en: string };

export const sectionAnchor = (id: string) => `section-${id}`;

export function defaultSectionLinks(blocks: MenuBlock[], textFor: (key: string, lang: "sr" | "en") => string): SectionMenuLink[] {
  const entries = [
    ["story", "nav.story"], ["milk", "nav.milk"], ["education", "nav.education"],
    ["visits", "nav.visits"], ["apartments", "nav.apartments"], ["contact", "nav.contact"],
  ];
  return entries.flatMap(([type, key]) => {
    if (!type || !key) return [];
    const block = blocks.find((b) => b.type === type) ?? (type === "story" ? blocks.find((b) => b.type === "section") : undefined);
    return block ? [{ id: type, sectionId: block.id, sr: textFor(key, "sr"), en: textFor(key, "en") }] : [];
  });
}

export function availableSectionLinks(links: SectionMenuLink[], blocks: MenuBlock[]) {
  return links.filter((link) => blocks.some((block) => block.id === link.sectionId));
}