import type { FlightOption, HotelOption } from "@/types";

const SERPAPI_BASE = "https://serpapi.com/search";

// City name → primary IATA airport code
const CITY_TO_IATA: Record<string, string> = {
  // North America
  "new york": "JFK", "nyc": "JFK", "new york city": "JFK",
  "los angeles": "LAX", "la": "LAX",
  "chicago": "ORD",
  "houston": "IAH",
  "dallas": "DFW",
  "miami": "MIA",
  "san francisco": "SFO", "sf": "SFO",
  "seattle": "SEA",
  "boston": "BOS",
  "atlanta": "ATL",
  "denver": "DEN",
  "las vegas": "LAS",
  "orlando": "MCO",
  "washington": "IAD", "washington dc": "IAD", "dc": "IAD",
  "philadelphia": "PHL",
  "phoenix": "PHX",
  "minneapolis": "MSP",
  "detroit": "DTW",
  "toronto": "YYZ",
  "vancouver": "YVR",
  "montreal": "YUL",
  "mexico city": "MEX",
  "cancun": "CUN",

  // Europe
  "london": "LHR",
  "paris": "CDG",
  "amsterdam": "AMS",
  "frankfurt": "FRA",
  "madrid": "MAD",
  "barcelona": "BCN",
  "rome": "FCO",
  "milan": "MXP",
  "munich": "MUC",
  "zurich": "ZRH",
  "vienna": "VIE",
  "brussels": "BRU",
  "lisbon": "LIS",
  "athens": "ATH",
  "istanbul": "IST",
  "dubai": "DXB",
  "abu dhabi": "AUH",
  "doha": "DOH",

  // Asia
  "tokyo": "NRT",
  "osaka": "KIX",
  "beijing": "PEK",
  "shanghai": "PVG",
  "hong kong": "HKG",
  "singapore": "SIN",
  "seoul": "ICN",
  "bangkok": "BKK",
  "kuala lumpur": "KUL",
  "jakarta": "CGK",
  "manila": "MNL",
  "taipei": "TPE",
  "delhi": "DEL", "new delhi": "DEL",
  "mumbai": "BOM",
  "bangalore": "BLR",
  "chennai": "MAA",
  "kolkata": "CCU",
  "hyderabad": "HYD",
  "ahmedabad": "AMD",
  "cochin": "COK", "kochi": "COK",

  // Oceania
  "sydney": "SYD",
  "melbourne": "MEL",
  "brisbane": "BNE",
  "auckland": "AKL",

  // Africa / Middle East
  "johannesburg": "JNB",
  "cape town": "CPT",
  "cairo": "CAI",
  "nairobi": "NBO",
  "tel aviv": "TLV",
  "riyadh": "RUH",

  // Southeast Asia & Pacific
  "bali": "DPS", "denpasar": "DPS",
  "phuket": "HKT",
  "chiang mai": "CNX",
  "ho chi minh city": "SGN", "saigon": "SGN",
  "hanoi": "HAN",
  "phnom penh": "PNH",
  "vientiane": "VTE",
  "yangon": "RGN", "rangoon": "RGN",
  "colombo": "CMB",
  "kathmandu": "KTM",
  "maldives": "MLE", "male": "MLE",
  "papeete": "PPT", "tahiti": "PPT",
  "nadi": "NAN", "fiji": "NAN",

  // Country-level fallbacks (map to primary gateway airport)
  "nepal": "KTM",
  "thailand": "BKK",
  "indonesia": "CGK",
  "japan": "NRT",
  "china": "PEK",
  "india": "DEL",
  "australia": "SYD",
  "france": "CDG",
  "germany": "FRA",
  "spain": "MAD",
  "italy": "FCO",
  "uk": "LHR", "united kingdom": "LHR", "england": "LHR",
  "usa": "JFK", "united states": "JFK", "america": "JFK",
  "canada": "YYZ",
  "brazil": "GRU", "sao paulo": "GRU",
  "argentina": "EZE", "buenos aires": "EZE",
  "south africa": "JNB",
  "egypt": "CAI",
  "kenya": "NBO",
  "uae": "DXB", "emirates": "DXB",
  "qatar": "DOH",
  "saudi arabia": "RUH",
  "israel": "TLV",
  "sri lanka": "CMB",
  "malaysia": "KUL",
  "philippines": "MNL",
  "vietnam": "SGN",
  "cambodia": "PNH",
  "myanmar": "RGN",
  "laos": "VTE",
  "taiwan": "TPE",
  "south korea": "ICN", "korea": "ICN",
  "new zealand": "AKL",
  "mexico": "MEX",
  "greece": "ATH",
  "turkey": "IST",
  "portugal": "LIS",
  "netherlands": "AMS", "holland": "AMS",
  "switzerland": "ZRH",
  "austria": "VIE",
  "belgium": "BRU",
};

function resolveIATA(cityOrCode: string): string {
  const normalized = cityOrCode.trim().toLowerCase();
  if (/^[a-z]{3}$/i.test(normalized)) return cityOrCode.toUpperCase();
  const mapped = CITY_TO_IATA[normalized];
  if (mapped) return mapped;
  throw new Error(
    `Could not find an airport for "${cityOrCode}". Please provide a city name (e.g. "Kathmandu") or a 3-letter IATA code (e.g. "KTM").`
  );
}

async function fetchSerpAPI(params: Record<string, string>): Promise<Record<string, unknown>> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    throw new Error("SERPAPI_KEY environment variable is not set");
  }

  // engine must come first; api_key and no_cache appended at the end
  const { engine, ...rest } = params;
  const searchParams = new URLSearchParams({
    engine,
    ...rest,
    no_cache: "true",
    api_key: apiKey,
  });

  const url = `${SERPAPI_BASE}?${searchParams.toString()}`;

  // Log URL without the key so it's visible in Vercel logs for debugging
  const debugUrl = url.replace(apiKey, "***");
  console.log("[SerpAPI] GET", debugUrl);

  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const body = await response.json();
      errorDetail = (body as Record<string, unknown>).error as string || errorDetail;
    } catch {
      // ignore parse failure
    }
    console.error("[SerpAPI] Error:", response.status, errorDetail, "| URL:", debugUrl);
    throw new Error(`SerpAPI: ${errorDetail}`);
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
  const originCode = resolveIATA(origin);
  const destinationCode = resolveIATA(destination);

  const params: Record<string, string> = {
    engine: "google_flights",
    departure_id: originCode,
    arrival_id: destinationCode,
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
    originCode,
    destinationCode,
    departureDate,
    currency,
    false
  );

  let returningFlights: FlightOption[] = [];
  if (returnDate && data.return_flights) {
    returningFlights = parseFlightResults(
      data.return_flights as unknown[],
      destinationCode,
      originCode,
      returnDate,
      currency,
      true
    );
  }

  return { outbound: outboundFlights.slice(0, 5), returning: returningFlights.slice(0, 5) };
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

    const depAirport = firstLeg.departure_airport as Record<string, unknown> | undefined;
    const arrAirport = lastLeg.arrival_airport as Record<string, unknown> | undefined;

    return {
      id: `flight-${isReturn ? "r" : "o"}-${index}`,
      airline: (firstLeg.airline as string) || "Unknown Airline",
      airlineLogo: (firstLeg.airline_logo as string) || undefined,
      flightNumber: (firstLeg.flight_number as string) || "",
      departure: {
        airport: (depAirport?.id as string) || origin,
        city: (depAirport?.name as string) || origin,
        time: (depAirport?.time as string) || "",
        date,
      },
      arrival: {
        airport: (arrAirport?.id as string) || destination,
        city: (arrAirport?.name as string) || destination,
        time: (arrAirport?.time as string) || "",
        date: getArrivalDate(date, depAirport?.time as string, arrAirport?.time as string),
      },
      duration: formatDuration((f.total_duration as number) || 0),
      stops: Math.max(0, legs.length - 1),
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
    const pricePerNight =
      (h.rate_per_night as Record<string, unknown>)?.extracted_lowest as number || 0;

    return {
      id: `hotel-${index}`,
      name: (h.name as string) || "Unknown Hotel",
      image:
        (h.images as Record<string, unknown>[])?.[0]?.thumbnail as string || undefined,
      rating: (h.hotel_class as number) || 3,
      reviewScore: (h.overall_rating as number) || 0,
      reviewCount: (h.reviews as number) || 0,
      location: (h.neighborhood as string) || (h.location as string) || "",
      distanceFromCenter:
        (
          h.nearby_places as Array<{
            transportations?: Array<{ duration?: string }>;
          }>
        )?.[0]?.transportations?.[0]?.duration || undefined,
      pricePerNight,
      totalPrice: pricePerNight * nights,
      currency,
      amenities: ((h.amenities as string[]) || []).slice(0, 6),
      description: (h.description as string) || undefined,
      bookingUrl: (h.link as string) || undefined,
      category: getHotelCategory((h.hotel_class as number) || 3),
    };
  });
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

function getArrivalDate(depDate: string, depTime: string, arrTime: string): string {
  if (depTime && arrTime && arrTime < depTime) return getNextDay(depDate);
  return depDate;
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
