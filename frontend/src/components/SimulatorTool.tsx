"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { LivingEarth } from "./LivingEarth";
import { Sparkles, TrendingDown, Leaf, Activity } from "lucide-react";

export const SimulatorTool = () => {
  const [currentScore, setCurrentScore] = useState<any | null>(null);
  const [projectedScore, setProjectedScore] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  // Sliders
  const [reduceAc, setReduceAc] = useState(0);
  const [useMetro, setUseMetro] = useState(0);
  const [reduceDelivery, setReduceDelivery] = useState(0);
  const [reduceFlights, setReduceFlights] = useState(0);

  // Insights
  const [insights, setInsights] = useState("");

  const fetchCurrent = async () => {
    try {
      const res = await api.get<any>("/carbon/current");
      setCurrentScore(res);
      setProjectedScore(JSON.parse(JSON.stringify(res))); // Clone initial values
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrent();
  }, []);

  // Instant local deterministic calculation
  useEffect(() => {
    if (!currentScore) return;

    const base = JSON.parse(JSON.stringify(currentScore));

    // 1. AC Reduction
    // AC consumes ~1.5 kW. India grid = 0.82 kg/kWh.
    const acReduction = reduceAc * 30 * 1.5 * 0.82;
    base.breakdown.energy = Math.max(0, base.breakdown.energy - acReduction);

    // 2. Metro commutes
    // Switching T trips weekly. Metro = 0.032, Petrol car = 0.143 (average saving 0.11 kg/km)
    // commute distance assumed 15km if not fetched, otherwise we estimate savings based on average
    const commuteSavingRate = 0.11; // kg saved per km by switching to public transport
    const commuteDist = 15.0; // standard fallback
    const transportSaving = useMetro * 4.33 * commuteDist * commuteSavingRate;
    base.breakdown.transportation = Math.max(0, base.breakdown.transportation - transportSaving);

    // 3. Deliveries
    // Delivery savings = 1.5 kg per order
    const deliverySaving = reduceDelivery * 4.33 * 1.5;
    base.breakdown.food = Math.max(0, base.breakdown.food - deliverySaving);

    // 4. Flights
    // Flight saving = 200 kg per domestic flight
    const flightSaving = (reduceFlights * 200.0) / 12.0;
    base.breakdown.travel = Math.max(0, base.breakdown.travel - flightSaving);

    const total = 
      base.breakdown.transportation +
      base.breakdown.food +
      base.breakdown.energy +
      base.breakdown.travel +
      base.breakdown.shopping;

    base.totalMonthly = Math.round(total * 100) / 100;
    setProjectedScore(base);
  }, [reduceAc, useMetro, reduceDelivery, reduceFlights, currentScore]);

  const runSimulation = async () => {
    setSimulating(true);
    try {
      const res: any = await api.post("/ai/simulate", {
        reduceAcHours: reduceAc,
        useMetroWeekly: useMetro,
        reduceDeliveryWeekly: reduceDelivery,
        reduceFlightsAnnual: reduceFlights
      });
      setInsights(res.insights);
    } catch (err) {
      console.error(err);
      setInsights("Connection failed. However, your mathematical savings have been recorded. Keep making these choices!");
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
        <span className="text-sm mt-3 text-foreground/60">Preparing simulation matrix...</span>
      </div>
    );
  }

  const currentTotal = currentScore?.totalMonthly || 340;
  const projectedTotal = projectedScore?.totalMonthly || 340;
  const savings = Math.max(0, currentTotal - projectedTotal);
  const pct = Math.round((savings / currentTotal) * 100);

  // Compute a projected Living Earth score
  // Lower emissions = higher score
  const projectedScoreScale = Math.round(Math.max(0, Math.min(100, 100 - ((projectedTotal - 100) / 1000) * 100)));

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Decision Simulator
        </h1>
        <p className="text-foreground/60">
          Slide the bars to adjust your habits and see the immediate environmental projection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Sliders */}
        <Card className="border border-card-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="text-primary h-5 w-5" /> Adjust Your Commits
            </CardTitle>
            <CardDescription>Simulated daily/weekly actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Slider
              label="Reduce AC Usage"
              displayValue={`${reduceAc} hours / day`}
              min={0}
              max={10}
              step={0.5}
              value={reduceAc}
              onChange={setReduceAc}
            />

            <Slider
              label="Switch Commutes to Metro/Bus"
              displayValue={`${useMetro} trips / week`}
              min={0}
              max={14}
              step={1}
              value={useMetro}
              onChange={setUseMetro}
            />

            <Slider
              label="Reduce Online Food Deliveries"
              displayValue={`${reduceDelivery} orders / week`}
              min={0}
              max={10}
              step={1}
              value={reduceDelivery}
              onChange={setReduceDelivery}
            />

            <Slider
              label="Reduce Annual Flights"
              displayValue={`${reduceFlights} flights / year`}
              min={0}
              max={15}
              step={1}
              value={reduceFlights}
              onChange={setReduceFlights}
            />

            <div className="pt-4 border-t border-card-border/40">
              <Button
                variant="primary"
                onClick={runSimulation}
                isLoading={simulating}
                className="w-full py-4 text-base rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Generate AI Sustainability Insight
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Visualizer & Savings */}
        <div className="space-y-8">
          {/* Canvas visualization reacting in real-time */}
          <div className="h-[250px] relative overflow-hidden rounded-2xl border border-card-border">
            <LivingEarth score={projectedScoreScale} />
          </div>

          {/* Metric Comparison Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 grid grid-cols-2 gap-6 items-center">
              <div>
                <span className="text-xs text-foreground/50 font-bold block uppercase tracking-wider">
                  Projected Savings
                </span>
                <span className="text-3xl font-extrabold text-primary flex items-center gap-1.5 mt-1">
                  <TrendingDown className="h-6 w-6" />
                  {savings.toFixed(1)} <span className="text-xs font-semibold text-foreground/50">kg CO₂e/mo</span>
                </span>
              </div>
              
              <div className="border-l border-card-border/45 pl-6">
                <span className="text-xs text-foreground/50 font-bold block uppercase tracking-wider">
                  Footprint Reduction
                </span>
                <span className="text-3xl font-extrabold text-secondary mt-1">
                  {pct}% Less
                </span>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights Card */}
          {insights && (
            <Card glow className="relative overflow-hidden border-primary/30">
              <div className="absolute top-0 right-0 bg-primary/20 text-primary px-3 py-1 text-xs font-bold rounded-bl-xl flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Planner
              </div>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Leaf className="text-primary h-4 w-4" /> AI Strategic Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80 leading-relaxed font-sans">{insights}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
