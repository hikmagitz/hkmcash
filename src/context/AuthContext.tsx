import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isPremium: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Create a mock user that's always logged in
  const [user] = useState({
    id: 'demo-user-123',
    email: 'demo@hkmcash.com',
    name: 'Demo User'
  });
  
  const [loading, setLoading] = useState(false); // No loading needed
  const [isPremium] = useState(true); // Give premium access

  // Mock authentication functions
  const signIn = async (email: string, password: string) => {
    console.log('🔐 Mock sign in - always successful');
    // Always succeeds, no actual authentication
  };

  const signUp = async (email: string, password: string) => {
    console.log('📝 Mock sign up - always successful');
    // Always succeeds, no actual authentication
  };

  const signInWithGoogle = async () => {
    console.log('🔐 Mock Google sign in - always successful');
    // Always succeeds, no actual authentication
  };

  const signOut = async () => {
    console.log('🚪 Mock sign out - staying logged in');
    // Does nothing, user stays logged in
  };

  const updatePassword = async (newPassword: string) => {
    console.log('🔑 Mock password update - always successful');
    // Always succeeds, no actual update
  };

  const resetPassword = async (email: string) => {
    console.log('📧 Mock password reset - always successful');
    // Always succeeds, no actual reset
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updatePassword,
    resetPassword,
    isPremium
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};