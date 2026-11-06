"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface ReadingLog {
  id: string;
  bookTitle: string;
  minutesRead: number;
  genre: string;
  note: string;
  favorite: boolean;
  readOn: string;
  createdAt: string;
}

export interface GenreBreakdown {
  genre: string;
  count: number;
  total: number;
}

export interface ReadingSummary {
  count: number;
  favoriteCount: number;
  totalMinutes: number;
  breakdown: GenreBreakdown[];
}

interface Filters {
  genre: string;
  favorite: boolean;
  q: string;
}

interface ReadingLogContextType {
  logs: ReadingLog[];
  summary: ReadingSummary;
  filters: Filters;
  loading: boolean;
  fetchLogsAndSummary: (newFilters?: Partial<Filters>) => Promise<void>;
  addLog: (data: {
    bookTitle: string;
    minutesRead: number;
    genre: string;
    note?: string;
    readOn: string;
  }) => Promise<{ success: boolean; error?: string }>;
  toggleFavorite: (id: string) => Promise<{ success: boolean; error?: string }>;
  deleteLog: (id: string) => Promise<{ success: boolean; error?: string }>;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  clearFilters: () => void;
  resetAll: () => void;
}

const defaultSummary: ReadingSummary = {
  count: 0,
  favoriteCount: 0,
  totalMinutes: 0,
  breakdown: [],
};

const ReadingLogContext = createContext<ReadingLogContextType | undefined>(undefined);

export function ReadingLogProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<ReadingLog[]>([]);
  const [summary, setSummary] = useState<ReadingSummary>(defaultSummary);
  const [filters, setFilters] = useState<Filters>({ genre: "", favorite: false, q: "" });
  const [loading, setLoading] = useState(false);

  const fetchLogsAndSummary = useCallback(
    async (currentFilters?: Partial<Filters>) => {
      const activeFilters = { ...filters, ...(currentFilters || {}) };
      const params = new URLSearchParams();

      if (activeFilters.genre && activeFilters.genre.trim() !== "") {
        params.set("genre", activeFilters.genre.trim());
      }
      if (activeFilters.favorite) {
        params.set("favorite", "true");
      }
      if (activeFilters.q && activeFilters.q.trim() !== "") {
        params.set("q", activeFilters.q.trim());
      }

      const queryString = params.toString() ? `?${params.toString()}` : "";

      try {
        setLoading(true);
        const [logsRes, summaryRes] = await Promise.all([
          fetch(`/api/reading-logs${queryString}`, { cache: "no-store" }),
          fetch(`/api/reading-logs/summary${queryString}`, { cache: "no-store" }),
        ]);

        if (logsRes.ok && summaryRes.ok) {
          const logsData = await logsRes.json();
          const summaryData = await summaryRes.json();
          setLogs(logsData);
          setSummary(summaryData);
        }
      } catch (err) {
        console.error("Error fetching logs and summary:", err);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  const addLog = async (data: {
    bookTitle: string;
    minutesRead: number;
    genre: string;
    note?: string;
    readOn: string;
  }) => {
    try {
      const res = await fetch("/api/reading-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        return { success: false, error: result.error || "Failed to add reading session" };
      }

      // Re-fetch list and summary immediately
      await fetchLogsAndSummary();
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: "Network error adding reading session" };
    }
  };

  const toggleFavorite = async (id: string) => {
    const target = logs.find((l) => l.id === id);
    if (!target) return { success: false, error: "Reading log not found" };

    const newFavorite = !target.favorite;

    try {
      const res = await fetch(`/api/reading-logs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite: newFavorite }),
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: result.error || "Failed to update favorite" };
      }

      await fetchLogsAndSummary();
      return { success: true };
    } catch (err) {
      return { success: false, error: "Network error updating favorite" };
    }
  };

  const deleteLog = async (id: string) => {
    try {
      const res = await fetch(`/api/reading-logs/${id}`, {
        method: "DELETE",
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: result.error || "Failed to delete log" };
      }

      await fetchLogsAndSummary();
      return { success: true };
    } catch (err) {
      return { success: false, error: "Network error deleting log" };
    }
  };

  const clearFilters = () => {
    const reset = { genre: "", favorite: false, q: "" };
    setFilters(reset);
    fetchLogsAndSummary(reset);
  };

  const resetAll = () => {
    setLogs([]);
    setSummary(defaultSummary);
    setFilters({ genre: "", favorite: false, q: "" });
  };

  return (
    <ReadingLogContext.Provider
      value={{
        logs,
        summary,
        filters,
        loading,
        fetchLogsAndSummary,
        addLog,
        toggleFavorite,
        deleteLog,
        setFilters,
        clearFilters,
        resetAll,
      }}
    >
      {children}
    </ReadingLogContext.Provider>
  );
}

export function useReadingLog() {
  const context = useContext(ReadingLogContext);
  if (!context) {
    throw new Error("useReadingLog must be used within a ReadingLogProvider");
  }
  return context;
}

