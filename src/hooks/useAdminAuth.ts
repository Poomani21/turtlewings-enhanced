import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export type AdminAuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

export function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let active = true;
    getFirebaseAuth()
      .then((auth) => {
        if (!active) return;
        unsubscribe = onAuthStateChanged(auth, (user) =>
          setState({ user, loading: false, error: null }),
        );
      })
      .catch((error: Error) =>
        setState({ user: null, loading: false, error: error.message }),
      );
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  return state;
}

export async function adminSignIn(email: string, password: string) {
  const auth = await getFirebaseAuth();
  await signInWithEmailAndPassword(auth, email, password);
}

export async function adminSignOut() {
  const auth = await getFirebaseAuth();
  await signOut(auth);
}
