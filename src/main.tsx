import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App.tsx';
import './index.css'; 
import { config } from './config'; 

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: config.submissions.staleTimeMs, 
    },
  },
});

async function enableMocking() {
  // Keep your MSW setup from previous step
  const shouldMock = import.meta.env.VITE_API_MOCKING === 'enabled' ||
    (import.meta.env.DEV && import.meta.env.VITE_API_MOCKING !== 'disabled');
  if (!shouldMock) return;
  const { worker } = await import('./mocks/browser');
  // Use config for API base URL if needed by MSW (optional)
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: false,
  });
  console.log('MSW Initialized');
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </React.StrictMode>
  );
});