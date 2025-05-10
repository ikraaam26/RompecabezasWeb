'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';
import LeaderboardTable from '../../components/TablaClasificacion';
import HeroBanner from '../../components/HeroBanner';
import LogrosSection from '../../components/LogrosSection';
import ProfileStatsSection from '../../components/EstadisticasUsuario';
import RompecabezasDisponibles from '../../components/RompecabezasDisponibles';
import { Trophy, Clock, Star, Gamepad2, Search } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [imagenes, setImagenes] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroNombre, setFiltroNombre] = useState('');

  useEffect(() => {
    const obtenerDatos = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const { data: userData } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUsuario(userData);

        const { data: imagenesData } = await supabase
          .from('imagenesrompecabezas')
          .select(`*, partidas(*)`)
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
    router.push(`/usuario/juego?imagen=${idImagen}`);
  };

  const imagenesFiltradas = imagenes.filter(img =>
    img.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
  );

  const obtenerUltimasPartidas = () => {
    if (!usuario || !imagenes.length) return [];

    const partidasUsuario = [];
    imagenes.forEach(img => {
      if (img.partidas) {
        const partidasDeImagen = img.partidas
          .filter(p => p.idusuario === usuario.id)
          .sort((a, b) => new Date(b.fechahora) - new Date(a.fechahora))
          .slice(0, 1);

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
      .slice(0, 3);
  };

  const ultimasPartidas = obtenerUltimasPartidas();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white">
        <main className="container mx-auto px-4 pt-20 pb-16">
          {/* 1. Hero Banner con información del usuario */}
          <HeroBanner usuario={usuario} />
          
          {/* 2. Grid de secciones principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 2.1 Sección de Perfil y Estadísticas */}
            <ProfileStatsSection usuario={usuario} />
            
            {/* 2.2 Últimas partidas jugadas */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg">
              <h2 className="text-xl font-bold p-5 bg-gradient-to-r from-blue-900/80 to-cyan-900/80 flex items-center">
                <Clock className="text-cyan-400 mr-2" size={20} />
                Tus últimas partidas
              </h2>
              <div className="p-6 grid grid-cols-2 gap-4">
                {/* 🔥 Sección nuevas: Últimas partidas jugadas */}
                  {ultimasPartidas.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold flex items-center text-white mb-4">
                        <Clock className="text-cyan-400 mr-2" size={20} />
                        Tus últimas partidas
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ultimasPartidas.map((partida) => (
                          <div
                            key={partida.idpartida}
                            className="bg-gray-800/60 backdrop-blur-md rounded-lg p-4 shadow-md"
                          >
                            <img
                              src={partida.imagenUrl}
                              alt={`Imagen de ${partida.imagenNombre}`}
                              className="w-full h-32 object-cover rounded-md mb-3"
                            />
                            <h3 className="text-lg font-semibold text-cyan-300 mb-1">{partida.imagenNombre}</h3>
                            <p className="text-sm text-gray-400">
                              Jugado el {new Date(partida.fechahora).toLocaleDateString()} a las{' '}
                              {new Date(partida.fechahora).toLocaleTimeString()}
                            </p>
                            <p className="text-sm text-yellow-400 mt-1 font-medium">Puntuación: {partida.puntos}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
          
          {/* 3. Sección de Logros */}
          <div className="mb-8">
            <LogrosSection usuario={usuario} />
          </div>
          
          {/* 4. Leaderboard/Clasificación */}
          <div className="mb-8">
            <LeaderboardTable limit={5} showSearch={false} className="shadow-lg" />
          </div>
          
          {/* 5. Sección de Rompecabezas mejorada */}
          <RompecabezasDisponibles /* Los componentes que ya creamos */ />
        </main>
        
        {/* Footer */}
        <footer className="bg-gray-800/80 py-8">
          <div className="container mx-auto px-4 text-center text-gray-400">
            <p>© 2025 PicGrid - Todos los derechos reservados</p>
            <div className="mt-2">
              <a href="#" className="text-cyan-400 hover:text-cyan-300 mx-2">Contacto</a>
              <a href="#" className="text-cyan-400 hover:text-cyan-300 mx-2">Términos y condiciones</a>
              <a href="#" className="text-cyan-400 hover:text-cyan-300 mx-2">Política de privacidad</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
