import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="text-spotify" />
          Account Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Manage your account settings, password, and notification preferences here.</p>
      </CardContent>
    </Card>
  );
}