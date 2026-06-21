"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Trophy, Flame, Zap, CheckCircle2, User, Compass } from "lucide-react";
import confetti from "canvas-confetti";

export const Leaderboard = () => {
  const { profile, refreshProfile } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [tab, setTab] = useState<"challenges" | "leaderboard">("challenges");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const chs = await api.get<any[]>("/challenges");
      setChallenges(chs);

      const active = await api.get<any[]>("/challenges/active");
      setActiveChallenges(active);

      const lb = await api.get<any[]>("/challenges/leaderboard");
      setLeaderboard(lb);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleJoin = async (id: string) => {
    try {
      await api.post(`/challenges/${id}/join`);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to join challenge.");
    }
  };

  const handleProgress = async (id: string, currentProgress: number) => {
    const nextProgress = Math.min(100, currentProgress + 25);
    try {
      await api.post(`/challenges/${id}/progress`, { progress: nextProgress });
      if (nextProgress === 100) {
        confetti({
          particleCount: 100,
          spread: 60,
          colors: ["#10b981", "#84cc16", "#38bdf8"]
        });
        await refreshProfile();
      }
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to update progress.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
        <span className="text-sm mt-3 text-foreground/60">Syncing scoreboard...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Community Arena
          </h1>
          <p className="text-foreground/60">Join challenges, earn streaks, and move up the ranks.</p>
        </div>

        {/* Tab Controls */}
        <div role="tablist" aria-label="Arena views" className="flex bg-card-border/30 rounded-xl p-1 border border-card-border/50">
          <button
            role="tab"
            aria-selected={tab === "challenges"}
            aria-controls="challenges-tabpanel"
            id="challenges-tab"
            onClick={() => setTab("challenges")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === "challenges" ? "bg-primary text-background" : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Challenges
          </button>
          <button
            role="tab"
            aria-selected={tab === "leaderboard"}
            aria-controls="leaderboard-tabpanel"
            id="leaderboard-tab"
            onClick={() => setTab("leaderboard")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === "leaderboard" ? "bg-primary text-background" : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Leaderboard
          </button>
        </div>
      </div>

      {tab === "challenges" ? (
        <div
          id="challenges-tabpanel"
          role="tabpanel"
          aria-labelledby="challenges-tab"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Active User Challenges */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap className="text-secondary h-5 w-5" aria-hidden="true" /> Active Commits
            </h2>
            
            {activeChallenges.length === 0 ? (
              <Card className="text-center p-6 border-dashed border-card-border/80">
                <Compass className="mx-auto text-foreground/30 h-10 w-10 mb-2" aria-hidden="true" />
                <CardDescription>No active challenges. Join one on the right to start earning points!</CardDescription>
              </Card>
            ) : (
              activeChallenges.map((ac) => {
                const details = challenges.find((c) => c.id === ac.challengeId);
                const isCompleted = ac.status === "completed";

                return (
                  <Card key={ac.id} className={isCompleted ? "border-primary/40 bg-primary/5" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-sm font-bold">{details?.title || "Challenge"}</CardTitle>
                        {isCompleted && <CheckCircle2 className="text-primary h-5 w-5" aria-label="Completed" />}
                      </div>
                      <CardDescription className="text-xs">{details?.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-foreground/60">Progress</span>
                          <span className="font-mono font-bold text-primary">{ac.progress}%</span>
                        </div>
                        <Progress value={ac.progress} />
                      </div>
                      
                      {!isCompleted && (
                        <Button
                          variant="outline"
                          onClick={() => handleProgress(ac.challengeId, ac.progress)}
                          className="w-full text-xs py-2 rounded-lg"
                        >
                          Simulate Progress (+25%)
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Available challenges */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Compass className="text-primary h-5 w-5" aria-hidden="true" /> Explore Opportunities
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges.map((c) => {
                const isJoined = activeChallenges.some((ac) => ac.challengeId === c.id);

                return (
                  <Card key={c.id} className="hover:border-primary/40 transition duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
                          {c.category}
                        </span>
                        <span className="text-xs font-mono font-bold text-accent">+{c.pointsReward} Pts</span>
                      </div>
                      <CardTitle className="text-base mt-2">{c.title}</CardTitle>
                      <CardDescription className="text-xs">{c.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 flex justify-between items-center text-xs text-foreground/50 border-t border-card-border/40 mt-4 pt-3">
                      <span>{c.participantsCount} active participants</span>
                      <Button
                        variant={isJoined ? "outline" : "primary"}
                        disabled={isJoined}
                        onClick={() => handleJoin(c.id)}
                        className="py-1.5 px-3 text-[10px]"
                      >
                        {isJoined ? "Joined" : "Join Challenge"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Leaderboard table */
        <div
          id="leaderboard-tabpanel"
          role="tabpanel"
          aria-labelledby="leaderboard-tab"
        >
          <Card className="max-w-3xl mx-auto border border-card-border">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Trophy className="text-primary h-5 w-5" aria-hidden="true" /> Global Rankings
              </CardTitle>
              <CardDescription>Top environmental citizens in our network</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-card-border/20 border-b border-card-border/40 text-xs text-foreground/50 font-bold uppercase tracking-wider">
                    <th className="py-3 px-6 text-center w-16">Rank</th>
                    <th className="py-3 px-6">User</th>
                    <th className="py-3 px-6 text-center">Active Streak</th>
                    <th className="py-3 px-6 text-right w-32">Total Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => {
                    const isCurrentUser = entry.uid === profile?.uid;

                    return (
                      <tr
                        key={entry.uid}
                        className={`border-b border-card-border/30 hover:bg-card-border/10 transition duration-150 text-sm ${
                          isCurrentUser ? "bg-primary/5 font-semibold" : ""
                        }`}
                      >
                        <td className="py-4 px-6 text-center font-mono">
                          {entry.rank === 1 ? (
                            <span role="img" aria-label="1st Place Gold Medal" className="inline-block p-1 bg-yellow-500/20 text-yellow-500 rounded-full">🥇</span>
                          ) : entry.rank === 2 ? (
                            <span role="img" aria-label="2nd Place Silver Medal" className="inline-block p-1 bg-slate-300/20 text-slate-400 rounded-full">🥈</span>
                          ) : entry.rank === 3 ? (
                            <span role="img" aria-label="3rd Place Bronze Medal" className="inline-block p-1 bg-amber-700/20 text-amber-700 rounded-full">🥉</span>
                          ) : (
                            `#${entry.rank}`
                          )}
                        </td>
                        <td className="py-4 px-6 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-card-border flex items-center justify-center text-foreground/40 text-xs border border-card-border">
                            {entry.photoURL ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={entry.photoURL} alt={entry.displayName} className="rounded-full" />
                            ) : (
                              <User className="h-4 w-4" aria-hidden="true" />
                            )}
                          </div>
                          <span className={isCurrentUser ? "text-primary" : "text-foreground/80"}>
                            {entry.displayName} {isCurrentUser && "(You)"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center gap-1 text-accent font-bold">
                            <Flame className="h-4 w-4" aria-hidden="true" /> {entry.streak}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-primary">
                          {entry.points} pts
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
