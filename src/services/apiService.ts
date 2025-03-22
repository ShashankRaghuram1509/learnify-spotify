import { toast } from "sonner";

// Base API URL - would point to Spring Boot backend
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080/api' 
  : '/api';

// This would be replaced with actual implementation when connected to Spring Boot
const mockApiResponse = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 800);
  });
};

export type PaymentFormData = {
  cardHolder: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
};

export type VideoCallSchedule = {
  date: string;
  time: string;
};

export const apiService = {
  // Authentication methods
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      // For demo purposes, return a mock response
      return mockApiResponse({ token: 'mock-token', user: { name: email.split('@')[0], email } });
    }
  },
  
  register: async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      // For demo purposes, return a mock response
      return mockApiResponse({ token: 'mock-token', user: { name, email } });
    }
  },
  
  // Premium features methods
  subscribe: async (paymentDetails: PaymentFormData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/premium/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(paymentDetails),
      });
      
      if (!response.ok) {
        throw new Error('Subscription failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Subscription error:', error);
      // For demo purposes, return a mock response
      return mockApiResponse({ subscriptionId: 'sub_123', status: 'active' });
    }
  },
  
  sendAiMessage: async (message: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/premium/ai-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        throw new Error('AI request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('AI request error:', error);
      // For demo purposes, return a mock response
      return mockApiResponse({ 
        message: "I can help answer that! Based on your courses, here's what you need to know about this topic...",
        confidence: 0.95
      });
    }
  },
  
  scheduleVideoCall: async (scheduleData: VideoCallSchedule) => {
    try {
      const response = await fetch(`${API_BASE_URL}/premium/schedule-call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(scheduleData),
      });
      
      if (!response.ok) {
        throw new Error('Scheduling failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Scheduling error:', error);
      // For demo purposes, return a mock response
      return mockApiResponse({ 
        callId: 'call_' + Date.now(),
        date: scheduleData.date,
        time: scheduleData.time,
        status: 'scheduled'
      });
    }
  },
  
  // Course related methods
  getCourses: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Courses fetch error:', error);
      // Return mock data for now
      return mockApiResponse([
        {
          id: "web-dev-101",
          title: "Web Development Fundamentals",
          instructor: "Sarah Johnson",
          rating: 4.8,
          students: 1543,
          duration: "8 weeks",
          level: "Beginner",
          price: 89.99,
          discountPrice: 49.99,
          image: "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
          featured: true,
          category: "development"
        },
        {
          id: "ui-ux-design",
          title: "UI/UX Design Mastery",
          instructor: "Michael Chang",
          rating: 4.7,
          students: 982,
          duration: "10 weeks",
          level: "Intermediate",
          price: 99.99,
          discountPrice: 69.99,
          image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
          featured: true,
          category: "design"
        },
        {
          id: "data-science-python",
          title: "Data Science with Python",
          instructor: "Emily Rodriguez",
          rating: 4.9,
          students: 2102,
          duration: "12 weeks",
          level: "Intermediate",
          price: 119.99,
          discountPrice: 79.99,
          image: "https://images.unsplash.com/photo-1551033406-611cf9a28f67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
          featured: true,
          category: "data-science"
        },
        {
          id: "digital-marketing",
          title: "Digital Marketing Strategies",
          instructor: "Alex Thompson",
          rating: 4.6,
          students: 1287,
          duration: "6 weeks",
          level: "All Levels",
          price: 79.99,
          discountPrice: 39.99,
          image: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2326&q=80",
          featured: true,
          category: "marketing"
        },
        {
          id: "ai-machine-learning",
          title: "AI & Machine Learning Fundamentals",
          instructor: "David Chen",
          rating: 4.8,
          students: 1843,
          duration: "14 weeks",
          level: "Advanced",
          price: 129.99,
          discountPrice: 89.99,
          image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2301&q=80",
          featured: true,
          category: "ai"
        },
        {
          id: "mobile-app-dev",
          title: "Mobile App Development",
          instructor: "Jessica Lee",
          rating: 4.7,
          students: 1204,
          duration: "10 weeks",
          level: "Intermediate",
          price: 99.99,
          discountPrice: 59.99,
          image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
          featured: true,
          category: "development"
        }
      ]);
    }
  },
  
  getCourseById: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch course with id: ${id}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Course fetch error:', error);
      // Return mock data for now
      return mockApiResponse({
        id: "web-dev-101",
        title: "Web Development Fundamentals",
        instructor: "Sarah Johnson",
        rating: 4.8,
        students: 1543,
        duration: "8 weeks",
        level: "Beginner",
        price: 89.99,
        discountPrice: 49.99,
        image: "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
        featured: true,
        category: "development",
        description: "Learn the basics of web development with HTML, CSS, and JavaScript.",
        modules: [
          {
            title: "Introduction to HTML",
            content: "Learn about HTML tags and structure."
          },
          {
            title: "CSS Styling",
            content: "Learn how to style your HTML with CSS."
          },
          {
            title: "JavaScript Basics",
            content: "Learn the fundamentals of JavaScript programming."
          }
        ]
      });
    }
  },
};
