"use client";

import { ChatInterface } from "@/components/ChatInterface";
import { Plane, MapPin, Calendar, Sparkles, Star } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      <div className="hero-bg lg:w-[45%] lg:min-h-screen text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl">Aria</h1>
              <p className="text-white/60 text-xs">AI Travel Assistant</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Powered by GPT-4 & Real-Time Data</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Plan Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-cyan-200">
                Perfect Trip
              </span>
              With AI
            </h2>

            <p className="text-white/70 text-lg leading-relaxed max-w-md">
              Tell Aria where you want to go, and get a personalized day-by-day itinerary, real flight prices, and hotel recommendations — all in minutes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-10">
            {[
              { icon: <Plane className="w-4 h-4" />, title: "Live Flights", desc: "Real-time prices" },
              { icon: <span className="text-base">🏨</span>, title: "Hotels", desc: "Best deals found" },
              { icon: <MapPin className="w-4 h-4" />, title: "Itineraries", desc: "Day-by-day plans" },
              { icon: <Calendar className="w-4 h-4" />, title: "Smart Budget", desc: "Cost tracking" },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mb-3">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-white/60 text-xs mt-0.5">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-8">
          <div className="flex gap-3 mb-6">
            {[
              { name: "Paris", emoji: "🗼" },
              { name: "Tokyo", emoji: "⛩️" },
              { name: "Bali", emoji: "🌺" },
              { name: "New York", emoji: "🗽" },
            ].map((dest) => (
              <div
                key={dest.name}
                className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-2 text-center border border-white/15 hover:bg-white/20 transition-colors cursor-default"
              >
                <span className="text-xl">{dest.emoji}</span>
                <p className="text-xs text-white/70 mt-1">{dest.name}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 text-sm text-white/60">
            <div className="flex -space-x-1.5">
              {["🧑", "👩", "🧔", "👱"].map((avatar, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-xs"
                >
                  {avatar}
                </div>
              ))}
            </div>
            <span>10,000+ trips planned</span>
            <div className="flex items-center gap-0.5 ml-auto">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-1">4.9</span>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-ocean-300/10 blur-3xl" />
        <div className="absolute top-1/2 right-0 w-32 h-64 rounded-full bg-primary-500/10 blur-3xl" />
      </div>

      <div className="flex-1 bg-slate-50 flex flex-col p-4 lg:p-8">
        <div className="flex-1 max-w-2xl w-full mx-auto flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-slate-500 text-sm">
              💬 Chat with Aria to plan your trip
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
          </div>

          <div className="flex-1 min-h-[600px] lg:min-h-0" style={{ height: "calc(100vh - 180px)" }}>
            <ChatInterface />
          </div>
        </div>
      </div>
    </main>
  );
}
