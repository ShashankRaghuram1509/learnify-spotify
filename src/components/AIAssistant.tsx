import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export default function AIAssistant() {
  return (
    <div className="fixed bottom-4 right-4">
      <Button size="icon" className="rounded-full h-14 w-14">
        <MessageSquare className="h-7 w-7" />
        <span className="sr-only">Open AI Assistant</span>
      </Button>
    </div>
  );
}