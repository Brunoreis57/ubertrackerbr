'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { verificarLogin, logout } from '../lib/authUtils';
import { SessaoUsuario, Usuario } from '../types';
import { carregarDados, salvarDados } from '../lib/utils';
import RotaProtegida from '../components/RotaProtegida';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaSave, FaSignOutAlt, FaExclamationTriangle, FaCheck } from 'react-icons/fa';

const PerfilPage = () => {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [sessao, setSessao] = useState<SessaoUsuario | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senhaAtual: '',
    novaSenha: '',
    confirmacaoSenha: ''
  });
  const [mensagem, setMensagem] = useState<{ tipo: 'erro' | 'sucesso'; texto: string } | null>(null);
  const [processando, setProcessando] = useState(false);
  const [mostrarTrocaSenha, setMostrarTrocaSenha] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  const carregarDadosUsuario = () => {
    // Verificar login
    const { logado, sessao: sessaoAtiva } = verificarLogin();
    
    if (!logado || !sessaoAtiva) {
      router.push('/login');
      return;
    }
    
    setSessao(sessaoAtiva);
    
    // Carregar dados completos do usuário
    const usuarios = carregarDados<Usuario[]>('usuarios', []);
    const usuarioEncontrado = usuarios.find(u => u.id === sessaoAtiva.id);
    
    if (usuarioEncontrado) {
      setUsuario(usuarioEncontrado);
      setFormData({
        ...formData,
        nome: usuarioEncontrado.nome,
        email: usuarioEncontrado.email,
        telefone: usuarioEncontrado.telefone
      });
    }
  };

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

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};
    
    // Validar nome
    if (!formData.nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 3) {
      novosErros.nome = 'Nome deve ter pelo menos 3 caracteres';
    }
    
    // Validar telefone
    if (!formData.telefone.trim()) {
      novosErros.telefone = 'Telefone é obrigatório';
    } else if (!/^\d{10,11}$/.test(formData.telefone.replace(/\D/g, ''))) {
      novosErros.telefone = 'Telefone inválido (deve ter 10 ou 11 dígitos)';
    }
    
    // Validar senha apenas se o usuário estiver tentando alterá-la
    if (mostrarTrocaSenha) {
      if (!formData.senhaAtual) {
        novosErros.senhaAtual = 'Senha atual é obrigatória';
      }
      
      if (!formData.novaSenha) {
        novosErros.novaSenha = 'Nova senha é obrigatória';
      } else if (formData.novaSenha.length < 6) {
        novosErros.novaSenha = 'Nova senha deve ter pelo menos 6 caracteres';
      }
      
      if (formData.novaSenha !== formData.confirmacaoSenha) {
        novosErros.confirmacaoSenha = 'As senhas não coincidem';
      }
    }
    
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    if (!usuario) {
      setMensagem({ tipo: 'erro', texto: 'Usuário não encontrado.' });
      return;
    }
    
    try {
      setProcessando(true);
      setMensagem(null);
      
      // Simulação de atraso de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Carregar usuários
      const usuarios = carregarDados<Usuario[]>('usuarios', []);
      
      // Encontrar e atualizar o usuário
      const usuariosAtualizados = usuarios.map(u => {
        if (u.id === usuario.id) {
          const usuarioAtualizado = { ...u, nome: formData.nome, telefone: formData.telefone };
          
          // Atualizar senha se necessário
          if (mostrarTrocaSenha && formData.senhaAtual && formData.novaSenha) {
            // Simular verificação de senha - em produção usaria bcrypt
            const senhaAtualHash = formData.senhaAtual.split('').reverse().join('') + '_hashed';
            
            if (senhaAtualHash !== u.senha) {
              throw new Error('Senha atual incorreta');
            }
            
            // Simular novo hash da senha - em produção usaria bcrypt
            const novaSenhaHash = formData.novaSenha.split('').reverse().join('') + '_hashed';
            usuarioAtualizado.senha = novaSenhaHash;
          }
          
          return usuarioAtualizado;
        }
        return u;
      });
      
      // Salvar usuários atualizados
      salvarDados('usuarios', usuariosAtualizados);
      
      // Atualizar o estado local
      setUsuario(usuariosAtualizados.find(u => u.id === usuario.id) || null);
      
      // Limpar campos de senha
      setFormData(prev => ({
        ...prev,
        senhaAtual: '',
        novaSenha: '',
        confirmacaoSenha: ''
      }));
      
      // Esconder seção de troca de senha
      setMostrarTrocaSenha(false);
      
      setMensagem({ tipo: 'sucesso', texto: 'Perfil atualizado com sucesso!' });
    } catch (erro) {
      console.error('Erro ao atualizar perfil:', erro);
      setMensagem({ 
        tipo: 'erro', 
        texto: erro instanceof Error ? erro.message : 'Erro ao atualizar perfil. Tente novamente.' 
      });
    } finally {
      setProcessando(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
      router.push('/login');
    }
  };

  return (
    <RotaProtegida>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Meu Perfil</h1>
        
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
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-900 text-white p-4">
            <div className="flex items-center">
              <div className="mr-4 flex items-center justify-center h-12 w-12 rounded-full bg-gray-700 text-white">
                <FaUser size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{usuario?.nome || '...'}</h2>
                <p className="text-sm text-gray-300">{usuario?.email || '...'}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
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

              {/* Email (somente leitura) */}
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
                    value={formData.email}
                    disabled
                    className="pl-10 block w-full border border-gray-300 bg-gray-100 rounded-md shadow-sm py-2 px-3 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">O email não pode ser alterado</p>
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

              {/* Alteração de Senha */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Alterar Senha</h3>
                  <button 
                    type="button"
                    onClick={() => setMostrarTrocaSenha(!mostrarTrocaSenha)}
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    {mostrarTrocaSenha ? 'Cancelar' : 'Alterar senha'}
                  </button>
                </div>
                
                {mostrarTrocaSenha && (
                  <div className="space-y-4">
                    {/* Senha Atual */}
                    <div>
                      <label htmlFor="senhaAtual" className="block text-sm font-medium text-gray-700 mb-1">
                        Senha Atual
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="senhaAtual"
                          name="senhaAtual"
                          type="password"
                          value={formData.senhaAtual}
                          onChange={handleChange}
                          className={`pl-10 block w-full border ${erros.senhaAtual ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                          placeholder="••••••••"
                        />
                      </div>
                      {erros.senhaAtual && <p className="mt-1 text-sm text-red-600">{erros.senhaAtual}</p>}
                    </div>

                    {/* Nova Senha */}
                    <div>
                      <label htmlFor="novaSenha" className="block text-sm font-medium text-gray-700 mb-1">
                        Nova Senha
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="novaSenha"
                          name="novaSenha"
                          type="password"
                          value={formData.novaSenha}
                          onChange={handleChange}
                          className={`pl-10 block w-full border ${erros.novaSenha ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                          placeholder="••••••••"
                        />
                      </div>
                      {erros.novaSenha && <p className="mt-1 text-sm text-red-600">{erros.novaSenha}</p>}
                    </div>

                    {/* Confirmação de Nova Senha */}
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
                          value={formData.confirmacaoSenha}
                          onChange={handleChange}
                          className={`pl-10 block w-full border ${erros.confirmacaoSenha ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                          placeholder="••••••••"
                        />
                      </div>
                      {erros.confirmacaoSenha && <p className="mt-1 text-sm text-red-600">{erros.confirmacaoSenha}</p>}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 flex justify-between">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <FaSignOutAlt className="mr-2" />
                  Sair da Conta
                </button>
                
                <button
                  type="submit"
                  disabled={processando}
                  className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                    processando 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                  }`}
                >
                  {processando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </RotaProtegida>
  );
};

export default PerfilPage; 