import { storage } from "../storage.js";
import { User, InsertClaim, FoundItem, LostItem } from "@shared/schema";

interface EmailOptions {
    to: string;
    subject: string;
    body: string;
}

interface SmsOptions {
    to: string;
    message: string;
}

class NotificationService {
    private isDev = process.env.NODE_ENV !== "production";

    /**
     * Sends an email notification.
     * Currently mocked to console in development.
     */
    async sendEmail({ to, subject, body }: EmailOptions): Promise<boolean> {
        if (!to) return false;

        // TODO: Integrate actual Email Provider (SendGrid, Mailgun, etc.)
        console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
        console.log(`[EMAIL BODY] ${body}`);
        return true;
    }

    /**
     * Sends an SMS notification.
     * Currently mocked to console in development.
     */
    async sendSms({ to, message }: SmsOptions): Promise<boolean> {
        if (!to) return false;

        // TODO: Integrate actual SMS Provider (Twilio, Termii, etc.)
        console.log(`[SMS MOCK] To: ${to} | Message: ${message}`);
        return true;
    }

    /**
     * Notify the item owner (finder/seeker) that a new claim has been submitted.
     */
    async notifyItemOwnerOfClaim(claim: any, item: FoundItem | LostItem, claimerId: string) {
        try {
            // Determine owner ID
            const ownerId = 'finderId' in item ? item.finderId : item.seekerId;
            if (!ownerId) return;

            const owner = await storage.getUser(ownerId);
            if (!owner) return;

            const claimer = await storage.getUser(claimerId);
            const claimerName = claimer ? claimer.username : "A user";

            const itemTitle = item.title;
            const claimLink = `${process.env.APP_URL || 'http://localhost:5000'}/dashboard`;

            // Email Notification
            if (owner.email) {
                await this.sendEmail({
                    to: owner.email,
                    subject: `New Claim for: ${itemTitle}`,
                    body: `Hello ${owner.username},\n\n${claimerName} has submitted a new claim for your item: "${itemTitle}".\n\nPlease log in to your dashboard to review and verify this claim.\n\nLink: ${claimLink}`
                });
            }

            // SMS Notification
            if (owner.phone) {
                await this.sendSms({
                    to: owner.phone,
                    message: `SafiLocate: New claim for "${itemTitle}". Log in to verify: ${claimLink}`
                });
            }

        } catch (error) {
            console.error("Error notifying item owner:", error);
        }
    }

    /**
     * Notify the claimant that their claim status has been updated.
     */
    async notifyClaimantOfStatusChange(claim: any, item: FoundItem | LostItem, status: string) {
        try {
            const claimant = await storage.getUser(claim.userId);
            if (!claimant) return;

            const itemTitle = item.title;
            const dashboardLink = `${process.env.APP_URL || 'http://localhost:5000'}/dashboard`;

            // Customize message based on status
            let subject = `Claim Update: ${itemTitle}`;
            let body = `Hello ${claimant.username},\n\nThe status of your claim for "${itemTitle}" has been updated to: ${status.toUpperCase()}.`;
            let smsMessage = `SafiLocate: Your claim for "${itemTitle}" is now ${status.toUpperCase()}.`;

            if (status === "verified") {
                subject = `Claim VERIFIED: ${itemTitle}`;
                body += `\n\nCongratulations! Your claim has been verified. You can now view the contact details for this item on your dashboard.\n\nView Details: ${dashboardLink}`;
                smsMessage += ` View contact details: ${dashboardLink}`;
            } else if (status === "rejected") {
                body += `\n\nPlease contact support if you believe this is an error.`;
            }

            // Email
            if (claimant.email) {
                await this.sendEmail({
                    to: claimant.email,
                    subject: subject,
                    body: body
                });
            }

            // SMS
            if (claimant.phone) {
                await this.sendSms({
                    to: claimant.phone,
                    message: smsMessage
                });
            }

        } catch (error) {
            console.error("Error notifying claimant:", error);
        }
    }
}

export const notificationService = new NotificationService();
