"use client";

import { useState } from "react";
import { Plane, Clock, ArrowRight, Star, ChevronDown, ChevronUp } from "lucide-react";
import type { FlightOption } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";

interface FlightCardsProps {
  outbound: FlightOption[];
  returning: FlightOption[];
  currency?: string;
  onSelect?: (flight: FlightOption, type: "outbound" | "return") => void;
  selectedOutbound?: string;
  selectedReturn?: string;
}

export function FlightCards({
  outbound,
  returning,
  currency = "USD",
  onSelect,
  selectedOutbound,
  selectedReturn,
}: FlightCardsProps) {
  const [activeTab, setActiveTab] = useState<"outbound" | "return">("outbound");
  const [expanded, setExpanded] = useState<string | null>(null);

  const flights = activeTab === "outbound" ? outbound : returning;

  if (!outbound?.length && !returning?.length) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Plane className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>No flights found for your route.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {returning?.length > 0 && (
        <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
          {(["outbound", "return"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                activeTab === tab ? "tab-active text-slate-800" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab === "outbound" ? "✈️ Outbound" : "🔄 Return"}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {flights?.map((flight) => {
          const isSelected =
            activeTab === "outbound"
              ? selectedOutbound === flight.id
              : selectedReturn === flight.id;
          const isExpanded = expanded === flight.id;

          return (
            <div
              key={flight.id}
              className={cn(
                "bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden",
                isSelected
                  ? "border-ocean-500 shadow-lg shadow-ocean-100"
                  : "border-slate-100 hover:border-slate-200 card-hover",
                onSelect && "cursor-pointer"
              )}
              onClick={() => onSelect?.(flight, activeTab)}
            >
              {flight.stops === 0 && (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold px-4 py-1 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" />
                  Best Price — Nonstop
                </div>
              )}

              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                      <Plane className="w-4 h-4 text-ocean-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{flight.airline}</p>
                      <p className="text-xs text-slate-400">{flight.flightNumber}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-900">
                      {formatCurrency(flight.price, flight.currency || currency)}
                    </p>
                    <p className="text-xs text-slate-400">per person</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-center flex-none">
                    <p className="text-lg font-bold text-slate-800">{flight.departure.time}</p>
                    <p className="text-xs font-medium text-slate-500">{flight.departure.airport}</p>
                  </div>

                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{flight.duration}</span>
                    </div>
                    <div className="w-full flex items-center gap-1">
                      <div className="h-px flex-1 bg-slate-200" />
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                    </div>
                    <span className={cn(
                      "text-xs font-medium",
                      flight.stops === 0 ? "text-emerald-600" : "text-amber-600"
                    )}>
                      {flight.stops === 0 ? "Nonstop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                    </span>
                  </div>

                  <div className="text-center flex-none">
                    <p className="text-lg font-bold text-slate-800">{flight.arrival.time}</p>
                    <p className="text-xs font-medium text-slate-500">{flight.arrival.airport}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                  <div className="flex gap-3 text-xs text-slate-400">
                    <span>{flight.departure.date}</span>
                    <span>·</span>
                    <span>{flight.cabinClass}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded(isExpanded ? null : flight.id);
                    }}
                    className="text-xs text-ocean-600 flex items-center gap-1 hover:text-ocean-700"
                  >
                    Details
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                    <p><span className="font-medium">From:</span> {flight.departure.city} ({flight.departure.airport})</p>
                    <p><span className="font-medium">To:</span> {flight.arrival.city} ({flight.arrival.airport})</p>
                    {flight.stopDetails?.map((stop, i) => (
                      <p key={i}><span className="font-medium">Stop {i + 1}:</span> {stop}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
