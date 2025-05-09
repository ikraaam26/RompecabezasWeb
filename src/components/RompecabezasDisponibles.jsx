import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // ajusta la ruta según tengas tu cliente
import { Gamepad2, Search, Filter, Award, Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export default function RompecabezasDisponibles() {
  const [imagenes, setImagenes] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroDificultad, setFiltroDificultad] = useState('todos');
  const [ordenar, setOrdenar] = useState('recientes');
  
  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 6; // Puedes ajustar este número según prefieras

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

  // Cálculos para la paginación
  const totalPaginas = Math.ceil(imagenesFiltradas.length / elementosPorPagina);
  
  // Asegurarse de que la página actual sea válida después de filtrar
  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(1);
    }
  }, [filtroNombre, filtroDificultad, ordenar, totalPaginas]);

  // Obtener las imágenes de la página actual
  const indiceInicial = (paginaActual - 1) * elementosPorPagina;
  const imagenesEnPaginaActual = imagenesFiltradas.slice(indiceInicial, indiceInicial + elementosPorPagina);

  const irAPagina = (numeroPagina) => {
    if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
      setPaginaActual(numeroPagina);
    }
  };

  const getDificultadColor = (dificultad) => {
    switch (dificultad) {
      case 'fácil': return 'bg-green-500';
      case 'medio': return 'bg-yellow-500';
      case 'difícil': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

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

      {/* Rompecabezas destacado del día 
      <div className="mx-6 my-4 bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <Award className="text-yellow-400 mr-2" size={18} />
          <h3 className="text-yellow-400 font-bold">Rompecabezas del día</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <img 
            src="/api/placeholder/400/300"
            alt="Rompecabezas del día" 
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="md:col-span-2">
            <h4 className="text-lg font-semibold text-white mb-2">Amanecer en el océano</h4>
            <p className="text-gray-300 text-sm mb-3">Un hermoso amanecer sobre el océano con colores vibrantes que ponen a prueba tu capacidad para distinguir tonalidades.</p>
            <div className="flex items-center gap-4 mb-3">
              <span className="flex items-center text-sm text-gray-400">
                <Users size={14} className="mr-1" /> 248 jugadores
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium text-white bg-yellow-500">
                Dificultad: Media
              </span>
            </div>
            <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg py-2 px-6 font-semibold hover:from-cyan-600 hover:to-blue-700 transition transform hover:scale-105">
              Jugar ahora
            </button>
          </div>
        </div>
      </div>
      */}

      {/* Lista de rompecabezas */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {imagenesEnPaginaActual.length > 0 ? (
          imagenesEnPaginaActual.map((imagen) => (
            <div
              key={imagen.idimagen}
              className="bg-gray-700/40 rounded-lg overflow-hidden shadow-md hover:shadow-cyan-500/20 hover:transform hover:scale-105 transition duration-300 group"
            >
              <div className="relative">
                <img
                  src={imagen.imagenurl}
                  alt={imagen.nombre}
                  className="w-full h-48 object-cover transition duration-300 group-hover:brightness-110"
                />
                <div className="absolute top-2 right-2">
                  <span className={`${getDificultadColor(imagen.dificultad)} px-2 py-1 rounded-full text-xs font-medium text-white`}>
                    {imagen.dificultad}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-cyan-300 mb-2">{imagen.nombre}</h3>
                
                <div className="flex justify-between items-center mb-3 text-sm text-gray-400">
                  <span className="flex items-center">
                    <Users size={14} className="mr-1" /> {imagen.jugadores}
                  </span>
                  <span className="flex items-center">
                    <Clock size={14} className="mr-1" /> {new Date(imagen.fechasubida).toLocaleDateString()}
                  </span>
                </div>
                
                <button className="w-full bg-cyan-500 text-white rounded-lg py-2 px-6 font-semibold hover:bg-cyan-600 transition flex justify-center items-center gap-2">
                  <Gamepad2 size={16} /> Jugar
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex justify-center items-center py-12 text-gray-400">
            No se encontraron rompecabezas que coincidan con los filtros aplicados.
          </div>
        )}
      </div>

      {/* Controles de paginación */}
      {totalPaginas > 0 && (
        <div className="flex justify-center items-center pb-6 pt-2">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => irAPagina(paginaActual - 1)} 
              disabled={paginaActual === 1}
              className={`p-2 rounded-lg ${paginaActual === 1 ? 'text-gray-500 cursor-not-allowed' : 'text-cyan-400 hover:bg-gray-700/50'}`}
            >
              <ChevronLeft size={20} />
            </button>
            
            {/* Mostrar números de página */}
            <div className="flex items-center gap-1">
              {[...Array(totalPaginas).keys()].map(numero => {
                // Mostrar siempre la primera página, la última y algunas alrededor de la actual
                const numeroPagina = numero + 1;
                
                // Lógica para mostrar un conjunto limitado de páginas
                if (
                  numeroPagina === 1 || 
                  numeroPagina === totalPaginas ||
                  (numeroPagina >= paginaActual - 1 && numeroPagina <= paginaActual + 1)
                ) {
                  return (
                    <button
                      key={numeroPagina}
                      onClick={() => irAPagina(numeroPagina)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                        paginaActual === numeroPagina
                          ? 'bg-cyan-500 text-white'
                          : 'text-gray-300 hover:bg-gray-700/50'
                      }`}
                    >
                      {numeroPagina}
                    </button>
                  );
                } else if (
                  (numeroPagina === 2 && paginaActual > 3) ||
                  (numeroPagina === totalPaginas - 1 && paginaActual < totalPaginas - 2)
                ) {
                  // Mostrar puntos suspensivos
                  return <span key={numeroPagina} className="text-gray-400">...</span>;
                }
                
                return null;
              })}
            </div>
            
            <button 
              onClick={() => irAPagina(paginaActual + 1)} 
              disabled={paginaActual === totalPaginas}
              className={`p-2 rounded-lg ${paginaActual === totalPaginas ? 'text-gray-500 cursor-not-allowed' : 'text-cyan-400 hover:bg-gray-700/50'}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}