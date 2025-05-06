'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';
import LeaderboardTable from '../../components/TablaClasificacion';
import { Trophy, Clock, Star, Gamepad2, Search } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [imagenes, setImagenes] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const obtenerDatos = async () => {
      setLoading(true);
      try {
        // Verificar sesión de usuario
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        // Obtener datos del usuario
        const { data: userData } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUsuario(userData);

        // Obtener imágenes de rompecabezas
        const { data: imagenesData } = await supabase
          .from('imagenesrompecabezas')
          .select(`
            *,
            partidas(*)
          `)
          .order('fechasubida', { ascending: false });

        setImagenes(imagenesData || []);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    obtenerDatos();
  }, [router]);

  const iniciarJuego = (idImagen) => {
    // Navegar a la página de juego con la ID de la imagen
    router.push(`/usuario/juego?imagen=${idImagen}`);
  };

  // Filtrar imágenes por nombre
  const imagenesFiltradas = imagenes.filter(img =>
    img.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
  );

  // Obtener las últimas partidas jugadas por el usuario actual
  const obtenerUltimasPartidas = () => {
    if (!usuario || !imagenes.length) return [];

    const partidasUsuario = [];
    imagenes.forEach(img => {
      if (img.partidas) {
        const partidasDeImagen = img.partidas
          .filter(p => p.idusuario === usuario.id)
          .sort((a, b) => new Date(b.fechahora) - new Date(a.fechahora))
          .slice(0, 1);   // Solo la más reciente de cada imagen

        if (partidasDeImagen.length > 0) {
          partidasUsuario.push({
            ...partidasDeImagen[0],
            imagenNombre: img.nombre,
            imagenUrl: img.imagenurl
          });
        }
      }
    });

    return partidasUsuario
      .sort((a, b) => new Date(b.fechahora) - new Date(a.fechahora))
      .slice(0, 3);   // Solo las 3 partidas más recientes
  };

  const ultimasPartidas = obtenerUltimasPartidas();

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-900 text-white">
        {/* Contenido principal con padding superior para evitar solapamiento con navbar */}
        <main className="container mx-auto px-4 pt-20 pb-16">
          {/* Saludo al usuario */}
          <div className="mb-8 pt-4">
            <h1 className="text-3xl font-bold">
              ¡Hola, <span className="text-cyan-400">{usuario?.nombre || 'Jugador'}</span>!
            </h1>
            <p className="text-gray-400 mt-1">
              Bienvenido de nuevo a PicGrid. ¿Listo para un nuevo desafío?
            </p>
          </div>

          {/* Contenedor para Clasificación y Estadísticas en paralelo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Tabla de clasificación */}
            <div className="lg:col-span-1">
              <LeaderboardTable limit={5} showSearch={false} className="shadow-lg" />
            </div>

            {/* Estadísticas del usuario */}
            <div className="lg:col-span-1">
              {usuario && (
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg">
                  <div className="p-5 bg-gradient-to-r from-blue-900/80 to-purple-900/80">
                    <h2 className="text-xl font-bold flex items-center">
                      <Star className="text-yellow-400 mr-2" size={20} />
                      Tus Estadísticas
                    </h2>
                  </div>

                  <div className="p-5 grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/40 rounded-lg p-4 flex flex-col items-center">
                      <div className="text-cyan-400 font-bold text-2xl">
                        {usuario.totalpuntos.toLocaleString()}
                      </div>
                      <div className="text-gray-400 text-sm">Puntos totales</div>
                    </div>

                    <div className="bg-gray-700/40 rounded-lg p-4 flex flex-col items-center">
                      <div className="text-yellow-400 font-bold text-2xl flex items-center">
                        🪙 {usuario.totalmonedas.toLocaleString()}
                      </div>
                      <div className="text-gray-400 text-sm">Monedas</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contenedor para los Rompecabezas Disponibles */}
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg mb-8">
            <div className="p-5 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center">
                <Gamepad2 className="text-cyan-400 mr-2" size={20} />
                Rompecabezas Disponibles
              </h2>

              {/* Buscador de rompecabezas */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  className="bg-gray-700/50 rounded-full pl-9 pr-4 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 w-40 md:w-60"
                />
                <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {loading ? (
              <div className="p-20 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
              </div>
            ) : imagenesFiltradas.length > 0 ? (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {imagenesFiltradas.map((imagen) => (
                  <div
                    key={imagen.idimagen}
                    className="bg-gray-700/40 rounded-lg overflow-hidden shadow-md hover:shadow-cyan-900/30 hover:scale-102 transition cursor-pointer"
                  >
                    <img
                      src={imagen.imagenurl}
                      alt={imagen.nombre}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4 flex justify-center">
                      <button
                        onClick={() => {
                          iniciarJuego(imagen.idimagen);
                        }}
                        className="bg-cyan-500 text-white rounded-lg py-2 px-6 font-semibold hover:bg-cyan-600 transition"
                      >
                        Jugar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-gray-400">
                <div className="text-5xl mb-4">🧩</div>
                {filtroNombre ?
                  <p>No se encontraron rompecabezas con ese nombre.</p> :
                  <p>No hay rompecabezas disponibles actualmente.</p>
                }
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}