"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useRouter } from "next/navigation";
import { ShieldAlert, Car, Apple, Zap, Plane, ShoppingBag } from "lucide-react";
import confetti from "canvas-confetti";

export const OnboardingFlow = () => {
  const [step, setStep] = useState(1);
  const { refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form states
  const [commuteDist, setCommuteDist] = useState(15);
  const [commuteMode, setCommuteMode] = useState<string>("metro_bus");
  const [ownVehicle, setOwnVehicle] = useState(false);

  const [diet, setDiet] = useState<string>("vegetarian");
  const [deliveries, setDeliveries] = useState(2);

  const [acHours, setAcHours] = useState(4);
  const [bill, setBill] = useState(2000);
  const [appliances, setAppliances] = useState<string>("average");

  const [domesticFlights, setDomesticFlights] = useState(2);
  const [intlFlights, setIntlFlights] = useState(0);

  const [onlineShopping, setOnlineShopping] = useState(3);
  const [clothingHabit, setClothingHabit] = useState<string>("sustainable");

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      transportation: {
        dailyCommuteDistanceKm: commuteDist,
        mode: commuteMode,
        vehicleOwnership: ownVehicle,
      },
      food: {
        dietType: diet,
        deliveryFrequencyWeekly: deliveries,
      },
      energy: {
        acUsageHoursDaily: acHours,
        electricityBillEstimateInr: bill,
        appliancesRating: appliances,
      },
      travel: {
        domesticFlightsAnnual: domesticFlights,
        internationalFlightsAnnual: intlFlights,
      },
      shopping: {
        onlineShoppingFrequencyMonthly: onlineShopping,
        clothingPurchaseHabit: clothingHabit,
      },
    };

    try {
      await api.post("/assessment", payload);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      await refreshProfile();
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <Card className="max-w-2xl mx-auto border border-card-border overflow-hidden">
      <CardContent className="p-8">
        {/* Step Indicators */}
        <div className="flex justify-between items-center mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step >= s ? "bg-primary text-background" : "bg-card-border text-foreground/40"
                }`}
              >
                {s}
              </div>
              {s < 5 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                    step > s ? "bg-primary" : "bg-card-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <Car className="text-primary h-6 w-6" />
                <h2 className="text-xl font-bold text-foreground">1. Daily Commute</h2>
              </div>
              
              <div className="space-y-4">
                <label htmlFor="commuteDistInput" className="block text-sm font-semibold text-foreground/80">
                  Daily Commute Distance: <span className="text-primary font-mono font-bold">{commuteDist} km</span>
                </label>
                <input
                  id="commuteDistInput"
                  type="range"
                  min="0"
                  max="150"
                  value={commuteDist}
                  onChange={(e) => setCommuteDist(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-card-border appearance-none cursor-pointer accent-primary"
                />

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground/80">Primary Transport Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: "two_wheeler", label: "Motorcycle / Scooter" },
                      { val: "petrol_car", label: "Petrol Car" },
                      { val: "diesel_car", label: "Diesel SUV / Car" },
                      { val: "electric_car", label: "Electric Vehicle (EV)" },
                      { val: "auto_rickshaw", label: "Auto-Rickshaw" },
                      { val: "metro_bus", label: "Metro / Local Bus" },
                      { val: "bicycle_walk", label: "Walk / Bicycle" },
                    ].map((mode) => (
                      <button
                        key={mode.val}
                        type="button"
                        onClick={() => setCommuteMode(mode.val)}
                        className={`p-3 text-left text-sm rounded-xl border transition-all ${
                          commuteMode === mode.val
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-card-border hover:bg-card-border/40 text-foreground/75"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="ownVehicle"
                    checked={ownVehicle}
                    onChange={(e) => setOwnVehicle(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  <label htmlFor="ownVehicle" className="text-sm text-foreground/85">
                    I own this vehicle
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <Apple className="text-primary h-6 w-6" />
                <h2 className="text-xl font-bold text-foreground">2. Food & Diet</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground/80">Dietary Habit</label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { val: "vegan", label: "Vegan (No animal products)" },
                      { val: "vegetarian", label: "Vegetarian (Dairy, no meat/eggs)" },
                      { val: "pescatarian", label: "Pescatarian (Fish & veggies)" },
                      { val: "omnivore", label: "Omnivore (Regular mixed diet)" },
                      { val: "heavy_meat", label: "Meat Lover (Frequent chicken/mutton/beef)" },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setDiet(opt.val)}
                        className={`p-4 text-left text-sm rounded-xl border transition-all ${
                          diet === opt.val
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-card-border hover:bg-card-border/40 text-foreground/75"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="deliveriesInput" className="block text-sm font-semibold text-foreground/80">
                    Food Delivery Orders (Zomato/Swiggy): <span className="text-primary font-mono font-bold">{deliveries} / week</span>
                  </label>
                  <input
                    id="deliveriesInput"
                    type="range"
                    min="0"
                    max="21"
                    value={deliveries}
                    onChange={(e) => setDeliveries(Number(e.target.value))}
                    className="w-full h-2 rounded-lg bg-card-border appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <Zap className="text-primary h-6 w-6" />
                <h2 className="text-xl font-bold text-foreground">3. Home Energy</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="acHoursInput" className="block text-sm font-semibold text-foreground/80">
                    Daily Air Conditioner (AC) Usage: <span className="text-primary font-mono font-bold">{acHours} hours</span>
                  </label>
                  <input
                    id="acHoursInput"
                    type="range"
                    min="0"
                    max="24"
                    value={acHours}
                    onChange={(e) => setAcHours(Number(e.target.value))}
                    className="w-full h-2 rounded-lg bg-card-border appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="electricityBillInput" className="block text-sm font-semibold text-foreground/80">
                    Monthly Electricity Bill: <span className="text-primary font-mono font-bold">₹{bill}</span>
                  </label>
                  <input
                    id="electricityBillInput"
                    type="range"
                    min="200"
                    max="15000"
                    step="100"
                    value={bill}
                    onChange={(e) => setBill(Number(e.target.value))}
                    className="w-full h-2 rounded-lg bg-card-border appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground/80">Appliance Efficiency Rating</label>
                  <div className="flex gap-3">
                    {[
                      { val: "high_efficiency", label: "5-Star BEE / Highly Efficient" },
                      { val: "average", label: "3-Star / Average" },
                      { val: "low_efficiency", label: "Unrated / Legacy Appliances" },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setAppliances(opt.val)}
                        className={`flex-1 p-3 text-center text-xs rounded-xl border transition-all ${
                          appliances === opt.val
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-card-border hover:bg-card-border/40 text-foreground/75"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <Plane className="text-primary h-6 w-6" />
                <h2 className="text-xl font-bold text-foreground">4. Flights & Long Travel</h2>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="domesticFlightsInput" className="block text-sm font-semibold text-foreground/80">
                    Annual Domestic Flights: <span className="text-primary font-mono font-bold">{domesticFlights} flights</span>
                  </label>
                  <input
                    id="domesticFlightsInput"
                    type="range"
                    min="0"
                    max="30"
                    value={domesticFlights}
                    onChange={(e) => setDomesticFlights(Number(e.target.value))}
                    className="w-full h-2 rounded-lg bg-card-border appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="intlFlightsInput" className="block text-sm font-semibold text-foreground/80">
                    Annual International Flights: <span className="text-primary font-mono font-bold">{intlFlights} flights</span>
                  </label>
                  <input
                    id="intlFlightsInput"
                    type="range"
                    min="0"
                    max="10"
                    value={intlFlights}
                    onChange={(e) => setIntlFlights(Number(e.target.value))}
                    className="w-full h-2 rounded-lg bg-card-border appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-primary h-6 w-6" />
                <h2 className="text-xl font-bold text-foreground">5. Shopping Habits</h2>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="onlineShoppingInput" className="block text-sm font-semibold text-foreground/80">
                    Online Shopping Deliveries (Amazon/Flipkart): <span className="text-primary font-mono font-bold">{onlineShopping} orders/month</span>
                  </label>
                  <input
                    id="onlineShoppingInput"
                    type="range"
                    min="0"
                    max="20"
                    value={onlineShopping}
                    onChange={(e) => setOnlineShopping(Number(e.target.value))}
                    className="w-full h-2 rounded-lg bg-card-border appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground/80">Clothing Behavior</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: "fast_fashion", label: "Fast Fashion (Frequent shopping)" },
                      { val: "sustainable", label: "Eco-Conscious / Slow Fashion" },
                      { val: "minimalist", label: "Minimalist (Only buy when needed)" },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setClothingHabit(opt.val)}
                        className={`p-3 text-center text-xs rounded-xl border transition-all ${
                          clothingHabit === opt.val
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-card-border hover:bg-card-border/40 text-foreground/75"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center mt-10 border-t border-card-border/40 pt-6">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={step === 1 || loading}
            className="text-foreground/70"
          >
            Back
          </Button>

          {step < 5 ? (
            <Button variant="primary" onClick={nextStep}>
              Next Step
            </Button>
          ) : (
            <Button variant="secondary" onClick={handleSubmit} isLoading={loading}>
              Calculate My Footprint
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
