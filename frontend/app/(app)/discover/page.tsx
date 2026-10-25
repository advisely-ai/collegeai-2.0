export default function DiscoverPage() {
  return (
    <section style={{ display: "grid", gap: 16 }}>
      <header>
        <h1 style={{ fontSize: 34 }}>Discover yourself</h1>
      </header>
      <div className="card" style={{ display: "grid", gap: 10 }}>
        <strong>Self-assessment</strong>
        <p className="muted" style={{ margin: 0 }}>
          Five short parts: interests, strengths, work style, values, and what energizes you. Your pathway report and
          majors come after that. This part is still being built.
        </p>
        <button className="btn" disabled>Coming next</button>
      </div>
    </section>
  );
}
