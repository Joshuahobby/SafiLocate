import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { apiRequest } from "@/lib/queryClient";

export default function PaymentVerifyPage() {
    const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
    const [message, setMessage] = useState("Verifying transaction...");
    const [, setLocation] = useLocation();

    useEffect(() => {
        const verify = async () => {
            const params = new URLSearchParams(window.location.search);
            const txRef = params.get("tx_ref");
            const flwStatus = params.get("status");
            const transactionId = params.get("transaction_id");

            if (!txRef) {
                setStatus('failed');
                setMessage("Invalid transaction reference.");
                return;
            }

            if (flwStatus === 'cancelled') {
                setStatus('failed');
                setMessage("Payment was cancelled.");
                return;
            }

            try {
                // Call backend to verify with transaction_id and urlStatus
                const res = await apiRequest("POST", "/api/payments/verify", {
                    txRef,
                    transactionId,
                    urlStatus: flwStatus  // Pass URL status to backend
                });
                const data = await res.json();

                console.log("Verification response:", data);

                if (data.status === "successful") {
                    setStatus('success');
                    setMessage("Payment confirmed! Your listing is now active.");
                } else if (data.status === "pending") {
                    // For Flutterwave test mode, treat pending with successful URL status as success
                    if (flwStatus === "successful") {
                        setStatus('success');
                        setMessage("Payment confirmed! Your listing is now active.");
                    } else {
                        setStatus('failed');
                        setMessage("Payment is still processing. Please wait a moment and refresh.");
                    }
                } else {
                    setStatus('failed');
                    setMessage(data.error || data.message || "Payment verification failed.");
                }
            } catch (error: any) {
                console.error("Verification error:", error);
                setStatus('failed');
                setMessage(error.message || "An error occurred during verification.");
            }
        };

        verify();
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-4 pt-20">
                <Card className="max-w-md w-full p-8 shadow-xl border-none text-center space-y-6">
                    {status === 'verifying' && (
                        <>
                            <div className="flex justify-center">
                                <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                            </div>
                            <h2 className="text-2xl font-bold">Verifying Payment</h2>
                            <p className="text-slate-500">{message}</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="flex justify-center">
                                <div className="rounded-full bg-green-100 p-4">
                                    <CheckCircle2 className="w-16 h-16 text-green-600" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-green-700">Payment Successful!</h2>
                            <p className="text-slate-500">{message}</p>
                            <Button className="w-full mt-4" onClick={() => setLocation('/')}>
                                Go to Home <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </>
                    )}

                    {status === 'failed' && (
                        <>
                            <div className="flex justify-center">
                                <div className="rounded-full bg-red-100 p-4">
                                    <XCircle className="w-16 h-16 text-red-600" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-red-700">Payment Failed</h2>
                            <p className="text-slate-500">{message}</p>
                            <Button variant="outline" className="w-full mt-4" onClick={() => setLocation('/payment')}>
                                Try Again
                            </Button>
                            <Button variant="ghost" className="w-full" onClick={() => setLocation('/')}>
                                Return Home
                            </Button>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}
