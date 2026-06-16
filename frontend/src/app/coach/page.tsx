"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { CoachChat } from "@/components/CoachChat";

export default function CoachPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
        <p className="text-foreground/60 text-sm">Calling EcoDeva...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <div className="text-center md:text-left max-w-xl">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          EcoDeva AI Coach
        </h1>
        <p className="text-foreground/60 text-sm mt-1">
          Chat with our Vertex AI sustainability agent to discover actionable, localized green lifestyle choices.
        </p>
      </div>

      <CoachChat />
    </div>
  );
}
