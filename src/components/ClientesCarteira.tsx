'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Award, ChevronRight, RefreshCw, X, Building2,
  MapPin, Phone, Mail, Package, Star, AlertTriangle, ChevronDown, UserPlus
} from 'lucide-react';
import type { Cliente, Usuario, CarteiraStatus, PotencialClassificacao } from '../types/crm';
import { dbService } from '../services/supabase-client';
import { cnpjaService } from '../services/cnpja-service';
import type { CNPJaSearchResult } from '../services/cnpja-service';
import { toastService } from '../services/toast-service';
import { ProspeccaoModal } from './ProspeccaoModal';

interface ClientesCarteiraProps {
  usuarioLogado: Usuario;
  usuariosDisponiveis: Usuario[];
  isDarkTheme: boolean;
  onSelectCliente: (clienteId: string) => void;
}

export const ClientesCarteira: React.FC<ClientesCarteiraProps> = ({
  usuarioLogado, usuariosDisponiveis, isDarkTheme, onSelectCliente
}) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroSegmento, setFiltroSegmento] = useState<string>('todos');
  const [filtroPotencial, setFiltroPotencial] = useState<string>('todos');
  const [filtroRep, setFiltroRep] = useState<string>('todos');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  const [showCadastro, setShowCadastro] = useState(false);
  const [showProspeccao, setShowProspeccao] = useState(false);
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('RS');
  const [segmento, setSegmento] = useState('Papel Cartão');
  const [representanteId, setRepresentanteId] = useState('');
  const [classificacao, setClassificacao] = useState<PotencialClassificacao>('C');
  const [volumeMensal, setVolumeMensal] = useState('0');
  const [principaisProdutos, setPrincipaisProdutos] = useState('');
  const [potencialCrescimento, setPotencialCrescimento] = useState('');
  const [exigenciasQualidade, setExigenciasQualidade] = useState('');
  const [necessidadeCertificacoes, setNecessidadeCertificacoes] = useState('');
  const [potencialNovosProjetos, setPotencialNovosProjetos] = useState('');

  const [cnpjSearchTerm, setCnpjSearchTerm] = useState('');
  const [cnpjSuggestions, setCnpjSuggestions] = useState<CNPJaSearchResult[]>([]);
  const [cnpjSearchLoading, setCnpjSearchLoading] = useState(false);

  useEffect(() => {
    const buscarSugestoes = async () => {
      const cleanTerm = cnpjSearchTerm.replace(/\D/g, '');
      if (cleanTerm.length >= 11 && cleanTerm.length <= 14) {
        setCnpjSuggestions([{ razao_social: `🔍 Consultar CNPJ "${cnpjaService._formatarCNPJ(cleanTerm)}" via CNPJá`, cnpj: cleanTerm, cidade: '', estado: '', segmento: 'Papel Cartão', isMock: false }]);
      } else if (cnpjSearchTerm.trim().length >= 2) {
        const res = await cnpjaService.buscarPorRazaoSocial(cnpjSearchTerm);
        setCnpjSuggestions(res);
      } else {
        setCnpjSuggestions([]);
      }
    };
    const t = setTimeout(buscarSugestoes, 300);
    return () => clearTimeout(t);
  }, [cnpjSearchTerm]);

  const handleSelectCnpjSuggestion = async (sug: CNPJaSearchResult) => {
    if (sug.cidade === '') {
      try {
        setCnpjSearchLoading(true);
        const data = await cnpjaService.consultarCNPJ(sug.cnpj);
        setRazaoSocial(data.razaoSocial); setCnpj(data.cnpj); setCidade(data.cidade); setEstado(data.estado);
        const nomeLower = data.razaoSocial.toLowerCase();
        setSegmento(nomeLower.includes('ondulado') || nomeLower.includes('caixa') ? 'Micro-ondulado' : 'Papel Cartão');
      } catch (err: any) { toastService.error(err.message || 'Erro ao consultar CNPJá.'); }
      finally { setCnpjSearchLoading(false); setCnpjSearchTerm(''); setCnpjSuggestions([]); }
    } else {
      setRazaoSocial(sug.razao_social); setCnpj(sug.cnpj); setCidade(sug.cidade); setEstado(sug.estado); setSegmento(sug.segmento);
      setCnpjSearchTerm(''); setCnpjSuggestions([]);
    }
  };

  const fecharCadastro = () => { setShowCadastro(false); setCnpjSearchTerm(''); setCnpjSuggestions([]); };

  const carregarDados = async () => {
    try {
      setLoading(true);
      const list = await dbService.clientes.list();
      setClientes(list);
      if (list.length > 0 && !selectedCliente) setSelectedCliente(list[0]);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { carregarDados(); }, [usuarioLogado]);

  const handleRedistribuir = async (repId: string) => {
    if (!selectedCliente) return;
    try {
      const updated = await dbService.clientes.update(selectedCliente.id, { representante_id: repId });
      setSelectedCliente(updated); toastService.success('Representante redistribuído!'); carregarDados();
    } catch (e) { console.error(e); }
  };

  const handleReativar = async () => {
    if (!selectedCliente) return;
    try {
      const updated = await dbService.clientes.update(selectedCliente.id, { status_carteira: 'ativo', data_ultimo_contato: new Date().toISOString() });
      setSelectedCliente(updated); toastService.success('Cliente reativado com sucesso!'); carregarDados();
    } catch (e) { console.error(e); }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!razaoSocial || !cnpj || !cidade || !estado) { toastService.warning('Preencha todos os campos obrigatórios.'); return; }
    try {
      const saved = await dbService.clientes.save({ razao_social: razaoSocial, cnpj, cidade, estado, segmento, representante_id: representanteId || null, vendedor_interno_id: 'usr-vend', classificacao_potencial: classificacao, volume_mensal: parseFloat(volumeMensal) || 0, principais_produtos: principaisProdutos ? principaisProdutos.split(',').map(p => p.trim()) : [], potencial_crescimento: potencialCrescimento, exigencias_qualidade: exigenciasQualidade, necessidade_certificacoes: necessidadeCertificacoes, potencial_novos_projetos: potencialNovosProjetos, intervalo_medio_compras: null });
      toastService.success('Cliente cadastrado!'); fecharCadastro(); setSelectedCliente(saved);
      setRazaoSocial(''); setCnpj(''); setCidade(''); setVolumeMensal('0');
      setPrincipaisProdutos(''); setPotencialCrescimento(''); setExigenciasQualidade('');
      setNecessidadeCertificacoes(''); setPotencialNovosProjetos('');
      carregarDados();
    } catch (err) { toastService.error('Erro ao cadastrar cliente.'); }
  };

  const clientesFiltrados = clientes.filter(c => {
    const atendeBusca = c.razao_social.toLowerCase().includes(busca.toLowerCase()) || c.cnpj.includes(busca);
    const atendeStatus = filtroStatus === 'todos' || c.status_carteira === filtroStatus;
    const atendeSegmento = filtroSegmento === 'todos' || c.segmento === filtroSegmento;
    const atendePotencial = filtroPotencial === 'todos' || c.classificacao_potencial === filtroPotencial;
    const atendeRep = filtroRep === 'todos' || c.representante_id === filtroRep;
    return atendeBusca && atendeStatus && atendeSegmento && atendePotencial && atendeRep;
  });

  const statusConfig: Record<CarteiraStatus, { color: string; bg: string; label: string; dot: string }> = {
    ativo:   { color: '#48c767', bg: 'rgba(72,199,103,0.12)', label: 'Ativo',   dot: '#48c767' },
    atencao: { color: '#f0c419', bg: 'rgba(240,196,25,0.12)', label: 'Atenção', dot: '#f0c419' },
    critico: { color: '#e2483d', bg: 'rgba(226,72,61,0.12)',  label: 'Crítico', dot: '#e2483d' },
    inativo: { color: '#666666', bg: 'rgba(102,102,102,0.12)',label: 'Inativo', dot: '#666666' },
  };

  const curvaConfig: Record<string, { color: string; bg: string }> = {
    A: { color: '#b4d932', bg: 'rgba(180,217,50,0.12)' },
    B: { color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
    C: { color: '#71717a', bg: 'rgba(113,113,122,0.12)' },
  };

  const representantes = usuariosDisponiveis.filter(u => u.papel === 'representante');
  const selectClass = "w-full bg-[var(--black)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[var(--lime)]/50 transition-all appearance-none cursor-pointer font-mono";
  const labelClass = "text-[9px] text-[var(--gray2)] uppercase font-mono tracking-wide block mb-1.5";
  const inputClass = "w-full bg-[var(--black)] border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[var(--gray2)] outline-none focus:border-[var(--lime)]/50 transition-all";

  return (
    <div className="page-content animate-fade-up pb-12 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold text-[var(--white)] tracking-tight">Carteira de Clientes</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowProspeccao(true)}
            className="btn btn-secondary flex items-center gap-2 cursor-pointer shrink-0 text-[var(--lime)] border-[var(--lime)]/30 hover:border-[var(--lime)]"
          >
            <UserPlus size={14} /> Prospectar Novos Leads B2B
          </button>
          <button onClick={() => setShowCadastro(true)} className="btn btn-primary flex items-center gap-2 cursor-pointer shrink-0">
            <Plus size={14} /> Cadastrar Cliente (CNPJá)
          </button>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LEFT: Client List (5 cols) ── */}
        <div className="lg:col-span-5 space-y-4">

          {/* Search bar */}
          <div className="flex items-center gap-2 bg-[var(--card)] border border-[var(--line)] rounded-2xl px-4 py-3 focus-within:border-[var(--lime)]/40 transition-all">
            <Search size={14} className="text-[var(--gray2)] shrink-0" />
            <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por razão social ou CNPJ..."
              className="bg-transparent border-none outline-none text-sm w-full text-zinc-200 placeholder-[var(--gray2)]" />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: filtroStatus, onChange: setFiltroStatus, options: [['todos','Todos os Status'],['ativo','Ativo'],['atencao','Atenção'],['critico','Crítico'],['inativo','Inativo']] },
              { value: filtroSegmento, onChange: setFiltroSegmento, options: [['todos','Todos Segmentos'],['Papel Cartão','Papel Cartão'],['Micro-ondulado','Micro-ondulado']] },
              { value: filtroPotencial, onChange: setFiltroPotencial, options: [['todos','Todos Curva'],['A','Curva A'],['B','Curva B'],['C','Curva C']] },
              { value: filtroRep, onChange: setFiltroRep, options: [['todos','Todos Reps'], ...representantes.map(r => [r.id, r.nome.split(' ')[0]])] },
            ].map((f, i) => (
              <div key={i} className="relative">
                <select className={selectClass} value={f.value} onChange={e => f.onChange(e.target.value)}>
                  {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <ChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--gray2)] pointer-events-none" />
              </div>
            ))}
          </div>

          {/* Count */}
          <div className="text-[10px] font-mono text-[var(--gray2)] px-1">
            {clientesFiltrados.length} cliente{clientesFiltrados.length !== 1 ? 's' : ''} encontrado{clientesFiltrados.length !== 1 ? 's' : ''}
          </div>

          {/* Client list */}
          {loading ? (
            <div className="flex items-center justify-center py-12 text-xs text-[var(--gray2)] font-mono gap-2">
              <div className="w-4 h-4 border-2 border-[var(--lime)] border-t-transparent rounded-full animate-spin" />
              Carregando carteira...
            </div>
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              {clientesFiltrados.map(c => {
                const sc = statusConfig[c.status_carteira] || statusConfig.inativo;
                const cc = curvaConfig[c.classificacao_potencial] || curvaConfig.C;
                const isSelected = selectedCliente?.id === c.id;
                return (
                  <div key={c.id} onClick={() => setSelectedCliente(c)}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-[var(--lime)]/40 bg-[var(--lime)]/6' : 'border-[var(--line)] bg-[var(--card)] hover:border-[rgba(255,255,255,0.1)]'}`}>
                    <span className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: sc.dot, boxShadow: `0 0 6px ${sc.dot}60` }} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold truncate ${isSelected ? 'text-[var(--lime)]' : 'text-[var(--white)]'}`}>{c.razao_social}</div>
                      <div className="text-[10px] text-[var(--gray)] font-mono mt-0.5 truncate">{c.cidade} · {c.estado} · {c.segmento}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[8px] font-mono font-black px-2 py-0.5 rounded border" style={{ color: cc.color, backgroundColor: cc.bg, borderColor: `${cc.color}40` }}>
                        CURVA {c.classificacao_potencial}
                      </span>
                      <span className="text-[8px] font-mono font-bold px-2 py-0.5 rounded-full" style={{ color: sc.color, backgroundColor: sc.bg }}>
                        {sc.label.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
              {clientesFiltrados.length === 0 && (
                <div className="text-center py-12 text-xs text-[var(--gray2)] font-mono">Nenhum cliente encontrado com os filtros aplicados.</div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: Client Detail (7 cols) ── */}
        <div className="lg:col-span-7">
          {selectedCliente ? (
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] overflow-hidden">

              {/* Detail Header */}
              <div className="p-6 border-b border-[var(--line)] bg-gradient-to-r from-[var(--card)] to-[var(--charcoal)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--lime)]/10 border border-[var(--lime)]/20 flex items-center justify-center shrink-0">
                      <Building2 size={20} className="text-[var(--lime)]" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-display font-bold text-lg text-white leading-tight">{selectedCliente.razao_social}</h2>
                      <div className="text-[11px] font-mono text-[var(--gray)] mt-1">{selectedCliente.cnpj}</div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {(() => { const sc = statusConfig[selectedCliente.status_carteira] || statusConfig.inativo; return (
                          <span className="text-[9px] font-mono font-bold px-2.5 py-1 rounded-full border uppercase" style={{ color: sc.color, backgroundColor: sc.bg, borderColor: `${sc.color}40` }}>{sc.label}</span>
                        )})()}
                        {(() => { const cc = curvaConfig[selectedCliente.classificacao_potencial] || curvaConfig.C; return (
                          <span className="text-[9px] font-mono font-black px-2.5 py-1 rounded border" style={{ color: cc.color, backgroundColor: cc.bg, borderColor: `${cc.color}40` }}>CURVA {selectedCliente.classificacao_potencial}</span>
                        )})()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {(selectedCliente.status_carteira === 'critico' || selectedCliente.status_carteira === 'inativo') && (
                      <button onClick={handleReativar} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--lime)]/30 bg-[var(--lime)]/8 text-[var(--lime)] text-xs font-bold hover:bg-[var(--lime)]/15 transition-all cursor-pointer">
                        <RefreshCw size={11} /> Reativar
                      </button>
                    )}
                    <button onClick={() => onSelectCliente(selectedCliente.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--black)] text-[var(--gray)] text-xs font-bold hover:border-[var(--lime)]/40 hover:text-[var(--lime)] transition-all cursor-pointer">
                      <ChevronRight size={11} /> Ver Timeline
                    </button>
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-3 gap-px bg-[var(--line)]">
                {[
                  { label: 'Cidade / UF', value: `${selectedCliente.cidade}, ${selectedCliente.estado}`, icon: MapPin },
                  { label: 'Segmento', value: selectedCliente.segmento, icon: Package },
                  { label: 'Volume Mensal', value: `${selectedCliente.volume_mensal || 0} ton`, icon: Award },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="bg-[var(--charcoal)] p-4">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Icon size={10} className="text-[var(--lime)]" />
                        <span className="text-[9px] font-mono uppercase text-[var(--gray2)] tracking-wide">{item.label}</span>
                      </div>
                      <div className="text-sm font-semibold text-[var(--white)]">{item.value}</div>
                    </div>
                  );
                })}
              </div>

              {/* Specs section */}
              <div className="p-5 border-t border-[var(--line)] space-y-3">
                <h4 className="text-[10px] font-mono uppercase font-bold text-[var(--gray)] tracking-widest">Informações Técnicas & Comerciais</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { label: 'Principais Produtos', value: selectedCliente.principais_produtos?.join(', ') || '—' },
                    { label: 'Potencial de Crescimento', value: selectedCliente.potencial_crescimento || '—' },
                    { label: 'Exigências de Qualidade', value: selectedCliente.exigencias_qualidade || '—' },
                    { label: 'Certificações Necessárias', value: selectedCliente.necessidade_certificacoes || '—' },
                    { label: 'Potencial Novos Projetos', value: selectedCliente.potencial_novos_projetos || '—' },
                    { label: 'Intervalo Médio de Compras', value: selectedCliente.intervalo_medio_compras ? `${selectedCliente.intervalo_medio_compras} dias` : '—' },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-xl bg-[var(--black)] border border-[var(--line)]">
                      <div className={labelClass}>{item.label}</div>
                      <div className="text-[var(--white)] font-medium leading-relaxed">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geo widget */}
              <div className="mx-5 mb-5 rounded-2xl bg-[var(--charcoal)] border border-[var(--line)] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--line)]">
                  <MapPin size={13} className="text-[var(--lime)]" />
                  <span className="text-[10px] font-mono uppercase font-bold text-[var(--gray)] tracking-widest">Geolocalização Carton Pack</span>
                </div>
                <div className="flex items-center gap-5 p-4">
                  {/* Radar pulse */}
                  <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-[var(--lime)]/20 animate-ping" style={{ animationDuration: '2s' }} />
                    <div className="absolute inset-2 rounded-full border border-[var(--lime)]/30 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.3s' }} />
                    <div className="w-5 h-5 rounded-full bg-[var(--lime)]/20 border border-[var(--lime)]/60 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[var(--lime)]" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="text-xs font-semibold text-[var(--white)]">{selectedCliente.cidade}, {selectedCliente.estado}</div>
                    <div className="text-[10px] font-mono text-[var(--gray)]">Rota planejada via Carton Pack CRM</div>
                    <div className="text-[9px] font-mono text-[var(--lime)]/70">● GPS sincronizado com malha logística</div>
                  </div>
                </div>
              </div>

              {/* Redistribuir representante */}
              {representantes.length > 0 && (
                <div className="px-5 pb-5 border-t border-[var(--line)] pt-5">
                  <label className={`${labelClass} mb-2`}>Redistribuir Representante Responsável</label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <select className={selectClass} value={selectedCliente.representante_id || ''} onChange={e => handleRedistribuir(e.target.value)}>
                        <option value="">Sem representante</option>
                        {representantes.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
                      </select>
                      <ChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--gray2)] pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 rounded-2xl border border-dashed border-[var(--line)] text-center gap-3">
              <Building2 size={32} className="text-[var(--gray2)]" />
              <div className="text-sm font-semibold text-[var(--gray)]">Selecione um cliente</div>
              <div className="text-xs text-[var(--gray2)]">Clique em qualquer registro para ver a ficha completa</div>
            </div>
          )}
        </div>

      </div>

      {/* ── New Client Modal ── */}
      {showCadastro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={fecharCadastro} />
          <div className="relative z-10 w-full max-w-2xl bg-[var(--charcoal)] border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            <div className="flex items-center justify-between p-6 border-b border-[var(--line)] bg-[var(--card)] shrink-0">
              <div>
                <div className="text-[9px] font-mono uppercase tracking-wider font-bold text-[var(--lime)]">Cadastro via CNPJá API</div>
                <h3 className="font-display font-bold text-lg text-white mt-1">Novo Cliente na Carteira</h3>
              </div>
              <button onClick={fecharCadastro} className="p-2 rounded-xl border border-[var(--line)] hover:border-[var(--lime)]/40 text-[var(--gray)] hover:text-white cursor-pointer transition-all">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="flex-1 overflow-y-auto p-6 space-y-5">

              {/* CNPJá Search */}
              <div className="relative">
                <label className={labelClass}>Buscar Empresa por CNPJ ou Razão Social</label>
                <div className="flex items-center gap-2 bg-[var(--black)] border border-[var(--lime)]/30 rounded-xl px-3 py-2.5 focus-within:border-[var(--lime)]/60 transition-all">
                  <Search size={14} className="text-[var(--lime)] shrink-0" />
                  <input type="text" className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-[var(--gray2)]"
                    placeholder="Digite CNPJ (11-14 dígitos) ou nome da empresa..."
                    value={cnpjSearchTerm} onChange={e => setCnpjSearchTerm(e.target.value)} />
                  {cnpjSearchLoading && <div className="w-4 h-4 border-2 border-[var(--lime)] border-t-transparent rounded-full animate-spin shrink-0" />}
                </div>
                {cnpjSuggestions.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-[var(--card)] border border-[var(--line)] rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                    {cnpjSuggestions.map((sug, i) => (
                      <div key={i} onClick={() => handleSelectCnpjSuggestion(sug)}
                        className="px-4 py-3 text-xs hover:bg-[var(--lime)]/10 cursor-pointer border-b border-[var(--line)] last:border-0 transition-colors">
                        <div className="font-semibold text-white">{sug.razao_social}</div>
                        {sug.cidade && <div className="text-[var(--gray)] mt-0.5">{sug.cidade} · {sug.estado}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelClass}>Razão Social *</label>
                  <input className={inputClass} value={razaoSocial} onChange={e => setRazaoSocial(e.target.value)} placeholder="Nome completo da empresa..." required />
                </div>
                <div>
                  <label className={labelClass}>CNPJ *</label>
                  <input className={inputClass} value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" required />
                </div>
                <div>
                  <label className={labelClass}>Segmento</label>
                  <div className="relative">
                    <select className={selectClass} style={{ padding: '10px 12px' }} value={segmento} onChange={e => setSegmento(e.target.value)}>
                      <option value="Papel Cartão">Papel Cartão</option>
                      <option value="Micro-ondulado">Micro-ondulado</option>
                      <option value="Embalagens Especiais">Embalagens Especiais</option>
                      <option value="Calçados">Calçados</option>
                      <option value="Alimentício">Alimentício</option>
                    </select>
                    <ChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--gray2)] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Cidade *</label>
                  <input className={inputClass} value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Cidade..." required />
                </div>
                <div>
                  <label className={labelClass}>Estado *</label>
                  <input className={inputClass} value={estado} onChange={e => setEstado(e.target.value)} placeholder="RS" maxLength={2} required />
                </div>
                <div>
                  <label className={labelClass}>Curva de Potencial</label>
                  <div className="flex gap-2">
                    {(['A','B','C'] as PotencialClassificacao[]).map(c => {
                      const cc = curvaConfig[c];
                      return (
                        <button type="button" key={c} onClick={() => setClassificacao(c)}
                          className="flex-1 py-2.5 rounded-xl border text-xs font-bold font-mono uppercase transition-all cursor-pointer"
                          style={{ color: classificacao === c ? cc.color : 'var(--gray)', borderColor: classificacao === c ? cc.color : 'var(--line)', background: classificacao === c ? cc.bg : 'transparent' }}>
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Representante</label>
                  <div className="relative">
                    <select className={selectClass} style={{ padding: '10px 12px' }} value={representanteId} onChange={e => setRepresentanteId(e.target.value)}>
                      <option value="">Sem representante</option>
                      {representantes.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
                    </select>
                    <ChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--gray2)] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Volume Mensal (ton)</label>
                  <input className={inputClass} type="number" value={volumeMensal} onChange={e => setVolumeMensal(e.target.value)} placeholder="0" />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Principais Produtos (separados por vírgula)</label>
                  <input className={inputClass} value={principaisProdutos} onChange={e => setPrincipaisProdutos(e.target.value)} placeholder="Caixas de sapato, displays, maletas..." />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Potencial de Crescimento</label>
                  <input className={inputClass} value={potencialCrescimento} onChange={e => setPotencialCrescimento(e.target.value)} placeholder="Descreva o potencial comercial..." />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={fecharCadastro} className="btn btn-secondary flex-1 cursor-pointer">Cancelar</button>
                <button type="submit" className="btn btn-primary flex-1 cursor-pointer">Cadastrar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Prospeccao Modal ── */}
      <ProspeccaoModal
        isOpen={showProspeccao}
        onClose={() => setShowProspeccao(false)}
        usuarioLogado={usuarioLogado}
        usuariosDisponiveis={usuariosDisponiveis}
        onLeadsImported={() => carregarDados()}
      />
    </div>
  );
};
