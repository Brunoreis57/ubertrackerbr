'use client';

import { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaGasPump, FaWallet, FaCalendarAlt, FaCog } from 'react-icons/fa';
import Card from './components/Card';
import Grafico from './components/Grafico';
import { Corrida, DadosGrafico, Periodo, ResumoFinanceiro, VeiculoConfig } from './types/index';
import { calcularResumoFinanceiro, filtrarCorridasPorPeriodo, formatarDinheiro, carregarDados } from './lib/utils';
import Link from 'next/link';
import LembreteBackup from './components/LembreteBackup';
import { verificarLogin } from './lib/authUtils';

export default function Home() {
  const [periodo, setPeriodo] = useState<Periodo>('mensal');
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [configVeiculo, setConfigVeiculo] = useState<VeiculoConfig | null>(null);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [resumo, setResumo] = useState<ResumoFinanceiro>({
    ganhoBruto: 0,
    ganhoLiquido: 0,
    gastoGasolina: 0,
    gastoManutencao: 0,
    gastoIPVA: 0,
    outrosGastos: 0,
  });

  useEffect(() => {
    // Carregar dados do localStorage
    carregarDadosUsuario();
  }, []);

  const carregarDadosUsuario = () => {
    try {
      // Verificar se há um usuário logado
      const { logado, sessao } = verificarLogin();
      let chaveCorretas = 'corridas';
      
      if (logado && sessao) {
        setUsuarioId(sessao.id);
        chaveCorretas = `corridas_${sessao.id}`;
        console.log(`Usuário logado: ${sessao.nome} (${sessao.id}). Usando chave: ${chaveCorretas}`);
      } else {
        console.log('Usuário não logado. Usando chave padrão: corridas');
      }
      
      // Carregar corridas usando a função utilitária
      const corridasSalvas = carregarDados<Corrida[]>(chaveCorretas, []);
      setCorridas(corridasSalvas);
      console.log(`Carregadas ${corridasSalvas.length} corridas de ${chaveCorretas}`);
      
      // Carregar configurações do veículo
      const configSalva = localStorage.getItem('veiculoConfig');
      if (configSalva) {
        setConfigVeiculo(JSON.parse(configSalva));
      }
    } catch (erro) {
      console.error('Erro ao carregar dados:', erro);
    }
  };

  useEffect(() => {
    // Filtrar corridas pelo período selecionado
    const corridasFiltradas = filtrarCorridasPorPeriodo(corridas, periodo);
    
    // Calcular resumo financeiro
    const novoResumo = calcularResumoFinanceiro(corridasFiltradas, configVeiculo);
    setResumo(novoResumo);
  }, [corridas, periodo, configVeiculo]);

  // Preparar dados para o gráfico de evolução de ganhos
  const dadosGraficoGanhos: DadosGrafico = {
    labels: corridas
      .filter(corrida => {
        const dataCorrida = new Date(corrida.data);
        const hoje = new Date();
        const umMesAtras = new Date();
        umMesAtras.setMonth(hoje.getMonth() - 1);
        return dataCorrida >= umMesAtras && dataCorrida <= hoje;
      })
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .map(corrida => {
        const data = new Date(corrida.data);
        return `${data.getDate()}/${data.getMonth() + 1}`;
      }),
    datasets: [
      {
        label: 'Ganho Bruto',
        data: corridas
          .filter(corrida => {
            const dataCorrida = new Date(corrida.data);
            const hoje = new Date();
            const umMesAtras = new Date();
            umMesAtras.setMonth(hoje.getMonth() - 1);
            return dataCorrida >= umMesAtras && dataCorrida <= hoje;
          })
          .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
          .map(corrida => corrida.ganhoBruto),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
      },
    ],
  };

  // Preparar dados para o gráfico de distribuição de gastos
  const dadosGraficoGastos: DadosGrafico = {
    labels: ['Gasolina', 'Manutenção', 'IPVA'],
    datasets: [
      {
        label: 'Gastos',
        data: [resumo.gastoGasolina, resumo.gastoManutencao, resumo.gastoIPVA],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Dashboard</h1>

      {!configVeiculo && (
        <div className="mb-6 p-4 bg-gray-200 text-gray-900 border border-gray-400 rounded-md">
          <div className="flex items-start">
            <FaCog className="mt-1 mr-3 flex-shrink-0 text-gray-700" />
            <div>
              <p className="font-medium">Configurações do veículo não encontradas</p>
              <p className="mt-1">
                Para calcular corretamente o gasto com gasolina, configure seu veículo e o preço atual do combustível.
              </p>
              <Link 
                href="/configuracoes" 
                className="mt-2 inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-sm font-medium"
              >
                <FaCog className="mr-2" /> Configurar Veículo
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Período de Análise</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPeriodo('diario')}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base font-medium ${
              periodo === 'diario'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setPeriodo('semanal')}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base font-medium ${
              periodo === 'semanal'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            Última Semana
          </button>
          <button
            onClick={() => setPeriodo('mensal')}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base font-medium ${
              periodo === 'mensal'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            Último Mês
          </button>
          <button
            onClick={() => setPeriodo('anual')}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base font-medium ${
              periodo === 'anual'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            Último Ano
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card
          titulo="Ganho Bruto"
          valor={formatarDinheiro(resumo.ganhoBruto)}
          icone={<FaMoneyBillWave size={24} />}
          corFundo=""
          corTexto=""
        />
        <Card
          titulo="Ganho Líquido"
          valor={formatarDinheiro(resumo.ganhoLiquido)}
          icone={<FaWallet size={24} />}
          corFundo=""
          corTexto=""
        />
        <Card
          titulo="Gasto com Gasolina"
          valor={formatarDinheiro(resumo.gastoGasolina)}
          icone={<FaGasPump size={24} />}
          corFundo=""
          corTexto=""
        />
        <Card
          titulo="Outros Gastos"
          valor={formatarDinheiro(resumo.outrosGastos)}
          icone={<FaCalendarAlt size={24} />}
          corFundo=""
          corTexto=""
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Evolução de Ganhos</h2>
          <Grafico tipo="linha" dados={dadosGraficoGanhos} titulo="Ganhos no Último Mês" altura={300} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Distribuição de Gastos</h2>
          <Grafico tipo="pizza" dados={dadosGraficoGastos} titulo="Gastos por Categoria" altura={300} />
        </div>
      </div>

      <LembreteBackup />
    </div>
  );
}
