"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Event } from "@eventpilot/types";
import { getEvents, getActiveEvents } from "@eventpilot/firebase/queries/events";

interface EventContextType {
  currentEvent: Event | null;
  events: Event[];
  setCurrentEventId: (eventId: string) => void;
  loading: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);

        // Try to get active events first
        let allEvents = await getActiveEvents();

        // If no active events, get all events
        if (allEvents.length === 0) {
          allEvents = await getEvents();
        }

        setEvents(allEvents);

        // Check if there's a stored event ID
        const storedEventId = localStorage.getItem('selectedEventId');

        if (storedEventId) {
          const storedEvent = allEvents.find(e => e.id === storedEventId);
          if (storedEvent) {
            setCurrentEvent(storedEvent);
            return;
          }
        }

        // Auto-select first active event
        if (allEvents.length > 0) {
          setCurrentEvent(allEvents[0]);
          localStorage.setItem('selectedEventId', allEvents[0].id);
        }
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const setCurrentEventId = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setCurrentEvent(event);
      localStorage.setItem('selectedEventId', eventId);
    }
  };

  return (
    <EventContext.Provider value={{ currentEvent, events, setCurrentEventId, loading }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
}
