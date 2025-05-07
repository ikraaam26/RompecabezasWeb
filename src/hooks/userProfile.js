'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useProfile() {
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
          showMessage('Error al cargar perfil', 'error');
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
      showMessage('Error al eliminar la cuenta: ' + (error.message || 'Contacta al administrador'), 'error');
      setConfirmDelete(false);
      setLoading(false);
    }
  };

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

  return {
    user,
    perfilData,
    editing,
    loading,
    message,
    avatares,
    currentPage,
    buyingMode,
    confirmDelete,
    selectedAvatar,
    showNotification,
    itemsPerPage,
    currentAvatares,
    nivel,
    progresoNivel,
    setEditing,
    setBuyingMode,
    handleChange,
    handleSave,
    handleDeleteAccount,
    cancelDelete,
    comprarAvatar,
    setConfirmDelete,
    actualizarFotoPerfil,
    showMessage,
    nextPage,
    prevPage
  };
}