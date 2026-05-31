'use client';

import { ReactNode } from 'react';
import { useNavigationStore } from '@/lib/store';
import { Sidebar } from './Sidebar';
import { CommandBar } from './CommandBar';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarOpen } = useNavigationStore();
  const pathname = usePathname();

  const isPublicRoute = pathname === '/' || pathname === '/login';

  if (isPublicRoute) {
    return <div className="min-h-screen bg-background text-foreground">{children}</div>;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#050816' }}>
      <Sidebar />
      <CommandBar />

      {/* Main Content Area */}
      <motion.main
        initial={false}
        animate={{
          marginLeft: sidebarOpen ? 280 : 80,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="pt-16"
      >
        <div className="min-h-screen">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
