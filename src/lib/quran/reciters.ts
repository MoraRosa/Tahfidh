// EveryAyah.com reciter catalog. Each MP3 URL is `${base}/${surah:3}${ayah:3}.mp3`.
export interface Reciter {
  id: string;
  name: string;
  arabic: string;
  base: string;
  style: "Murattal" | "Mujawwad";
}

export const RECITERS: Reciter[] = [
  {
    id: "alafasy",
    name: "Mishary Al-Afasy",
    arabic: "مشاري العفاسي",
    base: "https://everyayah.com/data/Alafasy_128kbps",
    style: "Murattal",
  },
  {
    id: "husary",
    name: "Mahmoud Khalil Al-Husary",
    arabic: "محمود خليل الحصري",
    base: "https://everyayah.com/data/Husary_128kbps",
    style: "Murattal",
  },
  {
    id: "husary-mujawwad",
    name: "Al-Husary (Mujawwad)",
    arabic: "الحصري — مجود",
    base: "https://everyayah.com/data/Husary_Mujawwad_64kbps",
    style: "Mujawwad",
  },
  {
    id: "abdul-basit",
    name: "Abdul Basit Abdul Samad",
    arabic: "عبد الباسط عبد الصمد",
    base: "https://everyayah.com/data/AbdulSamad_64kbps_QuranExplorer.Com",
    style: "Murattal",
  },
  {
    id: "abdul-basit-mujawwad",
    name: "Abdul Basit (Mujawwad)",
    arabic: "عبد الباسط — مجود",
    base: "https://everyayah.com/data/Abdul_Basit_Mujawwad_128kbps",
    style: "Mujawwad",
  },
  {
    id: "sudais",
    name: "Abdurrahman As-Sudais",
    arabic: "عبد الرحمن السديس",
    base: "https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps",
    style: "Murattal",
  },
  {
    id: "shuraim",
    name: "Saud Al-Shuraim",
    arabic: "سعود الشريم",
    base: "https://everyayah.com/data/Saood_ash-Shuraym_64kbps",
    style: "Murattal",
  },
  {
    id: "minshawi",
    name: "Muhammad Siddiq Al-Minshawi",
    arabic: "محمد صديق المنشاوي",
    base: "https://everyayah.com/data/Minshawy_Murattal_128kbps",
    style: "Murattal",
  },
  {
    id: "minshawi-mujawwad",
    name: "Al-Minshawi (Mujawwad)",
    arabic: "المنشاوي — مجود",
    base: "https://everyayah.com/data/Minshawy_Mujawwad_192kbps",
    style: "Mujawwad",
  },
  {
    id: "maher",
    name: "Maher Al-Muaiqly",
    arabic: "ماهر المعيقلي",
    base: "https://everyayah.com/data/MaherAlMuaiqly128kbps",
    style: "Murattal",
  },
  {
    id: "ghamdi",
    name: "Saad Al-Ghamdi",
    arabic: "سعد الغامدي",
    base: "https://everyayah.com/data/Ghamadi_40kbps",
    style: "Murattal",
  },
  {
    id: "shaatri",
    name: "Abu Bakr Ash-Shatri",
    arabic: "أبو بكر الشاطري",
    base: "https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_64kbps",
    style: "Murattal",
  },
  {
    id: "ajamy",
    name: "Ahmed Ibn Ali Al-Ajamy",
    arabic: "أحمد بن علي العجمي",
    base: "https://everyayah.com/data/ahmed_ibn_ali_al_ajamy_128kbps",
    style: "Murattal",
  },
  {
    id: "rifai",
    name: "Hani Ar-Rifai",
    arabic: "هاني الرفاعي",
    base: "https://everyayah.com/data/Hani_Rifai_192kbps",
    style: "Murattal",
  },
  {
    id: "jibreel",
    name: "Muhammad Jibreel",
    arabic: "محمد جبريل",
    base: "https://everyayah.com/data/Muhammad_Jibreel_64kbps",
    style: "Murattal",
  },
  {
    id: "dossari",
    name: "Yasser Ad-Dussary",
    arabic: "ياسر الدوسري",
    base: "https://everyayah.com/data/Yasser_Ad-Dussary_128kbps",
    style: "Murattal",
  },
  {
    id: "muaiqly-haramayn",
    name: "Maher Al-Muaiqly (Haramayn)",
    arabic: "ماهر المعيقلي — الحرمين",
    base: "https://everyayah.com/data/Maher_AlMuaiqly_64kbps",
    style: "Murattal",
  },
];

export function ayahAudioUrl(reciter: Reciter, surah: number, ayah: number): string {
  const s = String(surah).padStart(3, "0");
  const a = String(ayah).padStart(3, "0");
  return `${reciter.base}/${s}${a}.mp3`;
}
