
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
    minSpeed: 0.8,
    maxSpeed: 2.5,
    spawnInterval: 1400,
    maxCirclesOnScreen: 6,
    clickAccuracyThreshold: 85,
    variation: 'default',
  });
  const [circles, setCircles] = useState<CircleData[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [geminiInsight, setGeminiInsight] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);

  const gameIntervalRef = useRef<number | null>(null);
  const spawnIntervalRef = useRef<number | null>(null);
  const gameTimerRef = useRef<number | null>(null);
  const clickTimesRef = useRef<number[]>([]);

  useEffect(() => {
    fetchAppConfig();
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
        setGameState(p => ({ ...p, isLogicInverted: !p.isLogicInverted, message: `LOGIC ${!p.isLogicInverted ? 'INVERTED' : 'NORMALIZED'}` }));
      } else {
        setGameState(p => ({ ...p, message: `VAR: ${newVariation.replace('-', ' ').toUpperCase()}` }));
      }

      return {
        ...prev,
        variation: newVariation,
        spawnInterval: Math.max(500, prev.spawnInterval * 0.95),
        maxSpeed: Math.min(8, prev.maxSpeed * 1.1)
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
      message: `INITIATING ${gameType.toUpperCase()}` 
    });
    
    setCircles([]);
    clickTimesRef.current = [];

    [gameIntervalRef, spawnIntervalRef, gameTimerRef].forEach(ref => {
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

    // Main Processing Loop
    gameIntervalRef.current = window.setInterval(() => {
      setCircles(prev => prev.map(c => {
        let newX = c.x + c.dx;
        let newY = c.y + c.dy;
        let newOpacity = c.opacity || 1;
        let newScale = c.scale || 1;

        // Visual Variations
        if (currentRules.variation === 'ghost-pulse') {
          newOpacity = 0.3 + Math.sin(Date.now() / 150) * 0.7;
        }
        if (currentRules.variation === 'depth-drift') {
          newScale = 1 + Math.sin(Date.now() / 500) * 0.5;
        }
        if (currentRules.variation === 'vanishing-core') {
          const age = Date.now() - c.spawnTime;
          newScale = Math.max(0.1, 1.2 - (age / 1500));
          if (newScale <= 0.1) newOpacity *= 0.8;
        }

        // BLIND: Peripheral Pulse
        if (currentRules.variation === 'peripheral-pulse') {
          const dist = Math.hypot(newX - gameState.blindMaskPos.x, newY - gameState.blindMaskPos.y);
          newOpacity = Math.min(1, Math.max(0.05, dist / 400));
        }

        // WEIGHT repulsion
        if (gameType === 'weight' && currentRules.variation === 'surface-tension') {
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          const dist = Math.hypot(newX - centerX, newY - centerY);
          if (dist < 250) {
             const angle = Math.atan2(newY - centerY, newX - centerX);
             newX += Math.cos(angle) * 3;
             newY += Math.sin(angle) * 3;
          }
        }

        return { ...c, x: newX, y: newY, opacity: newOpacity, scale: newScale };
      }).filter(c => c.x > -250 && c.x < window.innerWidth + 250 && c.y > -250 && c.y < window.innerHeight + 250));

      setGameState(prev => {
        if (prev.gameTime > 0 && prev.gameTime % 12 === 0 && prev.ruleShiftsApplied < Math.floor(prev.gameTime / 12)) {
          applyRuleShift();
        }
        return prev;
      });
    }, 32);

    // Spawning Strategy
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
           size = 160;
           x = isLeft ? window.innerWidth * 0.15 : window.innerWidth * 0.65;
           y = window.innerHeight * 0.4;
           dx = 0; dy = 0;
           color = isLeft ? 'bg-indigo-700' : 'bg-slate-800';
           if (currentRules.variation === 'subliminal-lean') {
              if (isLeft) color = 'bg-indigo-600'; // Barely perceptible difference
           }
        } else if (gameType === 'shift' && currentRules.variation === 'color-disorientation') {
          isTarget = Math.random() > 0.5;
          color = isTarget ? 'bg-indigo-500' : 'bg-rose-600';
          if (Math.random() > 0.8) color = 'bg-amber-400'; // Chaos color
        } else if (gameType === 'blind' && currentRules.variation === 'static-ghost') {
          if (Math.random() > 0.6) type = 'phantom';
        }

        return [...prev, { id, x, y, size, dx, dy, color, isTarget, type, spawnTime: Date.now() }];
      });
    }, currentRules.spawnInterval);

    // ECHO: Pattern Playback
    if (gameType === 'echo') {
      const echoPlayback = window.setInterval(() => {
        setGameState(prev => {
          if (prev.echoBuffer.length > 0) {
            const last = prev.echoBuffer[0];
            const isReverse = currentRules.variation === 'reverse-loop';
            const index = isReverse ? prev.echoBuffer.length - 1 : 0;
            const target = prev.echoBuffer[index];

            setCircles(c => [...c, {
              id: `echo-${Date.now()}`,
              x: target.x + (currentRules.variation === 'decay-offset' ? (Math.random() - 0.5) * 80 : 0),
              y: target.y + (currentRules.variation === 'decay-offset' ? (Math.random() - 0.5) * 80 : 0),
              size: 55,
              dx: 0, dy: 0,
              color: 'bg-indigo-400',
              isTarget: true,
              type: 'echo',
              spawnTime: Date.now()
            }]);

            const nextBuffer = isReverse 
              ? prev.echoBuffer.slice(0, -1) 
              : prev.echoBuffer.slice(1);

            return { ...prev, echoBuffer: nextBuffer };
          }
          return prev;
        });
      }, currentRules.variation === 'time-stretch' ? 1000 : 2500);
      return () => clearInterval(echoPlayback);
    }

  }, [currentRules, gameState.activeGame, applyRuleShift, gameState.blindMaskPos.x, gameState.blindMaskPos.y]);

  const endGame = useCallback(() => {
    setGameState(prev => {
      [gameIntervalRef, spawnIntervalRef, gameTimerRef].forEach(ref => {
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

      if (prev.activeGame === 'delay') {
        const circle = circles.find(c => c.id === id);
        if (circle) {
          const aliveTime = Date.now() - circle.spawnTime;
          scoreGain = Math.min(30, Math.floor(aliveTime / 80)); 
        }
      } else if (prev.activeGame === 'shift' && prev.isLogicInverted) {
        hit = !isTarget;
        scoreGain = hit ? 20 : -15;
      } else if (prev.activeGame === 'choice') {
        scoreGain = 25;
        hit = true;
      } else {
        scoreGain = isTarget ? 10 : -8;
      }

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
        message: hit ? "SIGNAL LOCKED" : "BIT LOSS DETECTED"
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
      score: Math.max(0, p.score - 5),
      message: "NOISE INTERFERENCE"
    }));
  };

  const handleInteraction = (e: React.MouseEvent) => {
    if (!gameState.isRunning) return;
    
    if (gameState.activeGame === 'blind') {
      setGameState(prev => ({ ...prev, blindMaskPos: { x: e.clientX, y: e.clientY } }));
    }

    if (gameState.activeGame === 'weight') {
      const dist = Math.hypot(e.clientX - gameState.weightPos.x, e.clientY - gameState.weightPos.y);
      if (dist < 200) {
        setGameState(prev => {
          let strength = 0.25;
          if (currentRules.variation === 'air-resistance') {
             const speed = Math.hypot(prev.weightPos.velocityX, prev.weightPos.velocityY);
             strength = Math.max(0.1, 0.4 - (speed * 0.05));
          }
          if (currentRules.variation === 'phantom-drag' && Math.random() > 0.95) {
             strength = strength * (Math.random() > 0.5 ? 2 : 0.5);
          }
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
      className={`relative w-full h-full text-white font-mono flex flex-col items-center justify-center overflow-hidden select-none transition-all duration-700 ${
        gameState.isRunning && gameState.activeGame === 'shift' && gameState.isLogicInverted ? 'bg-[#0f0000]' : 'bg-[#050505]'
      }`}
      onMouseMove={handleInteraction}
    >
      {!gameState.activeGame && !gameState.isRunning ? (
        <GameSelector onSelect={selectGame} />
      ) : (
        <>
          <GameArea
            circles={circles}
            activeGame={gameState.activeGame}
            variation={currentRules.variation}
            onCircleClick={handleCircleClick}
            onMissClick={handleAreaClick}
          />

          {gameState.activeGame === 'blind' && (
            <div 
              className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-1000"
              style={{
                background: `radial-gradient(circle ${currentRules.variation === 'moving-fog' ? '120px' : '200px'} at ${gameState.blindMaskPos.x}px ${gameState.blindMaskPos.y}px, transparent 0%, rgba(0,0,0,0.995) 85%)`
              }}
            >
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
            </div>
          )}

          {gameState.activeGame === 'weight' && (
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/simple-dashed.png')]" />
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
        appVersion="v1.9.1" 
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