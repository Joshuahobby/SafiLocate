import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, Moon, Sun, User, LogOut, Settings } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
    const [location] = useLocation();
    const { resolvedTheme, setTheme } = useTheme();
    const { user, logoutMutation } = useAuth();

    const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

    return (
        <header className="glass-nav transition-all duration-200">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between relative z-10">
                <Link href="/">
                    <div className="flex items-center gap-2 cursor-pointer">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
                            S
                        </div>
                        <span className="font-heading font-bold text-xl tracking-tight text-foreground">SafiLocate</span>
                    </div>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
                        Home
                    </Link>
                    <Link href="/search" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/search' ? 'text-primary' : 'text-muted-foreground'}`}>
                        Search
                    </Link>
                    <Link href="/about" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/about' ? 'text-primary' : 'text-muted-foreground'}`}>
                        How it Works
                    </Link>
                </nav>

                <div className="flex items-center gap-3">
                    {/* Dark Mode Toggle - Desktop */}
                    <div className="hidden md:block">
                        <ThemeToggle />
                    </div>

                    {/* Auth buttons - Desktop */}
                    <div className="hidden md:block">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="rounded-full px-4 gap-2">
                                        <User className="w-4 h-4" />
                                        {user.username}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    {isAdmin ? (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <Link href="/admin/dashboard" className="cursor-pointer">
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    Admin Dashboard
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                        </>
                                    ) : (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <Link href="/dashboard" className="cursor-pointer">
                                                    <User className="mr-2 h-4 w-4" />
                                                    My Dashboard
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                        </>
                                    )}
                                    <DropdownMenuItem
                                        onClick={() => logoutMutation.mutate()}
                                        className="text-red-600 cursor-pointer"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/auth">
                                <Button size="sm" className="rounded-full px-6 font-semibold">Sign In</Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <SheetHeader>
                                    <SheetTitle>Menu</SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-4 mt-8">
                                    <Link href="/">
                                        <Button variant="ghost" className={`w-full justify-start text-lg ${location === '/' ? 'text-primary bg-primary/10' : ''}`}>Home</Button>
                                    </Link>
                                    <Link href="/search">
                                        <Button variant="ghost" className={`w-full justify-start text-lg ${location === '/search' ? 'text-primary bg-primary/10' : ''}`}>Search Items</Button>
                                    </Link>
                                    <Link href="/report-lost">
                                        <Button variant="ghost" className={`w-full justify-start text-lg ${location === '/report-lost' ? 'text-primary bg-primary/10' : ''}`}>Report Lost</Button>
                                    </Link>
                                    <Link href="/report-found">
                                        <Button variant="ghost" className={`w-full justify-start text-lg ${location === '/report-found' ? 'text-primary bg-primary/10' : ''}`}>Report Found</Button>
                                    </Link>
                                    <div className="h-px bg-border my-2" />

                                    {/* Dark Mode Toggle - Mobile */}
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-lg gap-3"
                                        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                                    >
                                        {resolvedTheme === 'dark' ? (
                                            <>
                                                <Sun className="h-5 w-5" />
                                                Light Mode
                                            </>
                                        ) : (
                                            <>
                                                <Moon className="h-5 w-5" />
                                                Dark Mode
                                            </>
                                        )}
                                    </Button>

                                    <div className="h-px bg-border my-2" />

                                    {user ? (
                                        <>
                                            {isAdmin ? (
                                                <Link href="/admin/dashboard">
                                                    <Button variant="ghost" className="w-full justify-start text-lg">
                                                        <Settings className="mr-2 h-5 w-5" />
                                                        Admin Dashboard
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Link href="/dashboard">
                                                    <Button variant="ghost" className="w-full justify-start text-lg">
                                                        <User className="mr-2 h-5 w-5" />
                                                        My Dashboard
                                                    </Button>
                                                </Link>
                                            )}
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start text-lg text-red-600"
                                                onClick={() => logoutMutation.mutate()}
                                            >
                                                <LogOut className="mr-2 h-5 w-5" />
                                                Sign Out
                                            </Button>
                                        </>
                                    ) : (
                                        <Link href="/auth">
                                            <Button className="w-full">Sign In</Button>
                                        </Link>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}
