import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aria — AI Travel Assistant",
  description:
    "Plan your perfect trip with Aria, your AI-powered travel assistant. Get personalized itineraries, flight options, hotel recommendations, and more.",
  keywords: ["travel", "AI", "itinerary", "flights", "hotels", "travel planning"],
  openGraph: {
    title: "Aria — AI Travel Assistant",
    description: "Plan your perfect trip with AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-slate-50">
        {children}
      </body>
    </html>
  );
}
