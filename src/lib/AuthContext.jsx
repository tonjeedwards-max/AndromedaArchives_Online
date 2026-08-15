import React, { createContext, useState, useContext, useCallback } from "react";

const AuthContext = createContext();

/**
 * Public-first auth context.
 *
 * The archive UI must boot entirely from the GitHub/Netlify frontend.
 * Supabase is a backend/data service and is intentionally NOT contacted
 * during application startup. Admin/auth flows can explicitly call the
 * auth helpers when they are needed.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  const syncUser = useCallback((nextUser) => {
    setUser(nextUser ?? null);
    setIsAuthenticated(Boolean(nextUser));
  }, []);

  const checkUserAuth = useCallback(async () => {
    try {
      const { requireSupabase } = await import("@/api/supabaseClient");
      const { data, error } = await requireSupabase().auth.getUser();
      if (error && error.name !== "AuthSessionMissingError") throw error;
      setAuthError(null);
      syncUser(data?.user ?? null);
      return data?.user ?? null;
    } catch (error) {
      console.error("Supabase auth check failed:", error);
      setAuthError(null);
      syncUser(null);
      return null;
    }
  }, [syncUser]);

  const logout = useCallback(async () => {
    try {
      const { requireSupabase } = await import("@/api/supabaseClient");
      await requireSupabase().auth.signOut();
    } catch (error) {
      console.error("Supabase logout failed:", error);
    } finally {
      syncUser(null);
    }
  }, [syncUser]);

  const navigateToLogin = () => null;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      // Kept for compatibility with existing pages, but public startup is
      // never blocked by authentication.
      isLoadingAuth: false,
      isLoadingPublicSettings: false,
      authError,
      appPublicSettings,
      authChecked: false,
      isAdmin: user?.app_metadata?.role === "admin",
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState: checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
