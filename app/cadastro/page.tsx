'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registrarUsuario, verificarLogin } from '../lib/authUtils';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaUserPlus, FaExclamationTriangle, FaCheck } from 'react-icons/fa';

const CadastroPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmacaoSenha: ''
  });
  const [mensagem, setMensagem] = useState<{ tipo: 'erro' | 'sucesso'; texto: string } | null>(null);
  const [processando, setProcessando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    // Verificar se já está autenticado
    const { logado } = verificarLogin();
    if (logado) {
      // Se já estiver logado, redirecionar para a home
      router.push('/');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo quando o usuário começa a digitar
    if (erros[name]) {
      setErros(prev => {
        const newErros = { ...prev };
        delete newErros[name];
        return newErros;
      });
    }
  };

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};
    
    // Validar nome
    if (!formData.nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 3) {
      novosErros.nome = 'Nome deve ter pelo menos 3 caracteres';
    }
    
    // Validar email
    if (!formData.email.trim()) {
      novosErros.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      novosErros.email = 'Email inválido';
    }
    
    // Validar telefone
    if (!formData.telefone.trim()) {
      novosErros.telefone = 'Telefone é obrigatório';
    } else if (!/^\d{10,11}$/.test(formData.telefone.replace(/\D/g, ''))) {
      novosErros.telefone = 'Telefone inválido (deve ter 10 ou 11 dígitos)';
    }
    
    // Validar senha
    if (!formData.senha) {
      novosErros.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      novosErros.senha = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    // Validar confirmação de senha
    if (formData.senha !== formData.confirmacaoSenha) {
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
      
      // Simulação de atraso de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Registrar usuário
      const resultado = registrarUsuario(
        formData.nome,
        formData.email,
        formData.telefone,
        formData.senha
      );
      
      if (resultado.sucesso) {
        setMensagem({ tipo: 'sucesso', texto: resultado.mensagem });
        
        // Limpar formulário
        setFormData({
          nome: '',
          email: '',
          telefone: '',
          senha: '',
          confirmacaoSenha: ''
        });
        
        // Redirecionar após cadastro bem-sucedido
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setMensagem({ tipo: 'erro', texto: resultado.mensagem });
      }
    } catch (erro) {
      console.error('Erro ao cadastrar usuário:', erro);
      setMensagem({ tipo: 'erro', texto: 'Erro ao processar o cadastro. Tente novamente.' });
    } finally {
      setProcessando(false);
    }
  };

  // Função para formatar número de telefone enquanto digita
  const formatarTelefone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    
    if (value.length > 0) {
      // Formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
      if (value.length <= 10) {
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d)(\d{4})$/, '$1-$2');
      } else {
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d)(\d{4})$/, '$1-$2');
      }
    }
    
    // Atualizar o state com o valor formatado
    setFormData(prev => ({
      ...prev,
      telefone: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-900 text-white py-4 px-6">
          <h2 className="text-center text-2xl font-bold">Cadastro</h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Crie sua conta para gerenciar suas corridas
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
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  autoComplete="name"
                  value={formData.nome}
                  onChange={handleChange}
                  className={`pl-10 block w-full border ${erros.nome ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="Seu nome completo"
                />
              </div>
              {erros.nome && <p className="mt-1 text-sm text-red-600">{erros.nome}</p>}
            </div>

            {/* Email */}
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
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 block w-full border ${erros.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="seu@email.com"
                />
              </div>
              {erros.email && <p className="mt-1 text-sm text-red-600">{erros.email}</p>}
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.telefone}
                  onChange={formatarTelefone}
                  className={`pl-10 block w-full border ${erros.telefone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="(99) 99999-9999"
                />
              </div>
              {erros.telefone && <p className="mt-1 text-sm text-red-600">{erros.telefone}</p>}
            </div>

            {/* Senha */}
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
                  autoComplete="new-password"
                  value={formData.senha}
                  onChange={handleChange}
                  className={`pl-10 block w-full border ${erros.senha ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="••••••••"
                />
              </div>
              {erros.senha && <p className="mt-1 text-sm text-red-600">{erros.senha}</p>}
            </div>

            {/* Confirmação de Senha */}
            <div>
              <label htmlFor="confirmacaoSenha" className="block text-sm font-medium text-gray-700 mb-1">
                Confirme sua Senha
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
                  value={formData.confirmacaoSenha}
                  onChange={handleChange}
                  className={`pl-10 block w-full border ${erros.confirmacaoSenha ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="••••••••"
                />
              </div>
              {erros.confirmacaoSenha && <p className="mt-1 text-sm text-red-600">{erros.confirmacaoSenha}</p>}
            </div>

            <div className="mt-6">
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
                    <FaUserPlus className="mr-2" />
                    Criar Conta
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadastroPage; 