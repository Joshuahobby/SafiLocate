import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertClaimSchema, type InsertClaim } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Loader2, Info, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface ClaimDialogProps {
    itemId: string;
    itemType: "found" | "lost";
    trigger?: React.ReactNode;
}

export function ClaimDialog({ itemId, itemType, trigger }: ClaimDialogProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [open, setOpen] = useState(false);

    const formSchema = insertClaimSchema.extend({
        description: z.string().min(50, "Description must be at least 50 characters to provide sufficient proof."),
        claimantEmail: z.string().email().optional().or(z.literal('')),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            itemId,
            itemType,
            claimantName: user?.username || "",
            claimantPhone: user?.phone || "",
            claimantEmail: user?.email || "",
            description: "",
            evidencePhotos: []
        },
    });

    // Update form values when user data becomes available
    useEffect(() => {
        if (user) {
            if (user.username) form.setValue("claimantName", user.username);
            if (user.phone) form.setValue("claimantPhone", user.phone);
            if (user.email) form.setValue("claimantEmail", user.email || "");
        }
    }, [user, form]);

    const mutation = useMutation({
        mutationFn: async (data: z.infer<typeof formSchema>) => {
            const apiData: InsertClaim = {
                ...data,
                status: "pending"
            } as InsertClaim;
            const res = await apiRequest("POST", "/api/claims", apiData);
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Claim Submitted",
                description: "Your claim has been submitted for verification.",
            });
            setOpen(false);
            form.reset();
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    function onSubmit(data: z.infer<typeof formSchema>) {
        mutation.mutate(data);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>Claim this Item</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-3xl p-0 overflow-hidden bg-card/95 backdrop-blur-xl">
                <div className="bg-primary/5 p-6 border-b border-primary/10">
                    <DialogHeader>
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <DialogTitle className="text-2xl font-bold font-heading">Submit a Security Claim</DialogTitle>
                        <DialogDescription className="text-muted-foreground pt-1">
                            Your details are safe. Provide clear proof to help us verify your ownership.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="claimantName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" className="h-11 rounded-xl bg-background/50" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="claimantPhone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="078 000 0000" className="h-11 rounded-xl bg-background/50" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="claimantEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="your@email.com" className="h-11 rounded-xl bg-background/50" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between mb-1">
                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Detailed Proof</FormLabel>
                                            <span className={cn(
                                                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                                (field.value?.length || 0) < 50 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                                            )}>
                                                {field.value?.length || 0} / 50 chars min
                                            </span>
                                        </div>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe unique features (scratches, case, wallpapers, internal details) that only the owner would know..."
                                                className="resize-none min-h-[120px] rounded-2xl bg-background/50 p-4 leading-relaxed"
                                                {...field}
                                            />
                                        </FormControl>
                                        <p className="text-[10px] text-muted-foreground mt-2 flex items-start gap-1.5">
                                            <Info className="w-3 h-3 mt-0.5 shrink-0" />
                                            Providing clear, specific details increases your verification speed by up to 80%.
                                        </p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                                >
                                    {mutation.isPending ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : (
                                        "Securely Submit Claim"
                                    )}
                                </Button>
                                <p className="text-center text-[10px] text-muted-foreground mt-4 uppercase tracking-widest font-bold opacity-50">
                                    Encrypted Verification Process
                                </p>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
