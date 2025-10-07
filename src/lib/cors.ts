import { NextResponse } from 'next/server';

export function addCorsHeaders(response: NextResponse) {
  // Allow all origins for development
  response.headers.set('Access-Control-Allow-Origin', '*');
  
  // Allow common headers
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Allow common methods
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Allow credentials if needed
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  return response;
}

export function handleCorsPreflight() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
