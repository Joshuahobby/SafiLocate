import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Shield, UserCheck, MapPin, Clock, AlertTriangle } from "lucide-react";

export default function Safety() {
    const tips = [
        {
            icon: MapPin,
            title: "Meet in Public Places",
            desc: "Always choose a busy, public location like a café, police station, or shopping mall. Avoid private residences or secluded areas."
        },
        {
            icon: UserCheck,
            title: "Verify Identity",
            desc: "Ask specifically for details about the item that only the owner would know before meeting. Check their profile verification status."
        },
        {
            icon: Clock,
            title: "Daytime Meetings",
            desc: "Schedule your meetup during daylight hours. It's safer and easier to inspect the item."
        },
        {
            icon: Shield,
            title: "Bring a Friend",
            desc: "There is safety in numbers. If possible, bring a friend or family member along with you."
        },
        {
            icon: AlertTriangle,
            title: "Trust Your Instincts",
            desc: "If something feels off, cancel the meeting. Your safety is more important than the item."
        }
    ];

    return (
        <div className="min-h-screen bg-background font-sans flex flex-col">
            <Navbar />
            <main className="container mx-auto px-4 py-24 max-w-4xl flex-1">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-heading font-bold mb-4">Safety Guidelines</h1>
                    <p className="text-xl text-muted-foreground">Keep these tips in mind for a secure recovery experience.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {tips.map((tip, index) => (
                        <div key={index} className="flex gap-4 p-6 rounded-2xl border border-border bg-card/50 hover:bg-card transition-colors">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <tip.icon className="w-6 h-6" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">{tip.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{tip.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 p-8 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-center">
                    <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-4">Emergency Assistance</h3>
                    <p className="text-amber-800 dark:text-amber-200 mb-6">
                        If you feel threatened or encounter an emergency situation, please contact the local authorities immediately.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-amber-950 rounded-lg font-bold text-lg shadow-sm">
                        <span>Emergency: 112</span>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

