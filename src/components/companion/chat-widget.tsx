"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  Send,
  Sparkles,
  Users,
  Compass,
  Award,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldAlert,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";
import type { ChatMessage, CompanionDataCard } from "@/types/companion";
import { MarkdownContent } from "./markdown-content";

interface CompanionChatWidgetProps {
  initialUserName?: string;
  initialDomain?: string;
  isFloating?: boolean;
  onClose?: () => void;
}

const DEFAULT_STARTER_QUESTIONS = [
  "Who are my top complementary teammates right now?",
  "What is my next career roadmap milestone?",
  "Find hackathons and grants tailored to my skills",
  "How can I improve my profile compatibility score?",
  "Where can I view incoming connection requests?",
];

export function CompanionChatWidget({
  initialUserName = "Builder",
  initialDomain = "Technology",
  isFloating = false,
  onClose,
}: CompanionChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content: `Hello **${initialUserName}**! I am your **ConnectOne AI Companion**.\n\nI can analyze your live profile, find complementary teammates based on your skills in **${initialDomain}**, track your career roadmap milestones, and discover tailored opportunities.\n\nWhat would you like to explore today?`,
      timestamp: "Just now",
      suggestedQuestions: DEFAULT_STARTER_QUESTIONS.slice(0, 3),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend !== undefined ? textToSend : input;
    const messageText = rawText.trim();
    if (!messageText || isLoading) return;

    // 1. Immediately create user message object
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: "user",
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // 2. Immediately append user's message to conversation
    setMessages((prev) => [...prev, userMessage]);

    // 3. Clear input only if submitting from input field
    if (textToSend === undefined) {
      setInput("");
    }
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // Build conversation history format for API
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/companion/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: messageText,
          history: historyPayload,
        }),
      });

      let data: any = null;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch (jsonErr) {
          console.warn("Could not parse JSON response:", jsonErr);
        }
      }

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("You must be logged in to chat with ConnectOne AI Companion. Please log in or refresh your session.");
        }
        if (res.status === 429) {
          throw new Error("You have sent too many requests. Please wait a few seconds before trying again.");
        }
        const errorText = data?.error || data?.message || `Server returned HTTP ${res.status}`;
        throw new Error(errorText);
      }

      if (data && typeof data.message === "string") {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          role: "assistant",
          content: data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          dataCards: data.dataCards || [],
          suggestedQuestions: data.suggestedQuestions || [],
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data?.error || "Received an invalid response format from Companion.");
      }
    } catch (err: any) {
      console.error("Companion chat error:", err);
      const friendlyError = err.message || "Could not connect to Companion. Please try again.";
      setErrorMessage(friendlyError);

      const errorFallbackMsg: ChatMessage = {
        id: `error-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: "assistant",
        content: `**Notice:** ${friendlyError}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "error",
        suggestedQuestions: [
          "Who are my top complementary teammates right now?",
          "What is my next career roadmap milestone?",
          "Find hackathons and grants tailored to my skills",
        ],
      };
      setMessages((prev) => [...prev, errorFallbackMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content: `Chat session reset. I'm ready to assist you with teammate recommendations, career milestones, or opportunity discovery!`,
        timestamp: "Just now",
        suggestedQuestions: DEFAULT_STARTER_QUESTIONS.slice(0, 3),
      },
    ]);
    setErrorMessage(null);
  };

  // Render Data Cards Helper with Liquid Glass styling
  const renderDataCards = (cards?: CompanionDataCard[]) => {
    if (!cards || cards.length === 0) return null;

    return (
      <div className="mt-3.5 space-y-2.5">
        {cards.map((card, idx) => {
          if (card.type === "teammate") {
            return (
              <div
                key={`card-tm-${idx}`}
                className="glass-card rounded-xl p-3.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#9E532D]/25 via-[#4E1F1A]/20 to-[#D5B38B]/20 border border-[#DBD3C1]/10 text-xs font-bold text-[#D5B38B]">
                      {card.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#DBD3C1] text-xs">{card.name}</h4>
                      <p className="text-[11px] text-[#8FAAB5]">{card.domain}</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 tabular-nums">
                    {card.score}% Match
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-[#8FAAB5] italic line-clamp-2 leading-relaxed">
                  &ldquo;{card.explanation}&rdquo;
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-[#DBD3C1]/08 pt-2.5">
                  <div className="flex flex-wrap gap-1">
                    {card.skills.map((s, i) => (
                      <span
                        key={i}
                        className="glass-pill rounded px-1.5 py-0.5 text-[10px] text-[#8FAAB5]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={card.actionUrl}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D5B38B] hover:text-[#E4C8A6] transition"
                  >
                    <span>View in Discover</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          }

          if (card.type === "opportunity") {
            return (
              <div
                key={`card-opp-${idx}`}
                className="glass-card rounded-xl p-3.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="glass-pill rounded-full px-2 py-0.5 text-[10px] font-medium text-[#8FAAB5]">
                      {card.category}
                    </span>
                    <h4 className="mt-1.5 font-semibold text-[#DBD3C1] text-xs">{card.title}</h4>
                    <p className="text-[11px] text-[#8FAAB5]">{card.organization}</p>
                  </div>
                  <span className="rounded-full border border-[#D5B38B]/30 bg-[#D5B38B]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#D5B38B] tabular-nums">
                    {card.matchScore}% Match
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-[#DBD3C1]/08 pt-2.5 text-[11px]">
                  <span className="text-[#8FAAB5] flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-[#8FAAB5]/70" />
                    <span>Deadline: {card.deadline}</span>
                  </span>
                  <Link
                    href={card.actionUrl}
                    className="inline-flex items-center gap-1 font-semibold text-[#D5B38B] hover:text-[#E4C8A6] transition"
                  >
                    <span>Details</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          }

          if (card.type === "roadmap") {
            return (
              <div
                key={`card-rm-${idx}`}
                className="glass-card rounded-xl p-3.5 text-xs space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-[#DBD3C1]/08 pb-2">
                  <div>
                    <span className="editorial-kicker text-[9px] text-[#8FAAB5]">Target Role</span>
                    <h4 className="font-semibold text-[#DBD3C1] text-xs">{card.targetCareer}</h4>
                  </div>
                  <span className="glass-pill rounded-full px-2.5 py-0.5 text-[10px] text-[#DBD3C1] tabular-nums">
                    {card.completedCount}/{card.totalCount} Done
                  </span>
                </div>
                <div className="space-y-1.5">
                  {card.milestones.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      className="flex items-center justify-between text-[11px] bg-[#252E33]/40 p-1.5 rounded-lg border border-[#DBD3C1]/06"
                    >
                      <span className={m.completed ? "line-through text-[#8FAAB5]/60" : "text-[#DBD3C1]"}>
                        {m.title}
                      </span>
                      <span className="text-[10px] text-[#8FAAB5] tabular-nums">{m.estimated_time}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-gradient-to-r from-[#9E532D]/15 to-[#4E1F1A]/15 border border-[#9E532D]/25 p-2.5 text-[11px]">
                  <span className="font-semibold text-[#D5B38B] block mb-0.5">Next Tactical Step:</span>
                  <p className="text-[#DBD3C1]">{card.nextAction}</p>
                </div>
                <div className="text-right">
                  <Link
                    href={card.actionUrl}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D5B38B] hover:text-[#E4C8A6]"
                  >
                    <span>Full Roadmap</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          }

          if (card.type === "navigation") {
            return (
              <div
                key={`card-nav-${idx}`}
                className="glass-card flex items-center justify-between rounded-xl p-3 text-xs"
              >
                <div>
                  <h4 className="font-semibold text-[#DBD3C1] text-xs">{card.title}</h4>
                  <p className="text-[11px] text-[#8FAAB5]">{card.description}</p>
                </div>
                <Link
                  href={card.url}
                  className="glass-button-primary shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11px] font-semibold"
                >
                  <span>Go</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  };

  return (
    <div
      className={`glass-panel flex flex-col rounded-2xl shadow-2xl transition-all duration-300 relative overflow-hidden ${
        isFloating
          ? "fixed bottom-5 right-5 z-50 w-[92vw] max-w-lg h-[620px] max-h-[85vh] border-[#D5B38B]/30 shadow-[0_16px_48px_rgba(10,14,16,0.6)]"
          : isExpanded
          ? "h-[760px] w-full"
          : "h-[580px] w-full"
      }`}
    >
      {/* Top ambient highlight gradient */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#D5B38B]/30 to-transparent" />

      {/* Companion Header */}
      <div className="flex items-center justify-between border-b border-[#DBD3C1]/10 px-4 py-3 bg-[#192024]/80 backdrop-blur-md rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#9E532D]/25 via-[#4E1F1A]/20 to-[#D5B38B]/20 p-[1px] border border-[#DBD3C1]/10">
            <Bot className="h-4 w-4 text-[#D5B38B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-[#DBD3C1] tracking-tight">ConnectOne AI Companion</h3>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            </div>
            <p className="text-[10px] text-[#8FAAB5]">
              Real-time career intelligence & collaboration advisor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleResetChat}
            className="rounded-lg p-1.5 text-[#8FAAB5] hover:bg-[#252E33]/60 hover:text-[#DBD3C1] transition"
            title="Reset conversation"
            aria-label="Reset conversation"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          {!isFloating && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-lg p-1.5 text-[#8FAAB5] hover:bg-[#252E33]/60 hover:text-[#DBD3C1] transition"
              title={isExpanded ? "Collapse height" : "Expand height"}
              aria-label="Toggle height"
            >
              {isExpanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </button>
          )}
          {isFloating && onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#8FAAB5] hover:bg-[#252E33]/60 hover:text-[#DBD3C1] transition"
              title="Close Companion"
              aria-label="Close Companion"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Message History Container */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 leading-relaxed transition-all ${
                  isUser
                    ? "glass-button-primary text-[#F4EFE6] rounded-br-none shadow-[0_4px_16px_rgba(158,83,45,0.25)]"
                    : "glass-card text-[#DBD3C1] rounded-bl-none border border-[#DBD3C1]/10 shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
                }`}
              >
                {/* Message Header / Icon */}
                {!isUser && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#D5B38B] uppercase tracking-wider mb-2">
                    <Sparkles className="h-3 w-3" />
                    <span>AI Companion</span>
                  </div>
                )}

                {/* Formatted Text Content */}
                <div className="text-xs">
                  {isUser ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    <MarkdownContent content={msg.content} />
                  )}
                </div>

                {/* Rich Data Cards (Teammates, Opportunities, Roadmap) */}
                {!isUser && renderDataCards(msg.dataCards)}

                {/* Timestamp */}
                <div
                  className={`mt-2 text-[10px] text-right tabular-nums ${
                    isUser ? "text-[#F4EFE6]/70" : "text-[#8FAAB5]/60"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {/* Follow-up Starter Suggestions */}
              {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[95%]">
                  {msg.suggestedQuestions.map((q, qIdx) => (
                    <button
                      key={qIdx}
                      onClick={() => handleSendMessage(q)}
                      disabled={isLoading}
                      className="glass-pill inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] text-[#8FAAB5] transition hover:border-[#D5B38B]/50 hover:bg-[#252E33]/60 hover:text-[#DBD3C1] disabled:opacity-50"
                    >
                      <span>{q}</span>
                      <ChevronRight className="h-2.5 w-2.5 text-[#D5B38B]" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading / Typing Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="glass-card flex items-center gap-2.5 rounded-2xl rounded-bl-none px-4 py-3 text-xs text-[#DBD3C1]">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#D5B38B]" />
              <span className="text-xs text-[#8FAAB5]">
                Companion is consulting verified platform data...
              </span>
            </div>
          </div>
        )}

        {/* Error notification banner if needed */}
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar & Safety Notice */}
      <div className="border-t border-[#DBD3C1]/10 p-3.5 bg-[#192024]/85 backdrop-blur-md rounded-b-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about complementary teammates, roadmaps, or opportunities..."
            disabled={isLoading}
            maxLength={1000}
            className="glass-input flex-1 rounded-xl px-4 py-2.5 text-xs text-[#DBD3C1] placeholder-[#8FAAB5]/50 focus:border-[#D5B38B] focus:outline-none focus:ring-1 focus:ring-[#D5B38B] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="glass-button-primary inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition disabled:opacity-30 disabled:hover:scale-100"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </form>

        {/* Safety & Grounding Footnote */}
        <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#8FAAB5]/70 px-1">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>Grounded in live database. Consequential actions require explicit user confirmation.</span>
          </div>
          <span className="tabular-nums">1,000 max</span>
        </div>
      </div>
    </div>
  );
}
