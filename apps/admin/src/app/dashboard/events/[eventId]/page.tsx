"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { getEventById } from "@eventpilot/firebase/queries/events";
import { getStalls } from "@eventpilot/firebase/queries/stalls";
import type { Event, Stall } from "@eventpilot/types";

export default function EventStallsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventData, stallsData] = await Promise.all([
          getEventById(eventId),
          getStalls(eventId),
        ]);
        setEvent(eventData);
        setStalls(stallsData);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{event.name}</h2>
          <p className="text-muted-foreground">Manage stalls and exhibitors</p>
        </div>
        <Button onClick={() => router.push(`/dashboard/events/${eventId}/stalls/new`)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Stall
        </Button>
      </div>

      <div className="flex gap-2">
        <Link href={`/dashboard/events/${eventId}`}>
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            Stalls
          </Button>
        </Link>
        <Link href={`/dashboard/events/${eventId}/schedule`}>
          <Button variant="ghost" size="sm">
            Schedule
          </Button>
        </Link>
        <Link href={`/dashboard/events/${eventId}/amenities`}>
          <Button variant="ghost" size="sm">
            Amenities
          </Button>
        </Link>
      </div>

      {stalls.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No stalls yet</h3>
            <p className="text-muted-foreground mb-4">
              Add stalls and exhibitors to this event
            </p>
            <Button onClick={() => router.push(`/dashboard/events/${eventId}/stalls/new`)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Stall
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stalls.map((stall) => (
            <Card key={stall.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{stall.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stall.category}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/dashboard/events/${eventId}/stalls/${stall.id}`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {stall.description}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-muted rounded">
                    {stall.location.zone}
                  </span>
                  {stall.isCrowded && (
                    <span className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded">
                      Crowded
                    </span>
                  )}
                  {stall.hasGiveaways && (
                    <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded">
                      Giveaways
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
