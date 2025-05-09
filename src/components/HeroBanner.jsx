import { Flame, Trophy, Clock, Gamepad2 } from 'lucide-react';

export default function HeroBanner({ usuario }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900/40 to-indigo-900/40 mb-8 rounded-xl shadow-xl">
      {/* Círculos decorativos */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-6 py-10 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Contenido de texto */}
          <div className="flex-1 space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-white">
              ¡Hola, <span className="text-cyan-400">{usuario?.nombre || 'Jugador'}</span>!
            </h1>
            
            <p className="text-lg text-gray-300">
              Bienvenido a <span className="font-bold text-cyan-400">PicGrid</span>, donde desafiarás tu mente con rompecabezas fascinantes.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="bg-gray-800/60 backdrop-blur px-4 py-2 rounded-full flex items-center">
                <Trophy className="text-yellow-400 mr-2" size={18} />
                <span className="text-white">{usuario?.totalpuntos?.toLocaleString() || 0} puntos</span>
              </div>
              
              <div className="bg-gray-800/60 backdrop-blur px-4 py-2 rounded-full flex items-center">
                <Flame className="text-orange-500 mr-2" size={18} />
                <span className="text-white">Nivel {Math.floor((usuario?.totalpuntos || 0) / 1000) + 1}</span>
              </div>
            </div>
            
            <div className="pt-4 flex gap-3">
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg py-3 px-6 font-semibold hover:from-cyan-600 hover:to-blue-700 transition transform hover:scale-105 flex items-center gap-2">
                <Gamepad2 size={18} />
                Jugar ahora
              </button>
              
              <button className="bg-gray-800/60 backdrop-blur text-white border border-gray-700 rounded-lg py-3 px-6 font-semibold hover:bg-gray-700/60 transition">
                Ver tutorial
              </button>
            </div>
          </div>
          
          {/* Ilustración/Imagen */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-80 h-80">
              {/* Grid de puzzle (simulación visual) */}
              <div className="grid grid-cols-4 grid-rows-4 gap-1 w-full h-full">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`
                      rounded-md shadow-lg ${i % 2 === 0 ? 'animate-pulse' : ''} 
                      ${['bg-cyan-500/80', 'bg-indigo-500/80', 'bg-purple-500/80', 'bg-blue-500/80'][i % 4]}
                    `}
                    style={{ animationDelay: `${i * 0.1}s`, animationDuration: '3s' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          <div className="bg-gray-800/40 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-cyan-400 font-bold text-2xl">18</div>
            <div className="text-gray-400 text-sm">Rompecabezas</div>
          </div>
          
          <div className="bg-gray-800/40 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-purple-400 font-bold text-2xl">3</div>
            <div className="text-gray-400 text-sm">Dificultades</div>
          </div>
          
          <div className="bg-gray-800/40 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-green-400 font-bold text-2xl">5,432</div>
            <div className="text-gray-400 text-sm">Jugadores</div>
          </div>
          
          <div className="bg-gray-800/40 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-orange-400 font-bold text-2xl">1.2M</div>
            <div className="text-gray-400 text-sm">Partidas jugadas</div>
          </div>
        </div>
      </div>
    </div>
  );
}