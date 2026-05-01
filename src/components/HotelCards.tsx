"use client";

import { MapPin, Star, Wifi, Car, Coffee, Dumbbell, Waves, Utensils, Sparkles } from "lucide-react";
import type { HotelOption } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi className="w-3 h-3" />,
  pool: <Waves className="w-3 h-3" />,
  gym: <Dumbbell className="w-3 h-3" />,
  restaurant: <Utensils className="w-3 h-3" />,
  parking: <Car className="w-3 h-3" />,
  breakfast: <Coffee className="w-3 h-3" />,
  spa: <Sparkles className="w-3 h-3" />,
};

function getAmenityIcon(amenity: string): React.ReactNode {
  const lower = amenity.toLowerCase();
  for (const [key, icon] of Object.entries(AMENITY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return null;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "w-3 h-3",
            star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"
          )}
        />
      ))}
    </div>
  );
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "Luxury": return "bg-purple-100 text-purple-700";
    case "Upper Upscale": return "bg-blue-100 text-blue-700";
    case "Upscale": return "bg-teal-100 text-teal-700";
    default: return "bg-slate-100 text-slate-600";
  }
}

interface HotelCardsProps {
  hotels: HotelOption[];
  nights?: number;
  currency?: string;
  onSelect?: (hotel: HotelOption) => void;
  selectedHotelId?: string;
}

export function HotelCards({
  hotels,
  nights = 1,
  currency = "USD",
  onSelect,
  selectedHotelId,
}: HotelCardsProps) {
  if (!hotels?.length) {
    return (
      <div className="text-center py-8 text-slate-500">
        <span className="text-4xl block mb-3">🏨</span>
        <p>No hotels found for your destination.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {hotels.map((hotel, index) => {
        const isSelected = selectedHotelId === hotel.id;
        const isBestValue = index === 0;

        return (
          <div
            key={hotel.id}
            className={cn(
              "bg-white rounded-2xl border-2 overflow-hidden transition-all duration-200",
              isSelected
                ? "border-ocean-500 shadow-lg shadow-ocean-100"
                : "border-slate-100 hover:border-slate-200 card-hover",
              onSelect && "cursor-pointer"
            )}
            onClick={() => onSelect?.(hotel)}
          >
            {isBestValue && (
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-4 py-1">
                ⭐ Recommended Pick
              </div>
            )}

            <div
              className="h-36 bg-gradient-to-br from-ocean-200 to-primary-300 relative flex items-end p-3"
              style={
                hotel.image
                  ? {
                      backgroundImage: `url(${hotel.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {}
              }
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span
                className={cn(
                  "relative z-10 text-xs font-semibold px-2 py-0.5 rounded-full",
                  getCategoryColor(hotel.category)
                )}
              >
                {hotel.category}
              </span>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">
                  {hotel.name}
                </h3>
                <div className="text-right flex-none">
                  <p className="text-base font-bold text-slate-900">
                    {formatCurrency(hotel.pricePerNight, hotel.currency || currency)}
                  </p>
                  <p className="text-xs text-slate-400">/night</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={hotel.rating} />
                <span className="text-xs text-slate-500">
                  {hotel.reviewScore.toFixed(1)} ({hotel.reviewCount.toLocaleString()} reviews)
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                <MapPin className="w-3 h-3 flex-none" />
                <span className="truncate">{hotel.location}</span>
                {hotel.distanceFromCenter && (
                  <span className="text-slate-400 flex-none">· {hotel.distanceFromCenter}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {hotel.amenities.slice(0, 5).map((amenity) => (
                  <span
                    key={amenity}
                    className="flex items-center gap-1 text-xs bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full border border-slate-100"
                  >
                    {getAmenityIcon(amenity)}
                    {amenity}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-400">{nights} nights total</p>
                  <p className="font-bold text-ocean-600">
                    {formatCurrency(hotel.totalPrice, hotel.currency || currency)}
                  </p>
                </div>
                {hotel.bookingUrl && (
                  <a
                    href={hotel.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs bg-ocean-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-ocean-700 transition-colors"
                  >
                    Book Now
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
