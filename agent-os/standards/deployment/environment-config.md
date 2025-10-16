## Environment configuration management

- **12-Factor Config**: Store configuration in environment variables, never commit secrets to version control
- **Environment Files**: Use .env files locally; add .env.example to version control with dummy values as template
- **Secret Management**: Use platform secret management (Vercel secrets, Railway variables) for production secrets
- **Environment Separation**: Maintain separate configurations for development, staging, and production environments
- **Required Variables**: Validate required environment variables at application startup; fail fast if missing
- **Type Safety**: Use typed environment variable libraries (zod, envalid) to validate and parse env vars
- **Local Defaults**: Provide sensible defaults for development; require explicit configuration in production
- **Database URLs**: Use connection string format for database configuration; parse components as needed
- **Feature Flags**: Use environment variables for feature flags to enable/disable features per environment
- **API Keys**: Rotate API keys regularly; use different keys per environment to prevent production exposure
- **Logging**: Configure different log levels per environment (verbose in dev, errors only in prod)
- **Documentation**: Document all environment variables in README with purpose, format, and required/optional status
