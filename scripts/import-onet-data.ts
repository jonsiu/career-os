/**
 * O*NET Database Import Script
 *
 * Downloads and imports O*NET 30.0 database into Convex
 * Uses tab-delimited text files (free, no API key needed)
 *
 * Usage:
 *   npm run import-onet
 *
 * This script:
 * 1. Downloads O*NET database (text format)
 * 2. Parses occupation data, skills, knowledge, abilities
 * 3. Imports into Convex onetCache table
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import AdmZip from 'adm-zip';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: path.join(__dirname, '../.env.local') });

const ONET_VERSION = '30_0';
const DOWNLOAD_URL = `https://www.onetcenter.org/dl_files/database/db_${ONET_VERSION}_text.zip`;
const TEMP_DIR = path.join(__dirname, '../temp');
const ZIP_PATH = path.join(TEMP_DIR, 'onet_db.zip');

interface OccupationData {
  code: string;
  title: string;
  description: string;
}

interface SkillData {
  occupationCode: string;
  skillName: string;
  skillCode: string;
  importance: number;
  level: number;
  category: string;
}

/**
 * Download O*NET database
 */
async function downloadDatabase(): Promise<void> {
  console.log('📥 Downloading O*NET database...');

  // Create temp directory
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(ZIP_PATH);

    https.get(DOWNLOAD_URL, (response) => {
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log('✅ Download complete');
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(ZIP_PATH);
      reject(err);
    });
  });
}

/**
 * Extract ZIP file
 */
function extractDatabase(): void {
  console.log('📦 Extracting database files...');

  const zip = new AdmZip(ZIP_PATH);
  zip.extractAllTo(TEMP_DIR, true);

  console.log('✅ Extraction complete');
}

/**
 * Parse tab-delimited file
 */
function parseTabFile(filename: string): any[] {
  const filePath = path.join(TEMP_DIR, `db_${ONET_VERSION}_text`, filename);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filename}`);
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  if (lines.length === 0) return [];

  // First line is headers
  const headers = lines[0].split('\t');

  // Parse data rows
  const data = lines.slice(1).map(line => {
    const values = line.split('\t');
    const row: any = {};

    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });

    return row;
  });

  return data;
}

/**
 * Parse occupations
 */
function parseOccupations(): Map<string, OccupationData> {
  console.log('📋 Parsing occupations...');

  const occupations = parseTabFile('Occupation Data.txt');
  const occupationMap = new Map<string, OccupationData>();

  for (const occ of occupations) {
    occupationMap.set(occ['O*NET-SOC Code'], {
      code: occ['O*NET-SOC Code'],
      title: occ['Title'],
      description: occ['Description'] || occ['Title'],
    });
  }

  console.log(`✅ Parsed ${occupationMap.size} occupations`);
  return occupationMap;
}

/**
 * Parse skills for an occupation
 */
function parseSkills(): Map<string, SkillData[]> {
  console.log('🎯 Parsing skills...');

  const skills = parseTabFile('Skills.txt');
  const skillsByOccupation = new Map<string, SkillData[]>();

  for (const skill of skills) {
    const occCode = skill['O*NET-SOC Code'];
    const skillCode = skill['Element ID'];
    const skillName = skill['Element Name'];

    // Parse importance and level (values are on 1-5 or 0-7 scales)
    const dataValue = parseFloat(skill['Data Value']) || 0;
    const scaleId = skill['Scale ID'];

    let importance = 50;
    let level = 50;

    if (scaleId === 'IM') {
      // Importance scale (1-5)
      importance = Math.round((dataValue / 5) * 100);
    } else if (scaleId === 'LV') {
      // Level scale (0-7)
      level = Math.round((dataValue / 7) * 100);
    }

    // Determine category based on skill code
    const category = skillCode.startsWith('2.A') ? 'Basic Skills' : 'Technical Skills';

    if (!skillsByOccupation.has(occCode)) {
      skillsByOccupation.set(occCode, []);
    }

    skillsByOccupation.get(occCode)!.push({
      skillName,
      skillCode,
      importance,
      level,
      category,
    });
  }

  console.log(`✅ Parsed skills for ${skillsByOccupation.size} occupations`);
  return skillsByOccupation;
}

/**
 * Parse knowledge areas
 */
function parseKnowledge(): Map<string, any[]> {
  console.log('📚 Parsing knowledge areas...');

  const knowledge = parseTabFile('Knowledge.txt');
  const knowledgeByOccupation = new Map<string, any[]>();

  for (const item of knowledge) {
    const occCode = item['O*NET-SOC Code'];
    const name = item['Element Name'];
    const dataValue = parseFloat(item['Data Value']) || 0;
    const scaleId = item['Scale ID'];

    let importance = 50;
    let level = 50;

    if (scaleId === 'IM') {
      importance = Math.round((dataValue / 5) * 100);
    } else if (scaleId === 'LV') {
      level = Math.round((dataValue / 7) * 100);
    }

    if (!knowledgeByOccupation.has(occCode)) {
      knowledgeByOccupation.set(occCode, []);
    }

    knowledgeByOccupation.get(occCode)!.push({
      name,
      importance,
      level,
    });
  }

  console.log(`✅ Parsed knowledge for ${knowledgeByOccupation.size} occupations`);
  return knowledgeByOccupation;
}

/**
 * Parse abilities
 */
function parseAbilities(): Map<string, any[]> {
  console.log('💪 Parsing abilities...');

  const abilities = parseTabFile('Abilities.txt');
  const abilitiesByOccupation = new Map<string, any[]>();

  for (const item of abilities) {
    const occCode = item['O*NET-SOC Code'];
    const name = item['Element Name'];
    const dataValue = parseFloat(item['Data Value']) || 0;
    const scaleId = item['Scale ID'];

    let importance = 50;
    let level = 50;

    if (scaleId === 'IM') {
      importance = Math.round((dataValue / 5) * 100);
    } else if (scaleId === 'LV') {
      level = Math.round((dataValue / 7) * 100);
    }

    if (!abilitiesByOccupation.has(occCode)) {
      abilitiesByOccupation.set(occCode, []);
    }

    abilitiesByOccupation.get(occCode)!.push({
      name,
      importance,
      level,
    });
  }

  console.log(`✅ Parsed abilities for ${abilitiesByOccupation.size} occupations`);
  return abilitiesByOccupation;
}

/**
 * Import data into Convex
 */
async function importToConvex(): Promise<void> {
  console.log('🚀 Importing to Convex...');

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error('NEXT_PUBLIC_CONVEX_URL environment variable not set');
  }

  const convex = new ConvexHttpClient(convexUrl);

  // Parse all data
  const occupations = parseOccupations();
  const skills = parseSkills();
  const knowledge = parseKnowledge();
  const abilities = parseAbilities();

  // Import each occupation
  let imported = 0;
  let errors = 0;

  for (const [code, occupation] of occupations) {
    try {
      const occupationSkills = skills.get(code) || [];
      const occupationKnowledge = knowledge.get(code) || [];
      const occupationAbilities = abilities.get(code) || [];

      // Skip if no data
      if (occupationSkills.length === 0 && occupationKnowledge.length === 0) {
        continue;
      }

      await convex.mutation(api.onetCache.cacheOccupation, {
        occupationCode: occupation.code,
        occupationTitle: occupation.title,
        skills: occupationSkills,
        knowledgeAreas: occupationKnowledge,
        abilities: occupationAbilities,
        laborMarketData: {
          employmentOutlook: 'Average',
          medianSalary: undefined,
          growthRate: undefined,
        },
        cacheVersion: '30.0',
      });

      imported++;

      if (imported % 50 === 0) {
        console.log(`   Imported ${imported} occupations...`);
      }

    } catch (error) {
      errors++;
      console.error(`   Error importing ${code}:`, error);
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   Successfully imported: ${imported}`);
  console.log(`   Errors: ${errors}`);
}

/**
 * Cleanup temp files
 */
function cleanup(): void {
  console.log('🧹 Cleaning up...');

  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }

  console.log('✅ Cleanup complete');
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🎯 O*NET Database Import Script\n');

    await downloadDatabase();
    extractDatabase();
    await importToConvex();
    cleanup();

    console.log('\n🎉 All done! Your Convex database now has O*NET occupation data.');

  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
