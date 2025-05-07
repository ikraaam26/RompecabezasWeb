'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Navbar from '../../../components/Navbar';
import { Edit, Save, X, ChevronLeft, ChevronRight, Coins, AlertTriangle, Trash2, Star, 
         Trophy, Award, Sparkles, User, Mail, Shield, Bookmark } from 'lucide-react';

export default function PerfilPage() {
  const [user, setUser] = useState(null);
  const [perfilData, setPerfilData] = useState({
    nombre: '',
    email: '',
    fotoperfil: '',
    totalmonedas: 0,
    totalpuntos: 0
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [avatares, setAvatares] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [buyingMode, setBuyingMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const itemsPerPage = 4;
  const [totalPartidas, setTotalPartidas] = useState(0);


  // Cargar datos del usuario y avatares disponibles
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      
      // Obtener sesión de usuario
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
        
        // Cargar datos del perfil del usuario
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userData) {
          setPerfilData(userData);
        } else if (userError) {
          console.error('Error al cargar datos del usuario:', userError);
          setMessage({ text: 'Error al cargar perfil', type: 'error' });
        }

        // 🔢 Contar partidas jugadas
        const { count, error: countError } = await supabase
        .from('partidas')
        .select('*', { count: 'exact', head: true })
        .eq('idusuario', session.user.id);

        if (countError) {
          console.error('Error al contar partidas:', countError.message);
        } else {
          setTotalPartidas(count); // ← Define esto con useState
        }
        
        // Cargar avatares disponibles
        const { data: avatarData, error: avatarError } = await supabase
          .from('avatares')
          .select('*')
          .order('precio', { ascending: true });
        
        if (avatarData) {
          // Cargar los avatares comprados por el usuario
          const { data: compradosData, error: compradosError } = await supabase
            .from('usuariosavatares')
            .select('idavatar')
            .eq('idusuario', session.user.id);
          
          if (compradosData) {
            // Marcar los avatares ya comprados
            const avatarCompradoIds = compradosData.map(item => item.idavatar);
            
            const avatarsConEstado = avatarData.map(avatar => ({
              ...avatar,
              comprado: avatarCompradoIds.includes(avatar.id)
            }));
            
            setAvatares(avatarsConEstado);
          } else {
            setAvatares(avatarData);
          }
        }
      }
      
      setLoading(false);
    };
    
    cargarDatos();
  }, []);

  

  // Manejar cambios en los campos de edición
  const handleChange = (e) => {
    setPerfilData({ ...perfilData, [e.target.name]: e.target.value });
  };

  // Mostrar mensaje con animación
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 300);
    }, 3000);
  };

  // Guardar cambios en el perfil
  const handleSave = async () => {
    setLoading(true);
  
    try {
      // Primero actualizamos en auth.users
      const { error: authError } = await supabase.auth.updateUser({
        email: perfilData.email
      });
  
      if (authError) throw authError;
  
      // Si lo anterior funciona, ahora actualizamos en la tabla usuarios
      const { error: usuariosError } = await supabase
        .from('usuarios')
        .update({
          nombre: perfilData.nombre,
          email: perfilData.email
        })
        .eq('id', user.id);
  
      if (usuariosError) throw usuariosError;
  
      showMessage('Perfil actualizado correctamente', 'success');
      setEditing(false);
    } catch (error) {
      console.error('Error al actualizar:', error);
      showMessage('Error al actualizar el perfil: ' + (error.message || 'Contacta al administrador'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar cuenta de usuario
  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await fetch('/api/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo eliminar la cuenta.');
      }

      // Cerrar sesión del cliente
      await supabase.auth.signOut();
  
      // Redirigir al login si todo fue bien
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      showMessage('Error al eliminar la cuenta: ' + error.message, 'error');
      setConfirmDelete(false);
      setLoading(false);
    }
  };
  
  console.log(perfilData)
  // Comprar un avatar
  const comprarAvatar = async (avatar) => {
    if (perfilData.totalmonedas < avatar.precio) {
      showMessage('No tienes suficientes monedas', 'error');
      return;
    }
  
    setSelectedAvatar(avatar);
    setLoading(true);
   
    try {
      // Actualizar el usuario con la nueva foto de perfil y restar monedas
      const { error: userError } = await supabase
        .from('usuarios')
        .update({
          fotoperfil: avatar.url,
          totalmonedas: perfilData.totalmonedas - avatar.precio
        })
        .eq('id', user.id);
  
      if (userError) throw userError;
  
      // Insertar el avatar comprado en la tabla usuariosavatares
      const { error: compraError } = await supabase
        .from('usuariosavatares')
        .insert([{ idusuario: user.id, idavatar: avatar.id }]);
  
      if (compraError) throw compraError;
  
      // Actualizar estado local
      setPerfilData({
        ...perfilData,
        fotoperfil: avatar.url,
        totalmonedas: perfilData.totalmonedas - avatar.precio
      });
  
      // Actualizar el estado de 'comprado' en el array de avatares
      setAvatares(prevAvatares =>
        prevAvatares.map(a =>
          a.id === avatar.id ? { ...a, comprado: true } : a
        )
      );
  
      showMessage('¡Avatar adquirido correctamente!', 'success');
  
      // Animación de compra
      setTimeout(() => {
        setSelectedAvatar(null);
        setBuyingMode(false);
      }, 1500);
  
    } catch (error) {
      console.error('Error al comprar el avatar:', error);
      showMessage('Error al comprar el avatar', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Paginación de avatares
  const nextPage = () => {
    if ((currentPage + 1) * itemsPerPage < avatares.length) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const currentAvatares = avatares.slice(
    currentPage * itemsPerPage, 
    (currentPage + 1) * itemsPerPage
  );

  // Cancelar eliminación de cuenta
  const cancelDelete = () => {
    setConfirmDelete(false);
  };

  // Función para actualizar la foto de perfil del usuario
  const actualizarFotoPerfil = async (url) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ fotoperfil: url })
        .eq('id', user.id);

      if (error) throw error;

      setPerfilData({ ...perfilData, fotoperfil: url });
      showMessage('Foto de perfil actualizada', 'success');
    } catch (error) {
      console.error('Error al actualizar la foto de perfil:', error);
      showMessage('Error al actualizar la foto de perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calcular nivel y progreso
  const nivel = Math.floor(perfilData.totalpuntos / 100) + 1;
  const progresoNivel = perfilData.totalpuntos % 100;

  if (loading && !perfilData.nombre) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-transparent border-cyan-400 rounded-full animate-spin mb-4"></div>
          <div className="text-white text-xl font-gaming">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="pt-20"> 
      
      {/* Fondo con partículas animadas */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900 via-gray-900 to-gray-900"></div>
        <div className="absolute inset-0 opacity-30 bg-[url('/grid-pattern.svg')]"></div>
      </div>
      
      <div className="min-h-screen relative z-10 py-16 px-4">
        {/* Notificación flotante */}
        {message.text && (
          <div className={`fixed top-24 right-4 md:right-8 z-50 max-w-md transform transition-all duration-300 ${
            showNotification ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}>
            <div className={`p-4 rounded-lg shadow-glow flex items-center ${
              message.type === 'error' 
                ? 'bg-red-900/80 text-red-200 shadow-red-500/30' 
                : 'bg-green-900/80 text-green-200 shadow-green-500/30'
            }`}>
              {message.type === 'error' ? 
                <AlertTriangle className="mr-3 flex-shrink-0" size={20} /> : 
                <Sparkles className="mr-3 flex-shrink-0" size={20} />
              }
              <p className="font-medium">{message.text}</p>
            </div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto">
          {/* Encabezado 
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 drop-shadow-glow">
              Perfil de Jugador
            </h1>
            <p className="text-gray-300 mt-3 text-lg">Personaliza tu experiencia en PicGrid</p>
          </div>
          */}
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Panel izquierdo - Foto de perfil con efectos */}
            <div className="bg-gray-800/40 rounded-2xl shadow-xl backdrop-blur-md border border-gray-700/50 overflow-hidden">
              <div className="relative h-20 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('/pattern-hero.svg')] opacity-40 animate-pulse"></div>
                <h2 className="relative text-xl font-bold text-white">Foto de perfíl</h2>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col items-center">
                  <div className="relative mb-8 mt-2">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-spin-slow blur-md opacity-70"></div>
                    <div className="relative z-10">
                      <img 
                        src={perfilData.fotoperfil || '/default-avatar.png'} 
                        alt="Foto de perfil" 
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-cyan-400/50 shadow-glow"
                      />
                    </div>
                    
                    <button 
                      onClick={() => setBuyingMode(!buyingMode)}
                      className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 p-2 rounded-full shadow-glow transition transform hover:scale-110 z-20"
                    >
                      {buyingMode ? <X size={20} /> : <Edit size={20} />}
                    </button>
                  </div>
                  
                  <div className="text-2xl font-bold text-white mb-2">
                    {perfilData.nombre}
                  </div>
                  
                  <div className="flex items-center gap-2 text-lg font-semibold text-cyan-300 mb-4 bg-gray-800/50 py-2 px-4 rounded-full">
                    <Coins size={20} className="text-yellow-400" />
                    <span>{perfilData.totalmonedas} Monedas</span>
                  </div>
                  
                  <div className="w-full bg-gray-700/50 rounded-full p-1 mb-2">
                    <div 
                      className="h-6 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white relative overflow-hidden"
                      style={{ width: `${progresoNivel}%` }}
                    >
                      <div className="absolute inset-0 bg-[url('/shine.svg')] bg-cover opacity-30 animate-shine"></div>
                      <span className="relative z-10">{progresoNivel}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                      Nivel {nivel}
                    </span>
                    <div className="text-xs text-gray-400">
                      {perfilData.totalpuntos % 100}/100 para subir
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <div className="bg-gray-700/50 rounded-lg p-2 flex items-center gap-2">
                      <Trophy size={16} className="text-yellow-400" />
                      <span className="text-sm">Rango Bronce</span>
                    </div>
                    
                    <div className="bg-gray-700/50 rounded-lg p-2 flex items-center gap-2">
                      <Award size={16} className="text-cyan-400" />
                      <span className="text-sm">5 Logros</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Panel central - Información del usuario */}
            <div className="bg-gray-800/40 rounded-2xl shadow-xl backdrop-blur-md border border-gray-700/50 overflow-hidden">
              <div className="relative h-20 bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('/pattern-data.svg')] opacity-40"></div>
                <h2 className="relative text-xl font-bold text-white">Datos del Jugador</h2>
              </div>
              
              <div className="p-6">
                {editing ? (
                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center text-sm text-gray-400 mb-2">
                        <User size={16} className="mr-2" />
                        Nombre
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={perfilData.nombre}
                        onChange={handleChange}
                        className="w-full bg-gray-700/70 border border-gray-600 rounded-lg p-3 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none focus:shadow-glow"
                      />
                    </div>
                    
                    <div>
                      <label className="flex items-center text-sm text-gray-400 mb-2">
                        <Mail size={16} className="mr-2" />
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={perfilData.email}
                        onChange={handleChange}
                        className="w-full bg-gray-700/70 border border-gray-600 rounded-lg p-3 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none focus:shadow-glow"
                      />
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 py-3 px-4 rounded-lg font-medium transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <Save size={18} />
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 py-3 px-4 rounded-lg font-medium transition transform hover:scale-105"
                      >
                        <X size={18} />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center text-sm text-gray-400 mb-2">
                        <User size={16} className="mr-2" />
                        Nombre
                      </label>
                      <div className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-cyan-100">
                        {perfilData.nombre}
                      </div>
                    </div>
                    
                    <div>
                      <label className="flex items-center text-sm text-gray-400 mb-2">
                        <Mail size={16} className="mr-2" />
                        Email
                      </label>
                      <div className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-cyan-100">
                        {perfilData.email}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                      <button
                        onClick={() => setEditing(true)}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 py-3 px-4 rounded-lg font-medium transition transform hover:scale-105 shadow-glow-sm"
                      >
                        <Edit size={18} />
                        Editar Perfil
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Sección eliminar cuenta */}
                <div className="mt-8 pt-6 border-t border-gray-700">              
                  {confirmDelete ? (
                    <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 shadow-glow-red-sm">
                      <div className="flex items-start mb-4">
                        <AlertTriangle className="text-red-400 mr-3 mt-1 flex-shrink-0" size={22} />
                        <p className="text-sm text-red-300">
                          ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={handleDeleteAccount}
                          disabled={loading}
                          className="flex-1 flex items-center justify-center gap-1 bg-red-700 hover:bg-red-800 py-2 px-3 rounded-lg text-sm font-medium transition transform hover:scale-105"
                        >
                          <Trash2 size={16} />
                          Confirmar eliminación
                        </button>
                        <button
                          onClick={cancelDelete}
                          disabled={loading}
                          className="flex-1 flex items-center justify-center gap-1 bg-gray-700 hover:bg-gray-600 py-2 px-3 rounded-lg text-sm font-medium transition transform hover:scale-105"
                        >
                          <X size={16} />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="w-full flex items-center justify-center gap-2 bg-red-700/60 hover:bg-red-700 py-2 px-4 rounded-lg font-medium transition mt-2 transform hover:scale-105"
                    >
                      <Trash2 size={18} />
                      Eliminar cuenta
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Panel derecho - Estadísticas */}
            <div className="bg-gray-800/40 rounded-2xl shadow-xl backdrop-blur-md border border-gray-700/50 overflow-hidden">
              <div className="relative h-20 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('/pattern-stats.svg')] opacity-40"></div>
                <h2 className="relative text-xl font-bold text-white">Estadísticas</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="flex items-center text-gray-300">
                        <Trophy size={16} className="mr-2 text-purple-400" />
                        Puntos Totales
                      </span>
                      <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        {perfilData.totalpuntos}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full"
                        style={{ width: `${Math.min(100, perfilData.totalpuntos / 10)}%` }}
                      >
                        <div className="w-full h-full bg-[url('/shine-line.svg')] bg-cover animate-shine"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="flex items-center text-gray-300">
                        <Coins size={16} className="mr-2 text-yellow-400" />
                        Monedas
                      </span>
                      <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">
                        {perfilData.totalmonedas}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-amber-500 h-full"
                        style={{ width: `${Math.min(100, perfilData.totalmonedas / 10)}%` }}
                      >
                        <div className="w-full h-full bg-[url('/shine-line.svg')] bg-cover animate-shine"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="flex items-center text-gray-300">
                        <Shield size={16} className="mr-2 text-emerald-400" />
                        Partidas Jugadas
                      </span>
                      <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
                         {totalPartidas}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-green-500 h-full"
                        style={{ width: `${Math.min(100, totalPartidas)}%` }}
                      >
                        <div className="w-full h-full bg-[url('/shine-line.svg')] bg-cover animate-shine"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="flex items-center text-gray-300">
                        <Bookmark size={16} className="mr-2 text-orange-400" />
                        Nivel de Jugador
                      </span>
                      <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                        {nivel}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-full"
                        style={{ width: `${progresoNivel}%` }}
                      >
                        <div className="w-full h-full bg-[url('/shine-line.svg')] bg-cover animate-shine"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center mt-8">
                    <button 
                      onClick={() => window.location.href = '/usuario'}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 py-3 px-8 rounded-lg font-medium transition transform hover:scale-105 shadow-glow-sm"
                    >
                      Jugar Ahora
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        {/* Sección de compra de avatares */}
        {buyingMode && (
          <div className="mt-10 bg-gray-800/40 rounded-2xl shadow-xl backdrop-blur-md border border-gray-700/50 overflow-hidden">
            {/* Encabezado con gradiente */}
            <div className="relative h-20 bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('/pattern-shop.svg')] opacity-30 animate-pulse"></div>
              <h2 className="relative text-xl font-bold text-white drop-shadow-glow">Tienda de Avatares</h2>
            </div>
            
            <div className="p-6">
              {/* Indicador de monedas con efecto neón */}
              <div className="flex justify-center mb-6">
                <div className="bg-gray-700/70 rounded-full py-2 px-6 flex items-center gap-2 shadow-glow border border-gray-600/50">
                  <Coins size={22} className="text-yellow-400 animate-pulse" />
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
                    {perfilData.totalmonedas} monedas disponibles
                  </span>
                </div>
              </div>
              
              {/* Cuadrícula de avatares */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {currentAvatares.map((avatar) => (
                  <div 
                    key={avatar.id} 
                    className={`relative bg-gray-700/60 rounded-xl overflow-hidden transition transform hover:scale-105 ${
                      selectedAvatar && selectedAvatar.id === avatar.id 
                        ? 'ring-2 ring-cyan-400 shadow-glow' 
                        : 'border border-gray-600/50'
                    }`}
                  >
                    {/* Indicador de equipado */}
                    {perfilData.fotoperfil === avatar.url && (
                      <div className="absolute top-2 right-2 z-20">
                        <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full p-1 shadow-glow animate-pulse">
                          <div className="bg-green-500 rounded-full p-1">
                            <Star size={12} className="text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Imagen de avatar con efectos */}
                    <div className="relative h-36 overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="absolute w-32 h-32 bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500 rounded-full opacity-60 blur-md animate-spin-slow"></div>
                        <img 
                          src={avatar.url} 
                          alt={`Avatar ${avatar.id}`}
                          className="relative w-24 h-24 rounded-full object-cover border-2 border-gray-600/70 z-10 shadow-lg transform hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    </div>
                    
                    {/* Información del avatar */}
                    <div className="p-4 bg-gradient-to-b from-gray-800/50 to-gray-700/50">
                      <div className="text-center mb-2">
                        <div className="text-sm font-medium text-white mb-1">
                          {avatar.nombre || `Avatar ${avatar.id}`}
                        </div>
                        <div className="flex items-center justify-center gap-1 text-yellow-400 font-bold bg-gray-800/50 rounded-full py-1 px-3 w-fit mx-auto">
                          <Coins size={14} />
                          <span>{avatar.precio}</span>
                        </div>
                      </div>
                      
                      {/* Botón de accion del avatar, con estados */}
                        <button
                          onClick={() => {
                            if (avatar.comprado) {
                              // Si ya está comprado, lo seleccionamos como foto de perfil
                              actualizarFotoPerfil(avatar.url);
                            } else {
                              // Si no está comprado, mostramos la opción de comprar
                              comprarAvatar(avatar);
                            }
                          }}
                          disabled={perfilData.fotoperfil === avatar.url}
                          className={`w-full py-2 px-3 rounded-lg text-sm font-bold transition transform hover:translate-y-[-2px] ${
                            perfilData.fotoperfil === avatar.url
                              ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white cursor-default shadow-glow-sm'
                              : avatar.comprado
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-glow-sm'
                                : perfilData.totalmonedas < avatar.precio
                                  ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-400 cursor-not-allowed opacity-70'
                                  : 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-glow-sm'
                          }`}
                        >
                          {perfilData.fotoperfil === avatar.url
                            ? 'Equipado'
                            : avatar.comprado
                              ? 'Seleccionar'
                              : perfilData.totalmonedas < avatar.precio
                                ? 'Insuficiente'
                                : 'Comprar'}
                        </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Controles de paginación estilizados */}
              {avatares.length > itemsPerPage && (
                <div className="flex justify-center mt-8 gap-4">
                  <button 
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className={`p-2 rounded-full transition transform ${
                      currentPage === 0 
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                        : 'bg-gray-800 hover:bg-gray-700 text-cyan-400 hover:text-cyan-300 hover:scale-110 shadow-glow-sm'
                    }`}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  
                  <div className="flex items-center bg-gray-800/70 rounded-full px-5 py-2 border border-gray-700/50">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-bold">
                      Página {currentPage + 1} de {Math.ceil(avatares.length / itemsPerPage)}
                    </span>
                  </div>
                  
                  <button 
                    onClick={nextPage}
                    disabled={(currentPage + 1) * itemsPerPage >= avatares.length}
                    className={`p-2 rounded-full transition transform ${
                      (currentPage + 1) * itemsPerPage >= avatares.length 
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                        : 'bg-gray-800 hover:bg-gray-700 text-cyan-400 hover:text-cyan-300 hover:scale-110 shadow-glow-sm'
                    }`}
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
    </div>
    </>
  );
}