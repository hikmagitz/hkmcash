import { createContext, useContext, useEffect, useState } from 'react';
import { createClient, User } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ Error getting session:', error);
        } else {
          console.log('✅ Initial session:', session?.user?.email || 'No user');
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('❌ Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email || 'No user');
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!user) {
        setIsPremium(false);
        return;
      }

      try {
        console.log('💎 Checking premium status for user:', user.id);
        
        // First, try to create the profile if it doesn't exist
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(
            { id: user.id, is_premium: false },
            { onConflict: 'id', ignoreDuplicates: true }
          );

        if (upsertError) {
          console.error('❌ Error upserting profile:', upsertError);
        }

        // Now fetch the profile
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', user.id)
          .single();

        if (fetchError) {
          console.error('❌ Error fetching profile:', fetchError);
          setIsPremium(false);
          return;
        }

        console.log('✅ Premium status:', profile?.is_premium);
        setIsPremium(profile?.is_premium ?? false);
      } catch (error) {
        console.error('❌ Unexpected error checking premium status:', error);
        setIsPremium(false);
      }
    };

    checkPremiumStatus();
  }, [user]);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting to sign in with email:', email);
    
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const cleanEmail = email.trim().toLowerCase();
    
    try {
      console.log('📡 Making sign in request...');
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: cleanEmail, 
        password: password.trim()
      });
      
      if (error) {
        console.error('❌ Sign in error:', error.message);
        throw error;
      }
      
      if (!data.user) {
        console.error('❌ No user returned from sign in');
        throw new Error('Authentication failed - no user returned');
      }
      
      console.log('✅ Sign in successful:', data.user.email);
      // The auth state change listener will handle setting the user
    } catch (error: any) {
      console.error('❌ Sign in failed:', error.message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log('📝 Attempting to sign up with email:', email);
    
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const cleanEmail = email.trim().toLowerCase();
    
    try {
      console.log('📡 Making sign up request...');
      const { data, error } = await supabase.auth.signUp({ 
        email: cleanEmail, 
        password: password.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('❌ Sign up error:', error.message);
        throw error;
      }
      
      console.log('✅ Sign up successful:', data.user?.email);
    } catch (error: any) {
      console.error('❌ Sign up failed:', error.message);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('🚪 Signing out user');
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Sign out error:', error);
        throw error;
      }
      
      console.log('✅ Sign out successful');
    } catch (error: any) {
      console.error('❌ Sign out failed:', error.message);
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    console.log('🔑 Updating password');
    
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('❌ Update password error:', error);
        throw error;
      }
      
      console.log('✅ Password updated successfully');
    } catch (error: any) {
      console.error('❌ Update password failed:', error.message);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    console.log('📧 Sending password reset email to:', email);
    
    if (!email) {
      throw new Error('Email is required');
    }

    const cleanEmail = email.trim().toLowerCase();
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        console.error('❌ Reset password error:', error);
        throw error;
      }
      
      console.log('✅ Password reset email sent successfully');
    } catch (error: any) {
      console.error('❌ Reset password failed:', error.message);
      throw error;
    }
  };

  // Debug info
  useEffect(() => {
    console.log('🔧 Auth Debug Info:');
    console.log('- Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('- Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
    console.log('- Current User:', user?.email || 'None');
    console.log('- Loading:', loading);
    console.log('- Premium:', isPremium);
  }, [user, loading, isPremium]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      updatePassword,
      resetPassword,
      isPremium
    }}>
      {children}
    </AuthContext.Provider>
  );
};