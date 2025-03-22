
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, Lock, ArrowRight } from "lucide-react";
import { apiService } from "@/services/apiService";

const formSchema = z.object({
  cardHolder: z.string().min(3, {
    message: "Cardholder name must be at least 3 characters.",
  }),
  cardNumber: z.string().regex(/^[0-9]{16}$/, {
    message: "Card number must be 16 digits.",
  }),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([2-9][0-9])$/, {
    message: "Expiry date must be in MM/YY format.",
  }),
  cvv: z.string().regex(/^[0-9]{3,4}$/, {
    message: "CVV must be 3 or 4 digits.",
  }),
});

const PaymentForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardHolder: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      // This would call our Spring Boot backend in a real app
      await apiService.subscribe(values);
      
      toast.success("Payment processed successfully!");
      form.reset();
    } catch (error) {
      toast.error("Payment failed. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-spotify/20 bg-spotify-gray/20">
      <CardContent className="pt-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Payment Details</h3>
          <div className="flex items-center text-sm text-green-400">
            <Lock className="mr-1 h-4 w-4" />
            Secure Payment
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="cardHolder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cardholder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="1234 5678 9012 3456" 
                        {...field} 
                        onChange={(e) => {
                          // Format the card number with spaces for readability
                          const value = e.target.value.replace(/\s/g, "");
                          if (!/^\d*$/.test(value)) return;
                          field.onChange(value);
                        }}
                      />
                      <CreditCard className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="MM/YY"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d/]/g, "");
                          if (value.length === 2 && field.value.length === 1 && !value.includes("/")) {
                            field.onChange(value + "/");
                          } else {
                            field.onChange(value);
                          }
                        }}
                        maxLength={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="123" 
                        type="password"
                        maxLength={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-spotify hover:bg-spotify-light flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Subscribe Now"}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
