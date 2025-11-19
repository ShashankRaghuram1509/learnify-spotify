import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Play, CheckCircle2, Video, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface CourseData {
  id: string;
  title: string;
  description: string;
  video_url: string | null;
  is_premium: boolean;
  price: number;
}

interface EnrollmentData {
  id: string;
  progress: number;
  completed_at: string | null;
}

export default function CourseViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    if (user && id) {
      fetchCourseContent();
    }
  }, [user, id]);

  const fetchCourseContent = async () => {
    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch enrollment
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("*")
        .eq("student_id", user?.id)
        .eq("course_id", id)
        .single();

      if (enrollmentError) {
        toast.error("You are not enrolled in this course");
        navigate("/dashboard/student/my-courses");
        return;
      }
      setEnrollment(enrollmentData);

      // Check payment for premium courses
      if (courseData.is_premium && courseData.price > 0) {
        const { data: paymentData } = await supabase
          .from("payments")
          .select("id")
          .eq("user_id", user?.id)
          .eq("course_id", id)
          .eq("status", "completed")
          .maybeSingle();

        // Also check subscription
        const { data: profileData } = await supabase
          .from("profiles")
          .select("subscription_tier, subscription_expires_at")
          .eq("id", user?.id)
          .single();

        const hasSubscription = profileData?.subscription_tier && 
          ['Lite', 'Premium', 'Premium Pro'].includes(profileData.subscription_tier) &&
          (!profileData.subscription_expires_at || new Date(profileData.subscription_expires_at) > new Date());

        const accessGranted = !!(paymentData || hasSubscription);

        setHasPaid(accessGranted);
      } else {
        setHasPaid(true); // Free course
      }
    } catch (error: any) {
      console.error("Error fetching course:", error);
      toast.error("Failed to load course content");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!course) return;

    const confirmed = window.confirm(
      `This is a premium course (₹${course.price}). Would you like to:\n\n` +
      `1. Pay ₹${course.price} for this course only (Click OK)\n` +
      `2. Get a subscription for all premium courses (Click Cancel)`
    );

    if (!confirmed) {
      navigate('/dashboard/student/upgrade');
      return;
    }

    // Implement payment flow similar to CourseDetail.tsx
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to continue");
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway");
        return;
      }

      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        'razorpay-create-order',
        {
          body: { 
            amount: course.price, 
            currency: 'INR', 
            planName: `Course: ${course.title}`,
            courseId: course.id 
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (orderError || !orderData) {
        toast.error("Failed to create payment order");
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Course Purchase',
        description: course.title,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // Get fresh session token for payment verification
            const { data: { session: verifySession } } = await supabase.auth.getSession();
            if (!verifySession) {
              toast.error("Session expired. Please login again.");
              return;
            }

            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              'razorpay-verify-payment',
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  amount: orderData.amount, // Send paise amount as returned by create-order
                  course_id: course.id,
                },
                headers: {
                  Authorization: `Bearer ${verifySession.access_token}`,
                },
              }
            );

            if (verifyError || !verifyData?.success) {
              throw new Error('Payment verification failed');
            }

            setHasPaid(true);
            toast.success("Payment successful! You can now access the course.");
          } catch (error) {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user?.user_metadata?.full_name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#1DB954',
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error("Failed to process payment");
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
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

  const getYouTubeEmbedUrl = (url: string | null) => {
    if (!url) return null;
    
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    
    return url;
  };

  if (loading) {
    return <div className="p-6">Loading course content...</div>;
  }

  if (!course) {
    return <div className="p-6">Course not found</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate("/dashboard/student/my-courses")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to My Courses
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{course.title}</CardTitle>
          {enrollment && (
            <div className="flex items-center gap-4 mt-4">
              <Progress value={enrollment.progress || 0} className="flex-1" />
              <span className="text-sm font-medium">{enrollment.progress || 0}%</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {!hasPaid && course.is_premium && course.price > 0 ? (
            <div className="py-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold mb-2">Premium Course Content</h3>
                <p className="text-muted-foreground">
                  Choose how you'd like to access this course
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Individual Course Purchase */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-xl">Buy This Course</CardTitle>
                    <div className="text-3xl font-bold text-primary mt-2">
                      ₹{course.price}
                    </div>
                    <p className="text-sm text-muted-foreground">One-time payment</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Lifetime access to this course</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>All course materials and videos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Certificate upon completion</span>
                      </li>
                    </ul>
                    <Button onClick={handlePayment} className="w-full" size="lg">
                      Purchase Course
                    </Button>
                  </CardContent>
                </Card>

                {/* Subscription Options */}
                <Card className="border-2 border-primary bg-primary/5">
                  <CardHeader>
                    <div className="inline-block px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded mb-2">
                      BEST VALUE
                    </div>
                    <CardTitle className="text-xl">Get Subscription</CardTitle>
                    <div className="text-3xl font-bold text-primary mt-2">
                      From ₹999
                    </div>
                    <p className="text-sm text-muted-foreground">Access all premium courses</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Access to ALL premium courses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>New courses added regularly</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Priority support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Certificates for all courses</span>
                      </li>
                    </ul>
                    <Button 
                      onClick={() => navigate('/dashboard/student/upgrade')} 
                      className="w-full" 
                      size="lg"
                      variant="default"
                    >
                      View Subscription Plans
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-6 text-sm text-muted-foreground">
                <p>Not sure? Subscriptions give you access to all premium courses for less than buying individual courses.</p>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="video" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Video Lessons
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Course Notes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="video" className="mt-0">
                {course.video_url ? (
                  <div className="space-y-6">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <iframe
                        src={getYouTubeEmbedUrl(course.video_url) || ''}
                        title={course.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>About this Lesson</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          {course.description || "Watch the video to learn more about this topic."}
                        </p>
                      </CardContent>
                    </Card>

                    {enrollment?.completed_at && (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>You completed this course on {new Date(enrollment.completed_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No video content available yet</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="notes" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Notes & Materials</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Course Overview */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Course Overview</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {course.description || "Course notes and materials will be available here."}
                      </p>
                    </div>

                    {/* Key Learning Points */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-3">Key Learning Points</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">Comprehensive understanding of core concepts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">Hands-on practical examples and exercises</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">Real-world application techniques</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">Best practices and industry standards</span>
                        </li>
                      </ul>
                    </div>

                    {/* Additional Resources */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-3">Additional Resources</h3>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">
                          📚 Downloadable resources, code samples, and reference materials will be available here.
                        </p>
                      </div>
                    </div>

                    {/* Study Tips */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-3">Study Tips</h3>
                      <div className="space-y-3">
                        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <p className="text-sm text-blue-900 dark:text-blue-100">
                            💡 <strong>Tip:</strong> Take notes while watching the video and practice the concepts immediately.
                          </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <p className="text-sm text-green-900 dark:text-green-100">
                            ✅ <strong>Recommended:</strong> Complete all exercises before moving to the next lesson.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
