"use client";

import { CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import type { CostBreakdown } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";

const COST_ITEMS = [
  { key: "flights", label: "Flights", emoji: "✈️", color: "bg-blue-500" },
  { key: "accommodation", label: "Accommodation", emoji: "🏨", color: "bg-purple-500" },
  { key: "activities", label: "Activities", emoji: "🎯", color: "bg-emerald-500" },
  { key: "meals", label: "Meals & Dining", emoji: "🍽️", color: "bg-amber-500" },
  { key: "transport", label: "Local Transport", emoji: "🚌", color: "bg-orange-500" },
  { key: "miscellaneous", label: "Miscellaneous", emoji: "📦", color: "bg-slate-400" },
] as const;

interface CostBreakdownProps {
  breakdown: CostBreakdown;
  totalBudget?: number;
}

export function CostBreakdownCard({ breakdown, totalBudget }: CostBreakdownProps) {
  const total = breakdown.total || 0;
  const budget = totalBudget || total * 1.2;
  const usagePercent = Math.min(100, (total / budget) * 100);

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "rounded-2xl p-5 text-white",
          breakdown.withinBudget
            ? "bg-gradient-to-br from-emerald-500 to-teal-600"
            : "bg-gradient-to-br from-red-500 to-rose-600"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm">Total Estimated Cost</p>
            <p className="text-4xl font-bold mt-1">
              {formatCurrency(total, breakdown.currency)}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            {breakdown.withinBudget ? (
              <CheckCircle className="w-8 h-8 text-white" />
            ) : (
              <AlertCircle className="w-8 h-8 text-white" />
            )}
          </div>
        </div>

        <div className="bg-white/20 rounded-xl p-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/80">Budget Usage</span>
            <span className="font-semibold">{usagePercent.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                usagePercent > 90 ? "bg-red-300" : "bg-white"
              )}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/70">
            <span>$0</span>
            <span>Budget: {formatCurrency(budget, breakdown.currency)}</span>
          </div>
        </div>

        {!breakdown.withinBudget && (
          <div className="mt-3 flex items-center gap-2 text-sm text-white/90">
            <TrendingUp className="w-4 h-4" />
            <span>
              Over budget by {formatCurrency(Math.abs(breakdown.budgetDifference), breakdown.currency)}
            </span>
          </div>
        )}

        {breakdown.withinBudget && breakdown.budgetDifference > 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm text-white/90">
            <CheckCircle className="w-4 h-4" />
            <span>
              {formatCurrency(breakdown.budgetDifference, breakdown.currency)} remaining in budget
            </span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Cost Breakdown</h3>
        </div>

        <div className="divide-y divide-slate-50">
          {COST_ITEMS.map(({ key, label, emoji, color }) => {
            const amount = breakdown[key] || 0;
            const percentage = total > 0 ? (amount / total) * 100 : 0;

            return (
              <div key={key} className="px-5 py-3 flex items-center gap-4">
                <span className="text-xl flex-none">{emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                    <span className="text-sm font-bold text-slate-800">
                      {formatCurrency(amount, breakdown.currency)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", color)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 flex-none w-8 text-right">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-4 bg-slate-50 flex items-center justify-between border-t border-slate-100">
          <span className="font-bold text-slate-800">Total</span>
          <span className="text-xl font-bold text-slate-900">
            {formatCurrency(total, breakdown.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
