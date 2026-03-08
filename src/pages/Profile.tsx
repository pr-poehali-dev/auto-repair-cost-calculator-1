import React from 'react';
import Header from '@/components/Header';
import ProfileDashboard from '@/components/profile/ProfileDashboard';

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProfileDashboard />
        </div>
      </main>
    </div>
  );
}