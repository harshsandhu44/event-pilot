"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@eventpilot/ui";
import { Button, Input } from "@eventpilot/ui";
import type { Stall, StallCreate } from "@eventpilot/types";
import { createStall, updateStall } from "@eventpilot/firebase/queries/stalls";

interface StallFormProps {
  eventId: string;
  stall?: Stall;
  onSuccess?: () => void;
}

export function StallForm({ eventId, stall, onSuccess }: StallFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: stall?.name || "",
    category: stall?.category || "",
    description: stall?.description || "",
    zone: stall?.location.zone || "",
    floor: stall?.location.floor || "",
    landmarks: stall?.location.landmarks.join(", ") || "",
    lat: stall?.location.coordinates.lat.toString() || "0",
    lng: stall?.location.coordinates.lng.toString() || "0",
    tags: stall?.tags.join(", ") || "",
    isCrowded: stall?.isCrowded || false,
    waitTimeMin: stall?.waitTimeMin?.toString() || "",
    hasGiveaways: stall?.hasGiveaways || false,
    status: stall?.status || "active",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const stallData: StallCreate = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        location: {
          zone: formData.zone,
          floor: formData.floor,
          landmarks: formData.landmarks
            .split(",")
            .map((l) => l.trim())
            .filter((l) => l),
          coordinates: {
            lat: parseFloat(formData.lat),
            lng: parseFloat(formData.lng),
          },
        },
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
        isCrowded: formData.isCrowded,
        waitTimeMin: formData.waitTimeMin ? parseInt(formData.waitTimeMin) : undefined,
        hasGiveaways: formData.hasGiveaways,
        status: formData.status as "active" | "inactive" | "closed",
      };

      if (stall) {
        await updateStall(eventId, stall.id, stallData);
      } else {
        await createStall(eventId, stallData);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/dashboard/events/${eventId}`);
      }
    } catch (err) {
      setError("Failed to save stall. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{stall ? "Edit Stall" : "Add New Stall"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Stall Name *
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={loading}
              placeholder="Tech Corp Booth"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category *
            </label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              disabled={loading}
              placeholder="Technology, Food, Sponsors"
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
              placeholder="Showcasing innovative AI solutions..."
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-4">Location Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="zone" className="text-sm font-medium">
                  Zone *
                </label>
                <Input
                  id="zone"
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="Hall A"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="floor" className="text-sm font-medium">
                  Floor *
                </label>
                <Input
                  id="floor"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="Ground Floor"
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <label htmlFor="landmarks" className="text-sm font-medium">
                Landmarks (comma-separated)
              </label>
              <Input
                id="landmarks"
                value={formData.landmarks}
                onChange={(e) =>
                  setFormData({ ...formData, landmarks: e.target.value })
                }
                disabled={loading}
                placeholder="Near entrance, Next to food court"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label htmlFor="lat" className="text-sm font-medium">
                  Latitude
                </label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lng" className="text-sm font-medium">
                  Longitude
                </label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-4">Additional Info</h3>

            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium">
                Tags (comma-separated)
              </label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                disabled={loading}
                placeholder="AI, Machine Learning, Demos"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isCrowded}
                    onChange={(e) =>
                      setFormData({ ...formData, isCrowded: e.target.checked })
                    }
                    disabled={loading}
                  />
                  <span className="text-sm font-medium">Is Crowded</span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasGiveaways}
                    onChange={(e) =>
                      setFormData({ ...formData, hasGiveaways: e.target.checked })
                    }
                    disabled={loading}
                  />
                  <span className="text-sm font-medium">Has Giveaways</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label htmlFor="waitTimeMin" className="text-sm font-medium">
                  Wait Time (minutes)
                </label>
                <Input
                  id="waitTimeMin"
                  type="number"
                  value={formData.waitTimeMin}
                  onChange={(e) =>
                    setFormData({ ...formData, waitTimeMin: e.target.value })
                  }
                  disabled={loading}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as "active" | "inactive" | "closed" })
                  }
                  disabled={loading}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="closed">Closed</option>
                </select>
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
              {loading ? "Saving..." : stall ? "Update Stall" : "Add Stall"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
