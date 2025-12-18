import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, RouteProps } from "wouter";

// For regular authenticated users
export function ProtectedRoute({ component: Component, ...rest }: RouteProps) {
    const { user, isLoading } = useAuth();

    return (
        <Route
            {...rest}
            component={(props) => {
                if (isLoading) {
                    return (
                        <div className="flex items-center justify-center min-h-screen">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    );
                }

                if (!user) {
                    return <Redirect to="/auth" />;
                }

                if (Component) {
                    return <Component {...props} />;
                }

                return null;
            }}
        />
    );
}

// For admin/moderator only routes
export function AdminRoute({ component: Component, ...rest }: RouteProps) {
    const { user, isLoading } = useAuth();

    return (
        <Route
            {...rest}
            component={(props) => {
                if (isLoading) {
                    return (
                        <div className="flex items-center justify-center min-h-screen bg-slate-950">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    );
                }

                if (!user) {
                    return <Redirect to="/admin/login" />;
                }

                // Check if user has admin or moderator role
                if (user.role !== "admin" && user.role !== "moderator") {
                    // Regular users cannot access admin routes
                    return <Redirect to="/" />;
                }

                if (Component) {
                    return <Component {...props} />;
                }

                return null;
            }}
        />
    );
}
