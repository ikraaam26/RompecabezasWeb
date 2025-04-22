'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function RegistroPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: nombre,
        },
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert('¡Registro exitoso!');
      router.push('/login');
    }
  };

  return (
    <form onSubmit={handleSignUp} className="p-4 max-w-md mx-auto">
      <h2 className="text-xl mb-4">Crear cuenta</h2>
      <input
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="block mb-2 w-full border p-2"
        required
      />
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="block mb-2 w-full border p-2"
        type="email"
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="block mb-2 w-full border p-2"
        required
      />
      <button type="submit" className="bg-green-500 text-white px-4 py-2">
        Registrarse
      </button>
    </form>
  );
}
