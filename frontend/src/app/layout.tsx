import React from "react";
import { Outfit } from "next/font/google";
import Providers from "@/components/Providers";
import { Navigation } from "@/components/Navigation";
import "./globals.css";
import type { Metadata } from "next";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "EcoMind AI - Turn Carbon Data into Everyday Action",
  description: "EcoMind AI translates environmental impact into relatable household metaphors, gamified challenges, and emotional cognitive feedback to drive behavioral change in India.",
  keywords: ["carbon footprint", "sustainability", "India", "climate change", "eco-friendly", "green points", "Vertex AI"],
  authors: [{ name: "EcoMind AI Team" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable}`}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-background focus:rounded-lg focus:font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          Skip to main content
        </a>
        <Providers>
          <Navigation />
          <main id="main-content" className="min-h-[calc(100vh-4rem)] pb-12 outline-none" tabIndex={-1}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
