import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
    Package,
    MapPin,
    Clock,
    CheckCircle2,
    Shield,
    Radar,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    ChevronRight,
    ExternalLink,
    ShieldCheck,
    Lock,
    Eye,
    Trash2,
    Mail,
    Key
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { UserSidebar } from "@/components/dashboard/sidebar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function UserDashboard() {
    const [, setLocation] = useLocation();
    const { user, logoutMutation, isLoading: authLoading } = useAuth();
    const { toast } = useToast();
    const [activeView, setActiveView] = useState('overview');

    // Fetch user's reported items
    const { data: items = [], isLoading: itemsLoading } = useQuery<any[]>({
        queryKey: ["/api/items"],
        enabled: !!user && (activeView === 'overview' || activeView === 'reports')
    });

    // Fetch user's claims
    const { data: claimsData, isLoading: claimsLoading } = useQuery<{ items: any[] }>({
        queryKey: ["/api/claims"],
        enabled: !!user && (activeView === 'overview' || activeView === 'claims')
    });
    const claims = claimsData?.items || [];

    // Fetch user's activity
    const { data: activity = [] } = useQuery<any[]>({
        queryKey: ["/api/user/activity"],
        enabled: !!user && activeView === 'overview'
    });

    // Fetch potential matches (Match Radar)
    const { data: matches = [], isLoading: matchesLoading } = useQuery<any[]>({
        queryKey: ["/api/user/matches"],
        enabled: !!user && (activeView === 'overview' || activeView === 'matches')
    });

    // Update Profile Mutation
    const updateProfileMutation = useMutation({
        mutationFn: async (updates: any) => {
            const res = await apiRequest("PATCH", "/api/user/profile", updates);
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            toast({ title: "Protocol Success", description: "Identity credentials updated." });
        },
        onError: (err: any) => {
            toast({ title: "Protocol Error", description: err.message, variant: "destructive" });
        }
    });

    // Authentication and Role Protection
    useEffect(() => {
        if (!authLoading && !user) setLocation("/auth");
        if (user && (user.role === 'admin' || user.role === 'moderator')) setLocation("/admin/dashboard");
    }, [user, authLoading, setLocation]);

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const stats = [
        { label: 'Active Reports', value: items.length, icon: Package, trend: +2 },
        { label: 'Radar Syncs', value: matches.reduce((acc, curr) => acc + curr.matches.length, 0), icon: Radar, trend: matches.length > 0 ? +1 : 0 },
        { label: 'Verified Claims', value: claims.filter((c: any) => c.status === 'verified').length, icon: ShieldCheck, trend: 0 },
        { label: 'Security Level', value: 'High', icon: Lock, trend: null },
    ];

    const renderOverview = () => (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div key={stat.label} variants={fadeInUp}>
                        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden group">
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <stat.icon className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                                    </div>
                                    {stat.trend !== null && (
                                        <div className={cn("text-[10px] font-black px-1.5 py-0.5 rounded-md",
                                            stat.trend > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-800 text-slate-500")}>
                                            {stat.trend > 0 ? "+" : ""}{stat.trend}%
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</h3>
                                    <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
                                </div>
                            </CardContent>
                            <div className="h-1 w-full bg-slate-800">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                    className="h-full bg-primary/20"
                                />
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Monitor */}
                <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-4 bg-primary rounded-full" />
                            <h2 className="text-xs font-black text-white uppercase tracking-widest">Protocol Activity</h2>
                        </div>
                    </div>
                    <Card className="bg-slate-900 border-slate-800 p-6 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activity}>
                                <defs>
                                    <linearGradient id="colorFound" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#475569"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#475569"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '10px', color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="found"
                                    stroke="hsl(var(--primary))"
                                    fillOpacity={1}
                                    fill="url(#colorFound)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="lost"
                                    stroke="#f59e0b"
                                    fillOpacity={0}
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </motion.div>

                {/* Match Radar Quick View */}
                <motion.div variants={fadeInUp} className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-4 bg-rose-500 rounded-full" />
                            <h2 className="text-xs font-black text-white uppercase tracking-widest">Radar Hits</h2>
                        </div>
                        <Button variant="ghost" size="sm" className="text-[10px] font-bold text-primary" onClick={() => setActiveView('matches')}>
                            Scan All
                        </Button>
                    </div>
                    <Card className="bg-slate-900 border-slate-800 p-4 min-h-[300px] flex flex-col justify-center">
                        {matches.length === 0 ? (
                            <div className="text-center space-y-3">
                                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-dashed border-slate-700">
                                    <Radar className="w-5 h-5 text-slate-600 animate-pulse" />
                                </div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Scanning Registry...</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {matches.slice(0, 3).map((match, i) => (
                                    <div key={i} className="p-3 bg-slate-800/50 rounded-xl border border-slate-800 group hover:border-primary/30 transition-all cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest line-clamp-1">{match.parentItem.title}</h4>
                                            <Badge className="bg-primary/20 text-primary border-none text-[8px] tracking-tighter">
                                                {match.matches[0].score}% MATCH
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-md bg-slate-700 flex items-center justify-center text-[10px] text-white">
                                                    <Package className="w-3 h-3" />
                                                </div>
                                                <span className="text-[10px] font-medium text-white">{match.matches[0].title}</span>
                                            </div>
                                            <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );

    const renderMatches = () => (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <Radar className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-white tracking-tight">Match Radar</h2>
            </div>
            {matches.length === 0 ? (
                <Card className="bg-slate-900 border-slate-800 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-700">
                        <Radar className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Zero Active Signals</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">Our protocol is scanning the registry every 60 seconds for potential matches related to your lost assets.</p>
                </Card>
            ) : (
                <div className="space-y-8">
                    {matches.map((group, i) => (
                        <div key={i} className="space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Signal Origin:</span>
                                <div className="h-px flex-1 bg-slate-800" />
                                <Badge variant="outline" className="border-slate-800 text-slate-400 capitalize">{group.parentItem.title}</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {group.matches.map((match: any) => (
                                    <Card key={match.id} className="bg-slate-900 border-slate-800 hover:border-primary/50 transition-all group overflow-hidden">
                                        <CardContent className="p-0">
                                            <div className="aspect-video bg-slate-800 relative">
                                                {match.imageUrls?.[0] ? (
                                                    <img src={match.imageUrls[0]} alt={match.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-8 h-8 text-slate-700" />
                                                    </div>
                                                )}
                                                <div className="absolute top-3 left-3">
                                                    <Badge className="bg-primary/90 text-white font-black">{match.score}% MATCH</Badge>
                                                </div>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <div className="space-y-1">
                                                    <h4 className="text-sm font-bold text-white tracking-tight">{match.title}</h4>
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <MapPin className="w-3 h-3" />
                                                        <span className="text-[10px] font-medium">{match.location}</span>
                                                    </div>
                                                </div>
                                                <Button size="sm" className="w-full h-9 rounded-lg bg-primary hover:bg-primary/90 text-[10px] font-black uppercase tracking-widest"
                                                    onClick={() => setLocation(`/item/${match.id}`)}>
                                                    Initiate Recovery Protocol
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );

    const renderAssetRegistry = () => (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-white tracking-tight">Asset Registry</h2>
                </div>
                <Badge variant="outline" className="border-slate-800 text-primary text-[10px] font-black">
                    {items.length} ACTIVE RECORDS
                </Badge>
            </div>
            <div className="grid grid-cols-1 gap-3">
                {items.length === 0 ? (
                    <Card className="bg-slate-900 border-slate-800 p-12 text-center">
                        <Package className="w-8 h-8 text-slate-700 mx-auto mb-4" />
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No assets reported yet.</p>
                    </Card>
                ) : (
                    items.map((item) => (
                        <Card key={item.id} className="bg-slate-900 border-slate-800 hover:bg-slate-800/50 transition-colors group">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center",
                                        item.type === 'found' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500')}>
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-sm font-bold text-white tracking-tight">{item.title}</h4>
                                        <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400">
                                            <span className="flex items-center gap-1 uppercase tracking-widest">
                                                <Clock className="w-3 h-3" /> {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1 uppercase tracking-widest">
                                                <MapPin className="w-3 h-3" /> {item.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge className={cn("text-[9px] font-black uppercase tracking-widest border-none px-3",
                                        item.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                                            item.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-500')}>
                                        {item.status}
                                    </Badge>
                                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white" onClick={() => setLocation(`/item/${item.id}`)}>
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </motion.div>
    );

    const renderVerificationClaims = () => (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-white tracking-tight">Verification Claims</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {claims.length === 0 ? (
                    <Card className="bg-slate-900 border-slate-800 p-12 text-center">
                        <Shield className="w-8 h-8 text-slate-700 mx-auto mb-4" />
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No active claims found.</p>
                    </Card>
                ) : (
                    claims.map((claim: any) => (
                        <Card key={claim.id} className="bg-slate-900 border-slate-800 overflow-hidden">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                                        <ShieldCheck className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-black text-white uppercase tracking-widest">Protocol Claim: #{claim.id.slice(0, 8)}</h4>
                                        <p className="text-[10px] text-slate-500 font-medium">Applied on {new Date(claim.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right space-y-1">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Status</span>
                                        <Badge className={cn("text-[9px] font-black border-none uppercase tracking-widest",
                                            claim.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500' :
                                                claim.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-800 text-slate-400')}>
                                            {claim.status}
                                        </Badge>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-600" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </motion.div>
    );

    const renderSecurityProfile = () => (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <Lock className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-white tracking-tight">Security Profile</h2>
            </div>

            <Card className="bg-slate-900 border-slate-800 max-w-2xl">
                <CardContent className="p-8 space-y-8">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                                <span className="text-xl font-black text-primary capitalize">{user.username[0]}</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">{user.username}</h4>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Authorized Member ID: {user.id.slice(0, 8)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Email Address</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                        <Input
                                            id="profile-email"
                                            defaultValue={user.email || ""}
                                            className="h-10 pl-10 bg-slate-800 border-none rounded-xl text-xs font-bold text-white ring-offset-slate-900"
                                        />
                                    </div>
                                    <Button className="h-10 px-6 rounded-xl bg-primary text-[10px] font-black uppercase tracking-widest"
                                        onClick={() => {
                                            const email = (document.getElementById('profile-email') as HTMLInputElement).value;
                                            updateProfileMutation.mutate({ email });
                                        }}>
                                        Update
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-800">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Credential Rotation (Password)</Label>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                        <Input
                                            id="profile-new-password"
                                            type="password"
                                            placeholder="New Protocol Password"
                                            className="h-10 pl-10 bg-slate-800 border-none rounded-xl text-xs font-bold text-white ring-offset-slate-900"
                                        />
                                    </div>
                                    <Button className="w-full h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase tracking-widest"
                                        onClick={() => {
                                            const password = (document.getElementById('profile-new-password') as HTMLInputElement).value;
                                            if (password) updateProfileMutation.mutate({ password });
                                        }}>
                                        Rotate Credentials
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">
            {/* Sidebar */}
            <UserSidebar
                activeView={activeView}
                onViewChange={setActiveView}
                onLogout={() => logoutMutation.mutate()}
                className="w-64 flex-shrink-0"
            />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto no-scrollbar relative">
                {/* Header Background Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-primary/5 blur-[120px] pointer-events-none" />

                <div className="max-w-[1200px] mx-auto p-12 relative z-10">
                    <header className="mb-10 flex justify-between items-end">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Command Console</h1>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Sector: {activeView === 'overview' ? 'Personal Sovereignty' : activeView}</p>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Protocol Online</span>
                        </div>
                    </header>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeView}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            {activeView === 'overview' && renderOverview()}
                            {activeView === 'matches' && renderMatches()}
                            {activeView === 'reports' && renderAssetRegistry()}
                            {activeView === 'claims' && renderVerificationClaims()}
                            {activeView === 'profile' && renderSecurityProfile()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
