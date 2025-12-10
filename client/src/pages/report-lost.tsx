import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  MapPin, 
  Tag, 
  User, 
  Loader2, 
  ChevronRight,
  Check,
  Phone,
  Gift,
  AlertCircle,
  FileText,
  Smartphone,
  Wallet,
  Key,
  Shirt,
  MoreHorizontal
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/image-upload";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";

// Validation Schemas
const lostItemSchema = z.object({
  category: z.string().min(1, "Please select a category"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Please provide more detail"),
  location: z.string().min(3, "Last seen location is required"),
  dateLost: z.string().min(1, "Date is required"),
  imageUrl: z.string().optional(),
  reward: z.string().optional(),
  contactPhone: z.string().min(10, "Valid phone number required").regex(/^(\+?250|0)7[0-9]{8}$/, "Must be a valid Rwanda phone number"),
  contactName: z.string().min(2, "Name is required"),
});

type FormData = z.infer<typeof lostItemSchema>;

const STEPS = [
  { id: 'details', title: 'What did you lose?', icon: Tag },
  { id: 'location', title: 'Where & When?', icon: MapPin },
  { id: 'contact', title: 'Contact & Reward', icon: User },
];

const CATEGORIES = [
  { id: "id_document", label: "ID / Passport", icon: FileText },
  { id: "electronics", label: "Electronics", icon: Smartphone },
  { id: "wallet", label: "Wallet / Purse", icon: Wallet },
  { id: "keys", label: "Keys", icon: Key },
  { id: "clothing", label: "Clothing", icon: Shirt },
  { id: "other", label: "Other Item", icon: MoreHorizontal },
];

export default function ReportLost() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();

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

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    if (step === 0) fieldsToValidate = ['category', 'title', 'description'];
    if (step === 1) fieldsToValidate = ['location', 'dateLost', 'imageUrl'];
    if (step === 2) fieldsToValidate = ['contactName', 'contactPhone', 'reward'];

    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid) {
      setStep((s) => Math.min(s + 1, STEPS.length));
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    // Simulate API call to create pending listing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redirect to payment
    const mockListingId = "LST-" + Math.floor(Math.random() * 10000);
    setLocation(`/payment?ref=${mockListingId}&amount=1000`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Minimal Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="-ml-2 hover:bg-muted/50 rounded-full px-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </Link>
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-destructive uppercase tracking-wider">Step {step + 1} of {STEPS.length}</span>
            <span className="text-sm font-medium text-foreground">{STEPS[step].title}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-destructive"
              initial={{ width: "0%" }}
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Cost Alert */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8 flex gap-4 items-center shadow-sm">
          <div className="bg-amber-100 p-2 rounded-full text-amber-600">
             <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-sm text-amber-800 leading-relaxed">
            Note: Reporting a lost item costs <strong>1,000 RWF</strong>. This fee helps us verify listings and prevent spam.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {step === 0 && (
                  <div className="space-y-8">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-lg font-semibold">Select Category</FormLabel>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {CATEGORIES.map((cat) => (
                              <div
                                key={cat.id}
                                onClick={() => field.onChange(cat.id)}
                                className={cn(
                                  "cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]",
                                  field.value === cat.id 
                                    ? "border-destructive bg-destructive/5 shadow-md" 
                                    : "border-muted bg-card hover:border-destructive/30 hover:shadow-sm"
                                )}
                              >
                                <cat.icon className={cn(
                                  "w-8 h-8 mb-3", 
                                  field.value === cat.id ? "text-destructive" : "text-muted-foreground"
                                )} />
                                <span className={cn(
                                  "text-sm font-medium text-center leading-tight",
                                  field.value === cat.id ? "text-destructive" : "text-foreground"
                                )}>{cat.label}</span>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">What exactly did you lose?</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Blue Samsung Galaxy S21" className="h-14 text-lg rounded-xl bg-muted/30 border-transparent focus:bg-background focus:border-input transition-all" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Any details?</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe features like color, brand, condition, or unique marks..." 
                                className="min-h-[120px] resize-none text-base rounded-xl bg-muted/30 border-transparent focus:bg-background focus:border-input transition-all p-4" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-8">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold">Last Seen Location</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-4 top-4 h-6 w-6 text-muted-foreground" />
                              <Input 
                                placeholder="e.g. Near Kigali Heights, Kimihurura" 
                                className="pl-12 h-14 text-lg rounded-xl bg-muted/30 border-transparent focus:bg-background focus:border-input transition-all" 
                                {...field} 
                              />
                            </div>
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
                          <FormLabel className="text-lg font-semibold">Date Lost</FormLabel>
                          <FormControl>
                            <Input type="date" className="h-14 text-lg rounded-xl bg-muted/30 border-transparent focus:bg-background focus:border-input transition-all" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold">Reference Photo (Optional)</FormLabel>
                          <div className="mb-2 text-sm text-muted-foreground">
                            If you have a photo of the item (or a similar one), upload it here.
                          </div>
                          <FormControl>
                            <ImageUpload 
                              value={field.value || null} 
                              onChange={field.onChange}
                              className="bg-muted/30 border-muted-foreground/20" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <FormField
                      control={form.control}
                      name="reward"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold">Reward (Optional)</FormLabel>
                          <div className="mb-2 text-sm text-muted-foreground">
                            Offering a reward can encourage finders to return your item.
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Gift className="absolute left-4 top-4 h-6 w-6 text-amber-500" />
                              <Input 
                                placeholder="e.g. 5000 RWF" 
                                className="pl-12 h-14 text-lg rounded-xl bg-amber-50 border-amber-200 focus:border-amber-400 focus:ring-amber-200 transition-all text-amber-900 placeholder:text-amber-900/40 font-medium" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="h-px bg-border my-6" />

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="contactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Your Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" className="h-14 text-lg rounded-xl bg-muted/30 border-transparent focus:bg-background focus:border-input transition-all" {...field} />
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
                            <FormLabel className="text-base">Mobile Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-4 top-4 h-6 w-6 text-muted-foreground" />
                                <Input 
                                  type="tel" 
                                  placeholder="078 000 0000" 
                                  className="pl-12 h-14 text-lg rounded-xl bg-muted/30 border-transparent focus:bg-background focus:border-input transition-all" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-4 pt-8">
              {step > 0 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  className="flex-1 h-14 rounded-xl text-base font-medium border-border/50 bg-background hover:bg-muted"
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              )}
              
              {step < STEPS.length - 1 ? (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="flex-1 h-14 rounded-xl text-base font-semibold shadow-lg shadow-destructive/25 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Continue
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="flex-1 h-14 rounded-xl text-base font-semibold shadow-lg shadow-destructive/25 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Proceed to Payment"
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
