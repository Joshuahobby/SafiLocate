import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, Menu } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
    const [location] = useLocation();

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
                    <Link href="/">
                        <a className={`text-sm font-medium transition-colors hover:text-primary ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
                            Home
                        </a>
                    </Link>
                    <Link href="/search">
                        <a className={`text-sm font-medium transition-colors hover:text-primary ${location === '/search' ? 'text-primary' : 'text-muted-foreground'}`}>
                            Search
                        </a>
                    </Link>
                    <Link href="/about">
                        <a className={`text-sm font-medium transition-colors hover:text-primary ${location === '/about' ? 'text-primary' : 'text-muted-foreground'}`}>
                            How it Works
                        </a>
                    </Link>
                </nav>

                <div className="flex items-center gap-3">
                    <div className="hidden md:block">
                        <Link href="/login">
                            <Button size="sm" className="rounded-full px-6 font-semibold">Sign In</Button>
                        </Link>
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
                                    <Link href="/login">
                                        <Button className="w-full">Sign In</Button>
                                    </Link>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}
