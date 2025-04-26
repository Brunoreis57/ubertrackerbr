'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { gerarTokenResetSenha } from '../lib/authUtils';
import { FaEnvelope, FaPaperPlane, FaExclamationTriangle, FaCheck, FaArrowLeft } from 'react-icons/fa';

const EsqueciSenhaPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState<{ tipo: 'erro' | 'sucesso'; texto: string } | null>(null);
  const [processando, setProcessando] = useState(false);
  const [solicitacaoEnviada, setSolicitacaoEnviada] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validação básica
    if (!email) {
      setMensagem({ tipo: 'erro', texto: 'Por favor, informe seu email.' });
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMensagem({ tipo: 'erro', texto: 'Email inválido.' });
      return;
    }
    
    try {
      setProcessando(true);
      setMensagem(null);
      
      // Simulação de atraso de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Gerar token para redefinição de senha
      const resultado = gerarTokenResetSenha(email);
      
      if (resultado.sucesso) {
        setMensagem({ tipo: 'sucesso', texto: resultado.mensagem });
        setSolicitacaoEnviada(true);
        
        // Em uma aplicação real, não seria necessário redirecionar,
        // pois o usuário receberia um email com o link para redefinir a senha
      } else {
        setMensagem({ tipo: 'erro', texto: resultado.mensagem });
      }
    } catch (erro) {
      console.error('Erro ao solicitar redefinição de senha:', erro);
      setMensagem({ tipo: 'erro', texto: 'Erro ao processar a solicitação. Tente novamente.' });
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-900 text-white py-4 px-6">
          <h2 className="text-center text-2xl font-bold">Recuperação de Senha</h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            {solicitacaoEnviada 
              ? 'Instruções enviadas para seu email' 
              : 'Informe seu email para recuperar sua senha'}
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
          
          {!solicitacaoEnviada ? (
            <form onSubmit={handleSubmit} className="space-y-6">
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
                      Processando...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2" />
                      Enviar Instruções
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <FaCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Instruções Enviadas!</h3>
              <p className="text-sm text-gray-600 mb-6">
                Enviamos instruções para redefinir sua senha para {email}. 
                Por favor, verifique sua caixa de entrada e siga as instruções.
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Não recebeu o email? Verifique sua pasta de spam ou tente novamente.
              </p>
              
              {/* Em um ambiente real, aqui mostraríamos um link para o token */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Simulação:</strong> Em um ambiente de produção, um email seria enviado. 
                  Para fins de teste, verifique o console para ver o token gerado.
                </p>
              </div>
              
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => {
                    setSolicitacaoEnviada(false);
                    setEmail('');
                    setMensagem(null);
                  }}
                  className="flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <FaArrowLeft className="mr-2" />
                  Tentar Novamente
                </button>
                <Link
                  href="/login"
                  className="flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Voltar para Login
                </Link>
              </div>
            </div>
          )}
          
          {!solicitacaoEnviada && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Lembrou sua senha?{' '}
                <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  Voltar para Login
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EsqueciSenhaPage; 