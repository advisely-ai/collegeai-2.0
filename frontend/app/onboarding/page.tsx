"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, type Goal, type Grade, type Profile, queryKeys } from "@/lib/api";

const STEPS = ["welcome", "grade", "goals", "gpa", "parent", "done"] as const;
type Step = (typeof STEPS)[number];

const GRADES: { value: Grade; label: string }[] = [
  { value: "sophomore", label: "10th grade (sophomore)" },
  { value: "junior", label: "11th grade (junior)" },
  { value: "senior", label: "12th grade (senior)" },
];

const GOALS: { value: Goal; label: string }[] = [
  { value: "major_idea", label: "Figure out a major or career idea" },
  { value: "strengths", label: "Understand my strengths" },
  { value: "activities", label: "Build a stronger activities story" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: saved } = useQuery({ queryKey: queryKeys.profile, queryFn: api.getProfile });

  const [stepIndex, setStepIndex] = useState(0);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [gpa, setGpa] = useState("");
  const [noGpa, setNoGpa] = useState(false);
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [inviteParent, setInviteParent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step: Step = STEPS[stepIndex];
  const progress = Math.round((stepIndex / (STEPS.length - 1)) * 100);

  const save = useMutation({
    mutationFn: (profile: Profile) => api.saveProfile(profile),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.profile, data);
      router.replace("/home");
    },
    onError: (e: Error) => setError(e.message),
  });

  function toggleGoal(goal: Goal) {
    setError(null);
    setGoals((current) => {
      if (current.includes(goal)) return current.filter((g) => g !== goal);
      if (current.length >= 3) {
        setError("Pick up to three goals. You can change them later.");
        return current;
      }
      return [...current, goal];
    });
  }

  function validate(): string | null {
    if (step === "grade" && !grade) return "Choose your grade to continue.";
    if (step === "goals" && goals.length === 0) return "Pick at least one goal.";
    if (step === "gpa" && !noGpa) {
      const value = Number(gpa);
      if (gpa.trim() === "" || Number.isNaN(value) || value < 0 || value > 4) {
        return "Enter a GPA between 0 and 4.0, or choose “I don't have one yet.”";
      }
    }
    if (step === "parent" && inviteParent) {
      if (!parentName.trim()) return "Add your parent or guardian's name.";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(parentEmail.trim())) {
        return "Enter a valid email address for them.";
      }
    }
    return null;
  }

  function next() {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    if (step === "done") return finish();
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function skipParent() {
    setError(null);
    setInviteParent(false);
    setStepIndex((i) => i + 1);
  }

  function finish() {
    save.mutate({
      grade,
      goals,
      gpa: noGpa || gpa.trim() === "" ? null : Number(gpa),
      no_gpa: noGpa,
      parent_name: inviteParent ? parentName.trim() : null,
      parent_email: inviteParent ? parentEmail.trim() : null,
      parent_invited: inviteParent,
      onboarded: true,
    });
  }

  if (saved?.onboarded) {
    router.replace("/home");
    return null;
  }

  return (
    <main className="app-shell narrow" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          className="chip"
          onClick={() => {
            setError(null);
            setStepIndex((i) => Math.max(i - 1, 0));
          }}
          disabled={stepIndex === 0}
          aria-label="Back"
          style={{ minHeight: 40 }}
        >
          Back
        </button>
        <div className="progress" style={{ flex: 1 }} aria-label={`Setup ${progress}% complete`}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <span className="muted" style={{ fontSize: 13 }}>
          {stepIndex + 1}/{STEPS.length}
        </span>
      </header>

      {step === "welcome" && (
        <section style={{ display: "grid", gap: 14, paddingTop: 24 }}>
          <p style={{ color: "var(--olive)", fontWeight: 700 }}>Welcome to CollegeAI</p>
          <h1 style={{ fontSize: 40, lineHeight: 1.05 }}>Let's find the version of you that fits college.</h1>
          <p className="muted">
            Setup takes about two minutes. You decide what the app sees, and you can change it anytime.
          </p>
        </section>
      )}

      {step === "grade" && (
        <section style={{ display: "grid", gap: 14 }}>
          <h2 style={{ fontSize: 28 }}>What grade are you in?</h2>
          {GRADES.map((g) => (
            <button
              key={g.value}
              className="chip"
              aria-pressed={grade === g.value}
              onClick={() => setGrade(g.value)}
              style={{ textAlign: "left", minHeight: 56 }}
            >
              {g.label}
            </button>
          ))}
        </section>
      )}

      {step === "goals" && (
        <section style={{ display: "grid", gap: 14 }}>
          <h2 style={{ fontSize: 28 }}>What do you want from this?</h2>
          <p className="muted" style={{ margin: 0 }}>Pick up to three.</p>
          {GOALS.map((g) => (
            <button
              key={g.value}
              className="chip"
              aria-pressed={goals.includes(g.value)}
              onClick={() => toggleGoal(g.value)}
              style={{ textAlign: "left", minHeight: 56 }}
            >
              {g.label}
            </button>
          ))}
        </section>
      )}

      {step === "gpa" && (
        <section style={{ display: "grid", gap: 14 }}>
          <h2 style={{ fontSize: 28 }}>What's your GPA?</h2>
          <p className="muted" style={{ margin: 0 }}>On a 4.0 scale. It stays private and you can skip it.</p>
          <input
            className="field"
            inputMode="decimal"
            placeholder="e.g. 3.6"
            value={gpa}
            disabled={noGpa}
            onChange={(e) => setGpa(e.target.value)}
            aria-label="GPA on a 4.0 scale"
          />
          <label style={{ display: "flex", gap: 10, alignItems: "center", minHeight: 44 }}>
            <input
              type="checkbox"
              checked={noGpa}
              onChange={(e) => {
                setNoGpa(e.target.checked);
                setError(null);
              }}
            />
            I don't have one yet
          </label>
        </section>
      )}

      {step === "parent" && (
        <section style={{ display: "grid", gap: 14 }}>
          <h2 style={{ fontSize: 28 }}>Want a parent in the loop?</h2>
          <p className="muted" style={{ margin: 0 }}>
            A parent or guardian can view your progress. You control what they see.
          </p>
          {!inviteParent ? (
            <>
              <button className="btn" onClick={() => setInviteParent(true)}>Invite a parent</button>
              <button className="btn btn-ghost" onClick={skipParent}>Skip for now</button>
            </>
          ) : (
            <>
              <input
                className="field"
                placeholder="Parent or guardian's name"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                aria-label="Parent or guardian name"
              />
              <input
                className="field"
                type="email"
                placeholder="Their email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                aria-label="Parent or guardian email"
              />
              <button className="btn btn-ghost" onClick={skipParent}>Skip this step</button>
            </>
          )}
        </section>
      )}

      {step === "done" && (
        <section style={{ display: "grid", gap: 14, paddingTop: 24 }}>
          <h1 style={{ fontSize: 40, lineHeight: 1.05 }}>You're set. Let's go.</h1>
          <p className="muted">Start with a short self-assessment on the Discover tab.</p>
        </section>
      )}

      {error && <p className="error" role="alert">{error}</p>}

      {step !== "parent" && (
        <div style={{ marginTop: "auto", display: "grid", gap: 10 }}>
          <button className="btn" onClick={next} disabled={save.isPending}>
            {step === "done" ? (save.isPending ? "Saving…" : "Open my dashboard") : "Continue"}
          </button>
        </div>
      )}
    </main>
  );
}
