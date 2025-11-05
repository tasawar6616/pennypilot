import { getFirebaseAuth } from '@/lib/firebase-init';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization'; // optional
import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { queryClient } from '@/lib/query-client';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>; // ✅ Add this line
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        await AsyncStorage.setItem('userId', user.uid);
      } else {
        await AsyncStorage.removeItem('userId');
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    const auth = getFirebaseAuth();
    await signOut(auth);
    // Clear all cached data on logout
    queryClient.clear();
    await AsyncStorage.clear();
  };



  const resetPassword = async (email: string) => {
    const auth = getFirebaseAuth();

    // Optional: localize the email Firebase sends (e.g., 'en', 'es', 'de')
    try {
      auth.languageCode = Localization?.locale?.split('-')[0] || 'en';
    } catch { }

    // Basic usage (uses the default template you configure in Firebase Console)
    await sendPasswordResetEmail(auth, email);

    // If you have a custom handler page, you can pass actionCodeSettings:
    // await sendPasswordResetEmail(auth, email, {
    //   url: 'https://yourdomain.com/reset-complete', // your hosted page
    //   handleCodeInApp: false, // set true only if you’ve set up Firebase Dynamic Links to open your app
    // });
  };


  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logout ,resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
