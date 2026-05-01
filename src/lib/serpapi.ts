import type { FlightOption, HotelOption } from "@/types";

const SERPAPI_BASE = "https://serpapi.com/search";

async function fetchSerpAPI(params: Record<string, string>): Promise<Record<string, unknown>> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    throw new Error("SERPAPI_KEY environment variable is not set");
  }

  const searchParams = new URLSearchParams({
    ...params,
    api_key: apiKey,
    no_cache: "false",
  });

  const response = await fetch(`${SERPAPI_BASE}?${searchParams.toString()}`, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`SerpAPI request failed: ${response.statusText}`);
  }

  return response.json();
}

export async function searchFlights(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate?: string,
  adults = 1,
  currency = "USD"
): Promise<{ outbound: FlightOption[]; returning: FlightOption[] }> {
  try {
    const params: Record<string, string> = {
      engine: "google_flights",
      departure_id: origin,
      arrival_id: destination,
      outbound_date: departureDate,
      currency,
      adults: adults.toString(),
      hl: "en",
      type: returnDate ? "1" : "2",
    };

    if (returnDate) {
      params.return_date = returnDate;
    }

    const data = await fetchSerpAPI(params);

    const outboundFlights = parseFlightResults(
      (data.best_flights as unknown[]) || (data.other_flights as unknown[]) || [],
      origin,
      destination,
      departureDate,
      currency,
      false
    );

    let returningFlights: FlightOption[] = [];
    if (returnDate && data.return_flights) {
      returningFlights = parseFlightResults(
        data.return_flights as unknown[],
        destination,
        origin,
        returnDate,
        currency,
        true
      );
    }

    return { outbound: outboundFlights.slice(0, 5), returning: returningFlights.slice(0, 5) };
  } catch (error) {
    console.error("Flight search error:", error);
    return { outbound: getMockFlights(origin, destination, departureDate, currency, false), returning: returnDate ? getMockFlights(destination, origin, returnDate, currency, true) : [] };
  }
}

function parseFlightResults(
  flights: unknown[],
  origin: string,
  destination: string,
  date: string,
  currency: string,
  isReturn: boolean
): FlightOption[] {
  if (!Array.isArray(flights)) return [];

  return flights.slice(0, 5).map((flight: unknown, index) => {
    const f = flight as Record<string, unknown>;
    const legs = (f.flights as unknown[]) || [];
    const firstLeg = (legs[0] as Record<string, unknown>) || {};
    const lastLeg = (legs[legs.length - 1] as Record<string, unknown>) || firstLeg;

    return {
      id: `flight-${isReturn ? "r" : "o"}-${index}`,
      airline: (firstLeg.airline as string) || "Unknown Airline",
      airlineLogo: (firstLeg.airline_logo as string) || undefined,
      flightNumber: (firstLeg.flight_number as string) || `FL${Math.floor(Math.random() * 9000 + 1000)}`,
      departure: {
        airport: (firstLeg.departure_airport as Record<string, unknown>)?.id as string || origin,
        city: origin,
        time: (firstLeg.departure_airport as Record<string, unknown>)?.time as string || "08:00",
        date,
      },
      arrival: {
        airport: (lastLeg.arrival_airport as Record<string, unknown>)?.id as string || destination,
        city: destination,
        time: (lastLeg.arrival_airport as Record<string, unknown>)?.time as string || "16:00",
        date: (lastLeg.arrival_airport as Record<string, unknown>)?.time as string > "08:00" ? date : getNextDay(date),
      },
      duration: formatDuration((f.total_duration as number) || 480),
      stops: (legs.length - 1),
      price: (f.price as number) || 0,
      currency,
      cabinClass: "Economy",
      isReturn,
    };
  });
}

export async function searchHotels(
  destination: string,
  checkIn: string,
  checkOut: string,
  adults = 1,
  currency = "USD"
): Promise<HotelOption[]> {
  try {
    const data = await fetchSerpAPI({
      engine: "google_hotels",
      q: `hotels in ${destination}`,
      check_in_date: checkIn,
      check_out_date: checkOut,
      adults: adults.toString(),
      currency,
      hl: "en",
    });

    const properties = (data.properties as unknown[]) || [];
    return parseHotelResults(properties, checkIn, checkOut, currency).slice(0, 6);
  } catch (error) {
    console.error("Hotel search error:", error);
    return getMockHotels(destination, checkIn, checkOut, currency);
  }
}

function parseHotelResults(
  hotels: unknown[],
  checkIn: string,
  checkOut: string,
  currency: string
): HotelOption[] {
  if (!Array.isArray(hotels)) return [];

  const nights = calculateNights(checkIn, checkOut);

  return hotels.map((hotel: unknown, index) => {
    const h = hotel as Record<string, unknown>;
    const pricePerNight = (h.rate_per_night as Record<string, unknown>)?.extracted_lowest as number || 100;
    const amenities = extractAmenities(h.amenities as string[] || []);

    return {
      id: `hotel-${index}`,
      name: (h.name as string) || "Unknown Hotel",
      image: (h.images as Record<string, unknown>[])?.[0]?.thumbnail as string || undefined,
      rating: (h.hotel_class as number) || 3,
      reviewScore: (h.overall_rating as number) || 4.0,
      reviewCount: (h.reviews as number) || 0,
      location: (h.neighborhood as string) || (h.location as string) || "City Center",
      distanceFromCenter: ((h.nearby_places as Array<{ transportations?: Array<{ duration?: string }> }>)?.[0]?.transportations?.[0]?.duration) || undefined,
      pricePerNight,
      totalPrice: pricePerNight * nights,
      currency,
      amenities: amenities.slice(0, 6),
      description: (h.description as string) || undefined,
      bookingUrl: (h.link as string) || undefined,
      category: getHotelCategory((h.hotel_class as number) || 3),
    };
  });
}

function extractAmenities(amenities: string[]): string[] {
  const common = ["WiFi", "Pool", "Gym", "Restaurant", "Parking", "Spa", "Bar", "Room Service", "AC", "Breakfast"];
  if (!amenities || amenities.length === 0) {
    return common.slice(0, 4);
  }
  return amenities;
}

function getHotelCategory(stars: number): string {
  if (stars >= 5) return "Luxury";
  if (stars >= 4) return "Upper Upscale";
  if (stars >= 3) return "Upscale";
  return "Standard";
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function getNextDay(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
}

function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

function getMockFlights(
  origin: string,
  destination: string,
  date: string,
  currency: string,
  isReturn: boolean
): FlightOption[] {
  const airlines = [
    { name: "Delta Airlines", code: "DL" },
    { name: "United Airlines", code: "UA" },
    { name: "American Airlines", code: "AA" },
    { name: "Emirates", code: "EK" },
    { name: "Lufthansa", code: "LH" },
  ];

  return airlines.slice(0, 4).map((airline, i) => ({
    id: `mock-flight-${isReturn ? "r" : "o"}-${i}`,
    airline: airline.name,
    flightNumber: `${airline.code}${Math.floor(Math.random() * 900 + 100)}`,
    departure: {
      airport: origin.toUpperCase().slice(0, 3),
      city: origin,
      time: `${String(6 + i * 3).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`,
      date,
    },
    arrival: {
      airport: destination.toUpperCase().slice(0, 3),
      city: destination,
      time: `${String(14 + i * 2).padStart(2, "0")}:${i % 2 === 0 ? "30" : "00"}`,
      date,
    },
    duration: `${7 + i}h ${i * 15}m`,
    stops: i === 0 ? 0 : 1,
    price: 450 + i * 120 + Math.floor(Math.random() * 100),
    currency,
    cabinClass: "Economy",
    isReturn,
  }));
}

function getMockHotels(
  destination: string,
  checkIn: string,
  checkOut: string,
  currency: string
): HotelOption[] {
  const nights = calculateNights(checkIn, checkOut);
  const hotels = [
    { name: `Grand ${destination} Hotel`, stars: 5, price: 280, amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Concierge"] },
    { name: `${destination} Marriott`, stars: 4, price: 180, amenities: ["WiFi", "Pool", "Gym", "Restaurant", "Bar"] },
    { name: `Hilton ${destination}`, stars: 4, price: 200, amenities: ["WiFi", "Pool", "Gym", "Restaurant", "Business Center"] },
    { name: `${destination} Boutique Inn`, stars: 3, price: 110, amenities: ["WiFi", "Breakfast", "Garden", "Parking"] },
    { name: `City View Hotel ${destination}`, stars: 3, price: 90, amenities: ["WiFi", "Restaurant", "24h Desk"] },
    { name: `Budget Stay ${destination}`, stars: 2, price: 55, amenities: ["WiFi", "Parking", "AC"] },
  ];

  return hotels.map((h, i) => ({
    id: `mock-hotel-${i}`,
    name: h.name,
    rating: h.stars,
    reviewScore: 3.5 + h.stars * 0.2 + Math.random() * 0.5,
    reviewCount: Math.floor(Math.random() * 2000 + 100),
    location: `Central ${destination}`,
    pricePerNight: h.price,
    totalPrice: h.price * nights,
    currency,
    amenities: h.amenities,
    category: getHotelCategory(h.stars),
  }));
}
