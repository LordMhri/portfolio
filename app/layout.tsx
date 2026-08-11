import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { FluidCursor } from "@/components/FluidCursor/FluidCursor";
import { GrainOverlay } from "@/components/GrainOverlay/GrainOverlay";
import { NavBar } from "@/components/NavBar/NavBar";
import { ScrollTheater } from "@/components/ScrollTheater/ScrollTheater";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans-var",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-var",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meheret Alemu — Backend Engineer & ML Enthusiast",
  description:
    "Portfolio of a backend engineer specialising in distributed systems, high-performance APIs, and machine learning infrastructure.",
  keywords: ["backend engineer", "ml engineer", "distributed systems", "golang", "python", "portfolio"],
  openGraph: {
    title: "Meheret Alemu — Backend Engineer",
    description: "Building scalable systems · Exploring ML",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
        <Providers>
          <ScrollTheater />
          <FluidCursor />
          <GrainOverlay />

          <NavBar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
