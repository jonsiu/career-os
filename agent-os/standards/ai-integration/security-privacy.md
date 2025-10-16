## AI security and privacy

- **Data Minimization**: Send only necessary data to AI services; avoid sending PII when possible
- **User Consent**: Obtain user consent before sending their data to third-party AI services
- **Data Anonymization**: Anonymize or pseudonymize data before sending to AI when feasible
- **Provider Selection**: Choose AI providers with strong privacy commitments and data processing agreements
- **Data Retention**: Understand AI provider's data retention policies; use zero-retention options when available
- **Audit Logging**: Log all AI requests with user context for security audits and debugging
- **Input Validation**: Validate and sanitize user inputs before sending to AI to prevent prompt injection
- **Output Sanitization**: Sanitize AI outputs before displaying to users to prevent XSS or injection attacks
- **Content Moderation**: Implement content moderation on AI inputs and outputs to detect harmful content
- **Access Controls**: Restrict AI feature access based on user permissions and subscription tier
- **API Key Security**: Secure AI API keys properly; rotate keys regularly; use environment variables
- **Compliance**: Ensure AI usage complies with GDPR, CCPA, HIPAA (if applicable) and other regulations
- **Transparency**: Maintain transparency about AI usage in privacy policy and terms of service
