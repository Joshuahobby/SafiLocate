import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    LayoutDashboard, Package, MapPin, LogOut, CheckCircle2, XCircle, Search,
    Trash2, Filter, MoreVertical, Gavel, AlertCircle, Users, Flag, Shield,
    Plus, Download, Menu
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

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import type { FoundItem, LostItem, User, Report } from "@shared/schema";

const addItemSchema = z.object({
    type: z.enum(["found", "lost"]),
    title: z.string().min(3, "Title is required"),
    category: z.string().min(1, "Category is required"),
    location: z.string().min(3, "Location is required"),
    date: z.string().min(1, "Date is required"),
    description: z.string().min(10, "Description is required"),
    contactName: z.string().min(2, "Contact name is required"),
    contactPhone: z.string().min(10, "Valid phone number required"),
});
type AddItemFormValues = z.infer<typeof addItemSchema>;

const createUserSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().optional(),
    role: z.enum(["user", "admin", "moderator"]),
});
type CreateUserFormValues = z.infer<typeof createUserSchema>;

export default function AdminDashboard() {
    const { user, isLoading, logoutMutation } = useAuth();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch Data - hooks must be called before any conditional returns
    const { data: foundItems = [] } = useQuery<FoundItem[]>({
        queryKey: ["/api/items", { type: "found" }],
        queryFn: () => fetch("/api/items?type=found").then(r => r.json()),
        enabled: !!user
    });

    const { data: lostItems = [] } = useQuery<LostItem[]>({
        queryKey: ["/api/items", { type: "lost" }],
        queryFn: () => fetch("/api/items?type=lost").then(r => r.json()),
        enabled: !!user
    });

    // Fetch Stats
    const { data: statsData } = useQuery({
        queryKey: ["/api/admin/stats"],
        queryFn: () => fetch("/api/admin/stats").then(r => r.json()),
        enabled: !!user
    });

    // Fetch Claims
    const { data: claimsData } = useQuery<{ items: any[]; total: number }>({
        queryKey: ["/api/claims"],
        queryFn: () => fetch("/api/claims").then(r => r.json()),
        enabled: !!user
    });
    const claims = claimsData?.items || [];

    // Fetch Activity
    const { data: activityData } = useQuery({
        queryKey: ["/api/admin/activity"],
        queryFn: () => fetch("/api/admin/activity").then(r => r.json()),
        enabled: !!user
    });

    // Fetch Users (Admin)
    const { data: usersData } = useQuery<{ users: User[]; total: number }>({
        queryKey: ["/api/admin/users"],
        queryFn: () => fetch("/api/admin/users").then(r => r.json()),
        enabled: !!user && user.role === 'admin'
    });
    const usersList = usersData?.users || [];

    // Fetch Reports (Admin)
    const { data: reportsData } = useQuery<{ items: Report[]; total: number }>({
        queryKey: ["/api/admin/reports"],
        queryFn: () => fetch("/api/admin/reports").then(r => r.json()),
        enabled: !!user && user.role === 'admin'
    });
    const reportsList = reportsData?.items || [];

    // Fetch Audit Logs
    const { data: auditLogs = [] } = useQuery<any[]>({
        queryKey: ["/api/admin/audit-logs"],
        queryFn: () => fetch("/api/admin/audit-logs").then(r => r.json()),
        enabled: !!user && user.role === 'admin'
    });

    // Fetch Settings
    const { data: settingsData } = useQuery<Record<string, string>>({
        queryKey: ["/api/admin/settings"],
        queryFn: () => fetch("/api/admin/settings").then(r => r.json()),
        enabled: !!user && user.role === 'admin'
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

    const updateClaimStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            await apiRequest("PATCH", `/api/claims/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
            queryClient.invalidateQueries({ queryKey: ["/api/items"] });
            toast({ title: "Success", description: "Claim status updated." });
        }
    });

    const [isAddItemOpen, setIsAddItemOpen] = useState(false);
    const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

    const addItemForm = useForm<AddItemFormValues>({
        resolver: zodResolver(addItemSchema),
        defaultValues: {
            type: "found",
            title: "",
            category: "other",
            location: "",
            date: new Date().toISOString().split('T')[0],
            description: "",
            contactName: "Admin",
            contactPhone: "",
        }
    });

    const createUserForm = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            username: "",
            password: "",
            email: "",
            phone: "",
            role: "user",
        }
    });

    const addItemMutation = useMutation({
        mutationFn: async (data: AddItemFormValues) => {
            const endpoint = data.type === "found" ? "/api/found-items" : "/api/lost-items";
            const payload = data.type === "found"
                ? { ...data, dateFound: data.date }
                : { ...data, dateLost: data.date, priceTier: "standard", paymentStatus: "paid" }; // Auto-pay for admin

            await apiRequest("POST", endpoint, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/items"] });
            toast({ title: "Success", description: "Item created successfully." });
            setIsAddItemOpen(false);
            addItemForm.reset();
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const createUserMutation = useMutation({
        mutationFn: async (data: CreateUserFormValues) => {
            const payload = {
                ...data,
                email: data.email || undefined,
                phone: data.phone || undefined
            };
            await apiRequest("POST", "/api/admin/users", payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({ title: "Success", description: "User created successfully." });
            setIsCreateUserOpen(false);
            createUserForm.reset();
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const handleExport = () => {
        const headers = ["ID", "Type", "Title", "Category", "Location", "Date", "Status", "Contact Name", "Contact Phone"];
        const csvContent = [
            headers.join(","),
            ...filteredItems.map(item => [
                item.id,
                item.type,
                `"${item.title.replace(/"/g, '""')}"`,
                item.category,
                `"${item.location.replace(/"/g, '""')}"`,
                (item as any).dateFound || (item as any).dateLost,
                item.status,
                item.contactName,
                item.contactPhone
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `items_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const updateUserRoleMutation = useMutation({
        mutationFn: async ({ id, role }: { id: string, role: string }) => {
            await apiRequest("PATCH", `/api/admin/users/${id}/role`, { role });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({ title: "Success", description: "User role updated." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const updateReportStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            await apiRequest("PATCH", `/api/admin/reports/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
            toast({ title: "Success", description: "Report status updated." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const updateSettingMutation = useMutation({
        mutationFn: async ({ key, value }: { key: string, value: string }) => {
            await apiRequest("PATCH", "/api/admin/settings", { key, value });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
            toast({ title: "Saved", description: "Setting updated successfully." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    // Auth Check
    useEffect(() => {
        if (!isLoading && !user) {
            setLocation("/admin/login");
        }
    }, [user, isLoading, setLocation]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Don't render if no user
    if (!user) return null;

    const allItems = [...foundItems.map(i => ({ ...i, type: 'found' })), ...lostItems.map(i => ({ ...i, type: 'lost' }))]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const sortedClaims = [...claims].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const sortedUsers = [...usersList].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const sortedReports = [...reportsList].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [typeFilter, setTypeFilter] = useState<string[]>([]);
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [claimSearchTerm, setClaimSearchTerm] = useState("");

    // Filter Logic
    const filteredItems = allItems.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter.length === 0 || statusFilter.includes(item.status);
        const matchesType = typeFilter.length === 0 || typeFilter.includes(item.type);
        return matchesSearch && matchesStatus && matchesType;
    });

    const filteredClaims = sortedClaims.filter(claim =>
        claim.claimantName.toLowerCase().includes(claimSearchTerm.toLowerCase()) ||
        claim.claimantPhone.includes(claimSearchTerm) ||
        claim.itemId.includes(claimSearchTerm)
    );

    const filteredUsers = sortedUsers.filter(u =>
        u.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(userSearchTerm.toLowerCase()))
    );

    // Stats
    const stats = [
        { name: 'Total Items', value: (statsData?.totalFound || 0) + (statsData?.totalLost || 0), icon: Package, color: 'text-blue-500' },
        { name: 'Found Reports', value: statsData?.totalFound || 0, icon: CheckCircle2, color: 'text-emerald-500' },
        { name: 'Lost Reports', value: statsData?.totalLost || 0, icon: Search, color: 'text-amber-500' },
        { name: 'Claims', value: statsData?.totalClaims || 0, icon: AlertCircle, color: 'text-orange-500' },
        { name: 'Total Revenue', value: `${(statsData?.totalRevenue || 0).toLocaleString()} RWF`, icon: Gavel, color: 'text-purple-500' },
        { name: 'Active Users', value: usersData?.total || 0, icon: Users, color: 'text-blue-600' },
    ];

    const chartData = activityData || [];

    const [activeView, setActiveView] = useState("overview");

    return (
        <div className="min-h-screen bg-slate-50/50 flex font-sans">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 sticky top-0 h-screen">
                <AdminSidebar
                    activeView={activeView}
                    onViewChange={setActiveView}
                    onLogout={() => logoutMutation.mutate()}
                />
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            {/* Mobile Sidebar Trigger */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon" className="md:hidden">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-72 bg-slate-900 border-r-slate-800">
                                    <AdminSidebar
                                        activeView={activeView}
                                        onViewChange={(view) => {
                                            setActiveView(view);
                                            // Close sheet logic is handled by Radix UI usually, but we might need a controlled state if we want to force close
                                        }}
                                        onLogout={() => logoutMutation.mutate()}
                                    />
                                </SheetContent>
                            </Sheet>

                            <div>
                                <h1 className="text-3xl font-heading font-bold text-slate-900 capitalize">
                                    {activeView === 'items' ? 'Items Management' : activeView}
                                </h1>
                                <p className="text-slate-500">
                                    {activeView === 'overview' && "System activity and stats."}
                                    {activeView === 'items' && "Manage found and lost items."}
                                    {activeView === 'claims' && "Verify item ownership claims."}
                                    {activeView === 'users' && "Manage system users and roles."}
                                    {activeView === 'reports' && "Review flagged content."}
                                </p>
                            </div>
                        </div>

                        {/* Top Actions */}
                        <div className="flex gap-2">
                            {activeView === 'items' && (
                                <>
                                    <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                                                <Plus className="w-4 h-4" /> Add Item
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>Add New Item</DialogTitle>
                                                <DialogDescription>
                                                    Create a new Found or Lost item listing directly.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <Form {...addItemForm}>
                                                <form onSubmit={addItemForm.handleSubmit((data) => addItemMutation.mutate(data))} className="space-y-4">
                                                    <FormField
                                                        control={addItemForm.control}
                                                        name="type"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Type</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select type" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="found">Found Item</SelectItem>
                                                                        <SelectItem value="lost">Lost Item</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <FormField
                                                            control={addItemForm.control}
                                                            name="category"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Category</FormLabel>
                                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select category" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            <SelectItem value="electronics">Electronics</SelectItem>
                                                                            <SelectItem value="id_document">ID/Document</SelectItem>
                                                                            <SelectItem value="wallet">Wallet</SelectItem>
                                                                            <SelectItem value="keys">Keys</SelectItem>
                                                                            <SelectItem value="clothing">Clothing</SelectItem>
                                                                            <SelectItem value="other">Other</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={addItemForm.control}
                                                            name="date"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Date</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="date" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <FormField
                                                        control={addItemForm.control}
                                                        name="title"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Title</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="e.g. Blue iPhone 13" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={addItemForm.control}
                                                        name="contactName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Contact Name</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Name" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={addItemForm.control}
                                                        name="contactPhone"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Contact Phone</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="078..." {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={addItemForm.control}
                                                        name="location"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Location</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Where was it?" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={addItemForm.control}
                                                        name="description"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Description</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Additional details..." {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <DialogFooter>
                                                        <Button type="submit" disabled={addItemMutation.isPending}>
                                                            {addItemMutation.isPending ? "Saving..." : "Create Item"}
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </Form>
                                        </DialogContent>
                                    </Dialog>
                                </>
                            )}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        <Filter className="w-4 h-4" /> Filter
                                        {(statusFilter.length > 0 || typeFilter.length > 0) && (
                                            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                                                {statusFilter.length + typeFilter.length}
                                            </Badge>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-56 p-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm text-slate-900">Status</h4>
                                            {['pending', 'active', 'claimed', 'rejected'].map(status => (
                                                <div key={status} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`status-${status}`}
                                                        checked={statusFilter.includes(status)}
                                                        onCheckedChange={(checked) => {
                                                            setStatusFilter(prev =>
                                                                checked
                                                                    ? [...prev, status]
                                                                    : prev.filter(s => s !== status)
                                                            );
                                                        }}
                                                    />
                                                    <Label htmlFor={`status-${status}`} className="text-sm capitalize">{status}</Label>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm text-slate-900">Type</h4>
                                            {['found', 'lost'].map(type => (
                                                <div key={type} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`type-${type}`}
                                                        checked={typeFilter.includes(type)}
                                                        onCheckedChange={(checked) => {
                                                            setTypeFilter(prev =>
                                                                checked
                                                                    ? [...prev, type]
                                                                    : prev.filter(t => t !== type)
                                                            );
                                                        }}
                                                    />
                                                    <Label htmlFor={`type-${type}`} className="text-sm capitalize">{type}</Label>
                                                </div>
                                            ))}
                                        </div>
                                        {(statusFilter.length > 0 || typeFilter.length > 0) && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full text-xs text-slate-500 hover:text-slate-900"
                                                onClick={() => {
                                                    setStatusFilter([]);
                                                    setTypeFilter([]);
                                                }}
                                            >
                                                Clear Filters
                                            </Button>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <Button variant="outline" className="gap-2 text-slate-700 hover:bg-slate-100" onClick={handleExport}>
                                <Download className="w-4 h-4" /> Export
                            </Button>
                        </div>
                    </div>

                    {/* View Content */}
                    {activeView === 'overview' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                            <p className="text-xs text-slate-400 mt-1">Updated just now</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Activity Chart */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-slate-800">Weekly Activity</h2>
                                <Card className="border-none shadow-sm shadow-slate-200">
                                    <CardHeader>
                                        <CardTitle>Reports Overview</CardTitle>
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
                                                    <Bar dataKey="found" name="Found" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                                                    <Bar dataKey="lost" name="Lost" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {activeView === 'items' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Items Table */}
                            <div className="lg:col-span-3 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="relative w-full md:w-96">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Search items by title or location..."
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
                                                filteredItems.map((item) => (
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
                                                                    <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: item.id, type: item.type, status: 'active' })}>
                                                                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Verify (Mark Active)
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: item.id, type: item.type, status: 'rejected' })}>
                                                                        <XCircle className="mr-2 h-4 w-4 text-orange-500" /> Reject
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
                        </div>
                    )}

                    {activeView === 'claims' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Card className="border-none shadow-sm shadow-slate-200">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <CardTitle>Claims Verification</CardTitle>
                                            <div className="relative w-64">
                                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                                                <Input
                                                    placeholder="Search claims..."
                                                    className="pl-8 bg-white h-9"
                                                    value={claimSearchTerm}
                                                    onChange={(e) => setClaimSearchTerm(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <Badge variant="outline">
                                            {claims.filter(c => c.status === 'pending').length} Pending
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Claimant</TableHead>
                                                <TableHead>Item ID</TableHead>
                                                <TableHead>Description (Proof)</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredClaims.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                                        No claims found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredClaims.map((claim) => (
                                                    <TableRow key={claim.id}>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{claim.claimantName}</span>
                                                                <span className="text-xs text-slate-500">{claim.claimantPhone}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-mono text-xs">{claim.itemId}</TableCell>
                                                        <TableCell className="max-w-xs truncate" title={claim.description}>
                                                            {claim.description}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={claim.status === 'verified' ? 'default' : 'outline'}>
                                                                {claim.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {claim.status === 'pending' && (
                                                                <div className="flex justify-end gap-2">
                                                                    <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                        onClick={() => updateClaimStatusMutation.mutate({ id: claim.id, status: 'verified' })}>
                                                                        <CheckCircle2 className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                        onClick={() => updateClaimStatusMutation.mutate({ id: claim.id, status: 'rejected' })}>
                                                                        <XCircle className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeView === 'users' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Card className="border-none shadow-sm shadow-slate-200">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>User Management</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <div className="relative w-64">
                                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                                                <Input
                                                    placeholder="Search users..."
                                                    className="pl-8 bg-white h-9"
                                                    value={userSearchTerm}
                                                    onChange={(e) => setUserSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
                                                        <Plus className="w-4 h-4" /> Create User
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Create New User</DialogTitle>
                                                        <DialogDescription>
                                                            Add a new user to the system.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <Form {...createUserForm}>
                                                        <form onSubmit={createUserForm.handleSubmit((data) => createUserMutation.mutate(data))} className="space-y-4">
                                                            <FormField
                                                                control={createUserForm.control}
                                                                name="username"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Username</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder="username" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={createUserForm.control}
                                                                name="password"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Password</FormLabel>
                                                                        <FormControl>
                                                                            <Input type="password" placeholder="******" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={createUserForm.control}
                                                                name="email"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Email (Optional)</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder="email@example.com" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={createUserForm.control}
                                                                name="role"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Role</FormLabel>
                                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                            <FormControl>
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder="Select role" />
                                                                                </SelectTrigger>
                                                                            </FormControl>
                                                                            <SelectContent>
                                                                                <SelectItem value="user">User</SelectItem>
                                                                                <SelectItem value="moderator">Moderator</SelectItem>
                                                                                <SelectItem value="admin">Admin</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <DialogFooter>
                                                                <Button type="submit" disabled={createUserMutation.isPending}>
                                                                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                                                                </Button>
                                                            </DialogFooter>
                                                        </form>
                                                    </Form>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Joined</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredUsers.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                                                        No users found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredUsers.map((u) => (
                                                    <TableRow key={u.id}>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{u.username}</span>
                                                                <span className="text-xs text-slate-500">{u.email || "No email"}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={u.role === 'admin' ? 'destructive' : 'secondary'}>
                                                                {u.role}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-slate-500">
                                                            {new Date(u.createdAt).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end">
                                                                <Select
                                                                    defaultValue={u.role}
                                                                    onValueChange={(val) => updateUserRoleMutation.mutate({ id: u.id, role: val })}
                                                                    disabled={u.id === user.id} // Prevent changing own role for safety
                                                                >
                                                                    <SelectTrigger className="w-[110px] h-8 text-xs">
                                                                        <SelectValue placeholder="Role" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="user">User</SelectItem>
                                                                        <SelectItem value="moderator">Moderator</SelectItem>
                                                                        <SelectItem value="admin">Admin</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeView === 'reports' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Card className="border-none shadow-sm shadow-slate-200">
                                <CardHeader>
                                    <CardTitle>System Reports</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sortedReports.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                                                        No reports found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                sortedReports.map((report) => (
                                                    <TableRow key={report.id}>
                                                        <TableCell>
                                                            <Badge variant="outline" className="capitalize">
                                                                {report.reason.replace('_', ' ')}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="max-w-md truncate">
                                                            {report.description || "No description"}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'}>
                                                                {report.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-slate-500">
                                                            {new Date(report.createdAt).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {report.status === 'pending' && (
                                                                <div className="flex justify-end gap-2">
                                                                    {report.itemId && (
                                                                        <Link to={`/item/${report.itemId}`}>
                                                                            <Button size="sm" variant="ghost" title="View Item">
                                                                                <Package className="w-4 h-4" />
                                                                            </Button>
                                                                        </Link>
                                                                    )}
                                                                    {report.claimId && (
                                                                        <Button size="sm" variant="ghost" title="View Claim" onClick={() => {
                                                                            setClaimSearchTerm(report.claimId!);
                                                                            setActiveView('claims');
                                                                        }}>
                                                                            <AlertCircle className="w-4 h-4" />
                                                                        </Button>
                                                                    )}

                                                                    <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                        onClick={() => updateReportStatusMutation.mutate({ id: report.id, status: 'resolved' })} title="Mark Resolved">
                                                                        <CheckCircle2 className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button size="sm" variant="outline" className="text-slate-600 hover:text-slate-700 hover:bg-slate-50"
                                                                        onClick={() => updateReportStatusMutation.mutate({ id: report.id, status: 'dismissed' })} title="Dismiss">
                                                                        <XCircle className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeView === 'activity' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Card className="border-none shadow-sm shadow-slate-200">
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Admin</TableHead>
                                                <TableHead>Action</TableHead>
                                                <TableHead>Entity</TableHead>
                                                <TableHead>Details</TableHead>
                                                <TableHead>Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {auditLogs.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                                        No activity logs found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                auditLogs.map((log) => (
                                                    <TableRow key={log.id}>
                                                        <TableCell className="font-medium">
                                                            {log.adminName}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="capitalize">
                                                                {log.action.replace('_', ' ')}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-slate-500 text-sm">
                                                            {log.entityType} #{log.entityId?.substring(0, 8)}
                                                        </TableCell>
                                                        <TableCell className="text-xs font-mono text-slate-500 max-w-xs truncate">
                                                            {JSON.stringify(log.details)}
                                                        </TableCell>
                                                        <TableCell className="text-slate-500 text-sm">
                                                            {new Date(log.createdAt).toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeView === 'settings' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Card className="border-none shadow-sm shadow-slate-200">
                                <CardHeader>
                                    <CardTitle>Platform Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Listing Fee (RWF)</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    defaultValue={settingsData?.listing_fee || "1000"}
                                                    id="setting-listing_fee"
                                                />
                                                <Button onClick={() => {
                                                    const val = (document.getElementById('setting-listing_fee') as HTMLInputElement).value;
                                                    updateSettingMutation.mutate({ key: 'listing_fee', value: val });
                                                }}>Save</Button>
                                            </div>
                                            <p className="text-xs text-slate-500">Fee charged for Lost Item listings.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Listing Duration (Days)</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    defaultValue={settingsData?.listing_duration || "30"}
                                                    id="setting-listing_duration"
                                                />
                                                <Button onClick={() => {
                                                    const val = (document.getElementById('setting-listing_duration') as HTMLInputElement).value;
                                                    updateSettingMutation.mutate({ key: 'listing_duration', value: val });
                                                }}>Save</Button>
                                            </div>
                                            <p className="text-xs text-slate-500">How long items remain active before expiration.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Require Admin Approval</Label>
                                            <Select
                                                defaultValue={settingsData?.require_approval || "true"}
                                                onValueChange={(val) => updateSettingMutation.mutate({ key: 'require_approval', value: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="true">Yes (Recommended)</SelectItem>
                                                    <SelectItem value="false">No (Auto-publish)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-slate-500">If Yes, found items must be approved by admin.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </main >
        </div >
    );
}
