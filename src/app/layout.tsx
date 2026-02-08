import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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
  title: "SeederWorks — Email Generator",
  description: "AI-powered cold email generator that actually gets replies",
  icons: {
    icon: "/seederworkslogo.svg",
    apple: "/seederworkslogo.png",
  },
  openGraph: {
    title: "SeederWorks — Email Generator",
    description: "AI-powered cold email generator that actually gets replies",
    images: ["/seederworkslogo.png"],
  },
  twitter: {
    card: "summary",
    title: "SeederWorks — Email Generator",
    description: "AI-powered cold email generator that actually gets replies",
    images: ["/seederworkslogo.png"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
