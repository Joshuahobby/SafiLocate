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
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  { id: 'details', title: 'Item Details', icon: Tag },
  { id: 'location', title: 'Location', icon: MapPin },
  { id: 'contact', title: 'Contact & Reward', icon: User },
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
    
    if (step === 0) fieldsToValidate = ['category', 'title', 'description', 'dateLost'];
    if (step === 1) fieldsToValidate = ['location', 'imageUrl'];
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
    // In a real app, we'd get the listing ID from the API response
    const mockListingId = "LST-" + Math.floor(Math.random() * 10000);
    setLocation(`/payment?ref=${mockListingId}&amount=1000`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="-ml-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="font-semibold text-lg">Report Lost Item</h1>
          </div>
          <div className="text-sm text-muted-foreground hidden sm:block">
            Step {step + 1} of {STEPS.length}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isCompleted = i < step;

              return (
                <div key={s.id} className="flex flex-col items-center gap-2 flex-1">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                    isActive && "border-destructive bg-destructive text-destructive-foreground scale-110",
                    isCompleted && "border-destructive bg-destructive/10 text-destructive",
                    !isActive && !isCompleted && "border-muted bg-muted text-muted-foreground"
                  )}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={cn(
                    "text-xs font-medium hidden sm:block transition-colors",
                    isActive ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-destructive"
              initial={{ width: "0%" }}
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 flex gap-3 text-sm text-blue-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>
            Reporting a lost item costs <strong>1,000 RWF</strong>. This fee helps us maintain the platform and verify listings to prevent spam.
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
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {step === 0 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What did you lose?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="id_document">National ID / Passport</SelectItem>
                              <SelectItem value="electronics">Phone / Laptop / Electronics</SelectItem>
                              <SelectItem value="wallet">Wallet / Purse</SelectItem>
                              <SelectItem value="keys">Keys</SelectItem>
                              <SelectItem value="clothing">Clothing / Accessories</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Blue Samsung Galaxy S21" className="h-12" {...field} />
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
                          <FormLabel>Date Lost</FormLabel>
                          <FormControl>
                            <Input type="date" className="h-12" {...field} />
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
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe any distinguishing features (scratches, stickers, case color)..." 
                              className="min-h-[120px] resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last seen location</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                              <Input 
                                placeholder="e.g. Near Kigali Heights, Kimihurura" 
                                className="pl-10 h-12" 
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
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference Photo (Optional)</FormLabel>
                          <div className="mb-2 text-sm text-muted-foreground">
                            If you have a photo of the item (or a similar one), upload it here.
                          </div>
                          <FormControl>
                            <ImageUpload 
                              value={field.value || null} 
                              onChange={field.onChange} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="reward"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reward (Optional)</FormLabel>
                          <div className="mb-2 text-sm text-muted-foreground">
                            Offering a reward can encourage finders to return your item.
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Gift className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                              <Input 
                                placeholder="e.g. 5000 RWF" 
                                className="pl-10 h-12" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="h-px bg-border my-4" />

                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" className="h-12" {...field} />
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
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                              <Input 
                                type="tel" 
                                placeholder="078 000 0000" 
                                className="pl-10 h-12" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-4 pt-4 border-t">
              {step > 0 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  className="flex-1 h-12"
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              )}
              
              {step < STEPS.length - 1 ? (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="flex-1 h-12"
                >
                  Next Step
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="flex-1 h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
