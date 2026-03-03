"use client";
import { createContext, useContext, useEffect, useState } from "react";

type AdminTheme = "dark" | "light";

interface AdminThemeContextValue {
  theme: AdminTheme;
  toggleTheme: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
});

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<AdminTheme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("admin-theme") as AdminTheme | null;
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  function toggleTheme() {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("admin-theme", next);
      return next;
    });
  }

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme }}>
      <div data-admin-theme={theme}>{children}</div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}
