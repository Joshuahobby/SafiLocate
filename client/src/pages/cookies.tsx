import { Navbar } from "@/components/layout/navbar";

export default function Cookies() {
    return (
        <div className="min-h-screen bg-background font-sans">
            <Navbar />
            <main className="container mx-auto px-4 py-24 max-w-4xl prose prose-slate dark:prose-invert">
                <h1 className="font-heading mb-8">Cookie Policy</h1>
                <p className="text-lg text-muted-foreground mb-8">Last Updated: January 2025</p>

                <h3>1. What are Cookies?</h3>
                <p>Cookies are small text files that are stored on your device when you visit a website. They help us remember your preferences and improve your experience.</p>

                <h3>2. How We Use Cookies</h3>
                <ul>
                    <li><strong>Essential Cookies:</strong> Necessary for the website to function (e.g., keeping you logged in).</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site so we can improve it.</li>
                    <li><strong>Functional Cookies:</strong> Remember your preferences (e.g., dark mode setting).</li>
                </ul>

                <h3>3. Managing Cookies</h3>
                <p>You can control and/or delete cookies as you wish via your browser settings. However, disabling cookies may limit your use of certain features on our website.</p>

                <div className="h-12" />
            </main>
        </div>
    );
}
