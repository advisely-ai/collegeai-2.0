export type Grade = "sophomore" | "junior" | "senior";
export type Goal = "major_idea" | "strengths" | "activities";
export type PromptKey = "reflect_1" | "reflect_2" | "reflect_3";

export type Profile = {
  grade: Grade | null;
  goals: Goal[];
  gpa: number | null;
  no_gpa: boolean;
  parent_name: string | null;
  parent_email: string | null;
  parent_invited: boolean;
  onboarded: boolean;
  updated_at?: string | null;
};

export type Journal = { id: number; prompt_key: PromptKey; body: string; created_at: string };
export type Permissions = { report_read: boolean; suggest_edits: boolean; journal_read: boolean };
export type Activity = { id: number; actor: string; action: string; created_at: string };

const BASE = "/api/v1";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      const detail = Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail;
      if (typeof detail === "string") message = detail.replace(/^Value error, /, "");
    } catch {
      /* keep default message */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getProfile: () => request<Profile>("/profile"),
  saveProfile: (p: Profile) =>
    request<Profile>("/profile", { method: "PUT", body: JSON.stringify(p) }),
  getJournal: () => request<Journal[]>("/journal"),
  saveJournal: (prompt_key: PromptKey, body: string) =>
    request<Journal>("/journal", { method: "POST", body: JSON.stringify({ prompt_key, body }) }),
  getPermissions: () => request<Permissions>("/permissions"),
  savePermissions: (p: Partial<Permissions>) =>
    request<Permissions>("/permissions", { method: "PUT", body: JSON.stringify(p) }),
  getActivity: () => request<Activity[]>("/activity"),
};

export const queryKeys = {
  profile: ["profile"] as const,
  journal: ["journal"] as const,
  permissions: ["permissions"] as const,
  activity: ["activity"] as const,
};
