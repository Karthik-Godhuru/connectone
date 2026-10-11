"use client";

import React, { useState } from "react";
import { Bot, Sparkles, MessageSquare, ChevronDown, ChevronUp, X } from "lucide-react";
import { CompanionChatWidget } from "./chat-widget";

interface CompanionDashboardSectionProps {
  userName: string;
  careerDomain: string;
}

export function CompanionDashboardSection({
  userName,
  careerDomain,
}: CompanionDashboardSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isFloatingOpen, setIsFloatingOpen] = useState(false);

  return (
    <>
      {/* Embedded Dashboard Section */}
      <div className="glass-panel rounded-2xl p-6 transition-all duration-300 relative overflow-hidden">
        {/* Subtle ambient illumination behind Companion header */}
        <div className="absolute top-0 right-1/4 w-72 h-36 bg-gradient-to-b from-[#4E1F1A]/25 via-[#9E532D]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-[#DBD3C1]/10 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#9E532D]/25 via-[#4E1F1A]/20 to-[#D5B38B]/20 p-[1px] border border-[#DBD3C1]/12 shadow-[0_0_16px_rgba(158,83,45,0.25)]">
              <Bot className="h-4 w-4 text-[#D5B38B]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-bold text-[#DBD3C1] tracking-tight">ConnectOne AI Companion</h2>
                <span className="glass-pill rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#D5B38B]">
                  Interactive Studio Agent
                </span>
              </div>
              <p className="text-[11px] text-[#8FAAB5] mt-0.5">
                Multi-factor teammate matching, career milestone advisement, and curated opportunities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="glass-button-secondary inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
              aria-label={isOpen ? "Collapse Companion" : "Expand Companion"}
            >
              <span>{isOpen ? "Collapse Studio" : "Expand Studio"}</span>
              {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-[#8FAAB5]" /> : <ChevronDown className="h-3.5 w-3.5 text-[#8FAAB5]" />}
            </button>
          </div>
        </div>

        {isOpen ? (
          <CompanionChatWidget
            initialUserName={userName}
            initialDomain={careerDomain}
            isFloating={false}
          />
        ) : (
          <div className="glass-card flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl text-xs">
            <div className="flex items-center gap-3 text-[#DBD3C1]">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9E532D]/20 text-[#D5B38B]">
                <Sparkles className="h-4 w-4" />
              </div>
              <span>
                Companion is standby with verified telemetry calibrated to your <strong className="text-[#F4EFE6]">{careerDomain}</strong> goals.
              </span>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="glass-button-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Resume Studio Session</span>
            </button>
          </div>
        )}
      </div>

      {/* Floating Companion Launcher (Available when embedded section is collapsed) */}
      {!isFloatingOpen && !isOpen && (
        <button
          onClick={() => setIsFloatingOpen(true)}
          className="fixed bottom-6 right-6 z-40 glass-button-primary inline-flex items-center gap-2 rounded-full px-4.5 py-2.5 text-xs font-semibold shadow-2xl glow-terracotta"
          aria-label="Open AI Companion"
        >
          <Bot className="h-4 w-4" />
          <span>Ask AI Companion</span>
        </button>
      )}

      {/* Floating Modal/Drawer */}
      {isFloatingOpen && (
        <CompanionChatWidget
          initialUserName={userName}
          initialDomain={careerDomain}
          isFloating={true}
          onClose={() => setIsFloatingOpen(false)}
        />
      )}
    </>
  );
}
