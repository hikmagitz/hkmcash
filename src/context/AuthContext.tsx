import { createContext, useContext, useEffect, useState } from 'react';
import { createClient, User, AuthError } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface AuthContextType {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔍 Initializing authentication...');
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session error:', error.message);
        } else if (session?.user && mounted) {
          console.log('✅ Found existing session for:', session.user.email);
          setUser(session.user);
        } else {
          console.log('ℹ️ No existing session found');
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔄 Auth state change:', event);
      
      switch (event) {
        case 'SIGNED_IN':
          if (session?.user) {
            console.log('✅ User signed in:', session.user.email);
            setUser(session.user);
          }
          break;
        case 'SIGNED_OUT':
          console.log('ℹ️ User signed out');
          setUser(null);
          setIsPremium(false);
          break;
        case 'TOKEN_REFRESHED':
          console.log('🔄 Token refreshed');
          if (session?.user) {
            setUser(session.user);
          }
          break;
        case 'USER_UPDATED':
          console.log('👤 User updated');
          if (session?.user) {
            setUser(session.user);
          }
          break;
        default:
          if (session?.user) {
            setUser(session.user);
          } else {
            setUser(null);
            setIsPremium(false);
          }
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Check premium status when user changes
  useEffect(() => {
    if (!user) {
      setIsPremium(false);
      return;
    }

    const checkPremiumStatus = async () => {
      try {
        console.log('💎 Checking premium status for user:', user.email);
        
        // First, ensure profile exists
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(
            { id: user.id, is_premium: false },
            { onConflict: 'id', ignoreDuplicates: true }
          );

        if (upsertError) {
          console.error('❌ Profile upsert error:', upsertError.message);
          return;
        }

        // Then fetch premium status
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', user.id)
          .single();

        if (fetchError) {
          console.error('❌ Profile fetch error:', fetchError.message);
          setIsPremium(false);
        } else {
          const premiumStatus = profile?.is_premium ?? false;
          console.log('✅ Premium status:', premiumStatus);
          setIsPremium(premiumStatus);
        }
      } catch (error) {
        console.error('❌ Premium check error:', error);
        setIsPremium(false);
      }
    };

    checkPremiumStatus();
  }, [user]);

  const handleAuthError = (error: AuthError): string => {
    console.error('🚨 Auth error details:', error);
    
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'Email not confirmed':
        return 'Please verify your email address before signing in. Check your inbox for a confirmation email.';
      case 'User already registered':
        return 'An account with this email already exists. Please sign in instead.';
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long.';
      case 'Signup is disabled':
        return 'Account registration is currently disabled. Please contact support.';
      case 'Too many requests':
        return 'Too many attempts. Please wait a moment before trying again.';
      case 'Invalid email':
        return 'Please enter a valid email address.';
      default:
        if (error.message.includes('rate limit')) {
          return 'Too many requests. Please wait a moment before trying again.';
        }
        if (error.message.includes('network')) {
          return 'Network error. Please check your connection and try again.';
        }
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!email?.trim() || !password?.trim()) {
      throw new Error('Please enter both email and password');
    }

    const cleanEmail = email.trim().toLowerCase();
    
    try {
      console.log('🔐 Attempting sign in for:', cleanEmail);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password.trim()
      });

      if (error) {
        throw new Error(handleAuthError(error));
      }

      if (!data.user) {
        throw new Error('Sign in failed. Please try again.');
      }

      console.log('✅ Sign in successful for:', cleanEmail);
      
    } catch (error: any) {
      console.error('❌ Sign in failed:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!email?.trim() || !password?.trim()) {
      throw new Error('Please enter both email and password');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const cleanEmail = email.trim().toLowerCase();
    
    try {
      console.log('📝 Attempting sign up for:', cleanEmail);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email_confirm: true
          }
        }
      });

      if (error) {
        throw new Error(handleAuthError(error));
      }

      if (!data.user) {
        throw new Error('Account creation failed. Please try again.');
      }

      console.log('✅ Sign up successful for:', cleanEmail);
      
      // If user needs email confirmation
      if (data.user && !data.session) {
        console.log('📧 Email confirmation required');
      }
      
    } catch (error: any) {
      console.error('❌ Sign up failed:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('🔐 Attempting Google sign in...');
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        throw new Error(handleAuthError(error));
      }

      console.log('✅ Google sign in initiated');
      
    } catch (error: any) {
      console.error('❌ Google sign in failed:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out user...');
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(handleAuthError(error));
      }
      
      console.log('✅ Sign out successful');
      
    } catch (error: any) {
      console.error('❌ Sign out error:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    try {
      console.log('🔑 Updating password...');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw new Error(handleAuthError(error));
      }
      
      console.log('✅ Password updated successfully');
      
    } catch (error: any) {
      console.error('❌ Password update error:', error.message);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    if (!email?.trim()) {
      throw new Error('Please enter your email address');
    }

    const cleanEmail = email.trim().toLowerCase();
    
    try {
      console.log('📧 Sending password reset email to:', cleanEmail);
      
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        throw new Error(handleAuthError(error));
      }
      
      console.log('✅ Password reset email sent');
      
    } catch (error: any) {
      console.error('❌ Password reset error:', error.message);
      throw error;
    }
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