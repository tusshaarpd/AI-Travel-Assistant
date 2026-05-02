"use client";

import { useState } from "react";
import { Plane, Hotel, Map, DollarSign, Globe, Info, RefreshCw } from "lucide-react";
import type { TravelPlan } from "@/types";
import { FlightCards } from "./FlightCards";
import { HotelCards } from "./HotelCards";
import { ItineraryDisplay } from "./ItineraryDisplay";
import { CostBreakdownCard } from "./CostBreakdown";
import { formatDate, calculateNights, cn } from "@/lib/utils";

type Tab = "overview" | "flights" | "hotels" | "itinerary" | "costs";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <Globe className="w-4 h-4" /> },
  { id: "flights", label: "Flights", icon: <Plane className="w-4 h-4" /> },
  { id: "hotels", label: "Hotels", icon: <Hotel className="w-4 h-4" /> },
  { id: "itinerary", label: "Itinerary", icon: <Map className="w-4 h-4" /> },
  { id: "costs", label: "Costs", icon: <DollarSign className="w-4 h-4" /> },
];

interface TravelResultsProps {
  plan: TravelPlan;
  onReset: () => void;
}

export function TravelResults({ plan, onReset }: TravelResultsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const nights = plan.travelInfo.returnDate
    ? calculateNights(plan.travelInfo.departureDate!, plan.travelInfo.returnDate)
    : plan.itineraries?.[0]?.days?.length ?? 0;

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gradient-to-r from-ocean-800 via-ocean-700 to-primary-700 text-white p-5 rounded-t-2xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
              <span>{plan.travelInfo.source}</span>
              <Plane className="w-3 h-3" />
              <span>{plan.travelInfo.destination}</span>
            </div>
            <h2 className="text-2xl font-bold">
              Your {plan.travelInfo.destination} Adventure
            </h2>
            <p className="text-white/70 text-sm mt-1">
              {plan.travelInfo.departureDate && formatDate(plan.travelInfo.departureDate)}
              {plan.travelInfo.returnDate && ` — ${formatDate(plan.travelInfo.returnDate)}`}
              <span className="mx-1">·</span>
              {nights} nights
            </p>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Trip
          </button>
        </div>

        {(plan.travelInfo.travelStyle as string[] | undefined)?.length && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(plan.travelInfo.travelStyle as string[]).map((style) => (
              <span
                key={style}
                className="text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full capitalize"
              >
                {style}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border-b border-slate-100 overflow-x-auto">
        <div className="flex min-w-max px-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "border-ocean-500 text-ocean-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
        {activeTab === "overview" && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                emoji="✈️"
                label="Flights"
                value={`${plan.outboundFlights.length || 0} options`}
                sub="from"
                subValue={
                  plan.outboundFlights[0]
                    ? `$${plan.outboundFlights[0].price}`
                    : "N/A"
                }
              />
              <StatCard
                emoji="🏨"
                label="Hotels"
                value={`${plan.hotels.length || 0} options`}
                sub="from"
                subValue={
                  plan.hotels[0]
                    ? `$${plan.hotels[0].pricePerNight}/night`
                    : "N/A"
                }
              />
              <StatCard
                emoji="🗺️"
                label="Plans"
                value={`${plan.itineraries?.length ?? 0} options`}
                sub="days"
                subValue={`${plan.itineraries?.[0]?.days?.length ?? 0} planned`}
              />
            </div>

            {(plan.weatherInfo || plan.bestTimeToVisit || plan.visaInfo) && (
              <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Info className="w-4 h-4 text-ocean-500" />
                  Destination Info
                </h3>
                {plan.weatherInfo && (
                  <InfoItem emoji="🌤️" label="Weather" value={plan.weatherInfo} />
                )}
                {plan.bestTimeToVisit && (
                  <InfoItem emoji="📅" label="Best Time" value={plan.bestTimeToVisit} />
                )}
                {plan.visaInfo && (
                  <InfoItem emoji="🛂" label="Visa" value={plan.visaInfo} />
                )}
              </div>
            )}

            {plan.costBreakdown && (
              <div
                className="bg-gradient-to-r from-ocean-50 to-primary-50 rounded-2xl p-4 border border-ocean-100 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setActiveTab("costs")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Estimated Cost</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      ${plan.costBreakdown.total?.toLocaleString()}
                    </p>
                    <p
                      className={cn(
                        "text-sm mt-1 font-medium",
                        plan.costBreakdown.withinBudget ? "text-emerald-600" : "text-red-600"
                      )}
                    >
                      {plan.costBreakdown.withinBudget
                        ? `✓ Within budget — $${plan.costBreakdown.budgetDifference} to spare`
                        : `⚠ ${Math.abs(plan.costBreakdown.budgetDifference)} over budget`}
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-ocean-200" />
                </div>
              </div>
            )}

            {plan.generalTips.length > 0 && (
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <h3 className="font-semibold text-amber-800 mb-2 text-sm">
                  💡 Quick Tips
                </h3>
                <ul className="space-y-1.5">
                  {plan.generalTips.slice(0, 4).map((tip, i) => (
                    <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                      <span className="font-bold text-amber-500 flex-none">{i + 1}.</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === "flights" && (
          <div className="animate-fade-in">
            <FlightCards
              outbound={plan.outboundFlights}
              returning={plan.returnFlights}
              currency={plan.travelInfo.currency}
            />
          </div>
        )}

        {activeTab === "hotels" && (
          <div className="animate-fade-in">
            <HotelCards
              hotels={plan.hotels}
              nights={nights}
              currency={plan.travelInfo.currency}
            />
          </div>
        )}

        {activeTab === "itinerary" && (
          <div className="animate-fade-in">
            <ItineraryDisplay
              itineraries={plan.itineraries ?? []}
              generalTips={plan.generalTips}
            />
          </div>
        )}

        {activeTab === "costs" && plan.costBreakdown && (
          <div className="animate-fade-in">
            <CostBreakdownCard
              breakdown={plan.costBreakdown}
              totalBudget={plan.travelInfo.budget}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  emoji,
  label,
  value,
  sub,
  subValue,
}: {
  emoji: string;
  label: string;
  value: string;
  sub: string;
  subValue: string;
}) {
  return (
    <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
      <span className="text-2xl">{emoji}</span>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
      <p className="font-bold text-slate-800 text-sm">{value}</p>
      <p className="text-xs text-slate-400">
        {sub} <span className="text-ocean-600 font-medium">{subValue}</span>
      </p>
    </div>
  );
}

function InfoItem({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-lg flex-none">{emoji}</span>
      <div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </span>
        <p className="text-sm text-slate-700 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
