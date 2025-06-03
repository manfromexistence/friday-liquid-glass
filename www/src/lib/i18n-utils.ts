import fs from 'fs';
import path from 'path';

/**
 * Dynamically get all available locales from the locales folder
 * This function reads the locales directory and returns an array of locale codes
 */
export function getAvailableLocales(): string[] {
  try {
    const localesDir = path.join(process.cwd(), 'src', 'locales');
    const files = fs.readdirSync(localesDir);
    
    // Filter for JSON files and extract locale codes
    const locales = files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''))
      .filter(locale => locale !== 'main') // Exclude any non-locale files
      .sort(); // Sort alphabetically
    
    return locales;
  } catch (error) {
    console.warn('Failed to read locales directory:', error);
    return ['en']; // Fallback to English only
  }
}

/**
 * Check if a locale is available
 */
export function isLocaleAvailable(locale: string): boolean {
  const availableLocales = getAvailableLocales();
  return availableLocales.includes(locale);
}

/**
 * Get the default locale (English)
 */
export const DEFAULT_LOCALE = 'en';

/**
 * Language names in their native scripts for display purposes
 */
export const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Español",
  fr: "Français", 
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
  ru: "Русский",
  ja: "日本語",
  ko: "한국어",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  ar: "العربية",
  hi: "हिन्दी",
  bn: "বাংলা",
  tr: "Türkçe",
  nl: "Nederlands",
  sv: "Svenska",
  da: "Dansk",
  no: "Norsk",
  fi: "Suomi",
  pl: "Polski",
  cs: "Čeština",
  sk: "Slovenčina",
  hu: "Magyar",
  ro: "Română",
  bg: "Български",
  hr: "Hrvatski",
  sr: "Српски",
  sl: "Slovenščina",
  lt: "Lietuvių",
  lv: "Latviešu",
  et: "Eesti",
  uk: "Українська",
  el: "Ελληνικά",
  he: "עברית",
  th: "ไทย",
  vi: "Tiếng Việt",
  ms: "Bahasa Melayu",
  id: "Bahasa Indonesia",
  tl: "Filipino",
  sw: "Kiswahili",
  am: "አማርኛ",
  om: "Afaan Oromoo",
  so: "Soomaali",
  rw: "Kinyarwanda",
  lg: "Luganda",
  zu: "isiZulu",
  af: "Afrikaans",
  sq: "Shqip",
  az: "Azərbaycan",
  be: "Беларуская",
  bs: "Bosanski",
  ca: "Català",
  co: "Corsu",
  cy: "Cymraeg",
  eo: "Esperanto",
  eu: "Euskera",
  fa: "فارسی",
  fy: "Frysk",
  ga: "Gaeilge",
  gd: "Gàidhlig",
  gl: "Galego",
  gu: "ગુજરાતી",
  ha: "Hausa",
  haw: "ʻŌlelo Hawaiʻi",
  hy: "Հայերեն",
  is: "Íslenska",
  ig: "Igbo",
  ilo: "Iloko",
  jw: "Basa Jawa",
  ka: "ქართული",
  kk: "Қазақша",
  km: "ខ្មែរ",
  kn: "ಕನ್ನಡ",
  ku: "Kurdî",
  ky: "Кыргызча",
  la: "Latina",
  lb: "Lëtzebuergesch",
  lo: "ລາວ",
  mg: "Malagasy",
  mi: "Te Reo Māori",
  mk: "Македонски",
  ml: "മലയാളം",
  mn: "Монгол",
  mr: "मराठी",
  mt: "Malti",
  my: "မြန်မာ",
  ne: "नेपाली",
  ny: "Chichewa",
  or: "ଓଡ଼ିଆ",
  pa: "ਪੰਜਾਬੀ",
  ps: "پښتو",
  qu: "Runa Simi",
  sa: "संस्कृतम्",
  sd: "سنڌي",
  si: "සිංහල",
  sm: "Gagana Samoa",
  sn: "chiShona",
  st: "Sesotho",
  su: "Basa Sunda",
  ta: "தமிழ்",
  te: "తెలుగు",
  tg: "Тоҷикӣ",
  ti: "ትግርኛ",
  tk: "Türkmen",
  tt: "Татарча",
  ug: "ئۇيغۇرچە",
  ur: "اردو",
  uz: "O'zbekcha",
  xh: "isiXhosa",
  yi: "ייִדיש",
  yo: "Yorùbá"
};

/**
 * Get the display name for a locale
 */
export function getLanguageDisplayName(locale: string): string {
  return LANGUAGE_NAMES[locale] || locale.toUpperCase();
}
