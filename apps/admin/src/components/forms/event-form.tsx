"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button, Input } from "@/components/ui";
import type { Event, EventCreate } from "@eventpilot/types";
import { createEvent, updateEvent } from "@eventpilot/firebase/queries/events";

interface EventFormProps {
  event?: Event;
  onSuccess?: () => void;
}

export function EventForm({ event, onSuccess }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: event?.name || "",
    description: event?.description || "",
    venue: event?.venue || "",
    startDate: event?.startDate
      ? new Date(event.startDate).toISOString().slice(0, 16)
      : "",
    endDate: event?.endDate
      ? new Date(event.endDate).toISOString().slice(0, 16)
      : "",
    wifiSsid: event?.wifiDetails?.ssid || "",
    wifiPassword: event?.wifiDetails?.password || "",
    status: event?.status || "draft",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const eventData: EventCreate = {
        name: formData.name,
        description: formData.description,
        venue: formData.venue,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        status: formData.status as "draft" | "active" | "completed" | "cancelled",
        wifiDetails: formData.wifiSsid
          ? {
              ssid: formData.wifiSsid,
              password: formData.wifiPassword,
            }
          : null,
      };

      if (event) {
        await updateEvent(event.id, eventData);
      } else {
        await createEvent(eventData);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Failed to save event. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{event ? "Edit Event" : "Create New Event"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Event Name *
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={loading}
              placeholder="Tech Conference 2026"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              disabled={loading}
              className="w-full min-h-[100px] px-3 py-2 border rounded-md"
              placeholder="A conference about emerging technologies..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="venue" className="text-sm font-medium">
              Venue *
            </label>
            <Input
              id="venue"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              required
              disabled={loading}
              placeholder="Convention Center, Downtown"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startDate" className="text-sm font-medium">
                Start Date & Time *
              </label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="endDate" className="text-sm font-medium">
                End Date & Time *
              </label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "active" | "completed" | "cancelled" })}
              disabled={loading}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-4">WiFi Details (Optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="wifiSsid" className="text-sm font-medium">
                  WiFi Network Name
                </label>
                <Input
                  id="wifiSsid"
                  value={formData.wifiSsid}
                  onChange={(e) =>
                    setFormData({ ...formData, wifiSsid: e.target.value })
                  }
                  disabled={loading}
                  placeholder="EventWiFi"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="wifiPassword" className="text-sm font-medium">
                  WiFi Password
                </label>
                <Input
                  id="wifiPassword"
                  value={formData.wifiPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, wifiPassword: e.target.value })
                  }
                  disabled={loading}
                  placeholder="password123"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : event ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
