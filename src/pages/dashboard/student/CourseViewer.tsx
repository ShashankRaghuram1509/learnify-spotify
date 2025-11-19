import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Play, CheckCircle2, Video, FileText, Code2, Loader2 } from "lucide-react";
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

interface CourseNotes {
  overview: string;
  keyPoints: string[];
  codeExamples: Array<{
    title: string;
    description: string;
    code: string;
    language: string;
  }>;
  resources: string[];
  practiceExercises: string[];
}

export default function CourseViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const [notes, setNotes] = useState<CourseNotes | null>(null);
  const [loadingNotes, setLoadingNotes] = useState(false);

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

  const generateNotes = async () => {
    if (!course || loadingNotes) return;

    setLoadingNotes(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-course-notes', {
        body: {
          courseTitle: course.title,
          courseDescription: course.description
        }
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setNotes(data.notes);
      toast.success("Course notes generated successfully!");
    } catch (error) {
      console.error('Error generating notes:', error);
      toast.error("Failed to generate course notes. Please try again.");
    } finally {
      setLoadingNotes(false);
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
                    <div className="flex items-center justify-between">
                      <CardTitle>Course Notes & Materials</CardTitle>
                      <Button
                        onClick={generateNotes}
                        disabled={loadingNotes}
                        className="flex items-center gap-2"
                      >
                        {loadingNotes ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Code2 className="h-4 w-4" />
                            Generate AI Notes
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!notes ? (
                      <div className="text-center py-12">
                        <Code2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">AI-Powered Course Notes</h3>
                        <p className="text-muted-foreground mb-6">
                          Generate comprehensive notes, code examples, and practice exercises using AI
                        </p>
                        <Button onClick={generateNotes} disabled={loadingNotes}>
                          {loadingNotes ? "Generating..." : "Generate Notes Now"}
                        </Button>
                      </div>
                    ) : (
                      <>
                        {/* Course Overview */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Course Overview</h3>
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {notes.overview}
                          </p>
                        </div>

                        {/* Key Learning Points */}
                        <div className="border-t pt-6">
                          <h3 className="text-lg font-semibold mb-3">Key Learning Points</h3>
                          <ul className="space-y-2">
                            {notes.keyPoints.map((point, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-muted-foreground">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Code Examples */}
                        {notes.codeExamples && notes.codeExamples.length > 0 && (
                          <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                              <Code2 className="h-5 w-5" />
                              Code Examples
                            </h3>
                            <div className="space-y-4">
                              {notes.codeExamples.map((example, index) => (
                                <div key={index} className="bg-muted/50 rounded-lg overflow-hidden">
                                  <div className="px-4 py-3 border-b border-border">
                                    <h4 className="font-semibold">{example.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">{example.description}</p>
                                  </div>
                                  <div className="relative">
                                    <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                                      {example.language}
                                    </div>
                                    <pre className="p-4 overflow-x-auto">
                                      <code className="text-sm">{example.code}</code>
                                    </pre>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Practice Exercises */}
                        {notes.practiceExercises && notes.practiceExercises.length > 0 && (
                          <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-3">Practice Exercises</h3>
                            <div className="space-y-3">
                              {notes.practiceExercises.map((exercise, index) => (
                                <div key={index} className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                  <p className="text-sm text-blue-900 dark:text-blue-100">
                                    <strong>Exercise {index + 1}:</strong> {exercise}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Additional Resources */}
                        {notes.resources && notes.resources.length > 0 && (
                          <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-3">Additional Resources</h3>
                            <ul className="space-y-2">
                              {notes.resources.map((resource, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-spotify mt-1">📚</span>
                                  <span className="text-muted-foreground">{resource}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Regenerate Button */}
                        <div className="border-t pt-6">
                          <Button
                            onClick={generateNotes}
                            disabled={loadingNotes}
                            variant="outline"
                            className="w-full"
                          >
                            {loadingNotes ? "Regenerating..." : "Regenerate Notes"}
                          </Button>
                        </div>
                      </>
                    )}
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
