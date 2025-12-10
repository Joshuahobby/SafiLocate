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

// Mock Data Generation
const generateMockItems = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `item-${i}`,
    title: [
      "Blue Samsung Galaxy S21",
      "Brown Leather Wallet",
      "National ID Card",
      "Car Keys (Toyota)",
      "Black Backpack",
      "iPhone 13 Pro Max",
      "Driving License",
      "Prescription Glasses"
    ][i % 8],
    category: ["electronics", "wallet", "id_document", "keys", "other", "electronics", "id_document", "other"][i % 8],
    location: ["Kigali, Nyarugenge", "Kicukiro Centre", "Remera, Gasabo", "Kimironko Market", "Nyamirambo", "Gisozi", "Kanombe", "Kacyiru"][i % 8],
    date: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toLocaleDateString(),
    type: i % 3 === 0 ? "lost" : "found",
    image: null
  }));
};

const MOCK_ITEMS = generateMockItems(12);

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");

  const filteredItems = MOCK_ITEMS.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesLocation = locationFilter === "" || item.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

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
            <SheetContent>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Link key={item.id} href={`/item/${item.id}`}>
              <div className="group bg-card rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer h-full flex flex-col">
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  <div className="absolute top-2 right-2 z-10">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm
                      ${item.type === 'found' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'}
                    `}>
                      {item.type === 'found' ? 'Found' : 'Lost'}
                    </span>
                  </div>
                  
                  {/* Placeholder Image State */}
                  <div className="w-full h-full flex items-center justify-center bg-secondary/30 text-muted-foreground group-hover:scale-105 transition-transform duration-500">
                    {getCategoryIcon(item.category)}
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  
                  <div className="space-y-2 mt-auto">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {item.date}
                      </span>
                      <span className="text-xs font-medium text-primary flex items-center">
                        View Details <ArrowRight className="w-3 h-3 ml-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {filteredItems.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-8 h-8 opacity-50" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No items found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'electronics': return <Smartphone className="w-12 h-12 opacity-20" />;
    case 'wallet': return <Wallet className="w-12 h-12 opacity-20" />;
    case 'id_document': return <FileText className="w-12 h-12 opacity-20" />;
    case 'keys': return <Key className="w-12 h-12 opacity-20" />;
    case 'clothing': return <Shirt className="w-12 h-12 opacity-20" />;
    default: return <MoreHorizontal className="w-12 h-12 opacity-20" />;
  }
}
