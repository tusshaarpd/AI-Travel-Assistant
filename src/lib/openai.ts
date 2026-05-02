import OpenAI from "openai";

let openaiInstance: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

export const TRAVEL_SYSTEM_PROMPT = `You are an expert AI travel assistant named "Aria". You help users plan their perfect trips by collecting information and providing personalized travel recommendations.

Your personality:
- Warm, enthusiastic, and knowledgeable about travel
- Professional yet approachable
- Concise but informative
- Always encouraging and positive

Your role:
1. Guide users through collecting travel information conversationally
2. Extract structured data from natural language responses
3. Validate and confirm information
4. Generate detailed, personalized travel itineraries

When collecting information, be natural and conversational. Don't ask multiple questions at once unless confirming collected info.

Always respond in JSON format with this structure:
{
  "message": "Your conversational response to the user",
  "nextStage": "the next conversation stage",
  "updatedTravelInfo": { extracted travel info fields },
  "readyToGenerate": false
}

Stages: greeting → collect_source → collect_destination → collect_dates → collect_budget → collect_style → confirming → generating

For dates, always convert to YYYY-MM-DD format.
For budget, extract the numeric value.
For travel style, identify from: adventure, relaxing, cultural, family, luxury, budget, romantic, business, eco, foodie.`;

export async function getChatResponse(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  travelInfo: Record<string, unknown>
): Promise<string> {
  const client = getOpenAIClient();

  const contextMessage = travelInfo && Object.keys(travelInfo).length > 0
    ? `Current collected travel info: ${JSON.stringify(travelInfo)}`
    : "";

  const systemMessages = [
    { role: "system" as const, content: TRAVEL_SYSTEM_PROMPT },
    ...(contextMessage ? [{ role: "system" as const, content: contextMessage }] : []),
  ];

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [...systemMessages, ...messages],
    temperature: 0.7,
    max_tokens: 1000,
    response_format: { type: "json_object" },
  });

  return response.choices[0]?.message?.content || "";
}

export async function generateItinerary(
  travelInfo: Record<string, unknown>
): Promise<string> {
  const client = getOpenAIClient();

  const departureDate = travelInfo.departureDate as string;
  const returnDate = travelInfo.returnDate as string;
  const msPerDay = 1000 * 60 * 60 * 24;
  const tripDays = returnDate
    ? Math.min(7, Math.max(1, Math.round((new Date(returnDate).getTime() - new Date(departureDate).getTime()) / msPerDay)))
    : 3;

  const style = Array.isArray(travelInfo.travelStyle)
    ? travelInfo.travelStyle.join(", ")
    : travelInfo.travelStyle || "balanced";

  const daySchema = `{"day":1,"date":"YYYY-MM-DD","title":"","theme":"","morning":[{"name":"","description":"","duration":"","cost":0,"type":"attraction","address":"","tips":""}],"afternoon":[{"name":"","description":"","duration":"","cost":0,"type":"activity","address":"","tips":""}],"evening":[{"name":"","description":"","duration":"","cost":0,"type":"cultural","address":"","tips":""}],"meals":{"breakfast":{"restaurant":"","cuisine":"","priceRange":"$","specialty":"","address":""},"lunch":{"restaurant":"","cuisine":"","priceRange":"$$","specialty":"","address":""},"dinner":{"restaurant":"","cuisine":"","priceRange":"$$","specialty":"","address":""}},"tips":[""],"estimatedDailyCost":0}`;

  const prompt = `Create 2 distinct ${tripDays}-day travel itineraries for:
Trip: ${travelInfo.source} → ${travelInfo.destination}, ${departureDate} to ${returnDate || ""}
Budget: ${travelInfo.budget} ${travelInfo.currency || "USD"}, Style: ${style}, Travelers: ${travelInfo.travelers || 1}

The 2 itineraries must have clearly different themes/vibes — e.g. "Cultural Deep-Dive vs. Leisure & Food" or "Adventure vs. Relaxed Explorer". Choose themes that suit the destination and travel style.

Return ONLY this JSON:
{
  "itineraries": [
    {
      "id": "option-1",
      "name": "Short descriptive name (e.g. Cultural Explorer)",
      "description": "One sentence describing the vibe of this itinerary",
      "emoji": "single relevant emoji",
      "days": [${daySchema}]
    },
    {
      "id": "option-2",
      "name": "Short descriptive name (e.g. Leisure & Flavours)",
      "description": "One sentence describing the vibe of this itinerary",
      "emoji": "single relevant emoji",
      "days": [${daySchema}]
    }
  ],
  "generalTips": ["","",""],
  "bestTimeToVisit": "",
  "weatherInfo": "",
  "visaInfo": "",
  "costBreakdown": {"flights":0,"accommodation":0,"activities":0,"meals":0,"transport":0,"miscellaneous":0,"total":0,"currency":"USD","withinBudget":true,"budgetDifference":0}
}
Rules: 1-2 activities per time slot. Use real place/restaurant names. Keep JSON compact.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a travel planner. Respond only with valid compact JSON, no markdown.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 3500,
    response_format: { type: "json_object" },
  });

  return response.choices[0]?.message?.content || "";
}
