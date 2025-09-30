'use client';

import React, { JSX, Suspense } from 'react';
// import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundaryWrapper from '@/components/common/error-boundary';
import { ToastContainer } from 'react-toastify';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (cacheTime renamed to gcTime in v5)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

type ProviderProps = {
  children: React.ReactNode;
};

export default function AppProvider({ children }: ProviderProps): JSX.Element {
  return (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundaryWrapper>
          <Suspense fallback={<div>Loading...</div>}>
            <ToastContainer />
            <div className="min-h-dvh">
              <div className={'overflow-x-hidden'}> 
    {children}
  </div>
            </div>
          </Suspense>
        </ErrorBoundaryWrapper>
      </QueryClientProvider>
  );
}
