import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Settings, Moon, Sun, Trash2, Mail, Lock, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage
    const savedMode = localStorage.getItem("darkMode");
    return savedMode === "true";
  });
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Apply dark mode on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    if (savedMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle("dark", checked);
    localStorage.setItem("darkMode", checked.toString());
    toast.success(checked ? "Dark mode enabled" : "Light mode enabled");
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      
      // Delete user profile data
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user?.id);

      if (profileError) throw profileError;

      // Sign out and notify
      await signOut();
      toast.success("Account deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  const handleContactSupport = () => {
    window.location.href = "mailto:support@learnify.com?subject=Support Request";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="text-primary" />
            Account Settings
          </CardTitle>
          <CardDescription>
            Manage your account preferences and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Appearance Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Appearance</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark theme
                  </p>
                </div>
              </div>
              <Switch checked={darkMode} onCheckedChange={handleDarkModeToggle} />
            </div>
          </div>

          <Separator />

          {/* Password Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Change Password
            </h3>
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <Button onClick={handlePasswordChange} disabled={loading || !newPassword || !confirmPassword}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Update Password
              </Button>
            </div>
          </div>

          <Separator />

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Support
            </h3>
            <p className="text-sm text-muted-foreground">
              Need help? Contact our customer support team
            </p>
            <Button onClick={handleContactSupport} variant="outline">
              Contact Support
            </Button>
          </div>

          <Separator />

          {/* Danger Zone */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </h3>
            <p className="text-sm text-muted-foreground">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={loading}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
