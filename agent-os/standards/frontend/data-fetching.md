## Data fetching patterns

- **Server Components for Initial Data**: Fetch initial page data in Server Components to reduce client bundle and improve TTI
- **Parallel Data Fetching**: Initiate all data fetching in parallel at the same level to minimize waterfalls and reduce total load time
- **Deduplication**: Leverage automatic request deduplication in Server Components; same fetch calls are automatically cached per request
- **Revalidation Strategy**: Configure appropriate revalidation (ISR, on-demand, time-based) based on data freshness requirements
- **Client-Side Fetching**: Use SWR, React Query, or similar for client-side data fetching with built-in caching and revalidation
- **Error Handling**: Handle loading and error states gracefully; provide retry mechanisms and user-friendly error messages
- **Type Safety**: Generate TypeScript types from API schemas or use shared type definitions to ensure type safety across stack
- **Authentication Headers**: Include authentication tokens in requests; handle token refresh and unauthorized responses consistently
- **Request Cancellation**: Cancel in-flight requests when components unmount or when new requests supersede old ones
- **Pagination**: Implement cursor or offset pagination; consider infinite scroll or load more patterns for better UX
- **Real-Time Updates**: Use WebSockets, Server-Sent Events, or polling for real-time data when required by product needs
- **Optimistic Updates**: Update UI immediately on mutations, then revalidate; rollback on server errors for better UX
- **Cache Management**: Understand cache behavior; manually revalidate or invalidate cache when data changes from mutations
