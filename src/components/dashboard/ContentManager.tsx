import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const sampleCourses = [
  {
    id: "course-1",
    title: "Introduction to Quantum Computing",
    videos: 5,
    articles: 8,
  },
  {
    id: "course-2",
    title: "Advanced Algorithms",
    videos: 12,
    articles: 15,
  },
  {
    id: "course-3",
    title: "The Art of Public Speaking",
    videos: 7,
    articles: 4,
  },
];

export default function ContentManager() {
  const [courses, setCourses] = useState(sampleCourses);
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Content Manager</CardTitle>
          <CardDescription>
            Manage your course content, including videos and articles.
          </CardDescription>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2">
              <PlusCircle size={16} />
              Upload Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Course</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new course to your catalog.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Course Title</Label>
                <Input id="title" placeholder="e.g., Introduction to React" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Course Description</Label>
                <Textarea id="description" placeholder="A brief summary of the course." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="video-url">Video Lecture URL</Label>
                <Input id="video-url" placeholder="https://example.com/video.mp4" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="article">Article/Notes</Label>
                <Textarea id="article" placeholder="Write your course content here." />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setIsFormOpen(false)}>Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="p-4 bg-spotify-gray/20 rounded-lg flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{course.title}</h4>
                <p className="text-sm text-spotify-text/70">
                  {course.videos} videos, {course.articles} articles
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-spotify-text/80 hover:text-spotify">
                  <Edit size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500/80 hover:text-red-500">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}