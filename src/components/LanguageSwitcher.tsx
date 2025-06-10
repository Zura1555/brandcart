
"use client";

import type React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center space-x-1">
      <Button
        variant={locale === 'vi' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setLocale('vi')}
        className={`px-2 py-1 h-auto text-xs ${locale === 'vi' ? 'font-semibold' : ''}`}
      >
        VI
      </Button>
      <Button
        variant={locale === 'en' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setLocale('en')}
        className={`px-2 py-1 h-auto text-xs ${locale === 'en' ? 'font-semibold' : ''}`}
      >
        EN
      </Button>
    </div>
  );
};

export default LanguageSwitcher;
