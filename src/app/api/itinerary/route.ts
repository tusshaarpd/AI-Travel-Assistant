import { NextRequest, NextResponse } from "next/server";
import { generateItinerary } from "@/lib/openai";
import { searchFlights, searchHotels } from "@/lib/serpapi";
import type { ItineraryAPIRequest, TravelPlan } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: ItineraryAPIRequest = await request.json();
    const { travelInfo } = body;

    if (!travelInfo.source || !travelInfo.destination || !travelInfo.departureDate) {
      return NextResponse.json(
        { error: "Missing required travel information" },
        { status: 400 }
      );
    }

    const [flightsResult, hotelsResult, itineraryResult] = await Promise.allSettled([
      searchFlights(
        travelInfo.source,
        travelInfo.destination,
        travelInfo.departureDate,
        travelInfo.returnDate,
        travelInfo.travelers || 1,
        travelInfo.currency || "USD"
      ),
      searchHotels(
        travelInfo.destination,
        travelInfo.departureDate,
        travelInfo.returnDate || travelInfo.departureDate,
        travelInfo.travelers || 1,
        travelInfo.currency || "USD"
      ),
      generateItinerary(travelInfo as Record<string, unknown>),
    ]);

    const flights =
      flightsResult.status === "fulfilled"
        ? flightsResult.value
        : { outbound: [], returning: [] };

    const hotels =
      hotelsResult.status === "fulfilled" ? hotelsResult.value : [];

    let itineraryData = {
      itinerary: [],
      generalTips: [],
      costBreakdown: {
        flights: 0,
        accommodation: 0,
        activities: 0,
        meals: 0,
        transport: 0,
        miscellaneous: 0,
        total: 0,
        currency: travelInfo.currency || "USD",
        withinBudget: true,
        budgetDifference: 0,
      },
    };

    if (itineraryResult.status === "fulfilled") {
      try {
        itineraryData = JSON.parse(itineraryResult.value);
      } catch {
        console.error("Failed to parse itinerary JSON");
      }
    }

    const travelPlan: TravelPlan = {
      travelInfo,
      outboundFlights: flights.outbound,
      returnFlights: flights.returning,
      hotels: Array.isArray(hotels) ? hotels : (hotels as { hotels: typeof hotels }).hotels || [],
      itinerary: itineraryData.itinerary || [],
      costBreakdown: itineraryData.costBreakdown,
      generalTips: itineraryData.generalTips || [],
      bestTimeToVisit: (itineraryData as Record<string, unknown>).bestTimeToVisit as string | undefined,
      weatherInfo: (itineraryData as Record<string, unknown>).weatherInfo as string | undefined,
      visaInfo: (itineraryData as Record<string, unknown>).visaInfo as string | undefined,
    };

    return NextResponse.json(travelPlan);
  } catch (error) {
    console.error("Itinerary API error:", error);
    return NextResponse.json(
      { error: "Failed to generate travel plan. Please try again." },
      { status: 500 }
    );
  }
}
