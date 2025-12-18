import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, ShieldCheck, Lock, CreditCard, Smartphone, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Navbar } from "@/components/layout/navbar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PaymentPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'method' | 'processing'>('method');
  const [phoneNumber, setPhoneNumber] = useState("");

  // Extract query params
  const searchParams = new URLSearchParams(window.location.search);
  const amount = searchParams.get('amount') || "1000";
  const itemId = searchParams.get('itemId');

  useEffect(() => {
    if (!itemId) {
      toast({ title: "Error", description: "No item ID provided. Please start a new report.", variant: "destructive" });
      setLocation('/report-lost');
    }
  }, [itemId, setLocation, toast]);

  const handlePayment = async () => {
    if (!phoneNumber.startsWith("07")) {
      toast({ title: "Invalid Phone", description: "Please enter a valid Rwanda phone number (starts with 07).", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setStep('processing');

    try {
      // Initialize Payment on Server
      const res = await apiRequest("POST", "/api/payments/initialize", {
        lostItemId: itemId,
        amount: parseInt(amount),
        phoneNumber
      });

      const data = await res.json();

      if (data.paymentUrl) {
        // Redirect to Flutterwave (or Mock)
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("Failed to get payment URL");
      }

    } catch (error: any) {
      console.error(error);
      setStep('method');
      toast({
        title: "Transaction Failed",
        description: error.message || "Could not initialize payment.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-8 pt-20">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/30 blur-3xl rounded-full animate-pulse" />
            <div className="relative bg-white/80 backdrop-blur-xl p-10 rounded-full shadow-2xl ring-1 ring-white/50">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-3 max-w-md">
            <h2 className="text-2xl font-bold">Initiating Payment...</h2>
            <p className="text-muted-foreground text-lg">
              Please wait while we redirect you to the secure payment gateway.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 py-12 px-4 flex items-center justify-center pt-24 bg-hero-wave">
        <Card className="max-w-lg w-full overflow-hidden glass-card border-none shadow-2xl">
          <div className="bg-slate-900 text-white p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/3 -translate-y-1/3">
              <ShieldCheck className="w-48 h-48" />
            </div>
            <h1 className="text-2xl font-heading font-bold relative z-10 mb-2">Secure Checkout</h1>
            <p className="text-slate-300 text-sm relative z-10 flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" /> Encrypted by Flutterwave
            </p>
          </div>

          <div className="p-8 space-y-8">
            <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Service</span>
                <span className="font-semibold text-slate-700">Lost Item Listing</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500">Total</span>
                <span className="text-3xl font-bold text-blue-600">{parseInt(amount).toLocaleString()} <span className="text-base font-medium text-slate-400">RWF</span></span>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Select Method</Label>
              <RadioGroup defaultValue="momo" className="grid grid-cols-2 gap-4">
                <div>
                  <RadioGroupItem value="momo" id="momo" className="peer sr-only" />
                  <Label
                    htmlFor="momo"
                    className="flex flex-col items-center justify-center h-24 rounded-2xl border-2 border-slate-100 bg-white p-4 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 peer-data-[state=checked]:text-blue-700 cursor-pointer transition-all shadow-sm"
                  >
                    <Smartphone className="mb-2 h-6 w-6" />
                    <span className="font-semibold">Mobile Money</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="card" id="card" className="peer sr-only" disabled />
                  <Label
                    htmlFor="card"
                    className="flex flex-col items-center justify-center h-24 rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 opacity-50 cursor-not-allowed"
                  >
                    <CreditCard className="mb-2 h-6 w-6" />
                    <span className="font-semibold">Card (Soon)</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-semibold">Mobile Number</Label>
                <Input
                  id="phone"
                  placeholder="078 000 0000"
                  className="h-14 text-lg bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <Button size="lg" className="w-full h-14 text-lg rounded-xl font-bold shadow-lg shadow-blue-500/20" onClick={handlePayment} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="animate-spin" /> : (
                <>Pay Now <ArrowRight className="ml-2 w-5 h-5" /></>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
