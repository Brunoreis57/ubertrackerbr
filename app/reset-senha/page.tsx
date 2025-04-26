'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { redefinirSenhaComToken } from '../lib/authUtils';
import { FaLock, FaCheck, FaExclamationTriangle, FaSignInAlt } from 'react-icons/fa';

const ResetSenhaPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [mensagem, setMensagem] = useState<{ tipo: 'erro' | 'sucesso'; texto: string } | null>(null);
  const [processando, setProcessando] = useState(false);
  const [redefinicaoConcluida, setRedefinicaoConcluida] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    // Obter token e email dos parâmetros da URL
    const tokenParam = searchParams?.get('token');
    const emailParam = searchParams?.get('email');
    
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setMensagem({
        tipo: 'erro',
        texto: 'Token de redefinição não encontrado. Solicite uma nova redefinição de senha.'
      });
    }
    
    if (emailParam) {
      setEmail(emailParam);
    } else {
      setMensagem({
        tipo: 'erro',
        texto: 'Email não encontrado. Solicite uma nova redefinição de senha.'
      });
    }
  }, [searchParams]);

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};
    
    // Validar senha
    if (!senha) {
      novosErros.senha = 'Nova senha é obrigatória';
    } else if (senha.length < 6) {
      novosErros.senha = 'A senha deve ter pelo menos 6 caracteres';
    }
    
    // Validar confirmação de senha
    if (senha !== confirmacaoSenha) {
      novosErros.confirmacaoSenha = 'As senhas não coincidem';
    }
    
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    try {
      setProcessando(true);
      setMensagem(null);
      
      // Simular atraso de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!token || !email) {
        setMensagem({
          tipo: 'erro',
          texto: 'Token ou email inválido. Solicite uma nova redefinição de senha.'
        });
        return;
      }
      
      // Redefinir senha
      const resultado = redefinirSenhaComToken(email, token, senha);
      
      if (resultado.sucesso) {
        setMensagem({ tipo: 'sucesso', texto: resultado.mensagem });
        setRedefinicaoConcluida(true);
        
        // Limpar campos
        setSenha('');
        setConfirmacaoSenha('');
      } else {
        setMensagem({ tipo: 'erro', texto: resultado.mensagem });
      }
    } catch (erro) {
      console.error('Erro ao redefinir senha:', erro);
      setMensagem({
        tipo: 'erro',
        texto: 'Erro ao processar a redefinição de senha. Tente novamente.'
      });
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-900 text-white py-4 px-6">
          <h2 className="text-center text-2xl font-bold">Redefinir Senha</h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            {redefinicaoConcluida 
              ? 'Sua senha foi redefinida com sucesso' 
              : 'Crie uma nova senha para sua conta'}
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
          
          {!redefinicaoConcluida ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Redefinindo senha para: <span className="font-medium text-gray-900">{email}</span>
                </p>
              </div>
              
              <div>
                <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="senha"
                    name="senha"
                    type="password"
                    autoComplete="new-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className={`pl-10 block w-full border ${erros.senha ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                    placeholder="••••••••"
                  />
                </div>
                {erros.senha && <p className="mt-1 text-sm text-red-600">{erros.senha}</p>}
              </div>

              <div>
                <label htmlFor="confirmacaoSenha" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirme sua Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmacaoSenha"
                    name="confirmacaoSenha"
                    type="password"
                    autoComplete="new-password"
                    value={confirmacaoSenha}
                    onChange={(e) => setConfirmacaoSenha(e.target.value)}
                    className={`pl-10 block w-full border ${erros.confirmacaoSenha ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                    placeholder="••••••••"
                  />
                </div>
                {erros.confirmacaoSenha && <p className="mt-1 text-sm text-red-600">{erros.confirmacaoSenha}</p>}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={processando || !token || !email}
                  className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    processando || !token || !email
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
                    'Redefinir Senha'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <FaCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Senha Redefinida!</h3>
              <p className="text-sm text-gray-600 mb-6">
                Sua senha foi redefinida com sucesso. Agora você pode fazer login com sua nova senha.
              </p>
              <Link
                href="/login"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <FaSignInAlt className="mr-2" />
                Ir para Login
              </Link>
            </div>
          )}
          
          {!redefinicaoConcluida && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
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

export default ResetSenhaPage; 