import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

// Create a Convex HTTP client for server-side operations
export const convexClient = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || "http://localhost:8000"
);

// Export the API for type safety
export { api };
