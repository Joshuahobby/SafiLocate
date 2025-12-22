import { useState } from "react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Package,
  MapPin,
  Calendar,
  User,
  Phone,
  Wallet,
  Smartphone,
  FileText,
  Key,
  Shirt,
  MoreHorizontal,
  Camera,
  Coins,
  ShieldCheck,
  Send,
  Upload
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/image-upload";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";

// Validation Schema - Dynamic based on auth status
const createLostItemSchema = (isAuthenticated: boolean) => z.object({
  category: z.string().min(1, "Select a category"),
  title: z.string().min(3, "What did you lose?"),
  description: z.string().min(10, "Add more details"),
  imageUrl: z.string().optional(),
  location: z.string().min(3, "Where was it last seen?"),
  dateLost: z.string().min(1, "When?"),
  identifier: z.string().optional(),
  reward: z.string().optional(),
  // Only require contact info if NOT authenticated
  contactPhone: isAuthenticated
    ? z.string().optional()
    : z.string().min(10, "Valid phone required").regex(/^(\+?250|0)7[0-9]{8}$/, "Rwanda number required"),
  contactName: isAuthenticated
    ? z.string().optional()
    : z.string().min(2, "Your name"),
});

const CATEGORIES = [
  {
    id: "electronics",
    label: "Electronics",
    icon: Smartphone,
    description: "Phones, laptops",
    placeholder: "IMEI or Serial Number",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "id_document",
    label: "ID / Passport",
    icon: FileText,
    description: "Documents, IDs",
    placeholder: "Document Number",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "wallet",
    label: "Wallet / Bag",
    icon: Wallet,
    description: "Wallets, bags",
    color: "from-amber-500 to-orange-500"
  },
  {
    id: "keys",
    label: "Keys",
    icon: Key,
    description: "House, car keys",
    color: "from-emerald-500 to-teal-500"
  },
  {
    id: "clothing",
    label: "Clothing",
    icon: Shirt,
    description: "Clothes, shoes",
    color: "from-rose-500 to-red-500"
  },
  {
    id: "other",
    label: "Other",
    icon: MoreHorizontal,
    description: "Something else",
    color: "from-slate-500 to-gray-500"
  },
];

export default function ReportLost() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const isAuthenticated = !!user;

  const form = useForm({
    resolver: zodResolver(createLostItemSchema(isAuthenticated)),
    defaultValues: {
      category: "",
      title: "",
      description: "",
      imageUrl: "",
      location: "",
      dateLost: new Date().toISOString().split('T')[0],
      identifier: "",
      reward: "",
      contactPhone: user?.username || "", // Pre-fill from user if available
      contactName: user?.username || "", // Pre-fill from user if available
    },
    mode: "onChange",
  });

  const selectedCategory = form.watch("category");
  const categoryData = CATEGORIES.find(c => c.id === selectedCategory);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const payload = {
        category: data.category,
        title: data.title,
        description: data.description,
        location: data.location,
        dateLost: data.dateLost,
        imageUrls: data.imageUrl ? [data.imageUrl] : [],
        identifier: data.identifier || null,
        reward: data.reward ? data.reward.replace(/[^0-9.]/g, '') : null,
        contactName: isAuthenticated ? user?.username : data.contactName,
        contactPhone: isAuthenticated ? user?.username : data.contactPhone, // Use profile phone
        priceTier: "standard" as const,
      };

      const resItem = await apiRequest("POST", "/api/lost-items", payload);
      const item = await resItem.json();

      const resPayment = await apiRequest("POST", "/api/payments/initialize", {
        lostItemId: item.id,
        amount: 1000,
        phoneNumber: isAuthenticated ? user?.username : data.contactPhone
      });

      const paymentData = await resPayment.json();

      if (paymentData.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
      } else {
        throw new Error("Failed to generate payment link");
      }

    } catch (e: any) {
      console.error(e);
      toast({
        title: "Submission Failed",
        description: e.message || "Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Glassmorphic Header */}
      <header className="border-b border-border/50 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-50 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-8 lg:px-12 h-20 flex items-center justify-between py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Report Lost Item
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-8 lg:px-12 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-3">
              Let's help you find what you lost
            </h1>
            <p className="text-muted-foreground text-lg">
              Over <span className="font-semibold text-primary">1,234 items</span> recovered in Rwanda 🇷🇼
            </p>
          </motion.div>

          {/* Fee Notice */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl">
                <Coins className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Listing fee: 1,000 RWF</p>
                <p className="text-xs text-amber-700 dark:text-amber-300">Helps verify listings & prevent spam</p>
              </div>
            </div>
          </motion.div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Category Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold mb-4 block">What type of item?</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {CATEGORIES.map((cat) => {
                          const Icon = cat.icon;
                          return (
                            <motion.div
                              key={cat.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div
                                onClick={() => field.onChange(cat.id)}
                                className={cn(
                                  "cursor-pointer p-4 rounded-xl border-2 transition-all duration-200",
                                  field.value === cat.id
                                    ? "border-primary bg-primary/5 shadow-md"
                                    : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                                )}
                              >
                                <div className={cn(
                                  "w-10 h-10 rounded-lg flex items-center justify-center mb-2 bg-gradient-to-br",
                                  cat.color,
                                  "text-white"
                                )}>
                                  <Icon className="w-5 h-5" />
                                </div>
                                <h3 className={cn(
                                  "font-semibold text-sm mb-0.5 transition-colors",
                                  field.value === cat.id ? "text-primary" : "text-foreground"
                                )}>
                                  {cat.label}
                                </h3>
                                <p className="text-xs text-muted-foreground">{cat.description}</p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Form Fields - Show when category selected */}
              {selectedCategory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-6 p-6 rounded-2xl bg-card border shadow-sm"
                >
                  {/* Item Name */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-base font-semibold">
                          <Package className="w-4 h-4" />
                          Item name *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Blue Samsung Galaxy S21" className="h-12 text-base" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Color, brand, unique marks, case style..."
                            className="min-h-[100px] resize-none text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* IMAGE UPLOAD - More Prominent */}
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-base font-semibold">
                          <Upload className="w-4 h-4" />
                          Upload photo
                        </FormLabel>
                        <FormDescription className="text-sm mb-3">
                          📸 A clear photo helps recovery chances by <span className="font-semibold text-primary">3x</span>
                        </FormDescription>
                        <FormControl>
                          <ImageUpload
                            value={field.value || null}
                            onChange={field.onChange}
                            className="h-28 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors bg-primary/5"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Dynamic Identifier */}
                  {categoryData?.placeholder && (
                    <FormField
                      control={form.control}
                      name="identifier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            {categoryData.placeholder} <span className="text-muted-foreground font-normal text-sm">(helps verification)</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder={`Enter ${categoryData.placeholder}`} className="h-11" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Location & Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Last seen *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Kigali Heights" className="h-11" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateLost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            When *
                          </FormLabel>
                          <FormControl>
                            <Input type="date" className="h-11" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Reward (optional) */}
                  <FormField
                    control={form.control}
                    name="reward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Coins className="w-4 h-4" />
                          Reward amount <span className="text-muted-foreground font-normal text-sm">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 5,000 RWF" className="h-11" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          💡 Offering a reward increases recovery chances
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Contact Info - Only show if NOT logged in */}
                  {!isAuthenticated && (
                    <div className="pt-4 border-t">
                      <h3 className="font-semibold mb-4">Your contact details</h3>
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                          🔒 Secure and only shared with verified finders
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="contactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Your name *
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" className="h-11" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="contactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Phone *
                              </FormLabel>
                              <FormControl>
                                <Input type="tel" placeholder="078 000 0000" className="h-11" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Logged-in user notice */}
                  {isAuthenticated && (
                    <div className="pt-4 border-t">
                      <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-900 dark:text-green-100">
                          ✓ Using your account contact details
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || !selectedCategory}
                  className={cn(
                    "w-full h-14 rounded-xl text-base font-semibold transition-all duration-300",
                    selectedCategory
                      ? "bg-gradient-to-r from-primary to-primary/80 shadow-lg hover:shadow-xl"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit & Pay 1,000 RWF
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Trust Badge */}
              <p className="text-center text-xs text-muted-foreground">
                🔒 Secure payment via Flutterwave
              </p>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
