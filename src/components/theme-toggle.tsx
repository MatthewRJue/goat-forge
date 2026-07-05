"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const themeStorageKey = "goat-builder-theme";
const themeChangeEvent = "goat-builder-theme-change";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): Theme | null {
  const storedTheme = window.localStorage.getItem(themeStorageKey);

  return storedTheme === "light" || storedTheme === "dark" ? storedTheme : null;
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

function subscribeToThemeChanges(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const notify = () => {
    onStoreChange();
  };

  mediaQuery.addEventListener("change", notify);
  window.addEventListener("storage", notify);
  window.addEventListener(themeChangeEvent, notify);

  return () => {
    mediaQuery.removeEventListener("change", notify);
    window.removeEventListener("storage", notify);
    window.removeEventListener(themeChangeEvent, notify);
  };
}

function getThemeSnapshot(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToThemeChanges,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const nextTheme: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={theme === "dark"}
      className="theme-toggle"
      type="button"
      onClick={() => {
        applyTheme(nextTheme);
        window.localStorage.setItem(themeStorageKey, nextTheme);
        window.dispatchEvent(new Event(themeChangeEvent));
      }}
    >
      <span
        aria-hidden="true"
        className={theme === "light" ? "is-active" : ""}
      >
        Light
      </span>
      <span
        aria-hidden="true"
        className={theme === "dark" ? "is-active" : ""}
      >
        Dark
      </span>
    </button>
  );
}
