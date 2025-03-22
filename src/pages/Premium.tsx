
import React, { useState } from "react";
import { motion } from "framer-motion";
import { pageTransition, fadeIn, fadeInUp } from "@/utils/animations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentForm from "@/components/premium/PaymentForm";
import AIAssistant from "@/components/premium/AIAssistant";
import VideoCall from "@/components/premium/VideoCall";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Sparkles } from "lucide-react";

const Premium = () => {
  const [activeTab, setActiveTab] = useState("features");

  return (
    <motion.div
      className="min-h-screen bg-spotify-dark py-16"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <div className="container mx-auto px-4">
        <motion.div variants={fadeIn} className="text-center mb-12">
          <span className="text-spotify font-medium inline-flex items-center gap-2">
            <Sparkles size={18} />
            Unlock Full Potential
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
            Premium Experience
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Elevate your learning journey with advanced features designed to accelerate your progress and provide personalized support.
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="mb-8">
          <Card className="border-spotify/20 bg-spotify-gray/20 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl text-white">Premium Membership</CardTitle>
              <CardDescription className="text-lg text-gray-400">
                Choose a plan that works for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs 
                defaultValue="features" 
                className="w-full"
                onValueChange={(value) => setActiveTab(value)}
              >
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="plans">Plans</TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                </TabsList>
                
                <TabsContent value="features" className="mt-4">
                  <div className="grid md:grid-cols-2 gap-8">
                    <AIAssistant />
                    <VideoCall />
                  </div>
                  
                  <div className="mt-10 space-y-4">
                    <h3 className="text-xl font-semibold">All Premium Benefits</h3>
                    <ul className="grid md:grid-cols-2 gap-3">
                      {[
                        "24/7 AI Learning Assistant",
                        "1-on-1 Video Call Support",
                        "Unlimited Course Access",
                        "Downloadable Resources",
                        "Priority Support",
                        "Certificate of Completion",
                        "Access to Exclusive Workshops",
                        "Early Access to New Courses"
                      ].map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-spotify mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="plans" className="mt-4">
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      {
                        name: "Monthly",
                        price: "$19.99",
                        period: "per month",
                        features: ["AI Assistant (10 hrs/month)", "Video Calls (2 per month)", "All courses access"],
                        popular: false
                      },
                      {
                        name: "Quarterly",
                        price: "$49.99",
                        period: "per quarter",
                        features: ["AI Assistant (30 hrs/quarter)", "Video Calls (8 per quarter)", "All courses access", "Downloadable resources"],
                        popular: true
                      },
                      {
                        name: "Yearly",
                        price: "$149.99",
                        period: "per year",
                        features: ["Unlimited AI Assistant", "Video Calls (36 per year)", "All courses access", "Downloadable resources", "Priority support"],
                        popular: false
                      }
                    ].map((plan, index) => (
                      <Card key={index} className={`border-spotify/20 ${plan.popular ? 'bg-spotify/10 border-spotify/40 ring-1 ring-spotify/30' : 'bg-spotify-gray/30'}`}>
                        <CardHeader>
                          {plan.popular && (
                            <span className="px-3 py-1 bg-spotify text-xs font-medium rounded-full absolute -top-3 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                              Most Popular
                            </span>
                          )}
                          <CardTitle className="text-xl">{plan.name}</CardTitle>
                          <div className="mt-2">
                            <span className="text-3xl font-bold">{plan.price}</span>{" "}
                            <span className="text-gray-400 text-sm">{plan.period}</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex gap-2 items-center">
                                <CheckCircle className="h-4 w-4 text-spotify" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <button 
                            className="w-full mt-6 bg-spotify hover:bg-spotify-light text-white py-2 rounded-md transition-colors"
                            onClick={() => {
                              setActiveTab("payment");
                            }}
                          >
                            Choose Plan
                          </button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="payment" className="mt-4">
                  <PaymentForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Premium;
