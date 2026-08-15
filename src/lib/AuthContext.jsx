import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { requireSupabase } from "@/api/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  const syncUser = useCallback((nextUser) => {
    setUser(nextUser ?? null);
    setIsAuthenticated(Boolean(nextUser));
    setAuthChecked(true);
    setIsLoadingAuth(false);
  }, []);

  const checkUserAuth = useCallback(async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      const { data, error } = await requireSupabase().auth.getUser();
      if (error && error.name !== "AuthSessionMissingError") throw error;
      syncUser(data?.user ?? null);
    } catch (error) {
      console.error("Supabase auth check failed:", error);
      setAuthError({ type: "unknown", message: error.message || "Authentication check failed" });
      syncUser(null);
    }
  }, [syncUser]);

  useEffect(() => {
    const supabase = requireSupabase();
    let subscription;

    checkUserAuth();

    try {
      const result = supabase.auth.onAuthStateChange((_event, session) => {
        syncUser(session?.user ?? null);
      });
      subscription = result?.data?.subscription ?? result?.subscription;
    } catch (error) {
      console.error("Supabase auth listener failed:", error);
      // Authentication is optional for the public archive; never crash the app here.
    }

    return () => {
      try {
        subscription?.unsubscribe?.();
      } catch (error) {
        console.warn("Supabase auth listener cleanup failed:", error);
      }
    };
  }, [checkUserAuth, syncUser]);

  const checkAppState = checkUserAuth;

  const logout = async () => {
    await requireSupabase().auth.signOut();
    syncUser(null);
  };

  const navigateToLogin = () => null;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      isAdmin: user?.app_metadata?.role === "admin",
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState,
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
