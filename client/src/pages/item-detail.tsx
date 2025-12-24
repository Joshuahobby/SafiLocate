import { useState, useEffect } from "react";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  MapPin,
  Calendar,
  Share2,
  Flag,
  ShieldCheck,
  ChevronLeft,
  Clock,
  User,
  Shield,
  ExternalLink,
  Zap,
  Fingerprint,
  Phone,
  ArrowRight,
  Info,
  CheckCircle2,
  Lock,
  Smartphone,
  AlertCircle,
  Copy,
  Check
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ClaimDialog } from "@/components/claim-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ItemDetailData {
  id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  type: 'found' | 'lost';
  image?: string;
  description: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  identifier?: string;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

export default function ItemDetail() {
  const [, params] = useRoute("/item/:id");
  const id = params?.id;
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: item, isLoading } = useQuery<ItemDetailData>({
    queryKey: [`/api/items/${id}`],
    enabled: !!id
  });

  const isContactVisible = item?.contactPhone && !item?.contactPhone.includes("*");

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Encrypted Link Copied",
      description: "Secure sharing token generated and copied.",
    });
  };

  const copyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Ref ID Copied",
      description: "Asset reference ID copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafc] font-sans selection:bg-primary/10 transition-colors duration-500 pb-32 overflow-x-hidden">
      <Navbar />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#fafafc] flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="w-12 h-12 border-2 border-primary/5 border-t-primary rounded-full shadow-sm"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase animate-pulse">Establishing Secure Stream</p>
            </div>
          </motion.div>
        ) : !item ? (
          <motion.div
            key="not-found"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#fafafc] flex flex-col pt-32"
          >
            <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4">
              <div className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-200 ring-1 ring-slate-100">
                <Info className="w-10 h-10" />
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-black text-slate-900 font-heading tracking-tight uppercase">Asset Registry Empty</h1>
                <p className="text-slate-500 text-sm font-medium">The requested record does not exist or has been removed.</p>
              </div>
              <Link href="/search">
                <Button className="rounded-xl px-8 h-12 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-lg transition-all active:scale-95 group">
                  <ChevronLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                  Return to Catalog
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.main
            key="content"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="container mx-auto px-4 lg:px-8 pt-24"
          >
            <div className="max-w-7xl mx-auto">

              <div className="space-y-12">

                {/* Navigation & Actions Sub-Header - COMPACT */}
                <motion.div variants={fadeInUp} className="flex items-center justify-between pb-6 border-b border-slate-200/50">
                  <Link href="/search">
                    <button className="flex items-center gap-3 group text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 transition-all">
                      <div className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center group-hover:border-slate-900 transition-colors bg-white shadow-sm ring-2 ring-transparent group-hover:ring-slate-50">
                        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                      </div>
                      System Search
                    </button>
                  </Link>

                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-white hover:shadow-lg transition-all"
                            onClick={handleShare}
                          >
                            <Share2 className="w-4 h-4 text-slate-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-900 font-black text-[9px] tracking-widest uppercase py-2 px-4 rounded-lg mb-2">Secure Share</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-white hover:text-rose-500 hover:shadow-lg transition-all"
                          >
                            <Flag className="w-4 h-4 text-slate-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-rose-600 font-black text-[9px] tracking-widest uppercase py-2 px-4 rounded-lg mb-2">Report Abuse</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                  {/* Main Content Area (8/12) */}
                  <div className="lg:col-span-8 space-y-10">

                    {/* Visual Identity Section - COMPACT */}
                    <motion.div variants={fadeInUp} className="space-y-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge
                          className={cn(
                            "px-4 py-1.5 font-black text-[10px] tracking-[0.2em] rounded-lg border-none shadow-md uppercase",
                            item.type === 'found' ? "bg-emerald-500 text-white" : "bg-primary text-white"
                          )}
                        >
                          {item.type === 'found' ? 'Verified Found' : 'Missing Asset'}
                        </Badge>
                        <div className="px-4 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Registry Verified</span>
                        </div>
                      </div>

                      <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight font-heading">
                        {item.title}
                      </h1>

                      {/* INLINE METADATA ROW */}
                      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
                        <div className="flex items-center gap-2 group/meta">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-primary/60 border border-slate-100 shadow-inner group-hover/meta:text-primary transition-colors">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sector</p>
                            <p className="text-sm font-bold text-slate-800 leading-none">{item.location}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 group/meta">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-primary/60 border border-slate-100 shadow-inner group-hover/meta:text-primary transition-colors">
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Incident Date</p>
                            <p className="text-sm font-bold text-slate-800 leading-none">
                              {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        {item.identifier && (
                          <div className="flex items-center gap-2 group/meta">
                            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-primary/60 border border-slate-100 shadow-inner group-hover/meta:text-primary transition-colors">
                              <Smartphone className="w-3.5 h-3.5" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Internal ID</p>
                              <p className="text-sm font-bold text-slate-800 leading-none">
                                {item.identifier.includes("*") ? (
                                  <span className="flex items-center gap-1 opacity-50">
                                    <Lock className="w-3 h-3" />
                                    ENC-LOCKED
                                  </span>
                                ) : item.identifier}
                              </p>
                            </div>
                          </div>
                        )}

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                onClick={() => copyRef(item.id)}
                                className="flex items-center gap-2 group/meta cursor-pointer"
                              >
                                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-primary/60 border border-slate-100 shadow-inner group-hover/meta:text-primary transition-colors">
                                  <Fingerprint className="w-3.5 h-3.5" />
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    File Ref
                                    {copied ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                                  </p>
                                  <p className="text-sm font-black text-slate-800 leading-none uppercase tracking-tight">#{item.id.slice(0, 8)}</p>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 font-black text-[9px] tracking-widest uppercase py-2 px-4 rounded-lg mb-2">Click to Copy Ref ID</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </motion.div>

                    {/* Fixed Stage Visual Container - REDUCED RADIUS */}
                    <motion.div variants={fadeInUp} className="group relative">
                      <div className="aspect-[16/9] lg:aspect-[21/9] bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex items-center justify-center ring-1 ring-slate-100 group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all duration-700">
                        {item.image ? (
                          <motion.img
                            initial={{ scale: 1.05, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-6 text-slate-200">
                            <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover:scale-105 transition-all duration-700 ring-8 ring-white">
                              <Shield className="w-10 h-10" />
                            </div>
                            <p className="text-[9px] font-black tracking-[0.5em] uppercase opacity-40">Identity Shield Active</p>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Detailed Analysis Section */}
                    <motion.div variants={fadeInUp} className="space-y-6 pt-2">
                      <div className="flex items-center gap-6">
                        <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] bg-primary/5 px-6 py-2 rounded-lg border border-primary/10">Case Documentation</h2>
                        <Separator className="flex-1 opacity-10" />
                      </div>
                      <div className="max-w-none">
                        <p className="text-slate-600 text-xl lg:text-2xl leading-relaxed font-serif italic selection:bg-primary/20 transition-all opacity-90">
                          "{item.description}"
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-start gap-5 ring-1 ring-slate-50 group/analysis">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100 shadow-inner group-hover/analysis:scale-110 transition-transform">
                            <Zap className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-black text-slate-900 tracking-tight">Rapid Verification</p>
                            <p className="text-[11px] text-slate-400 font-bold leading-relaxed">Claims are prioritized and processed within 24 standard business hours.</p>
                          </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-start gap-5 ring-1 ring-slate-50 group/analysis">
                          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10 shadow-inner group-hover/analysis:scale-110 transition-transform">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-black text-slate-900 tracking-tight">Verified Archive</p>
                            <p className="text-[11px] text-slate-400 font-bold leading-relaxed">This asset's origin has been cross-referenced with local reporting agencies.</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* High-Precision Sidebar (4/12) - REDUCED RADIUS & MEDIUM BUTTONS */}
                  <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-8">

                    <motion.div variants={fadeInUp}>
                      <Card className="border-none shadow-[0_40px_80px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.02)] rounded-[2rem] overflow-hidden bg-white ring-1 ring-slate-100 relative group/card">
                        <div className="absolute top-0 inset-x-0 h-1.5 bg-primary overflow-hidden">
                          <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "200%" }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                            className="w-1/2 h-full bg-white/40 skew-x-[30deg]"
                          />
                        </div>

                        <CardContent className="p-8 lg:p-10 space-y-8">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-xl font-black font-heading tracking-tight uppercase tracking-wide">Protocol hub</h3>
                              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
                                <Lock className="w-4 h-4 text-slate-400" />
                              </div>
                            </div>
                            <p className="text-[13px] text-slate-500 leading-relaxed font-bold opacity-80">
                              Our SafiTrust™ engine monitors this secure asset stream to prevent unauthorized access.
                            </p>
                          </div>

                          <div className="space-y-6">
                            {!isContactVisible ? (
                              <div className="p-5 rounded-[1.5rem] bg-[#fafafc] border border-slate-100 flex gap-4 items-start shadow-inner ring-1 ring-slate-50">
                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100 transition-transform hover:rotate-12">
                                  <AlertCircle className="w-5 h-5 text-orange-500" />
                                </div>
                                <div className="space-y-0.5 py-1">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Asset Status</p>
                                  <p className="text-[11px] text-slate-900 font-black leading-relaxed">
                                    Data is currently encrypted.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="p-5 rounded-[1.5rem] bg-emerald-500/5 border border-emerald-500/10 flex gap-4 items-start shadow-inner ring-1 ring-emerald-500/5">
                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-500 transition-transform rotate-12">
                                  <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5 py-1">
                                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Security Cleared</p>
                                  <p className="text-[11px] text-emerald-950 font-black leading-relaxed">
                                    Verification Successful.
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="space-y-3">
                              {!isContactVisible ? (
                                <ClaimDialog
                                  itemId={item.id}
                                  itemType={item.type}
                                  trigger={
                                    <Button
                                      className="w-full h-14 md:h-16 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_15px_30px_rgba(var(--primary),0.2)] hover:shadow-[0_20px_40px_rgba(var(--primary),0.3)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-500 bg-primary group relative overflow-hidden"
                                    >
                                      <motion.div
                                        className="absolute inset-x-0 inset-y-[-100%] bg-white/10 skew-y-[45deg]"
                                        animate={{ translateY: ["-100%", "200%"] }}
                                        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                      />
                                      <span className="relative flex items-center gap-2">
                                        Initiate Verification
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                      </span>
                                    </Button>
                                  }
                                />
                              ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                  <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm space-y-6 ring-1 ring-slate-100/50">
                                    <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary shadow-inner ring-1 ring-primary/10">
                                        <User className="w-6 h-6" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Registered Party</p>
                                        <p className="text-xl font-black text-slate-900 truncate tracking-tight uppercase tracking-wide">{item.contactName}</p>
                                      </div>
                                    </div>

                                    <Separator className="bg-slate-100/50" />

                                    <div className="flex flex-col gap-4">
                                      <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/10 transition-transform hover:scale-105">
                                          <Smartphone className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Direct Line</p>
                                          <p className="text-lg font-black text-slate-900 tracking-tight">{item.contactPhone}</p>
                                        </div>
                                      </div>
                                      <Button className="w-full h-12 rounded-xl font-black text-[11px] tracking-[0.2em] uppercase bg-black hover:bg-slate-800 text-white shadow-lg transition-all hover:scale-105 active:scale-95 ring-4 ring-slate-100">
                                        Call Now
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 ring-1 ring-emerald-500/5 shadow-inner">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">End-to-End Encrypted</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Return Safety Guide - COMPACT */}
                    <motion.div variants={fadeInUp} className="p-8 rounded-[2rem] bg-slate-900 text-white space-y-8 shadow-[0_30px_60px_rgba(0,0,0,0.1)] relative overflow-hidden group/safety ring-1 ring-white/5">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[60px] group-hover/safety:bg-primary/20 transition-all duration-1000 opacity-50" />

                      <div className="flex items-start gap-4 relative">
                        <div className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-xl flex items-center justify-center text-primary shrink-0 border border-white/10 shadow-lg group-hover/safety:scale-110 transition-transform">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-lg tracking-tight uppercase tracking-wide">Safety Standard</h4>
                          <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em] leading-none">Security handoff Protocol</p>
                        </div>
                      </div>

                      <p className="text-[13px] text-slate-400 leading-relaxed font-bold opacity-80">
                        Verify ownership before exchange. Meet at verified SafiTransfer hubs or high-security government zones.
                      </p>

                      <Link href="/about">
                        <button className="flex items-center gap-3 group text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-white transition-all">
                          PROCEED TO SECURE GUIDE
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                          <div className="h-[1.5px] w-0 group-hover:w-8 bg-white transition-all duration-500 ml-2 rounded-full" />
                        </button>
                      </Link>
                    </motion.div>

                  </aside>

                </div>
              </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
