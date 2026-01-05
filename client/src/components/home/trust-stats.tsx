import { motion } from "framer-motion";
import { Users, CheckCircle, Clock } from "lucide-react";

const stats = [
    {
        label: "Items Recovered",
        value: "2,500+",
        icon: CheckCircle,
        color: "text-emerald-500",
    },
    {
        label: "Active Finders",
        value: "10k+",
        icon: Users,
        color: "text-blue-500",
    },
    {
        label: "Avg. Return Time",
        value: "24h",
        icon: Clock,
        color: "text-amber-500",
    },
];

export function TrustStats() {
    return (
        <section className="py-16 bg-primary/5 relative border-y border-border/50 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-dot-black/[0.2] opacity-30 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="flex flex-col items-center justify-center text-center space-y-2 p-4"
                        >
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <stat.icon className={`w-5 h-5 ${stat.color} opacity-80`} />
                                <span className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-foreground">
                                    {stat.value}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
