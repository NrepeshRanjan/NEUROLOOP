
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
  orbitRadius: 0, 
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
  const [isHoldingBreath, setIsHoldingBreath] = useState(false); 

  const gameIntervalRef = useRef<number | null>(null);
  const spawnIntervalRef = useRef<number | null>(null);
  const gameTimerRef = useRef<number | null>(null);
  
  // Refs for physics loop
  const mousePosRef = useRef({ x: window.innerWidth/2, y: window.innerHeight/2 });
  const orbitAngleRef = useRef(0);
  const orbitRadiusRef = useRef(0);
  const orbitInertiaRef = useRef(0); // Smooth transition between tracks

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

  const goHome = useCallback(() => {
    // Reset everything
    setGameState({ ...INITIAL_GAME_STATE, isRunning: false, activeGame: null });
    setCircles([]);
    [gameIntervalRef, spawnIntervalRef, gameTimerRef].forEach(ref => {
      if (ref.current) clearInterval(ref.current);
    });
    audioService.stopDrone();
    audioService.playClick();
  }, []);

  const selectGame = (game: GameType) => {
    audioService.playClick();
    setGameState(prev => ({ ...prev, activeGame: game }));
    startGame(game);
  };

  // --- SILENT VARIATION ENGINE ---
  const triggerSilentRuleShift = useCallback(() => {
    if (!gameState.isRunning) return;

    // "Silent" shift: Change physics constants without UI feedback
    setCurrentRules(prev => {
        const speedMod = Math.random() > 0.5 ? 1.2 : 0.8;
        const sizeMod = Math.random() > 0.5 ? 5 : -5;
        
        // Audio cue for subconscious awareness
        audioService.playRuleShift(true); // true = silent/subtle

        return {
            ...prev,
            minSpeed: Math.max(0.5, prev.minSpeed * speedMod),
            maxSpeed: Math.min(6, prev.maxSpeed * speedMod),
            minCircleSize: Math.max(10, prev.minCircleSize + sizeMod),
            // Sometimes invert spawn rates
            spawnInterval: Math.max(400, prev.spawnInterval + (Math.random() * 400 - 200))
        };
    });
    
    // Occasionally update message strictly for flavor
    if (Math.random() > 0.8) {
        setGameState(gs => ({ ...gs, message: "ADAPTING..." }));
    }

  }, [gameState.isRunning]);


  const startGame = useCallback((gameType: GameType) => {
    audioService.playStart();
    audioService.startDrone(); // Start Ambient
    setGameState({ 
      ...INITIAL_GAME_STATE, 
      isRunning: true, 
      activeGame: gameType,
      message: "SYNC ESTABLISHED"
    });
    
    setCircles([]);
    setIsHoldingBreath(false);
    
    // Reset Refs
    orbitAngleRef.current = 0;
    orbitRadiusRef.current = 0;
    orbitInertiaRef.current = 0;

    // Clear loops
    [gameIntervalRef, spawnIntervalRef, gameTimerRef].forEach(ref => {
      if (ref.current) clearInterval(ref.current);
    });

    // 1. Timer Loop (Logic Updates & Silent Shifts)
    gameTimerRef.current = window.setInterval(() => {
      setGameState(prev => {
        if (prev.gameTime >= 90) { 
          endGame();
          return prev;
        }
        
        // Trigger silent variation every ~15 seconds
        if (prev.gameTime > 0 && prev.gameTime % 15 === 0) {
            triggerSilentRuleShift();
        }

        return { ...prev, gameTime: prev.gameTime + 1 };
      });
    }, 1000);

    // 2. Physics & Logic Loop (60FPS approx)
    gameIntervalRef.current = window.setInterval(() => {
      setGameState(prevState => {
        if (!prevState.isRunning) return prevState;

        let newState = { ...prevState };
        
        // --- ORBIT LOGIC ---
        if (gameType === 'orbit') {
          // Accelerate angle over time
          const speedMultiplier = 1 + (prevState.gameTime * 0.01);
          newState.orbitAngle = (prevState.orbitAngle + (0.04 * speedMultiplier)) % (Math.PI * 2);
          orbitAngleRef.current = newState.orbitAngle; 
          
          // Smooth transition for radius (Inertia)
          const targetRadius = prevState.orbitRadius; 
          const diff = targetRadius - orbitInertiaRef.current;
          orbitInertiaRef.current += diff * 0.1; // Smooth lerp
          orbitRadiusRef.current = orbitInertiaRef.current;
        }

        // --- BREATH LOGIC ---
        if (gameType === 'breath') {
          if (isHoldingBreath) {
            newState.breathSize = Math.min(250, prevState.breathSize + 5); // Grow faster
          } else {
            newState.breathSize = Math.max(40, prevState.breathSize - 3); // Shrink slower
          }
        }

        // --- AVOID LOGIC ---
        if (gameType === 'avoid') {
           const dx = mousePosRef.current.x - prevState.avoidPos.x;
           const dy = mousePosRef.current.y - prevState.avoidPos.y;
           newState.avoidPos = {
             x: prevState.avoidPos.x + dx * 0.2, // Tighter follow
             y: prevState.avoidPos.y + dy * 0.2
           };
        }

        return newState;
      });

      setCircles(prevCircles => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;

        // --- PHASE LOGIC (Ring Pulse) ---
        if (gameType === 'phase') {
           const t = Date.now() / 1000;
           // Complex pulse: Sine wave + slight noise
           const breathSize = 100 + Math.sin(t * 3) * 50 + Math.sin(t * 7) * 5;
           
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
            
            // Render Player Satellite using INERTIA ref for smooth lane changing
            const radiusValue = 80 + (orbitInertiaRef.current * 80); // 80 (inner) -> 160 (outer)
            const px = cx + Math.cos(currentAngle) * radiusValue;
            const py = cy + Math.sin(currentAngle) * radiusValue;
            
            // Collision Detection
            const collision = prevCircles.find(c => {
                const dist = Math.hypot(c.x - (px - 10), c.y - (py - 10)); 
                return c.type === 'obstacle' && dist < 35; // Tighter hitbox
            });

            if (collision) {
               audioService.playTargetMiss();
               setGameState(gs => ({
                   ...gs,
                   score: Math.max(0, gs.score - 5),
                   message: "HULL BREACH"
               }));
            }

            const updatedCircles = prevCircles.filter(c => c.type !== 'player').map(c => {
                if (c.type === 'obstacle') {
                    const angle = (c.angle || 0) - 0.025; 
                    const ox = cx + Math.cos(angle) * (c.orbitDistance || 120);
                    const oy = cy + Math.sin(angle) * (c.orbitDistance || 120);
                    return { ...c, angle, x: ox - 10, y: oy - 10 };
                }
                return c;
            });

            return [
                ...updatedCircles,
                { id: 'player', x: px - 15, y: py - 15, size: 30, dx: 0, dy: 0, color: 'bg-indigo-500', isTarget: true, type: 'player', spawnTime: 0 }
            ];
        }

        // --- GENERIC MOVEMENT (Flux, Gather, Breath, Avoid) ---
        return prevCircles.map(c => {
            let newX = c.x + c.dx;
            let newY = c.y + c.dy;

            // FLUX: Dynamic Acceleration
            if (gameType === 'flux' && c.type === 'particle') {
                const angle = Math.atan2(cy - c.y, cx - c.x);
                // Particles get faster as they get closer (Gravity effect)
                const distToCenter = Math.hypot(cx - c.x, cy - c.y);
                const speed = 2 + (200 / (distToCenter + 10)); 
                
                newX += Math.cos(angle) * speed;
                newY += Math.sin(angle) * speed;
                
                if (distToCenter < 40) {
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

            // GATHER: Entropy drift
            if (gameType === 'gather' && c.type === 'particle') {
                 // Particles gently wiggle
                 c.dx += (Math.random() - 0.5) * 0.1;
                 c.dy += (Math.random() - 0.5) * 0.1;
                 
                 const dist = Math.hypot(newX - cx, newY - cy);
                 if (dist > Math.min(window.innerWidth, window.innerHeight)/2 + 50) {
                     setGameState(gs => ({...gs, score: Math.max(0, gs.score - 5), message: "ENTROPY LEAK"}));
                     return { ...c, x: -9999 }; 
                 }
            }

            // BREATH: Gates
            if (gameType === 'breath' && c.type === 'gate') {
                setGameState(gs => {
                    const pRadius = gs.breathSize / 2;
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

            // AVOID: Swarm
            if (gameType === 'avoid' && c.type === 'enemy') {
                setGameState(gs => {
                    const angle = Math.atan2(gs.avoidPos.y - c.y, gs.avoidPos.x - c.x);
                    // Swarming behavior: slight randomness
                    c.dx = Math.cos(angle) * (currentRules.minSpeed * 1.5) + (Math.random() - 0.5);
                    c.dy = Math.sin(angle) * (currentRules.minSpeed * 1.5) + (Math.random() - 0.5);
                    
                    const dist = Math.hypot(c.x - gs.avoidPos.x, c.y - gs.avoidPos.y);
                    if (dist < 40) { 
                         audioService.playTargetMiss();
                         return { ...gs, score: Math.max(0, gs.score - 2), message: "CRITICAL DAMAGE" };
                    }
                    return { ...gs, score: gs.score + 0.05 }; 
                });
                newX = c.x + c.dx;
                newY = c.y + c.dy;
            }

            return { ...c, x: newX, y: newY };
        }).filter(c => c.x > -200 && c.x < window.innerWidth + 200 && c.y > -200 && c.y < window.innerHeight + 200);

      });
    }, 16); 

    // 3. Spawning Loop
    spawnIntervalRef.current = window.setInterval(() => {
      setCircles(prev => {
        if (prev.length >= currentRules.maxCirclesOnScreen) return prev;
        
        const id = Math.random().toString(36).substr(2, 9);
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;

        if (gameType === 'orbit') {
            return [...prev, {
                id,
                x: 0, y: 0, 
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
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.max(window.innerWidth, window.innerHeight) / 2 + 50;
            const isRed = Math.random() > 0.5;
            return [...prev, {
                id,
                x: cx + Math.cos(angle) * dist,
                y: cy + Math.sin(angle) * dist,
                size: 25,
                dx: 0, dy: 0, 
                color: isRed ? 'bg-rose-500' : 'bg-white',
                isTarget: false,
                type: 'particle',
                spawnTime: Date.now()
            }];
        }

        if (gameType === 'breath') {
            const gapWidth = 100 + Math.random() * 100;
            const gapX = Math.random() * (window.innerWidth - gapWidth);
            const wallLeft = { id: id + '-l', x: 0, y: -50, size: gapX, dx: 0, dy: 3, color: 'bg-gray-700', isTarget: false, type: 'gate', spawnTime: Date.now() };
            const wallRight = { id: id + '-r', x: gapX + gapWidth, y: -50, size: window.innerWidth - (gapX + gapWidth), dx: 0, dy: 3, color: 'bg-gray-700', isTarget: false, type: 'gate', spawnTime: Date.now() };
            return [...prev, wallLeft as CircleData, wallRight as CircleData];
        }

        if (gameType === 'avoid') {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.max(window.innerWidth, window.innerHeight) / 2 + 50;
            return [...prev, {
                id,
                x: cx + Math.cos(angle) * dist,
                y: cy + Math.sin(angle) * dist,
                size: 15,
                dx: 0, dy: 0, 
                color: 'bg-rose-600',
                isTarget: false,
                type: 'enemy',
                spawnTime: Date.now()
            }];
        }

        return prev;
      });
    }, currentRules.spawnInterval);

  }, [currentRules, triggerSilentRuleShift]); 

  const endGame = useCallback(() => {
    setGameState(prev => {
      [gameIntervalRef, spawnIntervalRef, gameTimerRef].forEach(ref => {
        if (ref.current) clearInterval(ref.current);
      });
      setCircles([]);
      
      audioService.playGameOver(); // Stop drone, play fail sound

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
      
      if (gameState.activeGame === 'flux') {
          setGameState(gs => ({
              ...gs,
              fluxPolarity: gs.fluxPolarity === 'white' ? 'red' : 'white'
          }));
          audioService.playFluxFlip(); // Specific Sound
      }
      
      if (gameState.activeGame === 'orbit') {
          setGameState(gs => {
              const newRadius = gs.orbitRadius === 0 ? 1 : 0;
              return { ...gs, orbitRadius: newRadius };
          });
          audioService.playOrbitSwitch(); // Specific Sound
      }

      if (gameState.activeGame === 'phase') {
          const targetSize = 200; 
          const currentSize = circles.find(c => c.type === 'breathing-ring')?.size || 0;
          const diff = Math.abs(currentSize - targetSize);
          
          if (diff < 40) { 
              audioService.playPhaseSync(); // NEW: Harmonic Sync Sound
              setGameState(gs => ({ ...gs, score: gs.score + 25, message: "SYNC PERFECT" }));
          } else {
              audioService.playTargetMiss();
              setGameState(gs => ({ ...gs, score: Math.max(0, gs.score - 10), message: "SYNC ERROR" }));
          }
      }
  };

  const handleCircleClick = (id: string, isTarget: boolean, type?: string) => {
    if (!gameState.isRunning) return;
    
    if (gameState.activeGame === 'gather' && type === 'particle') {
        setCircles(prev => prev.map(c => {
            if (c.id === id) {
                const angle = Math.atan2(window.innerHeight/2 - c.y, window.innerWidth/2 - c.x);
                return { 
                    ...c, 
                    dx: Math.cos(angle) * 3, 
                    dy: Math.sin(angle) * 3,
                    color: 'bg-indigo-500' 
                };
            }
            return c;
        }));
        setGameState(gs => ({ ...gs, score: gs.score + 5 }));
        audioService.playGatherCatch(); // NEW: Fluid Catch Sound
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
      {!gameState.activeGame ? (
        <GameSelector onSelect={selectGame} appConfig={appConfig} />
      ) : (
        <>
          <ControlPanel
            gameState={gameState}
            currentRules={currentRules}
            onStartGame={() => startGame(gameState.activeGame || 'orbit')}
            onEndGame={endGame}
            onHome={goHome}
          />

          <GameArea
            circles={circles}
            activeGame={gameState.activeGame}
            variation={currentRules.variation}
            onCircleClick={handleCircleClick}
            onMissClick={() => {}}
          />

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

          {gameState.activeGame === 'avoid' && (
               <div 
               className="absolute w-8 h-8 rounded-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)] z-30 pointer-events-none transition-transform duration-75"
               style={{
                   left: gameState.avoidPos.x - 16,
                   top: gameState.avoidPos.y - 16
               }}
             />
          )}

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
        </>
      )}

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
              onClick={() => { closeModal(); goHome(); }}
              className="px-8 py-3 bg-indigo-600 text-white rounded-full font-black text-xs hover:bg-black transition-all shadow-xl active:scale-95"
            >
              RESET VOID
            </button>
          </div>
        </div>
      </Modal>

      <BrandingFooter 
        onAdminAccessAttempt={() => setShowAdminPanel(true)} 
        appVersion="v2.1" 
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
