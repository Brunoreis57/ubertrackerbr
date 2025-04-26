'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaCog, FaPlus, FaTable, FaBars, FaTimes, FaChartLine, FaDatabase, FaLifeRing, FaUser, FaTaxi, FaCalculator, FaMoon, FaSun } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import AuthStatus from './AuthStatus';
import { verificarLogin } from '../lib/authUtils';
import { SessaoUsuario } from '../types';

interface NavbarProps {
  children?: React.ReactNode;
}

const Navbar = ({ children }: NavbarProps) => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [usuario, setUsuario] = useState<SessaoUsuario | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Verifica se estamos no navegador para evitar erro de hidratação
  useEffect(() => {
    setIsMounted(true);
    
    // Detectar tamanho inicial da tela
    const checkScreenSize = () => {
      const isLarge = window.innerWidth >= 1024;
      setIsLargeScreen(isLarge);
      
      // Se mudou para tela grande, abrir o sidebar automaticamente
      // Se mudou para tela pequena, fechar o sidebar automaticamente
      setIsSidebarOpen(isLarge);
    };
    
    // Verificar o tamanho inicial da tela
    checkScreenSize();
    
    // Adicionar listener para mudanças de tamanho de tela
    window.addEventListener('resize', checkScreenSize);
    
    // Limpar listener ao desmontar o componente
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Verificar status de autenticação
  useEffect(() => {
    if (isMounted) {
      const { logado, sessao } = verificarLogin();
      setUsuario(logado ? sessao : null);
      
      // Verificar a cada 5 minutos
      const intervalo = setInterval(() => {
        const { logado, sessao } = verificarLogin();
        setUsuario(logado ? sessao : null);
      }, 5 * 60 * 1000);
      
      // Carregar a preferência de tema do localStorage
      const savedDarkMode = localStorage.getItem('darkMode');
      const prefersDarkMode = savedDarkMode === 'true';
      setDarkMode(prefersDarkMode);
      
      // Aplicar o tema ao body
      if (prefersDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return () => clearInterval(intervalo);
    }
  }, [isMounted, pathname]);

  // Alternar modo escuro
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Fecha o sidebar se o usuário clicar fora dele (apenas em telas pequenas)
  const handleOverlayClick = () => {
    if (!isLargeScreen) {
      setIsSidebarOpen(false);
    }
  };

  // Itens de navegação base (disponíveis para todos)
  const navItemsBase = [
    { href: '/', label: 'Início', icon: <FaHome size={20} /> },
    { href: '/corridas-diarias', label: 'Corridas Diárias', icon: <FaTable size={20} /> },
  ];
  
  // Itens de navegação para usuários autenticados
  const navItemsAutenticado = [
    { href: '/adicionar-corrida', label: 'Adicionar Corrida', icon: <FaPlus size={20} /> },
    { href: '/relatorios', label: 'Relatórios', icon: <FaChartLine size={20} /> },
    { href: '/calculadora', label: 'Calculadora', icon: <FaCalculator size={20} /> },
    { href: '/backup', label: 'Backup e Restauração', icon: <FaDatabase size={20} /> },
    { href: '/recuperar-contas', label: 'Recuperar Corridas', icon: <FaLifeRing size={20} /> },
    { href: '/configuracoes', label: 'Configurações', icon: <FaCog size={20} /> },
  ];
  
  // Itens de gerenciamento de conta
  const navItemsConta = [
    { href: '/perfil', label: 'Meu Perfil', icon: <FaUser size={20} /> },
  ];
  
  // Combinar itens com base no status de autenticação
  const navItems = usuario 
    ? [...navItemsBase, ...navItemsAutenticado, ...navItemsConta] 
    : [...navItemsBase, { href: '/login', label: 'Entrar', icon: <FaUser size={20} /> }];

  if (!isMounted) {
    return (
      <header className="h-16 bg-gray-900 text-white shadow-md sticky top-0 z-40 flex items-center justify-between px-4">
        <div className="flex items-center">
          <FaTaxi size={24} className="text-white mr-3" />
          <div className="text-xl font-bold">BR UBER</div>
        </div>
      </header>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header fixo no topo */}
      <header className="h-16 bg-gray-900 text-white shadow-md sticky top-0 z-40 flex items-center justify-between px-4">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 mr-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 lg:hidden hover:bg-gray-800"
            aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isSidebarOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
          <FaTaxi size={24} className="text-white mr-3" />
          <div className="text-xl font-bold">BR UBER</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 hover:bg-gray-800"
            aria-label={darkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
          >
            {darkMode ? <FaSun size={22} className="text-yellow-300" /> : <FaMoon size={22} />}
          </button>
          <AuthStatus />
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Overlay - aparece apenas quando o sidebar está aberto em telas pequenas */}
        {isSidebarOpen && !isLargeScreen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-30 lg:hidden transition-opacity duration-300"
            onClick={handleOverlayClick}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`fixed lg:static left-0 top-16 h-[calc(100vh-4rem)] bg-gray-800 text-white w-64 shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen || isLargeScreen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <FaChartLine size={20} />
                <span className="font-semibold">Navegação</span>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (!isLargeScreen) {
                          setIsSidebarOpen(false);
                        }
                      }}
                      className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                        pathname === item.href
                          ? 'bg-black text-white border-l-4 border-white'
                          : 'text-gray-200 hover:bg-gray-900 hover:text-white'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="p-4 border-t border-gray-700 text-xs text-gray-300">
              <p>© 2023 BR UBER</p>
              <p>Versão 1.0</p>
            </div>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 p-4 lg:p-6 bg-gray-100 dark:bg-gray-900 dark:text-white transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Navbar; 