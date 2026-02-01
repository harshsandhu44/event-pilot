"use client";

import { useEvent } from "@/hooks/useEvent";
import { Button } from "@eventpilot/ui";
import { CalendarDays } from "lucide-react";

export function EventSelector() {
  const { currentEvent, events, setCurrentEventId } = useEvent();

  if (events.length <= 1) {
    return null; // Don't show selector if only one or no events
  }

  return (
    <div className="flex items-center gap-2 mb-4 p-4 bg-muted/50 rounded-lg">
      <CalendarDays className="h-5 w-5 text-muted-foreground" />
      <span className="text-sm font-medium">Event:</span>
      <div className="flex gap-2 flex-wrap">
        {events.map((event) => (
          <Button
            key={event.id}
            variant={currentEvent?.id === event.id ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentEventId(event.id)}
          >
            {event.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
