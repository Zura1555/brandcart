
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import enTranslations from '@/locales/en';
import viTranslations from '@/locales/vi';

type Locale = 'en' | 'vi';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Locale, any> = {
  en: enTranslations,
  vi: viTranslations,
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('vi'); // Default to Vietnamese

  useEffect(() => {
    const storedLocale = localStorage.getItem('locale') as Locale | null;
    if (storedLocale && (storedLocale === 'en' || storedLocale === 'vi')) {
      setLocaleState(storedLocale);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    localStorage.setItem('locale', newLocale);
    setLocaleState(newLocale);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let result = translations[locale];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation not found in current locale, then to key itself
        let fallbackResult = translations.en;
        for (const fk of keys) {
          fallbackResult = fallbackResult?.[fk];
          if (fallbackResult === undefined) return key;
        }
        if (typeof fallbackResult === 'string') {
            if (params) {
                return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
                    return acc.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
                }, fallbackResult);
            }
            return fallbackResult;
        }
        return key;
      }
    }
    if (typeof result === 'string') {
        if (params) {
            return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
                return acc.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
            }, result);
        }
        return result;
    }
    return key; // Fallback for non-string results (should not happen with proper keys)
  }, [locale]);
  

  const contextValue = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
