import { Link } from "wouter";

export function Footer() {
    return (
        <footer className="border-t py-20 bg-card">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30">S</div>
                            <span className="font-heading font-bold text-xl tracking-tight">SafiLocate</span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed max-w-sm">
                            The trusted platform for lost and found recovery. Join our community to make recovery simple, fast, and secure.
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
                                <span>Contact Support:</span>
                                <a href="mailto:support@safilocate.rw" className="text-primary hover:underline">support@safilocate.rw</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-20 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} SafiLocate Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</Link>
                        <Link href="/cookies" className="hover:text-foreground cursor-pointer transition-colors">Cookie Policy</Link>
                        <Link href="/terms" className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
