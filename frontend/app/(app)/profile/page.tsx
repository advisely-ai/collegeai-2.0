"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api, type Goal, type Profile, queryKeys } from "@/lib/api";

const GOAL_LABELS: Record<Goal, string> = {
  major_idea: "Major or career idea",
  strengths: "Understanding my strengths",
  activities: "Activities story",
};

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: queryKeys.profile, queryFn: api.getProfile });
  const [gpa, setGpa] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) setGpa(data.gpa?.toString() ?? "");
  }, [data]);

  const save = useMutation({
    mutationFn: (next: Profile) => api.saveProfile(next),
    onSuccess: (saved) => {
      queryClient.setQueryData(queryKeys.profile, saved);
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  if (!data) return <p className="muted">Loading…</p>;

  function saveGpa() {
    const value = Number(gpa);
    if (gpa.trim() === "" || Number.isNaN(value) || value < 0 || value > 4) {
      setError("Enter a GPA between 0 and 4.0.");
      return;
    }
    save.mutate({ ...data!, gpa: value, no_gpa: false });
  }

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <header>
        <p className="muted" style={{ margin: 0 }}>Your story</p>
        <h1 style={{ fontSize: 34 }}>Profile</h1>
      </header>

      <div className="card" style={{ display: "grid", gap: 10 }}>
        <strong>Academics</strong>
        <p className="muted" style={{ margin: 0 }}>
          Grade: {data.grade ? data.grade : "not set"}
        </p>
        <label style={{ display: "grid", gap: 6 }}>
          <span className="muted" style={{ fontSize: 14 }}>GPA (4.0 scale)</span>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="field"
              inputMode="decimal"
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
              aria-label="GPA"
            />
            <button className="btn" onClick={saveGpa} disabled={save.isPending}>Save</button>
          </div>
        </label>
        {error && <p className="error" role="alert">{error}</p>}
      </div>

      <div className="card" style={{ display: "grid", gap: 8 }}>
        <strong>Goals</strong>
        {data.goals.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>None yet.</p>
        ) : (
          data.goals.map((g) => <span key={g}>• {GOAL_LABELS[g]}</span>)
        )}
      </div>

      <div className="card" style={{ opacity: 0.7 }}>
        <strong>College list</strong>
        <p className="muted" style={{ margin: "6px 0 0" }}>Coming soon.</p>
      </div>
    </section>
  );
}
