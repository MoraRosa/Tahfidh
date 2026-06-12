// One-liner rotation for the homepage. Add more freely — keep them short.
// Types: "verse" (Quran), "hadith" (Prophet ﷺ), "wisdom" (general Islamic/positive)
export type QuoteKind = "verse" | "hadith" | "wisdom";
export interface Quote {
  text: string;
  source?: string;
  kind: QuoteKind;
}

export const QUOTES: Quote[] = [
  // ── Qur'an ─────────────────────────────────────────────
  { kind: "verse", text: "And We have certainly made the Qur'an easy for remembrance, so is there any who will remember?", source: "Qur'an 54:17" },
  { kind: "verse", text: "Indeed, with hardship comes ease.", source: "Qur'an 94:6" },
  { kind: "verse", text: "And He found you lost and guided you.", source: "Qur'an 93:7" },
  { kind: "verse", text: "So remember Me; I will remember you.", source: "Qur'an 2:152" },
  { kind: "verse", text: "Verily, in the remembrance of Allah do hearts find rest.", source: "Qur'an 13:28" },
  { kind: "verse", text: "Allah does not burden a soul beyond what it can bear.", source: "Qur'an 2:286" },
  { kind: "verse", text: "And whoever puts their trust in Allah — He is sufficient for them.", source: "Qur'an 65:3" },
  { kind: "verse", text: "Call upon Me; I will respond to you.", source: "Qur'an 40:60" },
  { kind: "verse", text: "My mercy encompasses all things.", source: "Qur'an 7:156" },
  { kind: "verse", text: "Perhaps you dislike a thing and it is good for you.", source: "Qur'an 2:216" },
  { kind: "verse", text: "And your Lord is going to give you, and you will be satisfied.", source: "Qur'an 93:5" },
  { kind: "verse", text: "Is not the heart at rest with the remembrance of Allah?", source: "Qur'an 13:28" },
  { kind: "verse", text: "And seek help through patience and prayer.", source: "Qur'an 2:45" },
  { kind: "verse", text: "Indeed, Allah is with the patient.", source: "Qur'an 2:153" },
  { kind: "verse", text: "Whoever fears Allah — He will make for them a way out.", source: "Qur'an 65:2" },
  { kind: "verse", text: "And whoever relies upon Allah — then He is sufficient.", source: "Qur'an 65:3" },
  { kind: "verse", text: "My Lord, increase me in knowledge.", source: "Qur'an 20:114" },
  { kind: "verse", text: "So which of the favors of your Lord would you deny?", source: "Qur'an 55:13" },
  { kind: "verse", text: "And He is with you wherever you are.", source: "Qur'an 57:4" },
  { kind: "verse", text: "Whoever does an atom's weight of good will see it.", source: "Qur'an 99:7" },
  { kind: "verse", text: "Our Lord, accept this from us. Indeed, You are the Hearing, the Knowing.", source: "Qur'an 2:127" },
  { kind: "verse", text: "And speak to people good words.", source: "Qur'an 2:83" },
  { kind: "verse", text: "Recite what has been revealed to you of the Book and establish prayer.", source: "Qur'an 29:45" },
  { kind: "verse", text: "Indeed, prayer prohibits immorality and wrongdoing.", source: "Qur'an 29:45" },
  { kind: "verse", text: "And whoever holds firmly to Allah has been guided to a straight path.", source: "Qur'an 3:101" },
  { kind: "verse", text: "Do not despair of the mercy of Allah.", source: "Qur'an 39:53" },
  { kind: "verse", text: "And He taught you that which you did not know.", source: "Qur'an 4:113" },
  { kind: "verse", text: "Indeed, Allah loves those who rely upon Him.", source: "Qur'an 3:159" },

  // ── Hadith ─────────────────────────────────────────────
  { kind: "hadith", text: "The best among you are those who learn the Qur'an and teach it.", source: "Bukhari" },
  { kind: "hadith", text: "Khayrukum man ta'allamal-Qur'ana wa 'allamah — the best of you is the one who learns the Qur'an and teaches it.", source: "Bukhari" },
  { kind: "hadith", text: "The most beloved deeds to Allah are those done consistently, even if small.", source: "Bukhari & Muslim" },
  { kind: "hadith", text: "Whoever recites a letter from the Book of Allah, for him is a reward — and ten the like of it.", source: "Tirmidhi" },
  { kind: "hadith", text: "Actions are but by intentions.", source: "Bukhari & Muslim" },
  { kind: "hadith", text: "None of you truly believes until he loves for his brother what he loves for himself.", source: "Bukhari & Muslim" },
  { kind: "hadith", text: "Smiling in the face of your brother is charity.", source: "Tirmidhi" },
  { kind: "hadith", text: "The strong is not the one who overcomes people by his strength — the strong is the one who controls himself when angry.", source: "Bukhari" },
  { kind: "hadith", text: "The one who is skilled in the Qur'an is with the noble, righteous scribes; the one who recites with difficulty has two rewards.", source: "Bukhari & Muslim" },
  { kind: "hadith", text: "Keep refreshing the Qur'an — by the One in whose hand my soul is, it slips away faster than a tied camel.", source: "Bukhari & Muslim" },
  { kind: "hadith", text: "Cleanliness is half of faith.", source: "Muslim" },
  { kind: "hadith", text: "Whoever believes in Allah and the Last Day, let him speak good or remain silent.", source: "Bukhari & Muslim" },
  { kind: "hadith", text: "Make things easy and do not make them difficult; give glad tidings and do not repel.", source: "Bukhari" },
  { kind: "hadith", text: "Allah is gentle and loves gentleness in all matters.", source: "Bukhari & Muslim" },
  { kind: "hadith", text: "Whoever takes a path in search of knowledge, Allah will make easy for him a path to Paradise.", source: "Muslim" },
  { kind: "hadith", text: "Two blessings many people are deceived about: health and free time.", source: "Bukhari" },
  { kind: "hadith", text: "He is not of us who does not show mercy to our young, nor honor our elders.", source: "Tirmidhi" },
  { kind: "hadith", text: "A good word is charity.", source: "Bukhari & Muslim" },
  { kind: "hadith", text: "The Qur'an will come on the Day of Judgment as an intercessor for its companions.", source: "Muslim" },
  { kind: "hadith", text: "Recite the Qur'an, for it comes as an intercessor for its companions on the Day of Resurrection.", source: "Muslim" },
  { kind: "hadith", text: "Whoever reads one letter of the Qur'an gets a good deed, and good deeds are multiplied by ten.", source: "Tirmidhi" },
  { kind: "hadith", text: "Convey from me, even if it is a single verse.", source: "Bukhari" },
  { kind: "hadith", text: "The example of one who remembers his Lord and one who does not is like the living and the dead.", source: "Bukhari" },

  // ── Wisdom / positive ─────────────────────────────────
  { kind: "wisdom", text: "Keep going gently. Consistency beats intensity." },
  { kind: "wisdom", text: "A verse a day is a lifetime of light." },
  { kind: "wisdom", text: "The Qur'an meets you where you are." },
  { kind: "wisdom", text: "Small, daily, sincere — that is the recipe." },
  { kind: "wisdom", text: "Don't fear starting over. Fear standing still." },
  { kind: "wisdom", text: "Your heart is a garden; recitation is the rain." },
  { kind: "wisdom", text: "Today's effort is tomorrow's ease." },
  { kind: "wisdom", text: "One ayah memorized is worth a thousand scrolled." },
  { kind: "wisdom", text: "Begin again. The door is always open." },
  { kind: "wisdom", text: "Slow is smooth, smooth is steady, steady is forever." },
  { kind: "wisdom", text: "The reward is in the showing up." },
  { kind: "wisdom", text: "Let the Qur'an read you, too." },
  { kind: "wisdom", text: "Five focused minutes beat fifty distracted ones." },
  { kind: "wisdom", text: "Niyyah first. Effort follows." },
  { kind: "wisdom", text: "Every hafiz was once a beginner on Al-Fatiha." },
  { kind: "wisdom", text: "Review is revelation, all over again." },
  { kind: "wisdom", text: "The tongue that recites is a tongue at peace." },
  { kind: "wisdom", text: "Be the one your future self thanks." },
];

// Stable per-day rotation so it doesn't change on every render.
export function dailyQuote(seed = 0): Quote {
  const d = new Date();
  const day = Math.floor(d.getTime() / 86400000) + seed;
  return QUOTES[((day % QUOTES.length) + QUOTES.length) % QUOTES.length];
}
