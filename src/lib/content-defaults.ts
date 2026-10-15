import hero from "@/assets/hero.jpg";
import story from "@/assets/story.jpg";
import milk from "@/assets/milk.jpg";

export type Lang = "sr" | "en";

export const defaultImages: Record<string, string> = {
  hero,
  story,
  milk,
};

export const defaultTexts: Record<string, { sr: string; en: string }> = {
  "brand.name": { sr: "Farma Magarica", en: "Donkey Farm" },
  "nav.home": { sr: "Početna", en: "Home" },
  "nav.story": { sr: "Naša priča", en: "Our story" },
  "nav.milk": { sr: "Mlijeko", en: "Milk" },
  "nav.contact": { sr: "Kontakt", en: "Contact" },
  "hero.eyebrow": { sr: "Porodična farma od 2009.", en: "Family farm since 2009" },
  "hero.title": { sr: "Gdje magarci žive sporo, a mlijeko liječi", en: "Where donkeys live slowly and milk heals" },
  "hero.subtitle": {
    sr: "Na obroncima planine, naših trideset magarica pase slobodno, a mi ih muzemo ručno — kao što su to radili naši djedovi.",
    en: "On the mountain slopes, our thirty jennies graze freely, and we milk them by hand — just as our grandparents did.",
  },
  "hero.cta": { sr: "Pitaj o mlijeku", en: "Ask about the milk" },
  "hero.cta2": { sr: "Upoznaj farmu", en: "Meet the farm" },
  "story.eyebrow": { sr: "Naša priča", en: "Our story" },
  "story.title": { sr: "Sve je počelo s jednom magaricom po imenu Mila", en: "It all started with one jenny named Mila" },
  "story.p1": {
    sr: "Prije petnaest godina, naš djed je doveo Milu na imanje da pomaže u vinogradu. Ubrzo smo otkrili koliko su magarci nježni, pametni i privrženi.",
    en: "Fifteen years ago, our grandfather brought Mila to the estate to help in the vineyard. We soon discovered how gentle, clever and loyal donkeys are.",
  },
  "story.p2": {
    sr: "Danas brinemo o cijelom stadu. Svaka magarica ima ime, svoj pašnjak i svoje ždrijebe — mlijeko uzimamo tek kada mladunče dobije svoje.",
    en: "Today we care for a whole herd. Every jenny has a name, her own pasture and her foal — we only take milk once the young one has had its share.",
  },
  "stat1.value": { sr: "30", en: "30" },
  "stat1.label": { sr: "magarica u stadu", en: "jennies in the herd" },
  "stat2.value": { sr: "15", en: "15" },
  "stat2.label": { sr: "godina iskustva", en: "years of experience" },
  "stat3.value": { sr: "100%", en: "100%" },
  "stat3.label": { sr: "ručna mužnja", en: "hand milked" },
  "milk.eyebrow": { sr: "Magareće mlijeko", en: "Donkey milk" },
  "milk.title": { sr: "Najbliže majčinom mlijeku", en: "The closest to mother's milk" },
  "milk.text": {
    sr: "Magareće mlijeko je poznato još od Kleopatre. Bogato je vitaminima, a siromašno mastima — idealno za osjetljive stomake i njegu kože.",
    en: "Donkey milk has been treasured since Cleopatra. Rich in vitamins and low in fat — ideal for sensitive stomachs and skin care.",
  },
  "b1.title": { sr: "Za imunitet", en: "For immunity" },
  "b1.text": { sr: "Prirodni lizozim i laktoferin jačaju odbranu organizma.", en: "Natural lysozyme and lactoferrin support the body's defences." },
  "b2.title": { sr: "Za kožu", en: "For skin" },
  "b2.text": { sr: "Umiruje suhu i osjetljivu kožu, koristi se u sapunima i kremama.", en: "Soothes dry and sensitive skin, used in soaps and creams." },
  "b3.title": { sr: "Za djecu", en: "For children" },
  "b3.text": { sr: "Lako svarljivo, često podnošljivo kod alergije na kravlje mlijeko.", en: "Easily digestible, often tolerated by those allergic to cow's milk." },
  "chat.title": { sr: "Imate pitanje o mlijeku?", en: "A question about the milk?" },
  "chat.text": {
    sr: "Naš asistent zna sve o upotrebi magarećeg mlijeka — od doziranja do njege kože.",
    en: "Our assistant knows all about using donkey milk — from dosage to skin care.",
  },
  "contact.eyebrow": { sr: "Posjetite nas", en: "Visit us" },
  "contact.title": { sr: "Vrata farme su uvijek otvorena", en: "The farm gate is always open" },
  "contact.text": {
    sr: "Dođite da upoznate stado, probate svježe mlijeko i prošetate pašnjacima.",
    en: "Come meet the herd, taste fresh milk and walk through the pastures.",
  },
  "contact.address": { sr: "Selo Bukovica bb, Crna Gora", en: "Bukovica village, Montenegro" },
  "contact.phone": { sr: "+382 67 000 000", en: "+382 67 000 000" },
  "contact.email": { sr: "info@farmamagarica.me", en: "info@donkeyfarm.me" },
  "contact.hours": { sr: "Svaki dan 9–18h", en: "Every day 9am–6pm" },
  "footer.text": { sr: "S ljubavlju prema magarcima.", en: "Made with love for donkeys." },
};
