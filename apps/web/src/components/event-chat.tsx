"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@eventpilot/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@eventpilot/ui";
import { MessageSquare, Mic, Bell } from "lucide-react";
import { TextChat } from "@/components/text-chat";
import { VoiceChat } from "@/components/voice-chat";
import { GetUpdates } from "@/components/get-updates";

export function EventChat() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please wait...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 h-screen flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Event Guide Assistant</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <Tabs defaultValue="text" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Text Chat
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice Chat
              </TabsTrigger>
              <TabsTrigger value="updates" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Get Updates
              </TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="flex-1 flex flex-col mt-0">
              <TextChat />
            </TabsContent>
            <TabsContent value="voice" className="flex-1 flex flex-col mt-0">
              <VoiceChat />
            </TabsContent>
            <TabsContent value="updates" className="flex-1 flex flex-col mt-0">
              <GetUpdates />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
