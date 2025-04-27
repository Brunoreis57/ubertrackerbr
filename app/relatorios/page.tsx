'use client';

import { useState, useEffect } from 'react';
import { Corrida, VeiculoConfig, Periodo } from '../types';
import { carregarDados, filtrarCorridasPorPeriodo, formatarDinheiro } from '../lib/utils';
import { FaCarSide, FaRoute, FaMoneyBillWave, FaGasPump, FaList } from 'react-icons/fa';
import { verificarLogin } from '../lib/authUtils';

const RelatoriosPage = () => {
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [configVeiculo, setConfigVeiculo] = useState<VeiculoConfig | null>(null);
  const [periodoAtual, setPeriodoAtual] = useState<Periodo>('mensal');
  const [carregando, setCarregando] = useState(true);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [resumos, setResumos] = useState<{
    [key in Periodo]: {
      totalCorridas: number;
      totalKm: number;
      totalGanhos: number;
      totalGastoGasolina: number;
      mediaGanhosPorCorrida: number;
      mediaKmPorCorrida: number;
      mediaGastoGasolinaPorCorrida: number;
      mediaGanhosHora: number;
    }
  } | null>(null);

  useEffect(() => {
    carregarDadosRelatorios();
  }, []);

  useEffect(() => {
    if (corridas.length > 0) {
      calcularResumos();
    }
  }, [corridas, periodoAtual]);

  const carregarDadosRelatorios = async () => {
    try {
      setCarregando(true);
      
      // Verificar se o usuário está logado
      const { logado, sessao } = verificarLogin();
      let chaveCorretas = 'corridas';
      
      if (logado && sessao) {
        setUsuarioId(sessao.id);
        chaveCorretas = `corridas_${sessao.id}`;
        console.log(`Usuário logado: ${sessao.nome} (${sessao.id}). Usando chave: ${chaveCorretas}`);
      } else {
        console.log('Usuário não logado. Usando chave padrão: corridas');
      }
      
      // Carregar corridas do localStorage usando a chave correta
      const corridasCarregadas = carregarDados<Corrida[]>(chaveCorretas, []);
      setCorridas(corridasCarregadas);
      console.log(`Carregadas ${corridasCarregadas.length} corridas de ${chaveCorretas}`);
      
      // Carregar configurações do veículo
      const configCarregada = carregarDados<VeiculoConfig | null>('veiculoConfig', null);
      setConfigVeiculo(configCarregada);
      
      setCarregando(false);
    } catch (erro) {
      console.error('Erro ao carregar dados:', erro);
      setCarregando(false);
    }
  };

  const calcularResumos = () => {
    const periodos: Periodo[] = ['diario', 'semanal', 'mensal', 'anual'];
    const resumosCalculados = {} as {
      [key in Periodo]: {
        totalCorridas: number;
        totalKm: number;
        totalGanhos: number;
        totalGastoGasolina: number;
        mediaGanhosPorCorrida: number;
        mediaKmPorCorrida: number;
        mediaGastoGasolinaPorCorrida: number;
        mediaGanhosHora: number;
      }
    };

    periodos.forEach(periodo => {
      const corridasFiltradas = filtrarCorridasPorPeriodo(corridas, periodo);
      
      const totalViagens = corridasFiltradas.reduce((total, corrida) => total + (corrida.quantidadeViagens || 0), 0);
      const totalKm = corridasFiltradas.reduce((total, corrida) => total + corrida.kmRodados, 0);
      const totalGanhos = corridasFiltradas.reduce((total, corrida) => total + corrida.ganhoBruto, 0);
      const totalGastoGasolina = corridasFiltradas.reduce((total, corrida) => total + corrida.gastoGasolina, 0);
      const totalHoras = corridasFiltradas.reduce((total, corrida) => total + corrida.horasTrabalhadas, 0);
      
      const registrosCorridas = corridasFiltradas.length;
      const mediaGanhosPorCorrida = registrosCorridas > 0 ? totalGanhos / registrosCorridas : 0;
      const mediaKmPorCorrida = registrosCorridas > 0 ? totalKm / registrosCorridas : 0;
      const mediaGastoGasolinaPorCorrida = registrosCorridas > 0 ? totalGastoGasolina / registrosCorridas : 0;
      const mediaGanhosHora = totalHoras > 0 ? totalGanhos / totalHoras : 0;

      console.log(`Período ${periodo}: ${corridasFiltradas.length} registros, ${totalViagens} viagens totais`);

      resumosCalculados[periodo] = {
        totalCorridas: totalViagens,
        totalKm,
        totalGanhos,
        totalGastoGasolina,
        mediaGanhosPorCorrida,
        mediaKmPorCorrida,
        mediaGastoGasolinaPorCorrida,
        mediaGanhosHora
      };
    });

    setResumos(resumosCalculados);
  };

  const renderizarCardIndicador = (
    titulo: string, 
    valor: string, 
    icone: JSX.Element, 
    descricao: string,
    corFundo: string
  ) => {
    // Usar cor padrão cinza para todos os cards
    return (
      <div className="bg-gray-200 dark:bg-gray-900 rounded-lg shadow-md p-4 flex flex-col">
        <div className="flex items-center mb-2">
          <div className="mr-3 text-gray-900 dark:text-white">
            {icone}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{titulo}</h3>
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{valor}</div>
        <p className="text-sm text-gray-800 dark:text-gray-200">{descricao}</p>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Relatórios e Análises</h1>

      {carregando ? (
        <div className="text-center py-8">
          <p className="text-gray-900 dark:text-white text-lg">Carregando dados...</p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Selecione o Período</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPeriodoAtual('ontem')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    periodoAtual === 'ontem'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                  }`}
                >
                  Ontem
                </button>
                <button
                  onClick={() => setPeriodoAtual('diario')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    periodoAtual === 'diario'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                  }`}
                >
                  Diário
                </button>
                <button
                  onClick={() => setPeriodoAtual('semanal')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    periodoAtual === 'semanal'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                  }`}
                >
                  Semanal
                </button>
                <button
                  onClick={() => setPeriodoAtual('mensal')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    periodoAtual === 'mensal'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                  }`}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setPeriodoAtual('anual')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    periodoAtual === 'anual'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                  }`}
                >
                  Anual
                </button>
              </div>
            </div>
          </div>

          {resumos ? (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Resumo {periodoAtual.charAt(0).toUpperCase() + periodoAtual.slice(1)}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {renderizarCardIndicador(
                    'Total de Viagens',
                    resumos[periodoAtual].totalCorridas.toString(),
                    <FaList size={24} className="text-blue-300" />,
                    'Número total de viagens realizadas',
                    ''
                  )}
                  {renderizarCardIndicador(
                    'Quilômetros Rodados',
                    `${resumos[periodoAtual].totalKm.toFixed(1)} km`,
                    <FaRoute size={24} className="text-green-300" />,
                    'Distância total percorrida',
                    ''
                  )}
                  {renderizarCardIndicador(
                    'Ganho Bruto',
                    formatarDinheiro(resumos[periodoAtual].totalGanhos),
                    <FaMoneyBillWave size={24} className="text-yellow-300" />,
                    'Valor total ganho no período',
                    ''
                  )}
                  {renderizarCardIndicador(
                    'Gasto com Gasolina',
                    formatarDinheiro(resumos[periodoAtual].totalGastoGasolina),
                    <FaGasPump size={24} className="text-red-300" />,
                    'Valor total gasto com combustível',
                    ''
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Médias Diárias</h2>
                <div className="bg-gray-200 dark:bg-gray-900 rounded-lg shadow-md p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Ganho Médio</h3>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {formatarDinheiro(resumos[periodoAtual].mediaGanhosPorCorrida)}
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-300">Por dia</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Distância Média</h3>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {resumos[periodoAtual].mediaKmPorCorrida.toFixed(1)} km
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-300">Por dia</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Gasto Médio</h3>
                      <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                        {formatarDinheiro(resumos[periodoAtual].mediaGastoGasolinaPorCorrida)}
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-300">Gasolina por dia</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Ganho por Hora</h3>
                      <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                        {formatarDinheiro(resumos[periodoAtual].mediaGanhosHora)}
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-300">Por hora trabalhada</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-yellow-800 dark:text-yellow-200">
              <p className="font-medium">Não há dados disponíveis para o período selecionado.</p>
              <p>Adicione corridas para visualizar as estatísticas.</p>
            </div>
          )}

          {!configVeiculo && (
            <div className="mt-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-yellow-800 dark:text-yellow-200">
              <p className="font-medium">Configurações do veículo não encontradas.</p>
              <p>
                Algumas estatísticas podem não estar precisas. 
                <a href="/configuracoes" className="underline ml-1 text-yellow-800 dark:text-yellow-200 hover:text-yellow-600 dark:hover:text-yellow-100">
                  Configurar veículo
                </a>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RelatoriosPage; 