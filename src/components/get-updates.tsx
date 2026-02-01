"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";

type Update = {
  id: string;
  timestamp: Date;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
};

export function GetUpdates() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const mockUpdates: Update[] = [
      {
        id: "1",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        title: "New Event Started",
        message: "The keynote presentation has begun in Hall A.",
        type: "info",
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        title: "Stall Opening",
        message: "Tech Demo Stall #42 is now open for visitors.",
        type: "success",
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        title: "Schedule Change",
        message: "Workshop in Room B has been rescheduled to 3 PM.",
        type: "warning",
      },
    ];
    setUpdates(mockUpdates);
  }, []);

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setNotificationsEnabled(true);
          new Notification("EventPilot", {
            body: "You will now receive event updates!",
            icon: "/icon.png",
          });
        }
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const getTypeColor = (type: Update["type"]) => {
    switch (type) {
      case "info":
        return "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700";
      case "warning":
        return "bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700";
      case "success":
        return "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);

    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full px-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b">
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-semibold">Event Updates</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Stay informed about event changes
          </p>
        </div>
        <Button
          variant={notificationsEnabled ? "default" : "outline"}
          size="sm"
          onClick={toggleNotifications}
          className="w-full sm:w-auto text-xs sm:text-sm h-9"
        >
          {notificationsEnabled ? (
            <>
              <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Enabled
            </>
          ) : (
            <>
              <BellOff className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Enable
            </>
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 sm:space-y-3">
        {updates.length === 0 ? (
          <div className="text-center text-muted-foreground py-6 sm:py-8 px-4">
            <p className="text-base sm:text-lg font-medium">No updates yet</p>
            <p className="text-xs sm:text-sm mt-2">
              Check back later for event announcements.
            </p>
          </div>
        ) : (
          updates.map((update) => (
            <div
              key={update.id}
              className={`p-3 sm:p-4 rounded-lg border ${getTypeColor(update.type)}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-xs sm:text-sm flex-1">{update.title}</h4>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTime(update.timestamp)}
                </span>
              </div>
              <p className="text-xs sm:text-sm">{update.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
