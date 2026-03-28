import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

const USERS_KEY = "cashclear_users";
const SESSION_KEY = "cashclear_session";

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => loadSession());

  const signup = useCallback(({ name, email, password, role = "Analyst" }) => {
    const users = loadUsers();
    if (users.find((u) => u.email === email)) {
      throw new Error("An account with this email already exists.");
    }
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password, // plain-text OK for a hackathon demo
      role,
      joinedAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=7c5cfc`,
    };
    saveUsers([...users, newUser]);
    const session = { ...newUser };
    delete session.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setCurrentUser(session);
  }, []);

  const login = useCallback(({ email, password }) => {
    const users = loadUsers();
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error("Invalid email or password.");
    const session = { ...user };
    delete session.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setCurrentUser(session);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }, []);

  const updateProfile = useCallback((updates) => {
    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === currentUser.id);
    if (idx === -1) return;
    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
    const session = { ...users[idx] };
    delete session.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setCurrentUser(session);
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, signup, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
