// context/AuthContext.jsx
// import { createContext, useState, useContext } from "react";

// const AuthContext = createContext(null);
// export function AuthProvider({ children }) {
//   const [token, setToken] = useState(null);
//   return <AuthContext.Provider value={{ token, setToken }}>{children}</AuthContext.Provider>;
// }
// export function useAuth() { return useContext(AuthContext); }

import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  function login(newToken, newUser) {
    setToken(newToken);
    setUser(newUser || null);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, setToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
