import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ItemCardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn(
            "group glass-card rounded-2xl overflow-hidden h-full flex flex-col",
            className
        )}>
            {/* Image Area Skeleton */}
            <div className="aspect-[3/2] bg-muted relative overflow-hidden">
                <Skeleton className="w-full h-full" />
                {/* Badge Skeleton */}
                <div className="absolute top-3 right-3 z-10">
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
            </div>

            {/* Content Area Skeleton */}
            <div className="p-4 flex-1 flex flex-col space-y-3">
                {/* Title & Location */}
                <div className="mb-auto space-y-2">
                    <Skeleton className="h-5 w-3/4 rounded-md" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-3.5 w-3.5 rounded-full" />
                        <Skeleton className="h-3.5 w-1/2 rounded-md" />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-2">
                    <Skeleton className="h-6 w-20 rounded-md" />
                    <Skeleton className="h-4 w-24 rounded-md" />
                </div>
            </div>
        </div>
    );
}
