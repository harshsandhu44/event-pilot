import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { db } from "@eventpilot/firebase/client";
import { collection, query, where, getDocs } from "firebase/firestore";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: google("gemini-2.5-flash-lite"),
      messages,
      tools: {
        findStall: tool({
          description:
            "Search for stalls by name or category at the event. Returns stall information including location, description, and offerings.",
          inputSchema: z.object({
            searchTerm: z
              .string()
              .describe("The name or category of the stall to search for"),
          }),
          execute: async ({ searchTerm }) => {
            try {
              const stallsRef = collection(db, "stalls");
              const searchLower = searchTerm.toLowerCase();

              // Query for name match
              const nameQuery = query(
                stallsRef,
                where("nameLower", ">=", searchLower),
                where("nameLower", "<=", searchLower + "\uf8ff"),
              );

              // Query for category match
              const categoryQuery = query(
                stallsRef,
                where("category", "==", searchLower),
              );

              const [nameSnapshot, categorySnapshot] = await Promise.all([
                getDocs(nameQuery),
                getDocs(categoryQuery),
              ]);

              const results = new Map();

              nameSnapshot.forEach((doc) => {
                results.set(doc.id, { id: doc.id, ...doc.data() });
              });

              categorySnapshot.forEach((doc) => {
                results.set(doc.id, { id: doc.id, ...doc.data() });
              });

              const stalls = Array.from(results.values());

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
            "Get navigation directions to a specific stall at the event",
          inputSchema: z.object({
            stallId: z.string().describe("The ID of the stall to navigate to"),
          }),
          execute: async ({ stallId }) => {
            try {
              const stallsRef = collection(db, "stalls");
              const stallQuery = query(stallsRef, where("id", "==", stallId));
              const snapshot = await getDocs(stallQuery);

              if (snapshot.empty) {
                return {
                  success: false,
                  message: `Stall with ID "${stallId}" not found`,
                };
              }

              const stall = snapshot.docs[0].data();

              return {
                success: true,
                directions: {
                  stallName: stall.name,
                  location: stall.location,
                  directions: stall.directions || "Head to " + stall.location,
                  mapCoordinates: stall.coordinates,
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
      },
    );
  }
}
