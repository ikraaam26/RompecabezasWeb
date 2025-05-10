'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Trophy, Medal, Award, User, Crown, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';

export default function LeaderboardTable({ limit = 10, showSearch = true, className = "" }) {
  const [usuarios, setUsuarios] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'totalpuntos', direction: 'desc' });

  // Efecto para obtener los usuarios y clasificarlos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Obtener el usuario actual
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = session.user.id;
        
        // Obtener todos los usuarios ordenados por puntos
        const { data, error } = await supabase
          .from('usuarios')
          .select('id, nombre, email, fotoperfil, totalpuntos, totalmonedas, fechacreacion')
          .order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });
        
        if (error) throw error;
        
        // Asignar posición a cada usuario
        const rankedUsers = data.map((user, index) => ({
          ...user,
          position: index + 1
        }));
        
        setUsuarios(rankedUsers);
        
        if (currentUserId) {
          const currentUserData = rankedUsers.find(user => user.id === currentUserId);
          setCurrentUser(currentUserData);
          
          if (currentUserData) {
            const userPosition = rankedUsers.findIndex(user => user.id === currentUserId) + 1;
            setUserRank(userPosition);
          }
        }
      } catch (error) {
        console.error('Error al cargar los usuarios:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [sortConfig]);
  
  // Función para cambiar el criterio de ordenación
  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };
  
  // Filtrar usuarios por búsqueda
  const filteredUsers = usuarios.filter(user => 
    user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Usuarios limitados para mostrar
  const displayUsers = searchTerm ? filteredUsers : usuarios.slice(0, limit);

  // Renderizar icono según la posición
  const renderPositionIcon = (position) => {
    switch (position) {
      case 1:
        return <Crown className="text-yellow-400" size={20} />;
      case 2:
        return <Medal className="text-gray-400" size={20} />;
      case 3:
        return <Medal className="text-amber-700" size={20} />;
      default:
        return <Trophy className="text-purple-500 opacity-60" size={16} />;
    }
  };
  
  // Renderizar borde según la posición
  const getBorderClass = (position) => {
    switch (position) {
      case 1:
        return 'border-l-yellow-400';
      case 2:
        return 'border-l-gray-400';
      case 3:
        return 'border-l-amber-700';
      default:
        return 'border-l-purple-500/60';
    }
  };

  // Renderizar fondo según la posición
  const getBackgroundClass = (position, isCurrentUser) => {
    if (isCurrentUser) return 'bg-cyan-900/20';
    
    switch (position) {
      case 1:
        return 'bg-yellow-500/10';
      case 2:
        return 'bg-gray-500/10';
      case 3:
        return 'bg-amber-700/10';
      default:
        return position % 2 === 0 ? 'bg-gray-800/40' : 'bg-transparent';
    }
  };

  return (
    <div className={`rounded-xl overflow-hidden bg-gray-900/80 backdrop-blur-md shadow-xl ${className}`}>
      {/* Header con título y búsqueda */}
      <div className="p-5 bg-gradient-to-r from-purple-900/80 to-blue-900/80 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={24} className="text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Clasificación Global</h2>
        </div>
        
        {showSearch && (
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800/60 text-white rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <User size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        )}
      </div>
      
      {/* Tabla de clasificación */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-gray-300 text-sm border-b border-gray-700">
              <th className="py-3 px-4 text-left w-12">#</th>
              <th className="py-3 px-4 text-left">Usuario</th>
              <th 
                className="py-3 px-4 text-right cursor-pointer hover:text-cyan-400 transition-colors"
                onClick={() => requestSort('totalpuntos')}
              >
                <div className="flex items-center justify-end gap-1">
                  Puntos
                  {sortConfig.key === 'totalpuntos' && (
                    sortConfig.direction === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />
                  )}
                </div>
              </th>
              <th 
                className="py-3 px-4 text-right cursor-pointer hover:text-cyan-400 transition-colors"
                onClick={() => requestSort('totalmonedas')}
              >
                <div className="flex items-center justify-end gap-1">
                  Monedas
                  {sortConfig.key === 'totalmonedas' && (
                    sortConfig.direction === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />
                  )}
                </div>
              </th>
            </tr>
          </thead>
          
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-8">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-cyan-400"></div>
                    <span className="text-gray-400">Cargando clasificación...</span>
                  </div>
                </td>
              </tr>
            ) : displayUsers.length > 0 ? (
              displayUsers.map((user) => {
                const isCurrentUser = currentUser && user.id === currentUser.id;
                
                return (
                  <tr 
                    key={user.id} 
                    className={`border-l-4 ${getBorderClass(user.position)} ${getBackgroundClass(user.position, isCurrentUser)} transition-colors hover:bg-gray-700/30`}
                  >
                    <td className="py-4 px-4 font-bold text-gray-300">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800/60">
                        {renderPositionIcon(user.position)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                            {user.fotoperfil ? (
                              <img 
                                src={user.fotoperfil} 
                                alt={user.nombre} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white font-bold">
                                {user.nombre?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                          </div>
                          {isCurrentUser && (
                            <div className="absolute -bottom-1 -right-1 bg-cyan-400 rounded-full p-1">
                              <User size={8} className="text-gray-900" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white flex items-center gap-1">
                            {user.nombre}
                            {isCurrentUser && <span className="text-xs font-normal text-cyan-400">(tú)</span>}
                          </div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="font-bold text-white flex items-center justify-end gap-1">
                        <Sparkles size={14} className="text-yellow-400" />
                        {user.totalpuntos.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="font-medium text-yellow-300 flex items-center justify-end gap-1">
                        🪙 {user.totalmonedas.toLocaleString()}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-400">
                  {searchTerm ? 'No se encontraron usuarios con ese nombre' : 'No hay usuarios para mostrar'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Tarjeta del usuario actual (en caso de que no se muestre en la tabla) */}
      {currentUser && userRank > limit && !searchTerm && (
        <div className="border-t border-gray-700 p-4">
          <div className="flex justify-between items-center p-3 bg-cyan-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800/80 font-bold text-gray-300">
                {userRank}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                  {currentUser.fotoperfil ? (
                    <img 
                      src={currentUser.fotoperfil} 
                      alt={currentUser.nombre} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white font-bold">
                      {currentUser.nombre?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-white flex items-center gap-1">
                    {currentUser.nombre}
                    <span className="text-xs font-normal text-cyan-400">(tú)</span>
                  </div>
                  <div className="text-sm text-gray-400">{currentUser.email}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="font-bold text-white flex items-center justify-end gap-1">
                  <Sparkles size={14} className="text-yellow-400" />
                  {currentUser.totalpuntos.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-yellow-300 flex items-center justify-end gap-1">
                  🪙 {currentUser.totalmonedas.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}