import { useState } from "react";
import { useLocation } from "wouter";
import { Lock, ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
    const [pin, setPin] = useState("");
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // Hardcoded for MVP - in production this should be env var validated on server
        if (pin === "2024") {
            sessionStorage.setItem("admin_token", "authenticated");
            toast({
                title: "Welcome Admin",
                description: "Access granted to dashboard.",
            });
            setLocation("/admin/dashboard");
        } else {
            toast({
                title: "Access Denied",
                description: "Invalid PIN code.",
                variant: "destructive"
            });
            setPin("");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[100px]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-900/20 blur-[100px]" />
            </div>

            <Card className="w-full max-w-sm bg-slate-900/50 border-slate-800 backdrop-blur-xl p-8 relative z-10">
                <div className="text-center space-y-6 mb-8">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto ring-1 ring-slate-700 shadow-xl">
                        <Lock className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
                        <p className="text-slate-400 text-sm">Enter security PIN to continue</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="••••"
                            className="text-center text-3xl tracking-[1em] h-16 bg-slate-950/50 border-slate-700 focus:border-blue-500/50 text-white placeholder:text-slate-700 font-mono"
                            maxLength={4}
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                            autoFocus
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20"
                    >
                        Access Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs">
                        <ShieldAlert className="w-3 h-3" />
                        Restricted Area
                    </div>
                </div>
            </Card>
        </div>
    );
}
