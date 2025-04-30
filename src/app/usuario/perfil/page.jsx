'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar';

export default function Perfil() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const obtenerUsuario = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      const user = session.user;
      const firstName = user.user_metadata?.first_name || 'Usuario';
      setNombre(firstName);
      setEmail(user.email || '');
    };

    obtenerUsuario();
  }, [router]);

  const cambiarCorreo = async () => {
    if (!nuevoCorreo) {
      setMensaje('Por favor ingresa un correo válido.');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user.id;

      const { error: authError } = await supabase.auth.updateUser({ email: nuevoCorreo });
      if (authError) throw authError;

      const { error: userError } = await supabase
        .from('usuarios')
        .update({ email: nuevoCorreo })
        .eq('id', userId);

      if (userError) throw userError;

      setMensaje('Correo actualizado. Revisa tu nuevo correo y confirma el cambio desde el enlace que te hemos enviado.');
    } catch (error) {
      setMensaje(`Error: ${error.message}`);
    }
  };

  const cambiarPassword = async () => {
    if (nuevaPassword.length < 6) {
      setMensaje('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: nuevaPassword });

      if (error) throw error;

      setMensaje('Contraseña actualizada. Se cerrará tu sesión...');
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push('/login');
      }, 2500);
    } catch (error) {
      setMensaje(`Error: ${error.message}`);
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const eliminarUsuario = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user.id;

      // Eliminar el usuario de la tabla personalizada
      const { error: userError } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userId);
      if (userError) throw userError;

      // Eliminar el usuario de Auth
      const { error: authError } = await supabase.auth.api.deleteUser(user.id);
      if (authError) throw authError;

      setMensaje('Tu cuenta ha sido eliminada con éxito.');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (error) {
      setMensaje(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <Navbar />

      <main className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-purple-800 to-indigo-900 text-white p-6">
        <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-4 text-center">Bienvenido, {nombre} 👋</h1>
          <p className="text-xl text-center mb-6">{email}</p>

          {/* Formulario para cambiar el correo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Nuevo correo electrónico</label>
            <input
              type="email"
              placeholder="Nuevo correo electrónico"
              value={nuevoCorreo}
              onChange={(e) => setNuevoCorreo(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={cambiarCorreo}
              className="w-full mt-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition"
            >
              Cambiar correo
            </button>
          </div>

          {/* Formulario para cambiar la contraseña */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Nueva contraseña</label>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={cambiarPassword}
              className="w-full mt-4 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition"
            >
              Cambiar contraseña
            </button>
          </div>

          {/* Mensaje de éxito o error */}
          {mensaje && <p className="text-lg mt-4 text-center text-yellow-300">{mensaje}</p>}

          {/* Botón de eliminar cuenta */}
          <button
            onClick={eliminarUsuario}
            className="w-full mt-6 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition"
          >
            Eliminar cuenta
          </button>

          {/* Botón de cerrar sesión */}
          <button
            onClick={cerrarSesion}
            className="w-full mt-4 py-2 bg-gray-600 text-white font-bold rounded-md hover:bg-gray-700 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </main>
    </>
  );
}
