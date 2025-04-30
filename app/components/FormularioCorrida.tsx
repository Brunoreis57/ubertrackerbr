'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Corrida, VeiculoConfig } from '../types';
import { gerarId, formatarDinheiro } from '../lib/utils';
import { FaSave, FaEdit, FaGasPump } from 'react-icons/fa';

interface FormularioCorridaProps {
  onSalvar: (corrida: Corrida) => void;
  corridaParaEditar?: Corrida;
}

const FormularioCorrida = ({ onSalvar, corridaParaEditar }: FormularioCorridaProps) => {
  const [configVeiculo, setConfigVeiculo] = useState<VeiculoConfig | null>(null);
  const [gastoGasolinaCalculado, setGastoGasolinaCalculado] = useState<number>(0);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Omit<Corrida, 'id' | 'gastoGasolina'>>({
    defaultValues: corridaParaEditar
      ? {
          data: corridaParaEditar.data.substring(0, 10),
          horasTrabalhadas: corridaParaEditar.horasTrabalhadas,
          kmRodados: corridaParaEditar.kmRodados,
          quantidadeViagens: corridaParaEditar.quantidadeViagens,
          ganhoBruto: corridaParaEditar.ganhoBruto,
        }
      : {
          data: new Date().toISOString().substring(0, 10),
          horasTrabalhadas: 0,
          kmRodados: 0,
          quantidadeViagens: 0,
          ganhoBruto: 0,
        },
  });

  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  
  // Observar mudanças no campo kmRodados para calcular o gasto com gasolina
  const kmRodados = watch('kmRodados');
  
  useEffect(() => {
    carregarConfigVeiculo();
  }, []);
  
  useEffect(() => {
    calcularGastoGasolina();
  }, [kmRodados, configVeiculo]);
  
  const carregarConfigVeiculo = () => {
    try {
      const configSalva = localStorage.getItem('veiculoConfig');
      if (configSalva) {
        setConfigVeiculo(JSON.parse(configSalva));
      }
    } catch (erro) {
      console.error('Erro ao carregar configurações do veículo:', erro);
      setMensagem({
        tipo: 'erro',
        texto: 'Erro ao carregar configurações do veículo. O cálculo de gasto com gasolina pode estar incorreto.',
      });
    }
  };
  
  const calcularGastoGasolina = () => {
    if (!configVeiculo || !kmRodados) {
      setGastoGasolinaCalculado(0);
      return;
    }
    
    try {
      // Cálculo: (km rodados / consumo médio) * preço da gasolina
      const litrosConsumidos = kmRodados / configVeiculo.consumoMedio;
      const gasto = litrosConsumidos * configVeiculo.precoGasolina;
      setGastoGasolinaCalculado(gasto);
    } catch (erro) {
      console.error('Erro ao calcular gasto com gasolina:', erro);
      setGastoGasolinaCalculado(0);
    }
  };

  const onSubmit = (dados: Omit<Corrida, 'id' | 'gastoGasolina'>) => {
    try {
      console.log('Dados do formulário recebidos:', dados);
      
      // Garantir que a data seja válida e preservar o dia correto
      if (!dados.data) {
        setMensagem({
          tipo: 'erro',
          texto: 'Data inválida. Por favor, verifique o formato da data.',
        });
        return;
      }
      
      // Converter valores numéricos e garantir que sejam números válidos
      const dadosConvertidos = {
        ...dados,
        horasTrabalhadas: Number(dados.horasTrabalhadas) || 0,
        kmRodados: Number(dados.kmRodados) || 0,
        quantidadeViagens: Number(dados.quantidadeViagens) || 0,
        ganhoBruto: Number(dados.ganhoBruto) || 0,
      };

      // Criar objeto da corrida com ID único se for nova, ou manter ID existente
      const id = corridaParaEditar?.id || gerarId();
      console.log('ID da corrida:', id, 'É edição?', !!corridaParaEditar);
      
      // Garantir formato ISO padronizado com hora 12:00:00 UTC
      // para evitar problemas de fuso horário
      console.log('Data original do formulário:', dados.data);
      
      // Verificar se a data já está no formato ISO completo
      const dataCorrigida = dados.data.includes('T') 
        ? dados.data 
        : `${dados.data}T12:00:00Z`;
        
      console.log('Data corrigida com fuso:', dataCorrigida);
      
      const novaCorrida: Corrida = {
        id: id,
        ...dadosConvertidos,
        gastoGasolina: gastoGasolinaCalculado,
        data: dataCorrigida, // Usar data com hora fixa para evitar problemas de fuso
      };

      console.log('Corrida processada antes de salvar:', novaCorrida);
      
      // Chamar a função de salvamento
      onSalvar(novaCorrida);
      
      if (!corridaParaEditar) {
        reset({
          data: new Date().toISOString().substring(0, 10),
          horasTrabalhadas: 0,
          kmRodados: 0,
          quantidadeViagens: 0,
          ganhoBruto: 0,
        });
        setGastoGasolinaCalculado(0);
      }

      setMensagem({
        tipo: 'sucesso',
        texto: corridaParaEditar ? 'Corrida atualizada com sucesso!' : 'Corrida adicionada com sucesso!',
      });

      setTimeout(() => {
        setMensagem(null);
      }, 3000);
    } catch (erro) {
      console.error('Erro ao processar corrida:', erro);
      setMensagem({
        tipo: 'erro',
        texto: 'Erro ao salvar corrida. Tente novamente.',
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        {corridaParaEditar ? 'Editar Corrida' : 'Adicionar Nova Corrida'}
      </h2>

      {mensagem && (
        <div
          className={`mb-4 p-3 rounded ${
            mensagem.tipo === 'sucesso' ? 'bg-green-100 text-green-800 border border-green-400' : 'bg-red-100 text-red-800 border border-red-400'
          }`}
        >
          {mensagem.texto}
        </div>
      )}
      
      {!configVeiculo && (
        <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-800 border border-yellow-400">
          <p>
            Configurações do veículo não encontradas. O cálculo de gasto com gasolina pode estar incorreto.{' '}
            <a href="/configuracoes" className="text-yellow-900 underline font-medium">
              Configurar veículo
            </a>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="data" className="block text-sm font-medium text-gray-900 mb-1">
            Data
          </label>
          <input
            type="date"
            id="data"
            {...register('data', { required: 'Data é obrigatória' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-black"
          />
          {errors.data && <p className="mt-1 text-sm text-gray-900 font-medium">{errors.data.message}</p>}
        </div>

        <div>
          <label htmlFor="horasTrabalhadas" className="block text-sm font-medium text-gray-900 mb-1">
            Horas Trabalhadas
          </label>
          <input
            type="number"
            id="horasTrabalhadas"
            step="0.5"
            min="0"
            {...register('horasTrabalhadas', {
              required: 'Horas trabalhadas é obrigatório',
              min: { value: 0, message: 'Valor deve ser maior ou igual a 0' },
              valueAsNumber: true,
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-black"
          />
          {errors.horasTrabalhadas && (
            <p className="mt-1 text-sm text-gray-900 font-medium">{errors.horasTrabalhadas.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="kmRodados" className="block text-sm font-medium text-gray-900 mb-1">
            Quilômetros Rodados
          </label>
          <input
            type="number"
            id="kmRodados"
            min="0"
            step="0.1"
            {...register('kmRodados', {
              required: 'Quilômetros rodados é obrigatório',
              min: { value: 0, message: 'Valor deve ser maior ou igual a 0' },
              valueAsNumber: true,
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-black"
          />
          {errors.kmRodados && <p className="mt-1 text-sm text-gray-900 font-medium">{errors.kmRodados.message}</p>}
        </div>
        
        {/* Campo de gasto com gasolina calculado (somente leitura) */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Gasto com Gasolina (Calculado)
          </label>
          <div className="flex items-center">
            <div className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-black flex items-center">
              <FaGasPump className="text-gray-900 mr-2" />
              {formatarDinheiro(gastoGasolinaCalculado)}
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-700">
            Calculado com base no consumo de {configVeiculo?.consumoMedio || '?'} km/l e preço de {configVeiculo ? formatarDinheiro(configVeiculo.precoGasolina) : '?'}/litro
          </p>
        </div>

        <div>
          <label htmlFor="quantidadeViagens" className="block text-sm font-medium text-gray-900 mb-1">
            Quantidade de Viagens
          </label>
          <input
            type="number"
            id="quantidadeViagens"
            min="0"
            {...register('quantidadeViagens', {
              required: 'Quantidade de viagens é obrigatório',
              min: { value: 0, message: 'Valor deve ser maior ou igual a 0' },
              valueAsNumber: true,
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-black"
          />
          {errors.quantidadeViagens && (
            <p className="mt-1 text-sm text-gray-900 font-medium">{errors.quantidadeViagens.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="ganhoBruto" className="block text-sm font-medium text-gray-900 mb-1">
            Ganho Bruto (R$)
          </label>
          <input
            type="number"
            id="ganhoBruto"
            step="0.01"
            min="0"
            {...register('ganhoBruto', {
              required: 'Ganho bruto é obrigatório',
              min: { value: 0, message: 'Valor deve ser maior ou igual a 0' },
              valueAsNumber: true,
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-black"
          />
          {errors.ganhoBruto && <p className="mt-1 text-sm text-gray-900 font-medium">{errors.ganhoBruto.message}</p>}
        </div>

        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 font-bold text-lg flex items-center shadow-lg ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {corridaParaEditar ? (
              <>
                <FaEdit className="mr-2" /> Atualizar Corrida
              </>
            ) : (
              <>
                <FaSave className="mr-2" /> Salvar Corrida
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioCorrida; 