import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard d'Analyse Stage",
  description: "Dashboard d'Analyse Stage de l'IsIMM",
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
   <html>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
