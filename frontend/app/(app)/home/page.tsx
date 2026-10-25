"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api, queryKeys } from "@/lib/api";

export default function HomePage() {
  const { data: profile } = useQuery({ queryKey: queryKeys.profile, queryFn: api.getProfile });
  const { data: journal } = useQuery({ queryKey: queryKeys.journal, queryFn: api.getJournal });

  const checks = [
    { label: "Set up your profile", done: !!profile?.onboarded },
    { label: "Write a first reflection", done: (journal?.length ?? 0) > 0 },
    { label: "Take the self-assessment", done: false },
  ];
  const doneCount = checks.filter((c) => c.done).length;

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <header>
        <h1 style={{ fontSize: 34 }}>Your path, step by step</h1>
      </header>

      <div className="cards">
      <div className="card" style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <strong>Getting started</strong>
          <span className="muted">{doneCount}/{checks.length}</span>
        </div>
        <div className="progress"><span style={{ width: `${(doneCount / checks.length) * 100}%` }} /></div>
        {checks.map((c) => (
          <div key={c.label} style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="check" data-done={c.done} aria-hidden />
            <span style={{ textDecoration: c.done ? "line-through" : "none" }}>{c.label}</span>
          </div>
        ))}
      </div>

      <Link href="/discover" className="card" style={{ textDecoration: "none", color: "inherit" }}>
        <strong>Discover yourself</strong>
        <p className="muted" style={{ margin: "6px 0 0" }}>Find strengths and majors that fit how you think.</p>
      </Link>
      <Link href="/journal" className="card" style={{ textDecoration: "none", color: "inherit" }}>
        <strong>Reflect</strong>
        <p className="muted" style={{ margin: "6px 0 0" }}>Private notes that feed your story. Only you see them.</p>
      </Link>
      <div className="card muted">
        <strong>College list</strong>
        <p className="muted" style={{ margin: "6px 0 0" }}>Coming soon.</p>
      </div>
      </div>
    </section>
  );
}
