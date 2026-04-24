import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface Shopkeeper {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  shop_name: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  shopkeeper: Shopkeeper | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

async function upsertShopkeeper(user: User): Promise<Shopkeeper | null> {
  // Check if shopkeeper row already exists
  const { data: existing } = await supabase
    .from('shopkeepers')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  if (existing) return existing as Shopkeeper;

  // First login — create shopkeeper row
  const { data: created, error } = await supabase
    .from('shopkeepers')
    .insert({
      auth_id: user.id,
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Shopkeeper',
      email: user.email || '',
      avatar_url: user.user_metadata?.avatar_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating shopkeeper:', error);
    return null;
  }

  return created as Shopkeeper;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [shopkeeper, setShopkeeper] = useState<Shopkeeper | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const sk = await upsertShopkeeper(session.user);
        setShopkeeper(sk);
      }

      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const sk = await upsertShopkeeper(session.user);
          setShopkeeper(sk);
        } else {
          setShopkeeper(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) console.error('Google sign-in error:', error);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setShopkeeper(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, shopkeeper, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
