// Token refresh utility using Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key not found in environment variables');
}

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const refreshToken = async (): Promise<string | null> => {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }

  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Token refresh failed:', error);
      return null;
    }

    if (data.session?.access_token) {
      // Update localStorage with new token
      localStorage.setItem('access_token', data.session.access_token);
      return data.session.access_token;
    }

    return null;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
};

export const getCurrentSession = async () => {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Get session failed:', error);
      return null;
    }

    return data.session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
};

export const signOut = async () => {
  if (!supabase) {
    return false;
  }

  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    return false;
  }
};
