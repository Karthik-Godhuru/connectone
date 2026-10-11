"use client";

import { useState, useEffect } from "react";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface ConnectionItem {
  id: string;
  isOutgoing: boolean;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  partner: {
    id: string;
    full_name: string;
    career_domain?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
  };
}

export function ConnectionsView() {
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"incoming" | "accepted" | "outgoing">("incoming");

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/connections");
      if (!res.ok) throw new Error("Failed to load connections.");
      const data = await res.json();
      if (data.success && Array.isArray(data.connections)) {
        setConnections(data.connections);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching connections";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleRespond = async (connectionId: string, status: "accepted" | "declined") => {
    try {
      setUpdatingId(connectionId);
      const res = await fetch("/api/connections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update connection.");
      }

      setConnections((prev) =>
        prev.map((c) => (c.id === connectionId ? { ...c, status } : c))
      );
    } catch (err: unknown) {
      console.error("Error updating connection:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const incomingPending = connections.filter((c) => !c.isOutgoing && c.status === "pending");
  const outgoingPending = connections.filter((c) => c.isOutgoing && c.status === "pending");
  const acceptedList = connections.filter((c) => c.status === "accepted");

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-36 bg-gradient-to-bl from-[#4E1F1A]/22 via-[#9E532D]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div>
            <span className="editorial-kicker text-[10px] text-[#D5B38B]">
              Peer Partnerships
            </span>
            <h1 className="font-serif mt-1 text-2xl font-medium tracking-tight text-[#DBD3C1] sm:text-3xl">
              Network & Connections
            </h1>
            <p className="mt-1 text-xs text-[#8FAAB5] max-w-xl leading-relaxed">
              Manage your active builder collaborations and incoming partner invitations.
            </p>
          </div>

          <Link
            href="/discover"
            className="glass-button-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-lg shadow-[#9E532D]/20"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Discover Teammates</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-[#DBD3C1]/10 pt-5 relative z-10">
          <button
            onClick={() => setActiveTab("incoming")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "incoming"
                ? "glass-button-primary shadow-md shadow-[#9E532D]/20 text-[#F4EFE6]"
                : "glass-pill text-[#8FAAB5] hover:text-[#DBD3C1] hover:bg-[#252E33]/60"
            }`}
          >
            Received Invitations ({incomingPending.length})
          </button>
          <button
            onClick={() => setActiveTab("accepted")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "accepted"
                ? "glass-button-primary shadow-md shadow-[#9E532D]/20 text-[#F4EFE6]"
                : "glass-pill text-[#8FAAB5] hover:text-[#DBD3C1] hover:bg-[#252E33]/60"
            }`}
          >
            Connected Partners ({acceptedList.length})
          </button>
          <button
            onClick={() => setActiveTab("outgoing")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "outgoing"
                ? "glass-button-primary shadow-md shadow-[#9E532D]/20 text-[#F4EFE6]"
                : "glass-pill text-[#8FAAB5] hover:text-[#DBD3C1] hover:bg-[#252E33]/60"
            }`}
          >
            Sent Requests ({outgoingPending.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/20 px-4 py-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="glass-panel flex flex-col items-center justify-center rounded-2xl p-20 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#D5B38B]" />
          <p className="mt-3 text-xs text-[#8FAAB5]">Loading network connections...</p>
        </div>
      ) : activeTab === "incoming" ? (
        incomingPending.length === 0 ? (
          <div className="glass-panel rounded-2xl p-16 text-center border-dashed border-[#DBD3C1]/15">
            <Users className="mx-auto h-8 w-8 text-[#8FAAB5]/60" />
            <h3 className="mt-3 font-serif text-sm font-medium text-[#DBD3C1]">No Received Collaboration Requests</h3>
            <p className="mt-1 text-xs text-[#8FAAB5]">
              When peers discover your profile and send an invite, it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {incomingPending.map((c) => (
              <div
                key={c.id}
                className="glass-card flex flex-col justify-between rounded-2xl p-5"
              >
                <div className="flex items-start gap-3.5">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#9E532D]/25 via-[#4E1F1A]/20 to-[#D5B38B]/20 border border-[#DBD3C1]/10 text-sm font-bold text-[#D5B38B]">
                    {c.partner.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <h3 className="font-serif font-medium text-[#DBD3C1] text-base tracking-tight">{c.partner.full_name}</h3>
                    <p className="text-xs text-[#8FAAB5]">{c.partner.career_domain || "Collaborator"}</p>
                    {c.partner.bio && (
                      <p className="mt-2 text-xs text-[#DBD3C1]/85 line-clamp-2 leading-relaxed">{c.partner.bio}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-[#DBD3C1]/08 pt-3.5">
                  <button
                    onClick={() => handleRespond(c.id, "accepted")}
                    disabled={updatingId === c.id}
                    className="flex-1 glass-button-primary inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Accept Invite</span>
                  </button>
                  <button
                    onClick={() => handleRespond(c.id, "declined")}
                    disabled={updatingId === c.id}
                    className="flex-1 glass-button-secondary inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-[#8FAAB5] hover:text-[#DBD3C1] disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === "accepted" ? (
        acceptedList.length === 0 ? (
          <div className="glass-panel rounded-2xl p-16 text-center border-dashed border-[#DBD3C1]/15">
            <UserCheck className="mx-auto h-8 w-8 text-[#8FAAB5]/60" />
            <h3 className="mt-3 font-serif text-sm font-medium text-[#DBD3C1]">No Connected Partners Yet</h3>
            <p className="mt-1 text-xs text-[#8FAAB5]">
              Browse the Discover directory to connect with high-synergy builders.
            </p>
            <Link
              href="/discover"
              className="mt-4 glass-button-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-lg shadow-[#9E532D]/20"
            >
              <span>Explore Discover Directory</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {acceptedList.map((c) => (
              <div
                key={c.id}
                className="glass-card rounded-2xl p-5 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#9E532D]/25 to-[#D5B38B]/20 border border-[#DBD3C1]/10 text-sm font-bold text-[#D5B38B]">
                    {c.partner.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <h3 className="font-serif font-medium text-[#DBD3C1] text-base tracking-tight">{c.partner.full_name}</h3>
                    <p className="text-xs text-[#8FAAB5]">{c.partner.career_domain || "Collaborator"}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 mt-1 font-semibold">
                      <UserCheck className="h-3 w-3" />
                      <span>Connected Partner</span>
                    </span>
                  </div>
                </div>
                {c.partner.bio && (
                  <p className="mt-3 text-xs text-[#DBD3C1]/80 line-clamp-2 border-t border-[#DBD3C1]/08 pt-3 leading-relaxed">
                    {c.partner.bio}
                  </p>
                )}
              </div>
            ))}
          </div>
        )
      ) : outgoingPending.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center border-dashed border-[#DBD3C1]/15">
          <Clock className="mx-auto h-8 w-8 text-[#8FAAB5]/60" />
          <h3 className="mt-3 font-serif text-sm font-medium text-[#DBD3C1]">No Sent Pending Requests</h3>
          <p className="mt-1 text-xs text-[#8FAAB5]">
            When you send requests to peers, they remain here until reviewed.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {outgoingPending.map((c) => (
            <div
              key={c.id}
              className="glass-card flex items-center justify-between rounded-2xl p-5"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#9E532D]/25 to-[#D5B38B]/20 border border-[#DBD3C1]/10 text-xs font-bold text-[#D5B38B]">
                  {c.partner.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h3 className="font-serif font-medium text-[#DBD3C1] text-base tracking-tight">{c.partner.full_name}</h3>
                  <p className="text-xs text-[#8FAAB5]">{c.partner.career_domain || "Collaborator"}</p>
                </div>
              </div>
              <span className="glass-pill rounded-full px-3 py-1 text-xs font-medium text-[#8FAAB5]">
                Pending
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
