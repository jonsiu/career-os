"use client";

import { ConvexProviderWrapper } from "@/lib/convex-provider";
import { Toaster } from "@/components/ui/toaster";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProviderWrapper>
      {children}
      <Toaster />
    </ConvexProviderWrapper>
  );
}
