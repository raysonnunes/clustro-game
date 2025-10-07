// COPIE TODO ESTE CÓDIGO PARA O ARQUIVO app.js NO GITHUB

const { useState, useEffect, useCallback } = React;
const { RotateCcw, Trophy, Users, Lock, LogIn, Plus, X, Calendar, Flame, Star } = lucide;

const ROWS = 6;
const COLS = 5;
const COLORS = [
  { color: '#FF0080', symbol: '●' },
  { color: '#00FF00', symbol: '★' },
  { color: '#0080FF', symbol: '■' }
];
const CLEAR_BONUS = 1000;

const ACHIEVEMENTS_LIST = [
  { id: 'first_win', name: 'Primeira Vitória', desc: 'Limpe o tabuleiro pela primeira vez', icon: '🏆', points: 100 },
  { id: 'perfect_game', name: 'Jogo Perfeito', desc: 'Vença com menos de 10 movimentos', icon: '⭐', points: 500 },
  { id: 'streak_3', name: 'Em Chamas', desc: 'Vença 3 dias seguidos', icon: '🔥', points: 300 },
  { id: 'streak_7', name: 'Imparável', desc: 'Vença 7 dias seguidos', icon: '💥', points: 700 },
  { id: 'high_scorer', name: 'Pontuador', desc: 'Faça 3000+ pontos em uma partida', icon: '💯', points: 400 },
  { id: 'speed_demon', name: 'Velocista', desc: 'Vença em menos de 5 movimentos', icon: '⚡', points: 800 }
];

function Clustro() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [users, setUsers] = useState([]);
  const [privateRooms, setPrivateRooms] = useState([]);
  const [showRankings, setShowRankings] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [streak, setStreak] = useState(0);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [achievements, setAchievements] = useState([]);

  const [formData, setFormData] = useState({ email: '', username: '', password: '' });
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);

  const generateDailyChallenge = () => {
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (seed * 9301 + 49297) % 233280;
    const challengeType = random % 3;
    
    const challenges = [
      { type: 'score', target: 2500, desc: 'Faça 2500+ pontos', icon: '🎯' },
      { type: 'moves', target: 12, desc: 'Vença com no máximo 12 movimentos', icon: '🎲' },
      { type: 'clear', target: 1, desc: 'Limpe o tabuleiro completamente', icon: '✨' }
    ];
    
    return { ...challenges[challengeType], date: today, completed: false };
  };

  useEffect(() => {
    setUsers([]);
    setPrivateRooms([]);
    setDailyChallenge(generateDailyChallenge());
  }, []);

  const checkAchievement = (achievementId) => {
    if (!currentUser) return;
    if (achievements.includes(achievementId)) return;
    
    const achievement = ACHIEVEMENTS_LIST.find(a => a.id === achievementId);
    if (achievement) {
      const newAchievements = [...achievements, achievementId];
      setAchievements(newAchievements);
      alert(`🎉 Conquista desbloqueada: ${achievement.name}! +${achievement.points} pontos`);
    }
  };

  const checkDailyChallenge = (finalScore, finalMoves, isVictory) => {
    if (!dailyChallenge || dailyChallenge.completed) return;
    
    let completed = false;
    if (dailyChallenge.type === 'score' && finalScore >= dailyChallenge.target) completed = true;
    if (dailyChallenge.type === 'moves' && isVictory && finalMoves <= dailyChallenge.target) completed = true;
    if (dailyChallenge.type === 'clear' && isVictory) completed = true;
    
    if (completed) {
      setDailyChallenge({ ...dailyChallenge, completed: true });
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      if (newStreak === 3) checkAchievement('streak_3');
      if (newStreak === 7) checkAchievement('streak_7');
      
      alert('🎉 Desafio diário completado! +500 pontos de bônus!');
    }
  };

  const saveToMemory = (usersData, roomsData) => {
    setUsers(usersData);
    setPrivateRooms(roomsData);
  };

  const handleRegister = () => {
    if (!formData.email || !formData.username || !formData.password) {
      alert('Preencha todos os campos!');
      return;
    }
    if (users.find(u => u.username === formData.username)) {
      alert('Nome de usuário já existe!');
      return;
    }
    if (users.find(u => u.email === formData.email)) {
      alert('Email já cadastrado!');
      return;
    }
    const newUser = {
      id: Date.now(),
      email: formData.email,
      username: formData.username,
      password: formData.password,
      scores: [],
      achievements: [],
      streak: 0
    };
    const updatedUsers = [...users, newUser];
    saveToMemory(updatedUsers, privateRooms);
    setCurrentUser(newUser);
    setFormData({ email: '', username: '', password: '' });
    setShowAuth(false);
    alert('Cadastro realizado com sucesso!');
  };

  const handleLogin = () => {
    if (!formData.username || !formData.password) {
      alert('Preencha usuário e senha!');
      return;
    }
    const user = users.find(u => u.username === formData.username && u.password === formData.password);
    if (user) {
      setCurrentUser(user);
      setAchievements(user.achievements || []);
      setStreak(user.streak || 0);
      setShowAuth(false);
      setFormData({ email: '', username: '', password: '' });
    } else {
      alert('Usuário ou senha incorretos!');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAchievements([]);
    setStreak(0);
  };

  const saveScore = (finalScore, finalMoves, isVictory) => {
    const scoreData = {
      score: finalScore,
      moves: finalMoves,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      victory: isVictory
    };
    
    if (currentUser) {
      const updatedUsers = users.map(u => {
        if (u.id === currentUser.id) {
          return { 
            ...u, 
            scores: [...u.scores, scoreData],
            achievements: achievements,
            streak: streak
          };
        }
        return u;
      });
      
      saveToMemory(updatedUsers, privateRooms);
      setCurrentUser({ ...currentUser, scores: [...currentUser.scores, scoreData], achievements, streak });
      
      if (isVictory) {
        const winCount = currentUser.scores.filter(s => s.victory).length;
        if (winCount === 0) checkAchievement('first_win');
        if (finalMoves < 10) checkAchievement('perfect_game');
        if (finalMoves < 5) checkAchievement('speed_demon');
      }
      if (finalScore >= 3000) checkAchievement('high_scorer');
      
      checkDailyChallenge(finalScore, finalMoves, isVictory);
    }
  };

  const createPrivateRoom = () => {
    if (!currentUser) {
      alert('Você precisa estar logado para criar uma sala!');
      return;
    }
    if (!roomName.trim()) return;
    
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newRoom = {
      id: Date.now(),
      name: roomName,
      code: code,
      creator: currentUser.id,
      members: [currentUser.id]
    };
    
    const updatedRooms = [...privateRooms, newRoom];
    saveToMemory(users, updatedRooms);
    setRoomName('');
    setShowCreateRoom(false);
    alert(`Sala criada! Código: ${code}`);
  };

  const joinPrivateRoom = () => {
    if (!currentUser) {
      alert('Você precisa estar logado para entrar em uma sala!');
      return;
    }
    const room = privateRooms.find(r => r.code === roomCode.toUpperCase());
    if (!room) {
      alert('Sala não encontrada!');
      return;
    }
    
    if (room.members.includes(currentUser.id)) {
      alert('Você já está nesta sala!');
      return;
    }
    
    const updatedRooms = privateRooms.map(r => {
      if (r.id === room.id) {
        return { ...r, members: [...r.members, currentUser.id] };
      }
      return r;
    });
    
    saveToMemory(users, updatedRooms);
    setRoomCode('');
    setShowJoinRoom(false);
    alert('Entrou na sala com sucesso!');
  };

  const getGlobalRanking = () => {
    return users
      .map(u => {
        const achievementPoints = (u.achievements && u.achievements.length > 0) ? u.achievements.length * 100 : 0;
        const streakPoints = (u.streak || 0) * 50;
        const scorePoints = u.scores.length > 0 ? u.scores.reduce((acc, s) => acc + s.score, 0) : 0;
        
        return {
          ...u,
          bestScore: u.scores.length > 0 ? Math.max(...u.scores.map(s => s.score)) : 0,
          bestMoves: u.scores.length > 0 ? Math.min(...u.scores.filter(s => s.score > 0).map(s => s.moves)) : 999,
          totalPoints: scorePoints + achievementPoints + streakPoints
        };
      })
      .filter(u => u.bestScore > 0)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);
  };

  const getRoomRanking = (room) => {
    return users
      .filter(u => room.members.includes(u.id))
      .map(u => ({
        ...u,
        bestScore: u.scores.length > 0 ? Math.max(...u.scores.map(s => s.score)) : 0,
        bestMoves: u.scores.length > 0 ? Math.min(...u.scores.filter(s => s.score > 0).map(s => s.moves)) : 999
      }))
      .sort((a, b) => b.bestScore - a.bestScore || a.bestMoves - b.bestMoves);
  };

  const initGrid = useCallback(() => {
    const newGrid = [];
    for (let i = 0; i < ROWS; i++) {
      const row = [];
      for (let j = 0; j < COLS; j++) {
        let colorObj;
        const useNeighbor = Math.random() < 0.35;
        
        if (useNeighbor && j > 0 && row[j - 1]) {
          colorObj = COLORS.find(c => c.color === row[j - 1].color);
        } else if (useNeighbor && i > 0 && newGrid[i - 1][j]) {
          colorObj = COLORS.find(c => c.color === newGrid[i - 1][j].color);
        } else {
          colorObj = COLORS[Math.floor(Math.random() * COLORS.length)];
        }
        
        row.push({
          color: colorObj.color,
          symbol: colorObj.symbol,
          id: `${i}-${j}-${Date.now()}`
        });
      }
      newGrid.push(row);
    }
    return newGrid;
  }, []);

  useEffect(() => {
    setGrid(initGrid());
  }, [initGrid]);

  const findConnectedGroup = (row, col, color, visited = new Set()) => {
    const key = `${row}-${col}`;
    
    if (
      row < 0 || row >= ROWS ||
      col < 0 || col >= COLS ||
      visited.has(key) ||
      !grid[row] || !grid[row][col] ||
      grid[row][col].color !== color
    ) {
      return [];
    }

    visited.add(key);
    const group = [{ row, col }];

    group.push(...findConnectedGroup(row - 1, col, color, visited));
    group.push(...findConnectedGroup(row + 1, col, color, visited));
    group.push(...findConnectedGroup(row, col - 1, color, visited));
    group.push(...findConnectedGroup(row, col + 1, color, visited));

    return group;
  };

  const handleCellClick = (row, col) => {
    if (gameOver || victory || !grid[row] || !grid[row][col]) return;

    const cell = grid[row][col];
    const group = findConnectedGroup(row, col, cell.color);

    if (group.length >= 2) {
      setSelectedGroup(group);
    }
  };

  const removeBlocks = useCallback(() => {
    if (selectedGroup.length < 2) return;

    const newGrid = grid.map(row => [...row]);
    
    selectedGroup.forEach(({ row, col }) => {
      newGrid[row][col] = null;
    });

    applyGravity(newGrid);
    
    const points = selectedGroup.length * selectedGroup.length;
    setScore(prev => prev + points);
    setMoves(prev => prev + 1);
    setSelectedGroup([]);
  }, [selectedGroup, grid]);

  const applyGravity = (newGrid) => {
    for (let col = 0; col < COLS; col++) {
      let emptyRow = ROWS - 1;
      
      for (let row = ROWS - 1; row >= 0; row--) {
        if (newGrid[row][col] !== null) {
          if (row !== emptyRow) {
            newGrid[emptyRow][col] = newGrid[row][col];
            newGrid[row][col] = null;
          }
          emptyRow--;
        }
      }
    }

    let writeCol = COLS - 1;
    for (let col = COLS - 1; col >= 0; col--) {
      let hasBlocks = false;
      for (let row = 0; row < ROWS; row++) {
        if (newGrid[row][col] !== null) {
          hasBlocks = true;
          break;
        }
      }
      
      if (hasBlocks) {
        if (col !== writeCol) {
          for (let row = 0; row < ROWS; row++) {
            newGrid[row][writeCol] = newGrid[row][col];
            newGrid[row][col] = null;
          }
        }
        writeCol--;
      }
    }

    setGrid(newGrid);
    checkGameState(newGrid);
  };

  const checkGameState = (currentGrid) => {
    let hasBlocks = false;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (currentGrid[row][col]) {
          hasBlocks = true;
          break;
        }
      }
      if (hasBlocks) break;
    }

    if (!hasBlocks) {
      const finalScore = score + CLEAR_BONUS;
      setVictory(true);
      setScore(finalScore);
      saveScore(finalScore, moves, true);
      return;
    }

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (currentGrid[row][col]) {
          const color = currentGrid[row][col].color;
          const group = findConnectedGroup(row, col, color);
          if (group.length >= 2) {
            return;
          }
        }
      }
    }
    setGameOver(true);
    saveScore(score, moves, false);
  };

  const resetGame = () => {
    setGrid(initGrid());
    setScore(0);
    setMoves(0);
    setSelectedGroup([]);
    setGameOver(false);
    setVictory(false);
  };

  const isSelected = (row, col) => {
    return selectedGroup.some(cell => cell.row === row && cell.col === col);
  };

  useEffect(() => {
    if (selectedGroup.length >= 2) {
      const timer = setTimeout(removeBlocks, 200);
      return () => clearTimeout(timer);
    }
  }, [selectedGroup, removeBlocks]);

  // Renderização principal do jogo
  return React.createElement('div', { className: 'min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4' },
    React.createElement('div', { className: 'bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 max-w-lg w-full' },
      // Header
      React.createElement('div', { className: 'flex items-center justify-between mb-6' },
        React.createElement('div', null,
          React.createElement('h1', { className: 'text-4xl font-bold text-white mb-1' }, 'Clustro'),
          React.createElement('p', { className: 'text-blue-200 text-sm' },
            currentUser ? `Olá, ${currentUser.username}!` : 'Jogando como visitante'
          )
        ),
        React.createElement('div', { className: 'flex gap-2' },
          React.createElement('button', {
            onClick: () => setShowRankings(true),
            className: 'bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl transition-all'
          }, React.createElement(Trophy, { size: 24 })),
          React.createElement('button', {
            onClick: () => setShowChallenges(true),
            className: 'bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl transition-all'
          }, React.createElement(Target, { size: 24 })),
          React.createElement('button', {
            onClick: resetGame,
            className: 'bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl transition-all'
          }, React.createElement(RotateCcw, { size: 24 })),
          currentUser ? 
            React.createElement('button', {
              onClick: handleLogout,
              className: 'bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl transition-all',
              title: 'Sair'
            }, React.createElement(LogIn, { size: 24, className: 'rotate-180' }))
          :
            React.createElement('button', {
              onClick: () => setShowAuth(true),
              className: 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-4 py-3 rounded-xl transition-all font-bold flex items-center gap-2'
            }, 
              React.createElement(LogIn, { size: 20 }),
              ' Entrar'
            )
        )
      ),
      
      // Score e Moves
      React.createElement('div', { className: 'grid grid-cols-2 gap-4 mb-6' },
        React.createElement('div', { className: 'bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-4' },
          React.createElement('div', { className: 'text-white/80 text-xs mb-1' }, 'Pontuação'),
          React.createElement('div', { className: 'text-3xl font-bold text-white' }, score)
        ),
        React.createElement('div', { className: 'bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl p-4' },
          React.createElement('div', { className: 'text-white/80 text-xs mb-1' }, 'Movimentos'),
          React.createElement('div', { className: 'text-3xl font-bold text-white' }, moves)
        )
      ),
      
      // Vitória
      victory && React.createElement('div', { className: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-xl mb-4 text-center font-bold shadow-lg' },
        React.createElement('div', { className: 'text-2xl mb-2' }, '🎉 VITÓRIA! 🎉'),
        React.createElement('div', { className: 'text-sm' }, `Bônus de limpeza: +${CLEAR_BONUS} pontos`),
        currentUser && React.createElement('div', { className: 'text-xs mt-2' }, 'Pontuação salva no ranking!')
      ),
      
      // Game Over
      gameOver && !victory && React.createElement('div', { className: 'bg-red-500 text-white px-6 py-3 rounded-xl mb-4 text-center font-bold' },
        '😔 Fim de jogo! Não há mais jogadas possíveis'
      ),
      
      // Grid do jogo
      React.createElement('div', { className: 'bg-slate-900 rounded-2xl p-4 shadow-inner' },
        React.createElement('div', {
          className: 'grid gap-2',
          style: { gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`, touchAction: 'manipulation' }
        },
          grid.map((row, rowIndex) =>
            row.map((cell, colIndex) =>
              React.createElement('button', {
                key: `${rowIndex}-${colIndex}`,
                onClick: () => handleCellClick(rowIndex, colIndex),
                className: `aspect-square rounded-xl transition-all transform flex items-center justify-center text-5xl font-bold ${
                  cell
                    ? isSelected(rowIndex, colIndex)
                      ? 'scale-90 ring-4 ring-white shadow-xl'
                      : 'hover:scale-105 active:scale-95 shadow-lg'
                    : ''
                }`,
                style: {
                  backgroundColor: cell ? cell.color : 'transparent',
                  cursor: cell ? 'pointer' : 'default',
                  color: 'rgba(0,0,0,0.3)',
                  textShadow: '0 2px 4px rgba(255,255,255,0.5)'
                },
                disabled: !cell || gameOver || victory
              }, cell && cell.symbol)
            )
          )
        )
      ),
      
      // Info de grupo selecionado
      React.createElement('div', { className: 'mt-4 text-center' },
        selectedGroup.length >= 2 && React.createElement('div', { className: 'text-green-300 text-sm font-semibold' },
          `Grupo: ${selectedGroup.length} blocos = ${selectedGroup.length * selectedGroup.length} pontos`
        )
      )
    )
  );
}

// Renderizar o componente
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Clustro));
