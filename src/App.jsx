import { AuthProvider } from './context/AuthContext.jsx';
import { UIProvider } from './context/UIContext.jsx';
import AppRouter from './router/AppRouter.jsx';

export default function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <AppRouter />
      </UIProvider>
    </AuthProvider>
  );
}
