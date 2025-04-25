'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { UserCircle2, Trophy, Gamepad2, LogOut, Home } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [fotoPerfil, setFotoPerfil] = useState(null);

  useEffect(() => {
    const obtenerUsuario = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const userId = session.user.id;
        setUser(session.user);

        const { data, error } = await supabase
          .from('usuarios')
          .select('fotoperfil')
          .eq('id', userId)
          .single();

        if (data?.FotoPerfil) {
          setFotoPerfil(data.FotoPerfil);
        }
      }
    };

    obtenerUsuario();
  }, []);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="w-full bg-gradient-to-r from-purple-800 via-indigo-700 to-blue-800 text-white shadow-md px-6 py-4 flex items-center justify-between">
      <div
        className="text-2xl font-bold tracking-wider cursor-pointer hover:text-yellow-300 transition"
        onClick={() => router.push('/usuario')}
      >
        🧩 PicGrid
      </div>

      <ul className="hidden md:flex space-x-6 text-lg">
        <li
          className="flex items-center gap-2 hover:text-yellow-300 cursor-pointer transition"
          onClick={() => router.push('/usuario')}
        >
          <Home size={20} />
          Inicio
        </li>
        <li
          className="flex items-center gap-2 hover:text-yellow-300 cursor-pointer transition"
          onClick={() => router.push('/usuario/partidas')}
        >
          <Gamepad2 size={20} />
          Partidas
        </li>
        <li
          className="flex items-center gap-2 hover:text-yellow-300 cursor-pointer transition"
          onClick={() => router.push('/usuario/clasificacion')}
        >
          <Trophy size={20} />
          Clasificación
        </li>
        <li
          className="flex items-center gap-2 hover:text-yellow-300 cursor-pointer transition"
          onClick={() => router.push('/usuario/desafios')}
        >
          🎯 Desafíos
        </li>
      </ul>

      <div className="flex items-center space-x-4">
        {fotoPerfil ? (
          <img
            src={fotoPerfil}
            alt="Avatar"
            onClick={() => router.push('/usuario/perfil')}
            className="w-10 h-10 rounded-full object-cover border-2 border-white hover:border-yellow-300 cursor-pointer transition"
          />
        ) : (
          <UserCircle2
            size={40}
            className="text-gray-300 hover:text-yellow-300 cursor-pointer"
            onClick={() => router.push('/usuario/perfil')}
          />
        )}
        <button
          onClick={cerrarSesion}
          className="flex items-center bg-red-600 hover:bg-red-700 transition px-3 py-2 rounded-xl shadow text-sm font-semibold"
        >
          <LogOut size={18} className="mr-2" />
          Salir
        </button>
      </div>
    </nav>
  );
}
