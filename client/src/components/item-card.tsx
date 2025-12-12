import { Link } from "wouter";
import { MapPin, Calendar, ArrowRight, Wallet, Smartphone, FileText, Key, Shirt, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ItemCardProps {
  id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  type: "lost" | "found";
  image?: string | null;
  className?: string;
}

export type Item = ItemCardProps;

export function ItemCard({ id, title, category, location, date, type, image, className }: ItemCardProps) {
  return (
    <Link href={`/item/${id}`}>
      <div className={cn(
        "group glass-card rounded-2xl overflow-hidden cursor-pointer h-full flex flex-col",
        className
      )}>
        {/* Image Area */}
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          <div className="absolute top-3 right-3 z-10">
            <Badge
              variant="secondary"
              className={cn(
                "backdrop-blur-md border-0 shadow-sm font-medium",
                type === 'found'
                  ? 'bg-primary/10 text-primary dark:text-blue-300'
                  : 'bg-orange-500/10 text-orange-700 dark:text-orange-300'
              )}
            >
              {type === 'found' ? 'Found' : 'Lost'}
            </Badge>
          </div>

          {/* Placeholder Image State */}
          <div className="w-full h-full flex items-center justify-center bg-secondary/30 text-muted-foreground group-hover:scale-105 transition-transform duration-500">
            {image ? (
              <img src={image} alt={title} className="w-full h-full object-cover" />
            ) : (
              getCategoryIcon(category)
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="mb-auto">
            <h3 className="font-heading font-semibold text-lg line-clamp-1 mb-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0 text-primary/60" />
              <span className="truncate">{location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-2">
            <span className="text-xs text-muted-foreground flex items-center bg-secondary/50 px-2 py-1 rounded-md">
              <Calendar className="w-3 h-3 mr-1.5" />
              {date}
            </span>
            <span className="text-xs font-semibold text-primary flex items-center group-hover:translate-x-1 transition-transform">
              View Details <ArrowRight className="w-3 h-3 ml-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
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
