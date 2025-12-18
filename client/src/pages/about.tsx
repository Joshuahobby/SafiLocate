import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Search, HeartHandshake } from "lucide-react";

export default function About() {
    return (
        <div className="min-h-screen bg-background font-sans">
            <Navbar />

            {/* Hero */}
            <div className="bg-hero-wave py-20 px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-800 mb-6">
                    Recovering What Matters
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    SafiLocate is Rwanda's trusted digital registry for lost and found items.
                    We connect people who found items with those who lost them.
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
                <div className="grid md:grid-cols-3 gap-8">
                    <Card className="glass-card border-none">
                        <CardContent className="pt-6 text-center space-y-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold">Secure Registry</h3>
                            <p className="text-muted-foreground">
                                Every item is logged securely. We verify claims to ensure items are returned to their rightful owners.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-none">
                        <CardContent className="pt-6 text-center space-y-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
                                <Search className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold">Smart Search</h3>
                            <p className="text-muted-foreground">
                                Our powerful search helps you find matches quickly by category, location, or date.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-none">
                        <CardContent className="pt-6 text-center space-y-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                                <HeartHandshake className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold">Community Driven</h3>
                            <p className="text-muted-foreground">
                                Built on the honesty and cooperation of the community. Together we restore peace of mind.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="bg-slate-50 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 space-y-4">
                        <h2 className="text-3xl font-bold text-slate-800">How to get started?</h2>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</span>
                                <span className="text-slate-700">Report an item you lost or found.</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</span>
                                <span className="text-slate-700">Our system matches descriptions.</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</span>
                                <span className="text-slate-700">Verify ownership and meet safely.</span>
                            </li>
                        </ul>
                    </div>
                    <div className="flex-1">
                        {/* We could put an image here, but for now a placeholder graphic */}
                        <div className="aspect-video bg-blue-100 rounded-xl flex items-center justify-center">
                            <p className="text-blue-300 font-bold text-xl">Trust in Motion</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
