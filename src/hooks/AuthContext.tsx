import { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of the user object and the context
interface User {
  name: string;
  role: "student" | "teacher" | "guest";
}

interface AuthContextType {
  user: User;
  login: (role: "student" | "teacher") => void;
  logout: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the provider
interface AuthProviderProps {
  children: ReactNode;
}

// Create the provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User>({ name: "Guest", role: "guest" });

  const login = (role: "student" | "teacher") => {
    const name = role === "student" ? "Student User" : "Teacher User";
    setUser({ name, role });
  };

  const logout = () => {
    setUser({ name: "Guest", role: "guest" });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};