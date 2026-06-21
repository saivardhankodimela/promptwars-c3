"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { OnboardingFlow } from "@/components/OnboardingFlow";

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
        <p className="text-foreground/60 text-sm">Validating session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pt-12">
      <div className="text-center space-y-3 mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Assess Your Footprint
        </h1>
        <p className="text-foreground/60 max-w-lg mx-auto text-sm">
          Complete this brief 5-step questionnaire to map your lifestyle. We'll generate your carbon footprint and match your AI sustainability persona.
        </p>
      </div>
      
      <OnboardingFlow />
    </div>
  );
}
