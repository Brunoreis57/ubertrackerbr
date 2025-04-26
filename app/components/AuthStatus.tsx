'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { verificarLogin } from '../lib/authUtils';
import { SessaoUsuario } from '../types';
import { FaUser, FaSignInAlt } from 'react-icons/fa';

const AuthStatus = () => {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [usuario, setUsuario] = useState<SessaoUsuario | null>(null);

  // Verifica se estamos no navegador para evitar erro de hidratação
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Verificar se o usuário está logado
  useEffect(() => {
    const verificarUsuarioLogado = () => {
      const { logado, sessao } = verificarLogin();
      if (logado && sessao) {
        setUsuario(sessao);
      } else {
        setUsuario(null);
      }
    };
    
    if (isMounted) {
      verificarUsuarioLogado();
      
      // Verificar a cada 5 minutos
      const intervalo = setInterval(verificarUsuarioLogado, 5 * 60 * 1000);
      return () => clearInterval(intervalo);
    }
  }, [isMounted, pathname]);

  if (!isMounted) {
    return null; // Não renderizar nada no lado do servidor
  }

  return (
    <div className="flex items-center">
      {usuario ? (
        <Link href="/perfil" className="flex items-center space-x-2 hover:bg-gray-800 px-3 py-2 rounded-lg">
          <FaUser size={16} />
          <span className="hidden sm:inline text-sm font-medium">{usuario.nome.split(' ')[0]}</span>
        </Link>
      ) : (
        <div className="flex space-x-2">
          <Link 
            href="/login" 
            className="flex items-center space-x-1 hover:bg-gray-800 px-3 py-2 rounded-lg text-sm"
          >
            <FaSignInAlt size={16} />
            <span className="hidden sm:inline">Entrar</span>
          </Link>
          <Link 
            href="/cadastro" 
            className="flex items-center space-x-1 bg-white text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm"
          >
            <FaUser size={16} />
            <span className="hidden sm:inline">Cadastrar</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default AuthStatus; 