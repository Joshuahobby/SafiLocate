import { useState } from "react";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type Item } from "@/components/item-card";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Share2,
  Flag,
  ShieldCheck,
  MessageCircle,
  Phone,
  ArrowRight
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";


// Mock Data removed


export default function ItemDetail() {
  const [, params] = useRoute("/item/:id");
  const id = params?.id;

  const { data: item, isLoading } = useQuery<Item>({
    queryKey: [`/api/items/${id}`],
    enabled: !!id
  });

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!item) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Item not found</div>;
  }

  const { toast } = useToast();
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = () => {
    setIsClaiming(true);
    setTimeout(() => {
      setIsClaiming(false);
      toast({
        title: "Claim Submitted",
        description: "The finder has been notified. They will contact you if details match.",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl pt-24">
        <div className="mb-6">
          <Link href="/search">
            <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-muted rounded-xl overflow-hidden border flex items-center justify-center">
              {/* Placeholder */}
              <div className="text-center text-muted-foreground">
                <ShieldCheck className="w-16 h-16 mx-auto mb-2 opacity-20" />
                <p>No Image Provided</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {/* Thumbnails would go here */}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={item.type === 'found' ? 'default' : 'secondary'} className="px-3 py-1">
                  {item.type === 'found' ? 'Found Item' : 'Lost Item'}
                </Badge>
                <span className="text-sm text-muted-foreground">Ref: #{item.id}</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{item.title}</h1>
              <div className="flex flex-col gap-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {item.location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Reported on {item.dateFound || item.dateLost}
                </div>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Safety Verification
              </h3>
              <p className="text-sm text-blue-800">
                To protect both parties, contact details are hidden until a claim is verified.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="flex-1 h-12 text-lg">
                    This is mine! (Claim)
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Claim Item</DialogTitle>
                    <DialogDescription>
                      Provide details to prove this item belongs to you. The finder will review this.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Your Phone Number</Label>
                      <Input placeholder="078 000 0000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Proof of Ownership</Label>
                      <Textarea placeholder="Describe unique features, wallpaper, scratches, or contents that only the owner would know..." className="h-32" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleClaim} disabled={isClaiming}>
                      {isClaiming ? "Sending..." : "Send Claim Request"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex justify-center">
              <Button variant="link" className="text-muted-foreground text-xs">
                <Flag className="w-3 h-3 mr-1" /> Report as suspicious
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
