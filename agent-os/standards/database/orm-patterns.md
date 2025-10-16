## ORM patterns and best practices

- **Schema Definition**: Define database schema using ORM schema files (Prisma schema, TypeORM entities) as source of truth
- **Type Safety**: Leverage ORM-generated TypeScript types throughout application to prevent type mismatches
- **Relationships**: Define relationships explicitly in schema with appropriate cascade and referential actions
- **Lazy vs Eager Loading**: Use eager loading (includes/joins) for known relationships; lazy load to avoid N+1 queries
- **Query Building**: Prefer ORM query builders over raw SQL for common operations; use raw SQL for complex queries
- **Transactions**: Wrap related operations in transactions to ensure data consistency and atomicity
- **Connection Pooling**: Configure appropriate connection pool settings based on expected load and database limits
- **Soft Deletes**: Implement soft deletes (deleted_at) for user-facing data to enable recovery and audit trails
- **Optimistic Locking**: Use version fields or timestamps for optimistic locking on frequently updated records
- **Query Optimization**: Monitor slow queries; add indexes, optimize includes, or denormalize when necessary
- **Migration Safety**: Test migrations in development; avoid data loss; include both up and down migrations
- **Seeding**: Create database seeders for development and testing; keep production seed data separate
