import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTranslation, Translation } from '@/lib/translations';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: Translation;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('skiniprog-language') || 'en';
  });

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('skiniprog-language', lang);
  };

  const t = getTranslation(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}