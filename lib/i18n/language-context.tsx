"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language } from "./translations";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (typeof translations)[Language];
}

const LanguageContext = createContext<LanguageContextType>({
    language: "en",
    setLanguage: () => { },
    t: translations.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en");

    useEffect(() => {
        const stored = localStorage.getItem("emimet-language") as Language | null;
        if (stored === "en" || stored === "fr" || stored === "ar") {
            setLanguageState(stored);
        }
    }, []);

    useEffect(() => {
        // Apply RTL direction for Arabic
        document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = language;
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("emimet-language", lang);
    };

    return (
        <LanguageContext.Provider
            value={{ language, setLanguage, t: translations[language] }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
