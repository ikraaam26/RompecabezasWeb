'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Puzzle({ imageUrl, nombre, idImagen }) {
  const puzzleRef = useRef(null);
  const [puzzleSize, setPuzzleSize] = useState(3);
  const [croppedImages, setCroppedImages] = useState([]);
  const [positions, setPositions] = useState([]);
  const [originalPositions, setOriginalPositions] = useState([]);
  const [puzzleComplete, setPuzzleComplete] = useState(false);
  
  // Nuevas características
  const [isLoading, setIsLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [points, setPoints] = useState(0);
  const [coins, setCoins] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showReferenceImg, setShowReferenceImg] = useState(false);

  // Iniciar el temporizador cuando se carga el puzzle
  useEffect(() => {
    let interval;
    
    if (timerActive) {
      interval = setInterval(() => {
        setTimer(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  useEffect(() => {
    if (!imageUrl) return;
    loadPuzzle();
  }, [imageUrl, puzzleSize]);

  const loadPuzzle = async () => {
    setIsLoading(true);
    setPuzzleComplete(false);
    setTimer(0);
    setMoveCount(0);
    setTimerActive(false);
    
    const image = new Image();
    image.crossOrigin = 'Anonymous'; // Por seguridad
    image.onload = () => {
      const pieces = cropImage(image, puzzleSize);
      const total = pieces.length;
      const ordered = [...Array(total).keys()];
      const shuffled = shuffle([...ordered]);
      setOriginalPositions(ordered);
      setCroppedImages(pieces);
      setPositions(shuffled);
      setIsLoading(false);
      setTimerActive(true); // Iniciar el temporizador cuando el puzzle esté listo
    };
    image.src = imageUrl;
  };

  const cropImage = (image, size) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const s = Math.min(image.width, image.height);
    canvas.width = s;
    canvas.height = s;
    ctx.drawImage(image, (image.width - s) / 2, (image.height - s) / 2, s, s, 0, 0, s, s);
    const blockSize = s / size;
    const pieces = [];

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const pieceCanvas = document.createElement('canvas');
        const pieceCtx = pieceCanvas.getContext('2d');
        pieceCanvas.width = blockSize;
        pieceCanvas.height = blockSize;
        pieceCtx.drawImage(canvas, x * blockSize, y * blockSize, blockSize, blockSize, 0, 0, blockSize, blockSize);
        pieces.push(pieceCanvas.toDataURL());
      }
    }

    return pieces;
  };

  const shuffle = (array) => {
    const shuffled = array.slice();
    do {
      for (let i = shuffled.length - 2; i > 0; i--) {
        const j = Math.floor(Math.random() * (shuffled.length - 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    } while (!isSolvable(shuffled));
    return shuffled;
  };

  // Función mejorada para comprobar si un puzzle es resoluble
  const isSolvable = (arr) => {
    // Para puzzles con tamaño impar, solo importa la paridad de inversiones
    // Para puzzles con tamaño par, importa la paridad de inversiones + la fila del espacio en blanco
    
    // Calculamos inversiones (cuando un número mayor precede a uno menor)
    let inversions = 0;
    const noBlank = arr.filter(x => x !== arr.length - 1);
    
    for (let i = 0; i < noBlank.length; i++) {
      for (let j = i + 1; j < noBlank.length; j++) {
        if (noBlank[i] > noBlank[j]) inversions++;
      }
    }
    
    // Para tamaños pares, añadimos la fila del espacio en blanco al número de inversiones
    if (puzzleSize % 2 === 0) {
      const blankIndex = arr.indexOf(arr.length - 1);
      const blankRow = Math.floor(blankIndex / puzzleSize);
      inversions += blankRow;
    }
    
    // El puzzle es resoluble si el número de inversiones es par
    return inversions % 2 === 0;
  };

  const isAdjacent = (i, j) => {
    const row1 = Math.floor(i / puzzleSize);
    const col1 = i % puzzleSize;
    const row2 = Math.floor(j / puzzleSize);
    const col2 = j % puzzleSize;
    return (row1 === row2 && Math.abs(col1 - col2) === 1) || (col1 === col2 && Math.abs(row1 - row2) === 1);
  };

  const handleClick = (i) => {
    if (puzzleComplete || isLoading) return;
    
    const emptyIndex = positions.indexOf(croppedImages.length - 1);
    if (isAdjacent(i, emptyIndex)) {
      const newPositions = [...positions];
      [newPositions[i], newPositions[emptyIndex]] = [newPositions[emptyIndex], newPositions[i]];
      setPositions(newPositions);
      setMoveCount(prev => prev + 1);
      checkCompletion(newPositions);
    }
  };

  const checkCompletion = (current) => {
    for (let i = 0; i < current.length; i++) {
      if (current[i] !== i) return;
    }
    // Puzzle completado!
    setPuzzleComplete(true);
    setTimerActive(false);
    calculateRewards();
  };

  const calculateRewards = () => {
    // Calcular puntos basados en tiempo, movimientos y dificultad
    const difficultyFactor = puzzleSize * puzzleSize; // 9, 16, o 25
    
    // Fórmula para calcular puntos
    // Base de puntos por completar según dificultad
    const basePoints = difficultyFactor * 50;
    
    // Penalización por tiempo (menos puntos cuanto más tiempo)
    const timeMultiplier = Math.max(0.1, 1 - (timer / (difficultyFactor * 60)) * 0.5);
    
    // Penalización por movimientos excesivos
    const expectedMoves = difficultyFactor * 3; // Movimientos esperados
    const moveMultiplier = Math.max(0.2, 1 - ((moveCount - expectedMoves) / expectedMoves) * 0.3);
    
    // Cálculo final de puntos
    const finalPoints = Math.round(basePoints * timeMultiplier * moveMultiplier);
    
    // Monedas son un porcentaje de los puntos
    const finalCoins = Math.round(finalPoints / 10);
    
    setPoints(finalPoints);
    setCoins(finalCoins);
    
    // Guardar en la base de datos
    saveGameData(finalPoints, finalCoins);
  };

  const saveGameData = async (finalPoints, finalCoins) => {
    try {
      setSaving(true);
      
      // 1. Obtener el usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('No se pudo obtener el usuario');
      }
      
      // 2. Guardar la partida en la tabla Partidas
      const { error: partidaError } = await supabase
        .from('Partidas')
        .insert({
          IdUsuario: user.id,
          IdImagen: idImagen,
          TamañoRompecabezas: `${puzzleSize}x${puzzleSize}`,
          TiempoJugado: timer,
          Movimientos: moveCount,
          Puntaje: finalPoints,
          Monedas: finalCoins
        });
      
      if (partidaError) {
        throw new Error(`Error al guardar partida: ${partidaError.message}`);
      }
      
      // 3. Actualizar puntos y monedas del usuario
      const { error: updateError } = await supabase
        .from('Usuarios')
        .update({
          TotalPuntos: supabase.rpc('increment', { x: finalPoints }),
          TotalMonedas: supabase.rpc('increment', { x: finalCoins })
        })
        .eq('Id', user.id);
      
      if (updateError) {
        throw new Error(`Error al actualizar usuario: ${updateError.message}`);
      }
      
      setSaving(false);
    } catch (error) {
      setSaving(false);
      setSaveError(error instanceof Error ? error.message : 'Error al guardar los datos');
      console.error('Error al guardar datos:', error);
    }
  };

  // Formatear tiempo (segundos a MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sizeClass = {
    3: 'grid-cols-3 w-[300px]',
    4: 'grid-cols-4 w-[320px]',
    5: 'grid-cols-5 w-[350px]',
  }[puzzleSize];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto rounded-xl bg-gray-900 p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-cyan-400">{nombre}</h2>

      <div className="flex flex-col md:flex-row justify-center items-center gap-8 w-full">
        {/* Panel izquierdo - Controles y estadísticas */}
        <div className="flex flex-col gap-4 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <label className="text-white">Dificultad:</label>
            <select
              value={puzzleSize}
              onChange={(e) => setPuzzleSize(Number(e.target.value))}
              className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
            >
              <option value={3}>3x3</option>
              <option value={4}>4x4</option>
              <option value={5}>5x5</option>
            </select>
          </div>

          <button
            onClick={loadPuzzle}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors font-medium"
          >
            Reiniciar
          </button>

          <button
            onClick={() => setShowReferenceImg(prev => !prev)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors font-medium"
          >
            {showReferenceImg ? 'Ocultar Referencia' : 'Mostrar Referencia'}
          </button>
          
          {/* Estadísticas */}
          <div className="space-y-2 mt-2">
            <div className="flex justify-between text-white">
              <span>Tiempo:</span>
              <span className="font-mono">{formatTime(timer)}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Movimientos:</span>
              <span>{moveCount}</span>
            </div>
          </div>
          
          {/* Imagen de referencia (condicional) */}
          {showReferenceImg && (
            <div className="mt-4">
              <div className="text-sm text-gray-300 mb-2">Imagen de referencia:</div>
              <div 
                className="bg-black rounded-md overflow-hidden"
                style={{
                  width: '150px',
                  height: '150px',
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            </div>
          )}
        </div>

        {/* Panel derecho - Puzzle */}
        <div className="flex flex-col items-center">
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px] w-[300px] bg-gray-800">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
          ) : (
            <div
              ref={puzzleRef}
              className={`grid ${sizeClass} gap-1 bg-gray-800 p-1 rounded-md shadow-xl`}
              style={{ aspectRatio: '1 / 1' }}
            >
              {positions.map((pos, i) => (
                <div
                  key={i}
                  onClick={() => handleClick(i)}
                  className={`relative cursor-pointer transition-all duration-200 hover:scale-[0.97] ${
                    pos === croppedImages.length - 1 ? 'bg-gray-900' : ''
                  }`}
                  style={{
                    backgroundImage: pos !== croppedImages.length - 1 ? `url(${croppedImages[pos]})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '100%',
                    paddingBottom: '100%',
                    boxShadow: pos !== croppedImages.length - 1 ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
                    borderRadius: '4px'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pantalla de completado */}
      {puzzleComplete && (
        <div className="bg-green-900/80 p-6 rounded-lg mt-4 text-center w-full max-w-md">
          <div className="text-green-300 text-2xl font-bold mb-4">
            🎉 ¡Felicidades! Has completado el puzzle.
          </div>
          
          <div className="flex flex-col gap-3 text-white">
            <div className="flex justify-between border-b border-green-700 pb-2">
              <span>Tiempo:</span>
              <span className="font-mono">{formatTime(timer)}</span>
            </div>
            <div className="flex justify-between border-b border-green-700 pb-2">
              <span>Movimientos:</span>
              <span>{moveCount}</span>
            </div>
            <div className="flex justify-between border-b border-green-700 pb-2">
              <span>Puntos ganados:</span>
              <span className="font-bold text-yellow-300">{points}</span>
            </div>
            <div className="flex justify-between">
              <span>Monedas ganadas:</span>
              <span className="font-bold text-yellow-400">💰 {coins}</span>
            </div>
          </div>
          
          {saving && (
            <div className="mt-4 text-gray-300">
              <div className="animate-pulse">Guardando resultados...</div>
            </div>
          )}
          
          {saveError && (
            <div className="mt-4 text-red-400 text-sm">
              {saveError}
            </div>
          )}
          
          <button
            onClick={loadPuzzle}
            className="mt-6 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-medium w-full"
          >
            Jugar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}