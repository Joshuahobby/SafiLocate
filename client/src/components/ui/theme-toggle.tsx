import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-full hover:bg-accent"
                >
                    <Sun className={`h-5 w-5 transition-all duration-300 ${resolvedTheme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
                    <Moon className={`absolute h-5 w-5 transition-all duration-300 ${resolvedTheme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`} />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className={`flex items-center gap-2 cursor-pointer ${theme === 'light' ? 'bg-accent' : ''}`}
                >
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className={`flex items-center gap-2 cursor-pointer ${theme === 'dark' ? 'bg-accent' : ''}`}
                >
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className={`flex items-center gap-2 cursor-pointer ${theme === 'system' ? 'bg-accent' : ''}`}
                >
                    <Monitor className="h-4 w-4" />
                    <span>System</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Simple toggle button without dropdown
export function ThemeToggleSimple() {
    const { resolvedTheme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative h-9 w-9 rounded-full hover:bg-accent"
        >
            <Sun className={`h-5 w-5 transition-all duration-300 ${resolvedTheme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
            <Moon className={`absolute h-5 w-5 transition-all duration-300 ${resolvedTheme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`} />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
