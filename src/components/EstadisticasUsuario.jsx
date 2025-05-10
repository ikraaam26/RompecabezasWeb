import { useState, useEffect } from 'react';
import { Gamepad2, Clock, Shuffle, Timer, BarChart3, Award } from 'lucide-react';
import { supabase } from '../lib/supabase'; // Asegúrate de tener esta importación correcta

export default function GameStatsComponent({ usuario }) {
  const [estadisticas, setEstadisticas] = useState({
    partidasJugadas: 0,
    tiempoTotal: 0,
    movimientosTotales: 0,
    puntosPromedio: 0,
    tamañoFavorito: "",
    ultimaPartida: null
  });
  
  const [cargando, setCargando] = useState(true);

  // Cargar datos reales de Supabase
  useEffect(() => {
    const cargarEstadisticas = async () => {
      if (!usuario?.id) return;
      
      try {
        setCargando(true);
        
        // 1. Obtener total de partidas jugadas
        const { data: partidas, error: partidasError } = await supabase
          .from('partidas')
          .select('idpartida, tiempojugado, movimientos, puntos, fechahora, tamañorompecabezas')
          .eq('idusuario', usuario.id);
          
        if (partidasError) throw partidasError;
        
        // 2. Obtener el tamaño de rompecabezas favorito (el más jugado)
        const { data: tamañoData, error: tamañoError } = await supabase
          .from('partidas')
          .select('tamañorompecabezas, count(*)')
          .eq('idusuario', usuario.id)
          .group('tamañorompecabezas')
          .order('count', { ascending: false })
          .limit(1);
          
        if (tamañoError) throw tamañoError;
        
        // Calcular estadísticas
        const tiempoTotal = partidas.reduce((sum, partida) => sum + (partida.tiempojugado || 0), 0);
        const movimientosTotales = partidas.reduce((sum, partida) => sum + (partida.movimientos || 0), 0);
        const puntosTotales = partidas.reduce((sum, partida) => sum + (partida.puntos || 0), 0);
        
        // Ordenar partidas por fecha para obtener la más reciente
        const partidasOrdenadas = [...partidas].sort((a, b) => 
          new Date(b.fechahora) - new Date(a.fechahora)
        );
        
        const ultimaPartida = partidasOrdenadas.length > 0 ? partidasOrdenadas[0].fechahora : null;
        
        // Actualizar el estado con datos reales
        setEstadisticas({
          partidasJugadas: partidas.length,
          tiempoTotal,
          movimientosTotales,
          puntosPromedio: partidas.length > 0 ? Math.round(puntosTotales / partidas.length) : 0,
          tamañoFavorito: tamañoData && tamañoData.length > 0 ? tamañoData[0].tamañorompecabezas : "N/A",
          ultimaPartida
        });
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        setCargando(false);
      }
    };
    
    cargarEstadisticas();
  }, [usuario?.id]);
  
  const formatTiempo = (segundos) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    
    if (horas > 0) {
      return `${horas}h ${minutos}m`;
    }
    return `${minutos}m`;
  };

  if (cargando) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg">
      <div className="p-5 bg-gradient-to-r from-indigo-900/80 to-purple-900/80">
        <h2 className="text-xl font-bold flex items-center">
          <BarChart3 className="text-indigo-400 mr-2" size={20} />
          Estadísticas de Juego
        </h2>
      </div>

      <div className="p-6">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-2 gap-4 mb-6">
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
        
        {/* Stats más detallados */}
        <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
          <h4 className="text-md font-semibold text-white mb-3 flex items-center">
            <Award size={16} className="text-indigo-400 mr-2" />
            Rendimiento
          </h4>
          
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <div className="text-gray-400 text-sm">Puntos promedio</div>
              <div className="text-white font-medium">{estadisticas.puntosPromedio} por partida</div>
            </div>
            
            <div>
              <div className="text-gray-400 text-sm">Movimientos promedio</div>
              <div className="text-white font-medium">
                {estadisticas.partidasJugadas > 0 
                  ? Math.round(estadisticas.movimientosTotales / estadisticas.partidasJugadas) 
                  : 0} por partida
              </div>
            </div>
            
            <div>
              <div className="text-gray-400 text-sm">Tiempo promedio</div>
              <div className="text-white font-medium">
                {estadisticas.partidasJugadas > 0 
                  ? formatTiempo(Math.round(estadisticas.tiempoTotal / estadisticas.partidasJugadas)) 
                  : '0m'} por partida
              </div>
            </div>
            
            <div>
              <div className="text-gray-400 text-sm">Última partida</div>
              <div className="text-white font-medium">
                {estadisticas.ultimaPartida ? new Date(estadisticas.ultimaPartida).toLocaleDateString() : 'Nunca'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Monedas y puntos */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-gradient-to-r from-yellow-900/60 to-amber-900/60 rounded-lg p-4 flex items-center">
            <div className="text-2xl mr-2">🪙</div>
            <div>
              <div className="text-gray-300 text-sm">Monedas</div>
              <div className="text-yellow-400 text-2xl font-bold">{usuario?.totalmonedas?.toLocaleString() || 0}</div>
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
      </div>
    </div>
  );
}