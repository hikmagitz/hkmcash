import { createContext, useContext, useEffect, useState } from 'react';
import { createClient, User, AuthError } from '@supabase/supabase-js';

// Check if environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client only if environment variables are available
const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isPremium: boolean;
  isOfflineMode: boolean;
  connectionStatus: 'online' | 'offline' | 'checking';
  switchToOfflineMode: () => void;
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
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  // Demo users for offline mode
  const demoUsers = [
    { email: 'demo@example.com', password: 'demo123', firstName: 'Demo', lastName: 'User', isPremium: true },
    { email: 'admin@hkmcash.com', password: 'admin123', firstName: 'Admin', lastName: 'User', isPremium: true },
    { email: 'user@test.com', password: 'test123', firstName: 'Test', lastName: 'User', isPremium: false },
  ];

  // Function to manually switch to offline mode
  const switchToOfflineMode = () => {
    console.log('🔧 Manually switching to offline mode');
    setIsOfflineMode(true);
    setConnectionStatus('offline');
    setUser(null);
    setIsPremium(false);
    localStorage.removeItem('offline_user');
  };

  // Check connection status
  const checkConnectionStatus = async () => {
    if (!supabase) {
      setConnectionStatus('offline');
      setIsOfflineMode(true);
      return false;
    }

    try {
      setConnectionStatus('checking');
      // Try to make a simple request to check connectivity
      const { error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error && error.message.includes('JWT')) {
        // JWT error means we're connected but not authenticated
        setConnectionStatus('online');
        setIsOfflineMode(false);
        return true;
      } else if (error) {
        // Other errors might indicate connection issues
        console.log('🔧 Database connection error, switching to offline mode:', error.message);
        setConnectionStatus('offline');
        setIsOfflineMode(true);
        return false;
      } else {
        setConnectionStatus('online');
        setIsOfflineMode(false);
        return true;
      }
    } catch (error) {
      console.log('🔧 Connection check failed, switching to offline mode');
      setConnectionStatus('offline');
      setIsOfflineMode(true);
      return false;
    }
  };

  // Check if we're in offline mode (no Supabase config)
  const checkOfflineMode = () => {
    if (!supabase) {
      console.log('🔧 Running in offline mode - Supabase not configured');
      setIsOfflineMode(true);
      setConnectionStatus('offline');
      
      // Check for stored offline user
      const offlineUser = localStorage.getItem('offline_user');
      if (offlineUser) {
        try {
          const userData = JSON.parse(offlineUser);
          setUser(userData);
          setIsPremium(userData.isPremium || false);
        } catch (error) {
          console.error('Error parsing offline user data:', error);
          localStorage.removeItem('offline_user');
        }
      }
      
      setLoading(false);
      return true;
    }
    return false;
  };

  // Debug function to check environment variables
  const checkEnvironment = () => {
    console.log('🔍 Environment Check:');
    console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Missing Supabase environment variables!');
      console.log('Please check your .env file contains:');
      console.log('VITE_SUPABASE_URL=your_supabase_url');
      console.log('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
      return false;
    }
    return true;
  };

  // Helper function to clear invalid session
  const clearInvalidSession = async () => {
    console.log('🧹 Clearing invalid session...');
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.log('Error during session cleanup:', error);
    }
    setUser(null);
    setIsPremium(false);
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    
    // Check environment variables first
    const hasValidConfig = checkEnvironment();
    
    // If no valid config, switch to offline mode
    if (!hasValidConfig || checkOfflineMode()) {
      return;
    }

    const initializeAuth = async () => {
      try {
        console.log('🔍 Initializing authentication...');
        
        // Check connection first
        const isOnline = await checkConnectionStatus();
        if (!isOnline || !mounted) {
          setLoading(false);
          return;
        }
        
        // Get current session
        const { data: { session }, error } = await supabase!.auth.getSession();
        
        if (error) {
          console.error('❌ Session error:', error.message);
          console.error('Full error:', error);
          
          // Check for invalid refresh token error
          if (error.message.includes('Invalid Refresh Token') || 
              error.message.includes('Refresh Token Not Found') ||
              error.message.includes('refresh_token_not_found')) {
            console.log('🔄 Invalid refresh token detected, clearing session...');
            await clearInvalidSession();
          }
        } else if (session?.user && mounted) {
          console.log('✅ Found existing session for:', session.user.email);
          setUser(session.user);
        } else {
          console.log('ℹ️ No existing session found');
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        // If there's any error during initialization, clear the session to be safe
        await clearInvalidSession();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔄 Auth state change:', event);
      console.log('Session:', session ? 'Present' : 'None');
      
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

  // Check premium status when user changes (only in online mode)
  useEffect(() => {
    if (isOfflineMode || !user || !supabase) {
      if (isOfflineMode && user) {
        // In offline mode, check localStorage for premium status
        const offlineUser = localStorage.getItem('offline_user');
        if (offlineUser) {
          try {
            const userData = JSON.parse(offlineUser);
            setIsPremium(userData.isPremium || false);
          } catch (error) {
            console.error('Error parsing offline user premium status:', error);
            setIsPremium(false);
          }
        }
      } else {
        setIsPremium(false);
      }
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
  }, [user, isOfflineMode]);

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
        if (error.message.includes('Invalid Refresh Token') || 
            error.message.includes('Refresh Token Not Found')) {
          return 'Your session has expired. Please sign in again.';
        }
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!email?.trim() || !password?.trim()) {
      throw new Error('Please enter both email and password');
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if this is a demo user credential
    const isDemoCredential = demoUsers.some(u => 
      u.email.toLowerCase() === cleanEmail && u.password === password
    );

    // If offline mode OR demo credentials are being used, handle offline sign in
    if (isOfflineMode || isDemoCredential) {
      console.log('🔧 Offline sign in attempt');
      
      // Check against demo users
      const demoUser = demoUsers.find(u => 
        u.email.toLowerCase() === cleanEmail && u.password === password
      );
      
      if (demoUser) {
        const offlineUser = {
          id: `offline-${demoUser.email}`,
          email: demoUser.email,
          user_metadata: {
            firstName: demoUser.firstName,
            lastName: demoUser.lastName
          },
          isPremium: demoUser.isPremium
        };
        
        localStorage.setItem('offline_user', JSON.stringify(offlineUser));
        setUser(offlineUser as any);
        setIsPremium(demoUser.isPremium);
        
        // If we weren't in offline mode before, switch to it
        if (!isOfflineMode) {
          setIsOfflineMode(true);
          setConnectionStatus('offline');
        }
        
        console.log('✅ Offline sign in successful');
        return;
      } else if (isOfflineMode) {
        throw new Error('Invalid credentials. Try demo@example.com / demo123 or admin@hkmcash.com / admin123');
      }
    }

    // If we have demo credentials but we're in online mode, suggest switching to offline
    if (!isOfflineMode && isDemoCredential && supabase) {
      console.log('🔧 Demo credentials detected, attempting online auth first...');
    }

    if (!supabase) {
      throw new Error('Authentication service not available');
    }

    try {
      console.log('🔐 Attempting sign in for:', cleanEmail);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password.trim()
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        
        // If this is an invalid credentials error and the user is trying demo credentials,
        // suggest switching to offline mode
        if (error.message === 'Invalid login credentials' && isDemoCredential) {
          throw new Error('These appear to be demo credentials. The account doesn\'t exist in the database. Would you like to try offline mode instead?');
        }
        
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

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    if (!email?.trim() || !password?.trim()) {
      throw new Error('Please enter both email and password');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Offline mode fallback
    if (isOfflineMode) {
      console.log('🔧 Offline sign up attempt');
      throw new Error('Sign up is not available in offline mode. Use demo credentials to sign in.');
    }

    if (!supabase) {
      throw new Error('Authentication service not available');
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
            firstName: firstName?.trim() || '',
            lastName: lastName?.trim() || '',
            email_confirm: true
          }
        }
      });

      if (error) {
        console.error('❌ Sign up error:', error);
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
    if (isOfflineMode) {
      throw new Error('Google sign in is not available in offline mode.');
    }

    if (!supabase) {
      throw new Error('Authentication service not available');
    }

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
        console.error('❌ Google sign in error:', error);
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
      
      if (isOfflineMode) {
        localStorage.removeItem('offline_user');
        setUser(null);
        setIsPremium(false);
        console.log('✅ Offline sign out successful');
        return;
      }

      if (!supabase) {
        throw new Error('Authentication service not available');
      }
      
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
    if (isOfflineMode) {
      throw new Error('Password update is not available in offline mode.');
    }

    if (!supabase) {
      throw new Error('Authentication service not available');
    }

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
    if (isOfflineMode) {
      throw new Error('Password reset is not available in offline mode.');
    }

    if (!supabase) {
      throw new Error('Authentication service not available');
    }

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
    isPremium,
    isOfflineMode,
    connectionStatus,
    switchToOfflineMode
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};