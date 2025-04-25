'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Head from 'next/head';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [enviandoReset, setEnviandoReset] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: contrasena,
    });

    if (authError) {
      setError('Credenciales incorrectas o usuario no existe.');
      return;
    }

    const userId = authData.user.id;

    const { data: perfil, error: rolError } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', userId)
      .single();

    if (rolError || !perfil) {
      setError('No se pudo obtener la información del usuario.');
      return;
    }

    //redirigir segun el rol
    if (perfil.rol === 'admin') {
      router.push('/admin');
    } else {
      router.push('/usuario');
    }
  };

  const handleResetPassword = async () => {
    setError(null);
  
    if (!email) {
      setError('Introduce tu email para recuperar tu contraseña.');
      return;
    }
  
    setEnviandoReset(true);
  
    // Primero verificamos si el email existe en la base de datos
    const { data: usuarioExistente, error: consultaError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();
  
    if (consultaError || !usuarioExistente) {
      setEnviandoReset(false);
      setError('El correo electrónico no está registrado en el sistema.');
      return;
    }
  
    // Si el email existe, procedemos con el reseteo
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/reset-password', // Cambia esto en producción
    });
  
    setEnviandoReset(false);
  
    if (resetError) {
      setError('Error al enviar el correo de recuperación.');
    } else {
      setError('Te hemos enviado un enlace para restablecer tu contraseña.');
    }
  };

  return (
    <>
      <Head>
        <title>Login – PicGrid</title>
      </Head>

      <main className="flex items-center justify-center h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white font-mono">
        <form
          onSubmit={handleLogin}
          className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md border border-purple-700"
        >
          <h1 className="text-3xl font-bold mb-8 text-center text-purple-300 drop-shadow-sm">
            🧩 Iniciar Sesión
          </h1>

          {error && (
            <p className="text-red-400 mb-4 text-sm text-center">{error}</p>
          )}

          <label className="block mb-1 text-sm text-purple-200 font-semibold">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="correo@ejemplo.com"
            className="w-full p-2 mb-4 rounded bg-purple-950 text-white placeholder-purple-400 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

      <label className="block mb-1 text-sm text-purple-200 font-semibold">
          Contraseña
        </label>
        <div className="relative mb-2">
          <input
            type={mostrarContrasena ? 'text' : 'password'}
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            className="w-full p-2 rounded bg-purple-950 text-white placeholder-purple-400 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setMostrarContrasena(!mostrarContrasena)}
            className="absolute top-1/2 right-3 transform -translate-y-1/2 text-purple-300 hover:text-white"
            aria-label="Mostrar/Ocultar contraseña"
          >
            {mostrarContrasena ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Entrar
          </button>

          <p className="text-sm text-center mt-2 text-purple-300">
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={enviandoReset}
              className="underline hover:text-purple-100"
            >
              {enviandoReset ? 'Enviando...' : '¿Olvidaste tu contraseña?'}
            </button>
          </p>

          <p className="text-sm text-center mt-4 text-purple-300">
            ¿No tienes cuenta?{' '}
            <a href="/registro" className="underline hover:text-purple-100">
              Regístrate
            </a>
          </p>
        </form>
      </main>
    </>
  );
}
