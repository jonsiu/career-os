"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UserProfile() {
  const { user, isSignedIn } = useUser();

  if (!isSignedIn) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserButton />
          <span>Profile</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Name</label>
          <p className="text-sm text-gray-900">{user?.fullName || 'Not provided'}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <p className="text-sm text-gray-900">{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Member since</label>
          <p className="text-sm text-gray-900">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
