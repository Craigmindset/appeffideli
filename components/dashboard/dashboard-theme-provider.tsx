"use client";

import * as React from "react";

type Theme = "dark" | "light" | "system";

type DashboardThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type DashboardThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: DashboardThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const DashboardThemeProviderContext =
  React.createContext<DashboardThemeProviderState>(initialState);

export function DashboardThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "dashboard-theme",
  ...props
}: DashboardThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(
    () =>
      (typeof window !== "undefined" &&
        (localStorage.getItem(storageKey) as Theme)) ||
      defaultTheme
  );

  React.useEffect(() => {
    const root = document.documentElement;

    // Only apply theme to dashboard
    const isDashboard = window.location.pathname.startsWith("/dashboard");

    if (!isDashboard) {
      root.classList.remove("dark");
      return;
    }

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <DashboardThemeProviderContext.Provider {...props} value={value}>
      {children}
    </DashboardThemeProviderContext.Provider>
  );
}

export const useDashboardTheme = () => {
  const context = React.useContext(DashboardThemeProviderContext);

  if (context === undefined)
    throw new Error(
      "useDashboardTheme must be used within a DashboardThemeProvider"
    );

  return context;
};
