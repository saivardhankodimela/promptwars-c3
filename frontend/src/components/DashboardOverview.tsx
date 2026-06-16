"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { LivingEarth } from "./LivingEarth";
import { TreePine, Flame, Home, Award, Sparkles, MessageCircle, Sliders, Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";

export const DashboardOverview = () => {
  const { profile } = useAuth();
  const [carbonScore, setCarbonScore] = useState<any | null>(null);
  const [latestStory, setLatestStory] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const carbon = await api.get<any>("/carbon/current");
      setCarbonScore(carbon);
      
      const story = await api.get<any>("/ai/story/generate").catch(() => {
        // Fallback to fetch latest stored story if generation fails/already exists
        return api.get<any>("/ai/story/latest").catch(() => null);
      });
      setLatestStory(story);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        <p className="text-foreground/60 text-sm">Refining ecosystem visuals...</p>
      </div>
    );
  }

  const score = profile?.score || 50;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Namaste, {profile?.displayName || "Eco Citizen"}!
          </h1>
          <p className="text-foreground/60 mt-1">
            Let's turn environmental awareness into everyday habits.
          </p>
        </div>
        
        {/* Score & Streak Badge */}
        <div className="flex gap-4">
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
            <Trophy className="text-primary h-6 w-6" />
            <div>
              <div className="text-xs text-foreground/60">Green Points</div>
              <div className="text-xl font-extrabold text-primary">{profile?.points || 120}</div>
            </div>
          </div>
          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 flex items-center gap-3">
            <Flame className="text-accent h-6 w-6 animate-pulse" />
            <div>
              <div className="text-xs text-foreground/60">Daily Streak</div>
              <div className="text-xl font-extrabold text-accent">{profile?.streak || 1} Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Living Earth and Persona */}
        <div className="lg:col-span-2 space-y-8">
          {/* Canvas Visualization */}
          <Card className="h-[380px] p-0 overflow-hidden relative group">
            <LivingEarth score={score} />
          </Card>

          {/* AI Persona Details */}
          {profile?.persona && (
            <Card glow className="relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary/20 text-primary px-3 py-1 text-xs font-bold rounded-bl-xl flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Persona
              </div>
              <CardHeader>
                <div className="text-xs font-bold text-primary tracking-wider uppercase">Active Persona</div>
                <CardTitle className="text-2xl mt-1">{profile.persona.personaType}</CardTitle>
                <CardDescription className="text-secondary italic mt-0.5">
                  "{profile.persona.tagline}"
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-foreground/80 leading-relaxed">{profile.persona.summary}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-card-border/40">
                  <div>
                    <span className="text-xs text-foreground/50 block font-semibold">Primary Footprint Driver</span>
                    <span className="text-sm text-eco-toxic font-bold">{profile.persona.topEmissionsSource}</span>
                  </div>
                  <div>
                    <span className="text-xs text-foreground/50 block font-semibold">Quickest Green Opportunity</span>
                    <span className="text-sm text-primary font-bold">{profile.persona.primaryOpportunity}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Footprint Details and Story */}
        <div className="space-y-8">
          {/* Emission Value */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl">Your Monthly Footprint</CardTitle>
              <CardDescription>Deterministic CO₂ calculation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-baseline">
                <span className="text-4xl font-extrabold text-foreground">{carbonScore?.totalMonthly || 340}</span>
                <span className="text-sm font-semibold text-foreground/50">kg CO₂e / month</span>
              </div>

              {/* sector-wise progress bars */}
              {carbonScore?.breakdown && (
                <div className="space-y-3 pt-4 border-t border-card-border/40">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground/70">Commute</span>
                      <span className="font-mono">{carbonScore.breakdown.transportation} kg</span>
                    </div>
                    <Progress value={(carbonScore.breakdown.transportation / carbonScore.totalMonthly) * 100} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground/70">Food</span>
                      <span className="font-mono">{carbonScore.breakdown.food} kg</span>
                    </div>
                    <Progress value={(carbonScore.breakdown.food / carbonScore.totalMonthly) * 100} color="secondary" />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground/70">Electricity & AC</span>
                      <span className="font-mono">{carbonScore.breakdown.energy} kg</span>
                    </div>
                    <Progress value={(carbonScore.breakdown.energy / carbonScore.totalMonthly) * 100} color="accent" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Indian Context Equivalencies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">What does this represent?</CardTitle>
              <CardDescription>Cognitive context for Indian homes</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center p-2 rounded-xl bg-card-border/20 border border-card-border/40">
                <Flame className="text-eco-toxic h-7 w-7 mb-1.5" />
                <span className="text-lg font-bold block">{carbonScore?.equivalencies?.lpgCylindersUsed || 8}</span>
                <span className="text-[10px] text-foreground/50 leading-tight">LPG Cylinders Burnt</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-card-border/20 border border-card-border/40">
                <TreePine className="text-primary h-7 w-7 mb-1.5" />
                <span className="text-lg font-bold block">{carbonScore?.equivalencies?.treesPlantedToOffset || 188}</span>
                <span className="text-[10px] text-foreground/50 leading-tight">Trees Needed / Month</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-card-border/20 border border-card-border/40">
                <Home className="text-secondary h-7 w-7 mb-1.5" />
                <span className="text-lg font-bold block">{carbonScore?.equivalencies?.homesPoweredForMonth || 1.8}</span>
                <span className="text-[10px] text-foreground/50 leading-tight">Households Powered</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Grid: Navigation and Weekly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Cards */}
        <div className="md:col-span-1 space-y-4">
          <Link href="/coach">
            <div className="flex items-center justify-between p-5 rounded-2xl bg-primary/10 border border-primary/20 hover:border-primary transition duration-300 group cursor-pointer">
              <div className="flex items-center gap-3">
                <MessageCircle className="text-primary h-6 w-6" />
                <div className="text-left">
                  <h4 className="font-bold text-foreground">AI EcoDeva Coach</h4>
                  <p className="text-xs text-foreground/60">Chat about lifestyle changes</p>
                </div>
              </div>
              <ArrowRight className="text-foreground/40 group-hover:text-primary transition duration-300 h-5 w-5" />
            </div>
          </Link>

          <Link href="/simulator">
            <div className="flex items-center justify-between p-5 rounded-2xl bg-secondary/10 border border-secondary/20 hover:border-secondary transition duration-300 group cursor-pointer">
              <div className="flex items-center gap-3">
                <Sliders className="text-secondary h-6 w-6" />
                <div className="text-left">
                  <h4 className="font-bold text-foreground">Decision Simulator</h4>
                  <p className="text-xs text-foreground/60">Preview projected reductions</p>
                </div>
              </div>
              <ArrowRight className="text-foreground/40 group-hover:text-secondary transition duration-300 h-5 w-5" />
            </div>
          </Link>

          <Link href="/challenges">
            <div className="flex items-center justify-between p-5 rounded-2xl bg-accent/10 border border-accent/20 hover:border-accent transition duration-300 group cursor-pointer">
              <div className="flex items-center gap-3">
                <Trophy className="text-accent h-6 w-6" />
                <div className="text-left">
                  <h4 className="font-bold text-foreground">Community Teams</h4>
                  <p className="text-xs text-foreground/60">Compete on leaderboards</p>
                </div>
              </div>
              <ArrowRight className="text-foreground/40 group-hover:text-accent transition duration-300 h-5 w-5" />
            </div>
          </Link>
        </div>

        {/* Weekly Narrative Story */}
        {latestStory && (
          <Card className="md:col-span-2 border border-card-border/60">
            <CardHeader>
              <div className="text-xs text-primary font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Award className="h-4 w-4" /> Weekly Sustainability Story
              </div>
              <CardTitle className="text-xl mt-1">{latestStory.title}</CardTitle>
              <CardDescription className="text-primary italic mt-0.5">
                "{latestStory.metaphor}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80 leading-relaxed">{latestStory.narrative}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
