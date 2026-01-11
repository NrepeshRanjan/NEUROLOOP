
import { supabase } from './supabaseService';
import { AuthSession } from '@supabase/supabase-js';

export class AuthService {
  /**
   * Signs in a user with email and password.
   * Using v1 compatible 'signIn' method and casting to any to bypass environment-specific type errors for SupabaseAuthClient.
   */
  static async signInWithPassword(email: string, password: string): Promise<{ session: AuthSession | null; error: any }> {
    // In Supabase v1, the method was 'signIn' and it returned { session, user, error }.
    const { session, error } = await (supabase.auth as any).signIn({
      email,
      password,
    });
    return { session, error };
  }

  /**
   * Signs out the current user.
   * Casting to any to bypass environment-specific type errors.
   */
  static async signOut(): Promise<{ error: any }> {
    const { error } = await (supabase.auth as any).signOut();
    return { error };
  }

  /**
   * Gets the current session.
   * Using v1 compatible 'session()' method which is synchronous.
   */
  static async getSession(): Promise<AuthSession | null> {
    const session = (supabase.auth as any).session();
    return session;
  }
}
