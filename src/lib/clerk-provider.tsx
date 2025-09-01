"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
          card: "bg-white shadow-lg rounded-lg",
          headerTitle: "text-gray-900 font-semibold",
          headerSubtitle: "text-gray-600",
          formFieldLabel: "text-gray-700 font-medium",
          formFieldInput: "border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
