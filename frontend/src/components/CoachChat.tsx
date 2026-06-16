"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/utils/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { MessageSquare, Send, Sparkles, User, RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const CoachChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Namaste! I am EcoDeva, your personal sustainability guide. Ask me anything about reducing energy, commuting greener, or understanding your carbon footprint in India!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || loading) return;

    if (!textToSend) setInput("");

    // Add user message to list
    const userMsg: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // API payload requires previous message history
      const res: any = await api.post("/ai/coach/chat", {
        message: messageText,
        chatHistory: messages.map((m) => ({ role: m.role, content: m.content })),
      });

      // Add assistant response to list
      setMessages((prev) => [...prev, { role: "assistant", content: res.response }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting to my environment servers right now, but feel free to ask again in a moment!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "How can I cut my AC power bill?",
    "Indian veg diet carbon vs meat",
    "Commuting by metro: is it worth it?",
    "Explain my carbon persona",
  ];

  return (
    <Card className="max-w-4xl mx-auto border border-card-border h-[650px] flex flex-col justify-between overflow-hidden">
      <CardHeader className="border-b border-card-border/40 py-4 flex flex-row items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
          <Sparkles className="text-primary h-5 w-5 animate-pulse" />
        </div>
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            EcoDeva
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">
              AI Coach
            </span>
          </CardTitle>
          <CardDescription>Empathetic sustainability support</CardDescription>
        </div>
      </CardHeader>

      {/* Messages Panel */}
      <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                  msg.role === "user"
                    ? "bg-secondary/20 border-secondary/30 text-secondary"
                    : "bg-primary/20 border-primary/30 text-primary"
                }`}
              >
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-secondary/10 text-foreground border border-secondary/20 rounded-tr-none"
                    : "bg-card text-foreground border border-card-border/60 rounded-tl-none"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center justify-center animate-spin">
                <RefreshCw className="h-4 w-4" />
              </div>
              <div className="bg-card/40 border border-card-border/30 px-4 py-2 rounded-2xl rounded-tl-none text-xs text-foreground/50 italic">
                EcoDeva is evaluating your carbon profile...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Suggestions and Input Field */}
      <CardFooter className="flex-col gap-4 border-t border-card-border/40 py-4 bg-background/50">
        {/* Suggestion prompts */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 w-full justify-center">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-card-border/60 hover:border-primary/60 hover:text-primary transition duration-300 bg-card/60"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-3 w-full"
        >
          <input
            type="text"
            placeholder="Type your sustainability question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 rounded-xl bg-card border border-card-border px-4 py-3 text-sm focus:outline-none focus:border-primary/80 transition duration-300 text-foreground"
          />
          <Button type="submit" variant="primary" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};
