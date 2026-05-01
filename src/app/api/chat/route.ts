import { NextRequest, NextResponse } from "next/server";
import { getChatResponse } from "@/lib/openai";
import type { ChatAPIRequest } from "@/types";

const STAGE_PROMPTS: Record<string, string> = {
  greeting: `The user just arrived. Greet them warmly as Aria, briefly explain you'll help plan their trip, and ask where they're departing from. Keep it friendly and concise.`,
  collect_source: `Extract the source/departure city from the user's message. Confirm it and ask for their destination.`,
  collect_destination: `Extract the destination from the user's message. Express enthusiasm about their destination and ask for their travel dates (departure and return).`,
  collect_dates: `Extract departure and return dates. Convert to YYYY-MM-DD format. Confirm the dates and ask about their total budget for the trip.`,
  collect_budget: `Extract the budget amount and currency. Ask about their preferred travel style (adventure, relaxing, cultural, family-friendly, luxury, budget-conscious, romantic, foodie, etc.). They can choose multiple.`,
  collect_style: `Extract travel style preferences. Summarize ALL collected info and ask for confirmation before generating the plan.`,
  confirming: `The user is confirming their travel details. If they say yes/correct/proceed, set readyToGenerate to true and nextStage to "generating". If they want changes, help them modify the relevant info.`,
};

export async function POST(request: NextRequest) {
  try {
    const body: ChatAPIRequest = await request.json();
    const { messages, travelInfo, stage, userMessage } = body;

    const stageInstruction = STAGE_PROMPTS[stage] || "";

    const typedMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    const contextualMessages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [
      ...typedMessages,
      {
        role: "user" as const,
        content: `[Stage: ${stage}] [Instruction: ${stageInstruction}] User message: "${userMessage}"`,
      },
    ];

    const rawResponse = await getChatResponse(
      contextualMessages.slice(-10),
      travelInfo as Record<string, unknown>
    );

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(rawResponse);
    } catch {
      parsedResponse = {
        message: rawResponse,
        nextStage: stage,
        updatedTravelInfo: travelInfo,
        readyToGenerate: false,
      };
    }

    if (!parsedResponse.nextStage) {
      parsedResponse.nextStage = getNextStage(stage);
    }

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error("Chat API error:", error);

    const errorMessage =
      error instanceof Error && error.message.includes("OPENAI_API_KEY")
        ? "OpenAI API key is not configured. Please add your OPENAI_API_KEY to the environment variables."
        : "I'm having trouble connecting right now. Please try again in a moment.";

    return NextResponse.json(
      {
        message: errorMessage,
        nextStage: "error",
        updatedTravelInfo: {},
        readyToGenerate: false,
      },
      { status: error instanceof Error && error.message.includes("OPENAI_API_KEY") ? 500 : 200 }
    );
  }
}

function getNextStage(currentStage: string): string {
  const flow: Record<string, string> = {
    greeting: "collect_source",
    collect_source: "collect_destination",
    collect_destination: "collect_dates",
    collect_dates: "collect_budget",
    collect_budget: "collect_style",
    collect_style: "confirming",
    confirming: "generating",
  };
  return flow[currentStage] || currentStage;
}
