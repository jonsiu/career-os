'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ExtensionAuthPage() {
  const { isSignedIn, getToken, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        if (!isSignedIn || !user) {
          setError('Please sign in to CareerOS first');
          setIsLoading(false);
          return;
        }

        // Get the redirect URL from query params
        const redirectUrl = searchParams.get('redirect');
        if (!redirectUrl) {
          setError('Invalid redirect URL');
          setIsLoading(false);
          return;
        }

        // Get the authentication token
        const token = await getToken();
        if (!token) {
          setError('Failed to get authentication token');
          setIsLoading(false);
          return;
        }

        // Prepare user data
        const userData = {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl
        };

        // Redirect to extension callback with auth data
        const callbackUrl = new URL(redirectUrl);
        callbackUrl.searchParams.set('token', token);
        callbackUrl.searchParams.set('user', encodeURIComponent(JSON.stringify(userData)));

        // Redirect to extension
        window.location.href = callbackUrl.toString();

      } catch (err) {
        console.error('Extension auth error:', err);
        setError('Authentication failed');
        setIsLoading(false);
      }
    };

    handleAuth();
  }, [isSignedIn, user, getToken, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authenticating Extension</h2>
          <p className="text-gray-600">Please wait while we complete your authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">✗</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.close()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return null;
}
