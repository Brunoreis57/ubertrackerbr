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
    { href: '/', label: 'Início', icon: <FaHome size={24} />, cor: 'bg-blue-100 dark:bg-blue-800' },
    { href: '/corridas-diarias', label: 'Corridas', icon: <FaTable size={24} />, cor: 'bg-green-100 dark:bg-green-800' },
  ];

  // Links para usuários autenticados
  const linksAutenticados = [
    { href: '/adicionar-corrida', label: 'Nova Corrida', icon: <FaPlus size={24} />, cor: 'bg-purple-100 dark:bg-purple-800' },
    { href: '/relatorios', label: 'Relatórios', icon: <FaChartLine size={24} />, cor: 'bg-yellow-100 dark:bg-yellow-800' },
    { href: '/calculadora', label: 'Calculadora', icon: <FaCalculator size={24} />, cor: 'bg-red-100 dark:bg-red-800' },
    { href: '/backup', label: 'Backup', icon: <FaDatabase size={24} />, cor: 'bg-indigo-100 dark:bg-indigo-800' },
    { href: '/recuperar-contas', label: 'Recuperar', icon: <FaLifeRing size={24} />, cor: 'bg-teal-100 dark:bg-teal-800' },
    { href: '/configuracoes', label: 'Configurações', icon: <FaCog size={24} />, cor: 'bg-gray-100 dark:bg-gray-700' },
  ];

  // Link de login/perfil
  const linkPerfil = usuarioLogado
    ? { href: '/perfil', label: 'Meu Perfil', icon: <FaUser size={24} />, cor: 'bg-pink-100 dark:bg-pink-800' }
    : { href: '/login', label: 'Entrar', icon: <FaUser size={24} />, cor: 'bg-pink-100 dark:bg-pink-800' };

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
          className={`${link.cor} p-4 rounded-lg shadow-lg flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-105 hover:shadow-xl text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700`}
        >
          <div className="mb-2">{link.icon}</div>
          <span className="font-medium">{link.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default MobileNavCards; 