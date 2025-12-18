import { useState } from "react";
import { Link } from "wouter";
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
  ArrowRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-md z-10">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="-ml-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lost or found items..."
              className="pl-9 h-9 w-full bg-muted/50 border-transparent focus:bg-background focus:border-input transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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

        {/* Category Quick Filters */}
        <div className="container mx-auto px-4 pb-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            <Badge
              variant={categoryFilter === 'all' ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setCategoryFilter('all')}
            >
              All
            </Badge>
            <Badge
              variant={categoryFilter === 'id_document' ? "default" : "outline"}
              className="cursor-pointer flex items-center gap-1"
              onClick={() => setCategoryFilter('id_document')}
            >
              <FileText className="w-3 h-3" /> IDs
            </Badge>
            <Badge
              variant={categoryFilter === 'electronics' ? "default" : "outline"}
              className="cursor-pointer flex items-center gap-1"
              onClick={() => setCategoryFilter('electronics')}
            >
              <Smartphone className="w-3 h-3" /> Electronics
            </Badge>
            <Badge
              variant={categoryFilter === 'wallet' ? "default" : "outline"}
              className="cursor-pointer flex items-center gap-1"
              onClick={() => setCategoryFilter('wallet')}
            >
              <Wallet className="w-3 h-3" /> Wallets
            </Badge>
            <Badge
              variant={categoryFilter === 'keys' ? "default" : "outline"}
              className="cursor-pointer flex items-center gap-1"
              onClick={() => setCategoryFilter('keys')}
            >
              <Key className="w-3 h-3" /> Keys
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredItems.length} results
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              {...item}
            />
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <SearchIcon className="w-10 h-10 opacity-50" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground mb-2">No items found</h3>
              <p>Try adjusting your search or filters to see more results.</p>
            </div>
          )}
        </div>

        {/* Load More */}
        {hasNextPage && (
          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

// Remove getCategoryIcon function as it is now in ItemCard component
