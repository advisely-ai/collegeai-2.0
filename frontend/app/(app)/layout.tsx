"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { api, queryKeys } from "@/lib/api";

const TABS = [
  { href: "/home", label: "Home", icon: "◎" },
  { href: "/discover", label: "Discover", icon: "✦" },
  { href: "/profile", label: "Profile", icon: "▣" },
  { href: "/journal", label: "Reflect", icon: "✎" },
  { href: "/trust", label: "Trust", icon: "⛨" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: profile, isError, error, refetch } = useQuery({
    queryKey: queryKeys.profile,
    queryFn: api.getProfile,
  });

  // Every launch: until setup is finished, the welcome flow comes first.
  useEffect(() => {
    if (profile && !profile.onboarded) router.replace("/onboarding");
  }, [profile, router]);

  if (isError) {
    return (
      <main className="app-shell narrow">
        <div className="card" style={{ display: "grid", gap: 10 }}>
          <h2>We couldn't reach your data</h2>
          <p className="muted" style={{ margin: 0 }}>{(error as Error).message}</p>
          <button className="btn" onClick={() => refetch()}>Try again</button>
        </div>
      </main>
    );
  }

  if (!profile || !profile.onboarded) {
    return <main className="app-shell narrow"><p className="muted">Loading…</p></main>;
  }

  return (
    <div className="app-frame">
      <aside className="sidebar" aria-label="Main">
        <div className="sidebar-brand">CollegeAI</div>
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="sidebar-link"
            aria-current={pathname === tab.href ? "page" : undefined}
          >
            <span aria-hidden>{tab.icon}</span>
            {tab.label}
          </Link>
        ))}
      </aside>
      <main className="app-shell">{children}</main>
      <nav className="tabbar" aria-label="Main">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="tab"
            aria-current={pathname === tab.href ? "page" : undefined}
          >
            <span aria-hidden style={{ fontSize: 18 }}>{tab.icon}</span>
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
