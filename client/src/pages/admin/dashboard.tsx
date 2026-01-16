import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    LayoutDashboard, Package, MapPin, LogOut, CheckCircle2, XCircle, Search,
    Trash2, Filter, MoreVertical, Gavel, AlertCircle, Users, Flag, Shield,
    Plus, Download, Menu, Copy, History, ShieldAlert, ShieldCheck, Pencil,
    ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight
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
import { ThemeToggleSimple } from "@/components/ui/theme-toggle";
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
import { Switch } from "@/components/ui/switch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
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
    isPaid: z.boolean().optional(),
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

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
};

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
    }
};

export default function AdminDashboard() {
    const { user, isLoading, logoutMutation } = useAuth();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeView, setActiveView] = useState("overview");
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [typeFilter, setTypeFilter] = useState<string[]>([]);
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [claimSearchTerm, setClaimSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [auditLogFilter, setAuditLogFilter] = useState<{ action?: string; adminId?: string }>({});
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [dateFilter, setDateFilter] = useState<{ start?: string; end?: string }>({});
    const itemsPerPage = 20;

    // Fetch Items with Pagination (Admin)
    const { data: itemsData } = useQuery<{ items: any[]; total: number; page: number; limit: number; totalPages: number }>({
        queryKey: ["/api/admin/items", { page: currentPage, limit: itemsPerPage, status: statusFilter.length === 1 ? statusFilter[0] : undefined, type: typeFilter.length === 1 ? typeFilter[0] : undefined, dateFilter }],
        queryFn: () => {
            const params = new URLSearchParams();
            params.set('page', currentPage.toString());
            params.set('limit', itemsPerPage.toString());
            if (statusFilter.length === 1) params.set('status', statusFilter[0]);
            if (typeFilter.length === 1) params.set('type', typeFilter[0]);
            if (searchTerm) params.set('search', searchTerm);
            if (dateFilter.start) params.set('startDate', dateFilter.start);
            if (dateFilter.end) params.set('endDate', dateFilter.end);
            return fetch(`/api/admin/items?${params}`).then(r => r.json());
        },
        enabled: !!user
    });
    const allItems = itemsData?.items || [];
    const totalItems = itemsData?.total || 0;
    const totalPages = itemsData?.totalPages || 1;

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
    // Fetch Audit Logs
    const { data: auditLogs = [] } = useQuery<any[]>({
        queryKey: ["/api/admin/audit-logs", auditLogFilter],
        queryFn: () => {
            const params = new URLSearchParams();
            if (auditLogFilter.action) params.set('action', auditLogFilter.action);
            if (auditLogFilter.adminId) params.set('adminId', auditLogFilter.adminId);
            return fetch(`/api/admin/audit-logs?${params}`).then(r => r.json());
        },
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

    const bulkActionMutation = useMutation({
        mutationFn: async ({ action, items }: { action: string, items: { id: string, type: 'found' | 'lost' }[] }) => {
            await apiRequest("POST", "/api/admin/items/bulk", { action, items });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/items"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/audit-logs"] });
            toast({ title: "Success", description: "Bulk action completed." });
            setSelectedItems([]);
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const [isAddItemOpen, setIsAddItemOpen] = useState(false);
    const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
    const [isEditItemOpen, setIsEditItemOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

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
            isPaid: true,
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
                : {
                    ...data,
                    dateLost: data.date,
                    priceTier: "standard",
                    paymentStatus: data.isPaid ? "paid" : "unpaid"
                };

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

    const editItemMutation = useMutation({
        mutationFn: async (data: { id: string; type: string;[key: string]: any }) => {
            await apiRequest("PUT", `/api/items/${data.id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/items"] });
            toast({ title: "Success", description: "Item updated successfully." });
            setIsEditItemOpen(false);
            setEditingItem(null);
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

    // Show loading state - only on initial load or if user is undefined
    if (isLoading && !user) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Don't render if no user
    if (!user) return null;

    const sortedClaims = [...claims].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const sortedUsers = [...usersList].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const sortedReports = [...reportsList].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


    // Items are now server-side filtered and paginated
    const filteredItems = allItems;

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
        { name: 'Found Records', value: statsData?.totalFound || 0, trend: statsData?.trends?.found, icon: CheckCircle2, color: 'text-emerald-500' },
        { name: 'Lost Reports', value: statsData?.totalLost || 0, trend: statsData?.trends?.lost, icon: Search, color: 'text-amber-500' },
        { name: 'Claims Queue', value: statsData?.totalClaims || 0, trend: statsData?.trends?.claims, icon: AlertCircle, color: 'text-orange-500' },
        { name: 'System Revenue', value: `${(statsData?.totalRevenue || 0).toLocaleString()} RWF`, secondary: 'Verified Payments', icon: Gavel, color: 'text-purple-500' },
        { name: 'Claim Success', value: `${statsData?.successRate || 0}%`, secondary: 'Protocol Resolution', icon: ShieldCheck, color: 'text-blue-500' },
        { name: 'Active Users', value: usersData?.total || 0, icon: Users, color: 'text-blue-600' },
    ];

    const chartData = activityData || [];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans selection:bg-blue-500/20 overflow-x-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-72 sticky top-0 h-screen overflow-hidden">
                <AdminSidebar
                    activeView={activeView}
                    onViewChange={setActiveView}
                    onLogout={() => logoutMutation.mutate()}
                />
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto w-full">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <motion.div variants={fadeInUp} className="flex items-center gap-4">
                            {/* Mobile Sidebar Trigger */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon" className="md:hidden rounded-xl border-slate-200">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-72 bg-hero-wave border-r-white/10">
                                    <AdminSidebar
                                        activeView={activeView}
                                        onViewChange={(view) => {
                                            setActiveView(view);
                                        }}
                                        onLogout={() => logoutMutation.mutate()}
                                    />
                                </SheetContent>
                            </Sheet>

                            <div className="space-y-1">
                                <h1 className="text-3xl font-bold tracking-tight text-gradient">
                                    {activeView === 'overview' ? 'Sovereign Analytics' :
                                        activeView === 'items' ? 'Asset Registry' :
                                            activeView === 'claims' ? 'Verification Queue' :
                                                activeView === 'users' ? 'Access Control' :
                                                    activeView === 'reports' ? 'Audit Stream' :
                                                        activeView === 'activity' ? 'System Logs' : 'Protocol Settings'}
                                </h1>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest leading-none mt-1">
                                    {activeView === 'overview' ? 'Live System Monitoring' :
                                        activeView === 'items' ? 'Manage Found and Lost Records' :
                                            activeView === 'claims' ? 'Validate Ownership Integrity' :
                                                activeView === 'users' ? 'Administrator and User Entities' :
                                                    activeView === 'reports' ? 'Flagged Content Stream' :
                                                        activeView === 'activity' ? 'Transactional History' : 'Global Parameters'}
                                </p>
                            </div>
                        </motion.div>

                        <div className="flex items-center gap-3">
                            <ThemeToggleSimple />
                            {activeView === 'items' && (
                                <motion.div variants={fadeInUp} className="flex gap-3">
                                    <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 relative group overflow-hidden">
                                                <motion.div
                                                    className="absolute inset-x-0 inset-y-[-100%] bg-white/10 skew-y-[45deg]"
                                                    animate={{ translateY: ["-100%", "200%"] }}
                                                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                                />
                                                <Plus className="w-4 h-4 mr-2" />
                                                <span className="relative">Add Entry</span>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto border-none shadow-2xl rounded-2xl">
                                            <DialogHeader>
                                                <DialogTitle className="text-xl font-black uppercase tracking-tight">Manual Entry</DialogTitle>
                                                <DialogDescription className="text-xs font-bold text-slate-500">
                                                    Initialize a new high-security registry record.
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

                                                    {/* Auto-Pay Toggle for Lost Items */}
                                                    {addItemForm.watch('type') === 'lost' && (
                                                        <FormField
                                                            control={addItemForm.control}
                                                            name="isPaid"
                                                            render={({ field }) => (
                                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-slate-50 mb-4">
                                                                    <div className="space-y-0.5">
                                                                        <FormLabel className="text-sm font-bold">Mark as Paid</FormLabel>
                                                                        <p className="text-[10px] text-muted-foreground">Automatically verified as paid standard tier</p>
                                                                    </div>
                                                                    <FormControl>
                                                                        <Switch
                                                                            checked={field.value}
                                                                            onCheckedChange={field.onChange}
                                                                        />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )}

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
                                                    <DialogFooter className="pt-4">
                                                        <Button type="submit" disabled={addItemMutation.isPending} className="h-11 px-8 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                                                            {addItemMutation.isPending ? "Validating..." : "Create Record"}
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </Form>
                                        </DialogContent>
                                    </Dialog>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] font-black uppercase tracking-widest transition-all">
                                                <Filter className="w-4 h-4 mr-2" /> Filter
                                                {(statusFilter.length > 0 || typeFilter.length > 0) && (
                                                    <Badge className="ml-2 bg-primary text-white text-[9px] h-4 min-w-4 flex items-center justify-center rounded-full p-0">
                                                        {statusFilter.length + typeFilter.length}
                                                    </Badge>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-64 p-5 rounded-2xl border-none shadow-2xl">
                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Protocol</h4>
                                                    <div className="space-y-2">
                                                        {['pending', 'active', 'claimed', 'rejected'].map(status => (
                                                            <div key={status} className="flex items-center space-x-3 group cursor-pointer">
                                                                <Checkbox
                                                                    id={`status-${status}`}
                                                                    className="rounded-md border-slate-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                                    checked={statusFilter.includes(status)}
                                                                    onCheckedChange={(checked) => {
                                                                        setStatusFilter(prev =>
                                                                            checked
                                                                                ? [...prev, status]
                                                                                : prev.filter(s => s !== status)
                                                                        );
                                                                    }}
                                                                />
                                                                <Label htmlFor={`status-${status}`} className="text-xs font-bold text-slate-700 cursor-pointer uppercase tracking-tight group-hover:text-primary transition-colors">{status}</Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Record Type</h4>
                                                    <div className="space-y-2">
                                                        {['found', 'lost'].map(type => (
                                                            <div key={type} className="flex items-center space-x-3 group cursor-pointer">
                                                                <Checkbox
                                                                    id={`type-${type}`}
                                                                    className="rounded-md border-slate-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                                    checked={typeFilter.includes(type)}
                                                                    onCheckedChange={(checked) => {
                                                                        setTypeFilter(prev =>
                                                                            checked
                                                                                ? [...prev, type]
                                                                                : prev.filter(t => t !== type)
                                                                        );
                                                                    }}
                                                                />
                                                                <Label htmlFor={`type-${type}`} className="text-xs font-bold text-slate-700 cursor-pointer uppercase tracking-tight group-hover:text-primary transition-colors">{type}</Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Protocol</h4>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        <Input
                                                            type="date"
                                                            className="h-8 text-[10px] bg-slate-50 border-slate-200"
                                                            value={dateFilter.start || ''}
                                                            onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                                                        />
                                                        <Input
                                                            type="date"
                                                            className="h-8 text-[10px] bg-slate-50 border-slate-200"
                                                            value={dateFilter.end || ''}
                                                            onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>
                                                {(statusFilter.length > 0 || typeFilter.length > 0 || dateFilter.start || dateFilter.end) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="w-full h-8 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 hover:bg-rose-50/50"
                                                        onClick={() => {
                                                            setStatusFilter([]);
                                                            setTypeFilter([]);
                                                            setDateFilter({});
                                                        }}
                                                    >
                                                        Clear Active Filters
                                                    </Button>
                                                )}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] font-black uppercase tracking-widest transition-all" onClick={handleExport}>
                                        <Download className="w-4 h-4 mr-2" /> Export
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    </div> {/* End Header Flex */}

                    <AnimatePresence mode="wait">
                        {activeView === 'overview' && (
                            <motion.div
                                key="overview"
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={staggerContainer}
                                className="space-y-8"
                            >
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {stats.map((stat, idx) => (
                                        <motion.div key={stat.name} variants={fadeInUp} className="h-full">
                                            <Card className="h-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                                                        {stat.name}
                                                    </CardTitle>
                                                    <div className={cn("p-2 rounded-xl transition-all duration-500 group-hover:rotate-12 group-hover:scale-110", stat.color.replace('text-', 'bg-').replace('-500', '-500/10').replace('-600', '-600/10'))}>
                                                        <stat.icon className={cn("h-4 w-4", stat.color)} />
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex items-end justify-between">
                                                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{stat.value}</div>
                                                        {stat.trend !== undefined && (
                                                            <div className={cn("flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-md",
                                                                stat.trend > 0 ? "bg-emerald-500/10 text-emerald-600" :
                                                                    stat.trend < 0 ? "bg-rose-500/10 text-rose-600" : "bg-slate-500/10 text-slate-600")}>
                                                                {stat.trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : stat.trend < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
                                                                {Math.abs(stat.trend)}%
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                        <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.secondary || 'Live Sovereignty'}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Activity Chart */}
                                <motion.div variants={fadeInUp} className="space-y-6">
                                    <div className="flex items-center gap-4 px-1">
                                        <div className="w-1 h-6 bg-blue-600 rounded-full" />
                                        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Activity Monitor</h2>
                                    </div>
                                    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl overflow-hidden">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">System Activity</CardTitle>
                                                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cumulative Protocol Events (Last 7 Cycles)</p>
                                                </div>
                                                <Badge variant="outline" className="rounded-xl px-4 py-1 text-[10px] font-semibold uppercase tracking-widest border-primary/20 bg-primary/5 text-primary">
                                                    Real-time Stream
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="h-[350px] w-full pt-6">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis
                                                            dataKey="name"
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                                                            dy={10}
                                                        />
                                                        <YAxis
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                                                        />
                                                        <Tooltip
                                                            cursor={{ fill: '#f8fafc' }}
                                                            contentStyle={{
                                                                borderRadius: '12px',
                                                                border: 'none',
                                                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                                fontSize: '10px',
                                                                fontWeight: 900,
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.05em'
                                                            }}
                                                        />
                                                        <Bar dataKey="found" name="Found" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={24} />
                                                        <Bar dataKey="lost" name="Lost" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={24} />
                                                        <Bar dataKey="claims" name="Claims" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={24} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Categories & Trends Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <motion.div variants={fadeInUp} className="space-y-6">
                                        <div className="flex items-center gap-4 px-1">
                                            <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                                            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Sector Analysis</h2>
                                        </div>
                                        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl p-6">
                                            <div className="space-y-4">
                                                {statsData?.categories?.map((cat: any) => (
                                                    <div key={cat.name} className="space-y-1.5">
                                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                            <span>{cat.name}</span>
                                                            <span className="text-slate-900">{cat.value}</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(cat.value / (statsData?.totalFound + statsData?.totalLost || 1)) * 100}%` }}
                                                                className="h-full bg-primary"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    </motion.div>

                                    <motion.div variants={fadeInUp} className="space-y-6">
                                        <div className="flex items-center gap-4 px-1">
                                            <div className="w-1 h-6 bg-purple-500 rounded-full" />
                                            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Protocol Health</h2>
                                        </div>
                                        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl p-6 flex items-center justify-center">
                                            <div className="text-center space-y-2">
                                                <div className="relative inline-flex items-center justify-center">
                                                    <svg className="w-32 h-32 transform -rotate-90">
                                                        <circle
                                                            cx="64"
                                                            cy="64"
                                                            r="58"
                                                            stroke="currentColor"
                                                            strokeWidth="8"
                                                            fill="transparent"
                                                            className="text-slate-100"
                                                        />
                                                        <motion.circle
                                                            cx="64"
                                                            cy="64"
                                                            r="58"
                                                            stroke="currentColor"
                                                            strokeWidth="8"
                                                            strokeDasharray={364.4}
                                                            initial={{ strokeDashoffset: 364.4 }}
                                                            animate={{ strokeDashoffset: 364.4 - (364.4 * (statsData?.successRate || 0)) / 100 }}
                                                            fill="transparent"
                                                            className="text-primary"
                                                        />
                                                    </svg>
                                                    <span className="absolute text-2xl font-black text-slate-900">{statsData?.successRate}%</span>
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Claim Success Rate</p>
                                            </div>
                                        </Card>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}

                        {activeView === 'items' && (
                            <motion.div
                                key="items"
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={fadeInUp}
                                className="space-y-6"
                            >
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div className="relative w-full md:w-96">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                        <Input
                                            placeholder="Audit registry by title or location..."
                                            className="pl-9 h-10 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs font-bold placeholder:text-slate-400 placeholder:font-normal focus-visible:ring-1 focus-visible:ring-blue-500/20 transition-all dark:text-slate-200"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-200 dark:border-slate-800 text-slate-400 h-7 px-3 rounded-lg">
                                            {filteredItems.length} Records Found
                                        </Badge>
                                    </div>
                                </div>

                                <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                                            <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-slate-800">
                                                <TableHead className="w-12 py-4">
                                                    <Checkbox
                                                        checked={selectedItems.length > 0 && selectedItems.length === allItems.length}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) setSelectedItems(allItems.map(i => i.id));
                                                            else setSelectedItems([]);
                                                        }}
                                                    />
                                                </TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Item Identity</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 text-center">Protocol ID</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Status</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Sector</TableHead>
                                                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest py-4 pr-6">Management</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredItems.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-20 text-slate-400">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <Package className="w-8 h-8 opacity-20" />
                                                            <p className="text-[11px] font-black uppercase tracking-widest opacity-50">Zero records matching current criteria</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredItems.map((item) => (
                                                    <TableRow key={item.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                                                        <TableCell>
                                                            <Checkbox
                                                                checked={selectedItems.includes(item.id)}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) setSelectedItems(prev => [...prev, item.id]);
                                                                    else setSelectedItems(prev => prev.filter(id => id !== item.id));
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn("w-1 h-8 rounded-full", item.type === 'found' ? 'bg-emerald-500' : 'bg-orange-500')} title={item.type} />
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="text-xs font-black text-slate-900 group-hover:text-primary transition-colors truncate max-w-[200px]">{item.title}</span>
                                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{item.type} protocol</span>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/50 border border-slate-200/50 hover:bg-slate-100 transition-colors cursor-help group/id"
                                                                onClick={() => {
                                                                    const id = (item as any).identifier;
                                                                    if (id) {
                                                                        navigator.clipboard.writeText(id);
                                                                        toast({ title: "Copied", description: "Protocol ID copied to clipboard." });
                                                                    }
                                                                }}
                                                            >
                                                                <span className="font-mono text-[10px] font-bold text-slate-600">
                                                                    {(item as any).identifier || 'NULL'}
                                                                </span>
                                                                <Copy className="w-3 h-3 text-slate-400 group-hover/id:text-primary transition-colors" />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className={cn(
                                                                "text-[9px] font-black uppercase tracking-widest h-6 px-2.5 rounded-md border-none",
                                                                item.status === 'pending' ? 'bg-blue-500/10 text-blue-600' :
                                                                    item.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' :
                                                                        item.status === 'claimed' ? 'bg-purple-500/10 text-purple-600' :
                                                                            'bg-slate-500/10 text-slate-600'
                                                            )}>
                                                                {item.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{item.location}</TableCell>
                                                        <TableCell className="text-right pr-6">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 transition-colors">
                                                                        <MoreVertical className="h-4 w-4 text-slate-400" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl border-none shadow-2xl">
                                                                    <DropdownMenuItem className="rounded-lg text-[10px] font-black uppercase tracking-widest py-2.5 cursor-pointer" onClick={() => updateStatusMutation.mutate({ id: item.id, type: item.type, status: 'active' })}>
                                                                        <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Verify Entry
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="rounded-lg text-[10px] font-black uppercase tracking-widest py-2.5 cursor-pointer" onClick={() => updateStatusMutation.mutate({ id: item.id, type: item.type, status: 'rejected' })}>
                                                                        <XCircle className="mr-2 h-4 w-4 text-orange-500" /> Reject Entry
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="rounded-lg text-[10px] font-black uppercase tracking-widest py-2.5 cursor-pointer" onClick={() => { setEditingItem(item); setIsEditItemOpen(true); }}>
                                                                        <Pencil className="mr-2 h-4 w-4 text-blue-500" /> Edit Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator className="bg-slate-50 mx-2 my-1" />
                                                                    <DropdownMenuItem className="rounded-lg text-[10px] font-black uppercase tracking-widest py-2.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer" onClick={() => deleteItemMutation.mutate({ id: item.id, type: item.type })}>
                                                                        <Trash2 className="mr-2 h-4 w-4" /> Purge Record
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>

                                    {selectedItems.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 20 }}
                                            className="absolute bottom-0 left-0 right-0 bg-primary/90 text-white p-4 flex items-center justify-between rounded-b-xl shadow-lg"
                                        >
                                            <p className="text-sm font-bold">{selectedItems.length} items selected</p>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white/20 hover:bg-white/30 text-white"
                                                    onClick={() => {
                                                        const items = selectedItems.map(id => {
                                                            const item = allItems.find(i => i.id === id);
                                                            return item ? { id, type: item.type } : null;
                                                        }).filter(Boolean) as { id: string, type: 'found' | 'lost' }[];
                                                        bulkActionMutation.mutate({ items, action: 'verify' });
                                                    }}
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Verify Selected
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest bg-rose-600/80 hover:bg-rose-700/80 text-white"
                                                    onClick={() => {
                                                        const items = selectedItems.map(id => {
                                                            const item = allItems.find(i => i.id === id);
                                                            return item ? { id, type: item.type } : null;
                                                        }).filter(Boolean) as { id: string, type: 'found' | 'lost' }[];

                                                        if (confirm(`Are you sure you want to delete ${items.length} items?`)) {
                                                            bulkActionMutation.mutate({ items, action: 'delete' });
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Selected
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest text-white/80 hover:bg-white/10"
                                                    onClick={() => setSelectedItems([])}
                                                >
                                                    Clear Selection
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </Card>

                                {/* Pagination Controls */}
                                <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        Showing {allItems.length} of {totalItems} records
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                                        </Button>
                                        <span className="text-xs font-bold text-slate-600 px-3">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage >= totalPages}
                                        >
                                            Next <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeView === 'claims' && (
                            <motion.div
                                key="claims"
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={fadeInUp}
                                className="space-y-6"
                            >
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div className="relative w-full md:w-96">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                        <Input
                                            placeholder="Audit claims by claimant or item identity..."
                                            className="pl-9 h-10 bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs font-bold focus-visible:ring-1 focus-visible:ring-blue-500/20 transition-all dark:text-slate-200"
                                            value={claimSearchTerm}
                                            onChange={(e) => setClaimSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-200 dark:border-slate-800 text-slate-400 h-7 px-3 rounded-lg">
                                        {claims.filter(c => c.status === 'pending').length} Pending Verifications
                                    </Badge>
                                </div>

                                <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                                            <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-slate-800">
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Claimant Identity</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Target Protocol</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Verification Proof</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Status</TableHead>
                                                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest py-4 pr-6">Validation</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredClaims.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-20 text-slate-400">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <AlertCircle className="w-8 h-8 opacity-20" />
                                                            <p className="text-[11px] font-black uppercase tracking-widest opacity-50">No verification requests found</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredClaims.map((claim) => (
                                                    <TableRow key={claim.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50/50 group">
                                                        <TableCell className="py-4">
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-xs font-black text-slate-900">{claim.claimantName}</span>
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{claim.claimantPhone}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 border border-slate-200/50">
                                                                <span className="font-mono text-[9px] font-bold text-slate-600">#{claim.itemId.substring(0, 8)}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="max-w-[200px]">
                                                            <p className="text-[11px] font-bold text-slate-500 leading-relaxed truncate" title={claim.description}>
                                                                {claim.description}
                                                            </p>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className={cn(
                                                                "text-[9px] font-black uppercase tracking-widest h-6 px-2.5 rounded-md border-none",
                                                                claim.status === 'pending' ? 'bg-blue-500/10 text-blue-600' :
                                                                    claim.status === 'verified' ? 'bg-emerald-500/10 text-emerald-600' :
                                                                        'bg-slate-500/10 text-slate-600'
                                                            )}>
                                                                {claim.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right pr-6">
                                                            {claim.status === 'pending' && (
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        size="icon"
                                                                        variant="outline"
                                                                        className="h-8 w-8 rounded-lg border-emerald-100 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                                                                        onClick={() => updateClaimStatusMutation.mutate({ id: claim.id, status: 'verified' })}
                                                                    >
                                                                        <CheckCircle2 className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="outline"
                                                                        className="h-8 w-8 rounded-lg border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all"
                                                                        onClick={() => updateClaimStatusMutation.mutate({ id: claim.id, status: 'rejected' })}
                                                                    >
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
                                </Card>
                            </motion.div>
                        )}

                        {activeView === 'users' && (
                            <motion.div
                                key="users"
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={fadeInUp}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <Card className="lg:col-span-2 border-none shadow-sm shadow-slate-200/50 rounded-xl overflow-hidden bg-white">
                                        <CardHeader className="pb-2 border-b border-slate-50">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-[14px] font-black uppercase tracking-tight">Active Personnel</CardTitle>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System user governance</p>
                                                </div>
                                                <div className="relative w-full md:w-64">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                                    <Input
                                                        placeholder="Search personnel..."
                                                        className="pl-9 h-9 bg-slate-50 border-none rounded-lg text-xs font-bold"
                                                        value={userSearchTerm}
                                                        onChange={(e) => setUserSearchTerm(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <Table>
                                                <TableHeader className="bg-slate-50/30">
                                                    <TableRow className="hover:bg-transparent border-0">
                                                        <TableHead className="text-[9px] font-black uppercase tracking-widest h-10">Username</TableHead>
                                                        <TableHead className="text-[9px] font-black uppercase tracking-widest h-10">Access Tier</TableHead>
                                                        <TableHead className="text-[9px] font-black uppercase tracking-widest h-10">Commission Date</TableHead>
                                                        <TableHead className="text-right text-[9px] font-black uppercase tracking-widest h-10 pr-6">Management</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredUsers.map((u) => (
                                                        <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0 group">
                                                            <TableCell className="py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-black text-slate-900">{u.username}</span>
                                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{u.email || "No secure email"}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="secondary" className={cn(
                                                                    "text-[9px] font-black uppercase tracking-widest h-5 px-2 rounded border-none",
                                                                    u.role === 'admin' ? 'bg-rose-500/10 text-rose-600' :
                                                                        u.role === 'moderator' ? 'bg-amber-500/10 text-amber-600' :
                                                                            'bg-slate-500/10 text-slate-600'
                                                                )}>
                                                                    {u.role}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-[10px] font-bold text-slate-400">
                                                                {new Date(u.createdAt).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell className="text-right pr-6">
                                                                <div className="flex justify-end">
                                                                    <Select
                                                                        defaultValue={u.role}
                                                                        onValueChange={(val) => updateUserRoleMutation.mutate({ id: u.id, role: val })}
                                                                        disabled={u.id === user.id}
                                                                    >
                                                                        <SelectTrigger className="w-[110px] h-7 text-[10px] font-black uppercase tracking-widest bg-slate-50 border-none rounded-lg focus:ring-1 focus:ring-primary/20">
                                                                            <SelectValue placeholder="Role" />
                                                                        </SelectTrigger>
                                                                        <SelectContent className="glass border-white/20 shadow-2xl rounded-2xl">
                                                                            <SelectItem value="user" className="text-[11px] font-semibold uppercase tracking-widest py-3">User</SelectItem>
                                                                            <SelectItem value="moderator" className="text-[11px] font-semibold uppercase tracking-widest py-3">Moderator</SelectItem>
                                                                            <SelectItem value="admin" className="text-[11px] font-semibold uppercase tracking-widest py-3 text-rose-500">Administrator</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>

                                    <Card className="glass-card border-none rounded-3xl overflow-hidden h-fit">
                                        <CardHeader className="pb-4">
                                            <div className="p-3 w-fit rounded-xl bg-primary/10 mb-3 border border-primary/20 shadow-sm">
                                                <ShieldAlert className="w-5 h-5 text-primary" />
                                            </div>
                                            <CardTitle className="text-lg font-bold tracking-tight text-slate-800">Personnel Onboarding</CardTitle>
                                            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed">Initialize a new high-clearance access profile.</p>
                                        </CardHeader>
                                        <CardContent>
                                            <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                                                <DialogTrigger asChild>
                                                    <Button className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all relative group overflow-hidden">
                                                        <motion.div
                                                            className="absolute inset-x-0 inset-y-[-100%] bg-white/10 skew-y-[45deg]"
                                                            animate={{ translateY: ["-100%", "200%"] }}
                                                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                                        />
                                                        <Plus className="w-4 h-4 mr-2" /> Start Onboarding
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[480px] border-none shadow-2xl rounded-3xl p-0 overflow-hidden glass">
                                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-2xl font-bold text-white tracking-tight">Access Protocol</DialogTitle>
                                                            <DialogDescription className="text-[11px] font-medium text-white/70 uppercase tracking-[0.2em] mt-2">
                                                                Authorized Personnel Initialization
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                    </div>
                                                    <div className="p-8">
                                                        <Form {...createUserForm}>
                                                            <form onSubmit={createUserForm.handleSubmit((data) => createUserMutation.mutate(data))} className="space-y-6">
                                                                <div className="grid grid-cols-2 gap-6">
                                                                    <FormField
                                                                        control={createUserForm.control}
                                                                        name="username"
                                                                        render={({ field }) => (
                                                                            <FormItem className="space-y-2">
                                                                                <FormLabel className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Codename</FormLabel>
                                                                                <FormControl>
                                                                                    <Input placeholder="J.SMITH" className="h-11 bg-white/50 border-white/40 rounded-xl text-sm font-medium focus:ring-primary/20 backdrop-blur-sm shadow-inner" {...field} />
                                                                                </FormControl>
                                                                                <FormMessage className="text-[10px] font-medium uppercase" />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={createUserForm.control}
                                                                        name="role"
                                                                        render={({ field }) => (
                                                                            <FormItem className="space-y-2">
                                                                                <FormLabel className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Access Tier</FormLabel>
                                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                                    <FormControl>
                                                                                        <SelectTrigger className="h-11 bg-white/50 border-white/40 rounded-xl text-sm font-medium focus:ring-primary/20 backdrop-blur-sm shadow-inner">
                                                                                            <SelectValue placeholder="Tier" />
                                                                                        </SelectTrigger>
                                                                                    </FormControl>
                                                                                    <SelectContent className="glass border-white/20 shadow-2xl rounded-2xl">
                                                                                        <SelectItem value="user" className="text-[11px] font-semibold uppercase tracking-widest py-3">User</SelectItem>
                                                                                        <SelectItem value="moderator" className="text-[11px] font-semibold uppercase tracking-widest py-3">Moderator</SelectItem>
                                                                                        <SelectItem value="admin" className="text-[11px] font-semibold uppercase tracking-widest py-3">Administrator</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>
                                                                <FormField
                                                                    control={createUserForm.control}
                                                                    name="password"
                                                                    render={({ field }) => (
                                                                        <FormItem className="space-y-2">
                                                                            <FormLabel className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Security Key</FormLabel>
                                                                            <FormControl>
                                                                                <Input type="password" placeholder="••••••••" className="h-11 bg-white/50 border-white/40 rounded-xl text-sm font-medium focus:ring-primary/20 backdrop-blur-sm shadow-inner" {...field} />
                                                                            </FormControl>
                                                                            <FormMessage className="text-[10px] font-medium uppercase" />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                <FormField
                                                                    control={createUserForm.control}
                                                                    name="email"
                                                                    render={({ field }) => (
                                                                        <FormItem className="space-y-2">
                                                                            <FormLabel className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Secure Communication (Optional)</FormLabel>
                                                                            <FormControl>
                                                                                <Input placeholder="hq@safilocate.proto" className="h-11 bg-white/50 border-white/40 rounded-xl text-sm font-medium focus:ring-primary/20 backdrop-blur-sm shadow-inner" {...field} />
                                                                            </FormControl>
                                                                            <FormMessage className="text-[10px] font-medium uppercase" />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                <Button type="submit" className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-[12px] font-bold uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all" disabled={createUserMutation.isPending}>
                                                                    {createUserMutation.isPending ? "INITIALIZING..." : "CONFIRM INITIALIZATION"}
                                                                </Button>
                                                            </form>
                                                        </Form>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </CardContent>
                                    </Card>
                                </div>
                            </motion.div>
                        )}

                        {activeView === 'reports' && (
                            <motion.div
                                key="reports"
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={fadeInUp}
                                className="space-y-6"
                            >
                                <Card className="glass-card border-none rounded-3xl overflow-hidden mb-8">
                                    <CardHeader className="pb-4 backdrop-blur-md bg-white/30 border-b border-white/20">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg font-bold tracking-tight text-slate-800">Audit Stream</CardTitle>
                                                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Flagged content & system reports</p>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-widest px-4 py-1.5 rounded-xl border-rose-200 text-rose-500 bg-rose-500/5 shadow-sm">
                                                {sortedReports.filter(r => r.status === 'pending').length} Critical Alerts
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <Table>
                                        <TableHeader className="bg-white/10">
                                            <TableRow className="hover:bg-transparent border-0">
                                                <TableHead className="text-[11px] font-semibold uppercase tracking-widest py-5 px-6">Violation Type</TableHead>
                                                <TableHead className="text-[11px] font-semibold uppercase tracking-widest py-5">Context</TableHead>
                                                <TableHead className="text-[11px] font-semibold uppercase tracking-widest py-5 text-center">Protocol ID</TableHead>
                                                <TableHead className="text-[11px] font-semibold uppercase tracking-widest py-5">Timestamp</TableHead>
                                                <TableHead className="text-right text-[11px] font-semibold uppercase tracking-widest py-5 pr-8">Mitigation</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sortedReports.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-20 text-slate-400">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <ShieldCheck className="w-8 h-8 opacity-20" />
                                                            <p className="text-[11px] font-black uppercase tracking-widest opacity-50">Operational Integrity Maintained</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                sortedReports.map((report) => (
                                                    <TableRow key={report.id} className="hover:bg-white/40 transition-colors border-b border-white/10 last:border-0 group">
                                                        <TableCell className="py-5 px-6">
                                                            <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-lg border-white/40 bg-white/50 text-slate-600 shadow-sm">
                                                                {report.reason.replace('_', ' ')}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="max-w-[250px]">
                                                            <p className="text-[12px] font-medium text-slate-500 leading-relaxed truncate" title={report.description ?? undefined}>
                                                                {report.description || "NO CONTEXT PROVIDED"}
                                                            </p>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/50 border border-white/60 shadow-sm">
                                                                <span className="font-mono text-[10px] font-semibold text-slate-600">
                                                                    #{report.itemId?.substring(0, 8) || report.claimId?.substring(0, 8) || 'SYSTEM'}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-[11px] font-medium text-slate-400">
                                                            {new Date(report.createdAt).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="text-right pr-8">
                                                            {report.status === 'pending' ? (
                                                                <div className="flex justify-end gap-3">
                                                                    <Button
                                                                        size="icon"
                                                                        variant="outline"
                                                                        className="h-9 w-9 rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all shadow-sm"
                                                                        onClick={() => updateReportStatusMutation.mutate({ id: report.id, status: 'resolved' })}
                                                                    >
                                                                        <CheckCircle2 className="w-4.5 h-4.5" />
                                                                    </Button>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="outline"
                                                                        className="h-9 w-9 rounded-xl border-slate-200 text-slate-400 hover:bg-white/80 transition-all shadow-sm"
                                                                        onClick={() => updateReportStatusMutation.mutate({ id: report.id, status: 'dismissed' })}
                                                                    >
                                                                        <XCircle className="w-4.5 h-4.5" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <Badge variant="secondary" className="text-[9px] font-semibold uppercase tracking-widest h-6 px-3 rounded-lg opacity-60 bg-white/50">
                                                                    {report.status}
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </motion.div>
                        )}

                        {activeView === 'activity' && (
                            <motion.div
                                key="activity"
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={fadeInUp}
                                className="space-y-6"
                            >
                                <Card className="glass-card border-none rounded-3xl overflow-hidden">
                                    <CardHeader className="pb-4 backdrop-blur-md bg-white/30 border-b border-white/20">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 shadow-sm">
                                                <History className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg font-bold tracking-tight text-slate-800">Administrative Logs</CardTitle>
                                                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Protocol modification history</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    {/* Filter Bar */}
                                    <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap gap-3 items-center">
                                        <Select value={auditLogFilter.action || ""} onValueChange={(v) => setAuditLogFilter(f => ({ ...f, action: v || undefined }))}>
                                            <SelectTrigger className="w-[160px] h-9 bg-white border-slate-200 rounded-lg text-xs font-bold">
                                                <SelectValue placeholder="All Actions" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="" className="text-xs">All Actions</SelectItem>
                                                <SelectItem value="item_active" className="text-xs">Item Verified</SelectItem>
                                                <SelectItem value="item_rejected" className="text-xs">Item Rejected</SelectItem>
                                                <SelectItem value="item_deleted" className="text-xs">Item Deleted</SelectItem>
                                                <SelectItem value="item_edited" className="text-xs">Item Edited</SelectItem>
                                                <SelectItem value="claim_verified" className="text-xs">Claim Verified</SelectItem>
                                                <SelectItem value="claim_rejected" className="text-xs">Claim Rejected</SelectItem>
                                                <SelectItem value="user_role_updated" className="text-xs">Role Updated</SelectItem>
                                                <SelectItem value="setting_updated" className="text-xs">Setting Changed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {auditLogFilter.action && (
                                            <Button variant="ghost" size="sm" className="h-9 px-3 text-xs font-bold" onClick={() => setAuditLogFilter({})}>
                                                Clear Filters
                                            </Button>
                                        )}
                                    </div>
                                    <Table>
                                        <TableHeader className="bg-white/10">
                                            <TableRow className="hover:bg-transparent border-0">
                                                <TableHead className="text-[11px] font-semibold uppercase tracking-widest py-5 px-6">Administrator</TableHead>
                                                <TableHead className="text-[11px] font-semibold uppercase tracking-widest py-5">Operation</TableHead>
                                                <TableHead className="text-[11px] font-semibold uppercase tracking-widest py-5">Entity Target</TableHead>
                                                <TableHead className="text-[11px] font-semibold uppercase tracking-widest py-5 pr-8">Timestamp</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {auditLogs.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-20 text-slate-400">
                                                        <p className="text-[11px] font-black uppercase tracking-widest opacity-50 text-center">Log Buffer Empty</p>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                auditLogs.map((log) => (
                                                    <TableRow key={log.id} className="hover:bg-white/40 transition-colors border-b border-white/10 last:border-0 group">
                                                        <TableCell className="py-5 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                                                <span className="text-sm font-semibold text-slate-800">{log.adminName}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-widest border-none bg-white/50 text-slate-600 px-3 py-1 shadow-sm">
                                                                {log.action.replace('_', ' ')}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{log.entityType}</span>
                                                                <span className="font-mono text-[10px] font-medium text-slate-400">#{log.entityId?.substring(0, 8)}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-[11px] font-medium text-slate-400 pr-8">
                                                            {new Date(log.createdAt).toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </motion.div>
                        )}

                        {activeView === 'settings' && (
                            <motion.div
                                key="settings"
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={fadeInUp}
                                className="space-y-6"
                            >
                                <Card className="glass-card border-none rounded-3xl overflow-hidden">
                                    <CardHeader className="pb-6 backdrop-blur-md bg-white/30 border-b border-white/20">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 border border-white/20 shadow-lg shadow-blue-500/20">
                                                <ShieldAlert className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg font-bold tracking-tight text-slate-800">System Sovereignty</CardTitle>
                                                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Global operational parameters</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8 space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                            {/* Financial Protocol */}
                                            <div className="space-y-4">
                                                <Label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 ml-1">Listing Protocol Fee</Label>
                                                <div className="flex gap-3">
                                                    <Input
                                                        defaultValue={settingsData?.listing_fee || "1000"}
                                                        id="setting-listing_fee"
                                                        className="h-11 bg-white/50 border-white/40 rounded-xl text-sm font-semibold focus-visible:ring-primary/20 backdrop-blur-sm shadow-inner"
                                                    />
                                                    <Button size="sm" className="h-10 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-bold uppercase tracking-widest transition-all group"
                                                        onClick={() => {
                                                            const val = (document.getElementById('setting-listing_fee') as HTMLInputElement).value;
                                                            updateSettingMutation.mutate({ key: 'listing_fee', value: val });
                                                        }}>
                                                        <span className="group-hover:animate-pulse">Commit</span>
                                                    </Button>
                                                </div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">Mandatory fee processed for all 'Lost Item' registry entries.</p>
                                            </div>

                                            {/* Data Retention */}
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Retention Period (Days)</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        defaultValue={settingsData?.listing_duration || "30"}
                                                        id="setting-listing_duration"
                                                        className="h-10 bg-slate-50 border-none rounded-lg text-xs font-bold focus-visible:ring-1 focus-visible:ring-primary/20"
                                                    />
                                                    <Button size="sm" className="h-10 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-bold uppercase tracking-widest transition-all group"
                                                        onClick={() => {
                                                            const val = (document.getElementById('setting-listing_duration') as HTMLInputElement).value;
                                                            updateSettingMutation.mutate({ key: 'listing_duration', value: val });
                                                        }}>
                                                        <span className="group-hover:animate-pulse">Commit</span>
                                                    </Button>
                                                </div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">Duration before an automated registry purge or expiration.</p>
                                            </div>

                                            {/* Verification Protocol */}
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Validation Governance</Label>
                                                <Select
                                                    defaultValue={settingsData?.require_approval || "true"}
                                                    onValueChange={(val) => updateSettingMutation.mutate({ key: 'require_approval', value: val })}
                                                >
                                                    <SelectTrigger className="h-10 bg-slate-50 border-none rounded-lg text-xs font-bold focus:ring-1 focus:ring-primary/20">
                                                        <SelectValue placeholder="Protocol State" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-none shadow-2xl rounded-xl">
                                                        <SelectItem value="true" className="text-[10px] font-black uppercase tracking-widest py-2.5">Manual (Secure)</SelectItem>
                                                        <SelectItem value="false" className="text-[10px] font-black uppercase tracking-widest py-2.5 text-rose-500">Auto (Warning)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">If Manual, entries require sovereign admin verification before publishing.</p>
                                            </div>
                                        </div>

                                        {/* Advanced Protocols */}
                                        <div className="pt-6 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <h4 className="text-[11px] font-black uppercase tracking-tight">Emergency Protocol</h4>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Toggles system maintenance mode</p>
                                                </div>
                                                <Switch
                                                    checked={settingsData?.maintenance_mode === "true"}
                                                    onCheckedChange={(checked) => updateSettingMutation.mutate({ key: 'maintenance_mode', value: checked.toString() })}
                                                />
                                            </div>

                                            <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <h4 className="text-[11px] font-black uppercase tracking-tight">Notification Banner</h4>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">System-wide critical broadcast</p>
                                                </div>
                                                <Switch
                                                    checked={settingsData?.system_notification === "true"}
                                                    onCheckedChange={(checked) => updateSettingMutation.mutate({ key: 'system_notification', value: checked.toString() })}
                                                />
                                            </div>
                                        </div>

                                        {/* My Profile Section */}
                                        <div className="pt-6 border-t border-slate-100 space-y-6">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-600 flex items-center gap-2">
                                                <Users className="w-4 h-4 text-blue-500" /> My Profile
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Email Update */}
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Email Address</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            defaultValue={user?.email || ""}
                                                            id="profile-email"
                                                            type="email"
                                                            placeholder="your@email.com"
                                                            className="h-10 bg-slate-50 border-none rounded-lg text-xs font-bold focus-visible:ring-1 focus-visible:ring-primary/20"
                                                        />
                                                        <Button size="sm" className="h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
                                                            onClick={async () => {
                                                                const email = (document.getElementById('profile-email') as HTMLInputElement).value;
                                                                try {
                                                                    await apiRequest("PATCH", "/api/admin/profile", { email });
                                                                    toast({ title: "Success", description: "Email updated." });
                                                                } catch (err: any) {
                                                                    toast({ title: "Error", description: err.message, variant: "destructive" });
                                                                }
                                                            }}>
                                                            Update
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Password Update */}
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Change Password</Label>
                                                    <div className="space-y-2">
                                                        <Input
                                                            id="profile-current-password"
                                                            type="password"
                                                            placeholder="Current Password"
                                                            className="h-10 bg-slate-50 border-none rounded-lg text-xs font-bold focus-visible:ring-1 focus-visible:ring-primary/20"
                                                        />
                                                        <div className="flex gap-2">
                                                            <Input
                                                                id="profile-new-password"
                                                                type="password"
                                                                placeholder="New Password"
                                                                className="h-10 bg-slate-50 border-none rounded-lg text-xs font-bold focus-visible:ring-1 focus-visible:ring-primary/20"
                                                            />
                                                            <Button size="sm" className="h-10 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
                                                                onClick={async () => {
                                                                    const currentPassword = (document.getElementById('profile-current-password') as HTMLInputElement).value;
                                                                    const newPassword = (document.getElementById('profile-new-password') as HTMLInputElement).value;
                                                                    if (!currentPassword || !newPassword) {
                                                                        toast({ title: "Error", description: "Both passwords required", variant: "destructive" });
                                                                        return;
                                                                    }
                                                                    try {
                                                                        await apiRequest("PATCH", "/api/admin/profile", { currentPassword, newPassword });
                                                                        toast({ title: "Success", description: "Password updated." });
                                                                        (document.getElementById('profile-current-password') as HTMLInputElement).value = '';
                                                                        (document.getElementById('profile-new-password') as HTMLInputElement).value = '';
                                                                    } catch (err: any) {
                                                                        toast({ title: "Error", description: err.message, variant: "destructive" });
                                                                    }
                                                                }}>
                                                                Change
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div >

                {/* Edit Item Dialog */}
                <Dialog open={isEditItemOpen} onOpenChange={(open) => { if (!open) { setEditingItem(null); } setIsEditItemOpen(open); }}>
                    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto border-none shadow-2xl rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black uppercase tracking-tight">Edit Record</DialogTitle>
                            <DialogDescription className="text-xs font-bold text-slate-500">
                                Modify the details of this registry record.
                            </DialogDescription>
                        </DialogHeader>
                        {editingItem && (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                editItemMutation.mutate({
                                    id: editingItem.id,
                                    type: editingItem.type,
                                    title: formData.get('title') as string,
                                    description: formData.get('description') as string,
                                    location: formData.get('location') as string,
                                    contactName: formData.get('contactName') as string,
                                    contactPhone: formData.get('contactPhone') as string,
                                });
                            }} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Title</label>
                                    <Input name="title" defaultValue={editingItem.title} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Location</label>
                                    <Input name="location" defaultValue={editingItem.location} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Description</label>
                                    <Input name="description" defaultValue={editingItem.description} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Contact Name</label>
                                        <Input name="contactName" defaultValue={editingItem.contactName} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Contact Phone</label>
                                        <Input name="contactPhone" defaultValue={editingItem.contactPhone} required />
                                    </div>
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button type="submit" disabled={editItemMutation.isPending} className="h-11 px-8 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                                        {editItemMutation.isPending ? "Saving..." : "Save Changes"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </main >
        </div >
    );
}
