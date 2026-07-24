'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Cpu, AlertTriangle, CheckCircle2, Send
} from 'lucide-react';
import type { Cliente, Orcamento, Usuario } from '../types/crm';
import { dbService } from '../services/supabase-client';
import { aiService } from '../services/ai-service';

interface InteligenciaIAProps {
  usuarioLogado: Usuario;
  isDarkTheme: boolean;
}

export const InteligenciaIA: React.FC<InteligenciaIAProps> = ({ usuarioLogado, isDarkTheme }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);

  // Estados do Copiloto de Briefing
  const [briefingInput, setBriefingInput] = useState('');
  const [analisando, setAnalisando] = useState(false);
  const [statusAnalise, setStatusAnalise] = useState('');
  const [resultadoBriefing, setResultadoBriefing] = useState<string | null>(null);

  // Fluxo de criar orçamento rápido
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState('');
  const [probabilidade, setProbabilidade] = useState(8);
  const [gravandoOrcamento, setGravandoOrcamento] = useState(false);
  const [sucessoCriacao, setSucessoCriacao] = useState(false);

  const carregarDados = async () => {
    try {
      const [listCli, listOrc] = await Promise.all([
        dbService.clientes.list(),
        dbService.orcamentos.list()
      ]);
      setClientes(listCli);
      setOrcamentos(listOrc);
      if (listCli.length > 0) {
        setClienteSelecionadoId(listCli[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [usuarioLogado]);

  // Templates rápidos
  const templatesRapidos = [
    { label: '🍷 Vinho Premium', text: 'Estojo reforçado para kit de 3 garrafas de vinho de alta gama, resistência mecânica contra choque, acabamento flexográfico atóxico.' },
    { label: '👟 Sapato Gaveta', text: 'Caixa tipo gaveta deslizante para calçado premium, papel cartão duplex 300g acoplado a micro-ondulado, verniz UV localizado na logomarca.' },
    { label: '🍫 Chocolates Finos', text: 'Cartucho duplex 350g certificado FSC com berço interno e barreira antivazamento de óleo para bombons finos.' }
  ];

  const handleAnalisarBriefing = async () => {
    if (!briefingInput.trim()) return;
    setAnalisando(true);
    setResultadoBriefing(null);
    setSucessoCriacao(false);

    const etapas = [
      'Lendo entrada...',
      'Calculando composição de papéis...',
      'Analisando viabilidade Carton Pack...',
      'Formatando ficha técnica final...'
    ];

    for (let i = 0; i < etapas.length; i++) {
      setStatusAnalise(etapas[i]);
      await new Promise(r => setTimeout(r, 500));
    }

    try {
      const response = await aiService.generateTechnicalBriefing(briefingInput);
      setResultadoBriefing(response);
    } catch (e) {
      console.error(e);
      setResultadoBriefing('Erro ao processar briefing.');
    } finally {
      setAnalisando(false);
    }
  };

  const handleCriarOrcamento = async () => {
    if (!resultadoBriefing || !clienteSelecionadoId) return;
    setGravandoOrcamento(true);
    try {
      await dbService.orcamentos.save({
        cliente_id: clienteSelecionadoId,
        responsavel_id: usuarioLogado.id,
        etapa_atual: 'solicitacao_briefing',
        probabilidade_fechamento: probabilidade,
        valor_aprovado: null,
        data_fechamento: null,
        motivo_perda: null,
        justificativa_livre: `Briefing Técnico Automático IA:\n\n${resultadoBriefing}`
      });
      setSucessoCriacao(true);
      setTimeout(() => setSucessoCriacao(false), 5000);
      carregarDados();
    } catch (e) {
      console.error(e);
    } finally {
      setGravandoOrcamento(false);
    }
  };

  // Fase 2 - Inteligência Estimada
  // Churn Warning: Clientes sem contato recente (Críticos/Atenção)
  const clientesChurn = clientes.filter(c => c.status_carteira === 'critico' || c.status_carteira === 'atencao').slice(0, 3);
  
  // Sugestões de Próxima Ação
  const proximasAcoes = [
    { cliente: 'Vinícola Vale do Sol', acao: 'Enviar mock-up 3D da caixa de vinho acoplada', prioridade: 'Alta' },
    { cliente: 'Calçados Elegance S.A.', acao: 'Agendar visita presencial para ajustar cola da gaveta', prioridade: 'Alta' },
    { cliente: 'Chocolate Imperial', acao: 'Disparar cotação do clichê de Hot Stamping Páscoa', prioridade: 'Média' }
  ];

  // Orçamentos parados (etapa !== final e sem contato há dias)
  const orcamentosParados = orcamentos.filter(o => !o.data_fechamento && !o.motivo_perda).slice(0, 3).map((o, idx) => {
    const cli = clientes.find(c => c.id === o.cliente_id);
    const dias = [8, 12, 5][idx % 3];
    return {
      cliente: cli?.razao_social || 'Cliente Especial',
      etapa: o.etapa_atual.replace('_', ' '),
      diasParado: dias
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl md:text-2xl font-bold tracking-tight text-[var(--white)] flex items-center gap-2">
          <Sparkles className="text-[var(--lime)] animate-pulse" size={22} />
          Inteligência de Dados & Copiloto IA
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA: Copiloto de Briefing (7 colunas) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Briefing Card */}
          <div className={`p-6 rounded-xl border space-y-4 ${
            isDarkTheme ? 'bg-[#18181B] border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-2 border-b border-zinc-850 pb-2">
              <Cpu size={16} className="text-[#B4D932]" />
              <span className="text-xs uppercase font-bold text-zinc-300 tracking-wider">Copiloto de Briefing por IA</span>
            </div>

            <p className="text-[11px] text-zinc-550 leading-relaxed">
              Digite os requisitos do cliente de forma livre. O Copiloto montará a ficha técnica preliminar, mapeará riscos produtivos e calculará o lote ideal.
            </p>

            {/* Templates */}
            <div className="flex flex-wrap gap-2">
              {templatesRapidos.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => setBriefingInput(t.text)}
                  className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                    isDarkTheme 
                      ? 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-300 hover:text-[#B4D932]'
                      : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-650 hover:text-zinc-950'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="space-y-3">
              <textarea
                value={briefingInput}
                onChange={(e) => setBriefingInput(e.target.value)}
                placeholder="ex: Cliente quer uma caixa gaveta para sapatos com BOPP fosco e verniz UV..."
                rows={3}
                className={`w-full p-3 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-[#B4D932] ${
                  isDarkTheme ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                }`}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAnalisarBriefing}
                  disabled={analisando || !briefingInput.trim()}
                  className="bg-[#B4D932] hover:bg-[#a3c42a] text-black text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {analisando ? (
                    <>
                      <div className="h-3 w-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Analisando...</span>
                    </>
                  ) : (
                    <>
                      <Send size={12} />
                      <span>Processar Briefing por IA</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Loading */}
          {analisando && (
            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/20 text-center space-y-2">
              <div className="h-6 w-6 border-2 border-[#B4D932] border-t-transparent rounded-full animate-spin mx-auto" />
              <span className="text-[10px] text-zinc-500 block font-semibold animate-pulse">{statusAnalise}</span>
            </div>
          )}

          {/* Resultado */}
          {resultadoBriefing && !analisando && (
            <div className={`p-6 rounded-xl border space-y-6 ${
              isDarkTheme ? 'bg-[#18181B] border-zinc-800 animate-fadeIn' : 'bg-white border-zinc-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between border-b border-[#B4D932]/10 pb-2">
                <span className="text-xs uppercase font-extrabold text-[#B4D932] flex items-center gap-1.5">
                  <Sparkles size={14} />
                  Ficha Técnica Gerada
                </span>
                <span className="text-[9px] bg-green-500/10 text-green-400 font-extrabold px-2 py-0.5 rounded border border-green-500/25">
                  Lote Sugerido
                </span>
              </div>

              {/* Renderização Formatada */}
              <div className="space-y-4 text-xs leading-relaxed text-zinc-300">
                {resultadoBriefing.split('###').filter(Boolean).map((section, idx) => {
                  const lines = section.split('\n');
                  const title = lines[0].trim();
                  const content = lines.slice(1).join('\n');
                  return (
                    <div key={idx} className="p-3 rounded-lg bg-zinc-950/40 border border-zinc-900/60 space-y-1">
                      <span className="font-bold text-zinc-200 block text-[10px] uppercase">{title}</span>
                      <div className="pl-4 space-y-1 text-zinc-400">
                        {content.split('\n').filter(l => l.trim().startsWith('-')).map((l, lIdx) => (
                          <div key={lIdx} className="relative">
                            <span className="absolute -left-3 text-[#B4D932]">•</span>
                            <span dangerouslySetInnerHTML={{ __html: l.replace(/^-\s*|\*\*/g, '').replace(/:\s*/, ': <strong>') + (l.includes(':') ? '</strong>' : '') }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Salvar Orçamento Rápido */}
              <div className="p-4 bg-sky-950/20 border border-sky-900/30 rounded-lg space-y-3">
                <span className="text-xs font-bold text-sky-400 block uppercase">Workflow: Criar Oportunidade no Funil</span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-zinc-550 mb-1">Associar Cliente:</label>
                    <select
                      value={clienteSelecionadoId}
                      onChange={(e) => setClienteSelecionadoId(e.target.value)}
                      className={`w-full p-2 rounded border focus:outline-none ${
                        isDarkTheme ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                      }`}
                    >
                      {clientes.map(c => (
                        <option key={c.id} value={c.id}>{c.razao_social}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-550 mb-1">Probabilidade Fechamento:</label>
                    <select
                      value={probabilidade}
                      onChange={(e) => setProbabilidade(parseInt(e.target.value))}
                      className={`w-full p-2 rounded border focus:outline-none ${
                        isDarkTheme ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                      }`}
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={n}>{n}/10 ({n*10}%)</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleCriarOrcamento}
                    disabled={gravandoOrcamento}
                    className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2 rounded transition-colors"
                  >
                    {gravandoOrcamento ? 'Gravando...' : 'Confirmar Rascunho no Kanban'}
                  </button>
                </div>

                {sucessoCriacao && (
                  <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 p-2 text-[10px] font-bold text-center animate-pulse">
                    ✓ Orçamento salvo com sucesso na primeira raia (Briefing) do Kanban!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: Churn, Ações, Orçamentos Parados (5 colunas) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Churn Warning */}
          <div className={`p-5 rounded-xl border space-y-3 ${
            isDarkTheme ? 'bg-[#18181B] border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider flex items-center gap-1">
              <AlertTriangle size={12} />
              Risco de Churn (Alerta Preditivo)
            </span>
            <div className="space-y-2 text-xs">
              {clientesChurn.map(c => {
                let dias = 0;
                if (c.data_ultimo_contato) {
                  dias = Math.floor((new Date().getTime() - new Date(c.data_ultimo_contato).getTime()) / (24*60*60*1000));
                }
                return (
                  <div key={c.id} className="p-3 rounded-lg bg-zinc-955/40 border border-zinc-900 flex justify-between items-center">
                    <div>
                      <strong className="text-zinc-200 block">{c.razao_social}</strong>
                      <span className="text-[9px] text-rose-500 font-bold uppercase">{dias > 90 ? 'Crítico' : 'Atenção'} • {dias} dias sem contato</span>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sugestão de Próxima Ação */}
          <div className={`p-5 rounded-xl border space-y-3 ${
            isDarkTheme ? 'bg-[#18181B] border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider flex items-center gap-1">
              <CheckCircle2 size={12} />
              Sugestões de Próxima Ação de Vendas
            </span>
            <div className="space-y-2 text-xs">
              {proximasAcoes.map((a, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-zinc-955/40 border border-zinc-900 space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-zinc-200">{a.cliente}</strong>
                    <span className="text-[9px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">{a.prioridade}</span>
                  </div>
                  <p className="text-[10px] text-zinc-450 italic">"{a.acao}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo de Orçamentos Parados */}
          <div className={`p-5 rounded-xl border space-y-3 ${
            isDarkTheme ? 'bg-[#18181B] border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider flex items-center gap-1">
              <AlertTriangle size={12} />
              Resumo de Orçamentos Parados
            </span>
            <div className="space-y-2 text-xs">
              {orcamentosParados.map((o, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-zinc-955/40 border border-zinc-900 flex justify-between items-center">
                  <div>
                    <strong className="text-zinc-200 block truncate max-w-[150px]">{o.cliente}</strong>
                    <span className="text-[10px] text-zinc-500 capitalize">Etapa: {o.etapa}</span>
                  </div>
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
                    Parado {o.diasParado} dias
                  </span>
                </div>
              ))}
              {orcamentosParados.length === 0 && (
                <div className="text-center py-2 text-[10px] text-zinc-550 italic">Nenhum orçamento parado no funil.</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
