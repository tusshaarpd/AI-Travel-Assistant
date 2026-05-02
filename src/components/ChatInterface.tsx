"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, MapPin, Plane, Sparkles } from "lucide-react";
import type { Message, TravelInfo, ConversationStage, TravelPlan } from "@/types";
import { generateId, cn } from "@/lib/utils";
import { LoadingDots, GeneratingPlan } from "./LoadingDots";
import { TravelResults } from "./TravelResults";

const STAGE_ORDER: ConversationStage[] = [
  "greeting",
  "collect_source",
  "collect_destination",
  "collect_dates",
  "collect_budget",
  "collect_style",
  "confirming",
  "generating",
  "results",
];

const STAGE_LABELS: Partial<Record<ConversationStage, string>> = {
  collect_source: "Origin",
  collect_destination: "Destination",
  collect_dates: "Dates",
  collect_budget: "Budget",
  collect_style: "Style",
  confirming: "Confirm",
};

const QUICK_REPLIES: Partial<Record<ConversationStage, string[]>> = {
  collect_style: ["Adventure 🧗", "Relaxing 🌴", "Cultural 🏛️", "Luxury ✨", "Foodie 🍜", "Family 👨‍👩‍👧", "Romantic 💑"],
  confirming: ["Yes, looks perfect! ✓", "Let me change the dates", "Adjust my budget"],
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stage, setStage] = useState<ConversationStage>("greeting");
  const [travelInfo, setTravelInfo] = useState<TravelInfo>({});
  const [travelPlan, setTravelPlan] = useState<TravelPlan | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    const msg: Message = {
      id: generateId(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }, []);

  const startConversation = useCallback(async () => {
    setHasStarted(true);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [],
          travelInfo: {},
          stage: "greeting",
          userMessage: "start",
        }),
      });

      const data = await response.json();
      addMessage("assistant", data.message);
      setStage(data.nextStage || "collect_source");
    } catch {
      addMessage(
        "assistant",
        "👋 Hi! I'm Aria, your AI travel assistant! I'm excited to help you plan your perfect trip. Let's start — where will you be departing from?"
      );
      setStage("collect_source");
    } finally {
      setIsLoading(false);
    }
  }, [addMessage]);

  useEffect(() => {
    if (!hasStarted) {
      startConversation();
    }
  }, [hasStarted, startConversation]);

  const generateTravelPlan = useCallback(async (info: TravelInfo) => {
    setIsGenerating(true);
    setStage("generating");

    try {
      const response = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ travelInfo: info }),
      });

      const data = await response.json();

      if (!response.ok) {
        addMessage("assistant", `Sorry, I couldn't complete your travel plan. ${data.error || "Please try again."}`);
        setStage("confirming");
        return;
      }

      setTravelPlan(data as TravelPlan);
      setStage("results");
    } catch (error) {
      console.error("Plan generation error:", error);
      addMessage(
        "assistant",
        "I encountered an issue generating your travel plan. Please check your API keys and try again."
      );
      setStage("confirming");
    } finally {
      setIsGenerating(false);
    }
  }, [addMessage]);

  const handleSendMessage = useCallback(async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text || isLoading) return;

    setInputValue("");
    addMessage("user", text);
    setIsLoading(true);

    const conversationHistory = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationHistory,
          travelInfo,
          stage,
          userMessage: text,
        }),
      });

      const data = await response.json();

      addMessage("assistant", data.message);

      const updatedInfo = { ...travelInfo, ...data.updatedTravelInfo };
      setTravelInfo(updatedInfo);

      const nextStage = data.nextStage || stage;
      setStage(nextStage);

      if (data.readyToGenerate || nextStage === "generating") {
        setTimeout(() => generateTravelPlan(updatedInfo), 800);
      }
    } catch {
      addMessage(
        "assistant",
        "I'm having trouble processing that. Could you please try again?"
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [inputValue, isLoading, messages, travelInfo, stage, addMessage, generateTravelPlan]);

  const handleReset = useCallback(() => {
    setMessages([]);
    setTravelPlan(null);
    setTravelInfo({});
    setStage("greeting");
    setHasStarted(false);
    setIsGenerating(false);
    setIsLoading(false);
  }, []);

  const progressStages = STAGE_ORDER.filter((s) => STAGE_LABELS[s]);
  const currentStageIndex = progressStages.indexOf(stage);
  const quickReplies = QUICK_REPLIES[stage] || [];

  if (isGenerating) {
    return (
      <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-glass">
        <div className="bg-gradient-to-r from-ocean-800 to-primary-700 text-white p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Aria</h1>
            <p className="text-white/70 text-xs">AI Travel Assistant</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <GeneratingPlan />
        </div>
      </div>
    );
  }

  if (travelPlan && stage === "results") {
    return (
      <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-glass">
        <TravelResults plan={travelPlan} onReset={handleReset} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-glass">
      <div className="bg-gradient-to-r from-ocean-800 via-ocean-700 to-primary-700 text-white p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Aria</h1>
            <p className="text-white/70 text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI Travel Assistant · Online
            </p>
          </div>
          {travelInfo.destination && (
            <div className="ml-auto flex items-center gap-1.5 bg-white/20 rounded-lg px-2.5 py-1 text-xs">
              <MapPin className="w-3 h-3" />
              <span>{travelInfo.destination}</span>
            </div>
          )}
        </div>

        {currentStageIndex > 0 && (
          <div className="flex items-center gap-1">
            {progressStages.map((s, i) => {
              const isDone = i < currentStageIndex;
              const isActive = i === currentStageIndex;
              return (
                <div key={s} className="flex items-center gap-1 flex-1">
                  <div
                    className={cn(
                      "flex-1 h-1 rounded-full transition-all duration-500",
                      isDone || isActive ? "bg-white/80" : "bg-white/25"
                    )}
                  />
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-none",
                      isDone ? "bg-emerald-400 text-white" : isActive ? "bg-white text-ocean-700 shadow-md" : "bg-white/25 text-white/50"
                    )}
                  >
                    {isDone ? "✓" : i + 1}
                  </div>
                </div>
              );
            })}
            <div className="flex-1 h-1 rounded-full bg-white/10" />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 animate-slide-up",
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ocean-500 to-primary-600 flex items-center justify-center flex-none shadow-sm">
                <Plane className="w-4 h-4 text-white" />
              </div>
            )}

            <div
              className={cn(
                "max-w-[80%] px-4 py-3 text-sm leading-relaxed",
                message.role === "user"
                  ? "message-user"
                  : "message-assistant"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 animate-slide-up">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ocean-500 to-primary-600 flex items-center justify-center flex-none shadow-sm">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <div className="message-assistant px-4 py-2">
              <LoadingDots />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {quickReplies.length > 0 && !isLoading && (
        <div className="px-4 py-2 bg-white border-t border-slate-100">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => handleSendMessage(reply)}
                className="flex-none text-xs bg-ocean-50 text-ocean-700 border border-ocean-200 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-ocean-100 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 bg-white border-t border-slate-100">
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-ocean-400 focus-within:ring-2 focus-within:ring-ocean-100 transition-all px-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              stage === "collect_source"
                ? "Enter your departure city..."
                : stage === "collect_destination"
                ? "Where do you want to go?"
                : stage === "collect_dates"
                ? "E.g. Dec 15 to Dec 22..."
                : stage === "collect_budget"
                ? "E.g. $3000 for 2 people..."
                : "Type your message..."
            }
            className="flex-1 py-3 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
              inputValue.trim() && !isLoading
                ? "bg-ocean-600 text-white hover:bg-ocean-700 shadow-sm"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
