import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Search, MapPin, ShieldCheck, ArrowRight, Wallet, Phone, Zap, Globe } from "lucide-react";
import { motion } from "framer-motion";
import Typewriter from "typewriter-effect";
import { Navbar } from "@/components/layout/navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      {/* Navigation - Glassmorphic */}
      <Navbar />

      <main className="flex-1">
        {/* Premium Split Hero Section - Adjusted for coverage */}
        <section className="relative min-h-[85vh] flex items-center bg-hero-wave pt-16 pb-12 lg:pt-20 lg:pb-16">
          <div className="container mx-auto px-8 lg:px-12 relative z-10 text-center lg:text-left">
            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="space-y-6 max-w-2xl mx-auto lg:mx-0"
              >
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-primary shadow-sm mx-auto lg:mx-0">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-primary mr-2 animate-pulse"></span>
                  SafiLocate v2.0 is Live in Rwanda
                </div>

                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-foreground leading-[1.1] text-balance">
                  <span className="block">Lost your
                    <span className="text-primary inline-block ml-2">
                      <Typewriter
                        options={{
                          strings: ['Keys?', 'Wallet?', 'ID Card?', 'Passport?', 'Hope?'],
                          autoStart: true,
                          loop: true,
                          deleteSpeed: 50,
                          delay: 80,
                        }}
                      />
                    </span>
                  </span>
                  <span className="text-gradient block">Unknown no more.</span>
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed font-light text-balance max-w-lg mx-auto lg:mx-0">
                  The most advanced community-driven recovery platform in Rwanda.
                  Smart matching, instant alerts, and verified finders.
                </p>

                {/* Enhanced Search Pill - Left Aligned on Desktop */}
                <div className="w-full max-w-md mx-auto lg:mx-0 relative group pt-2">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="glass p-1.5 rounded-full flex items-center shadow-xl shadow-primary/5 ring-1 ring-black/5 relative bg-white/80 focus-within:bg-white focus-within:ring-primary/30 transition-all">
                    <div className="pl-4 text-muted-foreground group-focus-within:text-primary transition-colors">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search items, IDs..."
                      className="flex-1 bg-transparent border-none h-10 px-3 focus:ring-0 text-base placeholder:text-muted-foreground/60 font-medium text-foreground outline-none w-full min-w-0"
                    />
                    <Link href="/search">
                      <Button size="default" className="rounded-full px-5 h-10 text-sm font-bold shadow-lg shadow-primary/10 shrink-0 hover:scale-105 transition-all">
                        Find Item
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Typewriter Trust Badges with Tooltips */}
                <TooltipProvider delayDuration={0}>
                  <div className="pt-2 flex items-center justify-center lg:justify-start gap-5 text-xs font-medium text-muted-foreground/80">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 cursor-help hover:text-emerald-600 transition-colors">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span>Verified Finders</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-white/90 backdrop-blur border-emerald-100 text-emerald-900 font-medium">
                        <p>We verify identities via NIDA to ensure safety.</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 cursor-help hover:text-amber-600 transition-colors">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span>Instant Recovery</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-white/90 backdrop-blur border-amber-100 text-amber-900 font-medium">
                        <p>Our smart matching engine alerts you in seconds.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </motion.div>

              {/* Right Image - 3D Asset */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative hidden lg:block"
              >
                <div className="relative z-10 animate-float-slow">
                  <img
                    src="/assets/hero-rwanda-isolated.png"
                    alt="Digital Map of Rwanda"
                    className="w-full max-w-[550px] mx-auto drop-shadow-2xl mix-blend-multiply contrast-125"
                  />
                </div>
                {/* Decorative Glows - Adjusted for blue theme */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-400/20 blur-[80px] rounded-full -z-10" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Action Cards Section - Overlapping or distinct */}
        <section className="py-20 bg-white relative z-20 -mt-10 lg:-mt-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Link href="/report-lost">
                <div className="group relative bg-white p-8 rounded-[2rem] border border-border/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-primary/20 hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer h-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/50 rounded-bl-[4rem] group-hover:scale-150 transition-transform duration-500 ease-out z-0" />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-6">
                      <img src="/assets/lost-3d.png" alt="Lost Item" className="w-20 h-20 object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-3xl font-heading font-bold text-foreground mb-2">I Lost It</h3>
                    <p className="text-lg text-muted-foreground mb-8">Report a missing item immediately to alert our community network.</p>

                    <div className="mt-auto flex items-center text-orange-600 font-bold group-hover:translate-x-2 transition-transform">
                      Start Report <ArrowRight className="ml-2 w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/report-found">
                <div className="group relative bg-white p-8 rounded-[2rem] border border-border/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-primary/20 hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer h-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-bl-[4rem] group-hover:scale-150 transition-transform duration-500 ease-out z-0" />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-6">
                      <img src="/assets/found-3d.png" alt="Found Item" className="w-20 h-20 object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-3xl font-heading font-bold text-foreground mb-2">I Found It</h3>
                    <p className="text-lg text-muted-foreground mb-8">Help return a found item to its rightful owner securely.</p>

                    <div className="mt-auto flex items-center text-emerald-600 font-bold group-hover:translate-x-2 transition-transform">
                      Start Report <ArrowRight className="ml-2 w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Recent Items Preview */}
        <section className="py-24 bg-muted/30 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">Recently Found</h2>
                <p className="text-muted-foreground mt-2 text-lg">New items reported in the last 24 hours</p>
              </div>
              <Link href="/search">
                <Button variant="ghost" className="hidden sm:flex group text-primary font-bold hover:bg-primary/10">
                  View All Items
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer">
                  <div className="aspect-[4/3] bg-muted w-full relative overflow-hidden">
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[10px] uppercase font-bold px-2 py-1 rounded-md shadow-sm text-emerald-700 tracking-wide z-10">
                      Found
                    </div>
                    <div className="w-full h-full flex items-center justify-center bg-secondary/50 text-muted-foreground group-hover:scale-105 transition-transform duration-500">
                      <Wallet className="w-10 h-10 opacity-20" />
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-heading font-semibold text-lg leading-tight group-hover:text-primary transition-colors">National ID Card</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-primary/60" />
                      Kigali, Downtown
                    </div>
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground/60">2 hours ago</span>
                    </div>
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

      <footer className="border-t py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30">S</div>
                <span className="font-heading font-bold text-xl tracking-tight">SafiLocate</span>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-sm">
                We are building the trust layer for lost and found items. Join thousands of users making recovery simple and secure.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="/search" className="hover:text-primary transition-colors">Search Inventory</Link></li>
                <li><Link href="/report-lost" className="hover:text-primary transition-colors">Report Lost</Link></li>
                <li><Link href="/report-found" className="hover:text-primary transition-colors">Report Found</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="/faq" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="/safety" className="hover:text-primary transition-colors">Safety Guidelines</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-6">Contact</h4>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span>+250 788 000 000</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} SafiLocate Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground">Privacy</a>
              <a href="#" className="hover:text-foreground">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
