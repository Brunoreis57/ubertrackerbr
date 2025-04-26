'use client';

import { useEffect, useState } from 'react';
import FormularioCorrida from '../components/FormularioCorrida';
import { Corrida } from '../types';
import { carregarDados, salvarDados } from '../lib/utils';
import { useRouter } from 'next/navigation';
import { verificarLogin } from '../lib/authUtils';
import RotaProtegida from '../components/RotaProtegida';

export default function AdicionarCorrida() {
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Verificar se o usuário está logado
    const { logado, sessao } = verificarLogin();
    if (logado && sessao) {
      setUsuarioId(sessao.id);
      
      // Carregar corridas do localStorage específicas do usuário
      const chaveCorridasUsuario = `corridas_${sessao.id}`;
      const corridasSalvas = carregarDados<Corrida[]>(chaveCorridasUsuario, []);
      setCorridas(corridasSalvas);
      
      console.log(`Carregadas ${corridasSalvas.length} corridas para o usuário ${sessao.id}`);
    } else {
      // Carregar corridas da chave genérica para compatibilidade
      const corridasSalvas = carregarDados<Corrida[]>('corridas', []);
      setCorridas(corridasSalvas);
    }
  }, []);

  const handleSalvarCorrida = (corrida: Corrida) => {
    try {
      console.log('Adicionando nova corrida:', corrida);
      
      // Determinar a chave de armazenamento com base no login
      const chaveArmazenamento = usuarioId ? `corridas_${usuarioId}` : 'corridas';
      
      // Obter as corridas atualizadas diretamente do localStorage para garantir dados atuais
      const corridasSalvas = carregarDados<Corrida[]>(chaveArmazenamento, []);
      
      // Verificar se é uma edição ou uma nova corrida
      const novasCorridas = corridasSalvas.some((c) => c.id === corrida.id)
        ? corridasSalvas.map((c) => (c.id === corrida.id ? corrida : c))
        : [...corridasSalvas, corrida];

      console.log(`Lista atualizada de corridas (${chaveArmazenamento}):`, novasCorridas.length);
      
      // Salvar no localStorage
      salvarDados(chaveArmazenamento, novasCorridas);
      
      // Se o usuário estiver logado, também salvar uma cópia de segurança
      if (usuarioId) {
        salvarDados(`corridas_copia_seguranca_${usuarioId}`, novasCorridas);
      }
      
      setCorridas(novasCorridas);
      
      // Exibir mensagem de sucesso
      exibirMensagem('Corrida adicionada com sucesso! Redirecionando...', 'sucesso');
      
      // Recarregar a página de corridas
      setTimeout(() => {
        router.push('/corridas-diarias');
      }, 2000);
    } catch (erro) {
      console.error('Erro ao salvar corrida:', erro);
      exibirMensagem('Erro ao salvar corrida. Tente novamente.', 'erro');
    }
  };

  const exibirMensagem = (texto: string, tipo: 'sucesso' | 'erro') => {
    setMensagem({ texto, tipo });
    setTimeout(() => {
      setMensagem(null);
    }, 5000);
  };

  return (
    <RotaProtegida>
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl bg-gray-200/60 rounded-lg">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 dark:text-white">Adicionar Corrida</h1>
        
        {mensagem && (
          <div
            className={`p-3 sm:p-4 mb-4 sm:mb-6 rounded-md ${
              mensagem.tipo === 'sucesso' 
                ? 'bg-green-100 border-green-400 text-green-800' 
                : 'bg-red-100 border-red-400 text-red-800'
            } border-2`}
          >
            {mensagem.texto}
          </div>
        )}
        
        <div className="mx-auto">
          <FormularioCorrida onSalvar={handleSalvarCorrida} />
        </div>
      </div>
    </RotaProtegida>
  );
} 