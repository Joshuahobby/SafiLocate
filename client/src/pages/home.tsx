import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, MapPin, ShieldCheck, ArrowRight, Wallet, Phone, Menu } from "lucide-react";
import { motion } from "framer-motion";
import heroBg from "@assets/generated_images/abstract_3d_glassmorphic_mesh_gradient_background.png";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Navigation - Glassmorphic */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-200">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm" />
        <div className="container mx-auto px-4 h-16 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
              S
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-foreground">SafiLocate</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <Link href="/search" className="text-sm font-medium hover:text-primary transition-colors">Search</Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">How it Works</Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <Link href="/login">
                <Button size="sm" className="rounded-full px-6 font-semibold">Sign In</Button>
              </Link>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 mt-8">
                    <Link href="/">
                      <Button variant="ghost" className="w-full justify-start text-lg">Home</Button>
                    </Link>
                    <Link href="/search">
                      <Button variant="ghost" className="w-full justify-start text-lg">Search Items</Button>
                    </Link>
                    <Link href="/report-lost">
                      <Button variant="ghost" className="w-full justify-start text-lg">Report Lost</Button>
                    </Link>
                    <Link href="/report-found">
                      <Button variant="ghost" className="w-full justify-start text-lg">Report Found</Button>
                    </Link>
                    <div className="h-px bg-border my-2" />
                    <Link href="/login">
                      <Button className="w-full">Sign In</Button>
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section - Immersive */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
             <img 
               src={heroBg} 
               alt="Background" 
               className="w-full h-full object-cover opacity-90"
             />
             <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-background" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="flex flex-col items-center"
              >
                <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50/50 backdrop-blur-md px-4 py-1.5 text-sm font-semibold text-blue-700 mb-8 shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                  Trusted by 10,000+ users in Rwanda
                </div>
                
                <h1 className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]">
                  Lost something? <br/>
                  <span className="text-gradient">We help you find it.</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  The smart, secure way to report lost items and connect with trusted finders in your community.
                </p>
              </motion.div>

              {/* Integrated Search Pill */}
              <motion.div 
                className="w-full max-w-2xl mx-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="glass p-2 rounded-full flex items-center shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-shadow">
                    <div className="pl-4 text-muted-foreground">
                        <Search className="w-5 h-5" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="What are you looking for? (e.g. ID, Wallet, Phone)" 
                        className="flex-1 bg-transparent border-none h-12 px-4 focus:ring-0 text-lg placeholder:text-muted-foreground/60 outline-none w-full min-w-0"
                    />
                    <Link href="/search">
                        <Button size="lg" className="rounded-full px-8 h-12 text-base font-semibold shadow-md shrink-0">
                            Search
                        </Button>
                    </Link>
                </div>
              </motion.div>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link href="/report-lost">
                  <Button variant="secondary" size="lg" className="h-14 px-8 text-base rounded-2xl bg-white/80 backdrop-blur hover:bg-white border shadow-sm w-full sm:w-auto">
                    <span className="mr-2">😞</span> I Lost Something
                  </Button>
                </Link>
                <Link href="/report-found">
                  <Button variant="secondary" size="lg" className="h-14 px-8 text-base rounded-2xl bg-white/80 backdrop-blur hover:bg-white border shadow-sm w-full sm:w-auto">
                    <span className="mr-2">🙌</span> I Found Something
                  </Button>
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
                Making it easy to find what matters. <br/>
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
