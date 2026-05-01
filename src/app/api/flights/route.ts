import { NextRequest, NextResponse } from "next/server";
import { searchFlights } from "@/lib/serpapi";
import type { FlightsAPIRequest } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: FlightsAPIRequest = await request.json();
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults = 1,
      currency = "USD",
    } = body;

    if (!origin || !destination || !departureDate) {
      return NextResponse.json(
        { error: "Missing required fields: origin, destination, departureDate" },
        { status: 400 }
      );
    }

    const flights = await searchFlights(
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      currency
    );

    return NextResponse.json(flights, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("Flights API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch flights. Please try again." },
      { status: 500 }
    );
  }
}
