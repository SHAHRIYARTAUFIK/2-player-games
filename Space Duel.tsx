import { useState, useEffect, useRef } from 'react';

export default function SpaceDuel() {
  // Game state
  const [gameActive, setGameActive] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [winner, setWinner] = useState(null);
  
  // Players state
  const [player1, setPlayer1] = useState({
    x: 100,
    y: 250,
    angle: 0,
    health: 100,
    score: 0,
    cooldown: 0,
    color: '#FF5252'
  });
  
  const [player2, setPlayer2] = useState({
    x: 500,
    y: 250,
    angle: 180,
    health: 100,
    score: 0,
    cooldown: 0,
    color: '#4CAF50'
  });
  
  // Projectiles state
  const [projectiles, setProjectiles] = useState([]);
  
  // Asteroids state
  const [asteroids, setAsteroids] = useState([]);
  
  // Game area dimensions
  const gameWidth = 600;
  const gameHeight = 500;
  
  // Key tracking
  const keysPressed = useRef({});
  
  // Frame request reference
  const frameIdRef = useRef(null);
  
  // Audio references
  const shootSound = useRef(null);
  const explosionSound = useRef(null);
  const hitSound = useRef(null);
  
  // Start game function
  const startGame = () => {
    setGameActive(true);
    setWinner(null);
    setPlayer1({
      x: 100,
      y: 250,
      angle: 0,
      health: 100,
      score: 0,
      cooldown: 0,
      color: '#FF5252'
    });
    setPlayer2({
      x: 500,
      y: 250,
      angle: 180,
      health: 100,
      score: 0,
      cooldown: 0,
      color: '#4CAF50'
    });
    setProjectiles([]);
    
    // Create initial asteroids
    const newAsteroids = [];
    for (let i = 0; i < 5; i++) {
      newAsteroids.push(createAsteroid());
    }
    setAsteroids(newAsteroids);
  };
  
  // Create a new asteroid
  const createAsteroid = () => {
    // Position asteroids away from players initially
    let x, y;
    do {
      x = Math.random() * gameWidth;
      y = Math.random() * gameHeight;
    } while (
      (Math.abs(x - player1.x) < 100 && Math.abs(y - player1.y) < 100) ||
      (Math.abs(x - player2.x) < 100 && Math.abs(y - player2.y) < 100)
    );
    
    return {
      x,
      y,
      size: 20 + Math.random() * 20,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 4
    };
  };
  
  // Setup event listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.key] = true;
    };
    
    const handleKeyUp = (e) => {
      keysPressed.current[e.key] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(frameIdRef.current);
    };
  }, []);

  // Initialize sound effects
  useEffect(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Simple beep for shooting
      shootSound.current = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = 'sine';
        oscillator.frequency.value = 880;
        gainNode.gain.value = 0.1;
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.2);
        oscillator.stop(audioContext.currentTime + 0.2);
      };
      
      // Explosion sound
      explosionSound.current = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 100;
        gainNode.gain.value = 0.2;
        oscillator.start();
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.4);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.4);
        oscillator.stop(audioContext.currentTime + 0.4);
      };
      
      // Hit sound
      hitSound.current = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = 'square';
        oscillator.frequency.value = 220;
        gainNode.gain.value = 0.1;
        oscillator.start();
        oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.1);
        oscillator.stop(audioContext.currentTime + 0.1);
      };
    } catch (error) {
      console.log("Audio not supported or blocked");
    }
  }, []);
  
  // Game loop
  useEffect(() => {
    if (!gameActive) return;
    
    const gameLoop = () => {
      // Player 1 controls (WASD + Space)
      updatePlayer(1, {
        up: keysPressed.current['w'],
        down: keysPressed.current['s'],
        left: keysPressed.current['a'],
        right: keysPressed.current['d'],
        shoot: keysPressed.current[' ']
      });
      
      // Player 2 controls (Arrow keys + Enter)
      updatePlayer(2, {
        up: keysPressed.current['ArrowUp'],
        down: keysPressed.current['ArrowDown'],
        left: keysPressed.current['ArrowLeft'],
        right: keysPressed.current['ArrowRight'],
        shoot: keysPressed.current['Enter']
      });
      
      // Update projectiles
      updateProjectiles();
      
      // Update asteroids
      updateAsteroids();
      
      // Check collisions
      checkCollisions();
      
      // Check win condition
      if (player1.health <= 0 || player2.health <= 0) {
        setGameActive(false);
        setWinner(player1.health <= 0 ? 2 : 1);
      }
      
      frameIdRef.current = requestAnimationFrame(gameLoop);
    };
    
    frameIdRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      cancelAnimationFrame(frameIdRef.current);
    };
  }, [gameActive, player1, player2, projectiles, asteroids]);
  
  // Update player position and actions
  const updatePlayer = (playerNum, controls) => {
    const playerState = playerNum === 1 ? player1 : player2;
    const setPlayerState = playerNum === 1 ? setPlayer1 : setPlayer2;
    
    // Calculate new position and angle
    let newX = playerState.x;
    let newY = playerState.y;
    let newAngle = playerState.angle;
    let newCooldown = Math.max(0, playerState.cooldown - 1);
    
    // Rotation
    if (controls.left) newAngle = (newAngle - 5) % 360;
    if (controls.right) newAngle = (newAngle + 5) % 360;
    
    // Movement
    if (controls.up) {
      newX += Math.cos(newAngle * Math.PI / 180) * 3;
      newY += Math.sin(newAngle * Math.PI / 180) * 3;
    }
    if (controls.down) {
      newX -= Math.cos(newAngle * Math.PI / 180) * 1.5;
      newY -= Math.sin(newAngle * Math.PI / 180) * 1.5;
    }
    
    // Keep within bounds
    newX = Math.max(20, Math.min(gameWidth - 20, newX));
    newY = Math.max(20, Math.min(gameHeight - 20, newY));
    
    // Shooting
    if (controls.shoot && newCooldown === 0) {
      const angle = newAngle * Math.PI / 180;
      
      setProjectiles(prev => [...prev, {
        x: newX + Math.cos(angle) * 20,
        y: newY + Math.sin(angle) * 20,
        speedX: Math.cos(angle) * 7,
        speedY: Math.sin(angle) * 7,
        owner: playerNum,
        size: 4,
        life: 60
      }]);
      
      newCooldown = 15; // Cooldown before next shot
      
      // Play shoot sound
      if (shootSound.current) shootSound.current();
    }
    
    // Update player state
    setPlayerState({
      ...playerState,
      x: newX,
      y: newY,
      angle: newAngle,
      cooldown: newCooldown
    });
  };
  
  // Update projectiles
  const updateProjectiles = () => {
    setProjectiles(prev => prev.map(p => ({
      ...p,
      x: p.x + p.speedX,
      y: p.y + p.speedY,
      life: p.life - 1
    })).filter(p => 
      p.life > 0 && 
      p.x > 0 && p.x < gameWidth && 
      p.y > 0 && p.y < gameHeight
    ));
  };
  
  // Update asteroids
  const updateAsteroids = () => {
    setAsteroids(prev => {
      // Create new asteroids randomly
      if (prev.length < 5 && Math.random() < 0.01) {
        return [...prev, createAsteroid()];
      }
      
      return prev.map(a => {
        let newX = a.x + a.speedX;
        let newY = a.y + a.speedY;
        
        // Bounce off walls
        if (newX < 0 || newX > gameWidth) {
          a.speedX *= -1;
          newX = a.x + a.speedX;
        }
        
        if (newY < 0 || newY > gameHeight) {
          a.speedY *= -1;
          newY = a.y + a.speedY;
        }
        
        return {
          ...a,
          x: newX,
          y: newY,
          rotation: (a.rotation + a.rotationSpeed) % 360
        };
      });
    });
  };
  
  // Check for all collisions
  const checkCollisions = () => {
    // Players with projectiles
    projectiles.forEach(projectile => {
      // Player 1 collision with projectile from player 2
      if (projectile.owner === 2 && 
          distance(projectile.x, projectile.y, player1.x, player1.y) < 20) {
        
        setPlayer1(prev => ({
          ...prev,
          health: prev.health - 10
        }));
        
        setPlayer2(prev => ({
          ...prev,
          score: prev.score + 10
        }));
        
        // Remove projectile
        setProjectiles(prev => prev.filter(p => p !== projectile));
        
        // Play hit sound
        if (hitSound.current) hitSound.current();
      }
      
      // Player 2 collision with projectile from player 1
      if (projectile.owner === 1 && 
          distance(projectile.x, projectile.y, player2.x, player2.y) < 20) {
        
        setPlayer2(prev => ({
          ...prev,
          health: prev.health - 10
        }));
        
        setPlayer1(prev => ({
          ...prev,
          score: prev.score + 10
        }));
        
        // Remove projectile
        setProjectiles(prev => prev.filter(p => p !== projectile));
        
        // Play hit sound
        if (hitSound.current) hitSound.current();
      }
      
      // Projectiles with asteroids
      asteroids.forEach(asteroid => {
        if (distance(projectile.x, projectile.y, asteroid.x, asteroid.y) < asteroid.size) {
          // Remove projectile
          setProjectiles(prev => prev.filter(p => p !== projectile));
          
          // Remove asteroid and add points to shooter
          setAsteroids(prev => prev.filter(a => a !== asteroid));
          
          if (projectile.owner === 1) {
            setPlayer1(prev => ({
              ...prev,
              score: prev.score + 5
            }));
          } else {
            setPlayer2(prev => ({
              ...prev,
              score: prev.score + 5
            }));
          }
          
          // Play explosion sound
          if (explosionSound.current) explosionSound.current();
        }
      });
    });
    
    // Players with asteroids
    asteroids.forEach(asteroid => {
      // Player 1 collision with asteroid
      if (distance(player1.x, player1.y, asteroid.x, asteroid.y) < asteroid.size + 15) {
        setPlayer1(prev => ({
          ...prev,
          health: prev.health - 5
        }));
        
        // Remove asteroid
        setAsteroids(prev => prev.filter(a => a !== asteroid));
        
        // Play explosion sound
        if (explosionSound.current) explosionSound.current();
      }
      
      // Player 2 collision with asteroid
      if (distance(player2.x, player2.y, asteroid.x, asteroid.y) < asteroid.size + 15) {
        setPlayer2(prev => ({
          ...prev,
          health: prev.health - 5
        }));
        
        // Remove asteroid
        setAsteroids(prev => prev.filter(a => a !== asteroid));
        
        // Play explosion sound
        if (explosionSound.current) explosionSound.current();
      }
    });
  };
  
  // Calculate distance between two points
  const distance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };
  
  // Render player ship
  const renderShip = (player) => {
    const angle = player.angle * Math.PI / 180;
    const x = player.x;
    const y = player.y;
    
    // Ship points
    const points = [
      { x: 20, y: 0 },  // Nose
      { x: -10, y: 10 }, // Right wing
      { x: -5, y: 0 },  // Back center
      { x: -10, y: -10 } // Left wing
    ];
    
    // Apply rotation
    const rotatedPoints = points.map(point => {
      const rotatedX = point.x * Math.cos(angle) - point.y * Math.sin(angle);
      const rotatedY = point.x * Math.sin(angle) + point.y * Math.cos(angle);
      return { x: rotatedX + x, y: rotatedY + y };
    });
    
    // Create SVG polygon points string
    return rotatedPoints.map(p => `${p.x},${p.y}`).join(' ');
  };
  
  // Render asteroid
  const renderAsteroid = (asteroid) => {
    const points = [];
    const angleStep = 360 / 8;
    const angle = asteroid.rotation * Math.PI / 180;
    
    for (let i = 0; i < 8; i++) {
      const pointAngle = i * angleStep * Math.PI / 180;
      const radius = asteroid.size * (0.8 + Math.sin(i * 1.5) * 0.2);
      
      // Base asteroid shape
      let x = Math.cos(pointAngle) * radius;
      let y = Math.sin(pointAngle) * radius;
      
      // Apply asteroid rotation
      const rotatedX = x * Math.cos(angle) - y * Math.sin(angle);
      const rotatedY = x * Math.sin(angle) + y * Math.cos(angle);
      
      points.push({
        x: rotatedX + asteroid.x,
        y: rotatedY + asteroid.y
      });
    }
    
    return points.map(p => `${p.x},${p.y}`).join(' ');
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto bg-gray-900 text-white p-6 rounded-lg">
      <h1 className="text-3xl font-bold mb-2 text-center">Space Duel</h1>
      
      {!gameActive && !winner && (
        <div className="flex flex-col items-center mb-4 w-full">
          <div className="bg-gray-800 p-6 rounded-lg mb-4 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center">Welcome to Space Duel!</h2>
            <p className="mb-4">Battle your friend in this exciting 2-player space combat game. Dodge asteroids, shoot your opponent, and be the last ship standing!</p>
            
            <div className="flex space-x-4 justify-center mb-4">
              <button 
                onClick={startGame}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md font-bold"
              >
                Start Game
              </button>
              <button 
                onClick={() => setShowInstructions(!showInstructions)}
                className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-md font-bold"
              >
                {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
              </button>
            </div>
            
            {showInstructions && (
              <div className="bg-gray-700 p-4 rounded-md">
                <h3 className="font-bold mb-2">Controls:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-red-400">Player 1 (Red)</h4>
                    <ul className="text-sm">
                      <li>W: Move forward</li>
                      <li>S: Move backward</li>
                      <li>A: Rotate left</li>
                      <li>D: Rotate right</li>
                      <li>Space: Shoot</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-400">Player 2 (Green)</h4>
                    <ul className="text-sm">
                      <li>↑: Move forward</li>
                      <li>↓: Move backward</li>
                      <li>←: Rotate left</li>
                      <li>→: Rotate right</li>
                      <li>Enter: Shoot</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-2 text-sm">Avoid asteroids and enemy fire. Score points by destroying asteroids and hitting your opponent!</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {!gameActive && winner && (
        <div className="flex flex-col items-center mb-4">
          <h2 className="text-2xl font-bold mb-2">
            Player {winner} Wins!
          </h2>
          <div className="flex justify-between w-full max-w-sm mb-4 bg-gray-800 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: player1.color }}>Player 1</div>
              <div>Score: {player1.score}</div>
              <div>Health: {player1.health}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: player2.color }}>Player 2</div>
              <div>Score: {player2.score}</div>
              <div>Health: {player2.health}</div>
            </div>
          </div>
          <button 
            onClick={startGame}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md font-bold"
          >
            Play Again
          </button>
        </div>
      )}
      
      {gameActive && (
        <div className="relative">
          {/* Game area */}
          <svg 
            width={gameWidth} 
            height={gameHeight} 
            className="bg-gray-800 border-2 border-gray-700 rounded-lg"
          >
            {/* Space background with stars */}
            <defs>
              <radialGradient id="star1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>
            
            {/* Stars */}
            {Array.from({ length: 50 }).map((_, i) => (
              <circle
                key={`star-${i}`}
                cx={Math.random() * gameWidth}
                cy={Math.random() * gameHeight}
                r={Math.random() * 1.5}
                fill="white"
                opacity={0.3 + Math.random() * 0.7}
              />
            ))}
            
            {/* Asteroids */}
            {asteroids.map((asteroid, index) => (
              <polygon
                key={`asteroid-${index}`}
                points={renderAsteroid(asteroid)}
                fill="#999999"
              />
            ))}
            
            {/* Player 1 */}
            <polygon
              points={renderShip(player1)}
              fill={player1.color}
              stroke="white"
              strokeWidth="1"
            />
            
            {/* Engine flame for player 1 when moving forward */}
            {keysPressed.current['w'] && (
              <polygon
                points={`
                  ${player1.x - Math.cos(player1.angle * Math.PI / 180) * 15},
                  ${player1.y - Math.sin(player1.angle * Math.PI / 180) * 15}
                  ${player1.x - Math.cos(player1.angle * Math.PI / 180) * 25 + Math.sin(player1.angle * Math.PI / 180) * 5},
                  ${player1.y - Math.sin(player1.angle * Math.PI / 180) * 25 - Math.cos(player1.angle * Math.PI / 180) * 5}
                  ${player1.x - Math.cos(player1.angle * Math.PI / 180) * 25 - Math.sin(player1.angle * Math.PI / 180) * 5},
                  ${player1.y - Math.sin(player1.angle * Math.PI / 180) * 25 + Math.cos(player1.angle * Math.PI / 180) * 5}
                `}
                fill="orange"
                opacity={0.7 + Math.random() * 0.3}
              />
            )}
            
            {/* Player 2 */}
            <polygon
              points={renderShip(player2)}
              fill={player2.color}
              stroke="white"
              strokeWidth="1"
            />
            
            {/* Engine flame for player 2 when moving forward */}
            {keysPressed.current['ArrowUp'] && (
              <polygon
                points={`
                  ${player2.x - Math.cos(player2.angle * Math.PI / 180) * 15},
                  ${player2.y - Math.sin(player2.angle * Math.PI / 180) * 15}
                  ${player2.x - Math.cos(player2.angle * Math.PI / 180) * 25 + Math.sin(player2.angle * Math.PI / 180) * 5},
                  ${player2.y - Math.sin(player2.angle * Math.PI / 180) * 25 - Math.cos(player2.angle * Math.PI / 180) * 5}
                  ${player2.x - Math.cos(player2.angle * Math.PI / 180) * 25 - Math.sin(player2.angle * Math.PI / 180) * 5},
                  ${player2.y - Math.sin(player2.angle * Math.PI / 180) * 25 + Math.cos(player2.angle * Math.PI / 180) * 5}
                `}
                fill="orange"
                opacity={0.7 + Math.random() * 0.3}
              />
            )}
            
            {/* Projectiles */}
            {projectiles.map((projectile, index) => (
              <circle
                key={`projectile-${index}`}
                cx={projectile.x}
                cy={projectile.y}
                r={projectile.size}
                fill={projectile.owner === 1 ? "#FF9999" : "#99FF99"}
                opacity={0.8}
              >
                <animate
                  attributeName="opacity"
                  values="0.8;1;0.8"
                  dur="0.3s"
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </svg>
          
          {/* HUD/User Interface */}
          <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-60 p-2 rounded">
            <div className="font-bold" style={{ color: player1.color }}>Player 1</div>
            <div className="flex items-center">
              <div className="mr-2">HP:</div>
              <div className="w-20 h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500" 
                  style={{ width: `${player1.health}%` }}
                ></div>
              </div>
              <div className="ml-2">{player1.health}</div>
            </div>
            <div>Score: {player1.score}</div>
          </div>
          
          <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-60 p-2 rounded">
            <div className="font-bold text-right" style={{ color: player2.color }}>Player 2</div>
            <div className="flex items-center justify-end">
              <div className="mr-2">HP:</div>
              <div className="w-20 h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500" 
                  style={{ width: `${player2.health}%` }}
                ></div>
              </div>
              <div className="ml-2">{player2.health}</div>
            </div>
            <div>Score: {player2.score}</div>
          </div>
          
          {/* Controls reminder */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 bg-opacity-60 p-2 rounded text-xs flex space-x-8">
            <div>
              <span className="text-red-400">P1:</span> WASD + Space
            </div>
            <div>
              <span className="text-green-400">P2:</span> Arrows + Enter
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
