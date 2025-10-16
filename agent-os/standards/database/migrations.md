## Database migration strategies

- **Version Control**: Always commit migration files to version control; migrations are code and part of application history
- **Sequential Naming**: Use timestamp-based naming for migrations to ensure correct ordering across team members
- **Idempotent Migrations**: Make migrations idempotent when possible so they can be safely re-run without errors
- **Backward Compatibility**: Write backward-compatible migrations to support zero-downtime deployments with multiple app versions
- **Data Migrations**: Separate schema migrations from data migrations; run data migrations after schema changes are deployed
- **Testing Migrations**: Test migrations against production-like data volumes to catch performance issues before deployment
- **Rollback Strategy**: Include down migrations for rollback capability; test rollback procedures regularly
- **Additive Changes**: Prefer additive changes (add column with default) over destructive ones (drop column immediately)
- **Multi-Step Changes**: Break breaking changes into multiple deployments: add new, migrate data, remove old
- **Index Creation**: Create indexes concurrently (if supported) to avoid locking tables during deployment
- **Column Defaults**: Add columns with default values to avoid null issues and simplify migration
- **Migration Size**: Keep migrations small and focused; avoid combining unrelated schema changes in single migration
