"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@eventpilot/firebase/client";
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from "firebase/auth";

export function useAuth(requireAuth = true) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (requireAuth && !currentUser) {
        router.push("/login");
      } else if (!requireAuth && currentUser) {
        router.push("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [requireAuth, router]);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return { user, loading, signOut };
}
