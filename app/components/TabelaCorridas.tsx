'use client';

import { useState, useEffect } from 'react';
import { Corrida } from '../types';
import { formatarData, formatarDinheiro } from '../lib/utils';
import { FaEdit, FaTrash, FaFilter, FaTimes, FaEye, FaGasPump } from 'react-icons/fa';

interface TabelaCorridasProps {
  corridas: Corrida[];
  onEditar: (corrida: Corrida) => void;
  onExcluir: (id: string) => void;
}

const TabelaCorridas = ({ corridas, onEditar, onExcluir }: TabelaCorridasProps) => {
  const [corridaParaExcluir, setCorridaParaExcluir] = useState<string | null>(null);
  const [corridaDetalhes, setCorridaDetalhes] = useState<Corrida | null>(null);
  const [filtroData, setFiltroData] = useState<{ inicio: string; fim: string }>({
    inicio: '',
    fim: '',
  });
  const [corridasFiltradas, setCorridasFiltradas] = useState<Corrida[]>(corridas);
  const [filtroAplicado, setFiltroAplicado] = useState(false);

  // Atualizar corridas filtradas quando as corridas originais mudarem
  useEffect(() => {
    console.log('Corridas recebidas por TabelaCorridas:', corridas);
    console.log('Total de corridas recebidas:', corridas.length);
    
    if (filtroAplicado && filtroData.inicio && filtroData.fim) {
      console.log('Aplicando filtro às novas corridas recebidas');
      aplicarFiltro();
    } else {
      console.log('Atualizando lista sem filtro');
      setCorridasFiltradas(corridas);
    }
  }, [corridas]);

  const confirmarExclusao = (id: string) => {
    setCorridaParaExcluir(id);
  };

  const cancelarExclusao = () => {
    setCorridaParaExcluir(null);
  };

  const executarExclusao = () => {
    if (corridaParaExcluir) {
      onExcluir(corridaParaExcluir);
      setCorridaParaExcluir(null);
    }
  };

  const limparFiltros = () => {
    setFiltroData({ inicio: '', fim: '' });
    setCorridasFiltradas(corridas);
    setFiltroAplicado(false);
  };

  const aplicarFiltro = () => {
    if (!filtroData.inicio && !filtroData.fim) {
      setCorridasFiltradas(corridas);
      setFiltroAplicado(false);
      return;
    }

    try {
      console.log('Aplicando filtro de data:', filtroData);
      console.log('Total de corridas antes do filtro:', corridas.length);

      const resultado = corridas.filter((corrida) => {
        try {
          // Para simplificar a comparação, vamos comparar apenas as strings YYYY-MM-DD
          // Se corrida.data tem formato ISO completo, extrair apenas a parte da data
          const dataCorridaStr = corrida.data.includes('T') 
            ? corrida.data.split('T')[0] 
            : corrida.data;
          
          console.log(`Corrida ${corrida.id} - Data para comparação:`, dataCorridaStr);
          
          let incluir = true;
          
          if (filtroData.inicio) {
            // Comparação de strings no formato YYYY-MM-DD
            incluir = incluir && dataCorridaStr >= filtroData.inicio;
            console.log(`  - Comparando com início ${filtroData.inicio}:`, dataCorridaStr >= filtroData.inicio);
          }
          
          if (filtroData.fim) {
            // Comparação de strings no formato YYYY-MM-DD
            incluir = incluir && dataCorridaStr <= filtroData.fim;
            console.log(`  - Comparando com fim ${filtroData.fim}:`, dataCorridaStr <= filtroData.fim);
          }
          
          return incluir;
        } catch (erro) {
          console.error('Erro ao processar data da corrida:', erro);
          return false;
        }
      });
      
      console.log('Total de corridas após filtro:', resultado.length);
      setCorridasFiltradas(resultado);
      setFiltroAplicado(true);
    } catch (erro) {
      console.error('Erro ao aplicar filtro:', erro);
      setCorridasFiltradas(corridas);
    }
  };

  const formatarDataSegura = (data: string) => {
    try {
      return formatarData(data);
    } catch (erro) {
      console.error('Erro ao formatar data:', erro, data);
      return 'Data inválida';
    }
  };

  const abrirDetalhes = (corrida: Corrida) => {
    setCorridaDetalhes(corrida);
  };

  const fecharDetalhes = () => {
    setCorridaDetalhes(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Corridas Registradas</h2>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Filtrar por Período</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-900 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              id="dataInicio"
              value={filtroData.inicio}
              onChange={(e) => setFiltroData({ ...filtroData, inicio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-black"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="dataFim" className="block text-sm font-medium text-gray-900 mb-1">
              Data Final
            </label>
            <input
              type="date"
              id="dataFim"
              value={filtroData.fim}
              onChange={(e) => setFiltroData({ ...filtroData, fim: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-black"
            />
          </div>
          <div className="flex-none flex items-end space-x-2">
            <button
              onClick={aplicarFiltro}
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 flex items-center"
            >
              <FaFilter className="mr-2" /> Aplicar
            </button>
            {filtroAplicado && (
              <button
                onClick={limparFiltros}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
              >
                <FaTimes className="mr-2" /> Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {corridasFiltradas.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-700 font-medium mb-2">Nenhuma corrida encontrada.</p>
          {filtroAplicado ? (
            <p className="text-gray-900">Tente ajustar os filtros ou <button onClick={limparFiltros} className="text-gray-900 underline font-medium">limpar os filtros</button>.</p>
          ) : (
            <p className="text-gray-900">Adicione uma nova corrida na página &quot;Adicionar Corrida&quot;.</p>
          )}
        </div>
      ) : (
        <>
          {/* Versão para desktop */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Data
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Horas
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Km Rodados
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Gasto Gasolina <span className="text-xs font-normal normal-case text-gray-300">(calculado)</span>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Viagens
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Ganho Bruto
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {corridasFiltradas.map((corrida) => (
                  <tr key={corrida.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatarDataSegura(corrida.data)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeof corrida.horasTrabalhadas === 'number' 
                        ? `${corrida.horasTrabalhadas.toFixed(1)}h` 
                        : '0h'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeof corrida.kmRodados === 'number' 
                        ? `${corrida.kmRodados.toFixed(1)} km` 
                        : '0 km'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <FaGasPump className="text-gray-800 mr-2" />
                        {typeof corrida.gastoGasolina === 'number' 
                          ? formatarDinheiro(corrida.gastoGasolina) 
                          : formatarDinheiro(0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {corrida.quantidadeViagens || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeof corrida.ganhoBruto === 'number' 
                        ? formatarDinheiro(corrida.ganhoBruto) 
                        : formatarDinheiro(0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onEditar(corrida)}
                        className="text-gray-700 hover:text-black mr-3"
                        title="Editar"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => confirmarExclusao(corrida.id)}
                        className="text-gray-700 hover:text-black"
                        title="Excluir"
                      >
                        <FaTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Versão para mobile */}
          <div className="md:hidden space-y-4">
            {corridasFiltradas.map((corrida) => (
              <div key={corrida.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-medium text-gray-700">{formatarDataSegura(corrida.data)}</div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => abrirDetalhes(corrida)}
                      className="text-gray-700 hover:text-black"
                      title="Ver Detalhes"
                    >
                      <FaEye size={16} />
                    </button>
                    <button
                      onClick={() => onEditar(corrida)}
                      className="text-gray-700 hover:text-black"
                      title="Editar"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => confirmarExclusao(corrida.id)}
                      className="text-gray-700 hover:text-black"
                      title="Excluir"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Horas:</span>{' '}
                    <span className="font-medium">
                      {typeof corrida.horasTrabalhadas === 'number' 
                        ? `${corrida.horasTrabalhadas.toFixed(1)}h` 
                        : '0h'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Viagens:</span>{' '}
                    <span className="font-medium">{corrida.quantidadeViagens || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Gasto:</span>{' '}
                    <span className="font-medium text-gray-700 flex items-center">
                      <FaGasPump className="mr-1" size={12} />
                      {typeof corrida.gastoGasolina === 'number' 
                        ? formatarDinheiro(corrida.gastoGasolina) 
                        : formatarDinheiro(0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Ganho:</span>{' '}
                    <span className="font-medium text-success-700">
                      {typeof corrida.ganhoBruto === 'number' 
                        ? formatarDinheiro(corrida.ganhoBruto) 
                        : formatarDinheiro(0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal de confirmação de exclusão */}
      {corridaParaExcluir && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Confirmar Exclusão</h3>
            <p className="mb-6 text-gray-700">Tem certeza que deseja excluir esta corrida? Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelarExclusao}
                className="px-3 sm:px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={executarExclusao}
                className="px-3 sm:px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalhes da corrida (para mobile) */}
      {corridaDetalhes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-primary-700">Detalhes da Corrida</h3>
              <button
                onClick={fecharDetalhes}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500 block text-sm">Data:</span>
                <span className="font-medium">{formatarDataSegura(corridaDetalhes.data)}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-sm">Horas Trabalhadas:</span>
                <span className="font-medium">
                  {typeof corridaDetalhes.horasTrabalhadas === 'number' 
                    ? `${corridaDetalhes.horasTrabalhadas.toFixed(1)}h` 
                    : '0h'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-sm">Quilômetros Rodados:</span>
                <span className="font-medium">
                  {typeof corridaDetalhes.kmRodados === 'number' 
                    ? `${corridaDetalhes.kmRodados.toFixed(1)} km` 
                    : '0 km'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-sm">Gasto com Gasolina (calculado):</span>
                <span className="font-medium text-gray-700 flex items-center">
                  <FaGasPump className="mr-1" />
                  {typeof corridaDetalhes.gastoGasolina === 'number' 
                    ? formatarDinheiro(corridaDetalhes.gastoGasolina) 
                    : formatarDinheiro(0)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-sm">Quantidade de Viagens:</span>
                <span className="font-medium">{corridaDetalhes.quantidadeViagens || 0}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-sm">Ganho Bruto:</span>
                <span className="font-medium text-success-700">
                  {typeof corridaDetalhes.ganhoBruto === 'number' 
                    ? formatarDinheiro(corridaDetalhes.ganhoBruto) 
                    : formatarDinheiro(0)}
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  onEditar(corridaDetalhes);
                  fecharDetalhes();
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <FaEdit className="inline mr-1" /> Editar
              </button>
              <button
                onClick={fecharDetalhes}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabelaCorridas; 