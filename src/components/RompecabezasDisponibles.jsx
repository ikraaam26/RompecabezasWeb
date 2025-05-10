import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase'; // ajusta la ruta según tengas tu cliente
import { Gamepad2, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function RompecabezasDisponibles() {
  const [imagenes, setImagenes] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroDificultad, setFiltroDificultad] = useState('todos');
  const [ordenar, setOrdenar] = useState('recientes');
  
  // Estado para el carrusel
  const [indiceActual, setIndiceActual] = useState(0);
  const carruselRef = useRef(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const elementosPorVista = 3; // Cuántos elementos mostrar a la vez en el carrusel (ajustable según el tamaño de pantalla)

  useEffect(() => {
    const fetchImagenes = async () => {
      const { data, error } = await supabase
        .from('imagenesrompecabezas')
        .select('*')
        .order('fechasubida', { ascending: false });

      if (error) {
        console.error('Error al obtener imágenes:', error);
      } else {
        setImagenes(data);
      }
    };

    fetchImagenes();
  }, []);

  // Aplicar filtros a las imágenes
  const imagenesFiltradas = imagenes
    .filter(img => img.nombre.toLowerCase().includes(filtroNombre.toLowerCase()))
    .filter(img => filtroDificultad === 'todos' || img.dificultad === filtroDificultad)
    .sort((a, b) => {
      if (ordenar === 'recientes') {
        return new Date(b.fechasubida) - new Date(a.fechasubida);
      } else if (ordenar === 'populares') {
        return (b.jugadores || 0) - (a.jugadores || 0);
      }
      return 0;
    });

  // Asegurarse de que el índice actual sea válido después de filtrar
  useEffect(() => {
    if (indiceActual > imagenesFiltradas.length - elementosPorVista) {
      setIndiceActual(Math.max(0, imagenesFiltradas.length - elementosPorVista));
    }
  }, [filtroNombre, filtroDificultad, ordenar, imagenesFiltradas.length]);

  const navegarCarrusel = (direccion) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Calcular el nuevo índice
    let nuevoIndice;
    if (direccion === 'siguiente') {
      nuevoIndice = Math.min(
        indiceActual + elementosPorVista, 
        Math.max(0, imagenesFiltradas.length - elementosPorVista)
      );
    } else {
      nuevoIndice = Math.max(indiceActual - elementosPorVista, 0);
    }
    
    setIndiceActual(nuevoIndice);
    
    // Desactivar la transición después de completarse
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500); // Este tiempo debe coincidir con la duración de la transición CSS
  };

  const getDificultadColor = (dificultad) => {
    switch (dificultad) {
      case 'fácil': return 'bg-green-500';
      case 'medio': return 'bg-yellow-500';
      case 'difícil': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Determinar si los botones de navegación deben estar deshabilitados
  const puedeRetroceder = indiceActual > 0;
  const puedeAvanzar = indiceActual < imagenesFiltradas.length - elementosPorVista;

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg">
      <div className="p-5 bg-gradient-to-r from-purple-900/80 to-indigo-900/80">
        <h2 className="text-xl font-bold flex items-center mb-4">
          <Gamepad2 className="text-cyan-400 mr-2" size={20} />
          Rompecabezas Disponibles
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Barra de búsqueda */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Buscar rompecabezas..."
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              className="bg-gray-700/50 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 w-full"
            />
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          {/* Filtros */}
          <div className="flex gap-2">
            <select 
              value={filtroDificultad}
              onChange={(e) => setFiltroDificultad(e.target.value)}
              className="bg-gray-700/50 rounded-lg pl-2 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 appearance-none"
            >
              <option value="todos">Todas las dificultades</option>
              <option value="fácil">Fácil</option>
              <option value="medio">Medio</option>
              <option value="difícil">Difícil</option>
            </select>
            
            <select 
              value={ordenar}
              onChange={(e) => setOrdenar(e.target.value)}
              className="bg-gray-700/50 rounded-lg pl-2 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 appearance-none"
            >
              <option value="recientes">Más recientes</option>
              <option value="populares">Más populares</option>
            </select>
          </div>
        </div>
      </div>

      {/* Carrusel de rompecabezas */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Explora rompecabezas</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => navegarCarrusel('anterior')} 
              disabled={!puedeRetroceder}
              className={`p-2 rounded-lg ${!puedeRetroceder ? 'text-gray-500 cursor-not-allowed' : 'text-cyan-400 hover:bg-gray-700/50'}`}
              aria-label="Anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => navegarCarrusel('siguiente')} 
              disabled={!puedeAvanzar}
              className={`p-2 rounded-lg ${!puedeAvanzar ? 'text-gray-500 cursor-not-allowed' : 'text-cyan-400 hover:bg-gray-700/50'}`}
              aria-label="Siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {imagenesFiltradas.length > 0 ? (
          <div className="relative overflow-hidden">
            <div 
              ref={carruselRef} 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${indiceActual * (100 / elementosPorVista)}%)` }}
            >
              {imagenesFiltradas.map((imagen) => (
                <div
                  key={imagen.idimagen}
                  className="min-w-[calc(100%/3)] px-2 sm:min-w-[calc(100%/3)] md:min-w-[calc(100%/4)] lg:min-w-[calc(100%/5)]"
                >
                  <div className="bg-gray-700/40 rounded-lg overflow-hidden shadow-md hover:shadow-cyan-500/20 hover:transform hover:scale-105 transition duration-300 group h-full flex flex-col">
                    <div className="relative">
                      <img
                        src={imagen.imagenurl || "/api/placeholder/400/300"}
                        alt={imagen.nombre}
                        className="w-full h-44 object-cover transition duration-300 group-hover:brightness-110"
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`${getDificultadColor(imagen.dificultad)} px-2 py-1 rounded-full text-xs font-medium text-white`}>
                          {imagen.dificultad}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex-grow flex flex-col">
                      <h3 className="font-semibold text-lg text-cyan-300 mb-2">{imagen.nombre}</h3>
                      
                      <div className="flex justify-between items-center mt-auto mb-3 text-sm text-gray-400">
                        <span className="flex items-center">
                          {imagen.jugadores} jugadores
                        </span>
                        <span className="flex items-center">
                          {new Date(imagen.fechasubida).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <button className="w-full bg-cyan-500 text-white rounded-lg py-2 px-6 font-semibold hover:bg-cyan-600 transition flex justify-center items-center gap-2">
                        <Gamepad2 size={16} /> Jugar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-12 text-gray-400">
            No se encontraron rompecabezas que coincidan con los filtros aplicados.
          </div>
        )}

        {/* Indicadores de página del carrusel */}
        {imagenesFiltradas.length > 0 && (
          <div className="flex justify-center mt-4 gap-1">
            {Array.from({ length: Math.ceil(imagenesFiltradas.length / elementosPorVista) }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setIndiceActual(idx * elementosPorVista)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  indiceActual === idx * elementosPorVista ? 'bg-cyan-500' : 'bg-gray-600 hover:bg-gray-500'
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