import { useState } from 'react';
import { User, Clock, Award, Settings, ChevronRight, Gamepad2, Shuffle, Timer, BarChart3 } from 'lucide-react';

export default function ProfileStatsSection({ usuario }) {
  const [showSettings, setShowSettings] = useState(false);
  
  // Datos simulados - reemplazar con datos reales de tu base de datos
  const estadisticas = {
    partidasJugadas: 42,
    tiempoTotal: 12600, // en segundos
    movimientosTotales: 3845,
    puntosPromedio: 215,
    monedasTotales: usuario?.totalmonedas || 0,
    tamañoFavorito: "4x4",
    ultimoJuego: "2025-05-08T14:30:00Z"
  };
  
  const formatTiempo = (segundos) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    
    if (horas > 0) {
      return `${horas}h ${minutos}m`;
    }
    return `${minutos}m`;
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg">
      <div className="p-5 bg-gradient-to-r from-indigo-900/80 to-purple-900/80 flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center">
          <User className="text-indigo-400 mr-2" size={20} />
          Tu Perfil
        </h2>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 bg-gray-700/50 rounded-full hover:bg-gray-600/50 transition"
        >
          <Settings size={18} className="text-gray-300" />
        </button>
      </div>

      <div className="p-6">
        {/* Sección de perfil */}
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative">
            <img 
              src={usuario?.fotoperfil || "/api/placeholder/100/100"} 
              alt="Avatar" 
              className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500"
            />
            <div className="absolute -bottom-2 -right-2">
              <button className="bg-indigo-500 text-white rounded-full p-1 shadow-lg hover:bg-indigo-600 transition">
                <Award size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white">
              {usuario?.nombre || 'Jugador'}
            </h3>
            <p className="text-gray-400">{usuario?.email || 'email@ejemplo.com'}</p>
            
            <div className="mt-2">
              <div className="bg-gray-700/50 rounded-full overflow-hidden h-2 w-full">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full" 
                  style={{ width: `${((usuario?.totalpuntos % 1000) / 1000) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-400">Nivel {Math.floor((usuario?.totalpuntos || 0) / 1000) + 1}</span>
                <span className="text-gray-400">
                  {usuario?.totalpuntos % 1000} / 1000 puntos al siguiente nivel
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Selector de avatares (extensible) */}
        {showSettings && (
          <div className="mb-6 p-4 bg-gray-700/30 rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-3">Cambiar Avatar</h4>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((id) => (
                <div key={id} className="relative">
                  <img 
                    src={`/api/placeholder/${50}/${50}`} 
                    alt={`Avatar ${id}`}
                    className="w-10 h-10 rounded-full cursor-pointer hover:opacity-90 transition"
                  />
                  {id === 3 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border border-gray-800"></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-2">
              <button className="text-xs text-indigo-400 hover:text-indigo-300 transition flex items-center">
                Ver todos los avatares <ChevronRight size={12} className="ml-1" />
              </button>
            </div>
          </div>
        )}
        
        {/* Estadísticas de juego */}
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
          <BarChart3 size={18} className="text-indigo-400 mr-2" />
          Estadísticas de juego
        </h4>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-700/40 rounded-lg p-3">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Gamepad2 size={18} className="text-indigo-400" />
              </div>
              <div className="ml-3">
                <div className="text-sm text-gray-400">Partidas jugadas</div>
                <div className="text-xl font-semibold text-white">{estadisticas.partidasJugadas}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700/40 rounded-lg p-3">
            <div className="flex items-center">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Clock size={18} className="text-cyan-400" />
              </div>
              <div className="ml-3">
                <div className="text-sm text-gray-400">Tiempo total</div>
                <div className="text-xl font-semibold text-white">{formatTiempo(estadisticas.tiempoTotal)}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700/40 rounded-lg p-3">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Shuffle size={18} className="text-purple-400" />
              </div>
              <div className="ml-3">
                <div className="text-sm text-gray-400">Movimientos</div>
                <div className="text-xl font-semibold text-white">{estadisticas.movimientosTotales.toLocaleString()}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700/40 rounded-lg p-3">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Timer size={18} className="text-yellow-400" />
              </div>
              <div className="ml-3">
                <div className="text-sm text-gray-400">Tamaño favorito</div>
                <div className="text-xl font-semibold text-white">{estadisticas.tamañoFavorito}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Monedas y puntos */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 bg-gradient-to-r from-yellow-900/60 to-amber-900/60 rounded-lg p-4 flex items-center">
            <div className="text-2xl mr-2">🪙</div>
            <div>
              <div className="text-gray-300 text-sm">Monedas</div>
              <div className="text-yellow-400 text-2xl font-bold">{estadisticas.monedasTotales.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="flex-1 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 rounded-lg p-4 flex items-center">
            <div className="text-2xl mr-2">⭐</div>
            <div>
              <div className="text-gray-300 text-sm">Puntos</div>
              <div className="text-cyan-400 text-2xl font-bold">{usuario?.totalpuntos?.toLocaleString() || 0}</div>
            </div>
          </div>
        </div>
        
        {/* Botón para ver más estadísticas */}
        <div className="flex justify-center">
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg py-2 px-6 font-medium hover:from-indigo-700 hover:to-purple-700 transition flex items-center">
            Ver estadísticas detalladas <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}