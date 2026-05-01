import { NextRequest, NextResponse } from "next/server";
import { searchHotels } from "@/lib/serpapi";
import type { HotelsAPIRequest } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: HotelsAPIRequest = await request.json();
    const {
      destination,
      checkIn,
      checkOut,
      adults = 1,
      currency = "USD",
    } = body;

    if (!destination || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Missing required fields: destination, checkIn, checkOut" },
        { status: 400 }
      );
    }

    const hotels = await searchHotels(
      destination,
      checkIn,
      checkOut,
      adults,
      currency
    );

    return NextResponse.json({ hotels }, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("Hotels API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch hotels. Please try again." },
      { status: 500 }
    );
  }
}
