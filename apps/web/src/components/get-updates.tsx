"use client";

import { useEffect, useState } from "react";
import { Button } from "@eventpilot/ui";
import { Bell, BellOff, Clock, MapPin } from "lucide-react";
import { useEvent } from "@/hooks/useEvent";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "@eventpilot/firebase/client";
import type { ScheduleItem } from "@eventpilot/types";

export function GetUpdates() {
  const { currentEvent } = useEvent();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [currentItems, setCurrentItems] = useState<ScheduleItem[]>([]);
  const [upcomingItems, setUpcomingItems] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    if (!currentEvent) return;

    const now = new Date();

    // Subscribe to currently ongoing items
    const currentQuery = query(
      collection(db, 'events', currentEvent.id, 'schedule'),
      where('status', '==', 'ongoing'),
      orderBy('startTime'),
      limit(5)
    );

    const unsubscribeCurrent = onSnapshot(currentQuery, (snapshot) => {
      const items = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type,
          title: data.title,
          description: data.description,
          speaker: data.speaker || [],
          location: data.location,
          startTime: data.startTime?.toDate() || now,
          endTime: data.endTime?.toDate() || now,
          status: data.status,
          createdAt: data.createdAt?.toDate() || now,
          updatedAt: data.updatedAt?.toDate() || now,
        } as ScheduleItem;
      });
      setCurrentItems(items);
    });

    // Subscribe to upcoming scheduled items
    const upcomingQuery = query(
      collection(db, 'events', currentEvent.id, 'schedule'),
      where('status', '==', 'scheduled'),
      where('startTime', '>=', now),
      orderBy('startTime'),
      limit(5)
    );

    const unsubscribeUpcoming = onSnapshot(upcomingQuery, (snapshot) => {
      const items = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type,
          title: data.title,
          description: data.description,
          speaker: data.speaker || [],
          location: data.location,
          startTime: data.startTime?.toDate() || now,
          endTime: data.endTime?.toDate() || now,
          status: data.status,
          createdAt: data.createdAt?.toDate() || now,
          updatedAt: data.updatedAt?.toDate() || now,
        } as ScheduleItem;
      });
      setUpcomingItems(items);
    });

    return () => {
      unsubscribeCurrent();
      unsubscribeUpcoming();
    };
  }, [currentEvent]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // In a real app, you'd request notification permissions here
  };

  if (!currentEvent) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">No event selected</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Live Event Updates</h3>
        <Button
          variant={notificationsEnabled ? "default" : "outline"}
          size="sm"
          onClick={toggleNotifications}
          className="gap-2"
        >
          {notificationsEnabled ? (
            <>
              <Bell className="h-4 w-4" />
              Enabled
            </>
          ) : (
            <>
              <BellOff className="h-4 w-4" />
              Enable Notifications
            </>
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {currentItems.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Happening Now
            </h4>
            <div className="space-y-2">
              {currentItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 border rounded-lg bg-primary/5 border-primary/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded">
                          {item.type}
                        </span>
                        <span className="text-xs text-muted-foreground">LIVE</span>
                      </div>
                      <h5 className="font-medium text-sm truncate">{item.title}</h5>
                      {item.speaker.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.speaker.join(", ")}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(item.startTime)} - {formatTime(item.endTime)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.location.zone}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcomingItems.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Coming Up
            </h4>
            <div className="space-y-2">
              {upcomingItems.map((item) => (
                <div key={item.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded">
                          {item.type}
                        </span>
                      </div>
                      <h5 className="font-medium text-sm truncate">{item.title}</h5>
                      {item.speaker.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.speaker.join(", ")}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(item.startTime)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.location.zone}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentItems.length === 0 && upcomingItems.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">No updates available</p>
              <p className="text-sm text-muted-foreground">
                Check back later for event updates
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
