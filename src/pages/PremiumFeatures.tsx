import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Video, MessageSquare, Bot, Crown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const premiumFeatures = [
  {
    title: "1-on-1 Video Calling",
    description: "Schedule personalized video sessions with your instructors for in-depth learning and guidance.",
    icon: Video,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Direct Messaging",
    description: "Chat directly with teachers and get instant answers to your questions anytime.",
    icon: MessageSquare,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "AI Learning Assistant",
    description: "Get 24/7 AI-powered help for studying, course questions, and learning recommendations.",
    icon: Bot,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
];

export default function PremiumFeatures() {
  const { user, userRole } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("subscription_tier")
          .eq("id", user.id)
          .single();
        if (error) throw error;
        setIsPro(data?.subscription_tier !== 'free' && data?.subscription_tier !== null);
      } catch (error) {
        // Silent fail - isPro remains false
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">Loading...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || (!isPro && userRole !== 'admin')) {
    return <Navigate to="/dashboard/student/upgrade" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Crown className="h-8 w-8 text-yellow-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                Premium Features
              </h1>
            </div>
            <p className="mt-2 text-lg text-muted-foreground">
              Unlock exclusive features to enhance your learning experience
            </p>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {premiumFeatures.map((feature) => (
              <Card key={feature.title} className="border-2 hover:border-yellow-500/50 transition-all">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-full ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Crown className="h-6 w-6 text-yellow-500" />
                  You're a Premium Member!
                </CardTitle>
                <CardDescription>
                  Enjoy unlimited access to all these premium features as part of your subscription.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}