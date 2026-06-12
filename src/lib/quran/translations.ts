// Translation + tafsir resource IDs from api.quran.com.
// IDs verified against https://api.quran.com/api/v4/resources/translations
export interface ResourceMeta {
  id: number;
  name: string;
  author: string;
  language: string; // ISO code shown as a chip
}

export const TRANSLATIONS: ResourceMeta[] = [
  // English
  { id: 131, name: "Saheeh International", author: "Saheeh International", language: "en" },
  { id: 20, name: "Pickthall (Literary)", author: "M. M. Pickthall", language: "en" },
  { id: 22, name: "Yusuf Ali", author: "Abdullah Yusuf Ali", language: "en" },
  { id: 85, name: "The Clear Quran", author: "Dr. Mustafa Khattab", language: "en" },
  { id: 19, name: "M. A. S. Abdel Haleem", author: "M. A. S. Abdel Haleem", language: "en" },
  // European
  { id: 31, name: "Hamidullah", author: "Muhammad Hamidullah", language: "fr" },
  { id: 83, name: "García", author: "Isa García", language: "es" },
  { id: 27, name: "Cortes", author: "Julio Cortes", language: "es" },
  { id: 207, name: "Bubenheim & Elyas", author: "Frank Bubenheim, Nadeem Elyas", language: "de" },
  { id: 153, name: "Piccardo", author: "Hamza Roberto Piccardo", language: "it" },
  { id: 134, name: "Saraiva", author: "Helmi Nasr", language: "pt" },
  { id: 79, name: "Korkut", author: "Besim Korkut", language: "bs" },
  { id: 45, name: "Kuliev", author: "Elmir Kuliev", language: "ru" },
  { id: 55, name: "Józefowicz", author: "Józef Bielawski", language: "pl" },
  // Middle East / Asia
  { id: 33, name: "Diyanet", author: "Diyanet İşleri", language: "tr" },
  { id: 234, name: "Persian (Makarem)", author: "Naser Makarem Shirazi", language: "fa" },
  { id: 158, name: "Bayan-ul-Quran", author: "Dr. Israr Ahmed", language: "ur" },
  { id: 54, name: "Maududi", author: "Abul A'la Maududi", language: "ur" },
  { id: 161, name: "Indonesian (Kemenag)", author: "Indonesian Islamic Affairs Ministry", language: "id" },
  { id: 39, name: "Basmeih", author: "Abdullah Muhammad Basmeih", language: "ms" },
  { id: 136, name: "Mujibur Rahman", author: "Mujibur Rahman", language: "bn" },
  { id: 56, name: "Ma Jian", author: "Ma Jian", language: "zh" },
  // African
  { id: 125, name: "Yoruba", author: "Shaykh Abu Rahima Mikael Aykuni", language: "yo" },
  { id: 43, name: "Swahili", author: "Ali Muhsin Al-Barwani", language: "sw" },
  { id: 199, name: "Hausa", author: "Abubakar Mahmoud Gumi", language: "ha" },
  { id: 76, name: "Somali", author: "Abdullah Muhammad Al-Hilali", language: "so" },
  // South Asia extras
  { id: 50, name: "Tamil", author: "Jan Trust Foundation", language: "ta" },
  { id: 78, name: "Malayalam", author: "Abdul Hameed Madani", language: "ml" },
];

export const TAFSIRS: ResourceMeta[] = [
  { id: 169, name: "Tafsir Ibn Kathir (Abridged)", author: "Hafiz Ibn Kathir", language: "en" },
  { id: 168, name: "Maarif-ul-Quran", author: "Mufti Muhammad Shafi", language: "en" },
  { id: 817, name: "Tazkirul Quran", author: "Maulana Wahiduddin Khan", language: "en" },
];

export const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
  bs: "Bosanski",
  ru: "Русский",
  pl: "Polski",
  tr: "Türkçe",
  fa: "فارسی",
  ur: "اردو",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  bn: "বাংলা",
  zh: "中文",
  yo: "Yorùbá",
  sw: "Kiswahili",
  ha: "Hausa",
  so: "Soomaali",
  ta: "தமிழ்",
  ml: "മലയാളം",
};
