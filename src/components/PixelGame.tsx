import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';

interface GameState {
  player: {
    x: number;
    y: number;
    health: number;
    maxHealth: number;
    souls: number;
  };
  keys: {
    [key: string]: boolean;
  };
  gameStarted: boolean;
}

interface Soul {
  x: number;
  y: number;
  id: number;
}

const PixelGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  
  const [gameState, setGameState] = useState<GameState>({
    player: {
      x: 400,
      y: 300,
      health: 100,
      maxHealth: 100,
      souls: 0,
    },
    keys: {},
    gameStarted: false,
  });

  const [souls, setSouls] = useState<Soul[]>([
    { x: 200, y: 150, id: 1 },
    { x: 600, y: 250, id: 2 },
    { x: 100, y: 400, id: 3 },
    { x: 700, y: 100, id: 4 },
  ]);

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PLAYER_SIZE = 32;
  const PLAYER_SPEED = 3;
  const SOUL_SIZE = 16;

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setGameState(prev => ({
      ...prev,
      keys: { ...prev.keys, [e.key.toLowerCase()]: true }
    }));
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setGameState(prev => ({
      ...prev,
      keys: { ...prev.keys, [e.key.toLowerCase()]: false }
    }));
  }, []);

  // Game logic
  const updateGame = useCallback(() => {
    setGameState(prev => {
      const newState = { ...prev };
      
      // Player movement
      if (newState.keys['w'] || newState.keys['arrowup']) {
        newState.player.y = Math.max(0, newState.player.y - PLAYER_SPEED);
      }
      if (newState.keys['s'] || newState.keys['arrowdown']) {
        newState.player.y = Math.min(CANVAS_HEIGHT - PLAYER_SIZE, newState.player.y + PLAYER_SPEED);
      }
      if (newState.keys['a'] || newState.keys['arrowleft']) {
        newState.player.x = Math.max(0, newState.player.x - PLAYER_SPEED);
      }
      if (newState.keys['d'] || newState.keys['arrowright']) {
        newState.player.x = Math.min(CANVAS_WIDTH - PLAYER_SIZE, newState.player.x + PLAYER_SPEED);
      }

      return newState;
    });

    // Check soul collection
    setSouls(prev => {
      const newSouls = prev.filter(soul => {
        const dx = soul.x - (gameState.player.x + PLAYER_SIZE / 2);
        const dy = soul.y - (gameState.player.y + PLAYER_SIZE / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 20) {
          setGameState(prev => ({
            ...prev,
            player: { ...prev.player, souls: prev.player.souls + 1 }
          }));
          return false;
        }
        return true;
      });
      return newSouls;
    });
  }, [gameState.player.x, gameState.player.y]);

  // Render game
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with gothic background
    ctx.fillStyle = 'hsl(280, 15%, 8%)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw gothic stone floor pattern
    ctx.fillStyle = 'hsl(280, 8%, 15%)';
    for (let x = 0; x < CANVAS_WIDTH; x += 64) {
      for (let y = 0; y < CANVAS_HEIGHT; y += 64) {
        if ((x / 64 + y / 64) % 2 === 0) {
          ctx.fillRect(x, y, 64, 64);
        }
      }
    }

    // Draw gothic border pattern
    ctx.strokeStyle = 'hsl(280, 8%, 25%)';
    ctx.lineWidth = 2;
    for (let x = 0; x < CANVAS_WIDTH; x += 64) {
      for (let y = 0; y < CANVAS_HEIGHT; y += 64) {
        ctx.strokeRect(x, y, 64, 64);
      }
    }

    // Draw souls (glowing orbs)
    souls.forEach(soul => {
      // Glow effect
      const gradient = ctx.createRadialGradient(soul.x, soul.y, 0, soul.x, soul.y, 20);
      gradient.addColorStop(0, 'hsl(120, 60%, 60%)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(soul.x - 20, soul.y - 20, 40, 40);

      // Soul orb
      ctx.fillStyle = 'hsl(120, 60%, 40%)';
      ctx.fillRect(soul.x - SOUL_SIZE / 2, soul.y - SOUL_SIZE / 2, SOUL_SIZE, SOUL_SIZE);
      
      // Inner glow
      ctx.fillStyle = 'hsl(120, 80%, 60%)';
      ctx.fillRect(soul.x - SOUL_SIZE / 4, soul.y - SOUL_SIZE / 4, SOUL_SIZE / 2, SOUL_SIZE / 2);
    });

    // Draw player (gothic knight)
    const playerCenterX = gameState.player.x + PLAYER_SIZE / 2;
    const playerCenterY = gameState.player.y + PLAYER_SIZE / 2;

    // Player shadow
    ctx.fillStyle = 'hsl(280, 20%, 5%)';
    ctx.fillRect(gameState.player.x + 4, gameState.player.y + PLAYER_SIZE - 4, PLAYER_SIZE, 8);

    // Player body (dark armor)
    ctx.fillStyle = 'hsl(280, 8%, 20%)';
    ctx.fillRect(gameState.player.x, gameState.player.y, PLAYER_SIZE, PLAYER_SIZE);

    // Player highlights
    ctx.fillStyle = 'hsl(280, 60%, 25%)';
    ctx.fillRect(gameState.player.x + 4, gameState.player.y + 4, PLAYER_SIZE - 8, 4);
    ctx.fillRect(gameState.player.x + 4, gameState.player.y + 4, 4, PLAYER_SIZE - 8);

    // Player eyes (glowing)
    ctx.fillStyle = 'hsl(0, 70%, 45%)';
    ctx.fillRect(gameState.player.x + 8, gameState.player.y + 8, 4, 4);
    ctx.fillRect(gameState.player.x + 20, gameState.player.y + 8, 4, 4);

    // Player weapon highlight
    ctx.fillStyle = 'hsl(45, 90%, 55%)';
    ctx.fillRect(gameState.player.x + 28, gameState.player.y + 12, 4, 12);

  }, [gameState.player, souls]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState.gameStarted) {
      updateGame();
      render();
    }
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.gameStarted, updateGame, render]);

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Set up event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Start game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleKeyDown, handleKeyUp, gameLoop]);

  const startGame = () => {
    setGameState(prev => ({ ...prev, gameStarted: true }));
  };

  const restartGame = () => {
    setGameState({
      player: {
        x: 400,
        y: 300,
        health: 100,
        maxHealth: 100,
        souls: 0,
      },
      keys: {},
      gameStarted: true,
    });
    setSouls([
      { x: 200, y: 150, id: 1 },
      { x: 600, y: 250, id: 2 },
      { x: 100, y: 400, id: 3 },
      { x: 700, y: 100, id: 4 },
    ]);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2 text-primary">Gothic Pixel Quest</h1>
        <p className="text-muted-foreground pixel-text">
          Collect the mystical souls in this haunted realm
        </p>
      </div>

      <Card className="game-ui">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="pixel-text">
              <span className="text-primary">Health:</span>
              <div className="health-bar w-32 h-4 ml-2 inline-block">
                <div 
                  className="health-fill" 
                  style={{ width: `${(gameState.player.health / gameState.player.maxHealth) * 100}%` }}
                />
              </div>
            </div>
            <div className="pixel-text">
              <span className="text-accent">Souls: {gameState.player.souls}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {!gameState.gameStarted ? (
              <button onClick={startGame} className="gothic-button">
                Start Quest
              </button>
            ) : (
              <button onClick={restartGame} className="gothic-button">
                Restart
              </button>
            )}
          </div>
        </div>

        <canvas 
          ref={canvasRef}
          className="pixel-canvas"
          style={{ 
            width: `${CANVAS_WIDTH}px`, 
            height: `${CANVAS_HEIGHT}px`,
          }}
        />

        <div className="mt-4 text-center pixel-text text-muted-foreground">
          <p>Use WASD or Arrow Keys to move your gothic knight</p>
          <p>Collect all the glowing souls to complete your quest</p>
        </div>
      </Card>
    </div>
  );
};

export default PixelGame;