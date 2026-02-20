export default function Stage1_Skeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "#f6f6fb" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <div
          style={{
            background: "white",
            border: "1px solid #e6e6ee",
            borderRadius: 18,
            padding: 18,
            boxShadow: "0 10px 30px rgba(0,0,0,0.04)"
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 900 }}>Typing Arena</div>
          <div style={{ marginTop: 8, opacity: 0.75 }}>
            Stage 1/4 • App is running ✅
          </div>

          <div style={{ marginTop: 16, lineHeight: 1.6 }}>
            <div>What this stage demonstrates:</div>
            <ul>
              <li>React project created & running (Vite)</li>
              <li>Entry point renders a React component</li>
              <li>We’re ready to build UI step-by-step</li>
            </ul>
          </div>

          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>
            Next: we’ll create the UI layout using JSX.
          </div>
        </div>
      </div>
    </div>
  );
}
