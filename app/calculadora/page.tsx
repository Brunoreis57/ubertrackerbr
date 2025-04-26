'use client';

import { useState } from 'react';
import { FaGasPump, FaRoute, FaMoneyBillWave, FaCalculator, FaCalendarAlt, FaBolt, FaExchangeAlt, FaClock } from 'react-icons/fa';

type TipoVeiculo = 'combustao' | 'eletrico';

const CalculadoraPage = () => {
  const [tipoVeiculo, setTipoVeiculo] = useState<TipoVeiculo>('combustao');
  const [precoGasolina, setPrecoGasolina] = useState<string>('');
  const [mediaKmLitro, setMediaKmLitro] = useState<string>('');
  const [precoEnergia, setPrecoEnergia] = useState<string>('');
  const [mediaKmkWh, setMediaKmkWh] = useState<string>('');
  const [metaDiaria, setMetaDiaria] = useState<string>('');
  const [valorPorKm, setValorPorKm] = useState<string>('');
  const [diasTrabalhados, setDiasTrabalhados] = useState<string>('');
  const [horasPorDia, setHorasPorDia] = useState<string>('8'); // Valor padrão de 8 horas
  const [resultados, setResultados] = useState<{
    combustao: {
      kmNecessarios: number;
      litrosNecessarios: number;
      custoCombustivel: number;
      corridasNecessarias: number;
      ganhoBruto: number;
      ganhoLiquido: number;
      totalKmPeriodo: number;
      totalLitrosPeriodo: number;
      totalCustoCombustivelPeriodo: number;
      totalCorridasPeriodo: number;
      totalGanhoBrutoPeriodo: number;
      totalGanhoLiquidoPeriodo: number;
      ganhoPorHora: number;
      horasNecessarias: number;
    };
    eletrico: {
      kmNecessarios: number;
      kWhNecessarios: number;
      custoEnergia: number;
      corridasNecessarias: number;
      ganhoBruto: number;
      ganhoLiquido: number;
      totalKmPeriodo: number;
      totalkWhPeriodo: number;
      totalCustoEnergiaPeriodo: number;
      totalCorridasPeriodo: number;
      totalGanhoBrutoPeriodo: number;
      totalGanhoLiquidoPeriodo: number;
      ganhoPorHora: number;
      horasNecessarias: number;
    };
  } | null>(null);

  const calcularEstimativas = () => {
    const meta = parseFloat(metaDiaria);
    const valorKm = parseFloat(valorPorKm);
    const dias = parseFloat(diasTrabalhados);
    const horas = parseFloat(horasPorDia);

    if (isNaN(meta) || isNaN(valorKm) || isNaN(dias) || isNaN(horas)) {
      return;
    }

    // Cálculos base (comuns para ambos os tipos)
    const kmNecessarios = meta / valorKm;
    const corridasNecessarias = Math.ceil(kmNecessarios / 10);
    const ganhoBruto = kmNecessarios * valorKm;
    const horasNecessarias = (kmNecessarios / 30) * 1.2; // Estimativa: 30km/h média + 20% tempo parado
    const ganhoPorHora = ganhoBruto / horasNecessarias;

    // Cálculos para combustão
    const precoGas = parseFloat(precoGasolina);
    const kmL = parseFloat(mediaKmLitro);
    if (!isNaN(precoGas) && !isNaN(kmL)) {
      const litrosNecessarios = kmNecessarios / kmL;
      const custoCombustivel = litrosNecessarios * precoGas;
      const ganhoLiquido = ganhoBruto - custoCombustivel;

      // Cálculos do período para combustão
      const totalKmPeriodo = kmNecessarios * dias;
      const totalLitrosPeriodo = litrosNecessarios * dias;
      const totalCustoCombustivelPeriodo = custoCombustivel * dias;
      const totalCorridasPeriodo = corridasNecessarias * dias;
      const totalGanhoBrutoPeriodo = ganhoBruto * dias;
      const totalGanhoLiquidoPeriodo = ganhoLiquido * dias;

      // Cálculos para elétrico
      const precoEnergiaValor = parseFloat(precoEnergia);
      const kmkWh = parseFloat(mediaKmkWh);
      if (!isNaN(precoEnergiaValor) && !isNaN(kmkWh)) {
        const kWhNecessarios = kmNecessarios / kmkWh;
        const custoEnergia = kWhNecessarios * precoEnergiaValor;
        const ganhoLiquidoEletrico = ganhoBruto - custoEnergia;
        const ganhoPorHoraEletrico = ganhoLiquidoEletrico / horasNecessarias;

        // Cálculos do período para elétrico
        const totalkWhPeriodo = kWhNecessarios * dias;
        const totalCustoEnergiaPeriodo = custoEnergia * dias;
        const totalGanhoBrutoPeriodoEletrico = ganhoBruto * dias;
        const totalGanhoLiquidoPeriodoEletrico = ganhoLiquidoEletrico * dias;

        setResultados({
          combustao: {
            kmNecessarios,
            litrosNecessarios,
            custoCombustivel,
            corridasNecessarias,
            ganhoBruto,
            ganhoLiquido,
            totalKmPeriodo,
            totalLitrosPeriodo,
            totalCustoCombustivelPeriodo,
            totalCorridasPeriodo,
            totalGanhoBrutoPeriodo,
            totalGanhoLiquidoPeriodo,
            ganhoPorHora: ganhoLiquido / horasNecessarias,
            horasNecessarias
          },
          eletrico: {
            kmNecessarios,
            kWhNecessarios,
            custoEnergia,
            corridasNecessarias,
            ganhoBruto,
            ganhoLiquido: ganhoLiquidoEletrico,
            totalKmPeriodo,
            totalkWhPeriodo,
            totalCustoEnergiaPeriodo,
            totalCorridasPeriodo,
            totalGanhoBrutoPeriodo: totalGanhoBrutoPeriodoEletrico,
            totalGanhoLiquidoPeriodo: totalGanhoLiquidoPeriodoEletrico,
            ganhoPorHora: ganhoPorHoraEletrico,
            horasNecessarias
          }
        });
      }
    }
  };

  const formatarDinheiro = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatarHoras = (horas: number) => {
    const horasInteiras = Math.floor(horas);
    const minutos = Math.round((horas - horasInteiras) * 60);
    return `${horasInteiras}h${minutos > 0 ? ` ${minutos}min` : ''}`;
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6">Calculadora de Estimativas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulário de Entrada */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Parâmetros de Cálculo</h2>
          
          <div className="space-y-4">
            {/* Seletor de Tipo de Veículo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Veículo
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setTipoVeiculo('combustao')}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                    tipoVeiculo === 'combustao'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Combustão
                </button>
                <button
                  onClick={() => setTipoVeiculo('eletrico')}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                    tipoVeiculo === 'eletrico'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Elétrico
                  <FaBolt className="inline-block ml-1" />
                </button>
              </div>
            </div>

            {/* Campos específicos para combustão */}
            {tipoVeiculo === 'combustao' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Preço da Gasolina (R$)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaGasPump className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={precoGasolina}
                      onChange={(e) => setPrecoGasolina(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Ex: 5.50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Média de Quilômetros por Litro
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaRoute className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      value={mediaKmLitro}
                      onChange={(e) => setMediaKmLitro(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Ex: 12.5"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Campos específicos para elétrico */}
            {tipoVeiculo === 'eletrico' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Preço da Energia (R$/kWh)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaBolt className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={precoEnergia}
                      onChange={(e) => setPrecoEnergia(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Ex: 0.85"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Média de Quilômetros por kWh
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaRoute className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      value={mediaKmkWh}
                      onChange={(e) => setMediaKmkWh(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Ex: 6.5"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Campos comuns */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meta Diária (R$)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMoneyBillWave className="text-gray-400" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={metaDiaria}
                  onChange={(e) => setMetaDiaria(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Ex: 200.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor por Quilômetro (R$/km)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalculator className="text-gray-400" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={valorPorKm}
                  onChange={(e) => setValorPorKm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Ex: 2.50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dias Trabalhados
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="text-gray-400" />
                </div>
                <input
                  type="number"
                  min="1"
                  value={diasTrabalhados}
                  onChange={(e) => setDiasTrabalhados(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Ex: 30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Horas por Dia
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaClock className="text-gray-400" />
                </div>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={horasPorDia}
                  onChange={(e) => setHorasPorDia(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Ex: 8"
                />
              </div>
            </div>

            <button
              onClick={calcularEstimativas}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Calcular Estimativas
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Resultados Estimados</h2>
          
          {resultados ? (
            <div className="space-y-4">
              {/* Resultados do tipo selecionado */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  {tipoVeiculo === 'combustao' ? 'Distância e Combustível (Diário)' : 'Distância e Energia (Diário)'}
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-700 dark:text-gray-300">
                    Quilômetros necessários: <span className="font-semibold">{resultados[tipoVeiculo].kmNecessarios.toFixed(1)} km</span>
                  </p>
                  {tipoVeiculo === 'combustao' ? (
                    <>
                      <p className="text-gray-700 dark:text-gray-300">
                        Litros de gasolina: <span className="font-semibold">{resultados.combustao.litrosNecessarios.toFixed(1)} L</span>
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        Custo com gasolina: <span className="font-semibold text-red-600">{formatarDinheiro(resultados.combustao.custoCombustivel)}</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-700 dark:text-gray-300">
                        kWh necessários: <span className="font-semibold">{resultados.eletrico.kWhNecessarios.toFixed(1)} kWh</span>
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        Custo com energia: <span className="font-semibold text-red-600">{formatarDinheiro(resultados.eletrico.custoEnergia)}</span>
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Corridas e Ganhos (Diário)</h3>
                <div className="space-y-2">
                  <p className="text-gray-700 dark:text-gray-300">
                    Corridas necessárias: <span className="font-semibold">{resultados[tipoVeiculo].corridasNecessarias}</span>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Ganho bruto: <span className="font-semibold text-green-600">{formatarDinheiro(resultados[tipoVeiculo].ganhoBruto)}</span>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Ganho líquido: <span className="font-semibold text-green-600">{formatarDinheiro(resultados[tipoVeiculo].ganhoLiquido)}</span>
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Totais do Período</h3>
                <div className="space-y-2">
                  <p className="text-gray-700 dark:text-gray-300">
                    Total de quilômetros: <span className="font-semibold">{resultados[tipoVeiculo].totalKmPeriodo.toFixed(1)} km</span>
                  </p>
                  {tipoVeiculo === 'combustao' ? (
                    <>
                      <p className="text-gray-700 dark:text-gray-300">
                        Total de litros: <span className="font-semibold">{resultados.combustao.totalLitrosPeriodo.toFixed(1)} L</span>
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        Total gasto com gasolina: <span className="font-semibold text-red-600">{formatarDinheiro(resultados.combustao.totalCustoCombustivelPeriodo)}</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-700 dark:text-gray-300">
                        Total de kWh: <span className="font-semibold">{resultados.eletrico.totalkWhPeriodo.toFixed(1)} kWh</span>
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        Total gasto com energia: <span className="font-semibold text-red-600">{formatarDinheiro(resultados.eletrico.totalCustoEnergiaPeriodo)}</span>
                      </p>
                    </>
                  )}
                  <p className="text-gray-700 dark:text-gray-300">
                    Total de corridas: <span className="font-semibold">{resultados[tipoVeiculo].totalCorridasPeriodo}</span>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Ganho bruto total: <span className="font-semibold text-green-600">{formatarDinheiro(resultados[tipoVeiculo].totalGanhoBrutoPeriodo)}</span>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Ganho líquido total: <span className="font-semibold text-green-600">{formatarDinheiro(resultados[tipoVeiculo].totalGanhoLiquidoPeriodo)}</span>
                  </p>
                </div>
              </div>

              {/* Comparativo */}
              <div className="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2 flex items-center">
                  <FaExchangeAlt className="mr-2" />
                  Comparativo entre Veículos
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-700 dark:text-gray-300">
                    Diferença no custo diário: <span className={`font-semibold ${resultados.eletrico.custoEnergia < resultados.combustao.custoCombustivel ? 'text-green-600' : 'text-red-600'}`}>
                      {formatarDinheiro(Math.abs(resultados.eletrico.custoEnergia - resultados.combustao.custoCombustivel))}
                      {' '}({resultados.eletrico.custoEnergia < resultados.combustao.custoCombustivel ? 'Economia' : 'Custo adicional'} com {resultados.eletrico.custoEnergia < resultados.combustao.custoCombustivel ? 'elétrico' : 'combustão'})
                    </span>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Diferença no ganho líquido diário: <span className={`font-semibold ${resultados.eletrico.ganhoLiquido > resultados.combustao.ganhoLiquido ? 'text-green-600' : 'text-red-600'}`}>
                      {formatarDinheiro(Math.abs(resultados.eletrico.ganhoLiquido - resultados.combustao.ganhoLiquido))}
                      {' '}({resultados.eletrico.ganhoLiquido > resultados.combustao.ganhoLiquido ? 'Mais' : 'Menos'} com {resultados.eletrico.ganhoLiquido > resultados.combustao.ganhoLiquido ? 'elétrico' : 'combustão'})
                    </span>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Diferença no período total: <span className={`font-semibold ${resultados.eletrico.totalGanhoLiquidoPeriodo > resultados.combustao.totalGanhoLiquidoPeriodo ? 'text-green-600' : 'text-red-600'}`}>
                      {formatarDinheiro(Math.abs(resultados.eletrico.totalGanhoLiquidoPeriodo - resultados.combustao.totalGanhoLiquidoPeriodo))}
                      {' '}({resultados.eletrico.totalGanhoLiquidoPeriodo > resultados.combustao.totalGanhoLiquidoPeriodo ? 'Mais' : 'Menos'} com {resultados.eletrico.totalGanhoLiquidoPeriodo > resultados.combustao.totalGanhoLiquidoPeriodo ? 'elétrico' : 'combustão'})
                    </span>
                  </p>
                </div>
              </div>

              {/* Nova seção de Tempo e Ganhos por Hora */}
              <div className="bg-yellow-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  <FaClock className="inline-block mr-2" />
                  Tempo e Ganhos por Hora
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-700 dark:text-gray-300">
                    Horas necessárias por dia: <span className="font-semibold">{formatarHoras(resultados[tipoVeiculo].horasNecessarias)}</span>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Ganho líquido por hora: <span className="font-semibold text-green-600">{formatarDinheiro(resultados[tipoVeiculo].ganhoPorHora)}/h</span>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Média de horas por corrida: <span className="font-semibold">{formatarHoras(resultados[tipoVeiculo].horasNecessarias / resultados[tipoVeiculo].corridasNecessarias)}</span>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Valor médio por corrida: <span className="font-semibold text-green-600">{formatarDinheiro(resultados[tipoVeiculo].ganhoBruto / resultados[tipoVeiculo].corridasNecessarias)}</span>
                  </p>
                  {resultados[tipoVeiculo].horasNecessarias > parseFloat(horasPorDia) && (
                    <p className="text-red-600 font-medium mt-2">
                      ⚠️ Atenção: O tempo necessário ({formatarHoras(resultados[tipoVeiculo].horasNecessarias)}) é maior que as horas disponíveis por dia ({horasPorDia}h). Considere ajustar sua meta ou aumentar as horas trabalhadas.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>Preencha os campos acima e clique em "Calcular Estimativas" para ver os resultados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculadoraPage; 