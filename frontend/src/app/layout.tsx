"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Outfit } from "next/font/google";
import Link from "next/link";
import { Leaf, LogOut, LayoutDashboard, MessageCircle, Sliders, Trophy } from "lucide-react";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

// Internal Navbar component to consume useAuth context
const Navigation = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="border-b border-card-border/40 bg-card/30 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-extrabold text-lg text-primary">
          <Leaf className="h-5 w-5 animate-pulse" />
          <span>EcoMind AI</span>
        </Link>

        {/* Links */}
        <div className="flex gap-6 text-sm font-semibold">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-foreground/80 hover:text-primary transition">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden md:inline">Dashboard</span>
          </Link>
          <Link href="/coach" className="flex items-center gap-1.5 text-foreground/80 hover:text-primary transition">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden md:inline">AI Coach</span>
          </Link>
          <Link href="/simulator" className="flex items-center gap-1.5 text-foreground/80 hover:text-primary transition">
            <Sliders className="h-4 w-4" />
            <span className="hidden md:inline">Simulator</span>
          </Link>
          <Link href="/challenges" className="flex items-center gap-1.5 text-foreground/80 hover:text-primary transition">
            <Trophy className="h-4 w-4" />
            <span className="hidden md:inline">Challenges</span>
          </Link>
        </div>

        {/* Action Button */}
        <button
          onClick={logout}
          className="flex items-center gap-1 text-xs font-semibold text-foreground/50 hover:text-eco-toxic border border-card-border/60 hover:border-eco-toxic/40 rounded-xl px-3 py-1.5 transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </nav>
  );
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <html lang="en" className={`${outfit.variable}`}>
      <head>
        <title>EcoMind AI - Turn carbon data into everyday action</title>
        <meta name="description" content="AI-powered carbon footprint awareness and behavioral change platform for individuals in India." />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Navigation />
            <main className="min-h-[calc(100vh-4rem)] pb-12">{children}</main>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
