'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { verificarLogin } from '../lib/authUtils';
import { SessaoUsuario } from '../types';

interface RotaProtegidaProps {
  children: ReactNode;
}

const RotaProtegida = ({ children }: RotaProtegidaProps) => {
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);
  const [sessao, setSessao] = useState<SessaoUsuario | null>(null);

  useEffect(() => {
    const verificarAutenticacao = () => {
      const { logado, sessao } = verificarLogin();
      
      if (!logado) {
        // Redirecionar para login
        router.push('/login?redirecionamento=' + encodeURIComponent(window.location.pathname));
      } else if (sessao) {
        setSessao(sessao);
      }
      
      setVerificando(false);
    };
    
    verificarAutenticacao();
  }, [router]);

  if (verificando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-700">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se chegou aqui, está autenticado
  return <>{children}</>;
};

export default RotaProtegida; 