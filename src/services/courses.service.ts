
import { toast } from "sonner";
import { getHeaders } from './base.service';

export const coursesService = {
  getCourses: async () => {
    try {
      console.log("Fetching courses from:", `/api/courses`);
      const response = await fetch(`/api/courses`, {
        method: 'GET',
        headers: getHeaders(false),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Courses fetch error:', error);
      throw error;
    }
  },

  getCourseById: async (id: string) => {
    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'GET',
        headers: getHeaders(false),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch course with id: ${id}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Course fetch error:', error);
      toast.error("Failed to load course details. Please try again.");
      throw error;
    }
  },
  
  getFeaturedCourses: async () => {
    try {
      const response = await fetch(`/api/courses/featured`, {
        method: 'GET',
        headers: getHeaders(false),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch featured courses');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Featured courses fetch error:', error);
      toast.error("Failed to load featured courses. Please try again.");
      throw error;
    }
  },
  
  getCoursesByCategory: async (category: string) => {
    try {
      const response = await fetch(`/api/courses/category/${category}`, {
        method: 'GET',
        headers: getHeaders(false),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch courses in category: ${category}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Category courses fetch error:', error);
      toast.error("Failed to load courses in this category. Please try again.");
      throw error;
    }
  }
};
