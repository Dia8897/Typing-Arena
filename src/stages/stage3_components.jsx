import React from "react";

function PromptRenderer({ prompt, typed }) {
  const spans = [];
  const n = prompt.length;
  const t = typed.length;

  for (let i = 0; i < n; i++) {
    const expected = prompt[i];
    const got = i < t ? typed[i] : null;

    let style = {};
    if (got === null) {
      if (i === t) style = { textDecoration: "underline", textDecorationThickness: 2 };
      else style = { opacity: 0.75 };
    } else if (got === expected) {
      style = {};
    } else {
      style = {
        textDecoration: "underline",
        textDecorationColor: "#c1121f",
        textDecorationThickness: 3
      };
    }

    spans.push(
      <span key={i} style={style}>
        {expected}
      </span>
    );
  }

  return (
    <div style={{ padding: 12, borderRadius: 16, background: "#f4f4f7", lineHeight: 1.6 }}>
      {spans}
    </div>
  );
}

function Stat({ label, value, big }) {
  return (
    <div style={{ border: "1px solid #e6e6ee", borderRadius: 16, padding: 10, background: "white" }}>
      <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: big ? 22 : 16, fontWeight: 900, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function Bar({ value }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div style={{ height: 10, borderRadius: 999, background: "#e9e9ef", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: "#111" }} />
    </div>
  );
}

export default function Stage3_Components() {
  const prompt = "React components are small reusable blocks that make UI easy to build.";
  const typed = "React components are small reusa"; // fake typed text

  return (
    <div style={{ minHeight: "100vh", background: "#f6f6fb" }}>
      <div style={{ maxWidth: 1150, margin: "0 auto", padding: 18 }}>
        <header style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 24, fontWeight: 900 }}>Typing Arena</div>
          <div style={{ fontSize: 13, opacity: 0.75 }}>
            Stage 3/4 • Components + props (static demo)
          </div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.9fr", gap: 14 }}>
          <section style={cardStyle}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>PromptRenderer Component</div>
            <PromptRenderer prompt={prompt} typed={typed} />

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
              Next: we’ll add event management (onChange), state (useState), timer (useEffect),
              and make everything update live.
            </div>
          </section>

          <aside style={cardStyle}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Reusable Stat + Bar</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Stat label="WPM" value="62.5" big />
              <Stat label="Accuracy" value="96.0%" big />
              <Stat label="Progress" value="45%" />
              <Stat label="Streak" value="12 (best 18)" />
              <Stat label="Mistakes" value="3" />
              <Stat label="Backspaces" value="5" />
            </div>

            <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7, fontWeight: 800 }}>
              Accuracy bar
            </div>
            <Bar value={96} />

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7, fontWeight: 800 }}>
              Progress bar
            </div>
            <Bar value={45} />
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
