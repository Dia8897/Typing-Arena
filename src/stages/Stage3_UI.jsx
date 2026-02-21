import React from "react";
import Stage2_Layout from "./Stage2_Layout";

/**
 * STAGE 3: Components (reusable UI building blocks)
 * Uses Stage 2 layout + exports components used by Stage 4.
 */

export function PromptRenderer({ prompt, typed }) {
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

  return <div className="prompt">{spans}</div>;
}

export function Stat({ label, value, big }) {
  return (
    <div className="stat">
      <div className="statLabel">{label}</div>
      <div className={`statValue ${big ? "big" : ""}`}>{value}</div>
    </div>
  );
}

export function Bar({ value }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="bar">
      <div className="barFill" style={{ width: `${pct}%` }} />
    </div>
  );
}

/**
 * Wrapper that keeps Stage 2 layout but lets Stage 4 provide left/right content.
 */
export default function Stage3_UI({ title, subtitle, headerRight, left, right }) {
  return (
    <Stage2_Layout
      title={title}
      subtitle={subtitle}
      headerRight={headerRight}
      left={left}
      right={right}
    />
  );
}