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
        <div className="aspect-[3/2] bg-muted relative overflow-hidden">
          <div className="absolute top-3 right-3 z-10">
            <Badge
              variant="secondary"
              className={cn(
                "backdrop-blur-xl border-0 shadow-sm font-bold tracking-wide uppercase text-[10px] px-2.5 py-1",
                type === 'found'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20'
                  : 'bg-orange-500/10 text-orange-600 dark:text-orange-400 dark:bg-orange-500/20'
              )}
            >
              {type === 'found' ? 'Found' : 'Lost'}
            </Badge>
          </div>

          {/* Placeholder Image State */}
          <div className="w-full h-full flex items-center justify-center bg-secondary/30 text-muted-foreground group-hover:scale-110 transition-transform duration-700 ease-out">
            {image ? (
              <img src={image} alt={title} className="w-full h-full object-cover" />
            ) : (
              getCategoryIcon(category)
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-3 flex-1 flex flex-col">
          <div className="mb-auto">
            <h3 className="font-heading font-bold text-base leading-tight mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
              {title}
            </h3>
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <MapPin className="w-3 h-3 mr-1 shrink-0 text-primary/60" />
              <span className="truncate font-medium">{location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-1">
            <span className="text-[10px] text-muted-foreground flex items-center bg-secondary/50 px-1.5 py-0.5 rounded-md">
              <Calendar className="w-3 h-3 mr-1" />
              {date}
            </span>
            <span className="text-[10px] font-bold text-primary flex items-center group-hover:translate-x-1 transition-transform uppercase tracking-wider">
              Details <ArrowRight className="w-3 h-3 ml-1" />
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
