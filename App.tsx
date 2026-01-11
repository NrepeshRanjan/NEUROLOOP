
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AuthSession } from '@supabase/supabase-js';
import { GameArea } from './components/GameArea';
import { ControlPanel } from './components/ControlPanel';
import { GameSelector } from './components/GameSelector';
import { Modal } from './components/Modal';
import { BrandingFooter } from './components/BrandingFooter';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { GameState, GameRule, CircleData, AppConfig, GameType } from './types';
import { NEUROCASUAL_INSIGHT_MODAL_ID } from './constants';
import { getNeuroCasualInsight } from './services/geminiService';
import { fetchAppConfig, supabase } from './services/supabaseService';
import { AuthService } from './services/authService';

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
  message: "Select an engine to begin.",
  echoBuffer: [],
  weightPos: { x: window.innerWidth / 2, y: window.innerHeight / 2, velocityX: 0, velocityY: 0 },
  blindMaskPos: { x: -1000, y: -1000 },
  isLogicInverted: false,
  lastChoiceTime: 0,
  patienceFactor: 1,
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [currentRules, setCurrentRules] = useState<GameRule>({
    targetColor: 'bg-indigo-500',
    minCircleSize: 40,
    maxCircleSize: 80,
    minSpeed: 0.5,
    maxSpeed: 2,
    spawnInterval: 1500,
    maxCirclesOnScreen: 5,
    clickAccuracyThreshold: 85,
    variation: 'default',
  });
  const [circles, setCircles] = useState<CircleData[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [geminiInsight, setGeminiInsight] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);

  const gameIntervalRef = useRef<number | null>(null);
  const spawnIntervalRef = useRef<number | null>(null);
  const gameTimerRef = useRef<number | null>(null);
  const physicsIntervalRef = useRef<number | null>(null);
  const clickTimesRef = useRef<number[]>([]);

  useEffect(() => {
    fetchAppConfig().then(setAppConfig);
    const { data: authListener } = (supabase.auth as any).onAuthStateChange((_: any, s: any) => setSession(s));
    AuthService.getSession().then(setSession);
    return () => authListener?.unsubscribe();
  }, []);

  const openModal = useCallback((content: string) => {
    setGeminiInsight(content);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setGeminiInsight('');
  }, []);

  const applyRuleShift = useCallback(() => {
    if (!gameState.activeGame) return;

    setGameState(prev => ({ ...prev, ruleShiftsApplied: prev.ruleShiftsApplied + 1 }));
    
    setCurrentRules(prev => {
      const gameType = gameState.activeGame;
      const variations = {
        delay: ['ghost-pulse', 'depth-drift', 'vanishing-core'],
        shift: ['ghost-rule', 'shape-morph', 'color-disorientation'],
        echo: ['decay-offset', 'time-stretch', 'reverse-loop'],
        weight: ['surface-tension', 'air-resistance', 'phantom-drag'],
        blind: ['peripheral-pulse', 'static-ghost', 'moving-fog'],
        choice: ['subliminal-lean', 'outcome-mask', 'memory-consequence']
      };
      
      const gameVariations = variations[gameType as keyof typeof variations] || [];
      const newVariation = gameVariations[Math.floor(Math.random() * gameVariations.length)];

      if (gameType === 'shift' && newVariation === 'ghost-rule') {
        setGameState(p => ({ ...p, isLogicInverted: !p.isLogicInverted }));
      }

      setGameState(p => ({ ...p, message: `Variation: ${newVariation.replace('-', ' ').toUpperCase()}` }));

      return {
        ...prev,
        variation: newVariation,
        spawnInterval: Math.max(600, prev.spawnInterval * 0.9),
        maxSpeed: Math.min(6, prev.maxSpeed * 1.2)
      };
    });
  }, [gameState.activeGame]);

  const selectGame = (game: GameType) => {
    setGameState(prev => ({ ...prev, activeGame: game }));
    startGame(game);
  };

  const startGame = useCallback((gameType: GameType) => {
    setGameState({ 
      ...INITIAL_GAME_STATE, 
      isRunning: true, 
      activeGame: gameType,
      message: `ENGINE LOADED: ${gameType.toUpperCase()}` 
    });
    
    setCircles([]);
    clickTimesRef.current = [];

    [gameIntervalRef, spawnIntervalRef, gameTimerRef, physicsIntervalRef].forEach(ref => {
      if (ref.current) clearInterval(ref.current);
    });

    gameTimerRef.current = window.setInterval(() => {
      setGameState(prev => {
        if (prev.gameTime >= 60) {
          endGame();
          return prev;
        }
        return { ...prev, gameTime: prev.gameTime + 1 };
      });
    }, 1000);

    // Main Logic Loop (Physics + Anim)
    gameIntervalRef.current = window.setInterval(() => {
      setCircles(prev => prev.map(c => {
        let newX = c.x + c.dx;
        let newY = c.y + c.dy;
        let newOpacity = c.opacity || 1;
        let newScale = c.scale || 1;

        // Visual Effects based on Variations
        if (currentRules.variation === 'ghost-pulse') {
          newOpacity = 0.5 + Math.sin(Date.now() / 200) * 0.5;
        }
        if (currentRules.variation === 'depth-drift') {
          newScale = 1 + Math.sin(Date.now() / 400) * 0.4;
        }
        if (currentRules.variation === 'vanishing-core') {
          newScale = Math.max(0.1, 1 - (Date.now() - c.spawnTime) / 2000);
        }

        // WEIGHT repulsion
        if (gameType === 'weight' && currentRules.variation === 'surface-tension') {
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          const dist = Math.hypot(newX - centerX, newY - centerY);
          if (dist < 300) {
             const angle = Math.atan2(newY - centerY, newX - centerX);
             newX += Math.cos(angle) * 2;
             newY += Math.sin(angle) * 2;
          }
        }

        return { ...c, x: newX, y: newY, opacity: newOpacity, scale: newScale };
      }).filter(c => c.x > -200 && c.x < window.innerWidth + 200 && c.y > -200 && c.y < window.innerHeight + 200));

      setGameState(prev => {
        if (prev.gameTime > 0 && prev.gameTime % 12 === 0 && prev.ruleShiftsApplied < Math.floor(prev.gameTime / 12)) {
          applyRuleShift();
        }
        return prev;
      });
    }, 32);

    // Spawn Loop
    spawnIntervalRef.current = window.setInterval(() => {
      setCircles(prev => {
        if (prev.length >= currentRules.maxCirclesOnScreen) return prev;
        
        const id = Math.random().toString(36).substr(2, 9);
        let size = Math.random() * (currentRules.maxCircleSize - currentRules.minCircleSize) + currentRules.minCircleSize;
        let x = Math.random() * (window.innerWidth - size);
        let y = Math.random() * (window.innerHeight - size);
        let dx = (Math.random() - 0.5) * currentRules.maxSpeed;
        let dy = (Math.random() - 0.5) * currentRules.maxSpeed;
        let color = currentRules.targetColor;
        let isTarget = true;
        let type: CircleData['type'] = 'standard';

        if (gameType === 'choice') {
           const isLeft = Math.random() > 0.5;
           type = isLeft ? 'choice-left' : 'choice-right';
           size = 120;
           x = isLeft ? window.innerWidth * 0.2 : window.innerWidth * 0.7;
           y = window.innerHeight * 0.4;
           dx = 0; dy = 0;
           color = isLeft ? 'bg-indigo-600' : 'bg-slate-700';
           if (currentRules.variation === 'subliminal-lean') {
              if (isLeft) color = 'bg-indigo-500'; // Slightly brighter
           }
        } else if (gameType === 'shift' && currentRules.variation === 'color-disorientation') {
          isTarget = Math.random() > 0.4;
          color = isTarget ? 'bg-indigo-500' : 'bg-rose-500';
        } else if (gameType === 'blind' && currentRules.variation === 'static-ghost') {
          if (Math.random() > 0.7) type = 'phantom';
        }

        return [...prev, { id, x, y, size, dx, dy, color, isTarget, type, spawnTime: Date.now() }];
      });
    }, currentRules.spawnInterval);

    // ECHO Replay Loop
    if (gameType === 'echo') {
      const echoPlayback = window.setInterval(() => {
        setGameState(prev => {
          if (prev.echoBuffer.length > 0) {
            const last = prev.echoBuffer[0];
            setCircles(c => [...c, {
              id: `echo-${Date.now()}`,
              x: last.x + (currentRules.variation === 'decay-offset' ? (Math.random() - 0.5) * 50 : 0),
              y: last.y + (currentRules.variation === 'decay-offset' ? (Math.random() - 0.5) * 50 : 0),
              size: 50,
              dx: 0, dy: 0,
              color: 'bg-indigo-300',
              isTarget: true,
              type: 'echo',
              spawnTime: Date.now()
            }]);
            return { ...prev, echoBuffer: prev.echoBuffer.slice(1) };
          }
          return prev;
        });
      }, 3000);
      return () => clearInterval(echoPlayback);
    }

  }, [currentRules, gameState.activeGame, applyRuleShift]);

  const endGame = useCallback(() => {
    setGameState(prev => {
      [gameIntervalRef, spawnIntervalRef, gameTimerRef, physicsIntervalRef].forEach(ref => {
        if (ref.current) clearInterval(ref.current);
      });
      setCircles([]);
      getNeuroCasualInsight(prev.score, prev.accuracy, prev.averageClickSpeed, prev.ruleShiftsApplied)
        .then(openModal);
      return { ...prev, isRunning: false };
    });
  }, [openModal]);

  const handleCircleClick = (id: string, isTarget: boolean, type?: string) => {
    if (!gameState.isRunning) return;

    setGameState(prev => {
      const now = performance.now();
      clickTimesRef.current.push(now);

      let scoreGain = 0;
      let hit = isTarget;

      // DELAY Logic: Reward patience
      if (prev.activeGame === 'delay') {
        const circle = circles.find(c => c.id === id);
        if (circle) {
          const aliveTime = Date.now() - circle.spawnTime;
          scoreGain = Math.min(25, Math.floor(aliveTime / 100)); // More points for waiting
        }
      } else if (prev.activeGame === 'shift' && prev.isLogicInverted) {
        hit = !isTarget; // TargetDistractor flip
        scoreGain = hit ? 15 : -10;
      } else if (prev.activeGame === 'choice') {
        scoreGain = 20;
        hit = true;
      } else {
        scoreGain = isTarget ? 10 : -5;
      }

      // Record for ECHO
      const newEchoBuffer = prev.activeGame === 'echo' 
        ? [...prev.echoBuffer, { x: circles.find(c => c.id === id)?.x || 0, y: circles.find(c => c.id === id)?.y || 0, timestamp: now, type: 'click' }]
        : prev.echoBuffer;

      const newTotal = prev.totalClicks + 1;
      const newHits = hit ? prev.hitCount + 1 : prev.hitCount;

      return {
        ...prev,
        score: prev.score + scoreGain,
        hitCount: newHits,
        totalClicks: newTotal,
        accuracy: (newHits / newTotal) * 100,
        echoBuffer: newEchoBuffer,
        message: hit ? "SIGNAL RECEIVED" : "INTERFERENCE DETECTED"
      };
    });

    setCircles(prev => prev.filter(c => c.id !== id));
  };

  const handleAreaClick = () => {
    if (!gameState.isRunning) return;
    setGameState(p => ({
      ...p,
      totalClicks: p.totalClicks + 1,
      accuracy: (p.hitCount / (p.totalClicks + 1)) * 100,
      score: Math.max(0, p.score - 2),
      message: "VOID COLLISION"
    }));
  };

  const handleInteraction = (e: React.MouseEvent) => {
    if (!gameState.isRunning) return;
    
    if (gameState.activeGame === 'blind') {
      setGameState(prev => ({ ...prev, blindMaskPos: { x: e.clientX, y: e.clientY } }));
    }

    if (gameState.activeGame === 'weight') {
      const dist = Math.hypot(e.clientX - gameState.weightPos.x, e.clientY - gameState.weightPos.y);
      if (dist < 150) {
        setGameState(prev => {
          const strength = currentRules.variation === 'phantom-drag' ? 0.4 : 0.2;
          return {
            ...prev,
            weightPos: {
              ...prev.weightPos,
              velocityX: (prev.weightPos.x - e.clientX) * strength,
              velocityY: (prev.weightPos.y - e.clientY) * strength
            }
          };
        });
      }
    }
  };

  return (
    <div 
      className="relative w-full h-full bg-[#050505] text-white font-mono flex flex-col items-center justify-center overflow-hidden select-none"
      onMouseMove={handleInteraction}
    >
      {!gameState.activeGame && !gameState.isRunning ? (
        <GameSelector onSelect={selectGame} />
      ) : (
        <>
          <GameArea
            circles={circles}
            onCircleClick={handleCircleClick}
            onMissClick={handleAreaClick}
          />

          {gameState.activeGame === 'blind' && (
            <div 
              className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-1000"
              style={{
                background: `radial-gradient(circle ${currentRules.variation === 'moving-fog' ? '120px' : '200px'} at ${gameState.blindMaskPos.x}px ${gameState.blindMaskPos.y}px, transparent 0%, rgba(0,0,0,0.98) 85%)`
              }}
            />
          )}

          <ControlPanel
            gameState={gameState}
            currentRules={currentRules}
            onStartGame={() => startGame(gameState.activeGame || 'delay')}
            onEndGame={endGame}
          />
        </>
      )}

      <Modal isOpen={modalOpen} onClose={closeModal} id={NEUROCASUAL_INSIGHT_MODAL_ID}>
        <div className="text-gray-900 font-sans">
          <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase text-indigo-600">Neuroloop Analysis</h3>
          <p className="italic text-lg leading-relaxed text-gray-700">{geminiInsight}</p>
          <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-400 uppercase tracking-widest font-mono">maaZone Engineering</span>
            <button 
              onClick={() => { closeModal(); setGameState(INITIAL_GAME_STATE); }}
              className="px-6 py-2 bg-black text-white rounded-full font-bold hover:bg-indigo-600 transition-colors"
            >
              RESUME VOID
            </button>
          </div>
        </div>
      </Modal>

      <BrandingFooter 
        onAdminAccessAttempt={() => setShowAdminPanel(true)} 
        appVersion="v1.7.2" 
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
