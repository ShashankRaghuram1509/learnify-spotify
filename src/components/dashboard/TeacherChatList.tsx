import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import UserChat from "./UserChat";

interface ChatContact {
  id: string;
  full_name: string | null;
  email: string;
}

export default function TeacherChatList() {
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChatContacts = async () => {
      if (!user) return;

      try {
        // Fetch teacher's courses
        const { data: courses, error: coursesError } = await supabase
          .from("courses")
          .select("id")
          .eq("teacher_id", user.id);

        if (coursesError) throw coursesError;

        if (!courses || courses.length === 0) {
          setIsLoading(false);
          return;
        }

        const courseIds = courses.map(c => c.id);

        // Fetch paid enrollments for those courses
        const { data: payments, error: paymentsError } = await supabase
          .from("payments")
          .select("user_id, course_id")
          .in("course_id", courseIds)
          .eq("status", "completed");

        if (paymentsError) throw paymentsError;

        if (!payments || payments.length === 0) {
          setIsLoading(false);
          return;
        }

        const studentIds = [...new Set(payments.map(p => p.user_id))];

        // Fetch student profiles
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", studentIds);

        if (profilesError) throw profilesError;

        setContacts(profiles || []);
      } catch (error) {
        console.error("Error fetching chat contacts:", error);
        toast.error("Failed to load chat contacts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatContacts();
  }, [user]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Student Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading students...</p>
        </CardContent>
      </Card>
    );
  }

  if (contacts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Student Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No students have purchased your courses yet
          </p>
        </CardContent>
      </Card>
    );
  }

  if (selectedContact) {
    return (
      <div>
        <Button
          variant="ghost"
          onClick={() => setSelectedContact(null)}
          className="mb-4"
        >
          ← Back to Students
        </Button>
        <UserChat
          receiverId={selectedContact.id}
          receiverName={selectedContact.full_name || selectedContact.email}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer"
              onClick={() => setSelectedContact(contact)}
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {contact.full_name?.[0]?.toUpperCase() || contact.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{contact.full_name || "Student"}</p>
                  <p className="text-sm text-muted-foreground">{contact.email}</p>
                </div>
              </div>
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
