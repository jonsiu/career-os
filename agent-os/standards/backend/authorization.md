## Authorization and permissions

- **Role-Based Access Control (RBAC)**: Define clear roles (admin, user, member, etc.) with specific permissions for each role
- **Principle of Least Privilege**: Grant minimum necessary permissions by default; require explicit grants for elevated access
- **Resource-Level Permissions**: Check permissions not just on routes but on individual resources (can user edit THIS post?)
- **Server-Side Checks**: Always verify permissions server-side; never rely solely on hiding UI elements
- **Permission Middleware**: Create reusable permission check middleware/decorators to enforce authorization consistently
- **Multi-Tenancy Isolation**: Ensure users can only access resources within their organization/tenant through database-level filtering
- **Audit Logging**: Log all permission checks and access to sensitive resources for security auditing
- **Permission Caching**: Cache user permissions appropriately but invalidate cache when permissions change
- **Attribute-Based Access**: Support fine-grained permissions based on resource attributes (owner, created date, status)
- **Delegation**: Allow permission delegation (sharing, collaboration) with clear UI showing who has access to what
- **API Key Scoping**: Scope API keys to specific permissions; support read-only vs read-write keys
- **Admin Impersonation**: Implement secure admin impersonation for support with clear audit trails and limitations
