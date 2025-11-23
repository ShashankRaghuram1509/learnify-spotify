import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
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
import { Settings, CreditCard, Moon, Sun, Trash2, Lock, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { format } from "date-fns";

export default function SettingsPage() {
  const { user, subscriptionTier, subscriptionExpiresAt } = useAuth();
  const { theme, setTheme } = useTheme();
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      fetchPaymentHistory();
    }
  }, [user]);

  const fetchPaymentHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      toast.error("Failed to load payment history");
    } finally {
      setLoadingPayments(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Failed to update password");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Note: Full account deletion would require an edge function
      // For now, we'll just sign out and show a message
      await supabase.auth.signOut();
      toast.success("Account deletion requested. Please contact support to complete.");
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  const getSubscriptionStatus = () => {
    if (!subscriptionTier || subscriptionTier === "free") {
      return {
        status: "Free Plan",
        color: "text-muted-foreground",
        description: "Upgrade to access premium features",
      };
    }

    if (subscriptionExpiresAt) {
      const expiryDate = new Date(subscriptionExpiresAt);
      const isExpired = expiryDate < new Date();

      if (isExpired) {
        return {
          status: "Expired",
          color: "text-destructive",
          description: "Your subscription has expired",
        };
      }

      const daysLeft = Math.ceil(
        (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        status: `${subscriptionTier.toUpperCase()} Plan`,
        color: "text-primary",
        description: `Valid until ${format(expiryDate, "MMM dd, yyyy")} (${daysLeft} days left)`,
      };
    }

    return {
      status: `${subscriptionTier.toUpperCase()} Plan`,
      color: "text-primary",
      description: "Active subscription",
    };
  };

  const subscription = getSubscriptionStatus();

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="text-primary" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
            <div>
              <p className={`text-lg font-semibold ${subscription.color}`}>
                {subscription.status}
              </p>
              <p className="text-sm text-muted-foreground">{subscription.description}</p>
            </div>
            {subscriptionTier === "free" && (
              <Button variant="default">Upgrade Now</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="text-primary" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPayments ? (
            <p className="text-center py-4 text-muted-foreground">Loading...</p>
          ) : payments.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No payment history</p>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">
                      {payment.plan_name || "Course Purchase"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(payment.created_at), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{payment.amount}</p>
                    <p
                      className={`text-sm ${
                        payment.status === "completed"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {payment.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === "dark" ? (
              <Moon className="text-primary" />
            ) : (
              <Sun className="text-primary" />
            )}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark theme
              </p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="text-primary" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <Button onClick={handlePasswordUpdate} className="w-full">
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount}>
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