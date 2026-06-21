"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { Leaf, LogOut, LayoutDashboard, MessageCircle, Sliders, Trophy, Languages } from "lucide-react";

export const Navigation = () => {
  const { user, logout } = useAuth();
  const { t, toggleLocale, locale } = useI18n();

  if (!user) return null;

  return (
    <nav className="border-b border-card-border/40 bg-card/30 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-extrabold text-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-lg">
          <Leaf className="h-5 w-5 animate-pulse" />
          <span>EcoMind AI</span>
        </Link>

        {/* Links */}
        <div className="flex gap-6 text-sm font-semibold">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-foreground/85 hover:text-primary transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-lg px-2 py-1">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden md:inline">{t("nav.dashboard")}</span>
          </Link>
          <Link href="/coach" className="flex items-center gap-1.5 text-foreground/85 hover:text-primary transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-lg px-2 py-1">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden md:inline">{t("nav.coach")}</span>
          </Link>
          <Link href="/simulator" className="flex items-center gap-1.5 text-foreground/85 hover:text-primary transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-lg px-2 py-1">
            <Sliders className="h-4 w-4" />
            <span className="hidden md:inline">{t("nav.simulator")}</span>
          </Link>
          <Link href="/challenges" className="flex items-center gap-1.5 text-foreground/85 hover:text-primary transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-lg px-2 py-1">
            <Trophy className="h-4 w-4" />
            <span className="hidden md:inline">{t("nav.challenges")}</span>
          </Link>
        </div>

        {/* Language Toggle & Logout */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLocale}
            aria-label={`Switch language to ${locale === "en" ? "Hindi" : "English"}`}
            className="flex items-center gap-1 text-xs font-semibold text-foreground/65 hover:text-primary border border-card-border/60 hover:border-primary/40 rounded-xl px-3 py-1.5 transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            <Languages className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{locale === "en" ? "हिन्दी" : "English"}</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-xs font-semibold text-foreground/65 hover:text-eco-toxic border border-card-border/60 hover:border-eco-toxic/40 rounded-xl px-3 py-1.5 transition focus:outline-none focus:ring-2 focus:ring-eco-toxic focus:ring-offset-2 focus:ring-offset-background"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("nav.logout")}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
