import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

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
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-spotify">Upgrade to Pro</h1>
        <p className="text-lg text-spotify-text/80 mt-2">Choose the plan that's right for you.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col ${plan.isPopular ? 'border-spotify' : ''}`}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription className="text-4xl font-bold text-spotify-text">{plan.price}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-spotify" />
                    <span className="text-spotify-text/90">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className={`w-full ${plan.isPopular ? 'spotify-button' : 'bg-spotify/20 hover:bg-spotify/30'}`}>
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}