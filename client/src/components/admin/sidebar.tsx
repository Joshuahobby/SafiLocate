import {
    LayoutDashboard,
    Package,
    MapPin,
    LogOut,
    AlertCircle,
    Users,
    Flag,
    Shield,
    Settings,
    Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AdminSidebarProps {
    activeView: string;
    onViewChange: (view: string) => void;
    onLogout: () => void;
    className?: string;
}

export function AdminSidebar({ activeView, onViewChange, onLogout, className }: AdminSidebarProps) {
    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, category: 'Analytics' },
        { id: 'items', label: 'All Items', icon: Package, category: 'Inventory' },
        { id: 'claims', label: 'Claims', icon: Shield, category: 'Verification' },
        { id: 'users', label: 'Users', icon: Users, category: 'Access' },
        { id: 'reports', label: 'Reports', icon: Flag, category: 'Monitoring' },
        { id: 'activity', label: 'Activity Logs', icon: AlertCircle, category: 'Security' },
        { id: 'settings', label: 'Settings', icon: Settings, category: 'System' },
    ];

    return (
        <div className={cn("flex flex-col h-full bg-slate-950 border-r border-slate-800", className)}>
            <div className="p-6 pb-6">
                <div className="flex items-center gap-3 group px-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-900/20 transition-transform group-hover:rotate-3 duration-300">
                        S
                    </div>
                    <div className="space-y-0.5">
                        <h2 className="text-sm font-bold text-white tracking-tight uppercase leading-none">SafiLocate</h2>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest opacity-80">Admin Console</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar pt-2">
                {navItems.map((item) => (
                    <Button
                        key={item.id}
                        variant="ghost"
                        onClick={() => onViewChange(item.id)}
                        className={cn(
                            "w-full justify-start h-10 px-4 rounded-xl transition-all duration-200 relative group overflow-hidden border border-transparent",
                            activeView === item.id
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-medium"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                        )}
                    >
                        {activeView === item.id && (
                            <motion.div
                                layoutId="sidebar-active-pill"
                                className="absolute left-0 w-1 h-5 bg-primary rounded-r-full"
                            />
                        )}
                        <item.icon className={cn(
                            "mr-3 w-4 h-4 transition-transform group-hover:scale-105",
                            activeView === item.id ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                        )} />
                        <span className="text-[11px] font-semibold uppercase tracking-widest">{item.label}</span>
                    </Button>
                ))}
            </nav>

            <div className="p-4 mt-auto">
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 mb-4 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Lock className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Secure<br />Environment</p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    className="w-full justify-start h-10 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all duration-300 group"
                    onClick={onLogout}
                >
                    <LogOut className="mr-3 w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-[11px] font-semibold uppercase tracking-widest">Terminate Session</span>
                </Button>
            </div>
        </div>
    );
}
