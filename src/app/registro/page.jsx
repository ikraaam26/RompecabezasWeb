'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../..//lib/supabase';
import { Eye, EyeOff } from 'lucide-react';

export default function Registro() {
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const esContrasenaSegura = (pass) => {
    return (
      pass.length >= 8 &&
      /[A-Z]/.test(pass) &&
      /[a-z]/.test(pass) &&
      /[0-9]/.test(pass) &&
      /[^A-Za-z0-9]/.test(pass)
    );
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!esContrasenaSegura(contrasena)) {
      setError('La contraseña debe tener al menos 8 caracteres, con mayúsculas, minúsculas, números y símbolos.');
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password: contrasena,
      options: {
        data: {
          first_name: nombre,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/login');
  };

  return (
    <main className="flex items-center justify-center h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white font-mono">
      <form
        onSubmit={handleRegistro}
        className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md border border-purple-700"
      >
        <h1 className="text-3xl font-bold mb-8 text-center text-purple-300 drop-shadow-sm">
          🧩 Crear Cuenta
        </h1>

        <label className="block mb-1 text-sm text-purple-200 font-semibold">
          Nombre
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full p-2 mb-4 rounded bg-purple-950 text-white placeholder-purple-400 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Tu nombre"
        />

        <label className="block mb-1 text-sm text-purple-200 font-semibold">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 mb-4 rounded bg-purple-950 text-white placeholder-purple-400 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="correo@ejemplo.com"
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
        <p className="text-xs text-purple-400 mb-4">
          Usa al menos 8 caracteres con mayúsculas, minúsculas, números y símbolos.
        </p>

        {error && (
          <p className="text-red-400 mb-4 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
    </main>
  );
}
