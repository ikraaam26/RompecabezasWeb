'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Leaderboard({ compact = false }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'totalpuntos', direction: 'desc' });

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombre, fotoperfil, totalpuntos, totalmonedas')
        .order('totalpuntos', { ascending: false })
        .limit(compact ? 5 : 20);

      if (data) setLeaderboardData(data);
      setIsLoading(false);
    };

    fetchLeaderboard();
  }, [compact]);

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });

    setLeaderboardData([...leaderboardData].sort((a, b) => {
      if (a[key.toLowerCase()] < b[key.toLowerCase()]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[key.toLowerCase()] > b[key.toLowerCase()]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    }));
  };

  const getSortIcon = (name) => {
    if (sortConfig.key === name) {
      return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
    }
    return null;
  };

  const getPositionIcon = (position) => {
    if (position === 0) return <Crown className="w-6 h-6 text-yellow-300" />;
    if (position === 1) return <Medal className="w-6 h-6 text-gray-300" />;
    if (position === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center font-bold text-purple-300">{position + 1}</span>;
  };

  if (isLoading) {
    return (
      <div className="w-full bg-black/30 backdrop-blur-lg rounded-xl shadow-lg border border-purple-700 p-6 animate-pulse">
        <div className="h-8 bg-purple-900/50 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-purple-900/30 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full bg-black/30 backdrop-blur-lg rounded-xl shadow-lg border border-purple-700 overflow-hidden ${compact ? 'max-w-lg' : 'max-w-4xl'} mx-auto`}>
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Trophy className="mr-2" /> Clasificación Top Jugadores
          </h2>
          {compact && (
            <a href="/clasificacion" className="text-white hover:text-purple-200 text-sm font-medium">
              Ver todos
            </a>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-purple-800">
          <thead className="bg-black/50">
            <tr>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                #
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                Jugador
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('totalpuntos')}
              >
                <div className="flex items-center">
                  Puntos
                </div>
              </th>
              {!compact && (
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('totalmonedas')}
                >
                  <div className="flex items-center">
                    Monedas {getSortIcon('totalmonedas')}
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-900/60">
            {leaderboardData.slice(0, compact ? 5 : leaderboardData.length).map((user, index) => (
              <tr key={user.id} className={index < 3 ? "bg-purple-900/20 hover:bg-purple-900/30" : "hover:bg-purple-900/10"}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center justify-center">
                    {getPositionIcon(index)}
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full object-cover border border-purple-500" src={user.fotoperfil} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">{user.nombre}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="text-sm text-purple-200 font-semibold">{user.totalpuntos.toLocaleString()}</div>
                </td>
                {!compact && (
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm text-purple-200">{user.totalmonedas.toLocaleString()}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {compact && (
        <div className="bg-black/20 px-4 py-3 flex justify-center">
          <a
            href="usuario/clasificacion"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded transition duration-300"
          >
            Ver clasificación completa
          </a>
        </div>
      )}
    </div>
  );
}