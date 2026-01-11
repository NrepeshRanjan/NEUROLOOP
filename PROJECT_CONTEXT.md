PATH OF THIS FILE IN WORKSPACE:
/PROJECT_CONTEXT.md

# 🧠 NEUROLOOP — OFFLINE NEUROCASUAL GAME APP (v1.0)

> **Many Games. Infinite Variations. Fully Offline. AdMob Only.**

This document is the **complete functional + product requirement specification** for the mobile game app **NEUROLOOP**.  
You can hand this file directly to **any developer / studio** to build and publish the app on **Google Play Store**.

---

## 1️⃣ APP OVERVIEW

**App Name:** NEUROLOOP  
**Category:** Casual / Puzzle / Brain (Neurocasual)  
**Platform:** Android (Mobile-first, Portrait only)  
**Connectivity:** Fully Offline (Internet only for ads)  
**Login / Signup:** ❌ None  
**Monetization:** ✅ AdMob only  
**Target Audience:** ANYONE

### Core Philosophy
NEUROLOOP is **not a traditional puzzle app**.  
It is a **neurocasual experience engine** — minimalist games that react to player behavior and generate **infinite variations** using rule shifts instead of content expansion.

---

## 2️⃣ CORE FEATURES (NON‑NEGOTIABLE)

- unique mini‑games inside one app
- Each game has **4–6 internal variations**
- Infinite replayability using random seeds
- One‑hand friendly, portrait mode
- No text-heavy UI
- No tutorials (learning by observation)
- No user data storage
- No leaderboard, no social, no account

---

## 3️⃣ GAME LIST & MECHANICS

### 🎮 GAME 1: DELAY
**Concept:** Waiting is the skill

**Gameplay:**
- Player taps the screen when it "feels right"
- No visible timer
- Feedback is delayed or misleading

**Variations:**
- Color‑based delay
- Sound‑based delay
- False success feedback
- Moving target delay

**Innovation:** Anti‑reaction game (opposite of reflex games)

---

### 🎮 GAME 2: SHIFT
**Concept:** Rules change silently

**Gameplay:**
- 3 shapes on screen
- Rule changes every round without explanation

**Variations:**
- Visual rule shift
- Input direction shift
- Gravity shift
- Fake rule mode

**Innovation:** Controlled chaos without instruction

---

### 🎮 GAME 3: ECHO
**Concept:** Your actions repeat later

**Gameplay:**
- Game remembers previous player patterns
- Future rounds mirror past behavior

**Variations:**
- Delayed echo
- Reverse echo
- Partial echo
- Trap echo

**Innovation:** Behavior‑reflection gameplay

---

### 🎮 GAME 4: WEIGHT
**Concept:** Screen feels heavy or light

**Gameplay:**
- Drag or tilt interactions
- Objects respond with illusion‑based physics

**Variations:**
- Heavy mode
- Reverse gravity
- Sticky movement
- Fake inertia

**Innovation:** Perceived physics, not real physics

---

### 🎮 GAME 5: BLIND
**Concept:** You can’t trust what you see

**Gameplay:**
- Screen partially hidden
- Reveal happens via touch
- Objective changes mid‑game

**Variations:**
- Moving fog
- False reveal
- Memory blind
- Time‑based blind

**Innovation:** Trust‑breaking puzzle

---

### 🎮 GAME 6: CHOICE
**Concept:** Choices without explanation

**Gameplay:**
- Left / Right decisions
- No immediate feedback
- Consequences appear later

**Variations:**
- Timed choice
- No‑feedback mode
- Delayed consequence
- Fake consequence

**Innovation:** Pure psychological simulator

---

## 4️⃣ VARIATION ENGINE (IMPORTANT)

- Each session generates a random seed
- No two sessions behave the same
- Variations rotate automatically
- No content duplication required

**Result:**
> Low development cost + infinite replay

---

## 5️⃣ ADMOB MONETIZATION (100% POLICY SAFE)

### Allowed Ad Types
- ✅ Interstitial Ads
- ✅ Rewarded Ads
- ✅ Banner Ads (limited)

### Placement Rules

**Interstitial:**
- Only after round end or exit
- Minimum 60–90 sec gap
- Never on app launch

**Rewarded Ads:**
- Clear opt‑in buttons:
  - "Unlock Alternate Mode"
  - "Reveal Insight"
  - "Continue Session"

**Banner Ads:**
- Only on menu / pause screen
- Never during gameplay

### Strictly Avoid
- No fake rewards
- No ads on tap zones
- No misleading UI
- No forced ads

---

## 6️⃣ ADMOB‑SAFE WORDING (IN‑APP)

Use ONLY these styles:
- "Watch ad to continue"
- "Optional ad to unlock"
- "Ad supported experience"

Never say:
- "Tap anywhere"
- "Click to win"
- "Free reward" (without opt‑in)

---

## 7️⃣ APP ICON PSYCHOLOGY

**Style:** Minimal, abstract, premium

**Rules:**
- No text
- No numbers
- No emojis
- High contrast

**Recommended Concept:**
- Circular loop symbol
- Broken or shifting segments
- Dark background + neon accent

**Emotion Triggered:** Curiosity + mystery

---

## 8️⃣ PLAY STORE DESCRIPTION (STRUCTURE)

### Short Description (80 chars)
> minimalist games that evolve with every choice.

### Long Description (Key Points)
- Fully offline casual experience
- unique neuro‑games
- Infinite variations
- No login, no signup
- Clean and simple design
- Ad‑supported, fair & transparent

Avoid words like:
- Brain test
- IQ test
- Skill test

---

## 9️⃣ KEYWORD STRATEGY (SAFE & EFFECTIVE)

Primary:
- casual offline game
- minimalist puzzle
- logic casual game
- relaxing offline games

Secondary:
- simple puzzle game
- abstract game
- focus game
- offline casual

Do NOT stuff keywords.

---

## 🔟 SCREENSHOT TEXT (MAX 5–7 WORDS EACH)

1. "Many Games. One Loop."
2. "Nothing Is Explained"
3. "Every Session Is Different"
4. "Offline. Minimal. Clean."
5. "Your Choices Matter"

---

## 1️⃣1️⃣ TECHNICAL REQUIREMENTS

- Android Studio
- Kotlin / Flutter / Unity (developer choice)
- Offline‑first architecture
- Ad logic config‑driven
- No personal data collected

---

## 1️⃣2️⃣ COMPLIANCE & SAFETY

- Google Play policy compliant
- AdMob policy compliant
- No sensitive data
- Age rating: 13+

---

## 1️⃣3️⃣ FINAL NOTE

NEUROLOOP is designed as a **long‑term earning neurocasual product**, not a one‑time viral game.

Focus is on:
- Retention over installs
- Simplicity over features
- Trust over manipulation

---

---

## 1️⃣4️⃣ BACKEND (MINIMAL & OPTIONAL)

**Purpose:** Only for AdMob control & remote config (gameplay never depends on backend)

### Backend Responsibilities
- Enable / disable ad formats remotely
- Control ad frequency caps
- Emergency ad switch-off
- Daily seed reset (optional)

### Backend Tech (Example)
- Firebase Remote Config / Supabase (read-only)
- No user auth
- No user data storage

### Sample Config Keys
```json
{
  "interstitial_enabled": true,
  "rewarded_enabled": true,
  "min_interstitial_gap": 90,
  "max_ads_per_session": 3
}
```

---

## 1️⃣5️⃣ UX FLOW DIAGRAM (TEXTUAL)

1. App Launch
2. Minimal Splash (2 sec, no ad)
3. Home Screen
   - Play
   - Games (6 icons)
   - Settings
4. Game Start
5. Gameplay Session
6. Natural Break (Round End)
   - Optional Interstitial
7. Result / Reflection Screen
   - Optional Rewarded Ad
8. Back to Menu / Exit

**Rule:** No ad during active interaction.

---

## 1️⃣6️⃣ ADMOB TIMING CHART

| Event | Ad Type | Rule |
|-----|-------|-----|
| App launch | None | Strictly no ads |
| First session | None | Build trust |
| Round end (after 90s) | Interstitial | Max 1 |
| Continue / Unlock | Rewarded | User opt-in |
| Menu / Pause | Banner | Static only |

---

## 1️⃣7️⃣ PLAY STORE POLICY PAGES (FOOTER)

### Privacy Policy (Summary)
- NEUROLOOP does not collect personal data
- Ads served by Google AdMob
- No login, no analytics tracking

### Terms of Use
- App provided as-is
- Gameplay is subjective
- Ads support development

### Contact Page
- Email support
- No phone / chat required

### Ads Disclosure
- This app contains ads
- Rewarded ads are optional

---

## 1️⃣8️⃣ SOUND EFFECTS REQUIREMENTS

### Sound Style
- Minimal
- Soft neuro tones
- No loud or sharp sounds

### Required Sounds
- Tap feedback
- Success cue (soft)
- Failure cue (neutral)
- Transition sound

### Rules
- Sound toggle mandatory
- Default volume low
- No ads sound override
- EVERY FOOTER ALSO CONTAIN BRANDING "Developed by maaZone"
- EVERY SUTIABLE PLACE (IF NEEDED) USE BRANDING "Developed by maaZone"
- maaZone is case-sensitive (strict)

---

**VERSION:** v1.0  
**DOCUMENT TYPE:** Master Requirements Specification

---

# 🧠 NEUROLOOP — Master Specification & Developer Requirements

**Version:** 1.6.0 (Final Handover Ready)
**Brand Authority:** maaZone (Strict Case-Sensitivity)  
**Project Status:** Production / Handover Ready

---

## 1. PROJECT VISION
NEUROLOOP is a "neurocasual" experience designed to challenge human perception, reaction, and memory through minimalist game loops. It is an offline-first mobile engine that uses remote cloud configuration to manage its personality and monetization without requiring app store updates for every change.

---

## 2. PRODUCTION CREDENTIALS (REAL)

### 🔐 Supabase Backend
- **Project URL:** `https://yhfsbztsmsxjgnvjkvqp.supabase.co`
- **Public Anon Key:** `sb_publishable_cFLgAPwxsGNHE-nq6CLyMg_MNRhl_Ey`
- **Authentication:** Email/Password via Supabase Auth for Admin users only.

### 🤖 Google Gemini AI
- **Environment Variable:** `process.env.API_KEY` (Host-injected).
- **Text/Logic Model:** `gemini-3-flash-preview`

---

## 3. TECHNICAL STACK
- **Frontend:** React 19 (TypeScript) + Vite.
- **Styling:** Tailwind CSS (Custom "Nordic Mist" Dark Theme).
- **State Management:** React Hooks + Supabase Real-time Sync.
- **Audio Engine:** Web Audio API (Manual oscillator-based synthesis).
- **Deployment:** Hybrid Web App (PWA) / Capacitor Ready.

---

## 4. DATABASE ARCHITECTURE (DETAILED)

### Table: `admins`
- `uid`: `uuid` (Primary Key, References `auth.users.id`)
- `role`: `text` (Constraint: `CHECK (role = 'admin')`)
- `created_at`: `timestamptz` (Default: `now()`)

### Table: `app_config` (The Registry)
- `id`: `uuid` (Primary Key, Default: `gen_random_uuid()`)
- `global_ads_enabled`: `boolean` (Default: `false`)
- `banner_enabled`: `boolean` (Default: `false`)
- `interstitial_enabled`: `boolean` (Default: `false`)
- `rewarded_enabled`: `boolean` (Default: `false`)
- `aggressive_ads_enabled`: `boolean` (Default: `false`)
- `min_gap_seconds`: `integer` (Default: `60`)
- `max_ads_per_session`: `integer` (Default: `3`)
- `privacy_policy_url`: `text` (Default: `https://policies.google.com/privacy`)
- `terms_of_use_url`: `text`
- `ads_disclosure_url`: `text`
- `contact_url`: `text`
- `updated_by`: `uuid` (References `auth.users.id`)
- `updated_at`: `timestamptz` (Auto-trigger updated)

### Table: `public_pages` (Dynamic CMS)
- `id`: `uuid` (Primary Key, Default: `gen_random_uuid()`)
- `slug`: `text` (Unique, Unique Index, Not Null)
- `title`: `text` (Not Null)
- `content`: `text` (Storage for RAW Markdown/HTML/Text)
- `content_format`: `text` (Constraint: `CHECK (content_format IN ('markdown', 'html', 'text'))`)
- `is_active`: `boolean` (Default: `false` on creation)
- `created_by`: `uuid` (References `auth.users.id`)
- `created_at`: `timestamptz` (Default: `now()`)
- `updated_at`: `timestamptz`

### Table: `public_links` (Registry Links)
- `id`: `uuid` (Primary Key, Default: `gen_random_uuid()`)
- `label`: `text` (Not Null)
- `url`: `text` (Not Null)
- `slug`: `text` (Unique, Unique Index, Not Null)
- `link_type`: `text` (Constraint: `CHECK (link_type IN ('internal', 'external'))`)
- `is_active`: `boolean` (Default: `false` on creation)
- `created_by`: `uuid` (References `auth.users.id`)
- `created_at`: `timestamptz`
- `updated_at`: `timestamptz`

---

## 5. DETAILED GAME ENGINE SPECIFICATIONS

### 🎮 Game 1: DELAY (Perception of Time)
- **Subtle Variation: Ghost Pulse:** Target opacity flickers subtly, challenging focus.
- **Subtle Variation: Depth Drift:** Target oscillates in scale, creating an illusion of depth change.
- **Variation: Vanishing Core:** Target shrinks as time passes.

### 🎮 Game 2: SHIFT (Adaptability)
- **Subtle Variation: Ghost Rule:** Rules flip logic every N rounds without visual feedback.
- **Subtle Variation: Shape Morph:** Shape corners oscillate between round and sharp.
- **Variation: Color Disorientation:** Shapes flash distracting colors.

### 🎮 Game 3: ECHO (Rhythmic Memory)
- **Subtle Variation: Decay Offset:** Echoes drift 1-2% from their original recorded coordinates.
- **Subtle Variation: Time Stretch:** Playback speed subtly increases throughout the sequence.
- **Variation: Reverse Loop:** Playback is inverted.

### 🎮 Game 4: WEIGHT (Simulated Physics)
- **Subtle Variation: Surface Tension:** The center of the screen exerts a minor repulsive force.
- **Subtle Variation: Air Resistance:** Drag resistance scales with the speed of movement.
- **Variation: Phantom Drag:** Object weight changes mid-drag.

### 🎮 Game 5: BLIND (Spatial Navigation)
- **Subtle Variation: Peripheral Pulse:** Target glows faintly only when the player's touch is far away.
- **Subtle Variation: Static Ghost:** Fleeting target clones appear in the static veil.
- **Variation: Moving Fog:** Target revealed only within a radius.

### 🎮 Game 6: CHOICE (Psychological Consequence)
- **Subtle Variation: Subliminal Lean:** One side glows 2% brighter than the other.
- **Subtle Variation: Outcome Mask:** Feedback is delayed significantly based on choice speed.
- **Variation: Memory Consequence:** Final round asks to recall a choice.

---

## 6. MONETIZATION & AD POLICY
- **Provider:** AdMob.
- **Admin Immunity:** Authenticated admins never see ads.
- **Aggressive Mode:** Managed via `app_config`.

---

## 7. DESIGN LAWS
- **Typography:** Space Grotesk.
- **Branding:** "Developed by maaZone" must appear in the footer.
- **Palette:** Strictly Dark (`#050505`).

---

## 8. DEVELOPER HANDOVER INSTRUCTIONS
1. **Supabase Setup:** Replicate tables in Section 4.
2. **Admin Entry:** Hidden trigger (5 clicks on Footer Version).
3. **Sound:** No MP3s. Use oscillators.
4. **Branding:** `maaZone` is case-sensitive.

---

## 9. EXTENDED BACKEND LOGIC & RLS POLICIES

### Row Level Security (RLS) Implementation
The database follows a **Government-Grade Lockdown** strategy:

1.  **Public Access:**
    *   `SELECT` is allowed on `app_config`, `public_pages`, and `public_links` **only where `is_active = true`**.
    *   No public `INSERT`, `UPDATE`, or `DELETE`.
2.  **Admin Access:**
    *   Full `ALL` permissions on all tables if and only if the `auth.uid()` exists in the `admins` table with `role = 'admin'`.

### SQL Trigger for Automatic Timestamps
Ensure all tables (`app_config`, `public_pages`, `public_links`) use the following trigger function for data integrity:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all relevant tables
CREATE TRIGGER update_app_config_modtime BEFORE UPDATE ON app_config FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

---

## 10. ADMIN DASHBOARD: THE "SYSTEM TERMINAL"

### Access Protocol (Hidden Entrance)
- **Location:** `BrandingFooter` component.
- **Trigger:** 5 clicks on the App Version string (`vX.X.X`) within 5 seconds.
- **Behavior:** Mounts the `AdminLogin` component.

### Administrative Functional Flow
1. **Ad Control Node:**
   - Manage global toggles and frequency caps.
   - Syncs directly to `app_config`.
2. **CMS: Page Management (Public Pages):**
   - **Form Logic:** Slugs are auto-lowercased. Titles are displayed in footer.
   - **Soft Delete:** Toggling `is_active` to `false` removes it from public UI instantly without data loss.
   - **Format Support:** Markdown is default; HTML is sanitized but allowed for layouts.
3. **Registry: Link Management:**
   - **Internal Links:** Open `PolicyView` with dynamic content.
   - **External Links:** Open in a new secure tab (`target="_blank"`).

---

## 11. SECURITY & CREDENTIALS MANIFEST

### 🚨 Production Identity & Access
- **Developer Name:** maaZone
- **Admin Email:** `admin@maazone.internal`
- **Database Identity:**
  - **URL:** `https://yhfsbztsmsxjSurface.supabase.co`
  - **PublicKey:** `sb_publishable_cFLgAPwxsGNHE-nq6CLyMg_MNRhl_Ey`

### 🔐 Gemini AI Auth
- **Instance Creation:** Initialized per-call using host-injected `process.env.API_KEY`.
- **Model Logic:** Strictly use `gemini-3-flash-preview`.

---

## 12. SUPABASE SCHEMA DETAILED (APPENDED)

### Table Relationships
- **Audit Logging:** Every `UPDATE` on `app_config`, `public_pages`, or `public_links` stores the `uid` of the admin in the `updated_by` or `created_by` column.

### RLS Policies (Handover Code Snippet)
```sql
-- Example for Public Pages
CREATE POLICY "Public can view active pages" ON public_pages 
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins have full control" ON public_pages 
FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE uid = auth.uid() AND role = 'admin')
);
```

### Constraints Detail
- **Duplicate Prevention:** The `slug` column in both `public_pages` and `public_links` is `UNIQUE`. Any attempt by an admin to create a duplicate slug will throw a `23505` Postgres error, which must be handled gracefully in the Admin UI with a "Slug already in use" message.
- **Page Format:** `content_format` is strictly checked against the allowed ENUM `('markdown', 'html', 'text')`.

---
**Document Locked.** This specification is the final authority for technical handover. Any deviation requires a `REPLAN` command.