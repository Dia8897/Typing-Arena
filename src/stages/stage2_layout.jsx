import React from "react";
import "../index.css";

/**
 * STAGE 1: Base Shell (Installation + React entry point + "App is running")
 * This is the wrapper used by all next stages.
 */
import Stage1_Shell from "./Stage1_Shell";

/**
 * STAGE 2: Creating a React app (JSX layout)
 * Uses Stage 1 and adds the grid + cards layout.
 */
export default function Stage2_Layout({ title, subtitle, headerRight, left, right }) {
  return (
    <Stage1_Shell title={title} subtitle={subtitle} headerRight={headerRight}>
      <div className="grid">
        <section className="card">{left}</section>
        <aside className="card">{right}</aside>
      </div>
    </Stage1_Shell>
  );
}