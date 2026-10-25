"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Permissions, queryKeys } from "@/lib/api";

const ROWS: { key: keyof Permissions; title: string; hint: string; locked?: boolean }[] = [
  { key: "report_read", title: "Read my pathway report", hint: "Needed for the assistant to work.", locked: true },
  { key: "suggest_edits", title: "Suggest edits to my profile", hint: "The assistant proposes, you accept." },
  { key: "journal_read", title: "Read my reflections", hint: "Off by default. Your journal stays private." },
];

export default function TrustPage() {
  const queryClient = useQueryClient();
  const { data: permissions } = useQuery({ queryKey: queryKeys.permissions, queryFn: api.getPermissions });
  const { data: activity = [] } = useQuery({ queryKey: queryKeys.activity, queryFn: api.getActivity });

  const update = useMutation({
    mutationFn: (patch: Partial<Permissions>) => api.savePermissions(patch),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.permissions, data);
      queryClient.invalidateQueries({ queryKey: queryKeys.activity });
    },
  });

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <header>
        <h1 style={{ fontSize: 34 }}>Access & trust</h1>
      </header>

      <div className="card" style={{ display: "grid", gap: 14 }}>
        {ROWS.map((row) => (
          <label key={row.key} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <span style={{ display: "grid", gap: 2 }}>
              <strong>{row.title}</strong>
              <span className="muted" style={{ fontSize: 13 }}>{row.hint}</span>
            </span>
            <input
              type="checkbox"
              className="switch"
              checked={permissions?.[row.key] ?? false}
              disabled={row.locked || !permissions || update.isPending}
              onChange={(e) => update.mutate({ [row.key]: e.target.checked })}
              aria-label={row.title}
            />
          </label>
        ))}
      </div>

      <div className="card" style={{ display: "grid", gap: 10 }}>
        <strong>Activity log</strong>
        {activity.length === 0 && <p className="muted" style={{ margin: 0 }}>Nothing yet.</p>}
        {activity.map((a) => (
          <div key={a.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 14 }}>
            <span>{a.action}</span>
            <span className="muted">{new Date(a.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
