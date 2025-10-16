## Database performance optimization

- **Index Strategy**: Index foreign keys, frequently queried columns, and columns used in WHERE/ORDER BY clauses
- **Composite Indexes**: Create composite indexes for multi-column queries; order columns by selectivity (most selective first)
- **Query Analysis**: Use EXPLAIN/ANALYZE to understand query execution plans and identify optimization opportunities
- **N+1 Query Prevention**: Use eager loading or DataLoader pattern to batch queries and eliminate N+1 query problems
- **Pagination**: Implement cursor-based pagination for large datasets instead of offset-based for better performance
- **Caching**: Cache frequently accessed, rarely changing data at application level (Redis) to reduce database load
- **Connection Pooling**: Configure connection pools appropriately; monitor pool saturation and adjust based on load
- **Read Replicas**: Use read replicas for read-heavy workloads; route read queries to replicas to reduce primary load
- **Denormalization**: Selectively denormalize data (materialized views, computed columns) when joins become bottleneck
- **Batch Operations**: Batch inserts/updates when possible instead of individual operations to reduce round trips
- **Query Timeout**: Set query timeouts to prevent runaway queries from consuming resources
- **Monitoring**: Monitor slow query logs, connection counts, and database metrics to proactively identify issues
