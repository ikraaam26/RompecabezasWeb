import { useState, useEffect } from 'react';
import { Medal, ChevronRight, Lock, Trophy, Crown, Gamepad2, Clock } from 'lucide-react';

export default function LogrosSection({ usuario }) {
  // En una implementación real, estos datos vendrían de tu base de datos
  const [logrosDesbloqueados, setLogrosDesbloqueados] = useState([]);
  const [logrosPendientes, setLogrosPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Simulación de datos - en tu implementación real, harías una consulta a Supabase
    const obtenerLogros = async () => {
      setCargando(true);
      
      // Ejemplo de datos
      const logrosCompletados = [
        {
          idLogro: '1',
          nombre: 'Primer Rompecabezas',
          descripcion: 'Completa tu primer rompecabezas',
          puntos: 50,
          monedas: 10,
          icono: 'puzzle',
          fechaObtenido: '2025-04-28T15:30:00Z'
        },
        {
          idLogro: '2',
          nombre: 'Maestro del Tiempo',
          descripcion: 'Completa un rompecabezas en menos de 2 minutos',
          puntos: 100,
          monedas: 25,
          icono: 'clock',
          fechaObtenido: '2025-05-01T09:45:00Z'
        }
      ];
      
      const logrosPorCompletar = [
        {
          idLogro: '3',
          nombre: 'Coleccionista',
          descripcion: 'Completa 10 rompecabezas diferentes',
          puntos: 200,
          monedas: 50,
          icono: 'collection',
          progreso: 3,
          objetivo: 10
        },
        {
          idLogro: '4',
          nombre: 'Experto',
          descripcion: 'Completa un rompecabezas difícil en modo 6x6',
          puntos: 300,
          monedas: 75,
          icono: 'star',
          progreso: 0,
          objetivo: 1
        }
      ];
      
      setLogrosDesbloqueados(logrosCompletados);
      setLogrosPendientes(logrosPorCompletar);
      setCargando(false);
    };
    
    obtenerLogros();
  }, [usuario?.id]);

  const getIconoLogro = (icono) => {
    switch(icono) {
      case 'puzzle': return <div className="p-2 bg-cyan-500/20 rounded-lg"><Gamepad2 size={20} className="text-cyan-400" /></div>;
      case 'clock': return <div className="p-2 bg-green-500/20 rounded-lg"><Clock size={20} className="text-green-400" /></div>;
      case 'collection': return <div className="p-2 bg-purple-500/20 rounded-lg"><Trophy size={20} className="text-purple-400" /></div>;
      case 'star': return <div className="p-2 bg-yellow-500/20 rounded-lg"><Crown size={20} className="text-yellow-400" /></div>;
      default: return <div className="p-2 bg-blue-500/20 rounded-lg"><Medal size={20} className="text-blue-400" /></div>;
    }
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg">
      <div className="p-5 bg-gradient-to-r from-yellow-900/80 to-amber-900/80">
        <h2 className="text-xl font-bold flex items-center">
          <Medal className="text-yellow-400 mr-2" size={20} />
          Tus Logros
        </h2>
      </div>

      {cargando ? (
        <div className="p-10 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : (
        <div className="p-6">
          {/* Estadísticas generales de logros */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-700/40 rounded-lg p-4 text-center">
              <div className="text-yellow-400 text-3xl font-bold">
                {logrosDesbloqueados.length}
              </div>
              <div className="text-gray-400 text-sm">Logros desbloqueados</div>
            </div>
            <div className="bg-gray-700/40 rounded-lg p-4 text-center">
              <div className="text-cyan-400 text-3xl font-bold">
                {logrosPendientes.length + logrosDesbloqueados.length}
              </div>
              <div className="text-gray-400 text-sm">Total de logros</div>
            </div>
          </div>

          {/* Logros recientes */}
          {logrosDesbloqueados.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Logros recientes</h3>
              <div className="space-y-3">
                {logrosDesbloqueados.map(logro => (
                  <div key={logro.idLogro} className="bg-gray-700/40 rounded-lg p-3 flex items-center">
                    {getIconoLogro(logro.icono)}
                    <div className="ml-3 flex-grow">
                      <div className="flex items-center">
                        <h4 className="font-medium text-yellow-400">{logro.nombre}</h4>
                        <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded">COMPLETADO</span>
                      </div>
                      <p className="text-gray-400 text-sm">{logro.descripcion}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-white font-medium flex items-center">
                        <span className="text-yellow-400 mr-1">+{logro.puntos}</span> pts
                      </div>
                      <div className="text-white text-sm flex items-center">
                        🪙 <span className="text-yellow-400 ml-1">+{logro.monedas}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progreso en logros pendientes */}
          {logrosPendientes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Próximos logros</h3>
              <div className="space-y-3">
                {logrosPendientes.map(logro => (
                  <div key={logro.idLogro} className="bg-gray-700/40 rounded-lg p-3 flex items-center">
                    {getIconoLogro(logro.icono)}
                    <div className="ml-3 flex-grow">
                      <h4 className="font-medium text-white">{logro.nombre}</h4>
                      <p className="text-gray-400 text-sm">{logro.descripcion}</p>
                      {/* Barra de progreso */}
                      <div className="mt-2 relative">
                        <div className="h-2 bg-gray-600 rounded-full w-full">
                          <div 
                            className="h-2 bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full" 
                            style={{ width: `${(logro.progreso / logro.objetivo) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {logro.progreso} / {logro.objetivo}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-white font-medium flex items-center">
                        <span className="text-gray-400 mr-1">+{logro.puntos}</span> pts
                      </div>
                      <div className="text-white text-sm flex items-center">
                        🪙 <span className="text-gray-400 ml-1">+{logro.monedas}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón para ver todos los logros */}
          <div className="mt-4 flex justify-center">
            <button className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-lg py-2 px-6 font-medium hover:from-yellow-700 hover:to-amber-700 transition flex items-center">
              Ver todos los logros <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}