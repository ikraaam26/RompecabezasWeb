'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import Navbar from '../../../components/Navbar';
import Puzle from '../../../components/SlidingPuzzle'; // Asegúrate de crearlo después

export default function JuegoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idImagen = searchParams.get('imagen');

  const [imagen, setImagen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!idImagen) {
      setErrorMsg('No se proporcionó una imagen válida.');
      setLoading(false);
      return;
    }

    const obtenerImagen = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('imagenesrompecabezas')
        .select('*')
        .eq('idimagen', idImagen)
        .single();

      if (error || !data) {
        console.error('Error al obtener imagen:', error);
        setErrorMsg('No se pudo cargar el rompecabezas.');
        setLoading(false);
        return;
      }

      setImagen(data);
      setLoading(false);
    };

    obtenerImagen();
  }, [idImagen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <h1 className="text-xl font-semibold mb-4 text-red-400">{errorMsg}</h1>
        <button
          className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white font-semibold"
          onClick={() => router.push('/')}
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white p-4 pt-20">
        <Puzle imageUrl={imagen.imagenurl} nombre={imagen.nombre} idImagen={imagen.idimagen} />
      </div>
    </>
  );
}
