import { useState, useEffect } from 'react';

export default function ElementBattleGame() {
  // Game states
  const [gameState, setGameState] = useState("setup"); // setup, playing, gameOver
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [player1Health, setPlayer1Health] = useState(100);
  const [player2Health, setPlayer2Health] = useState(100);
  const [turnCount, setTurnCount] = useState(1);
  const [gameLog, setGameLog] = useState([]);
  const [winner, setWinner] = useState(null);
  
  // Animation states
  const [isAnimating, setIsAnimating] = useState(false);
  const [player1Damage, setPlayer1Damage] = useState(null);
  const [player2Damage, setPlayer2Damage] = useState(null);
  const [player1Animation, setPlayer1Animation] = useState("");
  const [player2Animation, setPlayer2Animation] = useState("");
  const [damageDisplay1, setDamageDisplay1] = useState(null);
  const [damageDisplay2, setDamageDisplay2] = useState(null);
  
  // Elements and their strengths/weaknesses
  const elements = [
    { 
      name: "Fire", 
      strong: "Air", 
      weak: "Water", 
      emoji: "🔥",
      color: "from-yellow-300 to-red-600",
      attackAnim: "fire-attack"
    },
    { 
      name: "Water", 
      strong: "Fire", 
      weak: "Earth", 
      emoji: "💧",
      color: "from-blue-300 to-blue-600",
      attackAnim: "water-attack"
    },
    { 
      name: "Earth", 
      strong: "Water", 
      weak: "Air", 
      emoji: "🌱",
      color: "from-green-300 to-green-700",
      attackAnim: "earth-attack"
    },
    { 
      name: "Air", 
      strong: "Earth", 
      weak: "Fire", 
      emoji: "💨",
      color: "from-gray-200 to-gray-400",
      attackAnim: "air-attack"
    }
  ];
  
  // Selected elements
  const [player1Element, setPlayer1Element] = useState(null);
  const [player2Element, setPlayer2Element] = useState(null);
  
  // Handle starting the game
  const startGame = () => {
    if (player1Name.trim() === "" || player2Name.trim() === "") {
      alert("Please enter names for both players!");
      return;
    }
    setGameState("playing");
    addToLog(`Game started! ${player1Name} vs ${player2Name}`);
    addToLog(`Turn ${turnCount}: ${player1Name}'s turn to choose an element`);
  };
  
  // Reset game
  const resetGame = () => {
    setGameState("setup");
    setPlayer1Health(100);
    setPlayer2Health(100);
    setCurrentPlayer(1);
    setTurnCount(1);
    setGameLog([]);
    setWinner(null);
    setPlayer1Element(null);
    setPlayer2Element(null);
    setPlayer1Animation("");
    setPlayer2Animation("");
    setDamageDisplay1(null);
    setDamageDisplay2(null);
  };
  
  // Add message to game log
  const addToLog = (message) => {
    setGameLog(prevLog => [...prevLog, message]);
  };
  
  // Handle element selection
  const selectElement = (element) => {
    if (isAnimating) return; // Prevent actions during animations
    
    if (currentPlayer === 1) {
      setPlayer1Element(element);
      setCurrentPlayer(2);
      addToLog(`${player1Name} chose ${element.name} ${element.emoji}`);
      addToLog(`${player2Name}'s turn to choose an element`);
    } else {
      setPlayer2Element(element);
      resolveTurn(player1Element, element);
    }
  };
  
  // Animate damage being taken
  const animateDamage = (damage1to2, damage2to1, p1Element, p2Element) => {
    setIsAnimating(true);
    setPlayer1Damage(damage2to1);
    setPlayer2Damage(damage1to2);
    
    // First attack animation (player 1 -> player 2)
    setTimeout(() => {
      setPlayer2Animation(p1Element.attackAnim);
      
      setTimeout(() => {
        setPlayer2Animation("take-damage");
        setDamageDisplay2(`-${damage1to2}`);
        
        setTimeout(() => {
          setPlayer2Animation("");
          setDamageDisplay2(null);
          
          // Second attack animation (player 2 -> player 1)
          setTimeout(() => {
            setPlayer1Animation(p2Element.attackAnim);
            
            setTimeout(() => {
              setPlayer1Animation("take-damage");
              setDamageDisplay1(`-${damage2to1}`);
              
              setTimeout(() => {
                setPlayer1Animation("");
                setDamageDisplay1(null);
                setIsAnimating(false);
                
                // Check for game over after animations
                checkGameOver();
              }, 800);
            }, 600);
          }, 400);
        }, 800);
      }, 600);
    }, 400);
  };
  
  // Check if game is over
  const checkGameOver = () => {
    const newP1Health = Math.max(0, player1Health - player1Damage);
    const newP2Health = Math.max(0, player2Health - player2Damage);
    
    if (newP1Health <= 0 || newP2Health <= 0) {
      if (newP1Health <= 0 && newP2Health <= 0) {
        setWinner("draw");
        addToLog("It's a draw! Both players have been defeated!");
      } else if (newP1Health <= 0) {
        setWinner(player2Name);
        addToLog(`${player2Name} wins!`);
      } else {
        setWinner(player1Name);
        addToLog(`${player1Name} wins!`);
      }
      setGameState("gameOver");
    } else {
      // Next turn
      setCurrentPlayer(1);
      setTurnCount(prevTurn => prevTurn + 1);
      setPlayer1Element(null);
      setPlayer2Element(null);
      addToLog(`--- Turn ${turnCount + 1} ---`);
      addToLog(`${player1Name}'s turn to choose an element`);
    }
    
    // Update health after animations
    setPlayer1Health(newP1Health);
    setPlayer2Health(newP2Health);
  };
  
  // Resolve a turn after both players have selected elements
  const resolveTurn = (p1Element, p2Element) => {
    let damage1to2 = Math.floor(Math.random() * 15) + 10; // Base damage
    let damage2to1 = Math.floor(Math.random() * 15) + 10; // Base damage
    
    // Apply element advantages
    if (p1Element.strong === p2Element.name) {
      damage1to2 += 10;
      addToLog(`${p1Element.name} ${p1Element.emoji} is strong against ${p2Element.name} ${p2Element.emoji}! +10 damage!`);
    }
    if (p1Element.weak === p2Element.name) {
      damage1to2 -= 5;
      addToLog(`${p1Element.name} ${p1Element.emoji} is weak against ${p2Element.name} ${p2Element.emoji}! -5 damage!`);
    }
    if (p2Element.strong === p1Element.name) {
      damage2to1 += 10;
      addToLog(`${p2Element.name} ${p2Element.emoji} is strong against ${p1Element.name} ${p1Element.emoji}! +10 damage!`);
    }
    if (p2Element.weak === p1Element.name) {
      damage2to1 -= 5;
      addToLog(`${p2Element.name} ${p2Element.emoji} is weak against ${p1Element.name} ${p1Element.emoji}! -5 damage!`);
    }
    
    // Ensure damage isn't negative
    damage1to2 = Math.max(damage1to2, 5);
    damage2to1 = Math.max(damage2to1, 5);
    
    addToLog(`${player2Name} chose ${p2Element.name} ${p2Element.emoji}`);
    addToLog(`${player1Name} dealt ${damage1to2} damage to ${player2Name}!`);
    addToLog(`${player2Name} dealt ${damage2to1} damage to ${player1Name}!`);
    
    // Animate the damage sequence
    animateDamage(damage1to2, damage2to1, p1Element, p2Element);
  };
  
  // Scroll to bottom of game log when it updates
  useEffect(() => {
    const logContainer = document.getElementById("game-log");
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }, [gameLog]);
  
  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto bg-gray-100 rounded-lg p-4">
      <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
        
        @keyframes fire-attack {
          0% { background: radial-gradient(circle, rgba(255,156,0,0) 0%, rgba(255,156,0,0) 100%); }
          50% { background: radial-gradient(circle, rgba(255,156,0,0.8) 0%, rgba(255,0,0,0.4) 70%, rgba(255,0,0,0) 100%); }
          100% { background: radial-gradient(circle, rgba(255,156,0,0) 0%, rgba(255,156,0,0) 100%); }
        }
        
        @keyframes water-attack {
          0% { background: radial-gradient(circle, rgba(0,170,255,0) 0%, rgba(0,170,255,0) 100%); }
          50% { background: radial-gradient(circle, rgba(0,170,255,0.8) 0%, rgba(0,100,255,0.4) 70%, rgba(0,100,255,0) 100%); }
          100% { background: radial-gradient(circle, rgba(0,170,255,0) 0%, rgba(0,170,255,0) 100%); }
        }
        
        @keyframes earth-attack {
          0% { background: radial-gradient(circle, rgba(76,175,80,0) 0%, rgba(76,175,80,0) 100%); }
          50% { background: radial-gradient(circle, rgba(76,175,80,0.8) 0%, rgba(34,139,34,0.4) 70%, rgba(34,139,34,0) 100%); }
          100% { background: radial-gradient(circle, rgba(76,175,80,0) 0%, rgba(76,175,80,0) 100%); }
        }
        
        @keyframes air-attack {
          0% { background: radial-gradient(circle, rgba(224,224,224,0) 0%, rgba(224,224,224,0) 100%); }
          50% { background: radial-gradient(circle, rgba(224,224,224,0.8) 0%, rgba(158,158,158,0.4) 70%, rgba(158,158,158,0) 100%); }
          100% { background: radial-gradient(circle, rgba(224,224,224,0) 0%, rgba(224,224,224,0) 100%); }
        }
        
        @keyframes damage-number {
          0% { opacity: 0; transform: translateY(0); }
          25% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        
        .take-damage {
          animation: shake 0.5s ease-in-out;
        }
        
        .fire-attack {
          animation: fire-attack 1s ease-in-out;
        }
        
        .water-attack {
          animation: water-attack 1s ease-in-out;
        }
        
        .earth-attack {
          animation: earth-attack 1s ease-in-out;
        }
        
        .air-attack {
          animation: air-attack 1s ease-in-out;
        }
        
        .damage-number {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          color: red;
          font-weight: bold;
          font-size: 24px;
          text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;
          animation: damage-number 1.5s ease-out forwards;
        }
        
        .health-bar-transition {
          transition: width 1s ease-in-out;
        }
      `}</style>
      
      <h1 className="text-2xl font-bold text-center mb-4">Element Battle</h1>
      
      {gameState === "setup" && (
        <div className="flex flex-col gap-4">
          <div className="text-center mb-2">
            <p className="text-lg">Enter player names to begin:</p>
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Player 1:</label>
              <input 
                className="w-full px-3 py-2 border rounded-md"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder="Enter name"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Player 2:</label>
              <input 
                className="w-full px-3 py-2 border rounded-md"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Enter name"
              />
            </div>
          </div>
          <button 
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            onClick={startGame}
          >
            Start Game
          </button>
          
          <div className="mt-4 p-4 bg-white rounded-md">
            <h3 className="font-bold mb-2">How to Play:</h3>
            <p className="mb-2">Element Battle is a turn-based game where each player selects an element to attack with.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Each element has strengths and weaknesses</li>
              <li>Fire 🔥 is strong against Air but weak against Water</li>
              <li>Water 💧 is strong against Fire but weak against Earth</li>
              <li>Earth 🌱 is strong against Water but weak against Air</li>
              <li>Air 💨 is strong against Earth but weak against Fire</li>
              <li>The first player to reduce their opponent's health to 0 wins!</li>
            </ul>
          </div>
        </div>
      )}
      
      {gameState === "playing" && (
        <div className="flex flex-col gap-4">
          {/* Player stats & battle arena */}
          <div className="flex justify-between">
            {/* Player 1 card */}
            <div className={`flex-1 bg-blue-100 p-3 rounded-md mr-2 relative ${player1Animation}`}>
              <h3 className="font-bold">{player1Name}</h3>
              <div className="flex items-center mt-1">
                <div className="w-full bg-gray-300 rounded-full h-4">
                  <div 
                    className="bg-green-500 h-4 rounded-full health-bar-transition" 
                    style={{ width: `${player1Health}%` }}
                  ></div>
                </div>
                <span className="ml-2">{player1Health}/100</span>
              </div>
              {player1Element && (
                <div className="mt-2 flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 bg-gradient-to-br ${player1Element.color}`}>
                    <span className="text-lg">{player1Element.emoji}</span>
                  </div>
                  <span>{player1Element.name}</span>
                </div>
              )}
              {damageDisplay1 && (
                <div className="damage-number">{damageDisplay1}</div>
              )}
            </div>
            
            {/* VS */}
            <div className="flex items-center justify-center mx-2">
              <span className="text-xl font-bold">VS</span>
            </div>
            
            {/* Player 2 card */}
            <div className={`flex-1 bg-red-100 p-3 rounded-md ml-2 relative ${player2Animation}`}>
              <h3 className="font-bold">{player2Name}</h3>
              <div className="flex items-center mt-1">
                <div className="w-full bg-gray-300 rounded-full h-4">
                  <div 
                    className="bg-green-500 h-4 rounded-full health-bar-transition" 
                    style={{ width: `${player2Health}%` }}
                  ></div>
                </div>
                <span className="ml-2">{player2Health}/100</span>
              </div>
              {player2Element && (
                <div className="mt-2 flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 bg-gradient-to-br ${player2Element.color}`}>
                    <span className="text-lg">{player2Element.emoji}</span>
                  </div>
                  <span>{player2Element.name}</span>
                </div>
              )}
              {damageDisplay2 && (
                <div className="damage-number">{damageDisplay2}</div>
              )}
            </div>
          </div>
          
          {/* Element selection */}
          <div className="bg-white p-3 rounded-md mt-4">
            <h3 className="font-bold mb-2">
              {currentPlayer === 1 ? player1Name : player2Name}'s turn to select an element:
            </h3>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {elements.map((element) => (
                <button
                  key={element.name}
                  disabled={isAnimating}
                  className={`px-4 py-2 rounded-md transition flex items-center justify-center bg-gradient-to-r ${element.color} text-white font-medium hover:opacity-90 disabled:opacity-50`}
                  onClick={() => selectElement(element)}
                >
                  <span className="text-lg mr-2">{element.emoji}</span>
                  {element.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Game log */}
          <div className="mt-4">
            <h3 className="font-bold mb-1">Battle Log:</h3>
            <div 
              id="game-log"
              className="bg-white border border-gray-300 rounded-md p-2 h-40 overflow-y-auto text-sm"
            >
              {gameLog.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
            </div>
          </div>
          
          {/* Turn indicator */}
          <div className="mt-2 bg-yellow-100 p-2 rounded-md text-center">
            <span className="font-medium">Turn {turnCount}</span>
            {isAnimating && <span className="ml-2 animate-pulse">⚔️ Battle in progress!</span>}
          </div>
        </div>
      )}
      
      {gameState === "gameOver" && (
        <div className="flex flex-col gap-4">
          <div className="text-center p-6 bg-yellow-100 rounded-md">
            <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
            {winner === "draw" ? (
              <p className="text-lg">It's a draw! Both players have been defeated.</p>
            ) : (
              <div>
                <p className="text-lg mb-2">🎉 <span className="font-bold text-xl">{winner}</span> wins! 🎉</p>
                <div className="p-2 bg-white rounded-md inline-block">
                  <span className="text-4xl">🏆</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Final stats */}
          <div className="flex justify-between mt-2">
            <div className="flex-1 bg-blue-100 p-3 rounded-md mr-2">
              <h3 className="font-bold">{player1Name}</h3>
              <div className="flex items-center mt-1">
                <div className="w-full bg-gray-300 rounded-full h-4">
                  <div 
                    className="bg-green-500 h-4 rounded-full" 
                    style={{ width: `${player1Health}%` }}
                  ></div>
                </div>
                <span className="ml-2">{player1Health}/100</span>
              </div>
            </div>
            <div className="flex-1 bg-red-100 p-3 rounded-md ml-2">
              <h3 className="font-bold">{player2Name}</h3>
              <div className="flex items-center mt-1">
                <div className="w-full bg-gray-300 rounded-full h-4">
                  <div 
                    className="bg-green-500 h-4 rounded-full" 
                    style={{ width: `${player2Health}%` }}
                  ></div>
                </div>
                <span className="ml-2">{player2Health}/100</span>
              </div>
            </div>
          </div>
          
          {/* Game log */}
          <div className="mt-4">
            <h3 className="font-bold mb-1">Battle Log:</h3>
            <div 
              className="bg-white border border-gray-300 rounded-md p-2 h-40 overflow-y-auto text-sm"
            >
              {gameLog.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
            </div>
          </div>
          
          <button 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            onClick={resetGame}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}