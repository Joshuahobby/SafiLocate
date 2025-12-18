import { useState } from "react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  MapPin,
  Loader2,
  Phone,
  AlertCircle,
  Sparkles,
  Send,
  Camera,
  Calendar,
  User,
  Package,
  Coins
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/image-upload";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Validation Schema
const lostItemSchema = z.object({
  category: z.string().min(1, "Select a category"),
  title: z.string().min(3, "What did you lose?"),
  description: z.string().min(10, "Add more details"),
  location: z.string().min(3, "Where was it last seen?"),
  dateLost: z.string().min(1, "When?"),
  imageUrl: z.string().optional(),
  reward: z.string().optional(),
  contactPhone: z.string().min(10, "Valid phone required").regex(/^(\+?250|0)7[0-9]{8}$/, "Rwanda number required"),
  contactName: z.string().min(2, "Your name"),
});

type FormData = z.infer<typeof lostItemSchema>;

const CATEGORIES = [
  { id: "electronics", label: "Phone/Laptop", emoji: "📱" },
  { id: "id_document", label: "ID/Passport", emoji: "🪪" },
  { id: "wallet", label: "Wallet/Bag", emoji: "👜" },
  { id: "keys", label: "Keys", emoji: "🔑" },
  { id: "clothing", label: "Clothes", emoji: "👕" },
  { id: "other", label: "Other", emoji: "📦" },
];

export default function ReportLost() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(lostItemSchema),
    defaultValues: {
      category: "",
      title: "",
      description: "",
      location: "",
      dateLost: new Date().toISOString().split('T')[0],
      imageUrl: "",
      reward: "",
      contactPhone: "",
      contactName: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        category: data.category,
        title: data.title,
        description: data.description,
        location: data.location,
        dateLost: data.dateLost,
        imageUrls: data.imageUrl ? [data.imageUrl] : [],
        reward: data.reward ? data.reward.replace(/[^0-9.]/g, '') : null,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        priceTier: "standard" as const,
      };

      const res = await apiRequest("POST", "/api/lost-items", payload);
      const item = await res.json();
      setLocation(`/payment?itemId=${item.id}&amount=1000`);
    } catch (e) {
      console.error(e);
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = form.watch("category");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-300">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Report Lost Item
          </div>
        </div>
      </header>

      <main className="pt-20 pb-8 px-4">
        <div className="max-w-xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent mb-2">
              Lost something?
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Let's help you find it. Fill in the details below.
            </p>
          </motion.div>

          {/* Fee Notice */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl">
                <Coins className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Listing fee: 1,000 RWF</p>
                <p className="text-xs text-amber-700 dark:text-amber-300">Helps verify listings & prevents spam</p>
              </div>
            </div>
          </motion.div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Category Selection - Emoji Pills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">What type of item?</FormLabel>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {CATEGORIES.map((cat) => (
                          <motion.button
                            key={cat.id}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => field.onChange(cat.id)}
                            className={cn(
                              "px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                              field.value === cat.id
                                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg shadow-slate-900/20"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md"
                            )}
                          >
                            <span className="text-base">{cat.emoji}</span>
                            {cat.label}
                          </motion.button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Main Form Card */}
              <AnimatePresence>
                {selectedCategory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-5 p-6 rounded-3xl bg-white dark:bg-slate-800/50 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-700/50"
                  >
                    {/* Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Item name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Blue Samsung Galaxy S21"
                              className="h-12 bg-slate-50 dark:bg-slate-900/50 border-0 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-base"
                              {...field}
                            />
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
                          <FormLabel className="text-sm font-medium text-slate-600 dark:text-slate-400">Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Color, brand, unique marks, case style..."
                              className="min-h-[80px] bg-slate-50 dark:bg-slate-900/50 border-0 rounded-xl resize-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Location & Date Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Last seen
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Kigali Heights"
                                className="h-12 bg-slate-50 dark:bg-slate-900/50 border-0 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                                {...field}
                              />
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
                            <FormLabel className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              When
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                className="h-12 bg-slate-50 dark:bg-slate-900/50 border-0 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Contact Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Your name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John Doe"
                                className="h-12 bg-slate-50 dark:bg-slate-900/50 border-0 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                                {...field}
                              />
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
                            <FormLabel className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              Phone
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="078 000 0000"
                                className="h-12 bg-slate-50 dark:bg-slate-900/50 border-0 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Optional: Photo Upload - Compact */}
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            Photo <span className="text-slate-400 font-normal">(optional)</span>
                          </FormLabel>
                          <FormControl>
                            <ImageUpload
                              value={field.value || null}
                              onChange={field.onChange}
                              className="h-24 bg-slate-50 dark:bg-slate-900/50 border-dashed border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || !selectedCategory}
                  className={cn(
                    "w-full h-14 rounded-2xl text-base font-semibold transition-all duration-300",
                    selectedCategory
                      ? "bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 dark:from-white dark:to-slate-200 dark:text-slate-900 dark:hover:from-slate-100 dark:hover:to-slate-300 shadow-xl shadow-slate-900/20 dark:shadow-white/20"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
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
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center text-xs text-slate-400 dark:text-slate-500"
              >
                🔒 Secure payment via Flutterwave
              </motion.p>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
