import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, ShieldCheck, Lock, CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function PaymentPage() {
  const [location, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'method' | 'processing' | 'success'>('method');
  
  // Extract query params for demo
  const searchParams = new URLSearchParams(window.location.search);
  const amount = searchParams.get('amount') || "1000";
  const listingId = searchParams.get('ref') || "LST-12345";

  const handlePayment = async () => {
    setIsProcessing(true);
    setStep('processing');
    
    // Simulate payment processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setStep('success');
    setIsProcessing(false);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Payment Successful</h1>
            <p className="text-muted-foreground">
              Your lost item listing is now active and visible to everyone.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-bold">{parseInt(amount).toLocaleString()} RWF</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono">TX-{Math.floor(Math.random() * 1000000)}</span>
            </div>
          </div>

          <Button className="w-full" onClick={() => setLocation('/')}>
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <div className="relative bg-card p-6 rounded-full shadow-lg">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Processing Payment...</h2>
          <p className="text-muted-foreground">Please check your phone for the Mobile Money prompt.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 flex items-center justify-center">
      <Card className="max-w-md w-full overflow-hidden">
        <div className="bg-[#2D3748] text-white p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck className="w-32 h-32" />
            </div>
            <h1 className="text-xl font-bold relative z-10">Secure Checkout</h1>
            <p className="text-gray-300 text-sm mt-1 relative z-10">Powered by Flutterwave</p>
        </div>

        <div className="p-6 space-y-8">
            <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium">Lost Item Listing</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total to Pay</span>
                    <span className="text-2xl font-bold text-primary">{parseInt(amount).toLocaleString()} RWF</span>
                </div>
            </div>

            <div className="space-y-4">
                <Label>Select Payment Method</Label>
                <RadioGroup defaultValue="momo" className="grid grid-cols-2 gap-4">
                    <div>
                        <RadioGroupItem value="momo" id="momo" className="peer sr-only" />
                        <Label
                            htmlFor="momo"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                        >
                            <Smartphone className="mb-3 h-6 w-6" />
                            Mobile Money
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="card" id="card" className="peer sr-only" />
                        <Label
                            htmlFor="card"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                        >
                            <CreditCard className="mb-3 h-6 w-6" />
                            Card
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <Input id="phone" placeholder="078 000 0000" className="h-12" />
                </div>
            </div>

            <Button size="lg" className="w-full h-12 text-lg" onClick={handlePayment}>
                <Lock className="w-4 h-4 mr-2" />
                Pay Now
            </Button>
            
            <div className="text-center">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" />
                    Payments are secure and encrypted
                </p>
            </div>
        </div>
      </Card>
    </div>
  );
}
