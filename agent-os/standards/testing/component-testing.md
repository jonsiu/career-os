## Component testing standards

- **Test User Behavior**: Test components from user perspective (what they see, click, type) not implementation details
- **Render Tests**: Test that components render correctly with different props and states
- **Interaction Tests**: Test user interactions (clicks, form inputs, keyboard navigation) and resulting state changes
- **Accessibility**: Test keyboard navigation, ARIA attributes, and screen reader compatibility
- **Mock External Dependencies**: Mock API calls, context, and external dependencies to isolate component logic
- **Avoid Implementation Details**: Don't test internal state or private methods; test public interface only
- **Meaningful Assertions**: Assert on user-visible behavior, not internal implementation or component structure
- **Error States**: Test error states, loading states, and edge cases explicitly
- **Snapshot Testing**: Use snapshots sparingly and only for stable components; review snapshot changes carefully
- **Test Utilities**: Use testing library utilities (screen, userEvent) to simulate real user interactions
- **Cleanup**: Ensure proper cleanup after each test to prevent memory leaks and test pollution
- **Custom Hooks Testing**: Test custom hooks in isolation using renderHook utility
- **Test Coverage**: Aim for high coverage of critical components; don't pursue 100% coverage blindly
