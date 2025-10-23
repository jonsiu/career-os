# O*NET Database Import

This script imports the free O*NET occupation database into your Convex database, eliminating the need for an O*NET API key.

## What is O*NET?

O*NET (Occupational Information Network) is a comprehensive database of occupational data maintained by the U.S. Department of Labor. It contains:

- 1,000+ occupations covering the entire U.S. economy
- Skills, knowledge, and abilities for each occupation
- Work activities, tasks, and context
- Education and experience requirements

## Why Import Instead of Using the API?

1. **No API Key Required** - The O*NET API requires government approval
2. **Free Forever** - One-time download, no rate limits
3. **Faster** - Local data queries are instant
4. **Offline** - Works without internet connection
5. **Cost-Effective** - No API costs

## How It Works

The script:

1. **Downloads** the latest O*NET database (v30.0) as tab-delimited text files (~50MB)
2. **Parses** occupation data, skills, knowledge, and abilities
3. **Imports** into your Convex `onetCache` table
4. **Cleans up** temporary files

## Prerequisites

- Convex project set up (`NEXT_PUBLIC_CONVEX_URL` in `.env.local`)
- Node.js 18+
- ~500MB free disk space (temporary, deleted after import)

## Usage

```bash
# Run the import script
npm run import-onet
```

The script will:
- Download O*NET database (~50MB)
- Extract and parse files
- Import ~900 occupations into Convex
- Clean up temp files

Expected runtime: **5-10 minutes** depending on your internet speed.

## What Gets Imported

For each occupation, the script imports:

- **Occupation Code** (e.g., "15-1252.00")
- **Title** (e.g., "Software Developers")
- **Skills** (8-12 per occupation)
  - Skill name, code, importance (0-100), level (0-100), category
- **Knowledge Areas** (5-8 per occupation)
  - Name, importance, level
- **Abilities** (5-8 per occupation)
  - Name, importance, level

## After Import

Once imported, your app will:
- Use local O*NET data instead of API calls
- Have instant occupation lookups
- Work offline
- No API rate limits

## Updating the Database

O*NET releases new versions periodically. To update:

1. Edit `import-onet-data.ts` and change `ONET_VERSION` to the new version
2. Run `npm run import-onet` again

Current version: **30.0** (released December 2024)

## Data Structure

Data is stored in the `onetCache` Convex table with 30-day TTL:

```typescript
{
  occupationCode: string;      // "15-1252.00"
  occupationTitle: string;     // "Software Developers"
  skills: Array<{
    skillName: string;
    skillCode: string;
    importance: number;        // 0-100
    level: number;            // 0-100
    category: string;         // "Technical Skills" | "Basic Skills"
  }>;
  knowledgeAreas: Array<{
    name: string;
    importance: number;       // 0-100
    level: number;           // 0-100
  }>;
  abilities: Array<{
    name: string;
    importance: number;
    level: number;
  }>;
  laborMarketData: {
    employmentOutlook: string;
    medianSalary?: number;
    growthRate?: number;
  };
  cacheVersion: string;       // "30.0"
}
```

## Troubleshooting

### "NEXT_PUBLIC_CONVEX_URL environment variable not set"
- Make sure `.env.local` exists with your Convex URL
- Run `npm run dev:convex` to ensure Convex is configured

### "Error importing [occupation code]"
- Check Convex dashboard for error details
- Ensure your Convex deployment is running
- Try running the script again (it will skip already-imported occupations)

### Script hangs during download
- Check your internet connection
- Try running again (will resume if partially downloaded)

## License

O*NET data is in the public domain and free to use.
Licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

## Credits

Data provided by the U.S. Department of Labor, Employment and Training Administration.
Visit https://www.onetcenter.org for more information.
