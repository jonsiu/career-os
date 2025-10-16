## End-to-end testing standards

- **Critical User Flows**: Focus E2E tests on critical user journeys (signup, login, core features, checkout) rather than comprehensive coverage
- **Test Isolation**: Each test should be independent; use separate test accounts/data to prevent test interdependencies
- **Stable Selectors**: Use data-testid attributes for selectors; avoid relying on CSS classes or implementation details
- **Wait Strategies**: Use explicit waits for elements/conditions rather than arbitrary timeouts to reduce flakiness
- **Visual Testing**: Implement screenshot comparison testing for critical UI to catch visual regressions
- **Authentication**: Reuse authentication state across tests to avoid repetitive login flows and speed up test execution
- **Test Data Management**: Create and clean up test data within tests; use factories or seeders for consistent test data
- **Parallel Execution**: Run tests in parallel to reduce total execution time; ensure tests don't interfere with each other
- **CI Integration**: Run E2E tests in CI on every PR; use preview deployments for testing against real environment
- **Failure Debugging**: Capture screenshots and videos on test failures to aid debugging
- **API Mocking**: Mock external APIs in E2E tests to avoid dependencies on third-party services
- **Mobile Testing**: Test responsive behavior and mobile viewports for critical flows
- **Accessibility Testing**: Include automated accessibility checks in E2E tests using axe or similar tools
