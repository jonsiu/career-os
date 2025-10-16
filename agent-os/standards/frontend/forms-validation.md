## Forms and validation standards

- **Progressive Enhancement**: Forms should work with JavaScript disabled when possible using native HTML forms and server actions
- **Client-Side Validation**: Implement immediate validation feedback using HTML5 validation attributes and JavaScript for better UX
- **Server-Side Validation**: Always validate on the server regardless of client validation; never trust client input
- **Validation Schema Libraries**: Use schema validation libraries (Zod, Yup, etc.) shared between client and server for consistency
- **Error Message Display**: Show field-level errors near the input, with clear, actionable messages telling users how to fix issues
- **Accessibility**: Ensure forms are keyboard navigable, use proper labels, aria-describedby for errors, and aria-live for dynamic updates
- **Loading States**: Disable submit buttons and show loading indicators during submission to prevent duplicate requests
- **Optimistic Updates**: Consider optimistic UI updates for better perceived performance, with rollback on errors
- **Form State Management**: Use controlled components for complex forms; uncontrolled for simple cases to reduce re-renders
- **Type Safety**: Leverage TypeScript to ensure form data types match expected server types and prevent runtime errors
- **File Upload Handling**: Implement proper file validation (size, type), progress indicators, and handle both client and server upload errors
- **Multi-Step Forms**: Persist state between steps, allow navigation back, validate each step, and provide progress indicators
