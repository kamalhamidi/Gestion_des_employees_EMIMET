"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import type { Language } from "@/lib/i18n/translations";

const LANGUAGES: { code: Language; flag: string; label: string }[] = [
    { code: "en", flag: "🇬🇧", label: "EN" },
    { code: "fr", flag: "🇫🇷", label: "FR" },
    { code: "ar", flag: "🇲🇦", label: "ع" },
];

export function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    const currentIndex = LANGUAGES.findIndex((l) => l.code === language);
    const next = LANGUAGES[(currentIndex + 1) % LANGUAGES.length];

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(next.code)}
            className="font-semibold text-sm px-2 gap-1"
            title={`Switch to ${next.label}`}
        >
            <span>{next.flag}</span>
            <span>{next.label}</span>
        </Button>
    );
}
