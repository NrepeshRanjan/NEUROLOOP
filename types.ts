
import { AuthSession } from '@supabase/supabase-js';

export type GameType = 'orbit' | 'phase' | 'flux' | 'gather' | 'avoid' | 'breath';

export interface GameState {
  isRunning: boolean;
  activeGame: GameType | null;
  score: number;
  level: number;
  circlesMissed: number;
  hitCount: number;
  totalClicks: number;
  accuracy: number; // Percentage
  averageClickSpeed: number | null; // ms per click
  gameTime: number; // seconds
  ruleShiftsApplied: number;
  message: string;
  // Specific game state data
  orbitAngle: number;
  orbitRadius: number; // For ORBIT: 0 = inner, 1 = outer
  fluxPolarity: 'white' | 'red'; // For FLUX
  breathSize: number; // For BREATH
  avoidPos: { x: number, y: number }; // For AVOID (Player pos)
  
  // Legacy/Shared
  echoBuffer: Array<{ x: number, y: number, timestamp: number, type: string }>;
  weightPos: { x: number, y: number, velocityX: number, velocityY: number };
  blindMaskPos: { x: number, y: number };
  isLogicInverted: boolean; 
  lastChoiceTime: number; 
  patienceFactor: number; 
}

export interface GameRule {
  targetColor: string; 
  minCircleSize: number;
  maxCircleSize: number;
  minSpeed: number; 
  maxSpeed: number; 
  spawnInterval: number; 
  maxCirclesOnScreen: number;
  clickAccuracyThreshold: number;
  variation: string; 
}

export interface CircleData {
  id: string;
  x: number;
  y: number;
  size: number;
  dx: number; 
  dy: number; 
  color: string; 
  isTarget: boolean; // In new games, this often means "Player" or "Enemy"
  type?: 'player' | 'enemy' | 'obstacle' | 'gate' | 'particle' | 'target-ring' | 'breathing-ring';
  opacity?: number;
  scale?: number;
  spawnTime: number;
  // Specific physics
  angle?: number; // For Orbit obstacles
  orbitDistance?: number;
}

export interface Admin {
  uid: string;
  role: 'admin';
  created_at: string;
}

export interface AppConfig {
  id: string;
  global_ads_enabled: boolean;
  banner_enabled: boolean;
  interstitial_enabled: boolean;
  rewarded_enabled: boolean;
  aggressive_ads_enabled: boolean;
  min_gap_seconds: number;
  max_ads_per_session: number;
  privacy_policy_url: string;
  terms_of_use_url: string;
  ads_disclosure_url: string | null;
  contact_url: string | null;
  updated_by: string | null;
  updated_at: string;
}

export interface PublicPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  content_format: 'markdown' | 'html' | 'text';
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicLink {
  id: string;
  label: string;
  url: string;
  slug: string;
  link_type: 'internal' | 'external';
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type { AuthSession };
