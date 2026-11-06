"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useReadingLog } from "@/context/ReadingLogContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const GENRES = ["Fiction", "Non-Fiction", "Sci-Fi", "Biography", "Other"];

function isFutureDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return false;
  }
  const targetDate = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  const now = new Date();
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const todayUtc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999);
  const maxToday = Math.max(todayLocal.getTime(), todayUtc.getTime());
  return targetDate.getTime() > maxToday;
}

export default function ReadingLogsPage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);

  // Form states
  const [bookTitle, setBookTitle] = useState("");
  const [minutesRead, setMinutesRead] = useState("");
  const [genre, setGenre] = useState("");
  const [note, setNote] = useState("");
  const [readOn, setReadOn] = useState("");

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    logs,
    summary,
    filters,
    fetchLogsAndSummary,
    addLog,
    toggleFavorite,
    deleteLog,
    setFilters,
    clearFilters,
  } = useReadingLog();

  // Authentication check:
  // "While the app is still finding out whether someone is logged in,
  // nothing from this page is shown (no flash of content, no wrong redirect)."
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        if (isMounted) {
          setAuthChecking(false);
          fetchLogsAndSummary();
        }
      } catch {
        router.replace("/login");
      }
    }
    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router, fetchLogsAndSummary]);

  // Validation functions for form fields
  const getBookTitleError = (val: string) => {
    if (!val || !val.trim()) return "Book title is required";
    if (val.trim().length > 80) return "Book title must be at most 80 characters";
    return "";
  };

  const getMinutesError = (val: string) => {
    if (val === undefined || val === null || val === "" || isNaN(Number(val))) {
      return "Minutes read is required";
    }
    const num = Number(val);
    if (!Number.isInteger(num) || num <= 0) {
      return "Minutes read must be a positive number";
    }
    return "";
  };

  const getGenreError = (val: string) => {
    if (!val || val === "Choose genre" || val.trim() === "") return "Please choose a genre";
    if (!GENRES.includes(val.trim())) return "Invalid genre";
    return "";
  };

  const getDateError = (val: string) => {
    if (!val || !val.trim()) return "Date is required";
    if (isFutureDate(val.trim())) return "Date cannot be in the future";
    return "";
  };

  const bookTitleError = getBookTitleError(bookTitle);
  const minutesError = getMinutesError(minutesRead);
  const genreError = getGenreError(genre);
  const dateError = getDateError(readOn);

  // Submit Handler for Adding a Session
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setFormError(null);
    setFormSuccess(null);

    if (bookTitleError || minutesError || genreError || dateError) {
      return;
    }

    setSubmitting(true);
    const result = await addLog({
      bookTitle: bookTitle.trim(),
      minutesRead: Number(minutesRead),
      genre: genre.trim(),
      note: note.trim(),
      readOn: readOn.trim(),
    });

    setSubmitting(false);

    if (!result.success) {
      setFormError(result.error || "Failed to add reading session");
    } else {
      setFormSuccess("Reading session added");
      setBookTitle("");
      setMinutesRead("");
      setGenre("");
      setNote("");
      setReadOn("");
      setFormSubmitted(false);
    }
  };

  // Filter handlers
  const handleGenreFilterChange = (newGenre: string) => {
    const updated = { ...filters, genre: newGenre };
    setFilters(updated);
    fetchLogsAndSummary(updated);
  };

  const handleFavoriteFilterChange = (newFav: boolean) => {
    const updated = { ...filters, favorite: newFav };
    setFilters(updated);
    fetchLogsAndSummary(updated);
  };

  const handleSearchChange = (newQ: string) => {
    const updated = { ...filters, q: newQ };
    setFilters(updated);
    fetchLogsAndSummary(updated);
  };

  if (authChecking) {
    return null;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2" data-testid="reading-logs-page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Reading Sessions
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Log, filter, and review all your reading sessions and genre statistics.
          </p>
        </div>
      </div>

      {/* Responsive layout: 
          At 375px: full single column (no horizontal scroll)
          At 1280px (xl): form & summary can sit next to list
      */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column (xl: 5 columns): Form & Summary */}
        <div className="space-y-8 xl:col-span-5">
          {/* Part A: Add Reading Session Form */}
          <Card className="border-border bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-foreground">
                Add a reading session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSubmit} noValidate data-testid="reading-log-form" className="space-y-4">
                {/* Global API Form Error */}
                {formError && (
                  <div
                    className="p-3 text-xs rounded-lg bg-red-50 text-destructive border border-red-200 font-medium"
                    data-testid="error-reading-log"
                  >
                    {formError}
                  </div>
                )}

                {/* Form Success Message */}
                {formSuccess && (
                  <div
                    className="p-3 text-xs rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium"
                    data-testid="reading-log-success"
                  >
                    {formSuccess}
                  </div>
                )}

                {/* Book Title */}
                <div className="space-y-1">
                  <Label htmlFor="bookTitle" className="text-xs font-semibold text-foreground">
                    Book title
                  </Label>
                  <Input
                    id="bookTitle"
                    name="bookTitle"
                    type="text"
                    placeholder="e.g. Atomic Habits"
                    value={bookTitle}
                    onChange={(e) => {
                      setBookTitle(e.target.value);
                      setFormError(null);
                    }}
                    className="h-9 text-sm"
                    data-testid="input-book-title"
                  />
                  {formSubmitted && bookTitleError && (
                    <p className="text-xs text-destructive font-medium mt-1" data-testid="error-book-title">
                      {bookTitleError}
                    </p>
                  )}
                </div>

                {/* Minutes Read & Genre */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="minutesRead" className="text-xs font-semibold text-foreground">
                      Minutes read
                    </Label>
                    <Input
                      id="minutesRead"
                      name="minutesRead"
                      type="number"
                      placeholder="e.g. 40"
                      value={minutesRead}
                      onChange={(e) => {
                        setMinutesRead(e.target.value);
                        setFormError(null);
                      }}
                      className="h-9 text-sm"
                      data-testid="input-minutes"
                    />
                    {formSubmitted && minutesError && (
                      <p className="text-xs text-destructive font-medium mt-1" data-testid="error-minutes">
                        {minutesError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="genre" className="text-xs font-semibold text-foreground">
                      Genre
                    </Label>
                    <select
                      id="genre"
                      name="genre"
                      value={genre}
                      onChange={(e) => {
                        setGenre(e.target.value);
                        setFormError(null);
                      }}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      data-testid="input-genre"
                    >
                      <option value="">Choose genre</option>
                      <option value="Fiction">Fiction</option>
                      <option value="Non-Fiction">Non-Fiction</option>
                      <option value="Sci-Fi">Sci-Fi</option>
                      <option value="Biography">Biography</option>
                      <option value="Other">Other</option>
                    </select>
                    {formSubmitted && genreError && (
                      <p className="text-xs text-destructive font-medium mt-1" data-testid="error-genre">
                        {genreError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <Label htmlFor="readOn" className="text-xs font-semibold text-foreground">
                    Date
                  </Label>
                  <Input
                    id="readOn"
                    name="readOn"
                    type="date"
                    value={readOn}
                    onChange={(e) => {
                      setReadOn(e.target.value);
                      setFormError(null);
                    }}
                    className="h-9 text-sm"
                    data-testid="input-date"
                  />
                  {formSubmitted && dateError && (
                    <p className="text-xs text-destructive font-medium mt-1" data-testid="error-date">
                      {dateError}
                    </p>
                  )}
                </div>

                {/* Optional Note */}
                <div className="space-y-1">
                  <Label htmlFor="note" className="text-xs font-semibold text-foreground">
                    Note (optional)
                  </Label>
                  <Input
                    id="note"
                    name="note"
                    type="text"
                    placeholder="Chapter, key insight, or thoughts..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="h-9 text-sm"
                    data-testid="input-note"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary hover:bg-[#8F2620] text-primary-foreground font-semibold h-9 text-sm shadow-sm"
                  data-testid="btn-add-reading-log"
                >
                  {submitting ? "Saving..." : "Add Reading Log"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Part C (Summary): Live Minutes Read & Genre Breakdown */}
          <Card className="border-border bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-foreground">
                Reading Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-muted/40 border border-border">
                <div className="space-y-0.5">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Sessions
                  </p>
                  <p className="text-xl font-black text-foreground" data-testid="reading-log-count">
                    {summary.count}
                  </p>
                </div>
                <div className="space-y-0.5 border-x border-border/80">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Favorites
                  </p>
                  <p className="text-xl font-black text-primary" data-testid="favorite-count">
                    {summary.favoriteCount}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Total Min
                  </p>
                  <p className="text-xl font-black text-foreground" data-testid="total-minutes">
                    {summary.totalMinutes}
                  </p>
                </div>
              </div>

              {/* Genre Breakdown */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Breakdown by Genre
                </p>
                <div className="space-y-1.5" data-testid="genre-breakdown">
                  {summary.breakdown.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-1">No genre data available</p>
                  ) : (
                    summary.breakdown.map((row) => (
                      <div
                        key={row.genre}
                        className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 border border-secondary text-xs"
                        data-testid="breakdown-row"
                      >
                        <span className="font-semibold text-secondary-foreground" data-testid="breakdown-name">
                          {row.genre}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground" data-testid="breakdown-count">
                            {row.count}
                          </span>
                          <span className="font-bold text-primary" data-testid="breakdown-total">
                            {row.total}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (xl: 7 columns): Filters and List of Sessions */}
        <div className="space-y-6 xl:col-span-7">
          {/* Part C: Filters and Search Controls */}
          <Card className="border-border bg-white shadow-sm p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search box */}
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search book title or note..."
                  value={filters.q}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="h-9 text-xs"
                  data-testid="search-input"
                />
              </div>

              {/* Genre Filter */}
              <div className="w-full sm:w-36">
                <select
                  value={filters.genre}
                  onChange={(e) => handleGenreFilterChange(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  data-testid="filter-genre"
                >
                  <option value="">All</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Biography">Biography</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Favorites Checkbox */}
              <div className="flex items-center gap-2 px-1">
                <input
                  id="filter-favorite-checkbox"
                  type="checkbox"
                  checked={filters.favorite}
                  onChange={(e) => handleFavoriteFilterChange(e.target.checked)}
                  className="w-4 h-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                  data-testid="filter-favorite"
                />
                <label
                  htmlFor="filter-favorite-checkbox"
                  className="text-xs font-semibold text-foreground cursor-pointer select-none whitespace-nowrap"
                >
                  Favorites only
                </label>
              </div>

              {/* Clear button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-9 text-xs font-medium"
                data-testid="btn-clear-filters"
              >
                Clear
              </Button>
            </div>
          </Card>

          {/* Part B: The List */}
          {logs.length === 0 ? (
            <div
              className="p-12 text-center rounded-2xl bg-white border border-border shadow-sm space-y-2"
              data-testid="reading-logs-empty"
            >
              <div className="text-3xl mb-1">📚</div>
              <h3 className="font-bold text-base text-foreground">No reading sessions found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No sessions match your search or filter criteria. Add a new session using the form!
              </p>
            </div>
          ) : (
            <div className="space-y-3" data-testid="reading-log-list">
              {logs.map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-xl bg-white border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                  data-testid="reading-log-item"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className="font-bold text-base text-foreground truncate"
                        data-testid="reading-log-title"
                      >
                        {session.bookTitle}
                      </h4>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary text-secondary-foreground"
                        data-testid="reading-log-genre"
                      >
                        {session.genre}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        <strong className="text-foreground font-semibold" data-testid="reading-log-minutes">
                          {session.minutesRead}
                        </strong>{" "}
                        minutes
                      </span>
                      <span>•</span>
                      <span data-testid="reading-log-date">{session.readOn}</span>
                      {session.note && (
                        <>
                          <span>•</span>
                          <span className="italic truncate max-w-xs">&ldquo;{session.note}&rdquo;</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions: Favorite Toggle & Delete */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      aria-pressed={session.favorite ? "true" : "false"}
                      onClick={() => toggleFavorite(session.id)}
                      className={`h-8 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        session.favorite
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-white text-muted-foreground border-border hover:bg-muted"
                      }`}
                      data-testid="btn-toggle-favorite"
                    >
                      <span>★</span>
                      <span>{session.favorite ? "Favorited" : "Favorite"}</span>
                    </button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteLog(session.id)}
                      className="h-8 px-2.5 text-xs text-destructive hover:bg-red-50 hover:text-destructive"
                      data-testid="btn-delete-reading-log"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

