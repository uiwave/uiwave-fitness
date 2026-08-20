import { AuthProvider } from '../auth/AuthContext';
import { TooltipProvider } from '../components/ui/tooltip';
import { Toaster } from '../components/ui/sonner';

import AppRouter from './router/AppRouter';

function App() {
  return (
    <TooltipProvider>
      <AuthProvider>
        <AppRouter />

        <Toaster richColors position="top-right" />
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;
