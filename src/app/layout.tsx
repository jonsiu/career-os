import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ClientProviders } from "@/components/providers/client-providers";

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
      <ClientProviders>
        <html lang="en">
          <body className={inter.className}>
            {children}
          </body>
        </html>
      </ClientProviders>
    </ClerkProvider>
  );
}
