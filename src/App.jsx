import { useEffect, useRef, useState } from "react";

export default function App() {
  const [elapsed, setElapsed] = useState(0);
  const [display, setDisplay] = useState({
  h: "00",
  m: "00",
  s: "00",
  cs: "00",
});

  const [glow, setGlow] = useState({
  h: false,
  m: false,
  s: false,
  cs: false,
});
  
  const [visible, setVisible] = useState(!document.hidden);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const SWIPE_THRESHOLD = 70; // px

  const lastLapIdRef = useRef(null);
  const noteRefs = useRef({});

  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const [dark, setDark] = useState(false);

  const startTimeRef = useRef(0);
  const intervalRef = useRef(null);
  const DISPLAY_INTERVAL = 50; // smoother display
  //const [glow, setGlow] = useState(false);



  
  // Format helper
  const getTimeParts = (ms) => {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);

  return {
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
    cs: String(cs).padStart(2, "0"),
  };
};
  
   // Format time
  const formatTime = (ms) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
  };


  // Start / Pause
  const toggle = () => {
  if (!running) {
    startTimeRef.current = Date.now() - elapsed;

    intervalRef.current = setInterval(() => {
  if (!visible) return; // freeze UI updates when tab hidden

  const now = Date.now() - startTimeRef.current;

  if (Math.abs(now - elapsed) >= DISPLAY_INTERVAL) {
    setElapsed(now);
  }
}, 10);


  } else {
    clearInterval(intervalRef.current);
  }
  setRunning(!running);
};


  // Reset
  const reset = () => {
    clearInterval(intervalRef.current);
    setElapsed(0);
    setLaps([]);
    setRunning(false);
  };

  const lap = () => {
  if (!running) return;

  const newLap = {
    id: crypto.randomUUID(),   // stable identity
    time: elapsed,             // frozen time
    note: "",
  };

  lastLapIdRef.current = newLap.id; // for auto-focus

  setLaps((prev) => [newLap, ...prev]); // NO stale state
};


  //  Theme
  useEffect(() => {
    document.body.className = dark ? "dark" : "";
  }, [dark]);
    
  useEffect(() => {
  const next = getTimeParts(elapsed);

  setDisplay((prev) => {
    const updated = { ...prev };  

    (["h", "m", "s", "cs"]).forEach((key) => {
      if (prev[key] !== next[key]) {
        updated[key] = next[key];
        setGlow((g) => ({ ...g, [key]: true }));
        setTimeout(
          () => setGlow((g) => ({ ...g, [key]: false })),
          140
        );
      }
    });
       return updated;
  });
}, [elapsed]);

   useEffect(() => {
    const onVisibilityChange = () => {
    setVisible(!document.hidden);
  };

  document.addEventListener("visibilitychange", onVisibilityChange);
   return () =>
    document.removeEventListener("visibilitychange", onVisibilityChange);
}, []);

  useEffect(() => {
  const id = lastLapIdRef.current;
  if (!id) return;

  const input = noteRefs.current[id];
  if (input) {
    input.focus();
  }

  lastLapIdRef.current = null;
}, [laps]);

useEffect(() => {
  const handler = (e) => {
    const tag = e.target.tagName;

    // 🛑 Allow normal typing inside inputs
    if (tag === "INPUT" || tag === "TEXTAREA") {
      // Enter saves note
      if (e.code === "Enter") {
        e.target.blur();
      }
      return;
    }

    // ▶️ Space = Pause / Resume
    if (e.code === "Space") {
      e.preventDefault();
      toggle();
    }

    // 🏁 Enter = Add Lap
    if (e.code === "Enter") {
      e.preventDefault();
      if (running) lap();
    }
  };

  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, [running, elapsed]);


    
                    //Return 
     
  return (
    <div className="app">
      <header>
        <h1 className="heading">⏱ Stopwatch</h1>
        <button className="theme" onClick={() => setDark(!dark)}>
          {dark ? "☀️" : "🌙"}
        </button>
      </header>

      <div className="timer">
  <span className={glow.h ? "glow" : ""}>{display.h}</span>:
  <span className={glow.m ? "glow" : ""}>{display.m}</span>:
  <span className={glow.s ? "glow" : ""}>{display.s}</span>.
  <span className={glow.cs ? "glow" : ""}>{display.cs}</span>
</div>



      <div className="controls">
        <button onClick={toggle}>{running ? "Pause" : "Start"}</button>
        <button className="secondary" onClick={lap}>Lap</button>
        <button className="secondary" onClick={reset}>Reset</button>
      </div>

      <ul className="laps-list">
  {laps.map((lap, i) => (
    <li
  key={lap.id}
  className="lap-item"
  onTouchStart={(e) => {
    touchStartX.current = e.touches[0].clientX;
  }}
  onTouchMove={(e) => {
    touchEndX.current = e.touches[0].clientX;
  }}
  onTouchEnd={() => {
    const delta = touchStartX.current - touchEndX.current;

    if (delta > SWIPE_THRESHOLD) {
      // swipe left → delete
      setLaps((prev) => prev.filter((l) => l.id !== lap.id));
    }
  }}
>
      <span className="lap-index">
         {laps.length - i}
      </span>

      <span className="lap-time">
        {formatTime(lap.time)}
      </span>
      <input
  ref={(el) => {
    if (!el) return;
    if (!lap?.id) return;

    noteRefs.current[lap.id] = el;
  }}
  value={lap.note}
  maxLength={15}
  placeholder="note"
  onChange={(e) => {
    const value = e.target.value;
    setLaps((prev) =>
      prev.map((l) =>
        l.id === lap.id ? { ...l, note: value } : l
      )
    );
  }}
/>
</li>
  ))}
</ul>
      <p className="hint">Press <b>Space</b> to Start / Pause</p>
    </div>
  );
}
