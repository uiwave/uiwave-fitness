import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  get,
  post,
  setOnUnauthorized,
  setToken,
  getToken,
} from '../lib/apiClient';
import type { Envelope, SignInResponse, User } from '../types/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOnUnauthorized(() => setUser(null));
  }, []);

  // Restaurar sesión al cargar: si hay token, validar con /auth/me
  useEffect(() => {
    (async () => {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await get<Envelope<User>>('/auth/me');
        setUser(data);
      } catch {
        setToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await post<SignInResponse>('/api/auth/sign-in/email', {
      email,
      password,
    });
    // session.token es el token Bearer; tolera respuestas con token directo
    const token =
      result.session?.token ??
      (result as SignInResponse & { token?: string }).token;
    if (!token)
      throw new Error(
        'La respuesta del servidor no incluyó un token de sesión',
      );
    setToken(token);
    const { data } = await get<Envelope<User>>('/auth/me');
    setUser(data);
  };

  const logout = async () => {
    try {
      await post('/api/auth/sign-out');
    } catch {
      // ignora
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
