import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
    LayoutDashboard,
    Package,
    MapPin,
    LogOut,
    CheckCircle2,
    XCircle,
    Search,
    Trash2,
    Filter,
    MoreVertical
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { FoundItem, LostItem } from "@shared/schema";

export default function AdminDashboard() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");

    // Auth Check
    useEffect(() => {
        if (sessionStorage.getItem("admin_token") !== "authenticated") {
            setLocation("/admin/login");
        }
    }, [setLocation]);

    // Fetch Data
    const { data: foundItems = [] } = useQuery<FoundItem[]>({
        queryKey: ["/api/items", { type: "found" }],
        queryFn: () => fetch("/api/items?type=found").then(r => r.json())
    });

    const { data: lostItems = [] } = useQuery<LostItem[]>({
        queryKey: ["/api/items", { type: "lost" }],
        queryFn: () => fetch("/api/items?type=lost").then(r => r.json())
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, type, status }: { id: string, type: string, status: string }) => {
            await apiRequest("PATCH", `/api/items/${id}`, { type, status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/items"] });
            toast({ title: "Success", description: "Item status updated." });
        }
    });

    const deleteItemMutation = useMutation({
        mutationFn: async ({ id, type }: { id: string, type: string }) => {
            await apiRequest("DELETE", `/api/items/${id}?type=${type}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/items"] });
            toast({ title: "Deleted", description: "Item removed from database." });
        }
    });

    const allItems = [...foundItems.map(i => ({ ...i, type: 'found' })), ...lostItems.map(i => ({ ...i, type: 'lost' }))];

    // Filter Logic
    const filteredItems = allItems.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats
    const stats = [
        { name: 'Total Items', value: allItems.length, icon: Package, color: 'text-blue-500' },
        { name: 'Found Reports', value: foundItems.length, icon: CheckCircle2, color: 'text-emerald-500' },
        { name: 'Lost Reports', value: lostItems.length, icon: Search, color: 'text-amber-500' },
    ];

    const chartData = [
        { name: 'Mon', items: 4 },
        { name: 'Tue', items: 3 },
        { name: 'Wed', items: 7 },
        { name: 'Thu', items: 2 },
        { name: 'Fri', items: 6 },
        { name: 'Sat', items: 8 },
        { name: 'Sun', items: 5 },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col sticky top-0 h-screen">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">S</div>
                        SafiAdmin
                    </h2>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <Button variant="ghost" className="w-full justify-start text-white bg-white/10 hover:bg-white/20 hover:text-white">
                        <LayoutDashboard className="mr-2 w-4 h-4" /> Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
                        <Package className="mr-2 w-4 h-4" /> All Items
                    </Button>
                    <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
                        <MapPin className="mr-2 w-4 h-4" /> Locations
                    </Button>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => {
                        sessionStorage.removeItem("admin_token");
                        setLocation("/admin/login");
                    }}>
                        <LogOut className="mr-2 w-4 h-4" /> Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-slate-900">Dashboard</h1>
                            <p className="text-slate-500">Overview of system activity and reports.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="gap-2">
                                <Filter className="w-4 h-4" /> Filter
                            </Button>
                            <Button className="bg-slate-900 text-white hover:bg-slate-800">
                                Export Data
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stats.map((stat) => (
                            <Card key={stat.name} className="border-none shadow-sm shadow-slate-200">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-500">
                                        {stat.name}
                                    </CardTitle>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-slate-400 mt-1">+12% from last week</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Recent Activity Table */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-800">Recent Items</h2>
                                <div className="relative w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search items..."
                                        className="pl-8 bg-white"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Card className="border-none shadow-sm shadow-slate-200 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredItems.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                                                    No items found matching your search.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredItems.slice(0, 5).map((item) => (
                                                <TableRow key={item.id} className="hover:bg-slate-50/50">
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col">
                                                            <span>{item.title}</span>
                                                            <span className="text-xs text-slate-400 uppercase">{item.type}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className={
                                                            item.status === 'pending' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : 'bg-green-100 text-green-700 hover:bg-green-100'
                                                        }>
                                                            {item.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">{item.location}</TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: item.id, type: item.type, status: 'verified' })}>
                                                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Verify
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-red-600" onClick={() => deleteItemMutation.mutate({ id: item.id, type: item.type })}>
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </Card>
                        </div>

                        {/* Activity Chart */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-800">Weekly Reports</h2>
                            <Card className="border-none shadow-sm shadow-slate-200">
                                <CardHeader>
                                    <CardTitle>Activity Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                                <Tooltip
                                                    cursor={{ fill: '#f1f5f9' }}
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Bar dataKey="items" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
