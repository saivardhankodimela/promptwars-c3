"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Leaderboard } from "@/components/Leaderboard";

export default function ChallengesPage() {
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
        <p className="text-foreground/60 text-sm">Opening Leaderboards...</p>
      </div>
    );
  }

  return <Leaderboard />;
}
