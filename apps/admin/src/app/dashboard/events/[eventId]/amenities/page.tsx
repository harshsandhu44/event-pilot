"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Plus, MapPin, Calendar } from "lucide-react";
import { getEventById } from "@eventpilot/firebase/queries/events";
import { getAmenities } from "@eventpilot/firebase/queries/amenities";
import type { Event, Amenity } from "@eventpilot/types";

export default function EventAmenitiesPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventData, amenitiesData] = await Promise.all([
          getEventById(eventId),
          getAmenities(eventId),
        ]);
        setEvent(eventData);
        setAmenities(amenitiesData);
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
          <p className="text-muted-foreground">Manage venue amenities</p>
        </div>
        <Button
          onClick={() =>
            router.push(`/dashboard/events/${eventId}/amenities/new`)
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Amenity
        </Button>
      </div>

      <div className="flex gap-2">
        <Link href={`/dashboard/events/${eventId}`}>
          <Button variant="ghost" size="sm">
            Stalls
          </Button>
        </Link>
        <Link href={`/dashboard/events/${eventId}/schedule`}>
          <Button variant="ghost" size="sm">
            Schedule
          </Button>
        </Link>
        <Link href={`/dashboard/events/${eventId}/amenities`}>
          <Button variant="outline" size="sm">
            <MapPin className="h-4 w-4 mr-2" />
            Amenities
          </Button>
        </Link>
      </div>

      {amenities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No amenities yet</h3>
            <p className="text-muted-foreground mb-4">
              Add restrooms, ATMs, food areas, and other facilities
            </p>
            <Button
              onClick={() =>
                router.push(`/dashboard/events/${eventId}/amenities/new`)
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Amenity
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {amenities.map((amenity) => (
            <Card
              key={amenity.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() =>
                router.push(`/dashboard/events/${eventId}/amenities/${amenity.id}`)
              }
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2 py-1 text-xs font-medium bg-muted rounded">
                    {amenity.type}
                  </span>
                  <div className="flex gap-1">
                    {amenity.isAccessible && (
                      <span className="px-2 py-1 text-xs bg-green-500/10 text-green-500 rounded">
                        Accessible
                      </span>
                    )}
                    {!amenity.isAvailable && (
                      <span className="px-2 py-1 text-xs bg-red-500/10 text-red-500 rounded">
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="font-medium mb-2">{amenity.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {amenity.location.zone} • {amenity.location.floor}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
