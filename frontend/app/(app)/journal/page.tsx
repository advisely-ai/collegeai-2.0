"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, type PromptKey, queryKeys } from "@/lib/api";

const PROMPTS: { key: PromptKey; text: string }[] = [
  { key: "reflect_1", text: "What did you do this week that made you lose track of time?" },
  { key: "reflect_2", text: "What's a problem you enjoyed solving, even if it was hard?" },
  { key: "reflect_3", text: "Who helped you grow, and how?" },
];

export default function JournalPage() {
  const queryClient = useQueryClient();
  const { data: entries = [] } = useQuery({ queryKey: queryKeys.journal, queryFn: api.getJournal });
  const [promptKey, setPromptKey] = useState<PromptKey>("reflect_1");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => api.saveJournal(promptKey, body),
    onSuccess: () => {
      setBody("");
      setError(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.journal });
      queryClient.invalidateQueries({ queryKey: queryKeys.activity });
    },
    onError: (e: Error) => setError(e.message),
  });

  const prompt = PROMPTS.find((p) => p.key === promptKey)!;

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <header>
        <h1 style={{ fontSize: 34 }}>Reflect</h1>
      </header>

      <div className="card" style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {PROMPTS.map((p, i) => (
            <button
              key={p.key}
              className="chip"
              aria-pressed={promptKey === p.key}
              onClick={() => setPromptKey(p.key)}
            >
              Prompt {i + 1}
            </button>
          ))}
        </div>
        <p style={{ margin: 0, fontWeight: 600 }}>{prompt.text}</p>
        <textarea
          className="field"
          style={{ minHeight: 140, padding: 14, resize: "vertical" }}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={4000}
          aria-label="Your reflection"
        />
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" onClick={() => save.mutate()} disabled={save.isPending || !body.trim()}>
          {save.isPending ? "Saving…" : "Save reflection"}
        </button>
      </div>

      {entries.map((e) => (
        <article key={e.id} className="card" style={{ display: "grid", gap: 6 }}>
          <span className="muted" style={{ fontSize: 13 }}>
            {new Date(e.created_at).toLocaleDateString()}
          </span>
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{e.body}</p>
        </article>
      ))}
    </section>
  );
}
