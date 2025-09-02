import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "@/lib/convex-provider";
import { ConvexReactClient } from "convex/react";
import { Toaster } from "@/components/ui/toaster";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CareerOS - AI-Powered Career Development Platform",
  description: "Build your career with AI-powered resume analysis, job matching, and personalized development planning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk convex={convex}>
        <html lang="en">
          <body className={inter.className}>
            {children}
            <Toaster />
          </body>
        </html>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
