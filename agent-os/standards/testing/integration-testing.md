## Integration testing standards

- **Test Real Integrations**: Test actual database, API routes, and business logic integration rather than mocking everything
- **Database Testing**: Use test database with migrations; reset between tests for consistency
- **API Testing**: Test API endpoints with real requests; verify status codes, response shape, and data correctness
- **Authentication Testing**: Test protected routes with and without authentication; verify authorization logic
- **Transaction Rollback**: Wrap tests in transactions and rollback for fast cleanup; or truncate tables between tests
- **Test Data Factories**: Use factories to generate test data consistently with valid relationships
- **External Services**: Mock external services (payment providers, email services) while testing their integration points
- **Error Scenarios**: Test error handling, validation errors, and edge cases explicitly
- **Concurrent Operations**: Test race conditions and concurrent operations where relevant (e.g., inventory, seats)
- **Background Jobs**: Test background job processing; verify jobs are enqueued and process correctly
- **Webhook Testing**: Test webhook endpoints with mock payloads from external services
- **Multi-Tenancy**: Test tenant isolation in integration tests to prevent data leakage between tenants
- **Performance**: Monitor test execution time; slow integration tests indicate potential production performance issues
