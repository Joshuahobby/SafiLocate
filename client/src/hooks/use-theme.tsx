import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): "light" | "dark" {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === "undefined") return "system";
        const stored = localStorage.getItem("safilocate-theme") as Theme | null;
        return stored || "system";
    });

    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
        if (theme === "system") return getSystemTheme();
        return theme;
    });

    useEffect(() => {
        const root = document.documentElement;

        const updateTheme = () => {
            const resolved = theme === "system" ? getSystemTheme() : theme;
            setResolvedTheme(resolved);

            if (resolved === "dark") {
                root.classList.add("dark");
            } else {
                root.classList.remove("dark");
            }
        };

        updateTheme();

        // Listen for system theme changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (theme === "system") {
                updateTheme();
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem("safilocate-theme", newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
