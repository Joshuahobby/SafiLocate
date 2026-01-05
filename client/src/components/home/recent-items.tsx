import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, Wallet, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemCard, Item } from "@/components/item-card";
import { ItemCardSkeleton } from "@/components/skeletons/item-card-skeleton";
import { formatDistanceToNow } from "date-fns";

export function RecentItems() {
    const { data: items, isLoading, error } = useQuery<Item[]>({
        queryKey: ["/api/items", { type: "found", limit: 4 }],
        queryFn: async () => {
            const res = await fetch("/api/items?type=found&limit=4&sort=desc");
            if (!res.ok) {
                throw new Error("Failed to fetch recent items");
            }
            return res.json();
        },
    });

    return (
        <section className="py-24 bg-muted/30 border-t border-border relative">
            <div className="absolute inset-0 bg-grid-small-black opacity-20 pointer-events-none" />
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">Recently Found</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <p className="text-muted-foreground text-lg">Live feed of recovered items</p>
                        </div>
                    </div>
                    <Link href="/search">
                        <Button variant="ghost" className="hidden sm:flex group text-primary font-bold hover:bg-primary/10">
                            View All Items
                            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <ItemCardSkeleton key={i} />
                        ))
                    ) : error ? (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            Failed to load recent items.
                        </div>
                    ) : items && items.length > 0 ? (
                        items.map((item) => (
                            <ItemCard
                                key={item.id}
                                {...item}
                                date={formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed">
                            <p>No recent found items reported yet.</p>
                            <Link href="/report-found">
                                <Button variant="link" className="mt-2 text-primary">Be the first to report</Button>
                            </Link>
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center sm:hidden">
                    <Link href="/search">
                        <Button variant="outline" size="lg" className="w-full rounded-xl">View All Items</Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
