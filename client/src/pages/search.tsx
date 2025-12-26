import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Search as SearchIcon,
  Filter,
  Calendar,
  Wallet,
  Smartphone,
  FileText,
  Key,
  Shirt,
  MoreHorizontal,
  ArrowRight,
  X,
  SortAsc
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { ItemCardSkeleton } from "@/components/skeletons/item-card-skeleton";
import { MotionList, MotionItem, itemVariants } from "@/components/ui/motion-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";

import { useInfiniteQuery } from "@tanstack/react-query";
import { ItemCard, type Item } from "@/components/item-card";


export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Press "/" to focus search
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const fetchItems = async ({ pageParam = 1 }) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (categoryFilter && categoryFilter !== "all") params.set("category", categoryFilter);
    if (locationFilter) params.set("location", locationFilter);
    params.set("page", pageParam.toString());

    const res = await fetch(`/api/items?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch items");
    return res.json();
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['/api/items', searchQuery, categoryFilter, locationFilter],
    queryFn: fetchItems,
    getNextPageParam: (lastPage, allPages) => {
      // If last page was empty, no more pages.
      return lastPage.length > 0 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const filteredItems = data?.pages.flat() || [];
  const isLoading = status === 'pending';


  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Glassmorphic */}
      <header className="border-b border-border/50 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 shadow-sm transition-all duration-300">
        {/* Search Bar Section */}
        <div className="container mx-auto px-8 lg:px-12 py-6 pb-4">
          <div className="flex items-center justify-center gap-4 max-w-4xl mx-auto">
            <Link href="/">
              <Button variant="ghost" size="icon" className="-ml-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1 relative group">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                ref={searchInputRef}
                placeholder="Search lost or found items... (Press / to focus)"
                className="pl-11 pr-10 h-11 w-full bg-muted/40 border-transparent focus:bg-background focus:border-primary/30 focus:shadow-lg focus:shadow-primary/5 transition-all duration-200 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Filter className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Refine your search results
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="id_document">ID Documents</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="wallet">Wallets</SelectItem>
                        <SelectItem value="keys">Keys</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      placeholder="Filter by district or sector"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium">Date Range</label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex-1">Last 24h</Button>
                      <Button variant="outline" size="sm" className="flex-1">Last Week</Button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button className="w-full" onClick={() => {
                      setCategoryFilter("all");
                      setLocationFilter("");
                      setSearchQuery("");
                    }}>
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchQuery || categoryFilter !== 'all' || locationFilter) && (
          <div className="container mx-auto px-8 lg:px-12 pb-4">
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
              <span className="text-xs font-medium text-muted-foreground">Active Filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-2 pl-3 pr-2">
                  <span>Search: "{searchQuery}"</span>
                  <button onClick={() => setSearchQuery("")} className="hover:bg-background/50 rounded-full p-0.5 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {categoryFilter !== 'all' && (
                <Badge variant="secondary" className="gap-2 pl-3 pr-2">
                  <span>Category: {categoryFilter.replace('_', ' ')}</span>
                  <button onClick={() => setCategoryFilter('all')} className="hover:bg-background/50 rounded-full p-0.5 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {locationFilter && (
                <Badge variant="secondary" className="gap-2 pl-3 pr-2">
                  <span>Location: {locationFilter}</span>
                  <button onClick={() => setLocationFilter("")} className="hover:bg-background/50 rounded-full p-0.5 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Category Quick Filters */}
        <div className="container mx-auto px-8 lg:px-12 py-5 border-t border-border/30">
          <div className="flex gap-2 justify-center flex-wrap">
            <Badge
              variant={categoryFilter === 'all' ? "default" : "outline"}
              className="cursor-pointer hover:scale-105 hover:shadow-md transition-all duration-200"
              onClick={() => setCategoryFilter('all')}
            >
              All
            </Badge>
            <Badge
              variant={categoryFilter === 'id_document' ? "default" : "outline"}
              className="cursor-pointer flex items-center gap-1 hover:scale-105 hover:shadow-md transition-all duration-200"
              onClick={() => setCategoryFilter('id_document')}
            >
              <FileText className="w-3 h-3" /> IDs
            </Badge>
            <Badge
              variant={categoryFilter === 'electronics' ? "default" : "outline"}
              className="cursor-pointer flex items-center gap-1 hover:scale-105 hover:shadow-md transition-all duration-200"
              onClick={() => setCategoryFilter('electronics')}
            >
              <Smartphone className="w-3 h-3" /> Electronics
            </Badge>
            <Badge
              variant={categoryFilter === 'wallet' ? "default" : "outline"}
              className="cursor-pointer flex items-center gap-1 hover:scale-105 hover:shadow-md transition-all duration-200"
              onClick={() => setCategoryFilter('wallet')}
            >
              <Wallet className="w-3 h-3" /> Wallets
            </Badge>
            <Badge
              variant={categoryFilter === 'keys' ? "default" : "outline"}
              className="cursor-pointer flex items-center gap-1 hover:scale-105 hover:shadow-md transition-all duration-200"
              onClick={() => setCategoryFilter('keys')}
            >
              <Key className="w-3 h-3" /> Keys
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-8 lg:px-12 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-1">Search Results</h2>
            <p className="text-sm text-muted-foreground">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
            </p>
          </div>
          <Select defaultValue="recent">
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="nearest">Nearest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {[...Array(8)].map((_, i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Results Grid with Staggered Animation */}
        {!isLoading && filteredItems.length > 0 && (
          <MotionList
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
          >
            {filteredItems.map((item) => (
              <MotionItem
                key={item.id}
                variants={itemVariants}
              >
                <ItemCard {...item} />
              </MotionItem>
            ))}
          </MotionList>
        )}

        {/* Empty State */}
        {filteredItems.length === 0 && !isLoading && (
          <div className="py-20 flex justify-center">
            <div className="glass-card max-w-md w-full p-8 rounded-3xl">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="w-20 h-20 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full mx-auto mb-4">
                    <SearchIcon className="w-10 h-10 text-primary" />
                  </EmptyMedia>
                  <EmptyTitle className="text-2xl font-heading font-bold text-foreground">No Items Found</EmptyTitle>
                  <EmptyDescription>
                    Try adjusting your search or filters to see more results.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="mt-6 flex-row gap-2 justify-center">
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                  <Button onClick={() => {
                    setCategoryFilter("all");
                    setLocationFilter("");
                    setSearchQuery("");
                  }}>
                    Reset All Filters
                  </Button>
                </EmptyContent>
              </Empty>
            </div>
          </div>
        )}

        {/* Load More */}
        {hasNextPage && (
          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-8 rounded-full hover:scale-105 transition-transform"
            >
              {isFetchingNextPage ? (
                <>
                  <span className="animate-pulse">Loading more...</span>
                </>
              ) : (
                <>
                  Load More <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </main >
    </div >
  );
}

// Remove getCategoryIcon function as it is now in ItemCard component
