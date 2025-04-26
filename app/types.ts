export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  dataCadastro?: number; // timestamp
}

export interface SessaoUsuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  expiracao: number; // timestamp
} 