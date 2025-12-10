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
  Smartphone,
  Wallet,
  FileText,
  Key,
  Shirt,
  MoreHorizontal
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/image-upload";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";

// Validation Schemas
const foundItemSchema = z.object({
  category: z.string().min(1, "Please select a category"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Please provide more detail"),
  location: z.string().min(3, "Location is required"),
  dateFound: z.string().min(1, "Date is required"),
  imageUrl: z.string().optional(),
  contactPhone: z.string().min(10, "Valid phone number required").regex(/^(\+?250|0)7[0-9]{8}$/, "Must be a valid Rwanda phone number"),
  contactName: z.string().min(2, "Name is required"),
});

type FormData = z.infer<typeof foundItemSchema>;

const STEPS = [
  { id: 'details', title: 'What did you find?', icon: Tag },
  { id: 'location', title: 'Where & When?', icon: MapPin },
  { id: 'contact', title: 'Your Details', icon: User },
];

const CATEGORIES = [
  { id: "id_document", label: "ID / Passport", icon: FileText },
  { id: "electronics", label: "Electronics", icon: Smartphone },
  { id: "wallet", label: "Wallet / Purse", icon: Wallet },
  { id: "keys", label: "Keys", icon: Key },
  { id: "clothing", label: "Clothing", icon: Shirt },
  { id: "other", label: "Other Item", icon: MoreHorizontal },
];

export default function ReportFound() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<FormData>({
    resolver: zodResolver(foundItemSchema),
    defaultValues: {
      category: "",
      title: "",
      description: "",
      location: "",
      dateFound: new Date().toISOString().split('T')[0],
      imageUrl: "",
      contactPhone: "",
      contactName: "",
    },
    mode: "onChange",
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    if (step === 0) fieldsToValidate = ['category', 'title', 'description'];
    if (step === 1) fieldsToValidate = ['location', 'dateFound', 'imageUrl'];
    if (step === 2) fieldsToValidate = ['contactName', 'contactPhone'];

    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid) {
      setStep((s) => Math.min(s + 1, STEPS.length));
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmittedData(data);
    setIsSubmitting(false);
    toast({
      title: "Report Submitted",
      description: "Thank you for being a good citizen!",
    });
  };

  // Success View
  if (submittedData) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6 animate-in zoom-in-95 duration-300 border-none shadow-xl">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50">
            <Check className="w-12 h-12" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-heading font-bold text-foreground">Thank You!</h1>
            <p className="text-muted-foreground text-lg">
              You've helped make someone's day better.
            </p>
          </div>

          <div className="bg-muted/30 rounded-2xl p-6 text-left space-y-4">
            <div className="flex justify-between border-b border-border/50 pb-3">
              <span className="text-muted-foreground">Reference ID</span>
              <span className="font-mono font-bold text-primary">#FD-{Math.floor(Math.random() * 10000)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Item</span>
              <span className="font-medium bg-background px-3 py-1 rounded-full shadow-sm">{submittedData.title}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Link href="/report-found" onClick={() => window.location.reload()} className="w-full">
              <Button className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/20">Report Another Item</Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="ghost" className="w-full h-12 rounded-xl">Return Home</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

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
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Step {step + 1} of {STEPS.length}</span>
            <span className="text-sm font-medium text-foreground">{STEPS[step].title}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
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
                                    ? "border-primary bg-primary/5 shadow-md" 
                                    : "border-muted bg-card hover:border-primary/30 hover:shadow-sm"
                                )}
                              >
                                <cat.icon className={cn(
                                  "w-8 h-8 mb-3", 
                                  field.value === cat.id ? "text-primary" : "text-muted-foreground"
                                )} />
                                <span className={cn(
                                  "text-sm font-medium text-center leading-tight",
                                  field.value === cat.id ? "text-primary" : "text-foreground"
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
                            <FormLabel className="text-base">What exactly is it?</FormLabel>
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
                          <FormLabel className="text-lg font-semibold">Location</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-4 top-4 h-6 w-6 text-muted-foreground" />
                              <Input 
                                placeholder="Where did you find it?" 
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
                      name="dateFound"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold">Date Found</FormLabel>
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
                          <FormLabel className="text-lg font-semibold">Photo Evidence</FormLabel>
                          <div className="mb-2 text-sm text-muted-foreground">
                            A picture is worth a thousand words.
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
                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex gap-4">
                      <div className="bg-blue-100 p-2 rounded-full h-fit">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">We value your privacy</h4>
                        <p className="text-blue-800/80 text-sm leading-relaxed">
                          Your contact details are securely stored and only shared with verified owners who claim this item.
                        </p>
                      </div>
                    </div>

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
                  className="flex-1 h-14 rounded-xl text-base font-semibold shadow-lg shadow-primary/25"
                >
                  Continue
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="flex-1 h-14 rounded-xl text-base font-semibold shadow-lg shadow-primary/25"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
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
