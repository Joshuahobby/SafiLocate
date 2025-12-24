import {
    LayoutDashboard,
    Package,
    Shield,
    Radar,
    User,
    LogOut,
    Lock,
    PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Link } from "wouter";

interface UserSidebarProps {
    activeView: string;
    onViewChange: (view: string) => void;
    onLogout: () => void;
    className?: string;
}

export function UserSidebar({ activeView, onViewChange, onLogout, className }: UserSidebarProps) {
    const navItems = [
        { id: 'overview', label: 'Protocol Overview', icon: LayoutDashboard },
        { id: 'reports', label: 'Asset Registry', icon: Package },
        { id: 'claims', label: 'Verification Claims', icon: Shield },
        { id: 'matches', label: 'Match Radar', icon: Radar },
        { id: 'profile', label: 'Security Profile', icon: User },
    ];

    return (
        <div className={cn("flex flex-col h-full bg-slate-950 border-r border-slate-800", className)}>
            <div className="p-6 pb-8">
                <Link href="/">
                    <div className="flex items-center gap-3 group px-2 cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black shadow-lg shadow-primary/20 transition-transform group-hover:rotate-3 duration-300">
                            S
                        </div>
                        <div className="space-y-0.5">
                            <h2 className="text-sm font-bold text-white tracking-tight uppercase leading-none">SafiLocate</h2>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest opacity-80">Sovereignty Hub</p>
                        </div>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
                <div className="px-4 mb-4">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Command Center</p>
                </div>
                {navItems.map((item) => (
                    <Button
                        key={item.id}
                        variant="ghost"
                        onClick={() => onViewChange(item.id)}
                        className={cn(
                            "w-full justify-start h-10 px-4 rounded-xl transition-all duration-200 relative group overflow-hidden border border-transparent mb-1",
                            activeView === item.id
                                ? "bg-primary/10 text-primary border-primary/20 shadow-sm font-bold"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                        )}
                    >
                        {activeView === item.id && (
                            <motion.div
                                layoutId="user-sidebar-active-pill"
                                className="absolute left-0 w-1 h-5 bg-primary rounded-r-full"
                            />
                        )}
                        <item.icon className={cn(
                            "mr-3 w-4 h-4 transition-transform group-hover:scale-110",
                            activeView === item.id ? "text-primary" : "text-slate-500 group-hover:text-slate-300"
                        )} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                    </Button>
                ))}

                <div className="pt-8 px-4">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Quick Entry</p>
                    <Link href="/report-lost">
                        <Button variant="outline" className="w-full justify-start h-10 px-4 rounded-xl border-dashed border-slate-800 text-slate-400 hover:text-white hover:border-primary/50 transition-all mb-2">
                            <PlusCircle className="mr-3 w-4 h-4 text-rose-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Report Asset</span>
                        </Button>
                    </Link>
                </div>
            </nav>

            <div className="p-4 mt-auto">
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 mb-4 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Lock className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Identity<br />Verified</p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    className="w-full justify-start h-10 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all duration-300 group"
                    onClick={onLogout}
                >
                    <LogOut className="mr-3 w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Terminate Session</span>
                </Button>
            </div>
        </div>
    );
}
