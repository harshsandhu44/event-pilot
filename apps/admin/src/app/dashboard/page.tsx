"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@eventpilot/ui";
import { Button } from "@eventpilot/ui";
import { Plus, Calendar, Users, MapPin, Boxes } from "lucide-react";
import { getEvents } from "@eventpilot/firebase/queries/events";
import type { Event } from "@eventpilot/types";

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  if (loading) {
    return <div>Loading events...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Events</h2>
          <p className="text-muted-foreground">
            Manage your events and their content
          </p>
        </div>
        <Link href="/dashboard/events/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first event
            </p>
            <Link href="/dashboard/events/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{event.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {event.venue}
                    </CardDescription>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      event.status === "active"
                        ? "bg-green-500/10 text-green-500"
                        : event.status === "draft"
                        ? "bg-gray-500/10 text-gray-500"
                        : event.status === "completed"
                        ? "bg-blue-500/10 text-blue-500"
                        : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {event.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <Calendar className="h-3 w-3" />
                  {new Date(event.startDate).toLocaleDateString()} -{" "}
                  {new Date(event.endDate).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/events/${event.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Users className="h-3 w-3 mr-1" />
                      Stalls
                    </Button>
                  </Link>
                  <Link href={`/dashboard/events/${event.id}/schedule`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <MapPin className="h-3 w-3 mr-1" />
                      Schedule
                    </Button>
                  </Link>
                  <Link href={`/dashboard/events/${event.id}/amenities`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Boxes className="h-3 w-3 mr-1" />
                      Amenities
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
