import { createContext, useContext, useEffect, useState } from 'react';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('clientToken'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('clientUser');
    return raw ? JSON.parse(raw) : null;
  });

  const login = (jwt, username) => {
    setToken(jwt);
    setUser({ username });
    localStorage.setItem('clientToken', jwt);
    localStorage.setItem('clientUser', JSON.stringify({ username }));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientUser');
  };

  return (
    <AuthCtx.Provider value={{ token, user, login, logout, isAuthed: !!token }}>
      {children}
    </AuthCtx.Provider>
  );
}
