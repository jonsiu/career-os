## CI/CD pipeline standards

- **Automated Testing**: Run all tests (unit, integration, E2E) on every pull request before merging
- **Preview Deployments**: Deploy preview environments for every PR to test changes in production-like environment
- **Lint and Format**: Enforce linting and formatting checks in CI to maintain code quality
- **Type Checking**: Run TypeScript type checking in CI to catch type errors before deployment
- **Database Migrations**: Run migrations automatically on deployment; test migrations in preview environments first
- **Build Verification**: Ensure production build succeeds in CI before allowing merge
- **Deployment Strategy**: Use zero-downtime deployment strategies; consider blue-green or rolling deployments
- **Rollback Plan**: Maintain ability to quickly rollback to previous version if issues are detected
- **Health Checks**: Implement health check endpoints; verify health after deployment before routing traffic
- **Environment Promotion**: Deploy to staging first, verify, then promote to production
- **Semantic Versioning**: Tag releases with semantic versions for clear versioning and rollback capability
- **Deployment Notifications**: Send notifications (Slack, email) on deployment success/failure
- **Security Scanning**: Run security scans on dependencies and code in CI pipeline
