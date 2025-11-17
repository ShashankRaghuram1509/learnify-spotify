import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, CheckCircle2 } from "lucide-react";
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
          .eq("status", "success")
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
            <>
              {course.video_url ? (
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                  <iframe
                    src={getYouTubeEmbedUrl(course.video_url) || ''}
                    title={course.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-6">
                  <div className="text-center">
                    <Play className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No video content available yet</p>
                  </div>
                </div>
              )}

              {course.description && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">About this course</h3>
                  <p className="text-muted-foreground">{course.description}</p>
                </div>
              )}

              {enrollment?.completed_at && (
                <div className="mt-6 flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>You completed this course on {new Date(enrollment.completed_at).toLocaleDateString()}</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
