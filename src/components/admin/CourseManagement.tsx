import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Edit, Trash2, Plus, Search, Upload, X, Play, Image as ImageIcon } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  thumbnail_url: string | null;
  video_url: string | null;
  is_premium: boolean | null;
  teacher_id: string;
  created_at: string;
  teacher_name?: string;
}

interface Teacher {
  id: string;
  full_name: string;
  email: string;
}

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [teacherFilter, setTeacherFilter] = useState<string>("all");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('course-management-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, teacherFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch teachers
      const { data: teacherRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'teacher');

      if (teacherRoles) {
        const teacherIds = teacherRoles.map(r => r.user_id);
        const { data: teacherProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', teacherIds);

        setTeachers(teacherProfiles || []);
      }

      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      // Add teacher names to courses
      const coursesWithTeachers = coursesData?.map(course => {
        const teacher = teachers.find(t => t.id === course.teacher_id);
        return {
          ...course,
          teacher_name: teacher?.full_name || 'Unknown'
        };
      }) || [];

      setCourses(coursesWithTeachers);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (teacherFilter !== "all") {
      filtered = filtered.filter(course => course.teacher_id === teacherFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  };

  const handleFileUpload = async (file: File, bucket: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload file: ${error.message}`);
      return null;
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        toast.error("Video size must be less than 500MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData(e.currentTarget);
      let thumbnailUrl = editingCourse?.thumbnail_url || null;
      let videoUrl = editingCourse?.video_url || null;

      // Upload thumbnail if new file selected
      if (thumbnailInputRef.current?.files?.[0]) {
        const uploadedUrl = await handleFileUpload(
          thumbnailInputRef.current.files[0],
          'course-thumbnails'
        );
        if (uploadedUrl) thumbnailUrl = uploadedUrl;
      }

      // Upload video if new file selected
      if (videoInputRef.current?.files?.[0]) {
        const uploadedUrl = await handleFileUpload(
          videoInputRef.current.files[0],
          'course-videos'
        );
        if (uploadedUrl) videoUrl = uploadedUrl;
      }

      const courseData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string) || 0,
        is_premium: formData.get('is_premium') === 'on',
        teacher_id: formData.get('teacher_id') as string,
        thumbnail_url: thumbnailUrl,
        video_url: videoUrl,
      };

      if (isCreating) {
        const { error } = await supabase
          .from('courses')
          .insert([courseData]);

        if (error) throw error;
        toast.success("Course created successfully");
      } else if (editingCourse) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse.id);

        if (error) throw error;
        toast.success("Course updated successfully");
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving course:', error);
      toast.error(error.message || "Failed to save course");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deletingCourseId) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', deletingCourseId);

      if (error) throw error;

      toast.success("Course deleted successfully");
      setDeletingCourseId(null);
      fetchData();
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast.error(error.message || "Failed to delete course");
    }
  };

  const resetForm = () => {
    setEditingCourse(null);
    setIsCreating(false);
    setThumbnailPreview(null);
    setVideoPreview(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreating(true);
    setDialogOpen(true);
  };

  const openEditDialog = (course: Course) => {
    resetForm();
    setEditingCourse(course);
    setThumbnailPreview(course.thumbnail_url);
    setVideoPreview(course.video_url);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Course Management</CardTitle>
              <CardDescription>Manage courses, upload media, and assign teachers</CardDescription>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={teacherFilter} onValueChange={setTeacherFilter}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Filter by teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {teachers.map(teacher => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-max">

              <TableHeader>
                <TableRow>
                  <TableHead>Thumbnail</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Video</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No courses found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">
                        {course.title}
                      </TableCell>
                      <TableCell>{course.teacher_name}</TableCell>
                      <TableCell>₹{course.price?.toLocaleString() || 0}</TableCell>
                      <TableCell>
                        <Badge variant={course.is_premium ? "default" : "secondary"}>
                          {course.is_premium ? 'Premium' : 'Free'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {course.video_url ? (
                          <Badge variant="outline" className="gap-1">
                            <Play className="h-3 w-3" />
                            Available
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No video</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(course.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(course)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingCourseId(course.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
        </CardContent>
      </Card>

      {/* Course Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Create New Course' : 'Edit Course'}</DialogTitle>
            <DialogDescription>
              {isCreating ? 'Add a new course with media' : 'Update course information and media'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCourse} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingCourse?.title || ''}
                  required
                  placeholder="Enter course title"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingCourse?.description || ''}
                  rows={4}
                  placeholder="Enter course description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher_id">Assign Teacher *</Label>
                <Select name="teacher_id" defaultValue={editingCourse?.teacher_id || ''} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(teacher => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.full_name} ({teacher.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={editingCourse?.price || 0}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_premium"
                    name="is_premium"
                    defaultChecked={editingCourse?.is_premium || false}
                  />
                  <Label htmlFor="is_premium">Premium Course</Label>
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div className="space-y-2 col-span-2">
                <Label>Course Thumbnail (Max 5MB)</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Thumbnail
                  </Button>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailChange}
                  />
                </div>
                {thumbnailPreview && (
                  <div className="relative mt-2">
                    <img
                      src={thumbnailPreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setThumbnailPreview(null);
                        if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Video Upload */}
              <div className="space-y-2 col-span-2">
                <Label>Demo Video (Max 500MB)</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Video
                  </Button>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoChange}
                  />
                </div>
                {videoPreview && (
                  <div className="relative mt-2">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full h-48 rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setVideoPreview(null);
                        if (videoInputRef.current) videoInputRef.current.value = '';
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? 'Uploading...' : isCreating ? 'Create Course' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCourseId} onOpenChange={() => setDeletingCourseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this course and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCourse} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
