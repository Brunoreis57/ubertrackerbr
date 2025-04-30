'use client';
import { Corrida, Periodo, ResumoFinanceiro, VeiculoConfig } from '../types';
import { format, subDays, subMonths, subWeeks, subYears, isWithinInterval, startOfDay, endOfDay, parseISO, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função para gerar ID único
export const gerarId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Função para formatar data
export const formatarData = (data: string | Date, formatoSaida: string = 'dd/MM/yyyy'): string => {
  try {
    // Se for uma string vazia ou null/undefined, retornar mensagem padrão
    if (!data) {
      return 'Data não informada';
    }
    
    let dataObj: Date;
    
    // Se já for um objeto Date
    if (data instanceof Date) {
      dataObj = data;
    } else {
      // Para consistência, se for string, primeiro extrair a parte YYYY-MM-DD
      // e então criar um objeto Date com hora fixa (meio-dia UTC)
      if (typeof data === 'string') {
        // Extrair a parte da data (funciona para ISO completo ou YYYY-MM-DD)
        const apenasData = data.includes('T') ? data.split('T')[0] : data.substring(0, 10);
        // Criar data com meio-dia UTC para evitar problemas de fuso horário
        dataObj = new Date(`${apenasData}T12:00:00Z`);
      } else {
        // Tenta converter diretamente
        dataObj = new Date(data);
      }
    }
    
    // Verificar se a data é válida
    if (!isValid(dataObj)) {
      console.error('Data inválida:', data);
      return 'Data inválida';
    }
    
    // Formatar a data
    return format(dataObj, formatoSaida, { locale: ptBR });
  } catch (erro) {
    console.error('Erro ao formatar data:', erro, data);
    return 'Erro na data';
  }
};

// Função para formatar valor monetário
export const formatarDinheiro = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
};

// Função para criar um objeto Date padronizado a partir de uma string de data
export const criarDataPadronizada = (dataString: string): Date => {
  try {
    if (!dataString) {
      throw new Error('String de data vazia');
    }
    
    // Extrair apenas a parte da data (YYYY-MM-DD) para padronização
    const apenasData = dataString.includes('T') 
      ? dataString.split('T')[0] 
      : dataString.substring(0, 10);
    
    // Criar data com meio-dia UTC para evitar problemas de fuso horário
    return new Date(`${apenasData}T12:00:00Z`);
  } catch (erro) {
    console.error('Erro ao criar data padronizada:', erro, dataString);
    return new Date(); // Retorna data atual como fallback
  }
};

// Função para filtrar corridas por período
export const filtrarCorridasPorPeriodo = (corridas: Corrida[], periodo: Periodo): Corrida[] => {
  const hoje = new Date();
  const hojeNormalizado = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate(),
    12, 0, 0
  );
  
  let dataInicio: Date;

  switch (periodo) {
    case 'diario':
      dataInicio = startOfDay(hoje);
      dataInicio.setHours(0, 0, 0, 0);
      break;
    case 'semanal':
      dataInicio = subWeeks(hojeNormalizado, 1);
      break;
    case 'mensal':
      dataInicio = subMonths(hojeNormalizado, 1);
      break;
    case 'anual':
      dataInicio = subYears(hojeNormalizado, 1);
      break;
    case 'ontem':
      dataInicio = startOfDay(subDays(hoje, 1));
      dataInicio.setHours(0, 0, 0, 0);
      break;
    default:
      dataInicio = subDays(hojeNormalizado, 30); // Padrão: último mês
  }

  console.log(`Filtrando corridas por período: ${periodo}, data início: ${dataInicio.toISOString()}, hoje: ${hojeNormalizado.toISOString()}`);
  console.log(`Total de corridas antes do filtro: ${corridas.length}`);

  return corridas.filter((corrida) => {
    try {
      // Lidar com diferentes formatos de data de forma mais robusta
      if (!corrida.data) {
        console.error('Corrida sem data:', corrida);
        return false;
      }
      
      // Usar a função auxiliar para criar um objeto de data padronizado
      const dataCorrida = criarDataPadronizada(corrida.data);
      
      // Verificar se a data é válida
      if (isNaN(dataCorrida.getTime())) {
        console.error('Data inválida na corrida:', corrida);
        return false;
      }
      
      // Definir o fim do período com base no caso de uso
      let fimAjustado = new Date(hojeNormalizado);
      
      // Caso especial para "ontem"
      if (periodo === 'ontem') {
        // Para "ontem", o período começa às 00:00 e termina às 23:59:59 do mesmo dia
        const ontem = subDays(hoje, 1);
        dataInicio = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate(), 0, 0, 0);
        fimAjustado = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate(), 23, 59, 59);
      } else if (periodo === 'diario') {
        // Para "diario", o período é de 00:00 a 23:59:59 de hoje
        fimAjustado = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
      }
      
      // Verificar se a data da corrida está dentro do intervalo
      const resultado = isWithinInterval(dataCorrida, {
        start: dataInicio,
        end: fimAjustado,
      });
      
      if (resultado) {
        console.log(`Corrida ${corrida.id} com data ${corrida.data} (${dataCorrida.toISOString()}) está dentro do intervalo`);
      }
      
      return resultado;
    } catch (erro) {
      console.error('Erro ao processar data da corrida:', erro, corrida);
      return false;
    }
  });
};

// Função para calcular resumo financeiro
export const calcularResumoFinanceiro = (
  corridas: Corrida[],
  config: VeiculoConfig | null
): ResumoFinanceiro => {
  // Cálculo do ganho bruto
  const ganhoBruto = corridas.reduce((total, corrida) => total + corrida.ganhoBruto, 0);
  
  // Cálculo do gasto com gasolina
  const gastoGasolina = corridas.reduce((total, corrida) => total + corrida.gastoGasolina, 0);
  
  // Cálculo de gastos de manutenção e IPVA proporcional ao período
  const diasNoPeriodo = corridas.length > 0 ? corridas.length : 1;
  const gastoManutencao = config ? (config.gastoManutencao / 365) * diasNoPeriodo : 0;
  const gastoIPVA = config ? (config.valorIPVA / 365) * diasNoPeriodo : 0;
  
  const outrosGastos = gastoManutencao + gastoIPVA;
  const ganhoLiquido = ganhoBruto - gastoGasolina - outrosGastos;

  return {
    ganhoBruto,
    ganhoLiquido,
    gastoGasolina,
    gastoManutencao,
    gastoIPVA,
    outrosGastos,
  };
};

// Função para salvar dados no localStorage
export const salvarDados = <T>(chave: string, dados: T): void => {
  if (typeof window !== 'undefined') {
    try {
      console.log(`Salvando dados na chave '${chave}':`, dados);
      
      // Validação extra para arrays
      if (Array.isArray(dados)) {
        console.log(`Array com ${dados.length} itens sendo salvo`);
      }
      
      const dadosString = JSON.stringify(dados);
      
      // Criar um backup temporário antes de salvar os novos dados
      if (chave === 'corridas') {
        const timestampBackup = new Date().getTime();
        localStorage.setItem(`${chave}_backup_${timestampBackup}`, dadosString);
        console.log(`Backup temporário criado: ${chave}_backup_${timestampBackup}`);
      }
      
      // Salvar os dados na chave principal
      localStorage.setItem(chave, dadosString);
      
      // Verificar se os dados foram realmente salvos
      const verificacao = localStorage.getItem(chave);
      if (verificacao) {
        console.log(`Dados salvos com sucesso na chave '${chave}'. Tamanho: ${verificacao.length} caracteres`);
        
        // Para arrays de corridas, manter um segundo backup com nome alternativo
        if (chave === 'corridas' && Array.isArray(dados)) {
          // Salvar em uma chave alternativa também como medida extra de segurança
          localStorage.setItem('corridas_copia_seguranca', dadosString);
          console.log('Cópia de segurança adicional criada em: corridas_copia_seguranca');
        }
      } else {
        console.error(`ALERTA: Falha na verificação após salvar dados na chave '${chave}'`);
        
        // Tentar novamente com uma chave alternativa
        if (chave === 'corridas') {
          console.log('Tentando salvar novamente com uma chave alternativa...');
          localStorage.setItem('corridas_backup_emergencia', dadosString);
          
          // Verificar se o backup de emergência foi salvo
          const verificacaoEmergencia = localStorage.getItem('corridas_backup_emergencia');
          if (verificacaoEmergencia) {
            console.log('Backup de emergência salvo com sucesso');
          } else {
            throw new Error('Falha ao salvar backup de emergência');
          }
        }
      }
    } catch (erro) {
      console.error(`Erro ao salvar dados na chave '${chave}':`, erro);
      
      // Tentar uma última vez com outra abordagem
      try {
        if (chave === 'corridas' && Array.isArray(dados)) {
          console.log('Tentando abordagem alternativa para salvar corridas...');
          
          // Tentar salvar em blocos (para evitar problemas de tamanho)
          localStorage.setItem('corridas_ultima_tentativa', JSON.stringify(dados));
          console.log('Dados salvos com abordagem alternativa');
        }
      } catch (erroAlternativo) {
        console.error('Falha também na abordagem alternativa:', erroAlternativo);
      }
      
      // Tenta remover a chave para evitar dados corrompidos
      // localStorage.removeItem(chave); // Comentado para não remover dados existentes
      
      throw erro;
    }
  } else {
    console.warn(`Tentativa de salvar dados na chave '${chave}' fora do navegador`);
  }
};

// Função para carregar dados do localStorage
export const carregarDados = <T>(chave: string, valorPadrao: T): T => {
  if (typeof window !== 'undefined') {
    try {
      console.log(`Carregando dados da chave '${chave}'`);
      
      // Tenta carregar da chave principal
      let dadosSalvos = localStorage.getItem(chave);
      
      // Se não encontrou e for a chave de corridas, tenta alternativas
      if (!dadosSalvos && chave === 'corridas') {
        console.log('Corridas não encontradas na chave principal, tentando backups...');
        
        // Tentar a cópia de segurança
        dadosSalvos = localStorage.getItem('corridas_copia_seguranca');
        
        if (!dadosSalvos) {
          console.log('Tentando corridas_backup_emergencia...');
          dadosSalvos = localStorage.getItem('corridas_backup_emergencia');
        }
        
        if (!dadosSalvos) {
          console.log('Tentando corridas_ultima_tentativa...');
          dadosSalvos = localStorage.getItem('corridas_ultima_tentativa');
        }
        
        if (!dadosSalvos) {
          // Procurar por backups temporários
          const backupKeys = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('corridas_backup_')) {
              backupKeys.push(key);
            }
          }
          
          if (backupKeys.length > 0) {
            // Ordenar backups pela data (mais recente primeiro)
            backupKeys.sort().reverse();
            console.log('Backups temporários encontrados:', backupKeys);
            dadosSalvos = localStorage.getItem(backupKeys[0]);
            console.log(`Usando backup mais recente: ${backupKeys[0]}`);
          }
        }
      }
      
      if (!dadosSalvos) {
        console.log(`Nenhum dado encontrado na chave '${chave}' ou backups, retornando valor padrão:`, valorPadrao);
        return valorPadrao;
      }
      
      console.log(`Dados encontrados para '${chave}'. Tamanho: ${dadosSalvos.length} caracteres`);
      
      const dadosParsed = JSON.parse(dadosSalvos) as T;
      
      // Validação extra para arrays
      if (Array.isArray(dadosParsed)) {
        console.log(`Array carregado com ${dadosParsed.length} itens`);
      }
      
      return dadosParsed;
    } catch (erro) {
      console.error(`Erro ao carregar dados da chave '${chave}':`, erro);
      
      // Não remover dados potencialmente recuperáveis
      // localStorage.removeItem(chave);
      
      return valorPadrao;
    }
  } else {
    console.warn(`Tentativa de carregar dados da chave '${chave}' fora do navegador`);
    return valorPadrao;
  }
}; 