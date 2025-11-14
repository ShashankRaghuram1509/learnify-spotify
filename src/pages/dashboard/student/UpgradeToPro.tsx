import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const plans = [
  {
    name: "Lite",
    price: "₹999",
    features: [
      "Access to videos for selected courses",
      "Access to articles for selected courses",
      "Access to notes for selected courses",
    ],
    cta: "Choose Lite",
  },
  {
    name: "Premium",
    price: "₹2999",
    features: [
      "All 'Lite' features",
      "One-on-one chatting with instructors",
      "Video call support for doubts",
      "AI bot access for instant help",
    ],
    cta: "Choose Premium",
    isPopular: true,
  },
  {
    name: "Premium Pro",
    price: "₹5999",
    features: [
      "All 'Premium' features",
      "Access to all courses on the platform",
      "Priority support",
    ],
    cta: "Choose Premium Pro",
  },
];

export default function UpgradeToProPage() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (plan: typeof plans[0]) => {
    try {
      setIsProcessing(true);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast({
          title: "Error",
          description: "Failed to load payment gateway",
          variant: "destructive",
        });
        return;
      }

      const amount = parseInt(plan.price.replace('₹', '').replace(',', ''));

      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        'razorpay-create-order',
        {
          body: { amount, currency: 'INR', planName: plan.name },
        }
      );

      if (orderError || !orderData) {
        throw new Error('Failed to create order');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LMS Platform',
        description: `${plan.name} Plan`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
              throw new Error('Not authenticated');
            }

            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              'razorpay-verify-payment',
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  amount: orderData.amount,
                  planName: plan.name,
                },
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                },
              }
            );

            if (verifyError || !verifyData?.success) {
              throw new Error('Payment verification failed');
            }

            toast({
              title: "Success!",
              description: `You've upgraded to ${plan.name}!`,
            });
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: "Error",
              description: "Payment verification failed",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: '#1DB954',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground">Upgrade to Pro</h1>
        <p className="text-lg text-muted-foreground mt-2">Choose the plan that's right for you.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col ${plan.isPopular ? 'border-primary' : ''}`}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription className="text-4xl font-bold text-foreground">{plan.price}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={plan.isPopular ? "default" : "outline"}
                onClick={() => handlePayment(plan)}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}