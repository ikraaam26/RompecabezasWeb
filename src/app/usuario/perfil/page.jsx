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
  const [userId, setUserId] = useState('');

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
      setUserId(user.id);
    };

    obtenerUsuario();
  }, [router]);

  const cambiarCorreo = async () => {
    if (!nuevoCorreo) {
      setMensaje('Por favor ingresa un correo válido.');
      return;
    }

    try {
      const { error: authError } = await supabase.auth.updateUser({ email: nuevoCorreo });
      if (authError) throw authError;

      const { error: userError } = await supabase
        .from('usuarios')
        .update({ email: nuevoCorreo })
        .eq('id', userId);

      if (userError) throw userError;

      setMensaje(
        'Correo actualizado. Revisa tu nuevo correo y confirma el cambio desde el enlace que te hemos enviado.'
      );
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

  const eliminarCuenta = async () => {
    const confirmacion = confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.');
    if (!confirmacion) return;

    try {
      const res = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar el usuario.');
      }

      setMensaje('Cuenta eliminada correctamente.');
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      setMensaje(`Error al eliminar cuenta: ${error.message}`);
    }
  };

  return (
    <>
      <Navbar />

      <main className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-purple-800 to-indigo-900 text-white">
        <h1 className="text-4xl font-bold mb-2">Bienvenido, {nombre} 👋</h1>
        <p className="text-lg mb-6">{email}</p>

        {/* Cambiar correo */}
        <div className="mb-6 flex flex-col items-center">
          <input
            type="email"
            placeholder="Nuevo correo electrónico"
            value={nuevoCorreo}
            onChange={(e) => setNuevoCorreo(e.target.value)}
            className="bg-gray-700 text-white p-2 rounded-md mb-2 w-72"
          />
          <button
            onClick={cambiarCorreo}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition"
          >
            Cambiar correo
          </button>
        </div>

        {/* Cambiar contraseña */}
        <div className="mb-6 flex flex-col items-center">
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            className="bg-gray-700 text-white p-2 rounded-md mb-2 w-72"
          />
          <button
            onClick={cambiarPassword}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition"
          >
            Cambiar contraseña
          </button>
        </div>

        {/* Mensaje */}
        {mensaje && <p className="text-lg mt-4 text-center">{mensaje}</p>}

        {/* Cerrar sesión */}
        <button
          onClick={cerrarSesion}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition mt-4"
        >
          Cerrar sesión
        </button>

        {/* Eliminar cuenta */}
        <button
          onClick={eliminarCuenta}
          className="bg-red-900 hover:bg-red-800 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition mt-6"
        >
          Eliminar cuenta
        </button>
      </main>
    </>
  );
}