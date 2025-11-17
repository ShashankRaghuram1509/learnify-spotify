import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: "student" | "teacher" | "admin" | null;
  subscriptionTier: string | null;
  subscriptionExpiresAt: string | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: "student" | "teacher") => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<"student" | "teacher" | "admin" | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      setUserRole(roleData?.role ?? null);

      // Fetch subscription data from profiles
      const { data: profileData } = await supabase
        .from("profiles")
        .select("subscription_tier, subscription_expires_at")
        .eq("id", userId)
        .single();

      setSubscriptionTier(profileData?.subscription_tier ?? null);
      setSubscriptionExpiresAt(profileData?.subscription_expires_at ?? null);
    } catch (error) {
      // Silent fail - data will remain null
    }
  };

  const refreshUserData = async () => {
    if (user?.id) {
      await fetchUserData(user.id);
    }
  };

  useEffect(() => {
    let roleTimeout: NodeJS.Timeout;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          roleTimeout = setTimeout(() => fetchUserData(session.user.id), 0);
        } else {
          setUserRole(null);
          setSubscriptionTier(null);
          setSubscriptionExpiresAt(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        roleTimeout = setTimeout(() => fetchUserData(session.user.id), 0);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      if (roleTimeout) {
        clearTimeout(roleTimeout);
      }
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: "student" | "teacher") => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast.success("Account created successfully! You can now login.");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Welcome back!");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setUserRole(null);
      setSubscriptionTier(null);
      setSubscriptionExpiresAt(null);
      
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      userRole, 
      subscriptionTier, 
      subscriptionExpiresAt, 
      loading, 
      signUp, 
      signIn, 
      signOut, 
      refreshUserData 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
