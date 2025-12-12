import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, MapPin, ShieldCheck, ArrowRight, Wallet, Phone, ArrowUpRight, Search as SearchIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation - Glassmorphic */}
      <Navbar />

      <main className="flex-1 pt-16">
        {/* Premium Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-hero-wave">
          <div className="container mx-auto px-4 relative z-10 pt-10 pb-20">
            <div className="max-w-5xl mx-auto text-center space-y-12">

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center"
              >
                <div className="inline-flex items-center rounded-full border border-blue-200 bg-white/60 backdrop-blur-md px-5 py-2 text-sm font-semibold text-blue-700 mb-8 shadow-sm hover:bg-white/80 transition-colors cursor-default">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 mr-3 animate-pulse"></span>
                  Trusted by 10,000+ users in Rwanda
                </div>

                <h1 className="text-6xl md:text-8xl font-heading font-extrabold tracking-tight text-slate-900 mb-8 leading-[1]">
                  Lost something? <br />
                  <span className="text-gradient">We help you find it.</span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
                  The smart, secure way to report missing items and connect with trusted finders in your community.
                </p>
              </motion.div>

              {/* Enhanced Search Pill */}
              <motion.div
                className="w-full max-w-2xl mx-auto relative group"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="glass p-2.5 rounded-full flex items-center shadow-2xl shadow-blue-900/5 ring-1 ring-white/50 relative bg-white/80">
                  <div className="pl-5 text-blue-500">
                    <Search className="w-6 h-6" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for IDs, Keys, Electronics..."
                    className="flex-1 bg-transparent border-none h-14 px-4 focus:ring-0 text-lg placeholder:text-slate-400 font-medium text-slate-800 outline-none w-full min-w-0"
                  />
                  <Link href="/search">
                    <Button size="lg" className="rounded-full px-8 h-14 text-lg font-bold shadow-lg shadow-blue-500/20 shrink-0 bg-blue-600 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95">
                      Search
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Action Choice Cards */}
              <motion.div
                className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Link href="/report-lost" className="group">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 text-left h-full flex items-start gap-5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="bg-orange-100/80 p-4 rounded-2xl text-orange-600 group-hover:scale-110 transition-transform duration-300">
                      <SearchIcon className="w-8 h-8" />
                    </div>
                    <div className="relative">
                      <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-orange-600 transition-colors">I Lost Something</h3>
                      <p className="text-slate-500 leading-snug">Report a missing item and alert the community instantly.</p>
                      <div className="mt-4 flex items-center text-sm font-semibold text-orange-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                        Start Report <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/report-found" className="group">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 text-left h-full flex items-start gap-5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="bg-blue-100/80 p-4 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform duration-300">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div className="relative">
                      <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">I Found Something</h3>
                      <p className="text-slate-500 leading-snug">Report a found item and help return it to its owner.</p>
                      <div className="mt-4 flex items-center text-sm font-semibold text-blue-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                        Start Report <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Feature Grid - Clean & Modern */}
        <section className="py-24 bg-background relative">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Wallet className="w-8 h-8 text-white" />}
                color="bg-blue-500"
                title="Report Lost Items"
                description="Create a secure listing for your lost valuables. Add details and a reward to fast-track recovery."
              />
              <FeatureCard
                icon={<ShieldCheck className="w-8 h-8 text-white" />}
                color="bg-emerald-500"
                title="Trusted Finders"
                description="Our community of verified finders and partner institutions ensure your items are safe."
              />
              <FeatureCard
                icon={<MapPin className="w-8 h-8 text-white" />}
                color="bg-amber-500"
                title="Smart Matching"
                description="Our intelligent system matches lost reports with found items automatically based on location."
              />
            </div>
          </div>
        </section>

        {/* Recent Items Preview */}
        <section className="py-24 bg-muted/30 border-t">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-heading font-bold tracking-tight">Recently Found</h2>
                <p className="text-muted-foreground mt-2 text-lg">Items reported in the last 24 hours</p>
              </div>
              <Link href="/search">
                <Button variant="ghost" className="hidden sm:flex group text-primary font-medium">
                  View All Items
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card rounded-2xl overflow-hidden p-0 group cursor-pointer">
                  <div className="aspect-[4/3] bg-muted w-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <span className="text-white font-medium">View Details</span>
                    </div>
                    <div className="w-full h-full flex items-center justify-center bg-secondary/30 text-muted-foreground">
                      <Wallet className="w-12 h-12 opacity-20" />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 mb-3">
                      Found
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">National ID Card</h3>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1.5" />
                      Kigali, Nyarugenge
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center sm:hidden">
              <Link href="/search">
                <Button variant="outline" size="lg" className="w-full rounded-xl">View All Items</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">S</div>
                <span className="font-heading font-bold text-xl">SafiLocate</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Making it easy to find what matters. <br />
                Built with ❤️ in Rwanda.
              </p>
            </div>

            <div>
              <h4 className="font-heading font-semibold mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="/search" className="hover:text-primary transition-colors">Search Items</Link></li>
                <li><Link href="/report-lost" className="hover:text-primary transition-colors">Report Lost</Link></li>
                <li><Link href="/report-found" className="hover:text-primary transition-colors">Report Found</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-semibold mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="/faq" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="/safety" className="hover:text-primary transition-colors">Safety Tips</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-semibold mb-6">Contact</h4>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>+250 788 000 000</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} SafiLocate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, color, title, description }: { icon: React.ReactNode, color: string, title: string, description: string }) {
  return (
    <div className="group bg-card p-8 rounded-3xl border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className={`mb-6 w-14 h-14 rounded-2xl ${color} flex items-center justify-center shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="font-heading font-bold text-xl mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
