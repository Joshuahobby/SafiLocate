import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function Terms() {
    return (
        <div className="min-h-screen bg-background font-sans flex flex-col">
            <Navbar />
            <main className="container mx-auto px-4 py-24 max-w-4xl prose prose-slate dark:prose-invert flex-1">
                <h1 className="font-heading mb-8">Terms of Service</h1>
                <p className="text-lg text-muted-foreground mb-8">Last Updated: January 2025</p>

                <h3>1. Acceptance of Terms</h3>
                <p>By accessing or using SafiLocate, you agree to be bound by these Terms of Service.</p>

                <h3>2. Description of Service</h3>
                <p>SafiLocate provides a platform for users to report lost and found items. We do not take possession of items and are not responsible for the items themselves.</p>

                <h3>3. User Conduct</h3>
                <p>You agree not to use the service for any illegal purposes. You must provide accurate information when reporting items. False reports or abuse of the system will result in account termination.</p>

                <h3>4. Limitation of Liability</h3>
                <p>SafiLocate is provided "as is". We are not liable for any damages arising from the use of our service or from meetings arranged through our platform.</p>

                <h3>5. Modifications</h3>
                <p>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of the new terms.</p>

                <div className="h-12" />
            </main>
            <Footer />
        </div>
    );
}
