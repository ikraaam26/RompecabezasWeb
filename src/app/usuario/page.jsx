'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';

export default function Inicio() {
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
      const { error } = await supabase.auth.updateUser({ email: nuevoCorreo });

      if (error) throw error;

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

  return (
    <>

      <Navbar />

    </>
  );
}
