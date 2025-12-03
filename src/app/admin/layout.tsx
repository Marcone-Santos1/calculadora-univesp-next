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

export default async function AdminLayout({
                                            children,
                                          }: {
  children: React.ReactNode;
}) {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    redirect('/questoes');
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar/>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
