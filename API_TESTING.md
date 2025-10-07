# CareerOS API Testing Guide

## Overview

This document outlines the comprehensive unit tests for the CareerOS API endpoints that support the browser extension integration.

## Test Coverage

### 1. Health Check API (`/api/health`)

**Endpoint**: `GET /api/health`  
**Purpose**: Verify CareerOS connectivity  
**Authentication**: None required  

#### Test Cases:
- ✅ **Returns health status successfully**
- ✅ **Returns valid timestamp**
- ✅ **Includes environment information**

#### Expected Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "development",
  "services": {
    "database": "connected",
    "auth": "available",
    "api": "operational"
  }
}
```

### 2. Job Bookmark API (`/api/jobs/bookmark`)

**Endpoint**: `POST /api/jobs/bookmark`  
**Purpose**: Save a single job from extension  
**Authentication**: Required (Clerk)  

#### Test Cases:

##### ✅ **Success Cases:**
- **Valid job data** - Creates job successfully
- **Minimal required fields** - Handles optional fields correctly
- **All optional fields** - Processes complete job data

##### ❌ **Error Cases:**
- **Missing title** - Returns 400 error
- **Missing company** - Returns 400 error  
- **Missing description** - Returns 400 error
- **Unauthenticated request** - Returns 401 error
- **User not found** - Returns 404 error
- **Convex errors** - Returns 500 error

#### Valid Payload:
```json
{
  "title": "Software Engineer",
  "company": "Tech Corp",
  "description": "Build amazing software",
  "requirements": ["JavaScript", "React"],
  "location": "San Francisco",
  "salary": "$120k",
  "url": "https://example.com/job",
  "source": "LinkedIn",
  "skills": ["JavaScript", "React"],
  "remote": false,
  "deadline": "2024-12-31",
  "userNotes": "Great opportunity",
  "rating": 5
}
```

#### Error Responses:
```json
// 400 Bad Request
{ "error": "Title, company, and description are required" }

// 401 Unauthorized
{ "error": "Unauthorized" }

// 404 Not Found
{ "error": "User not found" }

// 500 Internal Server Error
{ "error": "Internal server error" }
```

### 3. Job Sync API (`/api/jobs/sync`)

**Endpoint**: `POST /api/jobs/sync`  
**Purpose**: Sync multiple jobs from extension  
**Authentication**: Required (Clerk)  

#### Test Cases:

##### ✅ **Success Cases:**
- **Valid jobs array** - Syncs all jobs successfully
- **Duplicate detection** - Handles existing jobs correctly
- **Empty jobs array** - Handles empty input gracefully
- **Partial failures** - Continues processing despite individual failures

##### ❌ **Error Cases:**
- **Invalid jobs format** - Returns 400 error
- **Missing jobs field** - Returns 400 error
- **Unauthenticated request** - Returns 401 error
- **User not found** - Returns 404 error
- **Convex errors** - Returns 500 error

#### Valid Payload:
```json
{
  "jobs": [
    {
      "title": "Software Engineer",
      "company": "Tech Corp",
      "description": "Build amazing software",
      "requirements": ["JavaScript", "React"],
      "location": "San Francisco",
      "salary": "$120k",
      "url": "https://example.com/job1",
      "source": "LinkedIn",
      "skills": ["JavaScript", "React"],
      "remote": false,
      "deadline": "2024-12-31",
      "userNotes": "Great opportunity",
      "rating": 5
    },
    {
      "title": "Product Manager",
      "company": "Startup Inc",
      "description": "Lead product development",
      "requirements": ["Product Management", "Agile"],
      "location": "New York",
      "salary": "$150k",
      "url": "https://example.com/job2",
      "source": "Indeed",
      "skills": ["Product Management", "Agile"],
      "remote": true,
      "deadline": "2024-11-30",
      "userNotes": "Exciting startup",
      "rating": 4
    }
  ]
}
```

#### Success Response:
```json
{
  "success": true,
  "synced": 2,
  "duplicates": 0,
  "total": 2,
  "newJobs": [
    { "jobId": "job_1", "title": "Software Engineer", "company": "Tech Corp" },
    { "jobId": "job_2", "title": "Product Manager", "company": "Startup Inc" }
  ],
  "duplicateJobs": []
}
```

### 4. Job Sync Status API (`/api/jobs/sync`)

**Endpoint**: `GET /api/jobs/sync`  
**Purpose**: Retrieve user's job statistics  
**Authentication**: Required (Clerk)  

#### Test Cases:
- ✅ **Returns job statistics** - Provides comprehensive stats
- ✅ **Handles empty jobs list** - Returns zero counts
- ✅ **Unauthenticated request** - Returns 401 error
- ✅ **User not found** - Returns 404 error

#### Success Response:
```json
{
  "success": true,
  "stats": {
    "totalJobs": 6,
    "savedJobs": 2,
    "appliedJobs": 1,
    "interviewingJobs": 1,
    "offeredJobs": 1,
    "rejectedJobs": 1,
    "lastSync": "2024-01-01T00:00:00.000Z"
  }
}
```

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test Files
```bash
# Test health endpoint
npm test -- src/app/api/health/__tests__/route.test.ts

# Test job bookmark endpoint
npm test -- src/app/api/jobs/bookmark/__tests__/route.test.ts

# Test job sync endpoint
npm test -- src/app/api/jobs/sync/__tests__/route.test.ts
```

## Test Configuration

### Jest Configuration (`jest.config.js`)
- **Test Environment**: jsdom
- **Setup Files**: jest.setup.js
- **Coverage Threshold**: 80% for all metrics
- **Module Mapping**: @/ → src/

### Test Setup (`jest.setup.js`)
- **Environment Variables**: Mocked for testing
- **Console Mocking**: Optional noise reduction
- **Testing Library**: Jest DOM matchers

## Mocking Strategy

### External Dependencies
- **Clerk Authentication**: Mocked auth function
- **Convex Client**: Mocked HTTP client
- **Convex API**: Mocked API functions

### Test Data
- **Valid Job Data**: Complete job objects
- **Invalid Data**: Missing required fields
- **Edge Cases**: Empty arrays, null values
- **Error Scenarios**: Network failures, auth failures

## Coverage Goals

### Current Coverage Targets:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Key Areas Covered:
- ✅ **Authentication flows**
- ✅ **Data validation**
- ✅ **Error handling**
- ✅ **Success scenarios**
- ✅ **Edge cases**

## Browser Extension Integration

### Test Scenarios for Extension:
1. **Health Check** - Extension can verify CareerOS connectivity
2. **Single Job Bookmark** - Extension can save individual jobs
3. **Bulk Job Sync** - Extension can sync multiple jobs
4. **Authentication** - Extension handles auth requirements
5. **Error Handling** - Extension handles API errors gracefully

### Extension Test Payloads:
```javascript
// Health check from extension
const healthResponse = await fetch(`${careerOSUrl}/api/health`);

// Single job bookmark from extension
const bookmarkResponse = await fetch(`${careerOSUrl}/api/jobs/bookmark`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(jobData)
});

// Bulk sync from extension
const syncResponse = await fetch(`${careerOSUrl}/api/jobs/sync`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ jobs: jobArray })
});
```

## Debugging Tests

### Common Issues:
1. **Mock Setup**: Ensure all mocks are properly configured
2. **Async Operations**: Use proper async/await patterns
3. **Data Validation**: Check request/response formats
4. **Error Scenarios**: Test all error conditions

### Debug Commands:
```bash
# Run tests with verbose output
npm test -- --verbose

# Run tests with debug info
npm test -- --detectOpenHandles

# Run specific test with debug
npm test -- --testNamePattern="should create job bookmark successfully"
```

---

**These comprehensive tests ensure the API endpoints work correctly with the browser extension!** 🚀
