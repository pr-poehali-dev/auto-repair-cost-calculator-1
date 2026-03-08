import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SupplierRegister from '@/components/auth/SupplierRegister';
import { useNavigate } from 'react-router-dom';

export default function SupplierRegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-2xl">
          <SupplierRegister onClose={() => navigate('/')} />
        </div>
      </div>
      <Footer />
    </div>
  );
}