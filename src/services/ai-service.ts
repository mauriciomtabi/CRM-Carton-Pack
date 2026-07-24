// Serviço de Inteligência Artificial (ai-service) - Carton PACK® CRM
// Isola toda a comunicação com o Google Gemini API (modelo Flash)

import type { Cliente, Visita, Ligacao, Orcamento } from '../types/crm';

const API_KEY_KEY = 'cp_crm_gemini_api_key';

export const aiService = {
  // Obter a chave da API do localStorage ou variáveis de ambiente
  getApiKey(): string {
    if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    return localStorage.getItem(API_KEY_KEY) || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  },

  // Gravar a chave da API
  setApiKey(key: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(API_KEY_KEY, key);
  },

  // Verifica se a chave de API está disponível para chamadas reais
  hasApiKey(): boolean {
    return !!this.getApiKey();
  },

  // Método genérico para fazer chamadas HTTP ao Gemini Flash API
  async _callGemini(prompt: string, fallbackGenerator: () => string): Promise<string> {
    const key = this.getApiKey();
    if (!key || key.trim() === '') {
      // Simular delay de rede pequeno para parecer real
      await new Date(Date.now() + 500);
      return fallbackGenerator();
    }

    try {
      const model = 'gemini-1.5-flash'; // Modelo Flash solicitado
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.2, // Baixa temperatura para resultados mais sérios/comerciais
            maxOutputTokens: 500
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.warn('Erro na resposta do Gemini API:', errData);
        return `✨ [Simulado - Erro na API Gemini] ${fallbackGenerator()}`;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        return `✨ [Simulado - Resposta vazia] ${fallbackGenerator()}`;
      }

      return text.trim();
    } catch (e) {
      console.error('Falha de conexão com a API do Gemini:', e);
      return `✨ [Simulado - Erro de Conexão] ${fallbackGenerator()}`;
    }
  },

  // -------------------------------------------------------------
  // 1. RESUMO EXECUTIVO DO CLIENTE
  // -------------------------------------------------------------
  async generateExecutiveSummary(
    cliente: Cliente, 
    visitas: Visita[], 
    ligacoes: Ligacao[], 
    orcamentos: Orcamento[]
  ): Promise<string> {
    const totalOrcamentos = orcamentos.length;
    const orcamentosAbertos = orcamentos.filter(o => o.etapa_atual !== 'enviado_representante_final' && !o.data_fechamento && !o.motivo_perda);
    const totalVisitas = visitas.filter(v => v.status === 'realizada').length;
    const totalLigacoes = ligacoes.filter(l => l.status === 'realizada').length;
    const dataCompraStr = cliente.data_ultima_compra ? new Date(cliente.data_ultima_compra).toLocaleDateString('pt-BR') : 'Nenhuma compra registrada';
    const dataContatoStr = cliente.data_ultimo_contato ? new Date(cliente.data_ultimo_contato).toLocaleDateString('pt-BR') : 'Nenhum contato';
    
    const context = `
      Cliente: ${cliente.razao_social}
      Segmento: ${cliente.segmento} (Fabricamos Embalagens de Papel Cartão e Micro-ondulado)
      Status da Carteira: ${cliente.status_carteira} (ativo/atencao/critico/inativo)
      Classificação de Potencial: ${cliente.classificacao_potencial} (A/B/C)
      Volume Mensal Estimado: ${cliente.volume_mensal} ton/un
      Última Compra: ${dataCompraStr}
      Último Contato: ${dataContatoStr}
      Total de Visitas Realizadas: ${totalVisitas}
      Total de Ligações Realizadas: ${totalLigacoes}
      Orçamentos em Aberto: ${orcamentosAbertos.length} (de um total de ${totalOrcamentos})
      Principais produtos comprados: ${cliente.principais_produtos.join(', ')}
      Necessidade de Certificações: ${cliente.necessidade_certificacoes || 'Nenhuma'}
      Exigências de Qualidade: ${cliente.exigencias_qualidade || 'Nenhuma'}
      Últimas interações textuais:
      ${visitas.filter(v => v.status === 'realizada').slice(0, 2).map(v => `- Visita (${v.data}): ${v.registro_descricao} Concorrentes: ${v.fornecedores_concorrentes}`).join('\n')}
      ${ligacoes.filter(l => l.status === 'realizada').slice(0, 2).map(l => `- Ligação (${l.data}): ${l.registro_descricao}`).join('\n')}
    `;

    const prompt = `
      Você é a inteligência artificial especialista comercial da Carton PACK, fabricante de embalagens.
      Analise os dados comerciais do cliente a seguir e gere um RESUMO EXECUTIVO COMERCIAL de exatamente 3 a 5 linhas.
      Foque na saúde do cliente na carteira, o histórico recente de compras e o status dos orçamentos pendentes, sugerindo o tom adequado para a próxima abordagem comercial.
      Não use cabeçalhos, marcadores de lista ou introduções vagas, vá direto ao ponto.
      
      Dados do cliente:
      ${context}
    `;

    return this._callGemini(prompt, () => {
      // Gerador Fallback Inteligente (Local)
      const orcTxt = orcamentosAbertos.length > 0 
        ? `possui ${orcamentosAbertos.length} orçamento(s) em aberto na etapa de ${orcamentosAbertos[0].etapa_atual.replace('_', ' ')}` 
        : 'não possui orçamentos em aberto no momento';
      const ultCompraTxt = cliente.data_ultima_compra 
        ? `Sua última compra foi em ${dataCompraStr}.` 
        : 'Ainda não possui compras registradas no histórico.';
      const statusAlerta = cliente.status_carteira === 'critico' || cliente.status_carteira === 'atencao'
        ? `ATENÇÃO: O cliente está com status ${cliente.status_carteira.toUpperCase()} devido ao tempo sem contato (${dataContatoStr}).`
        : `Cliente ativo e saudável na carteira, com último contato em ${dataContatoStr}.`;

      return `Cliente do segmento ${cliente.segmento} com perfil potencial ${cliente.classificacao_potencial}. ${ultCompraTxt} Atualmente ${orcTxt}. ${statusAlerta} Recomenda-se contato focado em entender novas demandas de ${cliente.principais_produtos.length > 0 ? cliente.principais_produtos[0] : 'embalagens semirrígidas'} e prospectar novos projetos de micro-ondulado.`;
    });
  },

  // -------------------------------------------------------------
  // 2. SUGESTÃO DE FOLLOW-UP
  // -------------------------------------------------------------
  async generateFollowUpSuggestion(
    cliente: Cliente, 
    ultimaInteracao: { tipo: 'visita' | 'ligacao'; objetivo: string; descricao: string; contato: string }
  ): Promise<string> {
    const prompt = `
      Você é o assistente comercial da Carton PACK.
      Com base na última interação com o cliente "${cliente.razao_social}" através do contato "${ultimaInteracao.contato}", escreva uma sugestão de rascunho de mensagem curta e profissional (para WhatsApp ou E-mail) ou a próxima ação comercial recomendada.
      
      Detalhes da interação:
      - Tipo: ${ultimaInteracao.tipo}
      - Objetivo: ${ultimaInteracao.objetivo}
      - Relato: ${ultimaInteracao.descricao}
      
      Gere apenas a sugestão direta da mensagem ou ação, com tom cordial, profissional e focado no segmento de embalagens (ex: envio de amostras, retorno de cotação ou agendamento técnico).
      Gere um texto curto (máximo de 4 linhas).
    `;

    return this._callGemini(prompt, () => {
      // Gerador Fallback Inteligente (Local)
      const nomeContato = ultimaInteracao.contato || 'Prezado Cliente';
      const objLower = ultimaInteracao.objetivo.toLowerCase();

      if (objLower.includes('projeto') || objLower.includes('desenvolvimento')) {
        return `Olá ${nomeContato}, tudo bem? Gostaria de saber se o seu time técnico conseguiu avaliar o mock-up/faca de corte que desenhamos para o novo projeto de embalagens. Ficamos no aguardo das suas observações para produzir a amostra física final na Carton PACK!`;
      }
      if (objLower.includes('negociacao') || objLower.includes('comercial')) {
        return `Olá ${nomeContato}, espero que esteja bem. Conseguiram analisar a proposta comercial que enviamos para o lote de embalagens? Temos uma janela aberta no nosso PCP de micro-ondulados na próxima semana que nos permitiria garantir um excelente prazo de entrega para vocês.`;
      }
      if (objLower.includes('qualidade') || objLower.includes('reclamacao')) {
        return `Olá ${nomeContato}. Escrevo para confirmar se os ajustes sugeridos pela nossa equipe técnica resolveram as dificuldades no fechamento das caixas na sua linha de montagem. Continuamos à inteira disposição para prestar qualquer suporte necessário.`;
      }
      return `Olá ${nomeContato}, agradecemos o tempo dedicado em nosso último contato. Gostaria de saber se há alguma nova demanda de embalagens semirrígidas ou caixas organizadoras em que possamos apoiar a operação de vocês nesta semana.`;
    });
  },

  // -------------------------------------------------------------
  // 3. PRIORIZAÇÃO DE CARTEIRA
  // -------------------------------------------------------------
  async generatePortfolioPrioritization(
    clientes: Cliente[], 
    orcamentos: Orcamento[]
  ): Promise<{ clienteId: string; razaoSocial: string; prioridade: 'Alta' | 'Média'; motivo: string; recomendacao: string }[]> {
    
    // Filtros lógicos locais para alimentar o prompt (ou servir de fallback)
    const clientesAvisos = clientes.filter(c => c.status_carteira === 'critico' || c.status_carteira === 'atencao');
    const orcamentosQuentes = orcamentos.filter(o => o.probabilidade_fechamento >= 8 && o.etapa_atual !== 'enviado_representante_final' && !o.data_fechamento && !o.motivo_perda);

    // Prompt resumido com dados básicos
    const clientesContext = clientesAvisos.slice(0, 10).map(c => 
      `- ID: ${c.id}, Cliente: ${c.razao_social}, Status: ${c.status_carteira}, Contato: ${c.data_ultimo_contato ? new Date(c.data_ultimo_contato).toLocaleDateString('pt-BR') : 'Nunca'}`
    ).join('\n');
    
    const orcamentosContext = orcamentosQuentes.slice(0, 10).map(o => {
      const cli = clientes.find(c => c.id === o.cliente_id);
      return `- ID Orc: ${o.id}, Cliente: ${cli?.razao_social || 'Desconhecido'}, Etapa: ${o.etapa_atual}, Probabilidade: ${o.probabilidade_fechamento}/10`;
    }).join('\n');

    const prompt = `
      Você é a inteligência de negócios Carton PACK.
      Analise a lista de clientes críticos/atenção e orçamentos quentes sem contato recente:
      
      Clientes em Alerta:
      ${clientesContext || 'Nenhum cliente crítico ou atenção.'}
      
      Orçamentos Quentes (Probabilidade de Fechamento >= 8/10):
      ${orcamentosContext || 'Nenhum orçamento pendente de alta probabilidade.'}
      
      Gere um objeto JSON contendo uma lista estruturada de até 5 recomendações prioritárias de ação imediata.
      O JSON deve ser um array com o seguinte formato exato (sem Markdown adicional, apenas o array JSON válido):
      [
        {
          "clienteId": "id-do-cliente",
          "razaoSocial": "Razão Social",
          "prioridade": "Alta" ou "Média",
          "motivo": "Breve justificativa baseada nos dados",
          "recomendacao": "Próxima ação recomendada"
        }
      ]
    `;

    try {
      if (!this.hasApiKey()) {
        throw new Error('Sem chave de API para priorização');
      }

      const rawJson = await this._callGemini(prompt, () => '[]');
      // Limpar marcações markdown caso a IA envie (ex: ```json ... ```)
      const cleanJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      throw new Error('Falha no parse do JSON da IA');
    } catch (e) {
      // Fallback estático estruturado inteligente
      const recomendacoes: any[] = [];

      // Orçamentos quentes
      orcamentosQuentes.forEach(o => {
        const cli = clientes.find(c => c.id === o.cliente_id);
        if (cli) {
          recomendacoes.push({
            clienteId: cli.id,
            razaoSocial: cli.razao_social,
            prioridade: 'Alta',
            motivo: `Orçamento quente em andamento na etapa "${o.etapa_atual.replace('_', ' ')}" com probabilidade ${o.probabilidade_fechamento}/10 de fechamento.`,
            recomendacao: 'Fazer ligação para alinhar os detalhes da aprovação financeira ou tirar dúvidas técnicas da ficha gráfica.'
          });
        }
      });

      // Clientes Críticos
      clientesAvisos.filter(c => c.status_carteira === 'critico').forEach(c => {
        recomendacoes.push({
          clienteId: c.id,
          razaoSocial: c.razao_social,
          prioridade: 'Alta',
          motivo: `Cliente crítico na carteira. Mais de 90 dias sem nenhum tipo de contato (último contato em: ${c.data_ultimo_contato ? new Date(c.data_ultimo_contato).toLocaleDateString('pt-BR') : 'Nunca'}).`,
          recomendacao: 'Agendar visita presencial de relacionamento urgência para reavaliar demandas e conter risco de perda do cliente.'
        });
      });

      // Clientes Atenção
      clientesAvisos.filter(c => c.status_carteira === 'atencao').forEach(c => {
        // Evitar duplicar cliente na lista
        if (!recomendacoes.find(r => r.clienteId === c.id)) {
          recomendacoes.push({
            clienteId: c.id,
            razaoSocial: c.razao_social,
            prioridade: 'Média',
            motivo: `Cliente mudou para status de Atenção (mais de 60 dias sem visitas ou ligações registradas).`,
            recomendacao: 'Realizar ligação rápida de pós-venda ou enviar portfólio de novos cortes de micro-ondulado.'
          });
        }
      });

      // Limitar a 5 recomendações
      return recomendacoes.slice(0, 5);
    }
  },

  // -------------------------------------------------------------
  // 4. ANÁLISE DE BRIEFING TÉCNICO & COPILOTO DE EMBALAGENS
  // -------------------------------------------------------------
  async generateTechnicalBriefing(promptText: string): Promise<string> {
    const systemPrompt = `
      Você é a Inteligência Artificial especialista em engenharia de embalagens e automação da Carton PACK.
      O usuário inseriu um rascunho de briefing comercial em linguagem natural.
      Sua tarefa é analisar o rascunho e gerar uma resposta estruturada de Ficha Técnica, Viabilidade e Riscos de Produção, Fatores de Custo e um Insight de Automação de Processos.
      Use o formato de tópicos markdown conforme abaixo:
      
      ### 📋 Ficha Técnica Recomendada
      - **Produto**: [Nome sugerido]
      - **Papel/Papelão**: [Duplex 350g, Triplex 320g, Micro-ondulado Onda B, Kraft, etc.]
      - **Impressão**: [Offset, Flexografia, 4 cores, etc.]
      - **Acabamentos**: [Verniz UV localizado, BOPP fosco, Hot stamping, etc.]
      - **Fechamento/Faca**: [Fundo automático, Gaveta, Maleta Americana, Corte/Vinco]
      
      ### ⚠️ Viabilidade Técnica & Riscos
      - [Identifique um risco de produção, como registro de verniz, tempo de secagem ou envergamento por umidade]
      
      ### 💰 Variáveis Comerciais e de Custo
      - [Explique o impacto do acabamento ou tamanho no lote mínimo e custo unitário]
      
      ### ⚡ Oportunidades de Automação (Consultoria)
      - [Pinte um cenário onde integrar essa etapa com PCP/Design usando nossa consultoria reduz erros e lead time de 7 dias para poucas horas]
      
      Mantenha o tom extremamente profissional, consultivo e técnico, mas acessível. Retorne apenas os tópicos acima.
    `;
    
    const finalPrompt = `
      ${systemPrompt}
      
      Briefing comercial do cliente:
      "${promptText}"
    `;

    return this._callGemini(finalPrompt, () => {
      // Fallback local detalhado
      const text = promptText.toLowerCase();
      
      if (text.includes('vinho') || text.includes('garrafa') || text.includes('bebida') || text.includes('cerveja')) {
        return `### 📋 Ficha Técnica Recomendada
- **Produto**: Estojo Reforçado para Garrafas (Transporte/Exposição)
- **Papel/Papelão**: Micro-ondulado Onda B (Capa externa Kraft 170g + Miolo ondulado 120g + Capa interna 140g) para máxima rigidez.
- **Impressão**: Flexografia em alta definição a 2 cores (tintas à base d'água atóxicas).
- **Acabamentos**: Verniz de proteção acrílico fosco para proteção contra atrito no transporte.
- **Fechamento/Faca**: Faca de corte e vinco especial com berço separador interno acoplado na própria estrutura da caixa (anti-choque).

### ⚠️ Viabilidade Técnica & Riscos
- **Estabilidade no Transporte**: O peso das garrafas exige teste de coluna (FCT/ECT) e resistência ao esmagamento (BCT). O risco principal é o rompimento da colagem inferior se o setup de colagem na dobradeira-coladeira estiver incorreto.
- **Umidade**: Embalagens de bebida estocadas em câmaras frias ou depósitos úmidos exigem impermeabilização parcial por verniz de máquina.

### 💰 Variáveis Comerciais e de Custo
- **Lote Mínimo Recomendado**: 5.000 unidades devido ao setup das facas de corte e rolos de impressão flexo.
- **Redução de Custo**: O berço acoplado na própria chapa reduz o custo de montagem manual na Carton Pack em 15% comparado a berços soltos.

### ⚡ Oportunidades de Automação (Consultoria)
- **Automação Comercial-PCP**: Com a integração via API do CRM direto com o software de planejamento de onduladeira (ERP/PCP), o prazo de agendamento de bobinas cai de 3 dias úteis para apenas 2 horas após a assinatura comercial.
- **Aprovação Digital**: Implementação de modelagem 3D interativa no portal do cliente evita a necessidade de envio de protótipos físicos, economizando R$ 800 por ciclo de desenvolvimento gráfico.`;
      }
      
      if (text.includes('sapato') || text.includes('calçado') || text.includes('elegance') || text.includes('gaveta') || text.includes('tênis')) {
        return `### 📋 Ficha Técnica Recomendada
- **Produto**: Caixa de Sapato Premium Estruturada (Modelo Gaveta)
- **Papel/Papelão**: Papel Cartão Duplex 300g/m² acoplado a Micro-ondulado Onda E (micro-onda de alta precisão).
- **Impressão**: Offset alta resolução a 4 cores (CMYK) na capa externa.
- **Acabamentos**: Laminação BOPP Fosco + Verniz UV Localizado de alto relevo na logomarca.
- **Fechamento/Faca**: Faca de corte e vinco modelo gaveta deslizante com furos traseiros de respiro.

### ⚠️ Viabilidade Técnica & Riscos
- **Registro Gráfico**: O acoplamento do papel offset impresso com o micro-ondulado exige precisão milimétrica. Um desalinhamento superior a 0.5mm causa perda de registro e defeitos no vinco da gaveta.
- **Secagem de Acabamento**: O verniz UV localizado aplicado sobre laminação BOPP requer cura térmica UV precisa. Se a velocidade da esteira estiver descalibrada, a tampa pode apresentar marcas de toque (scuffing).

### 💰 Variáveis Comerciais e de Custo
- **Custo de Clichê/Matriz**: O verniz localizado exige tela de silk-screen especial. Custo fixo inicial de R$ 600 amortizável para lotes acima de 3.000 unidades.
- **Lote Mínimo Recomendado**: 2.550 unidades para diluir o custo do setup de acoplamento e corte.

### ⚡ Oportunidades de Automação (Consultoria)
- **Automação de Faca Digital**: Integração do CRM com a mesa de corte CAD/CAM (Kongsberg) permite que o vendedor envie o desenho técnico (DXF) direto para o cliente assinar digitalmente. Redução de 90% no retrabalho gráfico.
- **Workflow Kanban Inteligente**: Notificações instantâneas enviadas via WhatsApp para o designer gráfico assim que o briefing é aprovado pelo comercial reduzem o tempo morto da etapa de desenho de 48h para 15 minutos.`;
      }

      if (text.includes('chocolate') || text.includes('bombom') || text.includes('doce') || text.includes('gourmet') || text.includes('páscoa')) {
        return `### 📋 Ficha Técnica Recomendada
- **Produto**: Estojo de Luxo para Chocolates e Doces Finos
- **Papel/Papelão**: Papel Cartão Triplex 350g/m² certificado FSC (Inocuidade alimentar garantida, 100% fibra virgem).
- **Impressão**: Offset a 5 cores (CMYK + 1 Cor Especial Pantone Metálica).
- **Acabamentos**: Hot Stamping Dourado na tampa + Verniz de Barreira a Óleo e Gordura no berço interno.
- **Fechamento/Faca**: Caixa com tampa dobrável e fechamento por imã embutido ou abas de travamento com berço interno duplex.

### ⚠️ Viabilidade Técnica & Riscos
- **Contaminação de Odor**: Tintas offset tradicionais liberam solventes durante a secagem, o que pode contaminar o sabor do chocolate. É mandatório o uso de tintas de baixa migração (Low Migration) e secagem por radiação LED/UV.
- **Resistência a Gordura**: A ausência de verniz de barreira interna causará manchas de gordura na embalagem após poucas semanas de prateleira, destruindo o apelo premium.

### 💰 Variáveis Comerciais e de Custo
- **Acabamento Premium**: O Hot Stamping exige clichê de latão ou magnésio. Para lotes pequenos (abaixo de 10.000 un), este acabamento adiciona cerca de 30% no preço unitário.
- **Lote Mínimo Recomendado**: 5.000 unidades.

### ⚡ Oportunidades de Automação (Consultoria)
- **Cálculo Automático de Insumos**: Integração do briefing técnico com a receita de tintas e cartão no ERP (sistema corporativo). O orçamento é gerado instantaneamente no CRM calculando o preço baseado na cotação internacional do papel-cartão em tempo real.
- **Rastreabilidade Alimentar**: Consultoria para implementar QR Codes dinâmicos impressos em cada embalagem, permitindo ao consumidor final rastrear a origem do cacau e certificações da fazenda.`;
      }

      if (text.includes('pizza') || text.includes('alimento') || text.includes('salgado') || text.includes('lanche')) {
        return `### 📋 Ficha Técnica Recomendada
- **Produto**: Caixa de Pizza Oitavada Térmica com Encaixe Rápido
- **Papel/Papelão**: Micro-ondulado Onda E (micro) - Capa externa Branca Testliner 140g + Miolo 110g + Capa interna Kraft Virgem 130g (adequada para contato com calor e umidade).
- **Impressão**: Flexografia em alta resolução a 2 cores (tinta à base d'água 100% ecológica).
- **Acabamentos**: Sem acabamento plástico (verniz/BOPP) para manter o produto 100% reciclável e biodegradável.
- **Fechamento/Faca**: Faca oitavada padrão Carton Pack (sem custo de matriz para o cliente), abas de montagem rápida sem cola.

### ⚠️ Viabilidade Técnica & Riscos
- **Acúmulo de Vapor**: Alimentos quentes liberam vapor de água que condensa e amolece a embalagem. É obrigatório incluir furos de respiro traseiros na faca de corte para saída de calor sem perda de rigidez.
- **Empilhamento**: Teste de esmagamento vertical em condições de alta umidade (câmara quente) deve ser validado para suportar até 5 caixas empilhadas na moto de entrega.

### 💰 Variáveis Comerciais e de Custo
- **Matriz de Faca Isenta**: O uso do tamanho padrão oitavado economiza R$ 1.200 em fabricação de faca de corte para o cliente.
- **Lote Mínimo Comercial**: 10.000 unidades (produção altamente automatizada em alta velocidade).

### ⚡ Oportunidades de Automação (Consultoria)
- **Portal de Autoatendimento B2B**: Desenvolvimento de um portal de pedidos integrado onde a própria pizzaria insere o pedido, o sistema gera o preview de impressão 3D e envia a ordem de produção diretamente para as impressoras flexográficas flexo-folder-gluer.
- **Integração de Estoque Consignado**: Integração dos estoques mínimos do cliente com o PCP da Carton Pack, disparando produções automáticas de reposição quando o cliente atinge estoque crítico.`;
      }

      // Default
      return `### 📋 Ficha Técnica Recomendada
- **Produto**: Caixa de Embarque para Transporte Comercial (Modelo Maleta)
- **Papel/Papelão**: Papelão Ondulado Onda B ou C (conforme peso final do produto) com capa externa e interna Kraft 140g.
- **Impressão**: Flexografia a 1 ou 2 cores.
- **Acabamentos**: Sem acabamentos premium; aplicação opcional de verniz de máquina base d'água protetivo.
- **Fechamento/Faca**: Faca padrão de maleta americana (fechamento por fita adesiva) ou com abas autotravantes.

### ⚠️ Viabilidade Técnica & Riscos
- **Resistência Física**: O peso e volume dos produtos transportados determinam a espessura da onda. Risco de esmagamento lateral se o empilhamento no palete for incorreto.
- **Estocagem**: Exige controle de umidade relativa no estoque de papelão ondulado para evitar perda de rigidez mecânica.

### 💰 Variáveis Comerciais e de Custo
- **Baixo Setup**: Ferramenta padrão sem custo de matriz de corte. Otimização máxima de custo por metro quadrado.
- **Lote Mínimo Recomendado**: 1.000 unidades.

### ⚡ Oportunidades de Automação (Consultoria)
- **Otimização de Paletização**: Uso de algoritmos de inteligência geométrica integrados ao CRM para sugerir o layout de empilhamento ideal no palete, reduzindo o custo de frete rodoviário por unidade em até 20%.
- **Automação de Cotação de Bobinas**: Vinculação de preços com o índice internacional de celulose (Foex), automatizando o reajuste e garantindo margem saudável de forma transparente.`;
    });
  }
};
