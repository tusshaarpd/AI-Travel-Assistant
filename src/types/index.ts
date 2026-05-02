export type ConversationStage =
  | "greeting"
  | "collect_source"
  | "collect_destination"
  | "collect_dates"
  | "collect_budget"
  | "collect_style"
  | "confirming"
  | "generating"
  | "results"
  | "error";

export type TravelStyle =
  | "adventure"
  | "relaxing"
  | "cultural"
  | "family"
  | "luxury"
  | "budget"
  | "romantic"
  | "business"
  | "eco"
  | "foodie";

export interface TravelInfo {
  source?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  budget?: number;
  currency?: string;
  travelers?: number;
  travelStyle?: TravelStyle[];
  preferences?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface FlightOption {
  id: string;
  airline: string;
  airlineLogo?: string;
  flightNumber: string;
  departure: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  duration: string;
  stops: number;
  stopDetails?: string[];
  price: number;
  currency: string;
  cabinClass: string;
  bookingUrl?: string;
  isReturn?: boolean;
}

export interface HotelOption {
  id: string;
  name: string;
  image?: string;
  rating: number;
  reviewScore: number;
  reviewCount: number;
  location: string;
  distanceFromCenter?: string;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  amenities: string[];
  description?: string;
  bookingUrl?: string;
  category: string;
}

export interface DayItinerary {
  day: number;
  date: string;
  title: string;
  theme: string;
  morning: ItineraryActivity[];
  afternoon: ItineraryActivity[];
  evening: ItineraryActivity[];
  meals: {
    breakfast?: MealRecommendation;
    lunch?: MealRecommendation;
    dinner?: MealRecommendation;
  };
  tips?: string[];
  estimatedDailyCost: number;
}

export interface ItineraryActivity {
  name: string;
  description: string;
  duration: string;
  cost?: number;
  type: "attraction" | "activity" | "transport" | "shopping" | "nature" | "cultural";
  address?: string;
  tips?: string;
  bookingRequired?: boolean;
}

export interface MealRecommendation {
  restaurant: string;
  cuisine: string;
  priceRange: string;
  specialty?: string;
  address?: string;
}

export interface CostBreakdown {
  flights: number;
  accommodation: number;
  activities: number;
  meals: number;
  transport: number;
  miscellaneous: number;
  total: number;
  currency: string;
  withinBudget: boolean;
  budgetDifference: number;
}

export interface ItineraryOption {
  id: string;
  name: string;
  description: string;
  emoji: string;
  days: DayItinerary[];
}

export interface TravelPlan {
  travelInfo: TravelInfo;
  outboundFlights: FlightOption[];
  returnFlights: FlightOption[];
  hotels: HotelOption[];
  itineraries: ItineraryOption[];
  costBreakdown: CostBreakdown;
  generalTips: string[];
  bestTimeToVisit?: string;
  weatherInfo?: string;
  visaInfo?: string;
  emergencyContacts?: {
    police: string;
    ambulance: string;
    embassy?: string;
  };
}

export interface ChatAPIRequest {
  messages: Array<{ role: string; content: string }>;
  travelInfo: TravelInfo;
  stage: ConversationStage;
  userMessage: string;
}

export interface ChatAPIResponse {
  message: string;
  nextStage: ConversationStage;
  updatedTravelInfo: TravelInfo;
  readyToGenerate?: boolean;
}

export interface FlightsAPIRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  currency?: string;
}

export interface HotelsAPIRequest {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  budget?: number;
  currency?: string;
}

export interface ItineraryAPIRequest {
  travelInfo: TravelInfo;
  selectedFlight?: FlightOption;
  selectedHotel?: HotelOption;
}
