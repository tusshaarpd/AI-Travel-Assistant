"use client";

export function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2 px-1">
      <div className="typing-dot" />
      <div className="typing-dot" />
      <div className="typing-dot" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 space-y-3 border border-slate-100">
      <div className="shimmer h-4 w-3/4 rounded-full" />
      <div className="shimmer h-3 w-1/2 rounded-full" />
      <div className="shimmer h-3 w-2/3 rounded-full" />
      <div className="flex gap-2 pt-2">
        <div className="shimmer h-6 w-16 rounded-full" />
        <div className="shimmer h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function GeneratingPlan() {
  const steps = [
    { icon: "✈️", label: "Searching flights" },
    { icon: "🏨", label: "Finding hotels" },
    { icon: "🗺️", label: "Building itinerary" },
    { icon: "💰", label: "Calculating costs" },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full border-4 border-ocean-100 border-t-ocean-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-3xl">
          ✈️
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-2">
        Crafting Your Perfect Trip
      </h3>
      <p className="text-slate-500 text-sm mb-8 text-center">
        Our AI is working across multiple sources to build your personalized travel plan
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {steps.map((step, i) => (
          <div
            key={step.label}
            className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2"
            style={{ animationDelay: `${i * 0.3}s` }}
          >
            <span className="text-lg">{step.icon}</span>
            <span className="text-xs font-medium text-slate-600">{step.label}</span>
            <div
              className="ml-auto w-4 h-4 rounded-full border-2 border-ocean-200 border-t-ocean-500 animate-spin"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
