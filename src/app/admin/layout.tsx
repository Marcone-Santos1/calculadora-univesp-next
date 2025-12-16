import React from 'react';
import {redirect} from 'next/navigation';
import {checkIsAdmin} from '@/lib/admin-auth';
import {AdminSidebar} from '@/components/admin/AdminSidebar';
import type {Metadata} from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar agora controla sua própria largura */}
      <AdminSidebar />
      
      {/* Conteúdo Principal (flex-1 faz ele ocupar o resto do espaço) */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden w-full">
        {children}
      </main>
    </div>
  );
}