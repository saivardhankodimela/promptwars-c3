"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";
import { auth } from "@/utils/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const { user, loginWithGoogle, loading } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [localLoading, setLocalLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLocalLoading(true);
    
    try {
      if (authMode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Authentication failed. Try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative bg-forest-pattern">
      <div className="absolute top-1/4 left-1/4 w-60 h-60 rounded-full bg-primary/10 blur-[90px] pointer-events-none" />
      
      <Card className="w-full max-w-md border border-card-border shadow-2xl relative overflow-hidden bg-card/70 backdrop-blur-lg">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary" />
        
        <CardHeader className="text-center pt-8">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 text-primary mb-3">
            <Leaf className="h-6 w-6 animate-bounce" />
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground">Welcome to EcoMind AI</CardTitle>
          <CardDescription>Log in or sign up to begin your sustainability path.</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 px-8 pb-8">
          {errorMsg && (
            <div className="bg-eco-toxic/10 border border-eco-toxic/20 text-eco-toxic text-xs p-3 rounded-xl text-center font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="emailInput" className="text-xs font-bold text-foreground/75 uppercase tracking-wider">Email Address</label>
              <input
                id="emailInput"
                type="email"
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-background border border-card-border/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition text-foreground"
              />
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="passwordInput" className="text-xs font-bold text-foreground/75 uppercase tracking-wider">Password</label>
              <input
                id="passwordInput"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-background border border-card-border/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition text-foreground"
              />
            </div>
 
            <Button
              type="submit"
              variant="primary"
              isLoading={localLoading}
              className="w-full py-3.5 rounded-xl text-sm font-bold mt-2"
            >
              {authMode === "login" ? "Log In" : "Sign Up"}
            </Button>
          </form>
 
          {/* Switch Mode */}
          <div className="text-center text-xs text-foreground/75">
            {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
              className="text-primary font-bold hover:underline transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded"
            >
              {authMode === "login" ? "Sign Up" : "Log In"}
            </button>
          </div>
 
          <div className="relative my-4 flex items-center justify-center text-xs uppercase text-foreground/60 font-bold">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-card-border/50"></span></div>
            <span className="relative bg-[#080d0a] px-3">or</span>
          </div>

          {/* Google Login Button */}
          <Button
            variant="outline"
            onClick={loginWithGoogle}
            isLoading={loading}
            className="w-full py-3.5 border-card-border/60 hover:bg-card-border/20 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-foreground"
          >
            <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
