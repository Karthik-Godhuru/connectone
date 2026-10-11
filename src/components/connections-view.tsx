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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Collaboration Network
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Connections
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Manage your active builder partnerships and pending collaboration requests.
            </p>
          </div>

          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Discover Teammates</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-800/80 pt-5">
          <button
            onClick={() => setActiveTab("incoming")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "incoming"
                ? "bg-blue-600 text-white"
                : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            Received ({incomingPending.length})
          </button>
          <button
            onClick={() => setActiveTab("accepted")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "accepted"
                ? "bg-blue-600 text-white"
                : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            Connected ({acceptedList.length})
          </button>
          <button
            onClick={() => setActiveTab("outgoing")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "outgoing"
                ? "bg-blue-600 text-white"
                : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            Sent Requests ({outgoingPending.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 px-4 py-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/30 p-16 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          <p className="mt-3 text-xs text-slate-400">Loading your connections...</p>
        </div>
      ) : activeTab === "incoming" ? (
        incomingPending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 p-16 text-center">
            <Users className="mx-auto h-8 w-8 text-slate-500" />
            <h3 className="mt-3 text-sm font-bold text-white">No Received Collaboration Requests</h3>
            <p className="mt-1 text-xs text-slate-400">
              When peers invite you to collaborate, their requests will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {incomingPending.map((c) => (
              <div
                key={c.id}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-5"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-sm font-bold text-white border border-slate-700">
                    {c.partner.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{c.partner.full_name}</h3>
                    <p className="text-xs text-slate-400">{c.partner.career_domain || "Collaborator"}</p>
                    {c.partner.bio && (
                      <p className="mt-2 text-xs text-slate-300 line-clamp-2">{c.partner.bio}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-slate-800 pt-3.5">
                  <button
                    onClick={() => handleRespond(c.id, "accepted")}
                    disabled={updatingId === c.id}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleRespond(c.id, "declined")}
                    disabled={updatingId === c.id}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 py-2 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === "accepted" ? (
        acceptedList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 p-16 text-center">
            <UserCheck className="mx-auto h-8 w-8 text-slate-500" />
            <h3 className="mt-3 text-sm font-bold text-white">No Connected Partners Yet</h3>
            <p className="mt-1 text-xs text-slate-400">
              Browse the Discover directory to find complementary collaborators.
            </p>
            <Link
              href="/discover"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
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
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-sm font-bold text-white border border-slate-700">
                    {c.partner.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{c.partner.full_name}</h3>
                    <p className="text-xs text-slate-400">{c.partner.career_domain || "Collaborator"}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
                      <UserCheck className="h-3 w-3" />
                      Connected
                    </span>
                  </div>
                </div>
                {c.partner.bio && (
                  <p className="mt-3 text-xs text-slate-300 line-clamp-2 border-t border-slate-800/80 pt-3">
                    {c.partner.bio}
                  </p>
                )}
              </div>
            ))}
          </div>
        )
      ) : outgoingPending.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 p-16 text-center">
          <Clock className="mx-auto h-8 w-8 text-slate-500" />
          <h3 className="mt-3 text-sm font-bold text-white">No Sent Pending Requests</h3>
          <p className="mt-1 text-xs text-slate-400">
            When you send requests to peers, they remain here until accepted.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {outgoingPending.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-white border border-slate-700">
                  {c.partner.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{c.partner.full_name}</h3>
                  <p className="text-xs text-slate-400">{c.partner.career_domain || "Collaborator"}</p>
                </div>
              </div>
              <span className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                Pending
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
