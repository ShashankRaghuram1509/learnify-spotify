import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  message: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
}

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [recipientId, setRecipientId] = useState<string>(""); // In a real app, this would be selected from a list

  const handleSendMessage = async () => {
    if (!inputText.trim() || !user || !recipientId) return;

    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          message: inputText,
          sender_id: user.id,
          recipient_id: recipientId,
        })
        .select()
        .single();

      if (error) throw error;
      
      setMessages((prev) => [...prev, data]);
      setInputText("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>1:1 Chat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 h-64 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-center">No messages yet. Start a conversation!</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-4 ${msg.sender_id === user?.id ? 'justify-end' : ''}`}>
             {msg.sender_id !== user?.id && (
              <Avatar>
                <AvatarFallback>{msg.sender_id?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
             )}
            <div className={`rounded-lg p-3 text-sm ${msg.sender_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              <p>{msg.message}</p>
            </div>
             {msg.sender_id === user?.id && (
              <Avatar>
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
             )}
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <div className="relative w-full">
          <Input
            placeholder="Type a message..."
            className="pr-12"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
