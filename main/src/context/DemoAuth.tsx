import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface StoredUser {
  id: string;
  email: string;
  name: string | null;
}

interface AuthValue {
  isSignedIn: boolean;
  isLoaded: boolean;
  user: StoredUser | null;
  signOut: () => void;
  enableDemo: () => void;
  signInWithToken: (token: string, user: StoredUser) => void;
}

const AuthContext = createContext<AuthValue>({
  isSignedIn: false,
  isLoaded: true,
  user: null,
  signOut: () => {},
  enableDemo: () => {},
  signInWithToken: () => {},
});

function loadStored() {
  try {
    const data = localStorage.getItem('auth_user');
    if (data) return JSON.parse(data) as StoredUser;
  } catch {}
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(loadStored);

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  const enableDemo = useCallback(() => {
    const token = 'demo_token_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    localStorage.setItem('demo_token', token);
    setUser({
      id: 'demo_user_001',
      email: 'demo@doc2web.com',
      name: 'Demo User',
    });
  }, []);

  const signInWithToken = useCallback((token: string, u: StoredUser) => {
    localStorage.setItem('demo_token', token);
    setUser(u);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('demo_token');
    localStorage.removeItem('demo_mode');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isSignedIn: !!user,
        isLoaded: true,
        user,
        signOut,
        enableDemo,
        signInWithToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext as DemoContext };
export { AuthProvider as DemoAuthProvider };

export function useAuth() {
  return useContext(AuthContext);
}

export function useUser() {
  const { user, isLoaded } = useContext(AuthContext);
  return { isLoaded, user };
}

export function getDemoToken(): string | null {
  return localStorage.getItem('demo_token');
}
