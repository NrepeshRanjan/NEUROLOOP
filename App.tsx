
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
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [currentRules, setCurrentRules] = useState<GameRule>({
    targetColor: 'bg-indigo-500',
    minCircleSize: 30,
    maxCircleSize: 60,
    minSpeed: 1,
    maxSpeed: 3,
    spawnInterval: 1200,
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

  // Initialization
  useEffect(() => {
    fetchAppConfig().then(setAppConfig);
    // Cast to any and use v1 return style { data: subscription } to fix property access errors
    const { data: authListener } = (supabase.auth as any).onAuthStateChange((_: any, s: any) => setSession(s));
    AuthService.getSession().then(setSession);
    // authListener in v1 is the subscription object which contains the unsubscribe method
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

  // Rules Engine
  const applyRuleShift = useCallback(() => {
    if (!gameState.activeGame) return;

    setGameState(prev => ({ ...prev, ruleShiftsApplied: prev.ruleShiftsApplied + 1 }));
    
    setCurrentRules(prev => {
      const gameType = gameState.activeGame;
      let newVariation = prev.variation;
      const variations = {
        delay: ['ghost-pulse', 'depth-drift', 'vanishing-core'],
        shift: ['ghost-rule', 'shape-morph', 'color-disorientation'],
        echo: ['decay-offset', 'time-stretch', 'reverse-loop'],
        weight: ['surface-tension', 'air-resistance', 'phantom-drag'],
        blind: ['peripheral-pulse', 'static-ghost', 'moving-fog'],
        choice: ['subliminal-lean', 'outcome-mask', 'memory-consequence']
      };
      
      const gameVariations = variations[gameType as keyof typeof variations] || [];
      newVariation = gameVariations[Math.floor(Math.random() * gameVariations.length)];

      setGameState(p => ({ ...p, message: `Variation Active: ${newVariation.replace('-', ' ')}` }));

      return {
        ...prev,
        variation: newVariation,
        spawnInterval: Math.max(400, prev.spawnInterval * 0.9),
        maxSpeed: Math.min(10, prev.maxSpeed * 1.1)
      };
    });
  }, [gameState.activeGame]);

  const selectGame = (game: GameType) => {
    setGameState(prev => ({ ...prev, activeGame: game, message: `Initialized ${game.toUpperCase()}` }));
    startGame(game);
  };

  const startGame = useCallback((gameType: GameType) => {
    setGameState({ 
      ...INITIAL_GAME_STATE, 
      isRunning: true, 
      activeGame: gameType,
      message: `${gameType.toUpperCase()} Active.` 
    });
    
    setCircles([]);
    clickTimesRef.current = [];

    // Reset Intervals
    [gameIntervalRef, spawnIntervalRef, gameTimerRef, physicsIntervalRef].forEach(ref => {
      if (ref.current) clearInterval(ref.current);
    });

    // 1s Game Timer
    gameTimerRef.current = window.setInterval(() => {
      setGameState(prev => {
        if (prev.gameTime >= 60) {
          endGame();
          return prev;
        }
        return { ...prev, gameTime: prev.gameTime + 1 };
      });
    }, 1000);

    // Physics Loop for WEIGHT game
    if (gameType === 'weight') {
      physicsIntervalRef.current = window.setInterval(() => {
        setGameState(prev => {
          const friction = 0.98;
          let { x, y, velocityX, velocityY } = prev.weightPos;
          x += velocityX;
          y += velocityY;
          velocityX *= friction;
          velocityY *= friction;

          // Bounce
          if (x < 0 || x > window.innerWidth) velocityX *= -1;
          if (y < 0 || y > window.innerHeight) velocityY *= -1;

          return { ...prev, weightPos: { x, y, velocityX, velocityY } };
        });
      }, 16);
    }

    // Main Update Loop
    gameIntervalRef.current = window.setInterval(() => {
      setCircles(prev => prev.map(c => ({
        ...c,
        x: c.x + c.dx,
        y: c.y + c.dy,
        size: currentRules.variation === 'vanishing-core' ? Math.max(5, c.size * 0.99) : c.size
      })).filter(c => c.x > -100 && c.x < window.innerWidth + 100 && c.y > -100 && c.y < window.innerHeight + 100));
    }, 30);

    // Spawn Loop
    spawnIntervalRef.current = window.setInterval(() => {
      setCircles(prev => {
        if (prev.length >= currentRules.maxCirclesOnScreen) return prev;
        
        const id = Math.random().toString(36).substr(2, 9);
        const size = Math.random() * (currentRules.maxCircleSize - currentRules.minCircleSize) + currentRules.minCircleSize;
        
        // Game specific spawning logic
        let x = Math.random() * (window.innerWidth - size);
        let y = Math.random() * (window.innerHeight - size);
        let dx = (Math.random() - 0.5) * currentRules.maxSpeed;
        let dy = (Math.random() - 0.5) * currentRules.maxSpeed;
        let color = currentRules.targetColor;
        let isTarget = true;

        if (gameType === 'shift' && currentRules.variation === 'ghost-rule') {
          isTarget = Math.random() > 0.5;
          color = isTarget ? 'bg-indigo-500' : 'bg-red-500';
        }

        return [...prev, { id, x, y, size, dx, dy, color, isTarget }];
      });
    }, currentRules.spawnInterval);

  }, [currentRules, gameState.activeGame]);

  const endGame = useCallback(() => {
    setGameState(prev => {
      const finalState = { ...prev, isRunning: false };
      [gameIntervalRef, spawnIntervalRef, gameTimerRef, physicsIntervalRef].forEach(ref => {
        if (ref.current) clearInterval(ref.current);
      });
      
      setCircles([]);
      getNeuroCasualInsight(prev.score, prev.accuracy, prev.averageClickSpeed, prev.ruleShiftsApplied)
        .then(openModal);

      return finalState;
    });
  }, [openModal]);

  const handleCircleClick = (id: string, isTarget: boolean) => {
    if (!gameState.isRunning) return;

    setGameState(prev => {
      const newTotal = prev.totalClicks + 1;
      const newHits = isTarget ? prev.hitCount + 1 : prev.hitCount;
      const now = performance.now();
      clickTimesRef.current.push(now);

      // ECHO Mechanic: Store clicks
      const newEchoBuffer = prev.activeGame === 'echo' 
        ? [...prev.echoBuffer, { x: circles.find(c => c.id === id)?.x || 0, y: circles.find(c => c.id === id)?.y || 0, timestamp: now }]
        : prev.echoBuffer;

      return {
        ...prev,
        score: isTarget ? prev.score + 10 : Math.max(0, prev.score - 5),
        hitCount: newHits,
        totalClicks: newTotal,
        accuracy: (newHits / newTotal) * 100,
        echoBuffer: newEchoBuffer
      };
    });

    setCircles(prev => prev.filter(c => c.id !== id));
  };

  const handleInteraction = (e: React.MouseEvent) => {
    if (!gameState.isRunning) return;
    
    // BLIND Mask Follow
    if (gameState.activeGame === 'blind') {
      setGameState(prev => ({ ...prev, blindMaskPos: { x: e.clientX, y: e.clientY } }));
    }

    // WEIGHT Physics push
    if (gameState.activeGame === 'weight') {
      const dist = Math.hypot(e.clientX - gameState.weightPos.x, e.clientY - gameState.weightPos.y);
      if (dist < 100) {
        setGameState(prev => ({
          ...prev,
          weightPos: {
            ...prev.weightPos,
            velocityX: (prev.weightPos.x - e.clientX) * 0.2,
            velocityY: (prev.weightPos.y - e.clientY) * 0.2
          }
        }));
      }
    }
  };

  return (
    <div 
      className="relative w-full h-full bg-[#050505] text-white font-mono flex flex-col items-center justify-center overflow-hidden"
      onMouseMove={handleInteraction}
    >
      {!gameState.activeGame && !gameState.isRunning ? (
        <GameSelector onSelect={selectGame} />
      ) : (
        <>
          <GameArea
            circles={circles}
            onCircleClick={handleCircleClick}
            onMissClick={() => setGameState(p => ({ ...p, totalClicks: p.totalClicks + 1, accuracy: (p.hitCount / (p.totalClicks + 1)) * 100 }))}
          />

          {/* Special Visuals */}
          {gameState.activeGame === 'blind' && (
            <div 
              className="absolute inset-0 pointer-events-none z-30"
              style={{
                background: `radial-gradient(circle 120px at ${gameState.blindMaskPos.x}px ${gameState.blindMaskPos.y}px, transparent 0%, rgba(0,0,0,0.98) 100%)`
              }}
            />
          )}

          {gameState.activeGame === 'weight' && (
            <div 
              className="absolute w-20 h-20 bg-indigo-500/20 rounded-full blur-xl animate-pulse pointer-events-none"
              style={{ left: gameState.weightPos.x - 40, top: gameState.weightPos.y - 40 }}
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
        <div className="text-gray-900">
          <h3 className="text-xl font-bold mb-4">Neuroloop Insight</h3>
          <p className="italic leading-relaxed">{geminiInsight}</p>
          <button 
            onClick={() => { closeModal(); setGameState(INITIAL_GAME_STATE); }}
            className="mt-6 w-full py-2 bg-indigo-600 text-white rounded font-bold"
          >
            RETURN TO VOID
          </button>
        </div>
      </Modal>

      <BrandingFooter 
        onAdminAccessAttempt={() => setShowAdminPanel(true)} 
        appVersion="v1.6.0" 
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
