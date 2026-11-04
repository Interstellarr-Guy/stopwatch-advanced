import { useEffect, useRef, useState } from "react";

export default function Stopwatch() {
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

  const startTimeRef = useRef(0);
  const intervalRef = useRef(null);
  const DISPLAY_INTERVAL = 50;

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

  const formatTime = (ms) => {
    const parts = getTimeParts(ms);
    return `${parts.h}:${parts.m}:${parts.s}.${parts.cs}`;
  };

  // Start / Pause
  const toggle = () => {
    if (!running) {
      startTimeRef.current = Date.now() - elapsed;
      intervalRef.current = setInterval(() => {
        if (!visible) return;
        const now = Date.now() - startTimeRef.current;
        if (Math.abs(now - elapsed) >= DISPLAY_INTERVAL) {
          setElapsed(now);
        }
      }, 50);
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

  // const lap = () => {
  //   if (!running) return;
  //   const newLap = {
  //     id: crypto.randomUUID(),
  //     time: elapsed,
  //     note: "",
  //   };
  //   lastLapIdRef.current = newLap.id;
  //   setLaps((prev) => [newLap, ...prev]);
  // };
  
const lap = () => {
  if (!running || laps.length >= 100) return;

  // Total elapsed time at the moment of the lap
  const currentTime = Date.now() - startTimeRef.current;

  // Previous lap's total time
  const previousTime =
    laps.length > 0 ? laps[0].time : 0;

  // Time taken for this specific lap
  const lapDuration = currentTime - previousTime;

  const newLap = {
    id: crypto.randomUUID(),
    number: laps.length + 1,
    time: currentTime,
    lapTime: lapDuration,
    note: "",
  };

  lastLapIdRef.current = newLap.id;

  setLaps((prev) => [newLap, ...prev]);
};


  useEffect(() => {
    const next = getTimeParts(elapsed);
    setDisplay((prev) => {
      const updated = { ...prev };
      ["h", "m", "s", "cs"].forEach((key) => {
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
    const onVisibilityChange = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    const id = lastLapIdRef.current;
    if (!id) return;
    const input = noteRefs.current[id];
    if (input) input.focus();
    lastLapIdRef.current = null;
  }, [laps]);

  const runningRef = useRef(running);
  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  const toggleRef = useRef(toggle);
  const lapRef = useRef(lap);
  useEffect(() => {
    toggleRef.current = toggle;
    lapRef.current = lap;
  });

  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") {
        if (e.code === "Enter") e.target.blur();
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        toggleRef.current();
      }
      if (e.code === "Enter") {
        e.preventDefault();
        if (runningRef.current) lapRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="stopwatch-container">
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

       <div className="laps-container">
 <div className="laps-header">
  <span>Lap</span>
  <span>Lap Time</span>
  <span>Total Time</span>
  <span>Note</span>
</div>

      <ul className="laps-list">
        {laps.map((lapItem, i) => (
          <li
            key={lapItem.id}
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
                setLaps((prev) => prev.filter((l) => l.id !== lapItem.id));
              }
            }}
          >
            
                               {/* Lap Number: 1, 2, 3 ... */}
                <span className="lap-index">
                {lapItem.number}
                </span>

                               {/* Individual Lap Duration */}
                <span className="lap-duration">
                {formatTime(lapItem.lapTime)}
                </span>

                               {/* Total Stopwatch Time */}
                <span className="lap-time">
                {formatTime(lapItem.time)}
                </span>

            <input
              className="write"
              ref={(el) => {
                if (!el || !lapItem?.id) return;
                noteRefs.current[lapItem.id] = el;
              }}
              value={lapItem.note}
              maxLength={15}
              placeholder="note"
              onChange={(e) => {
                const value = e.target.value;
                setLaps((prev) =>
                  prev.map((l) =>
                    l.id === lapItem.id ? { ...l, note: value } : l
                  )
                );
              }}
            />
          </li>
        ))}
      </ul>
      </div>
      <p className="hint">Press <b>Space</b> to Start / Pause</p>
    </div>
  );
}