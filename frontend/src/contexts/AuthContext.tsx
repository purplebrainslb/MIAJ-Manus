import { createContext, useState, useEffect, useContext } from 'react';
import { supabase, getCurrentUser, getSession, onAuthStateChange } from '../services/supabaseClient';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
// Define the auth context type
interface AuthContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  signIn: (provider: 'google' | 'facebook') => Promise<any>;
  signOut: () => Promise<any>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session and user
    const initializeAuth = async () => {
      setLoading(true);
      
      // Get current session
      const { session: currentSession } = await getSession();
      setSession(currentSession);
      
      // Get user if session exists
      if (currentSession) {
        const { user: currentUser } = await getCurrentUser();
        setUser(currentUser);
      }
      
      setLoading(false);
    };
    
    initializeAuth();
    
    // Set up auth state change listener
//    const { data: authListener } = onAuthStateChange((event, session) => {
  //    setSession(session);
//      setUser(session?.user ?? null);
  //    setLoading(false);
//    });
    


const { data: authListener } = onAuthStateChange(
  (event: AuthChangeEvent, session: Session | null) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
  });
    
    // Clean up listener on unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  
  // Sign in with provider
  const signIn = async (provider: 'google' | 'facebook') => {
    try {
      setLoading(true);
      
      let result;
      if (provider === 'google') {
        result = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });
      } else {
        result = await supabase.auth.signInWithOAuth({
          provider: 'facebook',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      return await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Context value
  const value = {
    user,
    session,
    loading,
    signIn,
    signOut
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
