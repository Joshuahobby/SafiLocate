import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Eye, 
  MoreHorizontal,
  LogOut,
  ShieldAlert,
  Inbox
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Mock Admin Data
const MOCK_LISTINGS = [
  { id: "LST-9921", title: "iPhone 13 Pro", type: "lost", status: "active", date: "2023-10-24", author: "Sarah M." },
  { id: "FND-8821", title: "Brown Wallet", type: "found", status: "pending", date: "2023-10-24", author: "John D." },
  { id: "FND-1120", title: "NID: 1199...", type: "found", status: "pending", date: "2023-10-23", author: "Moto Driver 02" },
  { id: "LST-3321", title: "Car Keys", type: "lost", status: "rejected", date: "2023-10-22", author: "Alex K." },
  { id: "LST-4420", title: "MacBook Pro", type: "lost", status: "active", date: "2023-10-21", author: "Bizimana E." },
];

const MOCK_CLAIMS = [
  { id: "CLM-001", itemId: "FND-8821", itemTitle: "Brown Wallet", claimant: "Eric T.", status: "pending", date: "2023-10-24" },
  { id: "CLM-002", itemId: "FND-1120", itemTitle: "NID: 1199...", claimant: "Uwamahoro C.", status: "approved", date: "2023-10-23" },
];

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
      toast({ title: "Welcome back, Admin" });
    } else {
      toast({ title: "Access Denied", variant: "destructive" });
    }
  };

  const handleAction = (action: string, id: string) => {
    toast({ title: `${action} applied to ${id}` });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
              <ShieldAlert className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input 
                type="password" 
                placeholder="Enter admin password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" className="w-full">Login</Button>
              <div className="text-center">
                  <Link href="/">
                    <Button variant="link" size="sm">Back to Home</Button>
                  </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col">
      {/* Admin Header */}
      <header className="bg-background border-b h-16 px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 font-bold text-lg">
          <LayoutDashboard className="w-5 h-5 text-primary" />
          SafiLocate Admin
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Logged in as Super Admin</span>
          <Button variant="outline" size="sm" onClick={() => setIsAuthenticated(false)}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 container mx-auto max-w-6xl space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Listings</CardTitle>
              <Inbox className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 since last hour</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Claims</CardTitle>
              <ShieldAlert className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <div className="text-green-600 font-bold text-xs">+15%</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45,000 RWF</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="listings">All Listings</TabsTrigger>
            <TabsTrigger value="claims">
                Claims 
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">2</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <Card>
              <CardHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-base">Recent Postings</CardTitle>
                <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search ID, title..." className="pl-9 h-9" />
                </div>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_LISTINGS.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.id}</TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={item.type === 'lost' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}>
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.author}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleAction('Approved', item.id)}>
                                <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('Rejected', item.id)}>
                                <XCircle className="w-4 h-4 mr-2 text-red-600" /> Reject
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="claims">
            <Card>
                <CardHeader className="px-6 py-4 border-b">
                    <CardTitle className="text-base">Recent Claims</CardTitle>
                </CardHeader>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Claim ID</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Claimant</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_CLAIMS.map((claim) => (
                            <TableRow key={claim.id}>
                                <TableCell className="font-mono text-xs">{claim.id}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{claim.itemTitle}</span>
                                        <span className="text-xs text-muted-foreground">{claim.itemId}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{claim.claimant}</TableCell>
                                <TableCell>{claim.date}</TableCell>
                                <TableCell>
                                    <StatusBadge status={claim.status} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant="outline">Review Proof</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    active: "bg-green-100 text-green-700 hover:bg-green-100",
    approved: "bg-green-100 text-green-700 hover:bg-green-100",
    pending: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
    rejected: "bg-red-100 text-red-700 hover:bg-red-100",
  };
  
  return (
    <Badge className={styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
