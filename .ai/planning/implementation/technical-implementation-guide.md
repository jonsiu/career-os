# 🔧 Technical Implementation Guide for Career OS
## API Integration & Architecture

## Overview

This document provides detailed technical implementation guidance for Career OS, focusing on API integrations, vendor abstractions, and system architecture.

## Core Architecture

### **Vendor Abstraction Layer**
```typescript
// Base interfaces for vendor abstraction
interface DatabaseProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query(sql: string, params?: any[]): Promise<any[]>;
  insert(table: string, data: any): Promise<string>;
  update(table: string, id: string, data: any): Promise<void>;
  delete(table: string, id: string): Promise<void>;
}

interface FileStorageProvider {
  upload(file: File, path: string): Promise<string>;
  download(path: string): Promise<File>;
  delete(path: string): Promise<void>;
  getUrl(path: string): Promise<string>;
}

interface AnalysisProvider {
  analyzeResume(resume: Resume): Promise<AnalysisResult>;
  analyzeJob(job: JobPosting): Promise<JobAnalysis>;
  generateContent(prompt: string): Promise<string>;
  extractSkills(text: string): Promise<Skill[]>;
}

interface RealTimeProvider {
  subscribe(channel: string, callback: Function): Promise<void>;
  publish(channel: string, data: any): Promise<void>;
  unsubscribe(channel: string): Promise<void>;
}
```

### **Service Factory Pattern**
```typescript
class ServiceFactory {
  private config: ServiceConfig;
  
  constructor(config: ServiceConfig) {
    this.config = config;
  }
  
  async createDatabaseProvider(): Promise<DatabaseProvider> {
    switch (this.config.database.provider) {
      case 'convex':
        return new ConvexDatabaseProvider(this.config.database);
      case 'postgresql':
        return new PostgreSQLProvider(this.config.database);
      case 'mongodb':
        return new MongoDBProvider(this.config.database);
      default:
        throw new Error(`Unsupported database provider: ${this.config.database.provider}`);
    }
  }
  
  async createAnalysisProvider(): Promise<AnalysisProvider> {
    switch (this.config.analysis.provider) {
      case 'openai':
        return new OpenAIProvider(this.config.analysis);
      case 'anthropic':
        return new AnthropicProvider(this.config.analysis);
      case 'huggingface':
        return new HuggingFaceProvider(this.config.analysis);
      default:
        throw new Error(`Unsupported analysis provider: ${this.config.analysis.provider}`);
    }
  }
}
```

## API Integration Implementation

### **1. O*NET API Integration**
```typescript
class ONETProvider {
  private baseURL = 'https://api.onetcenter.org/ws/mnm/careers';
  
  async getSkills(occupation: string): Promise<Skill[]> {
    const response = await fetch(`${this.baseURL}/${occupation}/skills`);
    const data = await response.json();
    return this.transformSkills(data);
  }
  
  async getCareerPathways(occupation: string): Promise<CareerPath[]> {
    const response = await fetch(`${this.baseURL}/${occupation}/career_pathways`);
    const data = await response.json();
    return this.transformCareerPathways(data);
  }
  
  async getTasks(occupation: string): Promise<Task[]> {
    const response = await fetch(`${this.baseURL}/${occupation}/tasks`);
    const data = await response.json();
    return this.transformTasks(data);
  }
  
  private transformSkills(data: any): Skill[] {
    return data.skills.map((skill: any) => ({
      id: skill.id,
      name: skill.name,
      category: skill.category,
      importance: skill.importance,
      level: skill.level
    }));
  }
}
```

### **2. BLS API Integration**
```typescript
class BLSProvider {
  private baseURL = 'https://api.bls.gov/publicAPI/v2/timeseries/data';
  
  async getWageData(occupation: string, location: string): Promise<WageData> {
    const response = await fetch(`${this.baseURL}/OE${occupation}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seriesid: [`OE${occupation}`],
        startyear: new Date().getFullYear() - 1,
        endyear: new Date().getFullYear()
      })
    });
    const data = await response.json();
    return this.transformWageData(data);
  }
  
  async getEmploymentStats(occupation: string): Promise<EmploymentStats> {
    // Implementation for employment statistics
  }
  
  private transformWageData(data: any): WageData {
    return {
      occupation: data.occupation,
      location: data.location,
      medianWage: data.medianWage,
      percentile25: data.percentile25,
      percentile75: data.percentile75,
      percentile90: data.percentile90
    };
  }
}
```

### **3. Hugging Face API Integration**
```typescript
class HuggingFaceProvider implements AnalysisProvider {
  private baseURL = 'https://api-inference.huggingface.co/models';
  private apiKey: string;
  
  constructor(config: HuggingFaceConfig) {
    this.apiKey = config.apiKey;
  }
  
  async analyzeResume(resume: Resume): Promise<AnalysisResult> {
    const response = await fetch(`${this.baseURL}/microsoft/DialoGPT-medium`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: resume.content,
        parameters: {
          max_length: 100,
          temperature: 0.7
        }
      })
    });
    const data = await response.json();
    return this.transformAnalysisResult(data);
  }
  
  async extractSkills(text: string): Promise<Skill[]> {
    const response = await fetch(`${this.baseURL}/microsoft/DialoGPT-medium`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          max_length: 50,
          temperature: 0.5
        }
      })
    });
    const data = await response.json();
    return this.extractSkillsFromResponse(data);
  }
}
```

### **4. GitHub API Integration**
```typescript
class GitHubProvider {
  private baseURL = 'https://api.github.com';
  private apiKey: string;
  
  constructor(config: GitHubConfig) {
    this.apiKey = config.apiKey;
  }
  
  async validateTechnicalSkills(username: string): Promise<SkillValidation> {
    const response = await fetch(`${this.baseURL}/users/${username}/repos`, {
      headers: {
        'Authorization': `token ${this.apiKey}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    const repos = await response.json();
    return this.analyzeRepositories(repos);
  }
  
  async getProjectRecommendations(skills: string[]): Promise<Project[]> {
    const query = skills.join('+');
    const response = await fetch(`${this.baseURL}/search/repositories?q=${query}&sort=stars&order=desc`);
    const data = await response.json();
    return this.transformProjects(data.items);
  }
  
  private analyzeRepositories(repos: any[]): SkillValidation {
    const skills = new Set<string>();
    const languages = new Map<string, number>();
    
    repos.forEach(repo => {
      if (repo.language) {
        languages.set(repo.language, (languages.get(repo.language) || 0) + 1);
        skills.add(repo.language);
      }
    });
    
    return {
      validatedSkills: Array.from(skills),
      languageDistribution: Object.fromEntries(languages),
      totalRepos: repos.length,
      publicRepos: repos.filter(r => !r.private).length
    };
  }
}
```

### **5. Coursera API Integration**
```typescript
class CourseraProvider {
  private baseURL = 'https://api.coursera.org/api/courses.v1';
  private apiKey: string;
  
  constructor(config: CourseraConfig) {
    this.apiKey = config.apiKey;
  }
  
  async searchCourses(skills: string[]): Promise<Course[]> {
    const query = skills.join(' ');
    const response = await fetch(`${this.baseURL}/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    return this.transformCourses(data.elements);
  }
  
  async getCourseDetails(courseId: string): Promise<CourseDetails> {
    const response = await fetch(`${this.baseURL}/courses/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    return this.transformCourseDetails(data);
  }
  
  private transformCourses(courses: any[]): Course[] {
    return courses.map(course => ({
      id: course.id,
      name: course.name,
      description: course.description,
      instructor: course.instructor,
      duration: course.duration,
      difficulty: course.difficulty,
      rating: course.rating,
      price: course.price,
      affiliateLink: course.affiliateLink
    }));
  }
}
```

## Browser Extension Implementation

### **Extension Manifest**
```json
{
  "manifest_version": 3,
  "name": "Career OS Job Collector",
  "version": "1.0.0",
  "description": "Collect and analyze jobs for Career OS",
  "permissions": [
    "activeTab",
    "storage",
    "tabs",
    "notifications"
  ],
  "host_permissions": [
    "https://*.linkedin.com/*",
    "https://*.indeed.com/*",
    "https://*.glassdoor.com/*",
    "https://*.angel.co/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://*.linkedin.com/*", "https://*.indeed.com/*"],
      "js": ["content.js"]
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Career OS"
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

### **Content Script Implementation**
```typescript
// content.js
class JobDetector {
  private jobSelectors = {
    linkedin: '.jobs-unified-top-card',
    indeed: '.jobsearch-JobInfoHeader',
    glassdoor: '.jobDescriptionContent'
  };
  
  detectJobPosting(): JobPosting | null {
    const currentSite = this.getCurrentSite();
    const selector = this.jobSelectors[currentSite];
    
    if (selector && document.querySelector(selector)) {
      return this.extractJobData(currentSite);
    }
    
    return null;
  }
  
  private extractJobData(site: string): JobPosting {
    switch (site) {
      case 'linkedin':
        return this.extractLinkedInJob();
      case 'indeed':
        return this.extractIndeedJob();
      case 'glassdoor':
        return this.extractGlassdoorJob();
      default:
        return this.extractGenericJob();
    }
  }
  
  private extractLinkedInJob(): JobPosting {
    return {
      title: document.querySelector('.jobs-unified-top-card__job-title')?.textContent || '',
      company: document.querySelector('.jobs-unified-top-card__company-name')?.textContent || '',
      location: document.querySelector('.jobs-unified-top-card__bullet')?.textContent || '',
      description: document.querySelector('.jobs-description-content__text')?.textContent || '',
      url: window.location.href,
      source: 'linkedin'
    };
  }
}
```

### **Background Script Implementation**
```typescript
// background.js
class ExtensionBackground {
  private careerOSAPI = 'https://career-os.vercel.app/api';
  
  async handleBookmarkJob(jobData: JobPosting): Promise<void> {
    try {
      const response = await fetch(`${this.careerOSAPI}/jobs/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify(jobData)
      });
      
      if (response.ok) {
        await this.showNotification('Job bookmarked successfully!');
        await this.updateBadge();
      }
    } catch (error) {
      console.error('Failed to bookmark job:', error);
    }
  }
  
  async syncWithCareerOS(): Promise<void> {
    const bookmarkedJobs = await this.getBookmarkedJobs();
    const response = await fetch(`${this.careerOSAPI}/jobs/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAuthToken()}`
      },
      body: JSON.stringify({ jobs: bookmarkedJobs })
    });
    
    if (response.ok) {
      console.log('Successfully synced with Career OS');
    }
  }
}
```

## Database Schema Updates

### **API Integration Tables**
```sql
-- API usage tracking
CREATE TABLE api_usage (
  id UUID PRIMARY KEY,
  provider VARCHAR(50) NOT NULL,
  endpoint VARCHAR(100) NOT NULL,
  request_count INTEGER DEFAULT 0,
  last_request TIMESTAMP,
  rate_limit_remaining INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cached API responses
CREATE TABLE api_cache (
  id UUID PRIMARY KEY,
  provider VARCHAR(50) NOT NULL,
  endpoint VARCHAR(100) NOT NULL,
  cache_key VARCHAR(255) NOT NULL,
  response_data JSONB NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Job bookmarks from extension
CREATE TABLE job_bookmarks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  description TEXT,
  requirements TEXT[],
  skills TEXT[],
  salary_min INTEGER,
  salary_max INTEGER,
  location VARCHAR(255),
  remote BOOLEAN DEFAULT FALSE,
  url TEXT NOT NULL,
  source VARCHAR(50) NOT NULL,
  user_notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  bookmarked_at TIMESTAMP DEFAULT NOW(),
  last_analyzed TIMESTAMP
);

-- API health monitoring
CREATE TABLE api_health (
  id UUID PRIMARY KEY,
  provider VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  response_time_ms INTEGER,
  error_message TEXT,
  checked_at TIMESTAMP DEFAULT NOW()
);
```

## Performance Optimization

### **Caching Strategy**
```typescript
class APICache {
  private cache = new Map<string, CachedData>();
  private ttl = 3600000; // 1 hour
  
  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }
    
    const data = await fetcher();
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  }
  
  clear(): void {
    this.cache.clear();
  }
}
```

### **Rate Limiting**
```typescript
class RateLimiter {
  private limits = new Map<string, RateLimit>();
  
  async checkLimit(provider: string, endpoint: string): Promise<boolean> {
    const key = `${provider}:${endpoint}`;
    const limit = this.limits.get(key);
    
    if (!limit) {
      this.limits.set(key, {
        requests: 0,
        resetTime: Date.now() + 3600000 // 1 hour
      });
      return true;
    }
    
    if (Date.now() > limit.resetTime) {
      limit.requests = 0;
      limit.resetTime = Date.now() + 3600000;
    }
    
    return limit.requests < this.getRateLimit(provider);
  }
  
  async increment(provider: string, endpoint: string): Promise<void> {
    const key = `${provider}:${endpoint}`;
    const limit = this.limits.get(key);
    
    if (limit) {
      limit.requests++;
    }
  }
}
```

## Error Handling & Monitoring

### **API Error Handling**
```typescript
class APIErrorHandler {
  async handleError(error: Error, provider: string, endpoint: string): Promise<void> {
    console.error(`API Error in ${provider}:${endpoint}`, error);
    
    // Log to monitoring service
    await this.logError(error, provider, endpoint);
    
    // Implement fallback strategies
    if (error.message.includes('rate limit')) {
      await this.handleRateLimit(provider, endpoint);
    } else if (error.message.includes('network')) {
      await this.handleNetworkError(provider, endpoint);
    }
  }
  
  private async handleRateLimit(provider: string, endpoint: string): Promise<void> {
    // Implement exponential backoff
    const delay = Math.pow(2, this.getRetryCount(provider, endpoint)) * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
```

### **Health Monitoring**
```typescript
class HealthMonitor {
  async checkAPIHealth(provider: string): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.getHealthEndpoint(provider)}`);
      const responseTime = Date.now() - startTime;
      
      return {
        provider,
        status: 'healthy',
        responseTime,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        provider,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date()
      };
    }
  }
}
```

---

*This technical implementation guide provides the foundation for building a robust, scalable Career OS platform with comprehensive API integrations.*
