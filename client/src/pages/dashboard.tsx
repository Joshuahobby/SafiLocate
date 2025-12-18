import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
    User,
    Package,
    Search,
    Bell,
    MapPin,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/hooks/use-auth";

export default function UserDashboard() {
    const [, setLocation] = useLocation();
    const { user, isLoading } = useAuth();

    // Fetch user's reported items
    const { data: items = [] } = useQuery<any[]>({
        queryKey: ["/api/items"],
        queryFn: () => fetch("/api/items").then(r => r.json()),
        enabled: !!user
    });

    // Fetch user's claims
    const { data: claimsData } = useQuery<{ items: any[] }>({
        queryKey: ["/api/claims"],
        queryFn: () => fetch("/api/claims").then(r => r.json()),
        enabled: !!user
    });
    const claims = claimsData?.items || [];

    // Redirect if not logged in or admin
    useEffect(() => {
        if (!isLoading && !user) {
            setLocation("/auth");
        }
        // Redirect admins to admin dashboard
        if (user && (user.role === 'admin' || user.role === 'moderator')) {
            setLocation("/admin/dashboard");
        }
    }, [user, isLoading, setLocation]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) return null;

    const stats = [
        { name: 'My Reports', value: items.length, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
        { name: 'Active Claims', value: claims.filter((c: any) => c.status === 'pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
        { name: 'Verified', value: claims.filter((c: any) => c.status === 'verified').length, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
    ];

    return (
        <div className="min-h-screen bg-background font-sans">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* Welcome Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Welcome, {user.username}!</h1>
                            <p className="text-muted-foreground">Track your lost items and claims</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {stats.map((stat) => (
                        <Card key={stat.name} className="border-none shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{stat.name}</p>
                                        <p className="text-3xl font-bold mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation("/report-lost")}>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold">Report Lost Item</h3>
                                <p className="text-sm text-muted-foreground">Create a new lost item report</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation("/report-found")}>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold">Report Found Item</h3>
                                <p className="text-sm text-muted-foreground">Help someone find their item</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* My Claims */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">My Claims</CardTitle>
                            <CardDescription>Items you've claimed ownership of</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {claims.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No claims yet</p>
                                    <Link href="/search">
                                        <Button variant="link" className="mt-2">
                                            Search for your item <ArrowRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {claims.slice(0, 3).map((claim: any) => (
                                        <div key={claim.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                            <div>
                                                <p className="font-medium">{claim.itemId}</p>
                                                <p className="text-sm text-muted-foreground">{claim.description?.slice(0, 50)}...</p>
                                            </div>
                                            <Badge variant={
                                                claim.status === 'verified' ? 'default' :
                                                    claim.status === 'rejected' ? 'destructive' : 'secondary'
                                            }>
                                                {claim.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Items */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Browse Recent Items</CardTitle>
                            <CardDescription>Recently reported lost and found items</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {items.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No items found</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {items.slice(0, 3).map((item: any) => (
                                        <Link key={item.id} href={`/item/${item.id}`}>
                                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                                        <Package className="w-5 h-5 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{item.title}</p>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <MapPin className="w-3 h-3" />
                                                            {item.location}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge variant={item.type === 'found' ? 'default' : 'secondary'}>
                                                    {item.type}
                                                </Badge>
                                            </div>
                                        </Link>
                                    ))}
                                    <Link href="/search">
                                        <Button variant="ghost" className="w-full mt-2">
                                            View all items <ArrowRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
