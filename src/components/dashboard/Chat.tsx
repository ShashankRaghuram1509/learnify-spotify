import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import ZIM from "zego-zim-web";

const appID = 1272193580;
// Note: In a production app, the token should be generated on a server and fetched by the client.
// We are generating it here for demonstration purposes only.
const serverSecret = "831429defc85d636c08678164bb9a87f";


export default function Chat() {
  const { user } = useAuth();
  const [zim, setZim] = useState<ZIM | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [conversationID, setConversationID] = useState("default-conversation"); // In a real app, this would be dynamic

  const zimRef = useRef<ZIM | null>(null);

  useEffect(() => {
    if (user && !zimRef.current) {
      const newZim = ZIM.getInstance();
      if(newZim){
        zimRef.current = newZim;
        setZim(newZim);

        newZim.on("receivePeerMessage", (zim, { messageList }) => {
          setMessages((prev) => [...prev, ...messageList]);
        });

        const token = ZIM.generateToken(appID, user.id, serverSecret, 60 * 60 * 24);

        newZim.login({ userID: user.id, userName: user.email }, token)
          .then(() => {
            console.log("ZIM login success");
          })
          .catch((err) => {
            console.error("ZIM login error", err);
          });
      }
    }

    return () => {
      zimRef.current?.logout();
    }
  }, [user]);

  const handleSendMessage = () => {
    if (!zim || !inputText.trim() || !user) return;

    const toConversationID = conversationID; // In a 1:1 chat, this would be the other user's ID
    const message = {
      type: 1,
      message: inputText,
      toConversationID,
      conversationType: 0,
    };

    zim.sendMessage(message)
      .then(({ message }) => {
        setMessages((prev) => [...prev, message]);
        setInputText("");
      })
      .catch((err) => {
        console.error("Failed to send message", err);
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>1:1 Chat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 h-64 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-4 ${msg.senderUserID === user?.id ? 'justify-end' : ''}`}>
             {msg.senderUserID !== user?.id && (
              <Avatar>
                <AvatarFallback>{msg.senderUserID?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
             )}
            <div className={`rounded-lg p-3 text-sm ${msg.senderUserID === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              <p>{msg.message}</p>
            </div>
             {msg.senderUserID === user?.id && (
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
