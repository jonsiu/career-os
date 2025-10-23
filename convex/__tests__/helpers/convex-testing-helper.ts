/**
 * Convex Testing Helper
 *
 * Provides utilities for testing Convex queries and mutations in isolation.
 * This is a mock implementation that simulates Convex database operations.
 */

export class ConvexTestingHelper {
  private mockDb: Map<string, Map<string, any>>;

  constructor() {
    this.mockDb = new Map();
  }

  /**
   * Execute a Convex query
   */
  async query(table: string, operation: string, args: any): Promise<any> {
    const tableData = this.mockDb.get(table) || new Map();

    switch (operation) {
      case 'getOccupation':
        return this.getOccupationByCode(tableData, args.code);

      case 'searchOccupations':
        return this.searchOccupations(tableData, args.query);

      case 'getValidCache':
        return this.getValidCache(tableData, args.code);

      default:
        throw new Error(`Unknown query operation: ${operation}`);
    }
  }

  /**
   * Execute a Convex mutation
   */
  async mutation(table: string, operation: string, args: any): Promise<any> {
    if (!this.mockDb.has(table)) {
      this.mockDb.set(table, new Map());
    }

    const tableData = this.mockDb.get(table)!;

    switch (operation) {
      case 'cacheOccupation':
        return this.cacheOccupation(tableData, args);

      case 'cleanupExpiredCache':
        return this.cleanupExpiredCache(tableData);

      default:
        throw new Error(`Unknown mutation operation: ${operation}`);
    }
  }

  /**
   * Direct insert for testing (bypasses normal mutation logic)
   */
  async directInsert(table: string, data: any): Promise<string> {
    if (!this.mockDb.has(table)) {
      this.mockDb.set(table, new Map());
    }

    const tableData = this.mockDb.get(table)!;
    const id = `${table}_${Date.now()}_${Math.random()}`;

    tableData.set(data.occupationCode, {
      _id: id,
      ...data
    });

    return id;
  }

  // Private helper methods

  private getOccupationByCode(tableData: Map<string, any>, code: string): any | null {
    return tableData.get(code) || null;
  }

  private searchOccupations(tableData: Map<string, any>, query: string): any[] {
    const results: any[] = [];
    const lowerQuery = query.toLowerCase();

    tableData.forEach((occupation) => {
      if (occupation.occupationTitle.toLowerCase().includes(lowerQuery)) {
        results.push(occupation);
      }
    });

    return results;
  }

  private getValidCache(tableData: Map<string, any>, code: string): any | null {
    const cached = tableData.get(code);

    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (cached.expiresAt <= now) {
      return null; // Expired
    }

    return cached;
  }

  private cacheOccupation(tableData: Map<string, any>, data: any): string {
    const now = Date.now();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

    const existingEntry = tableData.get(data.occupationCode);
    const id = existingEntry?._id || `onetCache_${Date.now()}_${Math.random()}`;

    const cacheEntry = {
      _id: id,
      occupationCode: data.occupationCode,
      occupationTitle: data.occupationTitle,
      skills: data.skills || [],
      knowledgeAreas: data.knowledgeAreas || [],
      abilities: data.abilities || [],
      laborMarketData: data.laborMarketData,
      cacheVersion: data.cacheVersion,
      createdAt: existingEntry?.createdAt || now,
      expiresAt: now + thirtyDaysInMs,
      updatedAt: now
    };

    tableData.set(data.occupationCode, cacheEntry);

    return id;
  }

  private cleanupExpiredCache(tableData: Map<string, any>): number {
    const now = Date.now();
    let deletedCount = 0;

    const codesToDelete: string[] = [];

    tableData.forEach((entry, code) => {
      if (entry.expiresAt <= now) {
        codesToDelete.push(code);
      }
    });

    codesToDelete.forEach((code) => {
      tableData.delete(code);
      deletedCount++;
    });

    return deletedCount;
  }
}
