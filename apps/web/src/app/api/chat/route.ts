import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { z } from "zod";
import {
  searchStalls,
  getStallsByCategory,
  getStallById,
} from "@eventpilot/firebase/queries/stalls";
import {
  getScheduleItems,
  getCurrentScheduleItems,
} from "@eventpilot/firebase/queries/schedule";
import {
  getAmenities,
} from "@eventpilot/firebase/queries/amenities";
import { getEventById } from "@eventpilot/firebase/queries/events";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, eventId } = await req.json();

    if (!eventId) {
      return new Response(
        JSON.stringify({ error: "Event ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = streamText({
      model: google("gemini-2.5-flash-lite"),
      messages,
      tools: {
        findStall: tool({
          description:
            "Search for stalls/booths by name or category at the event. Returns stall information including location, description, and current status.",
          inputSchema: z.object({
            searchTerm: z
              .string()
              .describe("The name or category of the stall to search for"),
          }),
          execute: async ({ searchTerm }) => {
            try {
              const searchLower = searchTerm.toLowerCase();

              // Try name search first
              let stalls = await searchStalls(eventId, searchLower);

              // If no results, try category search
              if (stalls.length === 0) {
                stalls = await getStallsByCategory(eventId, searchLower);
              }

              if (stalls.length === 0) {
                return {
                  success: false,
                  message: `No stalls found matching "${searchTerm}"`,
                };
              }

              return {
                success: true,
                stalls: stalls.map((stall) => ({
                  id: stall.id,
                  name: stall.name,
                  category: stall.category,
                  location: stall.location,
                  description: stall.description,
                  isCrowded: stall.isCrowded,
                  waitTimeMin: stall.waitTimeMin,
                  hasGiveaways: stall.hasGiveaways,
                  tags: stall.tags,
                })),
              };
            } catch (error) {
              return {
                success: false,
                message: "Error searching for stalls",
                error: error instanceof Error ? error.message : "Unknown error",
              };
            }
          },
        }),
        getDirections: tool({
          description:
            "Get navigation directions to a specific stall/booth at the event",
          inputSchema: z.object({
            stallId: z.string().describe("The ID of the stall to navigate to"),
          }),
          execute: async ({ stallId }) => {
            try {
              const stall = await getStallById(eventId, stallId);

              if (!stall) {
                return {
                  success: false,
                  message: `Stall with ID "${stallId}" not found`,
                };
              }

              return {
                success: true,
                directions: {
                  stallName: stall.name,
                  location: stall.location,
                },
              };
            } catch (error) {
              return {
                success: false,
                message: "Error getting directions",
                error: error instanceof Error ? error.message : "Unknown error",
              };
            }
          },
        }),
        getSchedule: tool({
          description:
            "Get the event schedule. Can filter by type (session, workshop, keynote, break, networking) or status (scheduled, ongoing, completed). Also shows what's currently happening.",
          inputSchema: z.object({
            type: z
              .enum(["session", "workshop", "keynote", "break", "networking", "other"])
              .optional()
              .describe("Filter by schedule item type"),
            currentOnly: z
              .boolean()
              .optional()
              .describe("Show only items happening right now"),
          }),
          execute: async ({ type, currentOnly }) => {
            try {
              let items;

              if (currentOnly) {
                items = await getCurrentScheduleItems(eventId);
              } else {
                items = await getScheduleItems(eventId, { type });
              }

              if (items.length === 0) {
                return {
                  success: false,
                  message: currentOnly
                    ? "No events are currently happening"
                    : "No schedule items found",
                };
              }

              return {
                success: true,
                scheduleItems: items.map((item) => ({
                  id: item.id,
                  type: item.type,
                  title: item.title,
                  description: item.description,
                  speaker: item.speaker,
                  location: item.location,
                  startTime: item.startTime.toISOString(),
                  endTime: item.endTime.toISOString(),
                  status: item.status,
                })),
              };
            } catch (error) {
              return {
                success: false,
                message: "Error fetching schedule",
                error: error instanceof Error ? error.message : "Unknown error",
              };
            }
          },
        }),
        findAmenity: tool({
          description:
            "Find amenities at the event like restrooms, ATMs, food areas, first aid, parking, charging stations, etc.",
          inputSchema: z.object({
            type: z
              .enum([
                "restroom",
                "atm",
                "food",
                "firstAid",
                "parking",
                "charging",
                "wifi",
                "other",
              ])
              .optional()
              .describe("Type of amenity to find"),
            accessibleOnly: z
              .boolean()
              .optional()
              .describe("Show only wheelchair accessible amenities"),
          }),
          execute: async ({ type, accessibleOnly }) => {
            try {
              const amenities = await getAmenities(eventId, {
                type,
                isAccessible: accessibleOnly,
              });

              if (amenities.length === 0) {
                return {
                  success: false,
                  message: type
                    ? `No ${type} amenities found`
                    : "No amenities found",
                };
              }

              return {
                success: true,
                amenities: amenities.map((amenity) => ({
                  id: amenity.id,
                  type: amenity.type,
                  name: amenity.name,
                  location: amenity.location,
                  isAccessible: amenity.isAccessible,
                  isAvailable: amenity.isAvailable,
                })),
              };
            } catch (error) {
              return {
                success: false,
                message: "Error finding amenities",
                error: error instanceof Error ? error.message : "Unknown error",
              };
            }
          },
        }),
        getEventInfo: tool({
          description:
            "Get general event information like WiFi details, venue name, event description, and dates",
          inputSchema: z.object({}),
          execute: async () => {
            try {
              const event = await getEventById(eventId);

              if (!event) {
                return {
                  success: false,
                  message: "Event not found",
                };
              }

              return {
                success: true,
                event: {
                  name: event.name,
                  description: event.description,
                  venue: event.venue,
                  startDate: event.startDate.toISOString(),
                  endDate: event.endDate.toISOString(),
                  wifiDetails: event.wifiDetails,
                },
              };
            } catch (error) {
              return {
                success: false,
                message: "Error getting event info",
                error: error instanceof Error ? error.message : "Unknown error",
              };
            }
          },
        }),
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
