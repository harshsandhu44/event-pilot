"use client";

import { useParams } from "next/navigation";
import { StallForm } from "@/components/forms/stall-form";

export default function NewStallPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  return (
    <div className="max-w-3xl">
      <StallForm eventId={eventId} />
    </div>
  );
}
