'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Splash() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const verificarSesion = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        setProgress(current);
        if (current >= 100) {
          clearInterval(interval);
          if (session) {
            const userId = session.user.id;
            
            // Función asíncrona para obtener el rol
            const { data, error } = supabase
              .from('Usuarios')
              .select('rol')  // Suponiendo que el rol está en la columna 'rol'
              .eq('Id', userId)
              .single();

            if (error) {
              console.error("Error al obtener el rol", error);
              return;
            }

            // Redirigir dependiendo del rol
            if (data?.rol === 'admin') {
              router.push('/admin');  // Redirige a la vista de administrador
            } else {
              router.push('/usuario');  // Redirige a la vista de usuario normal
            }
          } else {
            router.push('/login');
          }
        }
      }, 20);
    };

    verificarSesion();
  }, []);

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-black via-purple-950 to-black text-white font-mono">
      <h1 className="text-5xl font-extrabold mb-8 tracking-wider text-purple-400 drop-shadow-lg">
        🧩 PicGrid
      </h1>

      <div className="w-64 h-3 bg-white/10 rounded-full overflow-hidden border border-purple-700 shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-100"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <p className="mt-4 text-sm text-purple-300 tracking-widest">
        Cargando {progress}%
      </p>
    </div>
  );
}
