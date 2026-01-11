
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AuthSession } from '@supabase/supabase-js';
import { GameArea } from './components/GameArea';
import { ControlPanel } from './components/ControlPanel';
import { GameSelector } from './components/GameSelector';
import { Modal } from './components/Modal';
import { AdOverlay } from './components/AdOverlay';
import { BrandingFooter } from './components/BrandingFooter';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { GameState, GameRule, CircleData, AppConfig, GameType } from './types';
import { NEUROCASUAL_INSIGHT_MODAL_ID } from './constants';
import { getNeuroCasualInsight } from './services/geminiService';
import { fetchAppConfig, supabase } from './services/supabaseService';
import { AuthService } from './services/authService';
import { audioService } from './services/audioService';

const INITIAL_GAME_STATE: GameState = {
  isRunning: false,
  activeGame: null,
  score: 0,
  level: 1,
  circlesMissed: 0,
  hitCount: 0,
  totalClicks: 0,
  accuracy: 100,
  averageClickSpeed: null,
  gameTime: 0,
  ruleShiftsApplied: 0,
  message: "SYSTEM READY",
  // New State Defaults
  orbitAngle: 0,
  orbitRadius: 0, // 0 = inner, 1 = outer
  fluxPolarity: 'white',
  breathSize: 60,
  avoidPos: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  
  // Legacy defaults required by type
  echoBuffer: [],
  weightPos: { x: 0, y: 0, velocityX: 0, velocityY: 0 },
  blindMaskPos: { x: -1000, y: -1000 },
  isLogicInverted: false,
  lastChoiceTime: 0,
  patienceFactor: 1,
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [currentRules, setCurrentRules] = useState<GameRule>({
    targetColor: 'bg-indigo-500',
    minCircleSize: 30,
    maxCircleSize: 70,
    minSpeed: 1.0,
    maxSpeed: 3.0,
    spawnInterval: 1200,
    maxCirclesOnScreen: 8,
    clickAccuracyThreshold: 85,
    variation: 'default',
  });
  const [circles, setCircles] = useState<CircleData[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [geminiInsight, setGeminiInsight] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [activeAd, setActiveAd] = useState<'interstitial' | 'rewarded' | null>(null);
  const [isHoldingBreath, setIsHoldingBreath] = useState(false); // For BREATH game

  const gameIntervalRef = useRef<number | null>(null);
  const spawnIntervalRef = useRef<number | null>(null);
  const gameTimerRef = useRef<number | null>(null);
  
  // For interaction tracking
  const mousePosRef = useRef({ x: window.innerWidth/2, y: window.innerHeight/2 });
  // Refs to sync state between loops without dependency issues
  const orbitAngleRef = useRef(0);
  const orbitRadiusRef = useRef(0);

  useEffect(() => {
    fetchAppConfig().then(setAppConfig);
    const { data: authListener } = (supabase.auth as any).onAuthStateChange((_: any, s: any) => setSession(s));
    AuthService.getSession().then(setSession);
    return () => authListener?.unsubscribe();
  }, []);

  const openModal = useCallback((content: string) => {
    setGeminiInsight(content);
    setModalOpen(true);
    audioService.playLevelUp();
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setGeminiInsight('');
    audioService.playClick();
  }, []);

  const handleAdClose = () => {
    setActiveAd(null);
    audioService.playClick();
  };

  const selectGame = (game: GameType) => {
    audioService.playClick();
    setGameState(prev => ({ ...prev, activeGame: game }));
    startGame(game);
  };

  const startGame = useCallback((gameType: GameType) => {
    audioService.playStart();
    setGameState({ 
      ...INITIAL_GAME_STATE, 
      isRunning: true, 
      activeGame: gameType,
      message: `LOADED: ${gameType.toUpperCase()}` 
    });
    
    setCircles([]);
    setIsHoldingBreath(false);
    
    // Reset Refs
    orbitAngleRef.current = 0;
    orbitRadiusRef.current = 0;

    // Clear loops
    [gameIntervalRef, spawnIntervalRef, gameTimerRef].forEach(ref => {
      if (ref.current) clearInterval(ref.current);
    });

    // 1. Timer Loop
    gameTimerRef.current = window.setInterval(() => {
      setGameState(prev => {
        if (prev.gameTime >= 90) { // Extended time for flow
          endGame();
          return prev;
        }
        return { ...prev, gameTime: prev.gameTime + 1 };
      });
    }, 1000);

    // 2. Physics & Logic Loop (60FPS approx)
    gameIntervalRef.current = window.setInterval(() => {
      setGameState(prevState => {
        if (!prevState.isRunning) return prevState;

        let newState = { ...prevState };
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // --- ORBIT LOGIC ---
        if (gameType === 'orbit') {
          newState.orbitAngle = (prevState.orbitAngle + 0.05) % (Math.PI * 2);
          orbitAngleRef.current = newState.orbitAngle; // Sync ref
        }

        // --- BREATH LOGIC ---
        if (gameType === 'breath') {
          if (isHoldingBreath) {
            newState.breathSize = Math.min(250, prevState.breathSize + 4);
          } else {
            newState.breathSize = Math.max(40, prevState.breathSize - 3);
          }
        }

        // --- AVOID LOGIC ---
        if (gameType === 'avoid') {
           // Smooth follow mouse
           const dx = mousePosRef.current.x - prevState.avoidPos.x;
           const dy = mousePosRef.current.y - prevState.avoidPos.y;
           newState.avoidPos = {
             x: prevState.avoidPos.x + dx * 0.15,
             y: prevState.avoidPos.y + dy * 0.15
           };
        }

        return newState;
      });

      setCircles(prevCircles => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;

        // --- PHASE LOGIC (Ring Pulse) ---
        if (gameType === 'phase') {
           // Update breathing ring
           const t = Date.now() / 1000;
           const breathSize = 100 + Math.sin(t * 3) * 50; // Oscillate between 50 and 150 radius (100-300px width)
           
           // Ensure circles exist
           if (prevCircles.length === 0) {
               return [
                   { id: 'target', x: cx - 100, y: cy - 100, size: 200, dx: 0, dy: 0, color: 'bg-transparent', isTarget: false, type: 'target-ring', spawnTime: 0 },
                   { id: 'breather', x: cx - breathSize, y: cy - breathSize, size: breathSize * 2, dx: 0, dy: 0, color: 'bg-indigo-500', isTarget: true, type: 'breathing-ring', spawnTime: 0 }
               ];
           }
           
           return prevCircles.map(c => {
               if (c.type === 'breathing-ring') {
                   return { ...c, x: cx - breathSize, y: cy - breathSize, size: breathSize * 2 };
               }
               return c;
           });
        }

        // --- ORBIT LOGIC (Player & Obstacles) ---
        if (gameType === 'orbit') {
            const currentAngle = orbitAngleRef.current;
            const currentRadius = orbitRadiusRef.current;
            
            // Render Player Satellite
            const playerRadius = currentRadius === 0 ? 80 : 160;
            const px = cx + Math.cos(currentAngle) * playerRadius;
            const py = cy + Math.sin(currentAngle) * playerRadius;
            
            // Collision Detection
            const collision = prevCircles.find(c => {
                const dist = Math.hypot(c.x - (px - 10), c.y - (py - 10)); // Adjust for center offset
                return c.type === 'obstacle' && dist < 40;
            });

            if (collision) {
               audioService.playTargetMiss();
               // Penalty handled via setGameState side effect
               setGameState(gs => ({
                   ...gs,
                   score: Math.max(0, gs.score - 5),
                   message: "IMPACT DETECTED"
               }));
            }

            // Update Obstacles
            const updatedCircles = prevCircles.filter(c => c.type !== 'player').map(c => {
                if (c.type === 'obstacle') {
                    const angle = (c.angle || 0) - 0.02; // Counter rotate
                    const ox = cx + Math.cos(angle) * (c.orbitDistance || 120);
                    const oy = cy + Math.sin(angle) * (c.orbitDistance || 120);
                    return { ...c, angle, x: ox - 10, y: oy - 10 };
                }
                return c;
            });

            // Re-inject player
            return [
                ...updatedCircles,
                { id: 'player', x: px - 15, y: py - 15, size: 30, dx: 0, dy: 0, color: 'bg-indigo-500', isTarget: true, type: 'player', spawnTime: 0 }
            ];
        }

        // --- GENERIC MOVEMENT (Flux, Gather, Breath, Avoid) ---
        return prevCircles.map(c => {
            let newX = c.x + c.dx;
            let newY = c.y + c.dy;

            // GATHER: Entropy logic
            if (gameType === 'gather') {
                // Particles drift away
                if (c.type === 'particle') {
                    const dist = Math.hypot(newX - cx, newY - cy);
                    if (dist > Math.min(window.innerWidth, window.innerHeight)/2 + 50) {
                        // Escaped
                        setGameState(gs => ({...gs, score: Math.max(0, gs.score - 5), message: "ENTROPY LEAK"}));
                        return { ...c, x: -9999 }; // Mark for deletion
                    }
                }
            }
            
            // FLUX: Move towards center
            if (gameType === 'flux' && c.type === 'particle') {
                const angle = Math.atan2(cy - c.y, cx - c.x);
                newX += Math.cos(angle) * 3; // Constant speed inward
                newY += Math.sin(angle) * 3;
                
                // Core Collision
                if (Math.hypot(newX - cx, newY - cy) < 40) {
                    setGameState(gs => {
                        const match = (c.color === 'bg-white' && gs.fluxPolarity === 'white') ||
                                      (c.color === 'bg-rose-500' && gs.fluxPolarity === 'red');
                        if (match) {
                            audioService.playTargetHit();
                            return { ...gs, score: gs.score + 10, message: "ABSORBED" };
                        } else {
                            audioService.playTargetMiss();
                            return { ...gs, score: Math.max(0, gs.score - 10), message: "POLARITY MISMATCH" };
                        }
                    });
                    return { ...c, x: -9999 };
                }
            }

            // BREATH: Gates move down
            if (gameType === 'breath' && c.type === 'gate') {
                setGameState(gs => {
                    // Collision check
                    const pRadius = gs.breathSize / 2;
                    // Simplified AABB vs Circle check
                    // Gate is a block at c.x, c.y with width c.size, height 20
                    // Gap in gate? No, assume gate is the obstacle.
                    // Actually, let's make gates "Safe Zones" or obstacles?
                    // Spec: "Pass through moving gates that require specific sizes."
                    // Implementation: Two blocks with a gap.
                    
                    // Let's implement obstacles (walls) moving down. Player is center.
                    // If circle overlaps obstacle, fail.
                    
                    const pLeft = cx - pRadius;
                    const pRight = cx + pRadius;
                    const pTop = cy - pRadius;
                    const pBottom = cy + pRadius;
                    
                    const obsLeft = c.x;
                    const obsRight = c.x + c.size;
                    const obsTop = c.y;
                    const obsBottom = c.y + 20;
                    
                    const collision = pRight > obsLeft && pLeft < obsRight && pBottom > obsTop && pTop < obsBottom;
                    
                    if (collision) {
                         audioService.playTargetMiss();
                         return { ...gs, score: Math.max(0, gs.score - 1), message: "COLLISION" };
                    }
                    return gs;
                });
            }

            // AVOID: Enemies chase player
            if (gameType === 'avoid' && c.type === 'enemy') {
                setGameState(gs => {
                    const angle = Math.atan2(gs.avoidPos.y - c.y, gs.avoidPos.x - c.x);
                    c.dx = Math.cos(angle) * (currentRules.minSpeed * 1.5);
                    c.dy = Math.sin(angle) * (currentRules.minSpeed * 1.5);
                    
                    // Collision
                    const dist = Math.hypot(c.x - gs.avoidPos.x, c.y - gs.avoidPos.y);
                    if (dist < 40) { // Player size approx 40
                         audioService.playTargetMiss();
                         return { ...gs, score: Math.max(0, gs.score - 2), message: "DAMAGE" };
                    }
                    return { ...gs, score: gs.score + 0.05 }; // Survival points
                });
                newX = c.x + c.dx;
                newY = c.y + c.dy;
            }

            return { ...c, x: newX, y: newY };
        }).filter(c => c.x > -200 && c.x < window.innerWidth + 200 && c.y > -200 && c.y < window.innerHeight + 200);

      });
    }, 16); // 60 FPS

    // 3. Spawning Loop
    spawnIntervalRef.current = window.setInterval(() => {
      setCircles(prev => {
        if (prev.length >= currentRules.maxCirclesOnScreen) return prev;
        
        const id = Math.random().toString(36).substr(2, 9);
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;

        if (gameType === 'orbit') {
            // Spawn Obstacles
            return [...prev, {
                id,
                x: 0, y: 0, // Managed by angle
                size: 20,
                dx: 0, dy: 0,
                color: 'bg-rose-500',
                isTarget: false,
                type: 'obstacle',
                angle: Math.random() * Math.PI * 2,
                orbitDistance: Math.random() > 0.5 ? 80 : 160,
                spawnTime: Date.now()
            }];
        }

        if (gameType === 'gather') {
            // Spawn expanding particles from center
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2 + 1;
            return [...prev, {
                id,
                x: cx, y: cy,
                size: 15 + Math.random() * 20,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                color: 'bg-indigo-300',
                isTarget: true,
                type: 'particle',
                spawnTime: Date.now()
            }];
        }
        
        if (gameType === 'flux') {
            // Spawn from edges towards center
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.max(window.innerWidth, window.innerHeight) / 2 + 50;
            const isRed = Math.random() > 0.5;
            return [...prev, {
                id,
                x: cx + Math.cos(angle) * dist,
                y: cy + Math.sin(angle) * dist,
                size: 25,
                dx: 0, dy: 0, // Handled in physics loop
                color: isRed ? 'bg-rose-500' : 'bg-white',
                isTarget: false,
                type: 'particle',
                spawnTime: Date.now()
            }];
        }

        if (gameType === 'breath') {
            // Spawn horizontal bars (gates) moving down
            // Gap logic: wall on left, wall on right, gap in middle
            const gapWidth = 100 + Math.random() * 100;
            const gapX = Math.random() * (window.innerWidth - gapWidth);
            
            const wallLeft = {
                id: id + '-l',
                x: 0, y: -50,
                size: gapX, // width
                dx: 0, dy: 2,
                color: 'bg-gray-700',
                isTarget: false,
                type: 'gate',
                spawnTime: Date.now()
            };
            const wallRight = {
                id: id + '-r',
                x: gapX + gapWidth, y: -50,
                size: window.innerWidth - (gapX + gapWidth),
                dx: 0, dy: 2,
                color: 'bg-gray-700',
                isTarget: false,
                type: 'gate',
                spawnTime: Date.now()
            };
            return [...prev, wallLeft as CircleData, wallRight as CircleData];
        }

        if (gameType === 'avoid') {
            // Spawn enemies at edges
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.max(window.innerWidth, window.innerHeight) / 2 + 50;
            return [...prev, {
                id,
                x: cx + Math.cos(angle) * dist,
                y: cy + Math.sin(angle) * dist,
                size: 15,
                dx: 0, dy: 0, // AI in physics
                color: 'bg-rose-600',
                isTarget: false,
                type: 'enemy',
                spawnTime: Date.now()
            }];
        }

        return prev;
      });
    }, currentRules.spawnInterval);

  }, [currentRules]); // Removed heavy dependency arrays to prevent stutter

  const endGame = useCallback(() => {
    setGameState(prev => {
      [gameIntervalRef, spawnIntervalRef, gameTimerRef].forEach(ref => {
        if (ref.current) clearInterval(ref.current);
      });
      setCircles([]);
      
      if (appConfig?.global_ads_enabled && appConfig?.interstitial_enabled) {
        setTimeout(() => setActiveAd('interstitial'), 1000);
      }

      getNeuroCasualInsight(prev.score, prev.accuracy, prev.averageClickSpeed, prev.ruleShiftsApplied)
        .then(openModal);
      return { ...prev, isRunning: false };
    });
  }, [openModal, appConfig]);

  // --- INTERACTION HANDLERS ---

  const handleGlobalClick = () => {
      if (!gameState.isRunning) return;
      
      // FLUX: Toggle Polarity
      if (gameState.activeGame === 'flux') {
          setGameState(gs => ({
              ...gs,
              fluxPolarity: gs.fluxPolarity === 'white' ? 'red' : 'white'
          }));
          audioService.playClick();
      }
      
      // ORBIT: Switch Track
      if (gameState.activeGame === 'orbit') {
          setGameState(gs => {
              const newRadius = gs.orbitRadius === 0 ? 1 : 0;
              orbitRadiusRef.current = newRadius;
              return {
                  ...gs,
                  orbitRadius: newRadius
              };
          });
          audioService.playClick();
      }

      // PHASE: Check Rhythm
      if (gameState.activeGame === 'phase') {
          // Check difference between breathing ring size and target size
          const targetSize = 200; // Fixed diameter
          const currentSize = circles.find(c => c.type === 'breathing-ring')?.size || 0;
          const diff = Math.abs(currentSize - targetSize);
          
          if (diff < 30) { // Tolerance
              audioService.playTargetHit();
              setGameState(gs => ({ ...gs, score: gs.score + 25, message: "SYNC PERFECT" }));
          } else {
              audioService.playTargetMiss();
              setGameState(gs => ({ ...gs, score: Math.max(0, gs.score - 10), message: "SYNC ERROR" }));
          }
      }
  };

  const handleCircleClick = (id: string, isTarget: boolean, type?: string) => {
    if (!gameState.isRunning) return;
    
    // GATHER: Tap particles to return them to center
    if (gameState.activeGame === 'gather' && type === 'particle') {
        setCircles(prev => prev.map(c => {
            if (c.id === id) {
                // Reverse velocity towards center
                const angle = Math.atan2(window.innerHeight/2 - c.y, window.innerWidth/2 - c.x);
                return { 
                    ...c, 
                    dx: Math.cos(angle) * 3, 
                    dy: Math.sin(angle) * 3,
                    color: 'bg-indigo-500' // Visual feedback
                };
            }
            return c;
        }));
        setGameState(gs => ({ ...gs, score: gs.score + 5 }));
        audioService.playClick();
    }
  };

  const handleMouseDown = () => {
      setIsHoldingBreath(true);
  };

  const handleMouseUp = () => {
      setIsHoldingBreath(false);
  };

  const handleInteraction = (e: React.MouseEvent) => {
    mousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  return (
    <div 
      className={`relative w-full h-full text-white font-mono flex flex-col items-center justify-center overflow-hidden select-none transition-all duration-700 bg-[#050505]`}
      onMouseMove={handleInteraction}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onClick={handleGlobalClick}
    >
      {!gameState.activeGame && !gameState.isRunning ? (
        <GameSelector onSelect={selectGame} appConfig={appConfig} />
      ) : (
        <>
          <GameArea
            circles={circles}
            activeGame={gameState.activeGame}
            variation={currentRules.variation}
            onCircleClick={handleCircleClick}
            onMissClick={() => {}}
          />

          {/* FLUX Core Visualization */}
          {gameState.activeGame === 'flux' && (
              <div 
                className={`absolute pointer-events-none transition-colors duration-200 rounded-full blur-md z-0`}
                style={{
                    left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                    width: '80px', height: '80px',
                    backgroundColor: gameState.fluxPolarity === 'white' ? 'white' : '#f43f5e'
                }}
              />
          )}

          {/* AVOID Player Visualization (if using state pos instead of circle array) */}
          {gameState.activeGame === 'avoid' && (
               <div 
               className="absolute w-8 h-8 rounded-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)] z-30 pointer-events-none transition-transform duration-75"
               style={{
                   left: gameState.avoidPos.x - 16,
                   top: gameState.avoidPos.y - 16
               }}
             />
          )}

          {/* BREATH Player Visualization */}
          {gameState.activeGame === 'breath' && (
               <div 
               className="absolute rounded-full border-4 border-white z-30 pointer-events-none"
               style={{
                   left: '50%', top: '50%', 
                   transform: 'translate(-50%, -50%)',
                   width: gameState.breathSize,
                   height: gameState.breathSize,
                   backgroundColor: isHoldingBreath ? 'rgba(255,255,255,0.2)' : 'transparent'
               }}
             />
          )}

          <ControlPanel
            gameState={gameState}
            currentRules={currentRules}
            onStartGame={() => startGame(gameState.activeGame || 'orbit')}
            onEndGame={endGame}
          />
        </>
      )}

      {/* Ad Overlay Simulation */}
      {activeAd && (
        <AdOverlay 
          type={activeAd} 
          onClose={handleAdClose} 
          onReward={() => {
            handleAdClose();
          }} 
        />
      )}

      <Modal isOpen={modalOpen} onClose={closeModal} id={NEUROCASUAL_INSIGHT_MODAL_ID}>
        <div className="text-gray-900 font-sans p-2">
          <div className="flex items-center gap-2 mb-4">
             <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs">NL</div>
             <h3 className="text-xl font-black tracking-tighter uppercase text-indigo-600">Cognitive Report</h3>
          </div>
          <p className="italic text-lg leading-relaxed text-gray-700 border-l-4 border-indigo-100 pl-4">{geminiInsight}</p>
          <div className="mt-10 pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-mono">
            <span className="uppercase tracking-[0.2em]">ENG: maaZone S6</span>
            <button 
              onClick={() => { closeModal(); setGameState(INITIAL_GAME_STATE); }}
              className="px-8 py-3 bg-indigo-600 text-white rounded-full font-black text-xs hover:bg-black transition-all shadow-xl active:scale-95"
            >
              RESET VOID
            </button>
          </div>
        </div>
      </Modal>

      <BrandingFooter 
        onAdminAccessAttempt={() => setShowAdminPanel(true)} 
        appVersion="v2.0.0" 
      />

      {showAdminPanel && (
        session ? (
          <AdminDashboard onClose={() => setShowAdminPanel(false)} onSignOut={() => AuthService.signOut().then(() => setSession(null))} session={session} />
        ) : (
          <AdminLogin onClose={() => setShowAdminPanel(false)} onLoginSuccess={setSession} onSignOut={() => {}} session={null} />
        )
      )}
    </div>
  );
};

export default App;
