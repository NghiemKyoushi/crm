// src/i18n.ts
'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en/locales.json';
import vi from '@/locales/vi/locales.json';
const savedLang =
  typeof window !== 'undefined'
    ? localStorage.getItem('language') || 'vi'
    : 'vi';
i18n
  .use(initReactI18next)
  .init({
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"], 
    },
  });

export default i18n;
