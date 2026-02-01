"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { StallForm } from "@/components/forms/stall-form";
import { getStallById } from "@eventpilot/firebase/queries/stalls";
import type { Stall } from "@eventpilot/types";

export default function EditStallPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const stallId = params.stallId as string;

  const [stall, setStall] = useState<Stall | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStall = async () => {
      try {
        const data = await getStallById(eventId, stallId);
        setStall(data);
      } catch (error) {
        console.error("Error loading stall:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStall();
  }, [eventId, stallId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!stall) {
    return <div>Stall not found</div>;
  }

  return (
    <div className="max-w-3xl">
      <StallForm eventId={eventId} stall={stall} />
    </div>
  );
}
