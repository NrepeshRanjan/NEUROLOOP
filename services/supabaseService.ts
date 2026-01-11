
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppConfig, PublicPage, PublicLink } from '../types';

const supabaseUrl: string = 'https://yhfsbztsmsxjgnvjkvqp.supabase.co';
const supabaseAnonKey: string = 'sb_publishable_cFLgAPwxsGNHE-nq6CLyMg_MNRhl_Ey';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetches the application configuration from the 'app_config' table.
 * Assumes a single configuration entry or takes the first one found.
 * @returns A promise that resolves to the AppConfig object or null if not found.
 */
export async function fetchAppConfig(): Promise<AppConfig | null> {
  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('*')
      .eq('id', 'YOUR_APP_CONFIG_ID') // Assuming a single, well-known ID or the first one
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching app config:', error);
      return null;
    }

    // If no specific ID, fetch the first active one, or just the first.
    // For now, let's just fetch the first one if the above fails.
    if (!data) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('app_config')
        .select('*')
        .limit(1)
        .single();
      if (fallbackError && fallbackError.code !== 'PGRST116') {
        console.error('Error fetching fallback app config:', fallbackError);
        return null;
      }
      return fallbackData as AppConfig | null;
    }

    return data as AppConfig;
  } catch (err) {
    console.error('Unexpected error in fetchAppConfig:', err);
    return null;
  }
}

/**
 * Fetches all active public pages from the 'public_pages' table.
 * @returns A promise that resolves to an array of PublicPage objects.
 */
export async function fetchPublicPages(): Promise<PublicPage[]> {
  try {
    const { data, error } = await supabase
      .from('public_pages')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching public pages:', error);
      return [];
    }
    return data as PublicPage[];
  } catch (err) {
    console.error('Unexpected error in fetchPublicPages:', err);
    return [];
  }
}

/**
 * Fetches all active public links from the 'public_links' table.
 * @returns A promise that resolves to an array of PublicLink objects.
 */
export async function fetchPublicLinks(): Promise<PublicLink[]> {
  try {
    const { data, error } = await supabase
      .from('public_links')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching public links:', error);
      return [];
    }
    return data as PublicLink[];
  } catch (err) {
    console.error('Unexpected error in fetchPublicLinks:', err);
    return [];
  }
}
