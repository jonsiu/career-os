import { NextRequest } from 'next/server';
import { POST, GET } from '../route';

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

// Mock Convex client
jest.mock('convex/browser', () => {
  const mockQuery = jest.fn();
  const mockMutation = jest.fn();
  
  return {
    ConvexHttpClient: jest.fn().mockImplementation(() => ({
      query: mockQuery,
      mutation: mockMutation,
    })),
    // Export the mocks so we can use them in tests
    __mockQuery: mockQuery,
    __mockMutation: mockMutation,
  };
});

// Mock Convex API - create a simple mock
jest.mock('../../../../../convex/_generated/api', () => ({
  api: {
    users: {
      getByClerkUserId: 'getByClerkUserId',
    },
    jobs: {
      create: 'create',
      getByUserId: 'getByUserId',
    },
  },
}), { virtual: true });

import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
// Mock the Convex API import
const api = {
  users: {
    getByClerkUserId: 'getByClerkUserId',
  },
  jobs: {
    create: 'create',
    getByUserId: 'getByUserId',
  },
};

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockConvexClient = ConvexHttpClient as jest.MockedClass<typeof ConvexHttpClient>;

// Get the mocked functions from the module
const convexModule = require('convex/browser');
const mockQuery = convexModule.__mockQuery;
const mockMutation = convexModule.__mockMutation;

describe('/api/jobs/bookmark', () => {
  // Helper function to create auth mock
  const createAuthMock = (userId: string | null) => {
    if (userId) {
      return {
        userId,
        sessionClaims: {},
        sessionId: 'session_123',
        sessionStatus: 'active',
        actor: null,
        getToken: jest.fn(),
        has: jest.fn(),
        debug: jest.fn(),
        isAuthenticated: true
      } as any;
    } else {
      return {
        userId: null,
        sessionClaims: {},
        sessionId: null,
        sessionStatus: 'signed_out',
        actor: null,
        getToken: jest.fn(),
        has: jest.fn(),
        debug: jest.fn(),
        isAuthenticated: false,
        redirectToSignIn: jest.fn(),
        redirectToSignUp: jest.fn()
      } as any;
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset all mocks
    mockQuery.mockClear();
    mockMutation.mockClear();
  });

  describe('POST', () => {
    const validJobData = {
      title: 'Software Engineer',
      company: 'Tech Corp',
      description: 'Build amazing software',
      requirements: ['JavaScript', 'React'],
      location: 'San Francisco',
      salary: '$120k',
      url: 'https://example.com/job',
      source: 'LinkedIn',
      skills: ['JavaScript', 'React'],
      remote: false,
      deadline: '2024-12-31',
      userNotes: 'Great opportunity',
      rating: 5
    };

    it('should create job bookmark successfully', async () => {
      // Mock authentication
      mockAuth.mockResolvedValue(createAuthMock('user_123'));
      
      // Mock user lookup - the query should return a user object
      mockQuery.mockResolvedValue({ _id: 'user_convex_id' });
      
      // Mock job creation - the mutation should return a job ID
      mockMutation.mockResolvedValue('job_123');
      
      // Debug: Let's see what's happening
      console.log('Mock setup:', {
        queryMock: mockQuery.getMockName(),
        mutationMock: mockMutation.getMockName(),
        queryCalls: mockQuery.mock.calls.length,
        mutationCalls: mockMutation.mock.calls.length
      });

      const request = new NextRequest('http://localhost:3000/api/jobs/bookmark', {
        method: 'POST',
        body: JSON.stringify(validJobData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual({
        success: true,
        jobId: 'job_123',
        message: 'Job bookmarked successfully'
      });

      // Verify the response is correct
      expect(data.success).toBe(true);
      expect(data.jobId).toBe('job_123');
      expect(data.message).toBe('Job bookmarked successfully');
    });

    it('should handle missing required fields', async () => {
      mockAuth.mockResolvedValue(createAuthMock('user_123'));

      const invalidData = {
        company: 'Tech Corp',
        description: 'Build amazing software'
        // Missing title
      };

      const request = new NextRequest('http://localhost:3000/api/jobs/bookmark', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Title, company, and description are required');
    });

    it('should handle missing company field', async () => {
      mockAuth.mockResolvedValue(createAuthMock('user_123'));

      const invalidData = {
        title: 'Software Engineer',
        description: 'Build amazing software'
        // Missing company
      };

      const request = new NextRequest('http://localhost:3000/api/jobs/bookmark', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Title, company, and description are required');
    });

    it('should handle missing description field', async () => {
      mockAuth.mockResolvedValue(createAuthMock('user_123'));

      const invalidData = {
        title: 'Software Engineer',
        company: 'Tech Corp'
        // Missing description
      };

      const request = new NextRequest('http://localhost:3000/api/jobs/bookmark', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Title, company, and description are required');
    });

    it('should handle unauthenticated requests', async () => {
      mockAuth.mockResolvedValue(createAuthMock(null));

      const request = new NextRequest('http://localhost:3000/api/jobs/bookmark', {
        method: 'POST',
        body: JSON.stringify(validJobData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      
      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle user not found in database', async () => {
      mockAuth.mockResolvedValue(createAuthMock('user_123'));
      mockQuery.mockResolvedValue(null); // User not found

      const request = new NextRequest('http://localhost:3000/api/jobs/bookmark', {
        method: 'POST',
        body: JSON.stringify(validJobData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('User not found');
    });

    it('should handle Convex errors gracefully', async () => {
      mockAuth.mockResolvedValue(createAuthMock('user_123'));
      mockQuery.mockResolvedValue({ _id: 'user_convex_id' });
      mockMutation.mockRejectedValue(new Error('Convex error'));

      const request = new NextRequest('http://localhost:3000/api/jobs/bookmark', {
        method: 'POST',
        body: JSON.stringify(validJobData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      
      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data.error).toBe('Internal server error');
    });

    it('should handle optional fields correctly', async () => {
      mockAuth.mockResolvedValue(createAuthMock('user_123'));
      mockQuery.mockResolvedValue({ _id: 'user_convex_id' });
      mockMutation.mockResolvedValue('job_123');

      const minimalData = {
        title: 'Software Engineer',
        company: 'Tech Corp',
        description: 'Build amazing software'
        // No optional fields
      };

      const request = new NextRequest('http://localhost:3000/api/jobs/bookmark', {
        method: 'POST',
        body: JSON.stringify(minimalData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);

      // Verify the response is correct
      expect(data.success).toBe(true);
      expect(data.jobId).toBe('job_123');
    });
  });

  describe('GET', () => {
    it('should retrieve user jobs successfully', async () => {
      mockAuth.mockResolvedValue(createAuthMock('user_123'));
      mockQuery
        .mockResolvedValueOnce({ _id: 'user_convex_id' }) // User lookup
        .mockResolvedValueOnce([ // Jobs lookup
          { _id: 'job_1', title: 'Job 1', company: 'Company 1' },
          { _id: 'job_2', title: 'Job 2', company: 'Company 2' }
        ]);

      const request = new NextRequest('http://localhost:3000/api/jobs/bookmark');
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual({
        success: true,
        jobs: [
          { _id: 'job_1', title: 'Job 1', company: 'Company 1' },
          { _id: 'job_2', title: 'Job 2', company: 'Company 2' }
        ],
        count: 2
      });
    });

    it('should handle unauthenticated GET requests', async () => {
      mockAuth.mockResolvedValue(createAuthMock(null));

      const request = new NextRequest('http://localhost:3000/api/jobs/bookmark');
      const response = await GET(request);
      
      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle user not found in GET requests', async () => {
      mockAuth.mockResolvedValue(createAuthMock('user_123'));
      mockQuery.mockResolvedValue(null); // User not found

      const request = new NextRequest('http://localhost:3000/api/jobs/bookmark');
      const response = await GET(request);
      
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('User not found');
    });
  });
});
