'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Navbar from '../../../components/Navbar';
import { Edit, Save, X, ChevronLeft, ChevronRight, Coins, AlertTriangle, Trash2 } from 'lucide-react';

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
  const itemsPerPage = 4;

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
        
        // Cargar avatares disponibles
        const { data: avatarData, error: avatarError } = await supabase
          .from('avatares')
          .select('*')
          .order('precio', { ascending: true });
        
        if (avatarData) {
          setAvatares(avatarData);
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

  // Guardar cambios en el perfil
  const handleSave = async () => {
    setLoading(true);
    
    try {
      // Actualizar en la tabla usuarios el nombre y el email
      const { error: usuariosError } = await supabase
        .from('usuarios')
        .update({
          nombre: perfilData.nombre,
          email: perfilData.email
        })
        .eq('id', user.id);
        
      if (usuariosError) throw usuariosError;
      
      // Actualizar en auth.users (email)
      const { error: authError } = await supabase.auth.updateUser({
        email: perfilData.email
      });
      
      if (authError) throw authError;
      
      setMessage({ text: 'Perfil actualizado correctamente', type: 'success' });
      setEditing(false);
    } catch (error) {
      console.error('Error al actualizar:', error);
      setMessage({ 
        text: 'Error al actualizar el perfil: ' + (error.message || 'Contacta al administrador'), 
        type: 'error' 
      });
    } finally {
      setLoading(false);
      
      // El mensaje desaparece después de 3 segundos
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
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
      // Eliminar de la tabla usuarios
      const { error: deleteError } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', user.id);

      if (deleteError) throw deleteError;

      // Cambiar el correo en Supabase Auth a 'deleted'
      const { error: authUpdateError } = await supabase.auth.updateUser({
        email: 'deleted_' + user.email,
      });

      if (authUpdateError) throw authUpdateError;

      // Redirigir a la página de inicio
      window.location.href = '/';

    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      setMessage({
        text: 'Error al eliminar la cuenta: ' + (error.message || 'Contacta al administrador'),
        type: 'error'
      });
      setConfirmDelete(false);
      setLoading(false);

      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    }
  };

  // Comprar un avatar
  const comprarAvatar = async (avatar) => {
    if (perfilData.totalmonedas < avatar.precio) {
      setMessage({ text: 'No tienes suficientes monedas', type: 'error' });
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
      return;
    }
    
    setLoading(true);
    
    // Actualizar el usuario con la nueva foto de perfil y restar monedas
    const { error } = await supabase
      .from('usuarios')
      .update({
        fotoperfil: avatar.url,
        totalmonedas: perfilData.totalmonedas - avatar.precio
      })
      .eq('id', user.id);
      
    if (error) {
      setMessage({ text: 'Error al comprar el avatar', type: 'error' });
    } else {
      // Actualizar estado local
      setPerfilData({
        ...perfilData,
        fotoperfil: avatar.url,
        totalmonedas: perfilData.totalmonedas - avatar.precio
      });
      setMessage({ text: '¡Avatar adquirido correctamente!', type: 'success' });
      setBuyingMode(false);
    }
    
    setLoading(false);
    
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 3000);
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

  if (loading && !perfilData.nombre) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (

    <>
    
    <Navbar />

    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-900 text-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            Tu Perfil
          </h1>
          <p className="text-gray-300 mt-2">Personaliza tu experiencia en PicGrid</p>
        </div>
        
        {/* Mensaje de notificación */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
            {message.text}
          </div>
        )}
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Panel izquierdo - Foto de perfil */}
          <div className="bg-gray-800/50 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <img 
                  src={perfilData.fotoperfil} 
                  alt="Foto de perfil" 
                  className="w-48 h-48 rounded-full object-cover border-4 border-cyan-400/50"
                />
                
                <button 
                  onClick={() => setBuyingMode(!buyingMode)}
                  className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 p-2 rounded-full shadow-lg transition transform hover:scale-110"
                >
                  {buyingMode ? <X size={20} /> : <Edit size={20} />}
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-lg font-semibold text-cyan-300 mb-2">
                <Coins size={20} />
                <span>{perfilData.totalmonedas} Monedas</span>
              </div>
              
              <div className="text-gray-300 text-sm">
                Nivel: {Math.floor(perfilData.totalpuntos / 100) + 1}
              </div>
              
              <div className="w-full mt-4 bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2.5 rounded-full" 
                  style={{ 
                    width: `${(perfilData.totalpuntos % 100)}%` 
                  }}
                ></div>
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {perfilData.totalpuntos % 100}/100 puntos para el siguiente nivel
              </div>
            </div>
          </div>
          
          {/* Panel central - Información del usuario */}
          <div className="bg-gray-800/50 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6 text-cyan-300">Información del Usuario</h2>
            
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={perfilData.nombre}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={perfilData.email}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                  />
                </div>
                
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 py-2 px-4 rounded-lg font-medium transition"
                  >
                    <Save size={18} />
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-lg font-medium transition"
                  >
                    <X size={18} />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                  <div className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                    {perfilData.nombre}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <div className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                    {perfilData.email}
                  </div>
                </div>
                
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => setEditing(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 py-2 px-4 rounded-lg font-medium transition"
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
                <div className="bg-red-900/30 border border-red-800 rounded-lg p-4">
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
                      className="flex-1 flex items-center justify-center gap-1 bg-red-700 hover:bg-red-800 py-2 px-3 rounded-lg text-sm font-medium transition"
                    >
                      <Trash2 size={16} />
                      Confirmar eliminación
                    </button>
                    <button
                      onClick={cancelDelete}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-1 bg-gray-700 hover:bg-gray-600 py-2 px-3 rounded-lg text-sm font-medium transition"
                    >
                      <X size={16} />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full flex items-center justify-center gap-2 bg-red-700/60 hover:bg-red-700 py-2 px-4 rounded-lg font-medium transition mt-2"
                >
                  <Trash2 size={18} />
                  Eliminar mi cuenta
                </button>
              )}
            </div>
          </div>
          
          {/* Panel derecho - Estadísticas */}
          <div className="bg-gray-800/50 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6 text-cyan-300">Estadísticas</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Puntos Totales</span>
                  <span className="text-xl font-bold text-purple-300">{perfilData.totalpuntos}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-purple-500 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, perfilData.totalpuntos / 10)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Monedas</span>
                  <span className="text-xl font-bold text-yellow-300">{perfilData.totalmonedas}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-yellow-500 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, perfilData.totalmonedas / 10)}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Puedes añadir más estadísticas aquí */}
              <div className="text-center mt-8">
                <p className="text-sm text-gray-400">Juega más partidas para aumentar tus estadísticas</p>
                <button 
                  onClick={() => window.location.href = '/usuario'}
                  className="mt-4 bg-purple-600 hover:bg-purple-700 py-2 px-6 rounded-lg font-medium transition"
                >
                  Jugar Ahora
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sección de compra de avatares */}
        {buyingMode && (
          <div className="mt-10 bg-gray-800/50 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-cyan-300">Comprar Avatares</h2>
              <div className="flex items-center gap-2">
                <Coins size={18} className="text-yellow-400" />
                <span>{perfilData.totalmonedas} monedas disponibles</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currentAvatares.map((avatar) => (
                <div 
                  key={avatar.id} 
                  className="bg-gray-700/60 rounded-xl p-4 flex flex-col items-center transition hover:bg-gray-700"
                >
                  <img 
                    src={avatar.url} 
                    className="w-24 h-24 rounded-full object-cover mb-3"
                  />
                  <div className="flex items-center gap-1 text-yellow-400 my-2">
                    <Coins size={14} />
                    <span>{avatar.precio}</span>
                  </div>
                  <button
                    onClick={() => comprarAvatar(avatar)}
                    disabled={perfilData.totalmonedas < avatar.precio || perfilData.fotoperfil === avatar.url}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition ${
                      perfilData.fotoperfil === avatar.url 
                        ? 'bg-green-600 cursor-default' 
                        : perfilData.totalmonedas < avatar.precio 
                          ? 'bg-gray-600 cursor-not-allowed opacity-60' 
                          : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {perfilData.fotoperfil === avatar.url 
                      ? 'Actual' 
                      : perfilData.totalmonedas < avatar.precio 
                        ? 'Insuficiente' 
                        : 'Comprar'}
                  </button>
                </div>
              ))}
            </div>
            
            {/* Paginación */}
            {avatares.length > itemsPerPage && (
              <div className="flex justify-center space-x-4 mt-6">
                <button 
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className={`p-2 rounded-full ${
                    currentPage === 0 ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:bg-gray-700'
                  }`}
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="flex items-center">
                  Página {currentPage + 1} de {Math.ceil(avatares.length / itemsPerPage)}
                </div>
                <button 
                  onClick={nextPage}
                  disabled={(currentPage + 1) * itemsPerPage >= avatares.length}
                  className={`p-2 rounded-full ${
                    (currentPage + 1) * itemsPerPage >= avatares.length ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:bg-gray-700'
                  }`}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
}