import { Navbar } from "@/components/layout/navbar";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
    const faqs = [
        {
            q: "How does SafiLocate work?",
            a: "SafiLocate connects people who have lost items with those who found them. You can report a lost item or a found item. Our platform uses AI matching to alert you when a potential match is found."
        },
        {
            q: "Is it free to use?",
            a: "Yes, reporting lost and found items is completely free for the community."
        },
        {
            q: "How do I verify a match?",
            a: "Once a match is found, you can chat securely with the other party. We recommend asking specific questions about the item (e.g., unique scratches, wallpaper on a phone) before meeting."
        },
        {
            q: "What should I do if I find an ID card?",
            a: "Please report it as 'Found' on our platform. Since IDs contain sensitive info, we mask personal details publicly. The owner can search for their name and claim it securely."
        },
        {
            q: "How do I contacting support?",
            a: "You can reach out to our support team at support@safilocate.rw or use the contact form in the footer."
        }
    ];

    return (
        <div className="min-h-screen bg-background font-sans">
            <Navbar />
            <main className="container mx-auto px-4 py-24 max-w-3xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-heading font-bold mb-4">Frequently Asked Questions</h1>
                    <p className="text-xl text-muted-foreground">Everything you need to know about the platform.</p>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4 bg-card">
                            <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline hover:text-primary transition-colors">
                                {faq.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed text-base pt-2 pb-4">
                                {faq.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </main>
        </div>
    );
}
