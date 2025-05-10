"use client"

import { useEffect, useState, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Gamepad2, Search, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RompecabezasDisponibles() {
  const [imagenes, setImagenes] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [indiceActual, setIndiceActual] = useState(0);
  const carruselRef = useRef(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const elementosPorVista = 3;
  const router = useRouter();

  useEffect(() => {
    const fetchImagenes = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('imagenesrompecabezas')
          .select('*')
          .order('fechasubida', { ascending: false });

        if (error) {
          throw error;
        }

        setImagenes(data || []);
      } catch (err) {
        console.error('Error al obtener imágenes:', err);
        setError('No se pudieron cargar los rompecabezas. Intente nuevamente más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchImagenes();
  }, []);

  // Memoizar las imágenes filtradas para evitar recálculos innecesarios
  const imagenesFiltradas = useMemo(() => {
    return imagenes.filter(img =>
      img.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
    );
  }, [imagenes, filtroNombre]);

  // Ajustar el índice cuando cambia el filtro o se cargan nuevos datos
  useEffect(() => {
    const maxIndice = Math.max(0, imagenesFiltradas.length - elementosPorVista);
    if (indiceActual > maxIndice) {
      setIndiceActual(maxIndice);
    }
  }, [filtroNombre, imagenesFiltradas.length, indiceActual]);

  const navegarCarrusel = (direccion) => {
    if (isTransitioning || imagenesFiltradas.length <= elementosPorVista) return;

    setIsTransitioning(true);

    const maxIndice = Math.max(0, imagenesFiltradas.length - elementosPorVista);
    let nuevoIndice;
    
    if (direccion === 'siguiente') {
      nuevoIndice = Math.min(indiceActual + elementosPorVista, maxIndice);
    } else {
      nuevoIndice = Math.max(indiceActual - elementosPorVista, 0);
    }

    setIndiceActual(nuevoIndice);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const puedeRetroceder = indiceActual > 0;
  const puedeAvanzar = indiceActual < imagenesFiltradas.length - elementosPorVista;

  const irAJugar = (idImagen) => {
    router.push(`/juego/${idImagen}`);
  };

  // Calcular el número de páginas para los indicadores
  const numeroPaginas = Math.ceil(imagenesFiltradas.length / elementosPorVista);
  const paginaActual = Math.floor(indiceActual / elementosPorVista);

  // Manejar error en la carga de imágenes
  const handleImageError = (e) => {
    e.target.src = "/api/placeholder/400/300";
    e.target.alt = "Imagen no disponible";
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-800 rounded-2xl overflow-hidden shadow-2xl border border-purple-500/30">
      {/* Header con animación */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        {/* Partículas decorativas */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-4 left-12 w-4 h-4 bg-yellow-300 rounded-full animate-pulse opacity-70"></div>
          <div className="absolute top-10 left-32 w-2 h-2 bg-cyan-300 rounded-full animate-ping opacity-50"></div>
          <div className="absolute top-16 right-24 w-3 h-3 bg-pink-400 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute bottom-5 right-10 w-2 h-2 bg-green-300 rounded-full animate-ping opacity-50"></div>
        </div>
        
        <h2 className="text-2xl font-bold flex items-center mb-5 text-white relative z-10">
          <div className="bg-purple-700 p-3 rounded-xl shadow-lg mr-3 flex items-center justify-center">
            <Gamepad2 className="text-cyan-300" size={24} />
          </div>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-pink-300">
            Rompecabezas Mágicos
          </span>
          <Sparkles className="ml-2 text-yellow-300" size={18} />
        </h2>

        {/* Barra de búsqueda */}
        <div className="relative z-10">
          <input
            type="text"
            placeholder="Buscar rompecabezas..."
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            className="bg-indigo-900/50 backdrop-blur-sm rounded-xl pl-10 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full text-white placeholder-indigo-300 border border-indigo-600/50 shadow-lg"
            aria-label="Buscar rompecabezas por nombre"
          />
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400" />
        </div>
      </div>

      {/* Carrusel de rompecabezas */}
      <div className="p-6 pt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-cyan-300 flex items-center">
            {isLoading ? 'Cargando aventuras...' : `Explora rompecabezas (${imagenesFiltradas.length})`}
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={() => navegarCarrusel('anterior')} 
              disabled={!puedeRetroceder || isLoading}
              className={`p-3 rounded-full transition-all ${!puedeRetroceder || isLoading 
                ? 'bg-indigo-800/30 text-indigo-600 cursor-not-allowed' 
                : 'bg-indigo-700 text-cyan-300 hover:bg-indigo-600 hover:scale-110 shadow-lg hover:shadow-cyan-500/20'}`}
              aria-label="Anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => navegarCarrusel('siguiente')} 
              disabled={!puedeAvanzar || isLoading}
              className={`p-3 rounded-full transition-all ${!puedeAvanzar || isLoading 
                ? 'bg-indigo-800/30 text-indigo-600 cursor-not-allowed' 
                : 'bg-indigo-700 text-cyan-300 hover:bg-indigo-600 hover:scale-110 shadow-lg hover:shadow-cyan-500/20'}`}
              aria-label="Siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-t-cyan-400 border-r-pink-400 border-b-purple-400 border-l-indigo-400 rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-t-pink-400 border-r-purple-400 border-b-indigo-400 border-l-cyan-400 rounded-full animate-spin-slow"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500/30 text-red-100 p-5 rounded-xl">
            <p>{error}</p>
          </div>
        ) : imagenesFiltradas.length > 0 ? (
          <div className="relative overflow-hidden">
            <div
              ref={carruselRef}
              className="flex transition-transform duration-500 ease-in-out"
              style={{ 
                transform: `translateX(-${(indiceActual / elementosPorVista) * (100)}%)` 
              }}
            >
              {imagenesFiltradas.map((imagen) => (
                <div
                  key={imagen.idimagen}
                  className="w-1/3 px-3 flex-shrink-0"
                  style={{ flexBasis: `${100/elementosPorVista}%` }}
                >
                  <div className="bg-gradient-to-b from-indigo-800/80 to-purple-800/80 backdrop-blur-md rounded-xl overflow-hidden shadow-xl border border-indigo-500/30 hover:border-cyan-400/50 hover:shadow-cyan-500/20 hover:transform hover:scale-105 transition-all duration-300 group h-full flex flex-col">
                    <div className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/30 z-10 group-hover:opacity-0 transition-opacity duration-300"></div>
                      <img
                        src={imagen.imagenurl || "/api/placeholder/400/300"}
                        alt={imagen.nombre}
                        className="w-full h-48 object-cover transition duration-300 group-hover:brightness-110 group-hover:scale-110"
                        onError={handleImageError}
                        loading="lazy"
                      />
                      {/* Brillo decorativo en la imagen */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-transparent via-cyan-500/10 to-transparent transition-opacity duration-500"></div>
                    </div>
                    <div className="p-5 flex-grow flex flex-col">
                      <h3 className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-pink-300 mb-4" title={imagen.nombre}>
                        {imagen.nombre.length > 20 ? `${imagen.nombre.substring(0, 20)}...` : imagen.nombre}
                      </h3>
                      <button 
                        onClick={() => irAJugar(imagen.idimagen)} 
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium rounded-lg py-3 px-4 mt-auto transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-cyan-500/40 flex items-center justify-center"
                      >
                        <Gamepad2 size={18} className="mr-2" />
                        Jugar Ahora
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-indigo-900/30 backdrop-blur-sm border border-indigo-700/30 rounded-xl py-16 px-4">
            <p className="text-indigo-300 text-center">No se encontraron rompecabezas con ese nombre.</p>
          </div>
        )}

        {/* Indicadores de página del carrusel */}
        {!isLoading && !error && imagenesFiltradas.length > elementosPorVista && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: numeroPaginas }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setIndiceActual(idx * elementosPorVista)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  paginaActual === idx 
                    ? 'bg-gradient-to-r from-cyan-400 to-purple-400 w-8 shadow-lg shadow-purple-500/20' 
                    : 'bg-indigo-700 hover:bg-indigo-600'
                }`}
                aria-label={`Ir a página ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}