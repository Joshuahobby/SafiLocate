import {
    LayoutDashboard,
    Package,
    MapPin,
    LogOut,
    AlertCircle,
    Users,
    Flag,
    Shield,
    Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
    activeView: string;
    onViewChange: (view: string) => void;
    onLogout: () => void;
    className?: string;
}

export function AdminSidebar({ activeView, onViewChange, onLogout, className }: AdminSidebarProps) {
    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'items', label: 'All Items', icon: Package },
        { id: 'claims', label: 'Claims', icon: Shield },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'reports', label: 'Reports', icon: Flag },
        { id: 'activity', label: 'Activity Logs', icon: AlertCircle },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className={cn("flex flex-col h-full bg-slate-900 text-slate-300", className)}>
            <div className="p-6">
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">S</div>
                    SafiAdmin
                </h2>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => (
                    <Button
                        key={item.id}
                        variant="ghost"
                        onClick={() => onViewChange(item.id)}
                        className={cn(
                            "w-full justify-start",
                            activeView === item.id
                                ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                                : "hover:bg-white/10 hover:text-white"
                        )}
                    >
                        <item.icon className="mr-2 w-4 h-4" />
                        {item.label}
                    </Button>
                ))}
            </nav>

            <div className="p-4 border-t border-white/10">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={onLogout}
                >
                    <LogOut className="mr-2 w-4 h-4" /> Logout
                </Button>
            </div>
        </div>
    );
}
