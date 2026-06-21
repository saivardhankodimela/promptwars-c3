"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type Locale = "en" | "hi";

const translations: Record<Locale, Record<string, string>> = {
  en: {
    "app.name": "EcoMind AI",
    "nav.dashboard": "Dashboard",
    "nav.coach": "AI Coach",
    "nav.simulator": "Simulator",
    "nav.challenges": "Challenges",
    "nav.logout": "Log out",
    "dashboard.welcome": "Namaste",
    "dashboard.subtitle": "Let's turn environmental awareness into everyday habits.",
    "dashboard.greenPoints": "Green Points",
    "dashboard.streak": "Daily Streak",
    "dashboard.footprint": "Your Monthly Footprint",
    "dashboard.persona": "Active Persona",
    "dashboard.story": "Weekly Sustainability Story",
    "simulator.title": "Decision Simulator",
    "onboarding.title": "Assess Your Footprint",
    "coach.title": "EcoDeva AI Coach",
    "common.loading": "Loading...",
    "common.submit": "Submit",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.skip": "Skip to main content",
  },
  hi: {
    "app.name": "इकोमाइंड AI",
    "nav.dashboard": "डैशबोर्ड",
    "nav.coach": "AI कोच",
    "nav.simulator": "सिम्युलेटर",
    "nav.challenges": "चुनौतियाँ",
    "nav.logout": "लॉग आउट",
    "dashboard.welcome": "नमस्ते",
    "dashboard.subtitle": "पर्यावरण जागरूकता को दैनिक आदतों में बदलें।",
    "dashboard.greenPoints": "ग्रीन पॉइंट्स",
    "dashboard.streak": "दैनिक स्ट्रीक",
    "dashboard.footprint": "आपका मासिक कार्बन फुटप्रिंट",
    "dashboard.persona": "सक्रिय व्यक्तित्व",
    "dashboard.story": "साप्ताहिक स्थिरता कहानी",
    "simulator.title": "निर्णय सिम्युलेटर",
    "onboarding.title": "अपना कार्बन फुटप्रिंट जानें",
    "coach.title": "इकोदेव AI कोच",
    "common.loading": "लोड हो रहा है...",
    "common.submit": "जमा करें",
    "common.save": "सहेजें",
    "common.cancel": "रद्द करें",
    "common.skip": "मुख्य सामग्री पर जाएं",
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState<Locale>("en");

  const t = useCallback(
    (key: string): string => {
      return translations[locale]?.[key] || translations["en"]?.[key] || key;
    },
    [locale]
  );

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === "en" ? "hi" : "en"));
  }, []);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
