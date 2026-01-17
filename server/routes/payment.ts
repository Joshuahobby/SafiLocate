import { Router } from "express";
import { paymentService } from "../services/payment.service.js";

const router = Router();

// Endpoint: /api/payments/initialize
router.post("/initialize", async (req, res) => {
    try {
        const { lostItemId, amount, phoneNumber } = req.body;

        if (!lostItemId || !amount || !phoneNumber) {
            return res.status(400).json({ error: "Missing required fields: lostItemId, amount, phoneNumber" });
        }

        const result = await paymentService.initializePayment({
            lostItemId,
            amount,
            phoneNumber
        });

        res.json(result);
    } catch (error) {
        console.error("Payment init error:", error);
        res.status(500).json({ error: "Failed to initialize payment" });
    }
});

// Endpoint: /api/payments/webhook/flutterwave
router.post("/webhook/flutterwave", async (req, res) => {
    try {
        const signature = (req.headers["verif-hash"] as string) || "";
        // Pass the entire body as payload
        const result = await paymentService.handleWebhook(signature, req.body);
        res.json({ status: "success", data: result });
    } catch (error: any) {
        console.error("Webhook error:", error);
        res.status(400).json({ status: "error", message: error.message });
    }
});

// Endpoint: /api/payments/verify
// Use this to manually verify a transaction (e.g., polling from frontend)
router.post("/verify", async (req, res) => {
    try {
        const { txRef, transactionId, urlStatus } = req.body;
        if (!txRef) return res.status(400).json({ error: "txRef required" });

        const result = await paymentService.verifyTransaction(txRef, transactionId, urlStatus);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint: /api/payments/mock-redirect
// Simulates the Flutterwave payment page interaction
router.get("/mock-redirect", (req, res) => {
    const txRef = req.query.tx_ref as string;
    res.send(`
        <html>
            <body style="font-family: system-ui, sans-serif; text-align: center; padding: 50px; background: #f0fdf4;">
                <h1 style="color: #166534;">Simulating Flutterwave Payment...</h1>
                <p>Transaction: <strong>${txRef}</strong></p>
                <div id="status" style="margin-top: 20px;">Processing Payment with Mobile Money...</div>
                <script>
                    setTimeout(() => {
                        document.getElementById('status').innerText = "Payment Successful! Verifying with server...";
                        
                        // Call verify on server
                        fetch('/api/payments/verify', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ txRef: '${txRef}' })
                        }).then(async (res) => {
                           if(res.ok) {
                                document.getElementById('status').innerText = "Verified! Redirecting...";
                                setTimeout(() => {
                                    window.location.href = '/payment/verify?tx_ref=${txRef}&status=successful'; 
                                }, 1000);
                           } else {
                                document.getElementById('status').innerText = "Verification Failed.";
                           }
                        });
                    }, 2000);
                </script>
            </body>
        </html>
    `);
});

export const paymentRoutes = router;
