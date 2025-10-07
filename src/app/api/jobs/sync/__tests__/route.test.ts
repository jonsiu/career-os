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
      getByUserId: 'getByUserId',
      create: 'create',
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
    getByUserId: 'getByUserId',
    create: 'create',
  },
};

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockConvexClient = ConvexHttpClient as jest.MockedClass<typeof ConvexHttpClient>;

// Get the mocked functions from the module
const convexModule = require('convex/browser');
const mockQuery = convexModule.__mockQuery;
const mockMutation = convexModule.__mockMutation;

describe('/api/jobs/sync', () => {
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
    const validJobsData = {
      jobs: [
        {
          title: 'Software Engineer',
          company: 'Tech Corp',
          description: 'Build amazing software',
          requirements: ['JavaScript', 'React'],
          location: 'San Francisco',
          salary: '$120k',
          url: 'https://example.com/job1',
          source: 'LinkedIn',
          skills: ['JavaScript', 'React'],
          remote: false,
          deadline: '2024-12-31',
          userNotes: 'Great opportunity',
          rating: 5
        },
        {
          title: 'Product Manager',
          company: 'Startup Inc',
          description: 'Lead product development',
          requirements: ['Product Management', 'Agile'],
          location: 'New York',
          salary: '$150k',
          url: 'https://example.com/job2',
          source: 'Indeed',
          skills: ['Product Management', 'Agile'],
          remote: true,
          deadline: '2024-11-30',
          userNotes: 'Exciting startup',
          rating: 4
        }
      ]
    };

    it('should sync jobs successfully', async () => {
      mockAuth.mockResolvedValue(createAuthMock('user_123'));
      mockQuery
        .mockResolvedValueOnce({ _id: 'user_convex_id' }) // User lookup
        .mockResolvedValueOnce([]); // No existing jobs
      mockMutation
        .mockResolvedValueOnce('job_1')
        .mockResolvedValueOnce('job_2');

      const request = new NextRequest('http://localhost:3000/api/jobs/sync', {
        method: 'POST',
        body: JSON.stringify(validJobsData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual({
        success: true,
        synced: 2,
        duplicates: 0,
        total: 2,
        newJobs: [
          { jobId: 'job_1', title: 'Software Engineer', company: 'Tech Corp' },
          { jobId: 'job_2', title: 'Product Manager', company: 'Startup Inc' }
        ],
        duplicateJobs: []
      });

      // Verify the response is correct
      expect(data.success).toBe(true);
      expect(data.synced).toBe(2);
      expect(data.total).toBe(2);
    });

    it('should handle duplicate jobs correctly', async () => {
      mockAuth.mockResolvedValue(createAuthMock('user_123'));
      mockQuery
        .mockResolvedValueOnce({ _id: 'user_convex_id' }) // User lookup
        .mockResolvedValueOnce([ // Existing jobs with same URL
          { metadata: { url: 'https://example.com/job1' } }
        ]);
      mockMutation.mockResolvedValueOnce('job_2'); // Only second job created

      const request = new NextRequest('http://localhost:3000/api/jobs/sync', {
        method: 'POST',
        body: JSON.stringify(validJobsData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual({
        success: true,
        synced: 1,
        duplicates: 1,
        total: 2,
        newJobs: [
          { jobId: 'job_2', title: 'Product Manager', company: 'Startup Inc' }
        ],
        duplicateJobs: [
          { title: 'Software Engineer', company: 'Tech Corp', url: 'https://example.com/job1' }
        ]
      });
    });

    it('should handle invalid jobs array', async () => {
      mockAuth.mockResolvedValue(createAuthMock('user_123'));

      const invalidData = {
        jobs: 'not an array'
      };

      const request = new NextRequest('http://localhost:3000/api/jobs/sync', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Jobs must be an array');
    });

    it('should handle missing jobs field', async () => {
      mockAuth.mockResolvedValue(createAuthMock('user_123'));

      const invalidData = {
        // Missing jobs field
      };

      const request = new NextRequest('http://localhost:3000/api/jobs/sync', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Jobs must be an array');
    });

    it('should handle unauthenticated requests', async () => {
      mockAuth.mockResolvedValue(createAuthMock(null));

      const request = new NextRequest('http://localhost:3000/api/jobs/sync', {
        method: 'POST',
        body: JSON.stringify(validJobsData),
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

      const request = new NextRequest('http://localhost:3000/api/jobs/sync', {
        method: 'POST',
        body: JSON.stringify(validJobsData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('User not found');
    });

    it('should handle Convex errors gracefully', async () => {
      mockAuth.mockResolvedValue(createAuthMock('user_123'));
      mockQuery
        .mockResolvedValueOnce({ _id: 'user_convex_id' }) // User lookup
        .mockResolvedValueOnce([]); // No existing jobs
      mockMutation.mockRejectedValue(new Error('Convex error'));

      const request = new NextRequest('http://localhost:3000/api/jobs/sync', {
        method: 'POST',
        body: JSON.stringify(validJobsData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      
      // The API handles individual job errors gracefully and continues
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.synced).toBe(0); // No jobs were successfully created due to errors
      expect(data.total).toBe(2);
    });

    it('should handle partial failures gracefully', async () => {
      mockAuth.mockResolvedValue(createAuthMock('user_123'));
      mockQuery
        .mockResolvedValueOnce({ _id: 'user_convex_id' }) // User lookup
        .mockResolvedValueOnce([]); // No existing jobs
      mockMutation
        .mockResolvedValueOnce('job_1') // First job succeeds
        .mockRejectedValueOnce(new Error('Convex error')); // Second job fails

      const request = new NextRequest('http://localhost:3000/api/jobs/sync', {
        method: 'POST',
        body: JSON.stringify(validJobsData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.synced).toBe(1); // Only one job synced
      expect(data.newJobs).toHaveLength(1);
    });

    it('should handle empty jobs array', async () => {
      mockAuth.mockResolvedValue(createAuthMock('user_123'));
      mockQuery
        .mockResolvedValueOnce({ _id: 'user_convex_id' }) // User lookup
        .mockResolvedValueOnce([]); // No existing jobs

      const emptyData = { jobs: [] };

      const request = new NextRequest('http://localhost:3000/api/jobs/sync', {
        method: 'POST',
        body: JSON.stringify(emptyData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual({
        success: true,
        synced: 0,
        duplicates: 0,
        total: 0,
        newJobs: [],
        duplicateJobs: []
      });
    });
  });

  describe('GET', () => {
    it('should retrieve sync status successfully', async () => {
      mockAuth.mockResolvedValue(createAuthMock('user_123'));
      mockQuery
        .mockResolvedValueOnce({ _id: 'user_convex_id' }) // User lookup
        .mockResolvedValueOnce([ // Jobs with different statuses
          { status: 'saved' },
          { status: 'saved' },
          { status: 'applied' },
          { status: 'interviewing' },
          { status: 'offered' },
          { status: 'rejected' }
        ]);

      const request = new NextRequest('http://localhost:3000/api/jobs/sync');
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual({
        success: true,
        stats: {
          totalJobs: 6,
          savedJobs: 2,
          appliedJobs: 1,
          interviewingJobs: 1,
          offeredJobs: 1,
          rejectedJobs: 1,
          lastSync: expect.any(String)
        }
      });
    });

    it('should handle unauthenticated GET requests', async () => {
      mockAuth.mockResolvedValue(createAuthMock(null));

      const request = new NextRequest('http://localhost:3000/api/jobs/sync');
      const response = await GET(request);
      
      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle user not found in GET requests', async () => {
      mockAuth.mockResolvedValue(createAuthMock('user_123'));
      mockQuery.mockResolvedValue(null); // User not found

      const request = new NextRequest('http://localhost:3000/api/jobs/sync');
      const response = await GET(request);
      
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('User not found');
    });

    it('should handle empty jobs list', async () => {
      mockAuth.mockResolvedValue(createAuthMock('user_123'));
      mockQuery
        .mockResolvedValueOnce({ _id: 'user_convex_id' }) // User lookup
        .mockResolvedValueOnce([]); // No jobs

      const request = new NextRequest('http://localhost:3000/api/jobs/sync');
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual({
        success: true,
        stats: {
          totalJobs: 0,
          savedJobs: 0,
          appliedJobs: 0,
          interviewingJobs: 0,
          offeredJobs: 0,
          rejectedJobs: 0,
          lastSync: expect.any(String)
        }
      });
    });
  });
});
