import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertClaimSchema, type InsertClaim } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface ClaimDialogProps {
    itemId: string;
    itemType: "found" | "lost";
    trigger?: React.ReactNode;
}

export function ClaimDialog({ itemId, itemType, trigger }: ClaimDialogProps) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const formSchema = insertClaimSchema.extend({
        description: insertClaimSchema.shape.description.min(50, "Description must be at least 50 characters to provide sufficient proof."),
        claimantEmail: insertClaimSchema.shape.claimantEmail.optional().or(z.literal('')),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            itemId,
            itemType,
            claimantName: "",
            claimantPhone: "",
            claimantEmail: "",
            description: "",
            evidencePhotos: []
        },
    });

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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Claim Item</DialogTitle>
                    <DialogDescription>
                        Provide proof and contact details to claim this item.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="claimantName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
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
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+250 7..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="claimantEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="your@email.com" {...field} value={field.value || ''} />
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
                                    <FormLabel>Description / Proof</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe unique features or other proof..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Submit Claim
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
