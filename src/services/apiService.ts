// API base URL should point to our Spring Boot backend
const API_BASE_URL = '/api';

// Helper function to get headers with auth token
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
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
  login: async (email: string, password: string) => {
    try {
      console.log("Attempting login to:", `${API_BASE_URL}/auth/login`);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Login successful, token received");
      
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ name, email, password }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Registration failed: ${response.status}`);
      }
      
      const data = await response.json();
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  subscribe: async (paymentDetails: PaymentFormData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/premium/subscribe`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(paymentDetails),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Subscription failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error("Failed to process subscription. Please try again.");
      throw error;
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
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('AI request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('AI request error:', error);
      toast.error("Failed to get AI response. Please try again.");
      throw error;
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
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Scheduling failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Scheduling error:', error);
      toast.error("Failed to schedule video call. Please try again.");
      throw error;
    }
  },
  
  getScheduledCalls: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/premium/scheduled-calls`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch scheduled calls');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching scheduled calls:', error);
      toast.error("Failed to fetch scheduled calls.");
      throw error;
    }
  },
  
  getCourses: async () => {
    try {
      console.log("Fetching courses from:", `${API_BASE_URL}/courses`);
      const response = await fetch(`${API_BASE_URL}/courses`, {
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
      const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const response = await fetch(`${API_BASE_URL}/courses/featured`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const response = await fetch(`${API_BASE_URL}/courses/category/${category}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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
