"use client";

import { useState } from "react";
import { Coffee, Sun, Moon, ChevronDown, ChevronUp, MapPin, Clock, DollarSign, Lightbulb } from "lucide-react";
import type { DayItinerary, ItineraryActivity } from "@/types";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

const ACTIVITY_TYPE_STYLES: Record<string, { bg: string; text: string; emoji: string }> = {
  attraction: { bg: "bg-blue-50", text: "text-blue-700", emoji: "🏛️" },
  activity: { bg: "bg-emerald-50", text: "text-emerald-700", emoji: "🎯" },
  transport: { bg: "bg-slate-50", text: "text-slate-600", emoji: "🚌" },
  shopping: { bg: "bg-pink-50", text: "text-pink-700", emoji: "🛍️" },
  nature: { bg: "bg-green-50", text: "text-green-700", emoji: "🌿" },
  cultural: { bg: "bg-purple-50", text: "text-purple-700", emoji: "🎭" },
};

function ActivityCard({ activity }: { activity: ItineraryActivity }) {
  const style = ACTIVITY_TYPE_STYLES[activity.type] || ACTIVITY_TYPE_STYLES.activity;

  return (
    <div className="flex gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-colors">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-none text-base", style.bg)}>
        {style.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-slate-800 text-sm">{activity.name}</h4>
          {activity.cost !== undefined && activity.cost > 0 && (
            <span className="text-xs text-slate-500 flex-none flex items-center gap-0.5">
              <DollarSign className="w-3 h-3" />
              {activity.cost}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{activity.description}</p>
        <div className="flex items-center gap-3 mt-1.5">
          {activity.duration && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              {activity.duration}
            </span>
          )}
          {activity.address && (
            <span className="flex items-center gap-1 text-xs text-slate-400 truncate">
              <MapPin className="w-3 h-3 flex-none" />
              {activity.address}
            </span>
          )}
        </div>
        {activity.tips && (
          <p className="text-xs text-amber-600 mt-1.5 flex items-start gap-1">
            <Lightbulb className="w-3 h-3 flex-none mt-0.5" />
            {activity.tips}
          </p>
        )}
      </div>
    </div>
  );
}

function MealBadge({ label, meal }: { label: string; meal: { restaurant: string; cuisine: string; priceRange: string; specialty?: string } }) {
  return (
    <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2 text-sm">
      <span className="text-base">
        {label === "Breakfast" ? "☕" : label === "Lunch" ? "🍽️" : "🌙"}
      </span>
      <div>
        <span className="font-medium text-slate-700">{meal.restaurant}</span>
        <span className="text-slate-400 mx-1">·</span>
        <span className="text-slate-500 text-xs">{meal.cuisine}</span>
        <span className="text-amber-600 ml-1 text-xs">{meal.priceRange}</span>
        {meal.specialty && (
          <p className="text-xs text-slate-400 mt-0.5">Try: {meal.specialty}</p>
        )}
      </div>
    </div>
  );
}

function DayCard({ day, defaultOpen = false }: { day: DayItinerary; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      <button
        className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ocean-500 to-primary-600 flex flex-col items-center justify-center text-white flex-none shadow-md shadow-ocean-200">
          <span className="text-xs font-medium opacity-80">Day</span>
          <span className="text-lg font-bold leading-none">{day.day}</span>
        </div>

        <div className="flex-1 text-left">
          <h3 className="font-bold text-slate-800">{day.title}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-500">{formatDate(day.date)}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-xs text-slate-500">{day.theme}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-none">
          <div className="text-right">
            <p className="text-xs text-slate-400">Est. cost</p>
            <p className="text-sm font-semibold text-ocean-600">
              ~${day.estimatedDailyCost}
            </p>
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-5 border-t border-slate-100 pt-4 animate-fade-in">
          {day.morning?.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-semibold text-slate-700">Morning</h4>
              </div>
              <div className="space-y-2 pl-6">
                {day.morning.map((act, i) => (
                  <ActivityCard key={i} activity={act} />
                ))}
                {day.meals.breakfast && (
                  <MealBadge label="Breakfast" meal={day.meals.breakfast} />
                )}
              </div>
            </section>
          )}

          {day.afternoon?.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-4 h-4 text-orange-400" />
                <h4 className="text-sm font-semibold text-slate-700">Afternoon</h4>
              </div>
              <div className="space-y-2 pl-6">
                {day.afternoon.map((act, i) => (
                  <ActivityCard key={i} activity={act} />
                ))}
                {day.meals.lunch && (
                  <MealBadge label="Lunch" meal={day.meals.lunch} />
                )}
              </div>
            </section>
          )}

          {day.evening?.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-4 h-4 text-indigo-500" />
                <h4 className="text-sm font-semibold text-slate-700">Evening</h4>
              </div>
              <div className="space-y-2 pl-6">
                {day.evening.map((act, i) => (
                  <ActivityCard key={i} activity={act} />
                ))}
                {day.meals.dinner && (
                  <MealBadge label="Dinner" meal={day.meals.dinner} />
                )}
              </div>
            </section>
          )}

          {day.tips && day.tips.length > 0 && (
            <div className="bg-amber-50 rounded-xl p-3">
              <h4 className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5" />
                Pro Tips for Day {day.day}
              </h4>
              <ul className="space-y-1">
                {day.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                    <span className="flex-none mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ItineraryDisplayProps {
  itinerary: DayItinerary[];
  generalTips?: string[];
}

export function ItineraryDisplay({ itinerary, generalTips }: ItineraryDisplayProps) {
  if (!itinerary?.length) {
    return (
      <div className="text-center py-8 text-slate-500">
        <span className="text-4xl block mb-3">🗺️</span>
        <p>No itinerary available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {generalTips && generalTips.length > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-ocean-50 rounded-2xl p-4 border border-primary-100">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary-600" />
            Insider Tips for Your Trip
          </h3>
          <ul className="space-y-2">
            {generalTips.map((tip, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                <span className="text-primary-500 font-bold flex-none">{i + 1}.</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        {itinerary.map((day, i) => (
          <DayCard key={day.day} day={day} defaultOpen={i === 0} />
        ))}
      </div>
    </div>
  );
}
