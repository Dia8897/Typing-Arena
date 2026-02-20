export default function Stage2_Layout() {
  return (
    <div style={{ minHeight: "100vh", background: "#f6f6fb" }}>
      <div style={{ maxWidth: 1150, margin: "0 auto", padding: 18 }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 14
          }}
        >
          <div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>Typing Arena</div>
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              Stage 2/4 • JSX layout & page structure
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid #e6e6ee",
                background: "white",
                fontWeight: 800
              }}
            >
              Round: 15s
            </div>
            <button
              type="button"
              style={{
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid #e6e6ee",
                background: "white",
                fontWeight: 800
              }}
            >
              New prompt
            </button>
          </div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.9fr", gap: 14 }}>
          <section style={cardStyle}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Prompt + Input</div>

            <div style={placeholderBox}>
              Prompt will appear here (highlighted while typing)
            </div>

            <div style={{ marginTop: 10 }}>
              <textarea
                disabled
                placeholder="Typing input goes here..."
                style={{
                  width: "100%",
                  minHeight: 140,
                  resize: "none",
                  padding: 12,
                  borderRadius: 16,
                  border: "1px solid #e6e6ee",
                  outline: "none",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                }}
              />
            </div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
              Next: we’ll convert repeated UI blocks into reusable React components.
            </div>
          </section>

          <aside style={cardStyle}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Live Dashboard</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={smallCard}>WPM</div>
              <div style={smallCard}>Accuracy</div>
              <div style={smallCard}>Progress</div>
              <div style={smallCard}>Streak</div>
              <div style={smallCard}>Mistakes</div>
              <div style={smallCard}>Backspaces</div>
            </div>

            <div style={{ marginTop: 14, fontWeight: 900 }}>Leaderboard</div>
            <div style={{ marginTop: 10, opacity: 0.75, fontSize: 13 }}>
              Scores will show here (stored locally).
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "white",
  border: "1px solid #e6e6ee",
  borderRadius: 18,
  padding: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,0.04)"
};

const placeholderBox = {
  padding: 12,
  borderRadius: 16,
  background: "#f4f4f7",
  lineHeight: 1.6
};

const smallCard = {
  border: "1px solid #e6e6ee",
  borderRadius: 16,
  padding: 10,
  background: "white",
  fontWeight: 800,
  opacity: 0.8
};
