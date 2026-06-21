"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, ArrowRight, Sparkles, Sliders, MessageCircle, Trophy } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-[90vh] flex flex-col justify-center items-center px-4 md:px-8 overflow-hidden bg-forest-pattern">
      {/* Decorative Background Glows */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      {/* Hero Content */}
      <div className="text-center max-w-4xl space-y-6 z-10 pt-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold uppercase tracking-wide animate-pulse">
          <Leaf className="h-4 w-4" /> Challenge 3 Hackathon Submission
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
          EcoMind <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AI</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-foreground/80 font-semibold tracking-wide">
          Turn carbon data into everyday action.
        </p>

        <p className="text-sm md:text-base text-foreground/60 max-w-2xl mx-auto leading-relaxed">
          Most carbon trackers fail because users don't understand abstract raw numbers. EcoMind AI converts kilograms of CO₂ into relatable household metaphors, encouraging emotional awareness and real-world behavior change in India.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/login">
            <Button variant="primary" className="px-8 py-4 text-base rounded-xl font-bold flex items-center gap-2 w-full sm:w-auto">
              Get Started <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <a href="#features">
            <Button variant="outline" className="px-8 py-4 text-base rounded-xl font-bold w-full sm:w-auto">
              Learn More
            </Button>
          </a>
        </div>
      </div>

      {/* Feature Section Preview */}
      <div id="features" className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 pt-24 z-10">
        <Card className="hover:border-primary/40 transition duration-300">
          <CardContent className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground">AI Carbon Persona</h3>
            <p className="text-xs text-foreground/70 leading-relaxed">
              Vertex AI categorizes your footprint (e.g. Conscious Improver) with customized, relatable feedback.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition duration-300">
          <CardContent className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20 text-secondary">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground">EcoDeva Coach</h3>
            <p className="text-xs text-foreground/70 leading-relaxed">
              Interactive chat companion providing localized tips and household analogies for green lifestyle choices.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition duration-300">
          <CardContent className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 text-accent">
              <Sliders className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground">Decision Simulator</h3>
            <p className="text-xs text-foreground/70 leading-relaxed">
              Slide sliders to project carbon savings instantly and watch the Living Earth landscape adapt in real-time.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition duration-300">
          <CardContent className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
              <Trophy className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground">Community Teams</h3>
            <p className="text-xs text-foreground/70 leading-relaxed">
              Join environmental challenges, compete on leaderboards, and build sustainable habits together.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
