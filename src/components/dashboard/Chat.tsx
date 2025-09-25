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

export default function Chat() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>1:1 Chat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p>
              Hey! I had a question about the last lecture. Can you clarify the
              part about hooks?
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4 justify-end">
          <div className="rounded-lg bg-primary p-3 text-sm text-primary-foreground">
            <p>Of course! Which part are you finding tricky?</p>
          </div>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
        </div>
      </CardContent>
      <CardFooter>
        <div className="relative w-full">
          <Input placeholder="Type a message..." className="pr-12" />
          <Button
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}