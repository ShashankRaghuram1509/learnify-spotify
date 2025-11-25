import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, BookOpen, Users, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

export default function StudentTeacherMonitoring() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedInsights, setExpandedInsights] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchData();
    
    // Set up real-time subscriptions for admin monitoring
    const channel = supabase
      .channel('admin-monitoring-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enrollments',
        },
        () => {
          console.log('Enrollment updated, refetching admin monitoring...');
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'courses',
        },
        () => {
          console.log('Course updated, refetching admin monitoring...');
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          console.log('Profile updated, refetching admin monitoring...');
          fetchData();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    // Fetch teachers with their courses
    const { data: teacherRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'teacher');

    if (teacherRoles) {
      const teacherIds = teacherRoles.map(r => r.user_id);
      const { data: teacherProfiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', teacherIds);

      const teachersWithCourses = await Promise.all(
        (teacherProfiles || []).map(async (teacher) => {
          const { data: courses, count: courseCount } = await supabase
            .from('courses')
            .select('*, enrollments(count)', { count: 'exact' })
            .eq('teacher_id', teacher.id);

          return {
            ...teacher,
            courses: courses || [],
            totalCourses: courseCount || 0,
            totalStudents: courses?.reduce((sum, c) => sum + (c.enrollments?.[0]?.count || 0), 0) || 0
          };
        })
      );

      setTeachers(teachersWithCourses);
    }

    // Fetch students with their enrollments
    const { data: studentRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'student');

    if (studentRoles) {
      const studentIds = studentRoles.map(r => r.user_id);
      const { data: studentProfiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', studentIds);

      const studentsWithData = await Promise.all(
        (studentProfiles || []).map(async (student) => {
          const { data: enrollments } = await supabase
            .from('enrollments')
            .select('progress, test_progress_bonus, courses(title)')
            .eq('student_id', student.id);

          const avgProgress = enrollments && enrollments.length > 0
            ? enrollments.reduce((sum, e) => {
                const combined = Math.min((e.progress || 0) + (e.test_progress_bonus || 0), 100);
                return sum + combined;
              }, 0) / enrollments.length
            : 0;

          return {
            ...student,
            enrollments: enrollments || [],
            totalCourses: enrollments?.length || 0,
            avgProgress
          };
        })
      );

      setStudents(studentsWithData);
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <Tabs defaultValue="teachers" className="space-y-4">
      <TabsList>
        <TabsTrigger value="teachers">Teachers ({teachers.length})</TabsTrigger>
        <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="teachers" className="space-y-4">
        {/* Teacher Insights */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-purple-500" />
              Teachers Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {teachers.filter(t => t.totalCourses === 0).length > 0 && (
                <Collapsible
                  open={expandedInsights['teacher-no-courses']}
                  onOpenChange={(open) => setExpandedInsights(prev => ({ ...prev, 'teacher-no-courses': open }))}
                >
                  <div className="text-sm p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-amber-900 dark:text-amber-100">
                          <BookOpen className="h-3 w-3 inline mr-1" />
                          {teachers.filter(t => t.totalCourses === 0).length} teacher(s) without courses
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                          Reach out to onboard and help create their first course.
                        </p>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          {expandedInsights['teacher-no-courses'] ? 
                            <ChevronUp className="h-3 w-3" /> : 
                            <ChevronDown className="h-3 w-3" />
                          }
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="mt-3 space-y-2">
                      {teachers.filter(t => t.totalCourses === 0).map(teacher => (
                        <div key={teacher.id} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={teacher.avatar_url} />
                            <AvatarFallback className="text-xs">{teacher.full_name?.[0] || 'T'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{teacher.full_name || 'Unnamed'}</p>
                            <p className="text-xs text-muted-foreground truncate">{teacher.email}</p>
                          </div>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )}
              
              {teachers.filter(t => t.totalStudents === 0 && t.totalCourses > 0).length > 0 && (
                <Collapsible
                  open={expandedInsights['teacher-no-enrollments']}
                  onOpenChange={(open) => setExpandedInsights(prev => ({ ...prev, 'teacher-no-enrollments': open }))}
                >
                  <div className="text-sm p-2 bg-indigo-50 dark:bg-indigo-950/20 rounded border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-indigo-900 dark:text-indigo-100">
                          <Users className="h-3 w-3 inline mr-1" />
                          {teachers.filter(t => t.totalStudents === 0 && t.totalCourses > 0).length} teacher(s) with no enrollments
                        </p>
                        <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                          Help promote their courses or review course visibility settings.
                        </p>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          {expandedInsights['teacher-no-enrollments'] ? 
                            <ChevronUp className="h-3 w-3" /> : 
                            <ChevronDown className="h-3 w-3" />
                          }
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="mt-3 space-y-2">
                      {teachers.filter(t => t.totalStudents === 0 && t.totalCourses > 0).map(teacher => (
                        <div key={teacher.id} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={teacher.avatar_url} />
                            <AvatarFallback className="text-xs">{teacher.full_name?.[0] || 'T'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{teacher.full_name || 'Unnamed'}</p>
                            <p className="text-xs text-muted-foreground truncate">{teacher.email}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">{teacher.totalCourses} courses</Badge>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )}
              
              {teachers.filter(t => t.totalCourses === 0).length === 0 && teachers.filter(t => t.totalStudents === 0 && t.totalCourses > 0).length === 0 && (
                <p className="text-sm text-muted-foreground">All teachers are performing well!</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <Card key={teacher.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={teacher.avatar_url} />
                    <AvatarFallback>{teacher.full_name?.[0] || 'T'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{teacher.full_name}</CardTitle>
                    <CardDescription>{teacher.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Courses</span>
                  <Badge variant="secondary">{teacher.totalCourses}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Students</span>
                  <Badge variant="secondary">{teacher.totalStudents}</Badge>
                </div>
                {teacher.courses.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-xs font-medium">Recent Courses:</p>
                    {teacher.courses.slice(0, 3).map((course: any) => (
                      <div key={course.id} className="text-xs text-muted-foreground">
                        • {course.title}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="students" className="space-y-4">
        {/* Student Insights */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-blue-500" />
              Students Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.filter(s => s.totalCourses === 0).length > 0 && (
                <Collapsible
                  open={expandedInsights['student-no-enrollment']}
                  onOpenChange={(open) => setExpandedInsights(prev => ({ ...prev, 'student-no-enrollment': open }))}
                >
                  <div className="text-sm p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-amber-900 dark:text-amber-100">
                          <BookOpen className="h-3 w-3 inline mr-1" />
                          {students.filter(s => s.totalCourses === 0).length} student(s) not enrolled in any course
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                          Send course recommendations to encourage enrollment.
                        </p>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          {expandedInsights['student-no-enrollment'] ? 
                            <ChevronUp className="h-3 w-3" /> : 
                            <ChevronDown className="h-3 w-3" />
                          }
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="mt-3 space-y-2">
                      {students.filter(s => s.totalCourses === 0).map(student => (
                        <div key={student.id} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={student.avatar_url} />
                            <AvatarFallback className="text-xs">{student.full_name?.[0] || 'S'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{student.full_name || 'Unnamed'}</p>
                            <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                          </div>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )}
              
              {students.filter(s => s.avgProgress < 20 && s.totalCourses > 0).length > 0 && (
                <Collapsible
                  open={expandedInsights['student-low-progress']}
                  onOpenChange={(open) => setExpandedInsights(prev => ({ ...prev, 'student-low-progress': open }))}
                >
                  <div className="text-sm p-2 bg-rose-50 dark:bg-rose-950/20 rounded border border-rose-200 dark:border-rose-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-rose-900 dark:text-rose-100">
                          <TrendingDown className="h-3 w-3 inline mr-1" />
                          {students.filter(s => s.avgProgress < 20 && s.totalCourses > 0).length} student(s) with very low progress (&lt;20%)
                        </p>
                        <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
                          May be at risk of dropping out. Consider engagement campaigns.
                        </p>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          {expandedInsights['student-low-progress'] ? 
                            <ChevronUp className="h-3 w-3" /> : 
                            <ChevronDown className="h-3 w-3" />
                          }
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="mt-3 space-y-2">
                      {students.filter(s => s.avgProgress < 20 && s.totalCourses > 0).map(student => (
                        <div key={student.id} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={student.avatar_url} />
                            <AvatarFallback className="text-xs">{student.full_name?.[0] || 'S'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{student.full_name || 'Unnamed'}</p>
                            <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                          </div>
                          <Badge variant="destructive" className="text-xs">{Math.round(student.avgProgress)}%</Badge>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )}
              
              {students.filter(s => s.subscription_tier === 'free' || !s.subscription_tier).length > students.length * 0.8 && students.length > 0 && (
                <Collapsible
                  open={expandedInsights['student-free-tier']}
                  onOpenChange={(open) => setExpandedInsights(prev => ({ ...prev, 'student-free-tier': open }))}
                >
                  <div className="text-sm p-2 bg-purple-50 dark:bg-purple-950/20 rounded border border-purple-200 dark:border-purple-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-purple-900 dark:text-purple-100">
                          <Users className="h-3 w-3 inline mr-1" />
                          High proportion of free-tier users ({Math.round((students.filter(s => s.subscription_tier === 'free' || !s.subscription_tier).length / Math.max(students.length, 1)) * 100)}%)
                        </p>
                        <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                          Promote premium features to increase conversion rates.
                        </p>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          {expandedInsights['student-free-tier'] ? 
                            <ChevronUp className="h-3 w-3" /> : 
                            <ChevronDown className="h-3 w-3" />
                          }
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                      {students.filter(s => s.subscription_tier === 'free' || !s.subscription_tier).slice(0, 20).map(student => (
                        <div key={student.id} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={student.avatar_url} />
                            <AvatarFallback className="text-xs">{student.full_name?.[0] || 'S'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{student.full_name || 'Unnamed'}</p>
                            <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">{student.subscription_tier || 'free'}</Badge>
                        </div>
                      ))}
                      {students.filter(s => s.subscription_tier === 'free' || !s.subscription_tier).length > 20 && (
                        <p className="text-xs text-center text-muted-foreground py-1">
                          +{students.filter(s => s.subscription_tier === 'free' || !s.subscription_tier).length - 20} more...
                        </p>
                      )}
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )}
              
              {students.filter(s => s.totalCourses === 0).length === 0 && students.filter(s => s.avgProgress < 20 && s.totalCourses > 0).length === 0 && (
                <p className="text-sm text-muted-foreground">All students are actively engaged!</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <Card key={student.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={student.avatar_url} />
                    <AvatarFallback>{student.full_name?.[0] || 'S'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{student.full_name}</CardTitle>
                    <CardDescription>{student.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Enrolled Courses</span>
                  <Badge variant="secondary">{student.totalCourses}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Progress</span>
                    <span className="font-medium">{Math.round(student.avgProgress)}%</span>
                  </div>
                  <Progress value={student.avgProgress} className="h-2" />
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Subscription</span>
                  <Badge variant={student.subscription_tier === 'pro' ? 'default' : 'outline'}>
                    {student.subscription_tier || 'free'}
                  </Badge>
                </div>
                {student.enrollments.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-xs font-medium">Enrolled In:</p>
                    {student.enrollments.slice(0, 3).map((enrollment: any) => (
                      <div key={enrollment.id} className="text-xs text-muted-foreground">
                        • {enrollment.courses?.title}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
