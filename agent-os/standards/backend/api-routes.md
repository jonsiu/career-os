## API routes and internal APIs

- **Server Actions vs API Routes**: Prefer Server Actions for mutations from Server Components; use API Routes for external integrations and webhooks
- **RESTful Conventions**: Follow REST principles for API routes even in internal APIs for consistency and predictability
- **Request Validation**: Validate all request inputs using schema libraries (Zod, Yup) before processing
- **Error Responses**: Return consistent error response format with appropriate HTTP status codes and actionable error messages
- **Type Safety**: Share TypeScript types between API routes and client code to ensure type safety across the stack
- **Authentication**: Verify authentication on every protected route; never trust client-side auth state alone
- **Rate Limiting**: Implement rate limiting on API routes to prevent abuse, especially for public-facing endpoints
- **CORS Configuration**: Configure CORS appropriately for routes accessed from external origins; be restrictive by default
- **Response Caching**: Set appropriate cache headers (Cache-Control, ETag) for cacheable responses to reduce server load
- **Streaming Responses**: Use streaming for large responses or real-time data to improve perceived performance
- **Idempotency**: Make POST/PUT/PATCH requests idempotent where possible to safely handle retries
- **Webhook Handling**: Validate webhook signatures, use idempotency keys, and implement retry logic for outbound webhooks
