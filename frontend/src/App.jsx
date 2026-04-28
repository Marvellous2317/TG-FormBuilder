import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './core/router';
import ToastProvider from './shared/components/ToastProvider';
import { InstallButton } from './shared/components/InstallButton';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} fallbackElement={<div>Loading...</div>} />
      <ToastProvider />
      <InstallButton />
    </QueryClientProvider>
  );
};

export default App;
