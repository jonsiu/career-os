'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, ExternalLink, Shield, Zap } from 'lucide-react';

export default function ExtensionAuthPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authStatus, setAuthStatus] = useState<'loading' | 'success' | 'error' | 'unauthorized'>('loading');
  const [authData, setAuthData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const redirectUrl = searchParams.get('redirect');
  const extensionId = searchParams.get('extensionId') || 'career-os-extension';

  useEffect(() => {
    const handleExtensionAuth = async () => {
      if (!isLoaded) return;

      try {
        if (!user) {
          setAuthStatus('unauthorized');
          return;
        }

        // Get extension authentication token
        const response = await fetch('/api/auth/extension', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAuthData(data);
          setAuthStatus('success');
          
          // Send success message to extension if redirect URL is provided
          if (redirectUrl) {
            setTimeout(() => {
              // Create a message for the extension
              const message = {
                type: 'CLERK_AUTH_SUCCESS',
                user: data.user,
                token: data.token,
                session: data.session
              };
              
              // Try to send message to extension via postMessage
              if (window.opener) {
                window.opener.postMessage(message, '*');
              }
              
              // Also try to redirect to the callback URL
              if (redirectUrl.startsWith('chrome-extension://') || redirectUrl.startsWith('moz-extension://')) {
                window.location.href = redirectUrl;
              }
            }, 2000);
          }
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Authentication failed');
          setAuthStatus('error');
        }
      } catch (err) {
        console.error('Extension authentication error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setAuthStatus('error');
      }
    };

    handleExtensionAuth();
  }, [isLoaded, user, redirectUrl]);

  const handleRetry = () => {
    setAuthStatus('loading');
    setError(null);
    // Retry authentication
    window.location.reload();
  };

  const handleClose = () => {
    if (window.opener) {
      window.close();
    } else {
      router.push('/dashboard');
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Extension Authentication</CardTitle>
          <CardDescription>
            Authenticating with CareerOS for {extensionId}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {authStatus === 'loading' && (
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">Setting up extension authentication...</p>
            </div>
          )}

          {authStatus === 'unauthorized' && (
            <div className="text-center space-y-4">
              <XCircle className="h-8 w-8 mx-auto text-red-500" />
              <p className="text-gray-600">You need to be signed in to CareerOS to authenticate the extension.</p>
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/sign-in')}
                  className="w-full"
                >
                  Sign In to CareerOS
                </Button>
                <Button 
                  onClick={handleClose}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {authStatus === 'error' && (
            <div className="text-center space-y-4">
              <XCircle className="h-8 w-8 mx-auto text-red-500" />
              <p className="text-gray-600">Authentication failed</p>
              {error && (
                <p className="text-sm text-red-500 bg-red-50 p-2 rounded">
                  {error}
                </p>
              )}
              <div className="space-y-2">
                <Button 
                  onClick={handleRetry}
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={handleClose}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {authStatus === 'success' && authData && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-8 w-8 mx-auto text-green-500" />
              <p className="text-gray-600">Extension authenticated successfully!</p>
              
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">User:</span>
                  <span className="text-sm text-gray-600">{authData.user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Session ID:</span>
                  <Badge variant="secondary" className="text-xs">
                    {authData.session.id.slice(-8)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Permissions:</span>
                  <Badge variant="outline" className="text-xs">
                    {authData.session.permissions.length} granted
                  </Badge>
                </div>
              </div>

              {redirectUrl && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    Redirecting to extension...
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <ExternalLink className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-500">Extension will receive authentication data</span>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleClose}
                className="w-full"
              >
                {redirectUrl ? 'Close Window' : 'Continue to Dashboard'}
              </Button>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <Zap className="h-3 w-3" />
              <span>CareerOS Extension v1.0.0</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}