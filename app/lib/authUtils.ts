'use client';

import { Usuario, SessaoUsuario } from '../types';
import { gerarId, salvarDados, carregarDados } from './utils';

const CHAVE_SESSAO = 'sessao_usuario';
const CHAVE_USUARIOS = 'usuarios_cadastrados';
const TEMPO_EXPIRACAO = 24 * 60 * 60 * 1000; // 24 horas em milissegundos

// Simula um hash de senha (em produção seria usado bcrypt ou similar)
const hashSenha = (senha: string): string => {
  // Implementação simples para demonstração
  // Em um ambiente real, use bcrypt ou similar
  return senha.split('').reverse().join('') + '_hashed';
};

// Verifica se o hash da senha corresponde
const verificarSenha = (senha: string, hashArmazenado: string): boolean => {
  const hash = hashSenha(senha);
  return hash === hashArmazenado;
};

// Registrar um novo usuário
export const registrarUsuario = (
  nome: string,
  email: string,
  telefone: string,
  senha: string
): { sucesso: boolean; mensagem: string; usuario?: Usuario } => {
  try {
    // Carregar usuários existentes usando a mesma chave que o login utiliza
    const usuariosString = localStorage.getItem(CHAVE_USUARIOS) || '[]';
    const usuarios: Usuario[] = JSON.parse(usuariosString);
    
    // Verificar se o email já está em uso
    if (usuarios.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return {
        sucesso: false,
        mensagem: 'Este email já está em uso. Tente outro ou faça login.'
      };
    }
    
    // Criar novo usuário
    const novoUsuario: Usuario = {
      id: `user_${Date.now()}`,
      nome,
      email,
      telefone,
      senha: senha, // Usar a senha diretamente para compatibilidade
      dataCadastro: new Date().toISOString()
    };
    
    // Adicionar à lista e salvar
    usuarios.push(novoUsuario);
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
    
    // Log para debug
    console.log(`Usuário cadastrado com sucesso. Total agora: ${usuarios.length}`);
    console.log('Chave usada:', CHAVE_USUARIOS);
    console.log('Dados salvos:', JSON.stringify(usuarios).slice(0, 100) + '...');
    
    return {
      sucesso: true,
      mensagem: 'Usuário registrado com sucesso!',
      usuario: novoUsuario
    };
  } catch (erro) {
    console.error('Erro ao registrar usuário:', erro);
    return {
      sucesso: false,
      mensagem: 'Erro ao registrar usuário. Tente novamente.'
    };
  }
};

// Fazer login
export const fazerLogin = (
  email: string,
  senha: string
): { sucesso: boolean; mensagem: string; usuario?: SessaoUsuario } => {
  try {
    const usuariosString = localStorage.getItem(CHAVE_USUARIOS);
    if (!usuariosString) {
      return { 
        sucesso: false, 
        mensagem: 'Nenhum usuário encontrado. Por favor, cadastre-se primeiro.' 
      };
    }

    const usuarios: Usuario[] = JSON.parse(usuariosString);
    const usuario = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!usuario) {
      return { 
        sucesso: false, 
        mensagem: 'Email não encontrado. Por favor, verifique seus dados ou cadastre-se.' 
      };
    }

    if (usuario.senha !== senha) {
      return { 
        sucesso: false, 
        mensagem: 'Senha incorreta. Por favor, tente novamente.' 
      };
    }

    // Criar sessão de usuário
    const sessao: SessaoUsuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      expiracao: Date.now() + TEMPO_EXPIRACAO
    };

    // Salvar sessão no localStorage
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
    
    // Definir um cookie para que o middleware possa verificar a autenticação
    document.cookie = `sessao_usuario=${usuario.id}; path=/; max-age=${TEMPO_EXPIRACAO / 1000}; SameSite=Strict`;

    return { 
      sucesso: true, 
      mensagem: 'Login realizado com sucesso!',
      usuario: sessao
    };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return { 
      sucesso: false, 
      mensagem: 'Ocorreu um erro ao realizar o login. Por favor, tente novamente.' 
    };
  }
};

// Verificar se há um usuário logado
export const verificarLogin = (): { logado: boolean; sessao: SessaoUsuario | null } => {
  if (typeof window === 'undefined') {
    return { logado: false, sessao: null };
  }

  try {
    const sessaoString = localStorage.getItem(CHAVE_SESSAO);
    if (!sessaoString) {
      return { logado: false, sessao: null };
    }

    const sessao: SessaoUsuario = JSON.parse(sessaoString);
    
    // Verificar se a sessão expirou
    if (Date.now() > sessao.expiracao) {
      logout();
      return { logado: false, sessao: null };
    }

    return { logado: true, sessao };
  } catch (error) {
    console.error('Erro ao verificar login:', error);
    return { logado: false, sessao: null };
  }
};

// Fazer logout
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CHAVE_SESSAO);
    
    // Remover cookie de sessão
    document.cookie = 'sessao_usuario=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
  }
};

// Gerar token para redefinição de senha
export const gerarTokenResetSenha = (
  email: string
): { sucesso: boolean; mensagem: string; token?: string } => {
  try {
    const usuariosString = localStorage.getItem(CHAVE_USUARIOS);
    if (!usuariosString) {
      return { 
        sucesso: false, 
        mensagem: 'Nenhum usuário encontrado.' 
      };
    }

    const usuarios: Usuario[] = JSON.parse(usuariosString);
    const usuario = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!usuario) {
      return { 
        sucesso: false, 
        mensagem: 'Email não encontrado.' 
      };
    }

    // Gerar token aleatório
    const token = Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15);
    
    // Em um ambiente real, o token seria armazenado em um banco de dados
    // com um tempo de expiração e enviado por email.
    // Aqui apenas simulamos armazenando no localStorage
    
    const tokensResetString = localStorage.getItem('tokens_reset') || '{}';
    const tokensReset = JSON.parse(tokensResetString);
    
    tokensReset[email] = {
      token,
      expiracao: Date.now() + (30 * 60 * 1000) // 30 minutos
    };
    
    localStorage.setItem('tokens_reset', JSON.stringify(tokensReset));

    // Em um sistema real, aqui enviaria o email com o link de redefinição
    console.log(`Link de recuperação: /reset-senha?token=${token}&email=${encodeURIComponent(email)}`);

    return { 
      sucesso: true, 
      mensagem: 'Instruções de recuperação de senha foram enviadas para seu email.',
      token // Retornamos o token apenas para testes
    };
  } catch (error) {
    console.error('Erro ao gerar token de recuperação:', error);
    return { 
      sucesso: false, 
      mensagem: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.' 
    };
  }
};

// Redefinir senha com token
export const redefinirSenhaComToken = (
  email: string,
  token: string,
  novaSenha: string
): { sucesso: boolean; mensagem: string } => {
  try {
    // Verificar token
    const tokensResetString = localStorage.getItem('tokens_reset') || '{}';
    const tokensReset = JSON.parse(tokensResetString);
    
    const tokenInfo = tokensReset[email];
    
    if (!tokenInfo || tokenInfo.token !== token) {
      return { 
        sucesso: false, 
        mensagem: 'Token inválido ou expirado.' 
      };
    }
    
    if (Date.now() > tokenInfo.expiracao) {
      delete tokensReset[email];
      localStorage.setItem('tokens_reset', JSON.stringify(tokensReset));
      
      return { 
        sucesso: false, 
        mensagem: 'Token expirado. Por favor, solicite novamente a recuperação de senha.' 
      };
    }
    
    // Atualizar senha do usuário
    const usuariosString = localStorage.getItem(CHAVE_USUARIOS);
    if (!usuariosString) {
      return { 
        sucesso: false, 
        mensagem: 'Nenhum usuário encontrado.' 
      };
    }

    const usuarios: Usuario[] = JSON.parse(usuariosString);
    const index = usuarios.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (index === -1) {
      return { 
        sucesso: false, 
        mensagem: 'Usuário não encontrado.' 
      };
    }

    // Atualizar senha
    usuarios[index].senha = novaSenha;
    
    // Salvar lista atualizada
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
    
    // Remover token usado
    delete tokensReset[email];
    localStorage.setItem('tokens_reset', JSON.stringify(tokensReset));

    return { 
      sucesso: true, 
      mensagem: 'Senha redefinida com sucesso! Agora você pode fazer login com sua nova senha.' 
    };
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return { 
      sucesso: false, 
      mensagem: 'Ocorreu um erro ao redefinir sua senha. Por favor, tente novamente.' 
    };
  }
};

export const cadastrarUsuario = (
  usuario: Omit<Usuario, 'id'>
): { sucesso: boolean; mensagem: string; id?: string } => {
  try {
    // Verificar se já existe um usuário com este email
    const usuariosString = localStorage.getItem(CHAVE_USUARIOS) || '[]';
    const usuarios: Usuario[] = JSON.parse(usuariosString);
    
    const emailExistente = usuarios.some(
      u => u.email.toLowerCase() === usuario.email.toLowerCase()
    );
    
    if (emailExistente) {
      return { 
        sucesso: false, 
        mensagem: 'Já existe um usuário cadastrado com este email.' 
      };
    }
    
    // Criar novo ID para o usuário
    const novoId = `user_${Date.now()}`;
    
    // Adicionar novo usuário à lista
    const novoUsuario: Usuario = {
      ...usuario,
      id: novoId
    };
    
    usuarios.push(novoUsuario);
    
    // Salvar lista atualizada
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
    
    return { 
      sucesso: true, 
      mensagem: 'Cadastro realizado com sucesso!',
      id: novoId
    };
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    return { 
      sucesso: false, 
      mensagem: 'Ocorreu um erro ao cadastrar. Por favor, tente novamente.'
    };
  }
};

export const atualizarUsuario = (
  id: string,
  dadosAtualizados: Partial<Omit<Usuario, 'id' | 'email'>>
): { sucesso: boolean; mensagem: string; usuario?: Usuario } => {
  try {
    const usuariosString = localStorage.getItem(CHAVE_USUARIOS);
    if (!usuariosString) {
      return { 
        sucesso: false, 
        mensagem: 'Nenhum usuário encontrado.' 
      };
    }

    const usuarios: Usuario[] = JSON.parse(usuariosString);
    const index = usuarios.findIndex(u => u.id === id);

    if (index === -1) {
      return { 
        sucesso: false, 
        mensagem: 'Usuário não encontrado.' 
      };
    }

    // Atualizar dados do usuário
    const usuarioAtualizado = {
      ...usuarios[index],
      ...dadosAtualizados
    };

    usuarios[index] = usuarioAtualizado;

    // Salvar lista atualizada
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));

    // Se a sessão estiver ativa, atualizar os dados da sessão também
    const { logado, sessao } = verificarLogin();
    if (logado && sessao && sessao.id === id) {
      const novaSessao: SessaoUsuario = {
        ...sessao,
        nome: usuarioAtualizado.nome,
        telefone: usuarioAtualizado.telefone
      };
      localStorage.setItem(CHAVE_SESSAO, JSON.stringify(novaSessao));
    }

    return { 
      sucesso: true, 
      mensagem: 'Dados atualizados com sucesso!',
      usuario: usuarioAtualizado
    };
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return { 
      sucesso: false, 
      mensagem: 'Ocorreu um erro ao atualizar os dados. Por favor, tente novamente.' 
    };
  }
}; 