import React, { useEffect, useMemo, useRef, useState } from "react";
import "../index.css";
import Stage3_UI, { PromptRenderer, Stat, Bar } from "./stage3UI";

const PROMPTS = [
  "React is a JavaScript library for building user interfaces from reusable components.",
  "JSX looks like HTML, but it is JavaScript syntax that compiles to function calls.",
  "A React component can receive data through props and return UI based on those props.",
  "State stores data that can change over time and causes a component to re-render.",
  "The useEffect hook is used to run side effects after a component renders.",
  "React compares virtual DOM trees to update only the parts of the real DOM that changed.",
  "Keys help React identify which list items changed, were added, or were removed.",
  "Controlled inputs keep form values in React state so the UI and data stay in sync.",
  "Lifting state up means moving shared state to the closest common parent component.",
  "React apps are commonly bundled with tools like Vite to support fast development."
];

const DURATIONS = [15, 20, 30];
const LS_KEY = "typing_arena_leaderboard_v1";

function pickPrompt() {
  // Pick one random sentence for the next typing round.
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}
function round1(n) {
  // Normalize numeric stats to one decimal place for UI consistency.
  return Math.round(n * 10) / 10;
}
function computeWPM(correctChars, elapsedSeconds) {
  // Convert correctly typed characters into words-per-minute (5 chars = 1 word).
  const minutes = elapsedSeconds / 60;
  if (minutes <= 0) return 0;
  return (correctChars / 5) / minutes;
}
function accuracyPct(correct, totalTyped) {
  // Return accuracy percent based on correct chars vs total typed chars.
  if (totalTyped <= 0) return 100;
  return (correct / totalTyped) * 100;
}
function scoreFormula({ correctChars, mistakes, wpm, accuracy }) {
  // Produce a single leaderboard score from speed, precision, and errors.
  return correctChars * 2 - mistakes * 3 + wpm * 0.5 + accuracy * 0.2;
}


// It loads previously saved scores from the browser
// so when the page refreshes, the leaderboard is still there.
function loadLeaderboard() {
  // Read and validate saved leaderboard entries from localStorage.
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}


// It saves the leaderboard into the browser so it doesn’t disappear after refresh
function saveLeaderboard(entries) {
  // Persist the current leaderboard to localStorage.
  localStorage.setItem(LS_KEY, JSON.stringify(entries));
}

export default function Stage4_TypingArena() {
  // Main game component: manages round state, live stats, and leaderboard actions.
  const inputRef = useRef(null);

  const [duration, setDuration] = useState(15);
  const [prompt, setPrompt] = useState(() => pickPrompt());

  const [phase, setPhase] = useState("READY"); // READY | RUNNING | DONE
  const [startAt, setStartAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);

  const [typed, setTyped] = useState("");
  const [backspaces, setBackspaces] = useState(0);
  const [carry, setCarry] = useState({ correctChars: 0, mistakes: 0, typedChars: 0, bestStreak: 0 });

  const [leaderboard, setLeaderboard] = useState(() => loadLeaderboard());

  
  const derived = useMemo(() => {
    // Compute live typing metrics from the current prompt, typed text, and elapsed time.
    let correct = 0;
    let wrong = 0;

    const n = Math.min(prompt.length, typed.length);
    let currentStreak = 0;
    let bestStreak = 0;

    for (let i = 0; i < n; i++) {
      if (typed[i] === prompt[i]) {
        correct++;
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        wrong++;
        currentStreak = 0;
      }
    }

    if (typed.length > prompt.length) wrong += typed.length - prompt.length;

    const acc = accuracyPct(correct, typed.length);
    const wpm = computeWPM(correct, Math.max(elapsed, 1));
    const progress = Math.min(100, Math.round((typed.length / prompt.length) * 100));

    return { correctChars: correct, mistakes: wrong, accuracy: acc, wpm, streak: currentStreak, bestStreak, progress };
  }, [prompt, typed, elapsed]);

  const totals = useMemo(() => {
    // Merge completed-prompt totals with the current prompt in progress.
    const correctChars = carry.correctChars + derived.correctChars;
    const mistakes = carry.mistakes + derived.mistakes;
    const typedChars = carry.typedChars + typed.length;
    const bestStreak = Math.max(carry.bestStreak, derived.bestStreak);
    const wpm = computeWPM(correctChars, Math.max(elapsed, 1));
    const accuracy = accuracyPct(correctChars, typedChars);
    return { correctChars, mistakes, typedChars, bestStreak, wpm, accuracy };
  }, [carry, derived, typed.length, elapsed]);

  useEffect(() => {
    // Run the round timer while active, then end the round when time reaches zero.
    if (phase !== "RUNNING" || !startAt) return;

    const id = setInterval(() => {
      const now = Date.now();
      const e = Math.floor((now - startAt) / 1000);
      const left = Math.max(0, duration - e);
      setElapsed(e);
      setTimeLeft(left);
      if (left === 0) setPhase("DONE");
    }, 100);

    return () => clearInterval(id);
  }, [phase, startAt, duration]);

  useEffect(() => {
    // Keep countdown and elapsed values aligned when duration changes in READY phase.
    if (phase === "READY") {
      setTimeLeft(duration);
      setElapsed(0);
    }
  }, [duration, phase]);

  useEffect(() => {
    // Keep the typing textarea focused whenever the round is not finished.
    if (phase !== "DONE") inputRef.current?.focus();
  }, [phase]);

  useEffect(() => {
    // While running, auto-load a new prompt as soon as the current one is completed perfectly.
    const finishedPrompt = typed.length === prompt.length && derived.correctChars === prompt.length && derived.mistakes === 0;
    if (phase !== "RUNNING" || !finishedPrompt) return;

    setCarry((c) => ({
      correctChars: c.correctChars + derived.correctChars,
      mistakes: c.mistakes + derived.mistakes,
      typedChars: c.typedChars + typed.length,
      bestStreak: Math.max(c.bestStreak, derived.bestStreak)
    }));
    setTyped("");
    setPrompt(pickPrompt());
  }, [phase, typed.length, prompt.length, derived.correctChars, derived.mistakes, derived.bestStreak]);

  function startIfNeeded() {
    // Start timing on first interaction so rounds begin exactly when typing starts.
    if (phase === "READY") {
      setPhase("RUNNING");
      setStartAt(Date.now());
    }
  }

  function reset(newPrompt = true) {
    // Reset the round state and optionally rotate to a fresh prompt.
    setPhase("READY");
    setStartAt(null);
    setElapsed(0);
    setTimeLeft(duration);
    setTyped("");
    setBackspaces(0);
    setCarry({ correctChars: 0, mistakes: 0, typedChars: 0, bestStreak: 0 });
    if (newPrompt) setPrompt(pickPrompt());
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function onChangeValue(next) {
    // Update typed input, auto-start the round, and track backspace usage.
    startIfNeeded();
    if (next.length < typed.length) setBackspaces((b) => b + (typed.length - next.length));
    setTyped(next);
  }

  function submitScore(name) {
    // Build a final score entry, merge it into top results, and persist leaderboard.
    const finalElapsed = Math.max(1, elapsed || duration);
    const finalCorrect = totals.correctChars;
    const finalMistakes = totals.mistakes;
    const finalTyped = totals.typedChars;
    const finalWpm = computeWPM(finalCorrect, finalElapsed);
    const finalAcc = accuracyPct(finalCorrect, finalTyped);
    const score = scoreFormula({ correctChars: finalCorrect, mistakes: finalMistakes, wpm: finalWpm, accuracy: finalAcc });

    const entry = {
      id: crypto?.randomUUID?.() || String(Date.now()),
      name: (name || "Anonymous").slice(0, 18),
      duration,
      wpm: round1(finalWpm),
      accuracy: round1(finalAcc),
      correctChars: finalCorrect,
      mistakes: finalMistakes,
      score: round1(score),
      at: new Date().toISOString()
    };

    const next = [entry, ...leaderboard].sort((a, b) => b.score - a.score).slice(0, 10);
    setLeaderboard(next);
    saveLeaderboard(next);
  }

  function clearLeaderboard() {
    // Remove all saved leaderboard entries from UI state and storage.
    setLeaderboard([]);
    saveLeaderboard([]);
  }

  const finalStats = useMemo(() => {
    // Freeze final result metrics shown after the round ends.
    const finalElapsed = Math.max(1, elapsed || duration);
    const finalCorrect = totals.correctChars;
    const finalMistakes = totals.mistakes;
    const finalWpm = computeWPM(finalCorrect, finalElapsed);
    const finalAcc = accuracyPct(finalCorrect, totals.typedChars);
    const finalScore = scoreFormula({ correctChars: finalCorrect, mistakes: finalMistakes, wpm: finalWpm, accuracy: finalAcc });

    return {
      wpm: round1(finalWpm),
      accuracy: round1(finalAcc),
      score: round1(finalScore),
      correctChars: finalCorrect,
      mistakes: finalMistakes,
      bestStreak: totals.bestStreak,
      backspaces
    };
  }, [elapsed, duration, totals, backspaces]);

  async function copyResult() {
    // Copy a shareable summary of the finished round to the clipboard.
    const text =
      `Typing Arena (${duration}s) | WPM: ${finalStats.wpm} | Acc: ${finalStats.accuracy}% | ` +
      `Score: ${finalStats.score} | Correct: ${finalStats.correctChars} | Mistakes: ${finalStats.mistakes}`;
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied result ");
    } catch {
      alert(text);
    }
  }

  function handleSave() {
    // Ask for a name and save the current result into the local leaderboard.
    const name = window.prompt("Enter your name (for this device’s leaderboard):") || "Anonymous";
    submitScore(name);
  }

  const headerRight = (
    <>
      <div className="pill">
        <span className="pillLabel">Round</span>
        <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} disabled={phase !== "READY"}>
          {DURATIONS.map((d) => (
            <option key={d} value={d}>
              {d}s
            </option>
          ))}
        </select>
      </div>

      <button className="btn" onClick={() => reset(true)} type="button">
        New prompt
      </button>

      <button className="btn dark" onClick={() => reset(false)} type="button">
        Restart
      </button>
    </>
  );

  return (
    <Stage3_UI
      title="Typing Arena"
      subtitle="Live stats • short rounds • perfect for classroom competition"
      headerRight={headerRight}
      left={
        <>
          <div className="row between">
            <div className="cardTitle">Prompt</div>
            <div className="timer">
              {phase === "RUNNING" ? <span className="live">LIVE</span> : phase === "DONE" ? <span className="done">DONE</span> : <span className="ready">READY</span>}
              <span className="time">{timeLeft}s</span>
            </div>
          </div>

          <div
            onClick={() => inputRef.current?.focus()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.focus();
              }
            }}
            aria-label="Typing area"
          >
            <PromptRenderer prompt={prompt} typed={typed} />
          </div>

          <div className="typingCaptureWrap">
            <textarea
              ref={inputRef}
              className="typingCapture"
              value={typed}
              onChange={(e) => onChangeValue(e.target.value)}
              onKeyDown={(e) => {
                if (phase === "READY") startIfNeeded();
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") e.preventDefault();
                if (e.key === "Tab") e.preventDefault();
              }}
              disabled={phase === "DONE"}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          <div className="hint">Click the prompt and type. Gray = pending, white = correct, red = error.</div>

          {phase === "DONE" && (
            <div className="results">
              <div className="resultsTop">
                <div className="resultsTitle">Results</div>
                <div className="resultsScore">Score: {finalStats.score}</div>
              </div>

              <div className="resultsGrid">
                <Stat label="WPM" value={finalStats.wpm} big />
                <Stat label="Accuracy" value={`${finalStats.accuracy}%`} big />
                <Stat label="Correct" value={finalStats.correctChars} />
                <Stat label="Mistakes" value={finalStats.mistakes} />
                <Stat label="Best streak" value={finalStats.bestStreak} />
                <Stat label="Backspaces" value={finalStats.backspaces} />
              </div>

              <div className="btnRow">
                <button className="btn dark" onClick={handleSave} type="button">
                  Save to leaderboard
                </button>
                <button className="btn" onClick={copyResult} type="button">
                  Copy result
                </button>
              </div>
            </div>
          )}
        </>
      }
      right={
        <>
          {phase !== "DONE" && (
            <>
              <div className="cardTitle">Live Dashboard</div>

              <div className="dashGrid">
                <Stat label="WPM" value={round1(totals.wpm)} big />
                <Stat label="Accuracy" value={`${round1(totals.accuracy)}%`} big />
                <Stat label="Progress" value={`${derived.progress}%`} />
                <Stat label="Streak" value={`${derived.streak} (best ${totals.bestStreak})`} />
                <Stat label="Mistakes" value={totals.mistakes} />
                <Stat label="Backspaces" value={backspaces} />
              </div>

              <div className="meter">
                <div className="meterTop">
                  <span>Accuracy bar</span>
                  <span>{round1(totals.accuracy)}%</span>
                </div>
                <Bar value={totals.accuracy} />
              </div>

              <div className="meter">
                <div className="meterTop">
                  <span>Progress bar</span>
                  <span>{derived.progress}%</span>
                </div>
                <Bar value={derived.progress} />
              </div>

              <div className="divider" />
            </>
          )}

          <div className="row between">
            <div className="cardTitle" style={{ margin: 0 }}>
              Local Leaderboard (Top 10)
            </div>
            <button className="btn small" onClick={clearLeaderboard} type="button">
              Clear
            </button>
          </div>

          {leaderboard.length === 0 ? (
            <div className="empty">No scores yet on this device. Finish a round → Save.</div>
          ) : (
            <div className="table">
              <div className="tr head">
                <div>#</div>
                <div>Name</div>
                <div>Score</div>
                <div>WPM</div>
                <div>Acc</div>
              </div>
              {leaderboard.map((e, idx) => (
                <div className="tr" key={e.id}>
                  <div>{idx + 1}</div>
                  <div title={e.at}>{e.name}</div>
                  <div>{e.score}</div>
                  <div>{e.wpm}</div>
                  <div>{e.accuracy}%</div>
                </div>
              ))}
            </div>
          )}
        </>
      }
    />
  );
}
