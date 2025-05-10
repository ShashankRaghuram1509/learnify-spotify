
import { getHeaders } from './base.service';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      console.log("Attempting login to:", `/api/auth/login`);
      const response = await fetch(`/api/auth/login`, {
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
      const response = await fetch(`/api/auth/register`, {
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
  }
};
