'use client';

import Link from 'next/link';
import { FaHome, FaCog, FaPlus, FaTable, FaChartLine, FaDatabase, FaLifeRing, FaUser, FaCalculator } from 'react-icons/fa';
import { verificarLogin } from '../lib/authUtils';
import { useEffect, useState } from 'react';

const MobileNavCards = () => {
  const [usuarioLogado, setUsuarioLogado] = useState(false);

  useEffect(() => {
    const { logado } = verificarLogin();
    setUsuarioLogado(logado);
  }, []);

  // Links básicos (para todos os usuários)
  const linksBasicos = [
    { href: '/', label: 'Início', icon: <FaHome size={24} className="text-blue-300" />, cor: 'bg-blue-100 dark:bg-blue-900/30', texto: 'text-blue-900 dark:text-blue-100' },
    { href: '/corridas-diarias', label: 'Corridas', icon: <FaTable size={24} className="text-green-300" />, cor: 'bg-green-100 dark:bg-green-900/30', texto: 'text-green-900 dark:text-green-100' },
  ];

  // Links para usuários autenticados
  const linksAutenticados = [
    { href: '/adicionar-corrida', label: 'Nova Corrida', icon: <FaPlus size={24} className="text-purple-300" />, cor: 'bg-purple-100 dark:bg-purple-900/30', texto: 'text-purple-900 dark:text-purple-100' },
    { href: '/relatorios', label: 'Relatórios', icon: <FaChartLine size={24} className="text-yellow-300" />, cor: 'bg-yellow-100 dark:bg-yellow-900/30', texto: 'text-yellow-900 dark:text-yellow-100' },
    { href: '/calculadora', label: 'Calculadora', icon: <FaCalculator size={24} className="text-red-300" />, cor: 'bg-red-100 dark:bg-red-900/30', texto: 'text-red-900 dark:text-red-100' },
    { href: '/backup', label: 'Backup', icon: <FaDatabase size={24} className="text-indigo-300" />, cor: 'bg-indigo-100 dark:bg-indigo-900/30', texto: 'text-indigo-900 dark:text-indigo-100' },
    { href: '/recuperar-contas', label: 'Recuperar', icon: <FaLifeRing size={24} className="text-teal-300" />, cor: 'bg-teal-100 dark:bg-teal-900/30', texto: 'text-teal-900 dark:text-teal-100' },
    { href: '/configuracoes', label: 'Configurações', icon: <FaCog size={24} className="text-gray-300" />, cor: 'bg-gray-100 dark:bg-gray-800/50', texto: 'text-gray-900 dark:text-gray-100' },
  ];

  // Link de login/perfil
  const linkPerfil = usuarioLogado
    ? { href: '/perfil', label: 'Meu Perfil', icon: <FaUser size={24} className="text-pink-300" />, cor: 'bg-pink-100 dark:bg-pink-900/30', texto: 'text-pink-900 dark:text-pink-100' }
    : { href: '/login', label: 'Entrar', icon: <FaUser size={24} className="text-pink-300" />, cor: 'bg-pink-100 dark:bg-pink-900/30', texto: 'text-pink-900 dark:text-pink-100' };

  // Combinação de links com base no status de autenticação
  const links = usuarioLogado 
    ? [...linksBasicos, ...linksAutenticados, linkPerfil]
    : [...linksBasicos, linkPerfil];

  return (
    <div className="grid grid-cols-2 gap-4 sm:hidden">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`${link.cor} p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center transition-transform hover:scale-105`}
        >
          <div className="mb-2">{link.icon}</div>
          <span className={`font-medium ${link.texto}`}>{link.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default MobileNavCards; 