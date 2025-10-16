## Client state management patterns

- **State Locality**: Keep state as local as possible; only lift state up when truly shared across components
- **Server State vs Client State**: Distinguish between server state (data from APIs) and client state (UI state); use appropriate tools for each
- **URL as State**: Use URL parameters and search params for shareable UI state (filters, tabs, pagination) to enable deep linking
- **Server State Libraries**: Use React Query, SWR, or similar for server state to handle caching, revalidation, and synchronization
- **Global UI State**: For shared UI state (modals, themes, sidebar), use Context API, Zustand, or similar lightweight solutions
- **Form State**: Keep form state local with useState or use form libraries (React Hook Form, Formik) for complex forms
- **Optimistic Updates**: Update UI immediately on user action, then reconcile with server response for better perceived performance
- **Stale-While-Revalidate**: Show cached data immediately while fetching fresh data in the background for better UX
- **State Persistence**: Persist critical UI state (theme, preferences) to localStorage or cookies for continuity across sessions
- **Derived State**: Compute derived state from existing state rather than storing it separately to avoid sync issues
- **Immutable Updates**: Always update state immutably; use spread operators or libraries like Immer for complex nested updates
- **Avoid Prop Drilling**: Use composition, Context, or state management libraries to avoid passing props through many layers
