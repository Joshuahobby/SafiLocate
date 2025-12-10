import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, MapPin, ShieldCheck, ArrowRight, Wallet, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
              S
            </div>
            <span className="font-heading font-bold text-xl text-primary">SafiLocate</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <Link href="/search" className="text-sm font-medium hover:text-primary transition-colors">Search</Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">How it Works</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/search">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Search className="w-4 h-4 mr-2" />
                Search Items
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                  The #1 Lost & Found Platform in Rwanda
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
                  Lost something? <br/>
                  <span className="text-primary">We help you find it.</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  SafiLocate connects people who lost items with trusted finders. 
                  Simple, secure, and built for everyone.
                </p>
              </motion.div>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link href="/report-lost">
                  <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 shadow-lg shadow-primary/20">
                    I Lost Something
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/report-found">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 bg-background/50 backdrop-blur-sm">
                    I Found Something
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Wallet className="w-10 h-10 text-primary" />}
                title="Report Lost Items"
                description="Create a listing for your lost ID, phone, or wallet. Add details and a reward to increase chances of recovery."
              />
              <FeatureCard 
                icon={<ShieldCheck className="w-10 h-10 text-primary" />}
                title="Trusted Finders"
                description="Our community of verified finders and partner institutions ensure your items are safe until returned."
              />
              <FeatureCard 
                icon={<MapPin className="w-10 h-10 text-primary" />}
                title="Smart Matching"
                description="Our intelligent system matches lost reports with found items automatically based on location and details."
              />
            </div>
          </div>
        </section>

        {/* Recent Items Preview (Mock) */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Recently Found</h2>
                <p className="text-muted-foreground mt-2">Items reported in the last 24 hours</p>
              </div>
              <Link href="/search">
                <Button variant="ghost" className="hidden sm:flex group">
                  View All Items 
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="group relative rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden">
                  <div className="aspect-[4/3] bg-muted w-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-white font-medium text-sm">View Details</span>
                    </div>
                    {/* Placeholder for item image */}
                    <div className="w-full h-full flex items-center justify-center bg-secondary/30 text-muted-foreground">
                      <Wallet className="w-12 h-12 opacity-20" />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors border-transparent bg-green-100 text-green-700 mb-2">
                      Found
                    </div>
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">National ID Card</h3>
                    <p className="text-sm text-muted-foreground mb-3 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      Kigali, Nyarugenge
                    </p>
                    <div className="text-xs text-muted-foreground pt-3 border-t flex justify-between">
                      <span>2 hours ago</span>
                      <span>Ref: #102{i}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center sm:hidden">
              <Link href="/search">
                <Button variant="outline" className="w-full">View All Items</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">S</div>
                <span className="font-heading font-bold text-xl">SafiLocate</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Making it easy to find what matters. <br/>
                Built with ❤️ in Rwanda.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/search" className="hover:text-primary">Search Items</Link></li>
                <li><Link href="/report-lost" className="hover:text-primary">Report Lost</Link></li>
                <li><Link href="/report-found" className="hover:text-primary">Report Found</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/faq" className="hover:text-primary">Help Center</Link></li>
                <li><Link href="/safety" className="hover:text-primary">Safety Tips</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+250 788 000 000</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} SafiLocate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 p-3 bg-primary/10 w-fit rounded-lg">
        {icon}
      </div>
      <h3 className="font-heading font-semibold text-xl mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
