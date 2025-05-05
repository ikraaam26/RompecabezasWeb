'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { Trophy, Gamepad2, LogOut, Home, User, Award } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [inicial, setInicial] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [perfilDesplegable, setPerfilDesplegable] = useState(false);
  const perfilRef = useRef(null);

  useEffect(() => {
    const obtenerUsuario = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const usuario = session.user;
        setUser(usuario);

        const nombre = usuario.user_metadata?.first_name || usuario.email || 'U';
        const primeraLetra = nombre.trim()[0].toUpperCase();
        setInicial(primeraLetra);

        const { data, error } = await supabase
          .from('usuarios')
          .select('fotoperfil')
          .eq('id', usuario.id)
          .single();

        if (data && data.fotoperfil) {
          setProfileUrl(data.fotoperfil);
        }
      }
    };

    obtenerUsuario();

    const handleClickOutside = (event) => {
      if (perfilRef.current && !perfilRef.current.contains(event.target)) {
        setPerfilDesplegable(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const togglePerfilMenu = () => {
    setPerfilDesplegable(!perfilDesplegable);
  };

  const navegarY = (ruta) => {
    router.push(ruta);
    setPerfilDesplegable(false);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      {/* Sidebar/Navbar vertical */}
      <nav className="bg-gray-900 text-white w-full md:w-64 flex flex-col md:min-h-screen">
        {/* Logo en la parte superior */}
        <div 
          className="text-2xl font-bold p-6 border-b border-gray-700 flex items-center justify-between"
          onClick={() => navegarY('/usuario')}
        >
          <div className="flex items-center gap-2 cursor-pointer hover:text-cyan-300 transition">
            <span>🧩</span>
            <span>PicGrid</span>
          </div>
          
          {/* Perfil solo visible en móvil en la barra superior */}
          <div className="md:hidden relative" ref={perfilRef}>
            <div
              onClick={togglePerfilMenu}
              className="w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-cyan-300 transition"
            >
              {profileUrl ? (
                <img
                  src={profileUrl}
                  alt="Perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white font-bold">
                  {inicial}
                </div>
              )}
            </div>
            
            {/* Menú desplegable del perfil en móvil */}
            {perfilDesplegable && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl py-2 z-20">
                <div
                  className="px-4 py-2 flex items-center gap-2 hover:bg-gray-700 cursor-pointer"
                  onClick={() => navegarY('/usuario/perfil')}
                >
                  <User size={18} />
                  <span>Mi Perfil</span>
                </div>
                <div
                  className="px-4 py-2 flex items-center gap-2 hover:bg-gray-700 cursor-pointer"
                  onClick={() => navegarY('/usuario/logros')}
                >
                  <Award size={18} />
                  <span>Mis Logros</span>
                </div>
                <div className="border-t border-gray-700 my-1"></div>
                <div
                  className="px-4 py-2 flex items-center gap-2 text-red-400 hover:bg-red-900/40 cursor-pointer"
                  onClick={cerrarSesion}
                >
                  <LogOut size={18} />
                  <span>Cerrar Sesión</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Elementos del menú - siempre visibles en formato vertical */}
        <div className="flex flex-col p-4 space-y-2 flex-grow">
          <div
            className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition"
            onClick={() => navegarY('/usuario')}
          >
            <Home size={20} />
            <span>Inicio</span>
          </div>
          <div
            className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition"
            onClick={() => navegarY('/usuario/partidas')}
          >
            <Gamepad2 size={20} />
            <span>Partidas</span>
          </div>
          <div
            className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition"
            onClick={() => navegarY('/usuario/clasificacion')}
          >
            <Trophy size={20} />
            <span>Clasificación</span>
          </div>
          <div
            className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition"
            onClick={() => navegarY('/usuario/desafios')}
          >
            🎯 <span>Desafíos</span>
          </div>
          <div
            className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition"
            onClick={() => navegarY('/usuario/perfil')}
          >
            <User size={20} />
            <span>Mi Perfil</span>
          </div>
          <div
            className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition"
            onClick={() => navegarY('/usuario/logros')}
          >
            <Award size={20} />
            <span>Mis Logros</span>
          </div>
        </div>
        
        {/* Perfil y botón de cerrar sesión - solo visible en desktop */}
        <div className="hidden md:block border-t border-gray-700 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              {profileUrl ? (
                <img
                  src={profileUrl}
                  alt="Perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white font-bold">
                  {inicial}
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <div className="font-medium truncate">
                {user?.user_metadata?.first_name || user?.email || 'Usuario'}
              </div>
              <div 
                className="text-sm text-gray-400 hover:text-cyan-300 cursor-pointer"
                onClick={() => navegarY('/usuario/perfil')}
              >
                Ver perfil
              </div>
            </div>
          </div>
          
          <button
            onClick={cerrarSesion}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 transition p-2 rounded-lg"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
        
        {/* Botón de cerrar sesión para móvil */}
        <div className="md:hidden border-t border-gray-700 p-4">
          <button
            onClick={cerrarSesion}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 transition p-2 rounded-lg"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </nav>
      
      {/* Contenido principal - esto es donde irá el resto de tu aplicación */}
      <main className="flex-grow md:pl-64 p-4 pt-6">
        {/* Este es el contenedor para el contenido de la página */}
        <div className="container mx-auto">
          {/* Aquí va el contenido de la página que se renderizará */}
        </div>
      </main>
    </div>
  );
}