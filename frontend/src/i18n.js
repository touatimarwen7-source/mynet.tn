import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import frCommon from './locales/fr/common.json';
import arCommon from './locales/ar/common.json';
import enCommon from './locales/en/common.json';

const initializeI18n = async () => {
  if (!i18n.isInitialized) {
    await i18n
      .use(initReactI18next)
      .init({
        resources: {
          fr: { translation: frCommon },
          ar: { translation: arCommon },
          en: { translation: enCommon }
        },
        lng: 'fr',
        fallbackLng: 'fr',
        ns: 'translation',
        defaultNS: 'translation',
        interpolation: {
          escapeValue: false
        },
        react: {
          useSuspense: false
        }
      });
  }
  return i18n;
};

export default initializeI18n();
