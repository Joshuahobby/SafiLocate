import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function Privacy() {
    return (
        <div className="min-h-screen bg-background font-sans flex flex-col">
            <Navbar />
            <main className="container mx-auto px-4 py-24 max-w-4xl prose prose-slate dark:prose-invert flex-1">
                <h1 className="font-heading mb-8">Privacy Policy</h1>
                <p className="text-lg text-muted-foreground mb-8">Last Updated: January 2025</p>

                <h3>1. Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you create an account, report an item, or communicate with other users. This may include your name, email, phone number, and details about lost/found items.</p>

                <h3>2. How We Use Your Information</h3>
                <p>We use your information to facilitate the matching of lost and found items, communicate with you, and improve our services.</p>

                <h3>3. Information Sharing</h3>
                <p>We do not sell your personal information. We may share your contact details with another user ONLY when a potential match is verified and you have explicitly consented to the exchange.</p>

                <h3>4. Data Security</h3>
                <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>

                <div className="h-12" />
            </main>
            <Footer />
        </div>
    );
}
