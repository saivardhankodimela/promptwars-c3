"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Leaf, LogOut, LayoutDashboard, MessageCircle, Sliders, Trophy } from "lucide-react";

export const Navigation = () => {
  const { user, logout } = useAuth();

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
            <span className="hidden md:inline">Dashboard</span>
          </Link>
          <Link href="/coach" className="flex items-center gap-1.5 text-foreground/85 hover:text-primary transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-lg px-2 py-1">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden md:inline">AI Coach</span>
          </Link>
          <Link href="/simulator" className="flex items-center gap-1.5 text-foreground/85 hover:text-primary transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-lg px-2 py-1">
            <Sliders className="h-4 w-4" />
            <span className="hidden md:inline">Simulator</span>
          </Link>
          <Link href="/challenges" className="flex items-center gap-1.5 text-foreground/85 hover:text-primary transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-lg px-2 py-1">
            <Trophy className="h-4 w-4" />
            <span className="hidden md:inline">Challenges</span>
          </Link>
        </div>

        {/* Action Button */}
        <button
          onClick={logout}
          className="flex items-center gap-1 text-xs font-semibold text-foreground/65 hover:text-eco-toxic border border-card-border/60 hover:border-eco-toxic/40 rounded-xl px-3 py-1.5 transition focus:outline-none focus:ring-2 focus:ring-eco-toxic focus:ring-offset-2 focus:ring-offset-background"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </nav>
  );
};
