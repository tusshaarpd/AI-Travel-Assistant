import { NextRequest, NextResponse } from "next/server";
import { generateItinerary } from "@/lib/openai";
import { searchFlights, searchHotels } from "@/lib/serpapi";
import type { ItineraryAPIRequest, TravelPlan } from "@/types";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    ),
  ]);
}

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
      withTimeout(
        searchFlights(
          travelInfo.source,
          travelInfo.destination,
          travelInfo.departureDate,
          travelInfo.returnDate,
          travelInfo.travelers || 1,
          travelInfo.currency || "USD"
        ),
        12000
      ),
      withTimeout(
        searchHotels(
          travelInfo.destination,
          travelInfo.departureDate,
          travelInfo.returnDate || travelInfo.departureDate,
          travelInfo.travelers || 1,
          travelInfo.currency || "USD"
        ),
        12000
      ),
      withTimeout(
        generateItinerary(travelInfo as Record<string, unknown>),
        45000
      ),
    ]);

    if (flightsResult.status === "rejected") {
      const reason = flightsResult.reason instanceof Error ? flightsResult.reason.message : String(flightsResult.reason);
      console.error("Flight search rejected:", reason);
      return NextResponse.json(
        { error: `Flight search failed: ${reason}` },
        { status: 502 }
      );
    }

    if (hotelsResult.status === "rejected") {
      const reason = hotelsResult.reason instanceof Error ? hotelsResult.reason.message : String(hotelsResult.reason);
      console.error("Hotel search rejected:", reason);
      return NextResponse.json(
        { error: `Hotel search failed: ${reason}` },
        { status: 502 }
      );
    }

    if (itineraryResult.status === "rejected") {
      const reason = itineraryResult.reason instanceof Error ? itineraryResult.reason.message : String(itineraryResult.reason);
      return NextResponse.json(
        { error: `Itinerary generation failed: ${reason}` },
        { status: 502 }
      );
    }

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

    try {
      itineraryData = JSON.parse(itineraryResult.value);
    } catch {
      console.error("Failed to parse itinerary JSON");
    }

    // Overwrite AI-estimated costs with real prices from the APIs
    const outboundFlights = flightsResult.value.outbound;
    const returnFlights = flightsResult.value.returning;
    const hotels = hotelsResult.value;

    const cheapestOutbound = outboundFlights.length
      ? Math.min(...outboundFlights.map((f) => f.price))
      : 0;
    const cheapestReturn = returnFlights.length
      ? Math.min(...returnFlights.map((f) => f.price))
      : 0;
    const travelers = travelInfo.travelers || 1;
    const realFlightCost = (cheapestOutbound + cheapestReturn) * travelers;

    const cheapestHotel = hotels.length
      ? hotels.reduce((a, b) => (a.totalPrice < b.totalPrice ? a : b))
      : null;
    const realAccommodationCost = cheapestHotel?.totalPrice ?? 0;

    const aiBreakdown = (itineraryData.costBreakdown ?? {}) as Record<string, unknown>;
    const activities = (aiBreakdown.activities as number) ?? 0;
    const meals = (aiBreakdown.meals as number) ?? 0;
    const transport = (aiBreakdown.transport as number) ?? 0;
    const miscellaneous = (aiBreakdown.miscellaneous as number) ?? 0;

    const realTotal = realFlightCost + realAccommodationCost + activities + meals + transport + miscellaneous;
    const budget = travelInfo.budget ?? 0;

    const costBreakdown = {
      flights: realFlightCost,
      accommodation: realAccommodationCost,
      activities,
      meals,
      transport,
      miscellaneous,
      total: realTotal,
      currency: travelInfo.currency || "USD",
      withinBudget: budget > 0 ? realTotal <= budget : true,
      budgetDifference: budget > 0 ? budget - realTotal : 0,
    };

    const raw = itineraryData as Record<string, unknown>;

    const travelPlan: TravelPlan = {
      travelInfo,
      outboundFlights,
      returnFlights,
      hotels,
      itineraries: (raw.itineraries as TravelPlan["itineraries"]) || [],
      costBreakdown,
      generalTips: (raw.generalTips as string[]) || [],
      bestTimeToVisit: raw.bestTimeToVisit as string | undefined,
      weatherInfo: raw.weatherInfo as string | undefined,
      visaInfo: raw.visaInfo as string | undefined,
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
