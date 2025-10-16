## Authentication and session management

- **Secure Session Storage**: Use secure, httpOnly cookies for session tokens; avoid localStorage for sensitive tokens
- **Token Expiration**: Implement reasonable token expiration times with refresh token rotation for security
- **Password Requirements**: Enforce strong password requirements and use bcrypt or Argon2 for hashing with appropriate work factors
- **Multi-Factor Authentication**: Provide MFA options (TOTP, SMS, email) for enhanced security, especially for sensitive operations
- **OAuth/SSO Integration**: Support social login and enterprise SSO (Google, GitHub, SAML) for better user experience
- **Email Verification**: Require email verification for new accounts to prevent spam and validate user identity
- **Password Reset Flow**: Implement secure password reset with time-limited tokens sent via email
- **Session Management**: Allow users to view active sessions and revoke them; invalidate sessions on password change
- **Brute Force Protection**: Implement rate limiting and account lockout after failed login attempts
- **Secure Password Recovery**: Use secure, time-limited tokens for password recovery; never expose user emails in error messages
- **Auth Middleware**: Centralize authentication logic in middleware to ensure consistent checks across protected routes
- **Role-Based Access**: Integrate authentication with authorization system to check user permissions on protected operations
