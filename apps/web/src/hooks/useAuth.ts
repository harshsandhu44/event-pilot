"use client";

import { useEffect, useState } from "react";
import { auth, quickLogin } from "@eventpilot/firebase/client";
import { onAuthStateChanged, User } from "firebase/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        setLoading(false);
      } else {
        try {
          // Auto-login anonymously if no user
          await quickLogin();
        } catch (error) {
          console.error("Auto-login failed:", error);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, isAuthenticated };
}
