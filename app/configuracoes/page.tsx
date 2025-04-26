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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Configurações</h1>

      {mensagem && (
        <div
          className={`p-4 mb-6 rounded-md bg-gray-200 border border-gray-400 text-gray-900`}
        >
          {mensagem.texto}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Configurações do Veículo</h2>

        <div className="space-y-6">
          <div>
            <label htmlFor="modelo" className="block text-sm font-medium text-gray-900 mb-1">
              Modelo do Veículo
            </label>
            <input
              type="text"
              id="modelo"
              name="modelo"
              value={config.modelo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-black"
              placeholder="Ex: Honda Civic"
            />
          </div>

          <div>
            <label htmlFor="ano" className="block text-sm font-medium text-gray-900 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-black"
            />
          </div>

          <div>
            <label htmlFor="consumoMedio" className="block text-sm font-medium text-gray-900 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-black"
            />
            <p className="mt-1 text-sm text-gray-700">
              Quantos quilômetros seu veículo percorre com 1 litro de combustível
            </p>
          </div>

          <div>
            <label htmlFor="precoGasolina" className="block text-sm font-medium text-gray-900 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-black"
            />
          </div>

          <div>
            <label htmlFor="valorIPVA" className="block text-sm font-medium text-gray-900 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-black"
            />
          </div>

          <div>
            <label htmlFor="gastoManutencao" className="block text-sm font-medium text-gray-900 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-black"
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