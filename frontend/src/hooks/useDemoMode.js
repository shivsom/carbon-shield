import { useEffect, useState } from "react";

const KEY = "carbonshield_demo_mode_v1";

export function useDemoMode() {
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      setDemoMode(raw === "1");
    } catch {
      setDemoMode(false);
    }
  }, []);

  const toggleDemoMode = () => {
    setDemoMode((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  };

  return { demoMode, toggleDemoMode };
}

