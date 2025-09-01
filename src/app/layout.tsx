import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProviderWrapper } from "@/lib/clerk-provider";
import { ConvexProviderWrapper } from "@/lib/convex-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareerOS - Your Personal Career Development Platform",
  description: "Build your career path with AI-powered analysis, resume building, and development planning",
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
        <ClerkProviderWrapper>
          <ConvexProviderWrapper>
            {children}
          </ConvexProviderWrapper>
        </ClerkProviderWrapper>
      </body>
    </html>
  );
}
