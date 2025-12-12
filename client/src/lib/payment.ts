import { toast } from "@/hooks/use-toast";

export interface PaymentRequest {
    phoneNumber: string;
    amount: number;
    provider: 'momo' | 'card';
}

export interface PaymentResponse {
    success: boolean;
    transactionId: string;
    error?: string;
}

/**
 * Simulates a payment processing delay and result.
 * In a real app, this would call your backend which talks to Paypack/Flutterwave.
 */
export async function processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Mock validation
    if (!request.phoneNumber.startsWith("07")) {
        return {
            success: false,
            transactionId: "",
            error: "Invalid phone number format. Must start with 07."
        };
    }

    // 90% success rate simulation
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
        return {
            success: true,
            transactionId: `TX-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
        };
    } else {
        return {
            success: false,
            transactionId: "",
            error: "Payment declined by provider. Please try again."
        };
    }
}
