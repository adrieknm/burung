import { useState, useEffect, useCallback, useRef } from 'react';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const BIRD_SIZE = 30;
const PIPE_WIDTH = 60;
const PIPE_GAP = 160;
const GRAVITY = 0.5;
const JUMP_STRENGTH = -8;
const PIPE_SPEED = 3;
const PIPE_SPAWN_INTERVAL = 1500;

interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
}

export function App() {
  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('flappyHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const gameLoopRef = useRef<number | null>(null);
  const lastPipeSpawnRef = useRef<number>(0);
  const birdX = 80;

  const jump = useCallback(() => {
    if (gameOver) {
      resetGame();
      return;
    }
    if (!gameStarted) {
      setGameStarted(true);
      setBirdVelocity(JUMP_STRENGTH);
      return;
    }
    if (!isPaused) {
      setBirdVelocity(JUMP_STRENGTH);
    }
  }, [gameOver, gameStarted, isPaused]);

  const resetGame = () => {
    setBirdY(GAME_HEIGHT / 2);
    setBirdVelocity(0);
    setPipes([]);
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    setIsPaused(false);
    lastPipeSpawnRef.current = 0;
  };

  const checkCollision = useCallback((birdY: number, currentPipes: Pipe[]) => {
    const birdTop = birdY;
    const birdBottom = birdY + BIRD_SIZE;
    const birdLeft = birdX;
    const birdRight = birdX + BIRD_SIZE;

    // Check ground and ceiling collision
    if (birdTop <= 0 || birdBottom >= GAME_HEIGHT) {
      return true;
    }

    // Check pipe collision
    for (const pipe of currentPipes) {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + PIPE_WIDTH;

      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + PIPE_GAP) {
          return true;
        }
      }
    }

    return false;
  }, [birdX]);

  const gameLoop = useCallback((timestamp: number) => {
    if (!gameStarted || gameOver || isPaused) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    // Update bird physics
    setBirdY(prevY => {
      const newY = prevY + birdVelocity;
      return newY;
    });

    setBirdVelocity(prev => prev + GRAVITY);

    // Spawn pipes
    if (timestamp - lastPipeSpawnRef.current > PIPE_SPAWN_INTERVAL) {
      const minPipeHeight = 50;
      const maxPipeHeight = GAME_HEIGHT - PIPE_GAP - minPipeHeight - 50;
      const topHeight = Math.random() * (maxPipeHeight - minPipeHeight) + minPipeHeight;
      
      setPipes(prev => [...prev, { x: GAME_WIDTH, topHeight, passed: false }]);
      lastPipeSpawnRef.current = timestamp;
    }

    // Update pipes and check collisions
    setPipes(prevPipes => {
      const newPipes = prevPipes
        .map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
        .filter(pipe => pipe.x + PIPE_WIDTH > -50);

      // Check for collision
      if (checkCollision(birdY, newPipes)) {
        setGameOver(true);
        return prevPipes;
      }

      // Update score
      newPipes.forEach(pipe => {
        if (!pipe.passed && pipe.x + PIPE_WIDTH < birdX) {
          pipe.passed = true;
          setScore(prev => prev + 1);
        }
      });

      return newPipes;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameStarted, gameOver, isPaused, birdVelocity, birdY, checkCollision]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('flappyHighScore', score.toString());
    }
  }, [score, highScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex flex-col items-center justify-center p-4">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Flappy Bird</h1>
        <div className="flex gap-4 justify-center text-white">
          <div className="bg-white/20 px-4 py-2 rounded-lg">
            <span className="text-sm">Score: </span>
            <span className="text-xl font-bold">{score}</span>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-lg">
            <span className="text-sm">Best: </span>
            <span className="text-xl font-bold">{highScore}</span>
          </div>
        </div>
      </div>

      <div
        className="relative bg-gradient-to-b from-sky-300 to-sky-500 rounded-lg overflow-hidden cursor-pointer shadow-2xl"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        onClick={jump}
        onTouchStart={(e) => {
          e.preventDefault();
          jump();
        }}
      >
        {/* Clouds */}
        <div className="absolute top-10 left-20 opacity-60">
          <div className="w-16 h-8 bg-white rounded-full"></div>
          <div className="w-12 h-6 bg-white rounded-full -mt-4 ml-2"></div>
        </div>
        <div className="absolute top-20 right-40 opacity-40">
          <div className="w-12 h-6 bg-white rounded-full"></div>
          <div className="w-8 h-4 bg-white rounded-full -mt-3 ml-2"></div>
        </div>
        <div className="absolute top-40 left-60 opacity-50">
          <div className="w-14 h-7 bg-white rounded-full"></div>
          <div className="w-10 h-5 bg-white rounded-full -mt-3 ml-2"></div>
        </div>

        {/* Pipes */}
        {pipes.map((pipe, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              left: pipe.x,
              top: 0,
              width: PIPE_WIDTH,
              height: pipe.topHeight,
            }}
          >
            <div className="w-full h-full bg-gradient-to-r from-green-600 to-green-500 rounded-b-lg border-2 border-green-700">
              <div className="absolute bottom-0 w-[120%] -left-[10%] h-6 bg-green-600 rounded border-2 border-green-700"></div>
            </div>
          </div>
        ))}
        {pipes.map((pipe, index) => (
          <div
            key={`bottom-${index}`}
            className="absolute"
            style={{
              left: pipe.x,
              top: pipe.topHeight + PIPE_GAP,
              width: PIPE_WIDTH,
              height: GAME_HEIGHT - pipe.topHeight - PIPE_GAP,
            }}
          >
            <div className="w-full h-full bg-gradient-to-r from-green-600 to-green-500 rounded-t-lg border-2 border-green-700">
              <div className="absolute top-0 w-[120%] -left-[10%] h-6 bg-green-600 rounded border-2 border-green-700"></div>
            </div>
          </div>
        ))}

        {/* Bird */}
        <div
          className="absolute transition-transform"
          style={{
            left: birdX,
            top: birdY,
            width: BIRD_SIZE,
            height: BIRD_SIZE,
            transform: `rotate(${Math.min(birdVelocity * 3, 30)}deg)`,
          }}
        >
          <div className="w-full h-full bg-yellow-400 rounded-full border-2 border-yellow-600 relative">
            <div className="absolute top-1 right-2 w-3 h-3 bg-white rounded-full">
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-black rounded-full"></div>
            </div>
            <div className="absolute top-3 -right-2 w-4 h-3 bg-orange-500 rounded-r-full"></div>
            <div className="absolute bottom-1 left-1 w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Ground */}
        <div className="absolute bottom-0 w-full h-8 bg-gradient-to-r from-green-700 to-green-600 border-t-4 border-green-800">
          <div className="w-full h-2 bg-yellow-600"></div>
        </div>

        {/* Start Screen */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full border-4 border-yellow-600 mx-auto mb-4">
                <div className="absolute top-3 right-4 w-4 h-4 bg-white rounded-full">
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-black rounded-full"></div>
                </div>
                <div className="absolute top-5 -right-3 w-5 h-4 bg-orange-500 rounded-r-full"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Flappy Bird</h2>
              <p className="text-gray-600 mb-4">Tap or press Space to fly!</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  jump();
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
            <div className="bg-white rounded-lg p-6 text-center">
              <h2 className="text-3xl font-bold text-red-600 mb-4">Game Over!</h2>
              <div className="space-y-2 mb-4">
                <div className="text-lg">
                  <span className="text-gray-600">Score: </span>
                  <span className="font-bold text-xl">{score}</span>
                </div>
                <div className="text-lg">
                  <span className="text-gray-600">Best: </span>
                  <span className="font-bold text-xl">{highScore}</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetGame();
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* Pause indicator */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white/90 px-6 py-3 rounded-lg">
              <span className="text-xl font-bold text-gray-800">Paused</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-white">
        <p className="text-sm mb-2">Controls:</p>
        <div className="flex gap-4 justify-center">
          <div className="bg-white/20 px-3 py-1 rounded">
            <span className="text-sm">Tap / Click to fly</span>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded">
            <span className="text-sm">Space to fly</span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-white/80 text-xs">
        <p>Works on mobile! Tap the game area to play.</p>
      </div>
    </div>
  );
}
