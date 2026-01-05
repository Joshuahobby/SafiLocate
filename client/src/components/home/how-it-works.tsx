import { motion } from "framer-motion";
import { Search, Bell, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const steps = [
    {
        icon: Search,
        title: "Report",
        description: "Lost something? Describe it in seconds. Found something? Snap a photo.",
        color: "text-blue-500",
        bg: "bg-blue-50",
        delay: 0.1,
    },
    {
        icon: Bell,
        title: "Match",
        description: "Our smart AI matches lost items with found reports instantly.",
        color: "text-amber-500",
        bg: "bg-amber-50",
        delay: 0.2,
    },
    {
        icon: ShieldCheck,
        title: "Recover",
        description: "Verify ownership and meet securely to get your item back.",
        color: "text-emerald-500",
        bg: "bg-emerald-50",
        delay: 0.3,
    },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-20 bg-background/50 relative overflow-hidden backdrop-blur-sm">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -right-[5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-3xl opacity-50" />
                <div className="absolute top-[20%] -left-[5%] w-[20%] h-[20%] bg-amber-500/5 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                            Simple. Fast. <span className="text-primary">Secure.</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            We've streamlined the process of finding and returning lost items, so you can get back to what matters.
                        </p>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: step.delay }}
                            className="relative flex flex-col items-center text-center bg-card md:bg-transparent p-6 rounded-2xl md:p-0 border md:border-none shadow-sm md:shadow-none"
                        >
                            <div className={`w-24 h-24 ${step.bg} rounded-full flex items-center justify-center mb-6 shadow-sm relative group transition-transform hover:scale-110 duration-300`}>
                                <step.icon className={`w-10 h-10 ${step.color}`} />
                                <div className={`absolute inset-0 ${step.bg} rounded-full opacity-50 animate-ping`} style={{ animationDuration: '3s' }} />
                            </div>

                            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-16 text-center"
                >
                    <Link href="/about">
                        <Button variant="outline" size="lg" className="rounded-full gap-2 group hover:border-primary/50">
                            Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
