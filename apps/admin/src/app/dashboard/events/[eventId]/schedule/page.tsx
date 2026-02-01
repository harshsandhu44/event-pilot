"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@eventpilot/ui";
import { Button } from "@eventpilot/ui";
import { Plus, Edit, Calendar, Clock, MapPin } from "lucide-react";
import { getEventById } from "@eventpilot/firebase/queries/events";
import { getScheduleItems } from "@eventpilot/firebase/queries/schedule";
import type { Event, ScheduleItem } from "@eventpilot/types";

export default function EventSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventData, scheduleData] = await Promise.all([
          getEventById(eventId),
          getScheduleItems(eventId),
        ]);
        setEvent(eventData);
        setScheduleItems(scheduleData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [eventId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{event.name}</h2>
          <p className="text-muted-foreground">Manage event schedule</p>
        </div>
        <Button
          onClick={() =>
            router.push(`/dashboard/events/${eventId}/schedule/new`)
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule Item
        </Button>
      </div>

      <div className="flex gap-2">
        <Link href={`/dashboard/events/${eventId}`}>
          <Button variant="ghost" size="sm">
            Stalls
          </Button>
        </Link>
        <Link href={`/dashboard/events/${eventId}/schedule`}>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </Link>
        <Link href={`/dashboard/events/${eventId}/amenities`}>
          <Button variant="ghost" size="sm">
            Amenities
          </Button>
        </Link>
      </div>

      {scheduleItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No schedule items yet</h3>
            <p className="text-muted-foreground mb-4">
              Add sessions, workshops, and events to the schedule
            </p>
            <Button
              onClick={() =>
                router.push(`/dashboard/events/${eventId}/schedule/new`)
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {scheduleItems.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                        {item.type}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          item.status === "ongoing"
                            ? "bg-green-500/10 text-green-500"
                            : item.status === "completed"
                            ? "bg-gray-500/10 text-gray-500"
                            : item.status === "cancelled"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-blue-500/10 text-blue-500"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    {item.speaker.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.speaker.join(", ")}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/dashboard/events/${eventId}/schedule/${item.id}`
                      )
                    }
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {item.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(item.startTime)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {item.location.zone}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
