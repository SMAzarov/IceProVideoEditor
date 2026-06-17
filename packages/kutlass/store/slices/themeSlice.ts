export type Theme = "dark" | "light";

export interface ThemeState {
  theme: Theme;
}

export interface ThemeActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const LS_KEY = "kt-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(LS_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-kt-theme", theme);
  document.documentElement.style.background =
    theme === "dark" ? "#1c1c1c" : "#f0f2f5";
  document.body.style.background =
    theme === "dark" ? "#1c1c1c" : "#f0f2f5";
}

export const createThemeSlice = (
  set: (fn: (state: ThemeState & ThemeActions) => Partial<ThemeState & ThemeActions>) => void
): ThemeState & ThemeActions => {
  // Apply persisted theme on load (client-side only, after hydration)
  const initial = getInitialTheme();

  return {
    theme: initial,

    setTheme: (theme) => {
      set(() => ({ theme }));
      localStorage.setItem(LS_KEY, theme);
      applyTheme(theme);
    },

    toggleTheme: () => {
      set((state) => {
        const next = state.theme === "dark" ? "light" : "dark";
        localStorage.setItem(LS_KEY, next);
        applyTheme(next);
        return { theme: next };
      });
    },
  };
};
