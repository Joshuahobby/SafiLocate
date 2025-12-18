import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { User, ArrowRight, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import type { User as UserType } from "@shared/schema";

export default function AuthPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [, setLocation] = useLocation();
    const { loginMutation, registerMutation, user } = useAuth();

    // Redirect based on role if already logged in
    useEffect(() => {
        if (user) {
            if (user.role === 'admin' || user.role === 'moderator') {
                setLocation("/admin/dashboard");
            } else {
                setLocation("/dashboard");
            }
        }
    }, [user, setLocation]);

    // Helper function to redirect based on role
    const redirectByRole = (loggedInUser: UserType) => {
        if (loggedInUser.role === 'admin' || loggedInUser.role === 'moderator') {
            setLocation("/admin/dashboard");
        } else {
            setLocation("/dashboard");
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate({ username, password }, {
            onSuccess: (user: UserType) => redirectByRole(user)
        });
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        // Regular users only - role defaults to "user" on server
        registerMutation.mutate({ username, password, email, phone }, {
            onSuccess: (user: UserType) => redirectByRole(user)
        });
    };

    return (
        <div className="min-h-screen bg-background font-sans">
            <Navbar />

            <div className="container max-w-md mx-auto px-4 py-16">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Welcome to SafiLocate</h1>
                    <p className="text-muted-foreground mt-2">Sign in to track your reported items and claims</p>
                </div>

                <Card className="border-none shadow-lg">
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Sign In</TabsTrigger>
                            <TabsTrigger value="register">Create Account</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <CardHeader>
                                <CardTitle>Sign In</CardTitle>
                                <CardDescription>Enter your credentials to continue</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Username"
                                                className="pl-10"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Password"
                                                className="pl-10 pr-10"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={loginMutation.isPending}
                                    >
                                        {loginMutation.isPending ? "Signing in..." : "Sign In"}
                                        {!loginMutation.isPending && <ArrowRight className="ml-2 w-4 h-4" />}
                                    </Button>
                                </form>
                            </CardContent>
                        </TabsContent>

                        <TabsContent value="register">
                            <CardHeader>
                                <CardTitle>Create Account</CardTitle>
                                <CardDescription>Register to track your items and claims</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Username"
                                                className="pl-10"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="email"
                                                placeholder="Email (optional)"
                                                className="pl-10"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="tel"
                                                placeholder="Phone (e.g., 078XXXXXXX)"
                                                className="pl-10"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Password (min 6 characters)"
                                                className="pl-10 pr-10"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                minLength={6}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={registerMutation.isPending}
                                    >
                                        {registerMutation.isPending ? "Creating account..." : "Create Account"}
                                        {!registerMutation.isPending && <ArrowRight className="ml-2 w-4 h-4" />}
                                    </Button>

                                    <p className="text-xs text-center text-muted-foreground">
                                        By registering, you agree to our Terms of Service
                                    </p>
                                </form>
                            </CardContent>
                        </TabsContent>
                    </Tabs>
                </Card>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    You can also report items without an account.{" "}
                    <Link href="/" className="text-primary hover:underline">
                        Go to Home
                    </Link>
                </p>
            </div>
        </div>
    );
}
