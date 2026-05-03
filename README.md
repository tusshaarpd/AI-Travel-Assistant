# ✈️ Aria — AI Travel Assistant

An AI-powered travel planning web application built with Next.js 14 and deployed on Vercel. Chat with **Aria** to get real-time flight options, hotel recommendations, and a personalized day-by-day itinerary — all in one place.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai)

---

## 🌟 Features

- **Conversational AI** — Chat with Aria to collect trip details naturally (origin → destination → dates → budget → travel style)
- **Live Flight Search** — Real-time flight options via SerpAPI Google Flights with prices, duration, stops, and airline info
- **Hotel Recommendations** — Live hotel results via SerpAPI Google Hotels with images, star ratings, amenities, and pricing
- **AI Itinerary Generation** — Personalized day-by-day itinerary with morning/afternoon/evening activities, meal recommendations, and local tips
- **Accurate Cost Breakdown** — Flight and accommodation costs pulled from real API prices, not AI estimates
- **Responsive UI** — Clean, mobile-friendly interface with a split hero + chat layout

---

## 🖥️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| AI / NLP | OpenAI GPT-4o-mini |
| Flights & Hotels | SerpAPI (Google Flights + Google Hotels) |
| Deployment | Vercel (Serverless Functions) |
| Icons | Lucide React |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Main page — hero layout + chat panel
│   ├── layout.tsx                # Root layout with metadata
│   ├── globals.css               # Global styles, animations, glass effects
│   └── api/
│       ├── chat/route.ts         # Conversational AI endpoint (OpenAI)
│       ├── flights/route.ts      # Flight search endpoint (SerpAPI)
│       ├── hotels/route.ts       # Hotel search endpoint (SerpAPI)
│       └── itinerary/route.ts    # Orchestrates all 3 APIs in parallel
├── components/
│   ├── ChatInterface.tsx         # 7-stage conversation state machine
│   ├── TravelResults.tsx         # Tabbed results view
│   ├── FlightCards.tsx           # Flight option cards with outbound/return tabs
│   ├── HotelCards.tsx            # Hotel cards with ratings and amenities
│   ├── ItineraryDisplay.tsx      # Collapsible day-by-day itinerary
│   ├── CostBreakdown.tsx         # Budget usage bar + category breakdown
│   └── LoadingDots.tsx           # Loading states and generating animation
├── lib/
│   ├── openai.ts                 # OpenAI client, chat + itinerary prompts
│   ├── serpapi.ts                # SerpAPI flights & hotels with IATA resolver
│   └── utils.ts                  # formatCurrency, formatDate, cn(), etc.
└── types/
    └── index.ts                  # Full TypeScript interfaces
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys)
- A [SerpAPI key](https://serpapi.com/manage-api-key)

### Installation

```bash
# Clone the repository
git clone https://github.com/tusshaarpd/ai-travel-assistant.git
cd ai-travel-assistant

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
```

### Environment Variables

Edit `.env.local` and add your keys:

```env
OPENAI_API_KEY=sk-your-openai-api-key
SERPAPI_KEY=your-serpapi-key
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Vercel

1. Push your code to GitHub
2. Import the repository on [vercel.com](https://vercel.com)
3. Add environment variables in **Project Settings → Environment Variables**:
   - `OPENAI_API_KEY`
   - `SERPAPI_KEY`
4. Deploy — Vercel auto-detects Next.js

The `vercel.json` config sets a **60-second timeout** on all API routes to handle itinerary generation.

---

## 💬 User Flow

```
1. Greet        → Aria introduces herself
2. Origin       → "Where are you flying from?"
3. Destination  → "Where do you want to go?"
4. Dates        → "When are you travelling?"
5. Budget       → "What's your total budget?"
6. Style        → "What's your travel style?" (adventure / luxury / cultural / etc.)
7. Confirm      → Summary of all details for review
8. Generate     → Parallel API calls to OpenAI + SerpAPI
9. Results      → Flights · Hotels · Itinerary · Costs
```

---

## 🔌 API Endpoints

| Route | Method | Description |
|---|---|---|
| `/api/chat` | POST | Conversational AI — extracts travel info stage by stage |
| `/api/flights` | POST | Search flights via SerpAPI Google Flights |
| `/api/hotels` | POST | Search hotels via SerpAPI Google Hotels |
| `/api/itinerary` | POST | Orchestrates flights + hotels + itinerary in parallel |

### `/api/itinerary` — Parallel Execution

```
Promise.allSettled([
  searchFlights()    ← SerpAPI Google Flights  (12s timeout)
  searchHotels()     ← SerpAPI Google Hotels   (12s timeout)
  generateItinerary() ← OpenAI GPT-4o-mini     (45s timeout)
])
```

Cost breakdown is recalculated using **real API prices** after all calls complete.

---

## 🗺️ City → IATA Code Resolution

SerpAPI Google Flights requires IATA airport codes. The app automatically resolves 70+ city names:

```
"New York"  → JFK    "London"  → LHR    "Tokyo"   → NRT
"Dubai"     → DXB    "Paris"   → CDG    "Bali"    → DPS
"Delhi"     → DEL    "Mumbai"  → BOM    "Sydney"  → SYD
```

Users can also type IATA codes directly (e.g. `JFK`, `LHR`).

---

## 📊 Results Tabs

| Tab | Contents |
|---|---|
| **Overview** | Stats summary, destination info (weather, visa, best time), total cost, quick tips |
| **Flights** | Outbound + return flight cards with price, duration, stops, airline |
| **Hotels** | Hotel cards with images, star ratings, amenities, price per night + total |
| **Itinerary** | Collapsible day cards — morning / afternoon / evening activities + meals |
| **Costs** | Budget usage bar, per-category breakdown (flights, accommodation, activities, meals, transport) |

---

## ⚙️ Configuration

Key limits configurable in code:

| Setting | Value | Location |
|---|---|---|
| Max trip days (itinerary) | 7 | `src/lib/openai.ts` |
| Max flight results | 5 | `src/lib/serpapi.ts` |
| Max hotel results | 6 | `src/lib/serpapi.ts` |
| SerpAPI timeout | 10s | `src/lib/serpapi.ts` |
| OpenAI timeout | 45s | `src/app/api/itinerary/route.ts` |
| Vercel function timeout | 60s | `vercel.json` |

---

## 📄 License

MIT — free to use, modify and distribute.

---

Built with ❤️ using Next.js, OpenAI, and SerpAPI.
