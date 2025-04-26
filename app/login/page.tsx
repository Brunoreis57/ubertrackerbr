'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fazerLogin, verificarLogin } from '../lib/authUtils';
import { FaEnvelope, FaLock, FaSignInAlt, FaExclamationTriangle, FaCheck } from 'react-icons/fa';

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState<{ tipo: 'erro' | 'sucesso'; texto: string } | null>(null);
  const [processando, setProcessando] = useState(false);
  const [mostrarDepuracao, setMostrarDepuracao] = useState(false);
  const [dadosUsuarios, setDadosUsuarios] = useState<string>('');

  // Captura o parâmetro de redirecionamento, se existir
  const redirecionamento = searchParams?.get('redirecionamento') || '/';

  useEffect(() => {
    // Verificar se já está autenticado
    const { logado } = verificarLogin();
    if (logado) {
      // Se já estiver logado, redirecionar
      router.push(redirecionamento);
    }
  }, [router, redirecionamento]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validações básicas
    if (!email) {
      setMensagem({ tipo: 'erro', texto: 'Por favor, informe seu email.' });
      return;
    }
    
    if (!senha) {
      setMensagem({ tipo: 'erro', texto: 'Por favor, informe sua senha.' });
      return;
    }
    
    try {
      setProcessando(true);
      setMensagem(null);
      
      // Simulação de atraso de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fazer login
      const resultado = fazerLogin(email, senha);
      
      if (resultado.sucesso) {
        setMensagem({ tipo: 'sucesso', texto: resultado.mensagem });
        
        // Redirecionar após login bem-sucedido
        setTimeout(() => {
          router.push(redirecionamento);
        }, 1000);
      } else {
        setMensagem({ tipo: 'erro', texto: resultado.mensagem });
      }
    } catch (erro) {
      console.error('Erro ao fazer login:', erro);
      setMensagem({ tipo: 'erro', texto: 'Erro ao processar o login. Tente novamente.' });
    } finally {
      setProcessando(false);
    }
  };

  const verificarUsuariosCadastrados = () => {
    try {
      const usuariosString = localStorage.getItem('usuarios_cadastrados');
      if (usuariosString) {
        const usuarios = JSON.parse(usuariosString);
        setDadosUsuarios(`Usuários encontrados: ${usuarios.length}\n\nDados: ${JSON.stringify(usuarios, null, 2)}`);
      } else {
        setDadosUsuarios('Nenhum usuário cadastrado encontrado na chave "usuarios_cadastrados"');
      }
    } catch (erro) {
      setDadosUsuarios(`Erro ao verificar usuários: ${erro instanceof Error ? erro.message : String(erro)}`);
    }
    setMostrarDepuracao(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-900 text-white py-4 px-6">
          <h2 className="text-center text-2xl font-bold">Login</h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Acesse sua conta para gerenciar suas corridas
          </p>
        </div>
        
        <div className="px-6 py-8">
          {mensagem && (
            <div 
              className={`mb-6 p-4 rounded-lg flex items-center ${
                mensagem.tipo === 'erro' 
                  ? 'bg-red-100 text-red-800 border border-red-400' 
                  : 'bg-green-100 text-green-800 border border-green-400'
              }`}
            >
              {mensagem.tipo === 'erro' ? (
                <FaExclamationTriangle className="mr-2" />
              ) : (
                <FaCheck className="mr-2" />
              )}
              <span>{mensagem.texto}</span>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="senha"
                  name="senha"
                  type="password"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link 
                  href="/esqueci-senha" 
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={processando}
                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  processando 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                }`}
              >
                {processando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </>
                ) : (
                  <>
                    <FaSignInAlt className="mr-2" />
                    Entrar
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link href="/cadastro" className="font-medium text-primary-600 hover:text-primary-500">
                Cadastre-se
              </Link>
            </p>
            
            {/* Área de depuração (apenas para desenvolvimento) */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <button 
                type="button"
                onClick={verificarUsuariosCadastrados}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Verificar usuários cadastrados (Debug)
              </button>
              
              {mostrarDepuracao && (
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-left">
                  <pre className="whitespace-pre-wrap break-all">
                    {dadosUsuarios}
                  </pre>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setMostrarDepuracao(false)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 