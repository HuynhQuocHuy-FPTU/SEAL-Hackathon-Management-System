import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './app/App.tsx'
import { AppProvider } from './context/AppContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
)
