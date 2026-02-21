// import React, { useEffect, useMemo, useRef, useState } from "react";
// import "./index.css";

// /**
//  * Single-player Typing Arena (Competition-ready)
//  * - Live stats (WPM/Accuracy/Streak/Progress)
//  * - Short rounds (15/20/30 sec)
//  * - Instant results + local leaderboard (Top 10)
//  * - Copy result for sharing
//  */

// const PROMPTS = [
//   "React makes interfaces feel alive by updating the UI instantly when state changes.",
//   "Speed is cool, but accuracy wins. Smooth is fast, and fast is smooth.",
//   "Events drive everything: each keypress updates state, and state updates the screen.",
//   "Small components, clear props, and simple state make apps easy to scale.",
//   "Debugging is detective work: observe, hypothesize, test, and iterate.",
//   "Great UI gives feedback: progress, errors, and results change in real time.",
//   "Consistency beats bursts. Type steady, minimize mistakes, and keep a rhythm.",
//   "Ship fast, learn faster. Measure results, improve, and deploy with confidence.",
//   "A clean interface is not decoration; it is clarity, flow, and reduced friction.",
//   "In real projects, being accurate under time pressure matters more than raw speed."
// ];

// const DURATIONS = [15, 20, 30]; // good for demos

// const LS_KEY = "typing_arena_leaderboard_v1";

// function pickPrompt() {
//   return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
// }

// function clamp(n, a, b) {
//   return Math.max(a, Math.min(b, n));
// }

// function round1(n) {
//   return Math.round(n * 10) / 10;
// }

// function computeWPM(correctChars, elapsedSeconds) {
//   const minutes = elapsedSeconds / 60;
//   if (minutes <= 0) return 0;
//   // 5 chars ≈ 1 word
//   return (correctChars / 5) / minutes;
// }

// function accuracyPct(correct, totalTyped) {
//   if (totalTyped <= 0) return 100;
//   return (correct / totalTyped) * 100;
// }

// function scoreFormula({ correctChars, mistakes, wpm, accuracy }) {
//   // Simple, fair competition score:
//   // reward correct typing, penalize mistakes, lightly weight WPM + accuracy.
//   return correctChars * 2 - mistakes * 3 + wpm * 0.5 + accuracy * 0.2;
// }

// function loadLeaderboard() {
//   try {
//     const raw = localStorage.getItem(LS_KEY);
//     if (!raw) return [];
//     const data = JSON.parse(raw);
//     if (!Array.isArray(data)) return [];
//     return data;
//   } catch {
//     return [];
//   }
// }

// function saveLeaderboard(entries) {
//   localStorage.setItem(LS_KEY, JSON.stringify(entries));
// }

// function PromptRenderer({ prompt, typed }) {
//   const spans = [];
//   const n = prompt.length;
//   const t = typed.length;

//   for (let i = 0; i < n; i++) {
//     const expected = prompt[i];
//     const got = i < t ? typed[i] : null;

//     let style = {};
//     if (got === null) {
//       // not typed yet
//       if (i === t) style = { textDecoration: "underline", textDecorationThickness: 2 };
//       else style = { opacity: 0.75 };
//     } else if (got === expected) {
//       style = {};
//     } else {
//       style = {
//         textDecoration: "underline",
//         textDecorationColor: "#c1121f",
//         textDecorationThickness: 3
//       };
//     }

//     spans.push(
//       <span key={i} style={style}>
//         {expected}
//       </span>
//     );
//   }

//   return <div className="prompt">{spans}</div>;
// }

// function Stat({ label, value, big }) {
//   return (
//     <div className="stat">
//       <div className="statLabel">{label}</div>
//       <div className={`statValue ${big ? "big" : ""}`}>{value}</div>
//     </div>
//   );
// }

// function Bar({ value }) {
//   const pct = clamp(value, 0, 100);
//   return (
//     <div className="bar">
//       <div className="barFill" style={{ width: `${pct}%` }} />
//     </div>
//   );
// }

// export default function App() {
//   const inputRef = useRef(null);

//   const [duration, setDuration] = useState(15);
//   const [prompt, setPrompt] = useState(() => pickPrompt());

//   const [phase, setPhase] = useState("READY"); // READY | RUNNING | DONE
//   const [startAt, setStartAt] = useState(null); // timestamp (ms)
//   const [elapsed, setElapsed] = useState(0);
//   const [timeLeft, setTimeLeft] = useState(duration);

//   const [typed, setTyped] = useState("");
//   const [backspaces, setBackspaces] = useState(0);

//   const [leaderboard, setLeaderboard] = useState(() => loadLeaderboard());

//   // Derived stats (recomputed live)
//   const derived = useMemo(() => {
//     let correct = 0;
//     let wrong = 0;

//     const n = Math.min(prompt.length, typed.length);
//     let currentStreak = 0;
//     let bestStreak = 0;

//     for (let i = 0; i < n; i++) {
//       if (typed[i] === prompt[i]) {
//         correct++;
//         currentStreak++;
//         bestStreak = Math.max(bestStreak, currentStreak);
//       } else {
//         wrong++;
//         currentStreak = 0;
//       }
//     }

//     if (typed.length > prompt.length) wrong += (typed.length - prompt.length);

//     const acc = accuracyPct(correct, typed.length);
//     const wpm = computeWPM(correct, Math.max(elapsed, 1)); // avoid div by zero
//     const progress = Math.min(100, Math.round((typed.length / prompt.length) * 100));

//     return {
//       correctChars: correct,
//       mistakes: wrong,
//       accuracy: acc,
//       wpm,
//       streak: currentStreak,
//       bestStreak,
//       progress
//     };
//   }, [prompt, typed, elapsed]);

//   // Timer tick while running
//   useEffect(() => {
//     if (phase !== "RUNNING" || !startAt) return;

//     const id = setInterval(() => {
//       const now = Date.now();
//       const e = Math.floor((now - startAt) / 1000);
//       const left = Math.max(0, duration - e);
//       setElapsed(e);
//       setTimeLeft(left);

//       if (left === 0) {
//         setPhase("DONE");
//       }
//     }, 100);

//     return () => clearInterval(id);
//   }, [phase, startAt, duration]);

//   // When duration changes in READY, sync timeLeft
//   useEffect(() => {
//     if (phase === "READY") {
//       setTimeLeft(duration);
//       setElapsed(0);
//     }
//   }, [duration, phase]);

//   // Auto focus input when running/ready
//   useEffect(() => {
//     if (phase !== "DONE") inputRef.current?.focus();
//   }, [phase]);

//   function reset(newPrompt = true) {
//     setPhase("READY");
//     setStartAt(null);
//     setElapsed(0);
//     setTimeLeft(duration);
//     setTyped("");
//     setBackspaces(0);
//     if (newPrompt) setPrompt(pickPrompt());
//     setTimeout(() => inputRef.current?.focus(), 0);
//   }

//   function startIfNeeded() {
//     if (phase === "READY") {
//       setPhase("RUNNING");
//       setStartAt(Date.now());
//     }
//   }

//   function onChangeValue(next) {
//     // Start on first interaction
//     startIfNeeded();

//     // Count backspaces (rough but effective)
//     if (next.length < typed.length) setBackspaces((b) => b + (typed.length - next.length));
//     setTyped(next);
//   }

//   function submitScore(name) {
//     const finalElapsed = Math.max(1, elapsed || duration); // fallback
//     const finalWpm = computeWPM(derived.correctChars, finalElapsed);
//     const finalAcc = accuracyPct(derived.correctChars, typed.length);
//     const score = scoreFormula({
//       correctChars: derived.correctChars,
//       mistakes: derived.mistakes,
//       wpm: finalWpm,
//       accuracy: finalAcc
//     });

//     const entry = {
//       id: crypto?.randomUUID?.() || String(Date.now()),
//       name: (name || "Anonymous").slice(0, 18),
//       duration,
//       wpm: round1(finalWpm),
//       accuracy: round1(finalAcc),
//       correctChars: derived.correctChars,
//       mistakes: derived.mistakes,
//       score: round1(score),
//       at: new Date().toISOString()
//     };

//     const next = [entry, ...leaderboard]
//       .sort((a, b) => b.score - a.score)
//       .slice(0, 10);

//     setLeaderboard(next);
//     saveLeaderboard(next);
//     return entry;
//   }

//   function clearLeaderboard() {
//     setLeaderboard([]);
//     saveLeaderboard([]);
//   }

//   const finalStats = useMemo(() => {
//     const finalElapsed = Math.max(1, elapsed || duration);
//     const finalWpm = computeWPM(derived.correctChars, finalElapsed);
//     const finalAcc = accuracyPct(derived.correctChars, typed.length);
//     const finalScore = scoreFormula({
//       correctChars: derived.correctChars,
//       mistakes: derived.mistakes,
//       wpm: finalWpm,
//       accuracy: finalAcc
//     });
//     return {
//       wpm: round1(finalWpm),
//       accuracy: round1(finalAcc),
//       score: round1(finalScore),
//       correctChars: derived.correctChars,
//       mistakes: derived.mistakes,
//       bestStreak: derived.bestStreak,
//       backspaces
//     };
//   }, [elapsed, duration, derived, typed.length, backspaces]);

//   async function copyResult() {
//     const text =
//       `Typing Arena (${duration}s) | WPM: ${finalStats.wpm} | Acc: ${finalStats.accuracy}% | ` +
//       `Score: ${finalStats.score} | Correct: ${finalStats.correctChars} | Mistakes: ${finalStats.mistakes}`;
//     try {
//       await navigator.clipboard.writeText(text);
//       alert("Copied result ✅");
//     } catch {
//       alert(text);
//     }
//   }

//   function handleSaveAndShowWinner() {
//     const name = prompt("Enter your name (for this device’s leaderboard):") || "Anonymous";
//     submitScore(name);
//     // keep phase DONE
//   }

//   return (
//     <div className="page">
//       <div className="container">
//         <header className="header">
//           <div>
//             <div className="title">Typing Arena</div>
//             <div className="subtitle">
//               Live stats • short rounds • perfect for classroom competition
//             </div>
//           </div>

//           <div className="controls">
//             <div className="pill">
//               <span className="pillLabel">Round</span>
//               <select
//                 value={duration}
//                 onChange={(e) => setDuration(Number(e.target.value))}
//                 disabled={phase !== "READY"}
//               >
//                 {DURATIONS.map((d) => (
//                   <option key={d} value={d}>
//                     {d}s
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <button className="btn" onClick={() => reset(true)} type="button">
//               New prompt
//             </button>

//             <button className="btn dark" onClick={() => reset(false)} type="button">
//               Restart
//             </button>
//           </div>
//         </header>

//         <div className="grid">
//           <section className="card">
//             <div className="row between">
//               <div className="cardTitle">Prompt</div>
//               <div className="timer">
//                 {phase === "RUNNING" ? (
//                   <span className="live">LIVE</span>
//                 ) : phase === "DONE" ? (
//                   <span className="done">DONE</span>
//                 ) : (
//                   <span className="ready">READY</span>
//                 )}
//                 <span className="time">{timeLeft}s</span>
//               </div>
//             </div>

//             <PromptRenderer prompt={prompt} typed={typed} />

//             <textarea
//               ref={inputRef}
//               className="input"
//               value={typed}
//               onChange={(e) => onChangeValue(e.target.value)}
//               onKeyDown={(e) => {
//                 // Start on first key press too
//                 if (phase === "READY") startIfNeeded();

//                 // Block paste to keep the competition fair
//                 if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
//                   e.preventDefault();
//                 }
//               }}
//               disabled={phase === "DONE"}
//               placeholder={
//                 phase === "READY"
//                   ? "Type to start (timer starts on first key)…"
//                   : phase === "RUNNING"
//                   ? "Keep going…"
//                   : "Round finished. Restart or save score."
//               }
//             />

//             <div className="hint">
//               Paste is blocked. Timer starts on first key. Best for 15–20s live demos.
//             </div>

//             {phase === "DONE" && (
//               <div className="results">
//                 <div className="resultsTop">
//                   <div className="resultsTitle">Results</div>
//                   <div className="resultsScore">Score: {finalStats.score}</div>
//                 </div>

//                 <div className="resultsGrid">
//                   <Stat label="WPM" value={finalStats.wpm} big />
//                   <Stat label="Accuracy" value={`${finalStats.accuracy}%`} big />
//                   <Stat label="Correct" value={finalStats.correctChars} />
//                   <Stat label="Mistakes" value={finalStats.mistakes} />
//                   <Stat label="Best streak" value={finalStats.bestStreak} />
//                   <Stat label="Backspaces" value={finalStats.backspaces} />
//                 </div>

//                 <div className="btnRow">
//                   <button className="btn dark" onClick={handleSaveAndShowWinner} type="button">
//                     Save to leaderboard
//                   </button>
//                   <button className="btn" onClick={copyResult} type="button">
//                     Copy result
//                   </button>
//                 </div>
//               </div>
//             )}
//           </section>

//           <aside className="card">
//             <div className="cardTitle">Live Dashboard</div>

//             <div className="dashGrid">
//               <Stat label="WPM" value={round1(derived.wpm)} big />
//               <Stat label="Accuracy" value={`${round1(derived.accuracy)}%`} big />
//               <Stat label="Progress" value={`${derived.progress}%`} />
//               <Stat label="Streak" value={`${derived.streak} (best ${derived.bestStreak})`} />
//               <Stat label="Mistakes" value={derived.mistakes} />
//               <Stat label="Backspaces" value={backspaces} />
//             </div>

//             <div className="meter">
//               <div className="meterTop">
//                 <span>Accuracy bar</span>
//                 <span>{round1(derived.accuracy)}%</span>
//               </div>
//               <Bar value={derived.accuracy} />
//             </div>

//             <div className="meter">
//               <div className="meterTop">
//                 <span>Progress bar</span>
//                 <span>{derived.progress}%</span>
//               </div>
//               <Bar value={derived.progress} />
//             </div>

//             <div className="divider" />

//             <div className="row between">
//               <div className="cardTitle" style={{ margin: 0 }}>
//                 Local Leaderboard (Top 10)
//               </div>
//               <button className="btn small" onClick={clearLeaderboard} type="button">
//                 Clear
//               </button>
//             </div>

//             {leaderboard.length === 0 ? (
//               <div className="empty">No scores yet on this device. Finish a round → Save.</div>
//             ) : (
//               <div className="table">
//                 <div className="tr head">
//                   <div>#</div>
//                   <div>Name</div>
//                   <div>Score</div>
//                   <div>WPM</div>
//                   <div>Acc</div>
//                 </div>
//                 {leaderboard.map((e, idx) => (
//                   <div className="tr" key={e.id}>
//                     <div>{idx + 1}</div>
//                     <div title={e.at}>{e.name}</div>
//                     <div>{e.score}</div>
//                     <div>{e.wpm}</div>
//                     <div>{e.accuracy}%</div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             <div className="howto">
//               <div className="howtoTitle">Class competition idea</div>
//               <ul>
//                 <li>Put the Netlify link + QR code on the slide.</li>
//                 <li>Everyone plays 15s on their phone.</li>
//                 <li>They tap “Copy result” and paste it in chat.</li>
//                 <li>You announce the winner + show your own leaderboard on screen.</li>
//               </ul>
//             </div>
//           </aside>
//         </div>

//         <footer className="footer">
//           Built with React components + events + state. Ready for Netlify deploy.
//         </footer>
//       </div>
//     </div>
//   );
// }












import React from "react";
import "./index.css";

import Stage1_Shell from "./stages/Stage1_Shell";
import Stage2_Layout from "./stages/Stage2_Layout";
import Stage3_UI, { PromptRenderer, Stat, Bar } from "./stages/Stage3_UI";
import Stage4_TypingArena from "./stages/Stage4_TypingArena";

const STAGE = 4; // change live: 1 -> 2 -> 3 -> 4

export default function App() {
  if (STAGE === 1) {
    return (
      <Stage1_Shell
        title="Typing Arena"
        subtitle="Stage 1/4 • Installation + React entry point (App runs ✅)"
      >
        <div className="card">
          In Stage 1 we confirm React is installed and rendering. Next we build the layout.
        </div>
      </Stage1_Shell>
    );
  }

  if (STAGE === 2) {
    return (
      <Stage2_Layout
        title="Typing Arena"
        subtitle="Stage 2/4 • Creating a React app (JSX layout)"
        left={
          <>
            <div className="cardTitle">Prompt (placeholder)</div>
            <div className="prompt" style={{ opacity: 0.7 }}>
              Layout exists — logic comes later.
            </div>
            <textarea className="input" disabled placeholder="Input will be wired in Stage 4…" />
          </>
        }
        right={
          <>
            <div className="cardTitle">Dashboard (placeholder)</div>
            <div className="dashGrid">
              <div className="stat">
                <div className="statLabel">WPM</div>
                <div className="statValue big">—</div>
              </div>
              <div className="stat">
                <div className="statLabel">Accuracy</div>
                <div className="statValue big">—</div>
              </div>
            </div>
          </>
        }
      />
    );
  }

  if (STAGE === 3) {
    const prompt = "React components are reusable blocks that make UI easy to build.";
    const typed = "React components are reusa";

    return (
      <Stage3_UI
        title="Typing Arena"
        subtitle="Stage 3/4 • Components (PromptRenderer / Stat / Bar)"
        left={
          <>
            <div className="cardTitle">PromptRenderer</div>
            <PromptRenderer prompt={prompt} typed={typed} />
          </>
        }
        right={
          <>
            <div className="cardTitle">Reusable Stat + Bar</div>
            <div className="dashGrid">
              <Stat label="WPM" value="—" big />
              <Stat label="Accuracy" value="—" big />
              <Stat label="Progress" value="—" />
              <Stat label="Streak" value="—" />
            </div>

            <div className="meter">
              <div className="meterTop">
                <span>Example bar</span>
                <span>50%</span>
              </div>
              <Bar value={50} />
            </div>
          </>
        }
      />
    );
  }

  return <Stage4_TypingArena />;
}