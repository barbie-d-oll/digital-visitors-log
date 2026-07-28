"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

type UserProfile = {
  uid: string;
  email: string;
  role: string;
  companyId: string;
  companyName: string;
};

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: User | null) => {
        if (!firebaseUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          const profile = userSnap.exists() ? userSnap.data() : null;
          const normalizedRole =
            typeof profile?.role === "string" && profile.role.trim()
              ? profile.role
              : "admin";

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            role: normalizedRole,
            companyId:
              typeof profile?.companyId === "string" ? profile.companyId : "",
            companyName:
              typeof profile?.companyName === "string"
                ? profile.companyName
                : "",
          });
        } catch (err) {
          console.error("Unable to load auth profile:", err);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            role: "admin",
            companyId: "",
            companyName: "",
          });
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}