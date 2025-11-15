import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TranscriptViewerProps {
  transcript: string;
  summary: string;
}

export default function TranscriptViewer({ transcript, summary }: TranscriptViewerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Call Transcript</CardTitle>
        <CardDescription>AI-generated transcript and summary</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="full">Full Transcript</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{summary}</p>
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="full">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{transcript}</p>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
