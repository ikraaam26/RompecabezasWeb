'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '../../../lib/supabase';
import { Clock, Shuffle, Play, RotateCcw, Trophy, EyeOff, Eye } from 'lucide-react';

export default function PuzzleGame() {
  const searchParams = useSearchParams();
  const imageId = searchParams.get('imagen');
  const router = useRouter();
  const [imageInfo, setImageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [difficulty, setDifficulty] = useState('3x3');
  const [pieces, setPieces] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [showReference, setShowReference] = useState(true);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const timerRef = useRef(null);
  const puzzleContainerRef = useRef(null);
  const [user, setUser] = useState(null);

  // Cargar la imagen y el usuario al inicio
  useEffect(() => {
    const fetchImageAndUser = async () => {
      setLoading(true);
      
      try {
        // Obtener información de la imagen
        if (imageId) {
          const { data: imageData, error: imageError } = await supabase
            .from('imagenesrompecabezas')
            .select('*')
            .eq('idimagen', imageId)
            .single();
            
          if (imageError) throw imageError;
          if (imageData) setImageInfo(imageData);
        }
        
        // Obtener usuario actual
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        
        if (authUser) {
          // Obtener detalles del usuario
          const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', authUser.id)
            .single();
            
          if (userError) throw userError;
          setUser(userData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos. Por favor, intente de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchImageAndUser();
  }, [imageId]);

  // Crear piezas del rompecabezas basado en la dificultad
  const createPuzzlePieces = () => {
    if (!imageInfo) return [];
    
    const [rows, cols] = difficulty.split('x').map(Number);
    const totalPieces = rows * cols;
    const newPieces = [];
    
    for (let i = 0; i < totalPieces; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      
      newPieces.push({
        id: i,
        correctPosition: i,
        currentPosition: i,
        row,
        col,
        selected: false
      });
    }
    
    return newPieces;
  };

  // Función mejorada para mezclar las piezas
  const shufflePieces = () => {
    if (!pieces.length) return;
    
    const shuffled = [...pieces];
    let currentIndex = shuffled.length;
    
    while (currentIndex > 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      
      // Intercambiar posiciones actuales entre dos piezas
      const tempCurrentPos = shuffled[currentIndex].currentPosition;
      shuffled[currentIndex].currentPosition = shuffled[randomIndex].currentPosition;
      shuffled[randomIndex].currentPosition = tempCurrentPos;
    }
    
    // Asegurarse de que el puzzle sea resoluble
    const [rows, cols] = difficulty.split('x').map(Number);
    const inversions = countInversions(shuffled);
    
    // Para un puzzle NxN, con N par, el número de inversiones debe ser par si la fila vacía
    // (que no tenemos en este caso) está en una posición par desde abajo
    if (inversions % 2 !== 0) {
      // Si es impar, intercambiar las dos primeras piezas para hacerlo resoluble
      if (shuffled.length > 1) {
        const temp = shuffled[0].currentPosition;
        shuffled[0].currentPosition = shuffled[1].currentPosition;
        shuffled[1].currentPosition = temp;
      }
    }
    
    // Asegurarse de que el puzzle no esté ya resuelto
    const isAlreadySolved = shuffled.every(piece => piece.currentPosition === piece.correctPosition);
    if (isAlreadySolved) {
      // Si está resuelto, intercambiar dos piezas aleatorias
      const idx1 = Math.floor(Math.random() * shuffled.length);
      let idx2 = Math.floor(Math.random() * shuffled.length);
      // Asegurarse de que idx2 sea diferente de idx1
      while (idx2 === idx1) {
        idx2 = Math.floor(Math.random() * shuffled.length);
      }
      
      const temp = shuffled[idx1].currentPosition;
      shuffled[idx1].currentPosition = shuffled[idx2].currentPosition;
      shuffled[idx2].currentPosition = temp;
    }
    
    // Desactivar cualquier selección previa
    shuffled.forEach(piece => piece.selected = false);
    setSelectedPiece(null);
    
    setPieces(shuffled);
  };

  // Contar inversiones para verificar si un puzzle es resoluble
  const countInversions = (pieces) => {
    let inversions = 0;
    for (let i = 0; i < pieces.length - 1; i++) {
      for (let j = i + 1; j < pieces.length; j++) {
        if (pieces[i].currentPosition > pieces[j].currentPosition) {
          inversions++;
        }
      }
    }
    return inversions;
  };

  // Iniciar el juego
  const startGame = () => {
    const newPieces = createPuzzlePieces();
    setPieces(newPieces);
    setGameStarted(false);
    setGameCompleted(false);
    setMoves(0);
    setTime(0);
    setSelectedPiece(null);
    
    // Limpiar el temporizador existente
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Un pequeño retraso para permitir que se renderice antes de mezclar
    setTimeout(() => {
      const shuffledPieces = [...newPieces];
      
      // Mezclar las piezas
      let currentIndex = shuffledPieces.length;
      while (currentIndex > 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        
        const tempCurrentPos = shuffledPieces[currentIndex].currentPosition;
        shuffledPieces[currentIndex].currentPosition = shuffledPieces[randomIndex].currentPosition;
        shuffledPieces[randomIndex].currentPosition = tempCurrentPos;
      }
      
      // Asegurarse de que el puzzle sea resoluble
      const inversions = countInversions(shuffledPieces);
      if (inversions % 2 !== 0 && shuffledPieces.length > 1) {
        const temp = shuffledPieces[0].currentPosition;
        shuffledPieces[0].currentPosition = shuffledPieces[1].currentPosition;
        shuffledPieces[1].currentPosition = temp;
      }
      
      setPieces(shuffledPieces);
      setGameStarted(true);
      
      // Iniciar cronómetro
      timerRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }, 100);
  };

  // Reiniciar el juego
  const resetGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setGameStarted(false);
    setGameCompleted(false);
    setMoves(0);
    setTime(0);
    setPieces([]);
    setSelectedPiece(null);
  };

  // Manejar cambio de dificultad
  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
    if (gameStarted) {
      resetGame();
    }
  };

  // Verificar si el juego está completado
  useEffect(() => {
    if (!gameStarted || pieces.length === 0) return;
    
    const isCompleted = pieces.every(piece => piece.currentPosition === piece.correctPosition);
    
    if (isCompleted && !gameCompleted) {
      setGameCompleted(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      saveGameResults();
    }
  }, [pieces, gameStarted]);

  // Limpiar el temporizador al desmontar el componente
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Guardar resultados del juego
  const saveGameResults = async () => {
    if (!user || !imageInfo) return;
    
    try {
      // Calcular puntuación basada en dificultad, tiempo y movimientos
      const difficultyMultiplier = difficulty === '3x3' ? 1 : difficulty === '4x4' ? 2 : 3;
      const timeBonus = Math.max(300 - time, 50); // Bonificación por tiempo (máximo 300 segundos)
      const movesBonus = Math.max(500 - moves * 2, 100); // Penalización por movimientos
      const score = Math.round((timeBonus + movesBonus) * difficultyMultiplier);
      
      // Monedas ganadas (un porcentaje de la puntuación)
      const coins = Math.round(score * 0.1);
      
      // Guardar la partida
      const { error: gameError } = await supabase
        .from('partidas')
        .insert({
          idusuario: user.id,
          idimagen: imageInfo.idimagen,
          tamañorompecabezas: difficulty,
          tiempojugado: time,
          movimientos: moves,
          puntaje: score,
          monedas: coins
        });
      
      if (gameError) throw gameError;
      
      // Actualizar totales del usuario
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          totalpuntos: user.totalpuntos + score,
          totalmonedas: user.totalmonedas + coins
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      // Actualizar el estado del usuario local
      setUser({
        ...user,
        totalpuntos: user.totalpuntos + score,
        totalmonedas: user.totalmonedas + coins
      });
      
    } catch (err) {
      console.error('Error saving game results:', err);
      setError('Error al guardar los resultados.');
    }
  };

  // Manejar el movimiento de una pieza - versión mejorada
  const handlePieceClick = (pieceId) => {
    if (!gameStarted || gameCompleted) return;
    
    // Si no hay pieza seleccionada, seleccionar esta
    if (selectedPiece === null) {
      setSelectedPiece(pieceId);
      setPieces(prevPieces => 
        prevPieces.map(piece => 
          piece.id === pieceId 
            ? { ...piece, selected: true } 
            : piece
        )
      );
      return;
    }
    
    // Si se hace clic en la misma pieza seleccionada, deseleccionarla
    if (selectedPiece === pieceId) {
      setSelectedPiece(null);
      setPieces(prevPieces => 
        prevPieces.map(piece => 
          piece.id === pieceId 
            ? { ...piece, selected: false } 
            : piece
        )
      );
      return;
    }
    
    // Intercambiar piezas y aumentar el contador de movimientos
    setMoves(prevMoves => prevMoves + 1);
    
    setPieces(prevPieces => {
      const newPieces = [...prevPieces];
      const firstPieceIndex = newPieces.findIndex(p => p.id === selectedPiece);
      const secondPieceIndex = newPieces.findIndex(p => p.id === pieceId);
      
      if (firstPieceIndex !== -1 && secondPieceIndex !== -1) {
        // Guardar posición temporal
        const tempPos = newPieces[firstPieceIndex].currentPosition;
        
        // Intercambiar posiciones
        newPieces[firstPieceIndex].currentPosition = newPieces[secondPieceIndex].currentPosition;
        newPieces[secondPieceIndex].currentPosition = tempPos;
        
        // Resetear selección
        newPieces[firstPieceIndex].selected = false;
      }
      
      return newPieces;
    });
    
    // Resetear la selección
    setSelectedPiece(null);
  };

  // Formatear tiempo en minutos:segundos
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Renderizar pieza del rompecabezas - versión mejorada
  const renderPuzzlePiece = (piece) => {
    if (!imageInfo) return null;
    
    const [rows, cols] = difficulty.split('x').map(Number);
    const correctRow = Math.floor(piece.correctPosition / cols);
    const correctCol = piece.correctPosition % cols;
    
    // Cálculo para posicionamiento de la imagen dentro de la pieza
    const pieceWidth = 100 / cols;
    const pieceHeight = 100 / rows;
    
    // Calcular posición actual de la pieza
    const currentRow = Math.floor(piece.currentPosition / cols);
    const currentCol = piece.currentPosition % cols;
    
    const style = {
      position: 'absolute',
      width: `${pieceWidth}%`,
      height: `${pieceHeight}%`,
      top: `${currentRow * pieceHeight}%`,
      left: `${currentCol * pieceWidth}%`,
      backgroundImage: `url(${imageInfo.imagenurl})`,
      backgroundPosition: `${correctCol * 100 / (cols - 1)}% ${correctRow * 100 / (rows - 1)}%`,
      backgroundSize: `${cols * 100}% ${rows * 100}%`,
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: piece.selected ? '0 0 0 2px #ff6b6b, 0 0 15px rgba(255, 107, 107, 0.5)' : 'none',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      zIndex: piece.selected ? 10 : 1,
    };
    
    return (
      <div
        key={piece.id}
        className={`puzzle-piece ${piece.selected ? 'selected' : ''}`}
        style={style}
        onClick={() => handlePieceClick(piece.id)}
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        <p className="mt-4 text-purple-300">Cargando rompecabezas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="bg-red-900/30 p-4 rounded-lg max-w-md">
          <p className="text-red-300">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 bg-purple-700 hover:bg-purple-600 text-white py-2 px-4 rounded"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (!imageInfo) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="bg-purple-900/30 p-4 rounded-lg max-w-md">
          <p className="text-purple-300">No se encontró la imagen seleccionada.</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 bg-purple-700 hover:bg-purple-600 text-white py-2 px-4 rounded"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-300">
          Rompecabezas: {imageInfo.nombre}
        </h1>
        
        {/* Controles del juego */}
        <div className="bg-purple-900/20 backdrop-blur-lg p-6 rounded-xl mb-8 border border-purple-700">
          <div className="flex flex-wrap gap-4 justify-between">
            <div className="flex items-center gap-4">
              <label htmlFor="difficulty" className="text-sm font-semibold text-purple-300">
                Dificultad:
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={handleDifficultyChange}
                disabled={gameStarted && !gameCompleted}
                className="bg-purple-950 text-white border border-purple-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="3x3">Fácil (3x3)</option>
                <option value="4x4">Medio (4x4)</option>
                <option value="5x5">Difícil (5x5)</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              {!gameStarted ? (
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  <Play size={18} /> Iniciar
                </button>
              ) : (
                <>
                  <button
                    onClick={shufflePieces}
                    disabled={gameCompleted}
                    className={`flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-2 px-4 rounded transition duration-300 ${gameCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Shuffle size={18} /> Mezclar
                  </button>
                  <button
                    onClick={resetGame}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-2 px-4 rounded transition duration-300"
                  >
                    <RotateCcw size={18} /> Reiniciar
                  </button>
                </>
              )}
              
              <button
                onClick={() => setShowReference(!showReference)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                {showReference ? <EyeOff size={18} /> : <Eye size={18} />} 
                {showReference ? 'Ocultar referencia' : 'Mostrar referencia'}
              </button>
            </div>
          </div>
          
          {gameStarted && (
            <div className="flex justify-center mt-4 gap-8">
              <div className="flex items-center gap-2 text-lg">
                <Clock className="text-purple-300" />
                <span className="font-mono">{formatTime(time)}</span>
              </div>
              <div className="flex items-center gap-2 text-lg">
                <Shuffle className="text-purple-300" />
                <span className="font-mono">{moves} movimientos</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Área de juego */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Imagen de referencia */}
          {showReference && (
            <div className="md:w-1/3">
              <div className="bg-purple-900/20 backdrop-blur-lg p-4 rounded-xl border border-purple-700">
                <h3 className="text-lg font-semibold mb-2 text-purple-300">Imagen de referencia</h3>
                <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                  <img 
                    src={imageInfo.imagenurl} 
                    alt={imageInfo.nombre}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Área del rompecabezas */}
          <div className={`${showReference ? 'md:w-2/3' : 'w-full'}`}>
            <div className="bg-purple-900/20 backdrop-blur-lg p-4 rounded-xl border border-purple-700">
              <h3 className="text-lg font-semibold mb-2 text-purple-300">Rompecabezas</h3>
              
              {gameCompleted ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black/40">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/70 backdrop-blur-sm z-20">
                    <Trophy className="w-16 h-16 text-yellow-400 mb-4" />
                    <h2 className="text-2xl font-bold mb-2 text-purple-200">¡Felicidades!</h2>
                    <p className="text-lg text-purple-300 mb-4">Has completado el rompecabezas</p>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="bg-purple-900/40 p-3 rounded-lg">
                        <p className="text-sm text-purple-300">Tiempo</p>
                        <p className="text-xl font-bold">{formatTime(time)}</p>
                      </div>
                      <div className="bg-purple-900/40 p-3 rounded-lg">
                        <p className="text-sm text-purple-300">Movimientos</p>
                        <p className="text-xl font-bold">{moves}</p>
                      </div>
                      <div className="bg-purple-900/40 p-3 rounded-lg">
                        <p className="text-sm text-purple-300">Dificultad</p>
                        <p className="text-xl font-bold">{difficulty}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => router.push('/')}
                        className="bg-purple-700 hover:bg-purple-600 text-white py-2 px-4 rounded"
                      >
                        Volver al inicio
                      </button>
                      <button
                        onClick={resetGame}
                        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 px-4 rounded transition duration-300"
                      >
                        Jugar de nuevo
                      </button>
                    </div>
                  </div>
                  <img 
                    src={imageInfo.imagenurl} 
                    alt={imageInfo.nombre}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div 
                  ref={puzzleContainerRef}
                  className="relative aspect-square w-full overflow-hidden rounded-lg bg-black/40"
                >
                  {!gameStarted ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-6">
                        <p className="text-lg text-purple-300 mb-4">Selecciona la dificultad y pulsa "Iniciar" para comenzar</p>
                        <button
                          onClick={startGame}
                          className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-2 px-4 rounded transition duration-300"
                        >
                          <Play className="inline mr-2" size={18} /> Iniciar juego
                        </button>
                      </div>
                    </div>
                  ) : (
                    pieces.map(piece => renderPuzzlePiece(piece))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}