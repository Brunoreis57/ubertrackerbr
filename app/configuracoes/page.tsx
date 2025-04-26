'use client';

import { useState, useEffect } from 'react';
import { VeiculoConfig } from '../types';
import { FaSave } from 'react-icons/fa';

const ConfiguracoesPage = () => {
  const [config, setConfig] = useState<VeiculoConfig>({
    modelo: '',
    ano: new Date().getFullYear(),
    consumoMedio: 10,
    precoGasolina: 5.0,
    valorIPVA: 0,
    gastoManutencao: 0,
  });
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = () => {
    try {
      const configSalva = localStorage.getItem('veiculoConfig');
      if (configSalva) {
        setConfig(JSON.parse(configSalva));
      }
    } catch (erro) {
      console.error('Erro ao carregar configurações:', erro);
      setMensagem({
        texto: 'Erro ao carregar configurações. Usando valores padrão.',
        tipo: 'erro',
      });
    }
  };

  const salvarConfiguracoes = () => {
    try {
      localStorage.setItem('veiculoConfig', JSON.stringify(config));
      setMensagem({
        texto: 'Configurações salvas com sucesso!',
        tipo: 'sucesso',
      });
      setTimeout(() => {
        setMensagem(null);
      }, 3000);
    } catch (erro) {
      console.error('Erro ao salvar configurações:', erro);
      setMensagem({
        texto: 'Erro ao salvar configurações. Tente novamente.',
        tipo: 'erro',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: name === 'modelo' ? value : Number(value),
    }));
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6">Configurações</h1>

      {mensagem && (
        <div
          className={`p-4 mb-6 rounded-md border ${
            mensagem.tipo === 'sucesso'
              ? 'bg-green-100 border-green-400 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300'
              : 'bg-red-100 border-red-400 text-red-800 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300'
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Configurações do Veículo</h2>

        <div className="space-y-6">
          <div>
            <label htmlFor="modelo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Modelo do Veículo
            </label>
            <input
              type="text"
              id="modelo"
              name="modelo"
              value={config.modelo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ex: Honda Civic"
            />
          </div>

          <div>
            <label htmlFor="ano" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ano do Veículo
            </label>
            <input
              type="number"
              id="ano"
              name="ano"
              value={config.ano}
              onChange={handleChange}
              min="1990"
              max={new Date().getFullYear() + 1}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="consumoMedio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Consumo Médio (km/litro)
            </label>
            <input
              type="number"
              id="consumoMedio"
              name="consumoMedio"
              value={config.consumoMedio}
              onChange={handleChange}
              min="1"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Quantos quilômetros seu veículo percorre com 1 litro de combustível
            </p>
          </div>

          <div>
            <label htmlFor="precoGasolina" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Preço da Gasolina (R$/litro)
            </label>
            <input
              type="number"
              id="precoGasolina"
              name="precoGasolina"
              value={config.precoGasolina}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="valorIPVA" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Valor Anual do IPVA (R$)
            </label>
            <input
              type="number"
              id="valorIPVA"
              name="valorIPVA"
              value={config.valorIPVA}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="gastoManutencao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gasto Anual com Manutenção (R$)
            </label>
            <input
              type="number"
              id="gastoManutencao"
              name="gastoManutencao"
              value={config.gastoManutencao}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={salvarConfiguracoes}
              className="px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 font-bold text-lg flex items-center shadow-lg"
            >
              <FaSave className="mr-2" /> Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracoesPage; 