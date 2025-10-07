import { NextRequest } from 'next/server';
import { GET } from '../route';

describe('/api/health', () => {
  describe('GET', () => {
    it('should return health status successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/health');
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        version: '1.0.0',
        environment: expect.any(String),
        services: {
          database: 'connected',
          auth: 'available',
          api: 'operational'
        }
      });
    });

    it('should return valid timestamp', async () => {
      const request = new NextRequest('http://localhost:3000/api/health');
      const response = await GET(request);
      
      const data = await response.json();
      const timestamp = new Date(data.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    it('should include environment information', async () => {
      const request = new NextRequest('http://localhost:3000/api/health');
      const response = await GET(request);
      
      const data = await response.json();
      expect(data.environment).toBeDefined();
      expect(['development', 'production', 'test']).toContain(data.environment);
    });
  });
});
