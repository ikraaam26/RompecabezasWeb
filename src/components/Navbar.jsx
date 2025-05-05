'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { Trophy, Gamepad2, LogOut, Home, Menu, X, User, Award } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [profileUrl, setProfileUrl] = useState('');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [perfilDesplegable, setPerfilDesplegable] = useState(false);
  const menuRef = useRef(null);
  const perfilRef = useRef(null);

  useEffect(() => {
    const obtenerUsuario = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const usuario = session.user;
        
        // Obtener solo la foto de perfil desde la tabla 'Usuarios'
        const { data } = await supabase
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
    
    // Cerrar el menú al hacer clic fuera de él
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false);
      }
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

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };
  
  const togglePerfilMenu = () => {
    setPerfilDesplegable(!perfilDesplegable);
  };

  const navegarY = (ruta) => {
    router.push(ruta);
    setMenuAbierto(false);
    setPerfilDesplegable(false);
  };

  return (
    <header>
    <nav className="w-full bg-gray-900/80 backdrop-blur-sm text-white px-6 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-10 shadow-lg">
      <div
        className="text-2xl font-bold tracking-wider cursor-pointer hover:text-cyan-300 transition"
        onClick={() => navegarY('/usuario')}
      >
        🧩 PicGrid
      </div>

      {/* Contenedor para los botones de menú y perfil */}
      <div className="flex items-center space-x-4">
        {/* Botón del menú hamburguesa (visible en todas las pantallas) */}
        <button
          className="p-2 text-white hover:text-cyan-300 focus:outline-none"
          onClick={toggleMenu}
        >
          {menuAbierto ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>

        {/* Imagen de perfil con menú desplegable */}
        <div className="relative" ref={perfilRef}>
          <div
            onClick={togglePerfilMenu}
            className="w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-cyan-300 transition"
          >
          {profileUrl && (
            <img 
              src={profileUrl} 
              alt="Perfil" 
              className="w-full h-full object-cover"
            />
          )}
                      
          </div>
          
          {/* Menú desplegable del perfil */}
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

      {/* Menú desplegable (ahora es el mismo para todas las pantallas) */}
      {menuAbierto && (
        <div 
          ref={menuRef}
          className="absolute top-full left-0 right-0 bg-gray-800/95 backdrop-blur-sm shadow-xl rounded-b-lg z-10"
        >
          <div className="p-4 space-y-4">
            <div
              className="flex items-center gap-3 p-3 hover:bg-gray-700/60 rounded-lg cursor-pointer transition"
              onClick={() => navegarY('/usuario')}
            >
              <Home size={20} />
              <span>Inicio</span>
            </div>
            <div
              className="flex items-center gap-3 p-3 hover:bg-gray-700/60 rounded-lg cursor-pointer transition"
              onClick={() => navegarY('/usuario/partidas')}
            >
              <Gamepad2 size={20} />
              <span>Partidas</span>
            </div>
            <div
              className="flex items-center gap-3 p-3 hover:bg-gray-700/60 rounded-lg cursor-pointer transition"
              onClick={() => navegarY('/usuario/clasificacion')}
            >
              <Trophy size={20} />
              <span>Clasificación</span>
            </div>
            <div
              className="flex items-center gap-3 p-3 hover:bg-gray-700/60 rounded-lg cursor-pointer transition"
              onClick={() => navegarY('/usuario/desafios')}
            >
              🎯 <span>Desafíos</span>
            </div>
          </div>
        </div>
      )}
    </nav>
    </header>
  );
}