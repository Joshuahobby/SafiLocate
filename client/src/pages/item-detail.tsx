import { useState } from "react";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type Item } from "@/components/item-card";
import { ClaimDialog } from "@/components/claim-dialog";
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


interface ItemDetailData {
  id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  type: 'found' | 'lost';
  image?: string;
  description: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export default function ItemDetail() {
  const [, params] = useRoute("/item/:id");
  const id = params?.id;

  const { data: item, isLoading } = useQuery<ItemDetailData>({
    queryKey: [`/api/items/${id}`],
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!item) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Item not found</div>;
  }

  const isContactVisible = item.contactPhone && !item.contactPhone.includes("*");

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
            <div className="aspect-[4/3] bg-muted rounded-xl overflow-hidden border flex items-center justify-center relative group">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <ShieldCheck className="w-16 h-16 mx-auto mb-2 opacity-20" />
                  <p>No Image Provided</p>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={item.type === 'found' ? 'default' : 'secondary'} className="px-3 py-1">
                  {item.type === 'found' ? 'Found Item' : 'Lost Item'}
                </Badge>
                <span className="text-sm text-muted-foreground">Ref: #{item.id.slice(0, 8)}</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{item.title}</h1>
              <div className="flex flex-col gap-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {item.location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Reported on {new Date(item.date).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            {isContactVisible ? (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-green-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Verified Contact Information
                </h3>
                <div className="space-y-2 text-sm text-green-800">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Name:</span> {item.contactName}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> <span className="font-medium">Phone:</span> {item.contactPhone}
                  </div>
                  {item.contactEmail && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Email:</span> {item.contactEmail}
                    </div>
                  )}
                  <p className="text-xs text-green-700 mt-2">
                    Please contact the {item.type === 'found' ? 'finder' : 'owner'} to arrange return.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Safety Verification
                </h3>
                <p className="text-sm text-blue-800">
                  To protect both parties, contact details are hidden until you claim this item and your claim is verified by our team.
                </p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              {!isContactVisible && (
                <ClaimDialog
                  itemId={item.id}
                  itemType={item.type}
                  trigger={
                    <Button size="lg" className="flex-1 h-12 text-lg">
                      This is mine! (Claim)
                    </Button>
                  }
                />
              )}
              {isContactVisible && (
                <Button size="lg" variant="outline" className="flex-1 h-12 text-lg cursor-default">
                  Claim Verified
                </Button>
              )}
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
