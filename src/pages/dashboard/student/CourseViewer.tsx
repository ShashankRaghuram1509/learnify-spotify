import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Play, CheckCircle2, Video, FileText, Code2, Loader2, ExternalLink, Download, FolderOpen } from "lucide-react";
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

interface CourseResource {
  id: string;
  title: string;
  resource_type: string;
  url: string | null;
  file_path: string | null;
  description: string | null;
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
  const [watchedPercentage, setWatchedPercentage] = useState(0);
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [videoStartTime, setVideoStartTime] = useState<number | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  useEffect(() => {
    if (user && id) {
      fetchCourseContent();
      fetchCourseMaterials();
    }
  }, [user, id]);

  // Load YouTube IFrame API
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    (window as any).onYouTubeIframeAPIReady = () => {
      console.log('YouTube API Ready');
    };
  }, []);

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

  const fetchCourseMaterials = async () => {
    try {
      const { data: materialsData, error: materialsError } = await supabase
        .from('course_materials')
        .select('*')
        .eq('course_id', id)
        .maybeSingle();

      if (materialsError && materialsError.code !== 'PGRST116') {
        console.error('Error fetching materials:', materialsError);
        return;
      }

      if (materialsData) {
        setNotes({
          overview: materialsData.overview || '',
          keyPoints: Array.isArray(materialsData.key_points) ? materialsData.key_points as string[] : [],
          codeExamples: Array.isArray(materialsData.code_examples) 
            ? (materialsData.code_examples as Array<{title: string; description: string; code: string; language: string}>)
            : [],
          resources: Array.isArray(materialsData.resources) ? materialsData.resources as string[] : [],
          practiceExercises: Array.isArray(materialsData.practice_exercises) ? materialsData.practice_exercises as string[] : [],
        });
      }
    } catch (error) {
      console.error('Error fetching course materials:', error);
    }
  };

  const generateNotes = async () => {
    if (!course || loadingNotes) return;

    setLoadingNotes(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-course-notes', {
        body: {
          courseId: id,
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

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from("course_resources")
        .select("*")
        .eq("course_id", id)
        .order("position");

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
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

  const getYouTubeVideoId = (url: string | null) => {
    if (!url) return null;
    
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return match[2];
    }
    
    return null;
  };

  const getYouTubeEmbedUrl = (url: string | null) => {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
    }
    return url;
  };

  // Initialize YouTube player
  useEffect(() => {
    if (!course?.video_url || !hasPaid) return;

    const videoId = getYouTubeVideoId(course.video_url);
    if (!videoId || !(window as any).YT) return;

    const initPlayer = () => {
      const newPlayer = new (window as any).YT.Player('youtube-player', {
        videoId: videoId,
        events: {
          onReady: (event: any) => {
            setVideoDuration(event.target.getDuration());
            setVideoStartTime(Date.now());
          },
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              if (!videoStartTime) {
                setVideoStartTime(Date.now());
              }
            }
          }
        }
      });
      setPlayer(newPlayer);
    };

    if ((window as any).YT.loaded) {
      initPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [course?.video_url, hasPaid]);

  const updateProgress = async (newProgress: number) => {
    if (!enrollment || !user || !id) return;
    
    try {
      const { error } = await supabase
        .from("enrollments")
        .update({ progress: Math.min(newProgress, 100) })
        .eq("id", enrollment.id);

      if (error) throw error;

      setEnrollment({ ...enrollment, progress: newProgress });
      
      if (newProgress === 100) {
        toast.success("Congratulations! You've completed this course and earned a certificate!");
      }
    } catch (error) {
      toast.error("Failed to update progress");
    }
  };

  const handleMarkComplete = async () => {
    if (watchedPercentage < 80) {
      toast.error("Please watch at least 80% of the video before marking as complete");
      return;
    }
    
    await updateProgress(100);
  };

  // Track video progress with actual playback time
  useEffect(() => {
    if (!player || !videoDuration) return;

    const trackingInterval = setInterval(() => {
      try {
        if (player && typeof player.getCurrentTime === 'function') {
          const currentTime = player.getCurrentTime();
          const progressPercent = Math.min((currentTime / videoDuration) * 100, 100);
          
          setWatchedPercentage(progressPercent);
          
          // Auto-update progress in database every 30 seconds
          if (progressPercent > (enrollment?.progress || 0)) {
            updateProgress(Math.floor(progressPercent));
          }
        }
      } catch (error) {
        console.error('Error tracking video progress:', error);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(trackingInterval);
  }, [player, videoDuration, enrollment]);

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
              <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6">
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Video Lessons
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Course Notes
                </TabsTrigger>
                <TabsTrigger value="resources" className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Materials
                </TabsTrigger>
              </TabsList>

              <TabsContent value="video" className="mt-0">
                {course.video_url ? (
                  <div className="space-y-6">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <div id="youtube-player" className="w-full h-full"></div>
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

                    {!enrollment?.completed_at && (
                      <Button
                        onClick={handleMarkComplete}
                        className="w-full"
                        size="lg"
                        disabled={watchedPercentage < 80}
                      >
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        {watchedPercentage < 80 
                          ? `Watch ${Math.ceil(80 - watchedPercentage)}% more to complete`
                          : "Mark as Complete"}
                      </Button>
                    )}

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
                      {notes && (
                        <Button
                          onClick={generateNotes}
                          disabled={loadingNotes}
                          variant="outline"
                          size="sm"
                        >
                          {loadingNotes ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Regenerating...
                            </>
                          ) : (
                            <>
                              <Code2 className="h-4 w-4 mr-2" />
                              Regenerate
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!notes ? (
                      <div className="text-center py-12">
                        <Code2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">AI-Powered Course Materials</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          Generate comprehensive tutorial-style notes with code examples and practice exercises
                        </p>
                        <Button onClick={generateNotes} disabled={loadingNotes}>
                          {loadingNotes ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Code2 className="h-4 w-4 mr-2" />
                              Generate Notes Now
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-[240px_1fr] gap-6">
                        {/* Table of Contents Sidebar */}
                        <div className="hidden md:block">
                          <div className="sticky top-4 space-y-1">
                            <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">
                              Table of Contents
                            </h4>
                            <a href="#overview" className="block py-2 px-3 text-sm hover:bg-muted rounded-md transition-colors">
                              Overview
                            </a>
                            <a href="#key-points" className="block py-2 px-3 text-sm hover:bg-muted rounded-md transition-colors">
                              Key Points
                            </a>
                            {notes.codeExamples && notes.codeExamples.length > 0 && (
                              <a href="#examples" className="block py-2 px-3 text-sm hover:bg-muted rounded-md transition-colors">
                                Code Examples
                              </a>
                            )}
                            {notes.practiceExercises && notes.practiceExercises.length > 0 && (
                              <a href="#exercises" className="block py-2 px-3 text-sm hover:bg-muted rounded-md transition-colors">
                                Practice Exercises
                              </a>
                            )}
                            {notes.resources && notes.resources.length > 0 && (
                              <a href="#resources" className="block py-2 px-3 text-sm hover:bg-muted rounded-md transition-colors">
                                Resources
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Main Content */}
                        <div className="space-y-8 max-w-4xl">
                          {/* Course Overview */}
                          <section id="overview" className="scroll-mt-4">
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-primary">
                              Course Overview
                            </h2>
                            <div className="prose prose-invert max-w-none">
                              <p className="text-foreground leading-relaxed whitespace-pre-line">
                                {notes.overview}
                              </p>
                            </div>
                          </section>

                          {/* Key Learning Points */}
                          <section id="key-points" className="scroll-mt-4">
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-primary">
                              Key Learning Points
                            </h2>
                            <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg">
                              <ul className="space-y-3">
                                {notes.keyPoints.map((point, index) => (
                                  <li key={index} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                    <span className="text-foreground leading-relaxed">{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </section>

                          {/* Code Examples */}
                          {notes.codeExamples && notes.codeExamples.length > 0 && (
                            <section id="examples" className="scroll-mt-4">
                              <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-primary flex items-center gap-2">
                                <Code2 className="h-6 w-6" />
                                Code Examples
                              </h2>
                              <div className="space-y-6">
                                {notes.codeExamples.map((example, index) => (
                                  <div key={index} className="border border-border rounded-lg overflow-hidden">
                                    <div className="bg-muted/50 px-5 py-4 border-b border-border">
                                      <h3 className="font-semibold text-lg mb-1">{example.title}</h3>
                                      <p className="text-sm text-muted-foreground">{example.description}</p>
                                    </div>
                                    <div className="bg-card">
                                      <div className="flex items-center justify-between px-5 py-2 bg-muted/30 border-b border-border">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                                          {example.language || 'Code'}
                                        </span>
                                      </div>
                                      <pre className="p-5 overflow-x-auto text-sm">
                                        <code className="text-foreground font-mono">{example.code}</code>
                                      </pre>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </section>
                          )}

                          {/* Practice Exercises */}
                          {notes.practiceExercises && notes.practiceExercises.length > 0 && (
                            <section id="exercises" className="scroll-mt-4">
                              <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-primary">
                                Practice Exercises
                              </h2>
                              <div className="space-y-4">
                                {notes.practiceExercises.map((exercise, index) => (
                                  <div key={index} className="bg-primary/10 border border-primary/30 rounded-lg p-5">
                                    <div className="flex items-start gap-4">
                                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                                        {index + 1}
                                      </div>
                                      <p className="text-foreground leading-relaxed flex-1">{exercise}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </section>
                          )}

                          {/* Additional Resources */}
                          {notes.resources && notes.resources.length > 0 && (
                            <section id="resources" className="scroll-mt-4">
                              <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-primary">
                                Additional Resources
                              </h2>
                              <div className="bg-card border border-border rounded-lg p-6">
                                <ul className="space-y-3">
                                  {notes.resources.map((resource, index) => {
                                    const urlMatch = resource.match(/(https?:\/\/[^\s]+)/);
                                    const url = urlMatch ? urlMatch[0] : null;
                                    const displayText = resource.replace(/(https?:\/\/[^\s]+)/, '').trim() || resource;
                                    
                                    return (
                                      <li key={index} className="flex items-start gap-3 group">
                                        <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                        {url ? (
                                          <a 
                                            href={url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-foreground leading-relaxed hover:text-primary transition-colors flex items-center gap-2 hover:underline"
                                          >
                                            <span>{displayText}</span>
                                            <ExternalLink className="w-4 h-4" />
                                          </a>
                                        ) : (
                                          <span className="text-foreground leading-relaxed">{resource}</span>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            </section>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resources" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Materials & Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {resources.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No additional resources available yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {resources.map((resource) => (
                          <Card key={resource.id}>
                            <CardContent className="py-4 px-4 flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  {resource.resource_type === 'pdf' && <FileText className="h-5 w-5 text-primary" />}
                                  {resource.resource_type === 'video' && <Video className="h-5 w-5 text-primary" />}
                                  {(resource.resource_type === 'video_link' || resource.resource_type === 'article_link') && <ExternalLink className="h-5 w-5 text-primary" />}
                                  <h3 className="font-semibold">{resource.title}</h3>
                                </div>
                                {resource.description && (
                                  <p className="text-sm text-muted-foreground ml-8">{resource.description}</p>
                                )}
                              </div>
                              {resource.url && (
                                <Button asChild size="sm">
                                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                    {resource.resource_type === 'pdf' || resource.resource_type === 'video' ? (
                                      <>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                      </>
                                    ) : (
                                      <>
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Open
                                      </>
                                    )}
                                  </a>
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
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
