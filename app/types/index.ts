// Tipo para configurações do veículo
export interface VeiculoConfig {
  modelo: string;
  ano: number;
  consumoMedio: number; // km/litro
  precoGasolina: number; // preço por litro
  valorIPVA: number;
  gastoManutencao: number;
}

// Tipo para uma corrida diária
export interface Corrida {
  id: string;
  data: string; // formato ISO
  horasTrabalhadas: number; // em horas (ex: 8.5 para 8h30min)
  kmRodados: number;
  gastoGasolina: number;
  quantidadeViagens: number;
  ganhoBruto: number;
}

// Tipo para usuário
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  senha: string; // Será armazenada com hash no localStorage
  dataCadastro: string; // formato ISO
  tokenResetSenha?: string;
  expiracaoTokenResetSenha?: number; // timestamp
}

// Tipo para sessão de usuário (usuário logado)
export interface SessaoUsuario {
  id: string;
  nome: string;
  email: string;
  logado: boolean;
  dataLogin: number; // timestamp
  dataExpiracao: number; // timestamp
}

// Tipo para período de visualização
export type Periodo = 'diario' | 'semanal' | 'mensal' | 'anual';

// Tipo para resumo financeiro
export interface ResumoFinanceiro {
  ganhoBruto: number;
  ganhoLiquido: number;
  gastoGasolina: number;
  gastoManutencao: number;
  gastoIPVA: number;
  outrosGastos: number;
}

// Tipo para dados do gráfico
export interface DadosGrafico {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
} 