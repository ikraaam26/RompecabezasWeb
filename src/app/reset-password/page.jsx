'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');

      if (accessToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: '' });
      } else {
        router.push('/login'); // Si no hay access_token, redirige
      }
    } else {
      router.push('/login'); //  Si no hay hash, también redirige
    }
  }, [router]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    const { data, error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError('No se pudo actualizar la contraseña.');
    } else {
      setSuccess('¡Contraseña actualizada correctamente! Redirigiendo...');
      setTimeout(() => router.push('/login'), 3000);
    }
  };

  return (
    <main className="flex items-center justify-center h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white font-mono">
      <form
        onSubmit={handleReset}
        className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md border border-purple-700"
      >
        <h1 className="text-3xl font-bold mb-8 text-center text-purple-300">
          🔒 Restablecer contraseña
        </h1>

        {error && (
          <p className="text-red-400 mb-4 text-sm text-center">{error}</p>
        )}
        {success && (
          <p className="text-green-400 mb-4 text-sm text-center">{success}</p>
        )}

        <label className="block mb-1 text-sm text-purple-200 font-semibold">
          Nueva contraseña
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full p-2 mb-4 rounded bg-purple-950 text-white placeholder-purple-400 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <label className="block mb-1 text-sm text-purple-200 font-semibold">
          Confirmar contraseña
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full p-2 mb-4 rounded bg-purple-950 text-white placeholder-purple-400 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Guardar nueva contraseña
        </button>
      </form>
    </main>
  );
}
