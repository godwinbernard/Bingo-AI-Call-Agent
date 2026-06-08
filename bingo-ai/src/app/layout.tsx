import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bingo AI Call Agent — Scale Outbound Calling with AI",
  description:
    "Deploy hyper-realistic AI call agents that qualify leads, book appointments, and close deals at scale — 24/7, with full TCPA compliance.",
  keywords: ["AI call agent", "outbound calling", "sales automation", "TCPA compliant", "voice AI"],
  openGraph: {
    title: "Bingo AI Call Agent",
    description: "Make 10,000 calls while you sleep. AI-powered outbound calling at scale.",
    type: "website",
    siteName: "Bingo AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bingo AI Call Agent",
    description: "Make 10,000 calls while you sleep. AI-powered outbound calling at scale.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
