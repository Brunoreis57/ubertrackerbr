'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { VeiculoConfig } from '../types';
import { FaSave } from 'react-icons/fa';

interface FormularioVeiculoProps {
  onSalvar: (config: VeiculoConfig) => void;
  configAtual?: VeiculoConfig;
}

const FormularioVeiculo = ({ onSalvar, configAtual }: FormularioVeiculoProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VeiculoConfig>({
    defaultValues: configAtual || {
      modelo: '',
      ano: new Date().getFullYear(),
      consumoMedio: 10,
      valorIPVA: 0,
      gastoManutencao: 0,
    },
  });

  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const onSubmit = (dados: VeiculoConfig) => {
    try {
      // Converter valores numéricos
      const dadosConvertidos = {
        ...dados,
        ano: Number(dados.ano),
        consumoMedio: Number(dados.consumoMedio),
        valorIPVA: Number(dados.valorIPVA),
        gastoManutencao: Number(dados.gastoManutencao),
      };

      onSalvar(dadosConvertidos);

      setMensagem({
        tipo: 'sucesso',
        texto: 'Configurações salvas com sucesso!',
      });

      setTimeout(() => {
        setMensagem(null);
      }, 3000);
    } catch (erro) {
      console.error('Erro ao salvar configurações:', erro);
      setMensagem({
        tipo: 'erro',
        texto: 'Erro ao salvar configurações. Tente novamente.',
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary-700">Configurações do Veículo</h2>

      {mensagem && (
        <div
          className={`mb-4 p-3 rounded ${
            mensagem.tipo === 'sucesso' ? 'bg-success-200 text-success-800 border border-success-300' : 'bg-danger-200 text-danger-800 border border-danger-300'
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="modelo" className="block text-sm font-medium text-gray-800 mb-1">
            Modelo do Veículo
          </label>
          <input
            type="text"
            id="modelo"
            {...register('modelo', { required: 'Modelo é obrigatório' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
            placeholder="Ex: Onix 1.0"
          />
          {errors.modelo && <p className="mt-1 text-sm text-danger-700 font-medium">{errors.modelo.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ano" className="block text-sm font-medium text-gray-800 mb-1">
              Ano do Veículo
            </label>
            <input
              type="number"
              id="ano"
              min="1990"
              max={new Date().getFullYear() + 1}
              {...register('ano', {
                required: 'Ano é obrigatório',
                min: { value: 1990, message: 'Ano deve ser maior ou igual a 1990' },
                max: { value: new Date().getFullYear() + 1, message: `Ano deve ser menor ou igual a ${new Date().getFullYear() + 1}` },
                valueAsNumber: true,
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
            />
            {errors.ano && <p className="mt-1 text-sm text-danger-700 font-medium">{errors.ano.message}</p>}
          </div>

          <div>
            <label htmlFor="consumoMedio" className="block text-sm font-medium text-gray-800 mb-1">
              Consumo Médio (km/l)
            </label>
            <input
              type="number"
              id="consumoMedio"
              step="0.1"
              min="1"
              {...register('consumoMedio', {
                required: 'Consumo médio é obrigatório',
                min: { value: 1, message: 'Consumo deve ser maior que 0' },
                valueAsNumber: true,
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
            />
            {errors.consumoMedio && <p className="mt-1 text-sm text-danger-700 font-medium">{errors.consumoMedio.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="valorIPVA" className="block text-sm font-medium text-gray-800 mb-1">
              Valor do IPVA Anual (R$)
            </label>
            <input
              type="number"
              id="valorIPVA"
              step="0.01"
              min="0"
              {...register('valorIPVA', {
                required: 'Valor do IPVA é obrigatório',
                min: { value: 0, message: 'Valor deve ser maior ou igual a 0' },
                valueAsNumber: true,
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
            />
            {errors.valorIPVA && <p className="mt-1 text-sm text-danger-700 font-medium">{errors.valorIPVA.message}</p>}
          </div>

          <div>
            <label htmlFor="gastoManutencao" className="block text-sm font-medium text-gray-800 mb-1">
              Gasto Anual com Manutenção (R$)
            </label>
            <input
              type="number"
              id="gastoManutencao"
              step="0.01"
              min="0"
              {...register('gastoManutencao', {
                required: 'Gasto com manutenção é obrigatório',
                min: { value: 0, message: 'Valor deve ser maior ou igual a 0' },
                valueAsNumber: true,
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
            />
            {errors.gastoManutencao && <p className="mt-1 text-sm text-danger-700 font-medium">{errors.gastoManutencao.message}</p>}
          </div>
        </div>

        <div className="flex justify-center mt-6 sm:mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 font-bold text-base sm:text-lg flex items-center justify-center shadow-lg ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <FaSave className="mr-2" /> Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioVeiculo; 