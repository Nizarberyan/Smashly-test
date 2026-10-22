import chatFr from '../../textes/chat_fr.json';
import chatEn from '../../textes/chat_en.json';

export type Language = 'fr' | 'en';

let currentLang: Language = 'fr';

export const setLanguage = (lang: Language) => {
  currentLang = lang;
};

export const getLanguage = (): Language => currentLang;

export const t = (key: string): string => {
  const dict = (currentLang === 'fr' ? chatFr : chatEn) as Record<string, string>;
  
  if (key in dict && dict[key]) return dict[key] as string;
  const parts = key.split('.');
  const lastKey = parts[parts.length - 1];
  if (lastKey && lastKey in dict && dict[lastKey]) {
    return dict[lastKey] as string;
  }

  return key;
};
