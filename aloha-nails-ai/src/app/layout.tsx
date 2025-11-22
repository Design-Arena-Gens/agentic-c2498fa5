import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aloha Nails AI Photoshoot Pro",
  description:
    "AI-powered art direction that crafts flawless, fashion-forward manicures for Aloha Nails social media and ads.",
  metadataBase: new URL("https://agentic-c2498fa5.vercel.app"),
  openGraph: {
    title: "Aloha Nails AI Photoshoot Pro",
    description:
      "Generate editorial-ready, high-fashion manicure visuals with effortless styling assistants.",
    type: "website",
    url: "https://agentic-c2498fa5.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aloha Nails AI Photoshoot Pro",
    description:
      "Generate editorial-ready, high-fashion manicure visuals with effortless styling assistants.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#f6f4f2] text-[#171313] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
