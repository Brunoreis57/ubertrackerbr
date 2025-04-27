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
    { href: '/', label: 'Início', icon: <FaHome size={24} />, cor: 'bg-white' },
    { href: '/corridas-diarias', label: 'Corridas', icon: <FaTable size={24} />, cor: 'bg-white' },
  ];

  // Links para usuários autenticados
  const linksAutenticados = [
    { href: '/adicionar-corrida', label: 'Nova Corrida', icon: <FaPlus size={24} />, cor: 'bg-white' },
    { href: '/relatorios', label: 'Relatórios', icon: <FaChartLine size={24} />, cor: 'bg-white' },
    { href: '/calculadora', label: 'Calculadora', icon: <FaCalculator size={24} />, cor: 'bg-white' },
    { href: '/backup', label: 'Backup', icon: <FaDatabase size={24} />, cor: 'bg-white' },
    { href: '/recuperar-contas', label: 'Recuperar', icon: <FaLifeRing size={24} />, cor: 'bg-white' },
    { href: '/configuracoes', label: 'Configurações', icon: <FaCog size={24} />, cor: 'bg-white' },
  ];

  // Link de login/perfil
  const linkPerfil = usuarioLogado
    ? { href: '/perfil', label: 'Meu Perfil', icon: <FaUser size={24} />, cor: 'bg-white' }
    : { href: '/login', label: 'Entrar', icon: <FaUser size={24} />, cor: 'bg-white' };

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
          className={`${link.cor} p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center transition-transform hover:scale-105 text-gray-900`}
        >
          <div className="mb-2">{link.icon}</div>
          <span className="font-medium">{link.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default MobileNavCards; 