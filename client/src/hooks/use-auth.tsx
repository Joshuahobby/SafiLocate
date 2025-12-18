
import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, InsertUser } from "@shared/schema";
import { queryClient } from "../lib/queryClient";
import { useToast } from "./use-toast";

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    error: Error | null;
    loginMutation: any;
    logoutMutation: any;
    registerMutation: any;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();

    const { data: user = null, error, isLoading } = useQuery({
        queryKey: ["/api/user"],
        queryFn: async (): Promise<User | null> => {
            const res = await fetch("/api/user", { credentials: "include" });
            if (res.status === 401) return null;
            if (!res.ok) throw new Error("Failed to fetch user");
            return await res.json();
        },
        retry: false,
    });

    const loginMutation = useMutation({
        mutationFn: async (credentials: Pick<InsertUser, "username" | "password">) => {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error((await res.text()) || "Login failed");
            }

            return await res.json();
        },
        onSuccess: (user: User) => {
            queryClient.setQueryData(["/api/user"], user);
            toast({
                title: "Logged in successfully",
                description: `Welcome back, ${user.username}`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Login failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const registerMutation = useMutation({
        mutationFn: async (credentials: InsertUser) => {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error((await res.text()) || "Registration failed");
            }

            return await res.json();
        },
        onSuccess: (user: User) => {
            queryClient.setQueryData(["/api/user"], user);
            toast({
                title: "Registered successfully",
                description: "Your account has been created",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Registration failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/logout", {
                method: "POST",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Logout failed");
            }
        },
        onSuccess: () => {
            queryClient.setQueryData(["/api/user"], null);
            toast({
                title: "Logged out",
                description: "You have been logged out successfully",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Logout failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                error,
                loginMutation,
                logoutMutation,
                registerMutation,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
