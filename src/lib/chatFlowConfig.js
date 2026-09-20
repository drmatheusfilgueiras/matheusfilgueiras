export const CHAT_FLOW_STORAGE_KEY = 'matheus_chat_flow_config';
export const CHAT_CONTROL_KEY_STORAGE = 'matheus_chat_control_key';
export const CHAT_CONTROL_ACCESS_KEY = 'Iron98.maxed';

export const defaultChatFlowConfig = {
  initialMessage: 'Olá, tudo bem? Me diga seu nome para começarmos a nossa conversa.',
  quickReplies: ['Quero marcar uma consulta', 'Quebrei um dente', 'Estou com dor', 'Quanto custa?', 'Sedação consciente', 'Preciso remarcar'],
  typing: {
    minDelay: 1400,
    maxDelay: 3600,
    msPerCharacter: 28,
  },
  ai: {
    enabled: false,
    model: 'gpt-5.6-luna',
    temperature: 0.35,
    maxOutputTokens: 420,
    fallbackToRules: true,
    systemPrompt: [
      'Você responde como Dr. Matheus Filgueiras em conversas iniciais de atendimento odontológico.',
      'Tom: profissional, próximo, tranquilo, natural, objetivo e acolhedor sem parecer comercial.',
      'Use frases curtas ou médias, como em WhatsApp. Pode usar "pra" quando soar natural.',
      'Não use tom de central de atendimento. Não use frases como "será um prazer auxiliá-lo" ou "prezado paciente".',
      'Objetivo: entender a necessidade, identificar urgência, organizar disponibilidade e conduzir para agendamento pelo WhatsApp quando fizer sentido.',
      'Não dê diagnóstico fechado por mensagem. Não prescreva medicamentos. Não invente valores, horários ou disponibilidade.',
      'Se houver dificuldade para respirar/engolir, edema facial importante/progressivo, sangramento persistente ou sinais sistêmicos relevantes, oriente atendimento de urgência apropriado.',
      'Matheus atende em Nova Friburgo/RJ, na Salud Odontologia e na Naturale Dental Studio. Dias habituais: quintas e sábados.',
      'Quando faltar informação, faça só a próxima pergunta necessária. Não repita pergunta já respondida.',
    ].join('\n'),
  },
  firstNameBlockedWords: ['quero', 'queria', 'preciso', 'estou', 'tenho', 'dor', 'consulta', 'marcar', 'agendar', 'oi', 'olá', 'ola'],
  intents: {
    appointment: ['marcar', 'agendar', 'consulta', 'horario', 'vaga', 'encaixe', 'atender', 'disponibilidade'],
    price: ['valor', 'preco', 'quanto custa', 'custa quanto', 'quanto e'],
    sedation: ['sedacao', 'sedar', 'sedativo'],
    fear: ['medo', 'ansiedade', 'ansioso', 'nervoso', 'pavor'],
    reschedule: ['remarcar', 'mudar horario', 'trocar horario', 'reagendar'],
    cancel: ['cancelar', 'desmarcar'],
    location: ['endereco', 'onde fica', 'localizacao', 'clinica'],
  },
  entities: {
    brokenTooth: ['quebrei', 'quebrado', 'fraturou', 'fratura', 'trincou'],
    routine: ['limpeza', 'avaliacao', 'rotina', 'clareamento', 'restauracao'],
    pain: ['dor', 'doendo', 'doi', 'dolorido', 'sensibilidade', 'sensivel'],
    negativePain: ['nao doi', 'nao esta doendo', 'nao estou com dor', 'sem dor', 'nao sinto dor'],
    swelling: ['inchaco', 'inchado', 'rosto inchando', 'edema'],
    critical: ['respirar', 'engolir', 'sangramento nao para', 'rosto inchando muito', 'muita febre'],
    thursday: ['quinta'],
    saturday: ['sabado', 'sábado'],
    morning: ['manha', 'manhã'],
    afternoon: ['tarde'],
    yes: ['sim', 'isso', 'pode ser', 'quero', 'claro'],
    no: ['nao', 'não'],
  },
  responses: {
    askNameAgain: 'Claro. Antes de continuarmos, me diga seu nome para eu te chamar certinho.',
    afterName: 'Prazer, {name}. Me conta: você está querendo marcar uma avaliação ou tem alguma coisa específica que está te incomodando?',
    critical: 'Nesse caso é melhor procurar um atendimento de urgência agora, principalmente se tiver dificuldade para respirar ou engolir. Depois disso, posso te ajudar a organizar a avaliação odontológica.',
    cancel: 'Tranquilo, sem problema. Quando quiser remarcar, pode me chamar.',
    reschedule: 'Sem problema. Vamos ver outro horário. Pra você continua sendo melhor quinta ou sábado?',
    price: 'Você diz o valor da consulta ou de algum tratamento específico? Tratamento depende um pouco do que eu encontrar na avaliação.',
    sedation: 'Existe essa possibilidade em alguns casos, principalmente quando há ansiedade ou procedimentos mais longos. A indicação depende da avaliação.',
    fear: '{namePrefix}pode me falar isso tranquilamente. Na primeira consulta eu consigo avaliar tudo com calma e a gente conversa antes de começar qualquer procedimento.',
    location: 'Atendo em Nova Friburgo/RJ, na Salud Odontologia e na Naturale Dental Studio. Se quiser, vejo com você o melhor caminho para agendar.',
    brokenToothPain: 'Claro. Esse dente quebrou recentemente? Está sentindo alguma dor ou sensibilidade?',
    painSwelling: '{namePrefix}vamos tentar ver isso logo. Teve algum inchaço também?',
    appointmentReason: 'Claro. Você está querendo marcar uma avaliação ou tem alguma coisa específica que está te incomodando?',
    askDay: '{priorityPrefix} Pra você fica melhor quinta ou sábado?',
    askPeriod: 'Certo. {dayLabel} você prefere de manhã ou à tarde?',
    readyForWhatsapp: 'Fechado. {dayLabel} de {period} parece um bom caminho. Para confirmar horário certinho, é melhor continuar pelo WhatsApp.',
    fallback: '{namePrefix}me conta um pouco melhor o que você precisa, que eu te ajudo a organizar o próximo passo.',
  },
  flow: {
    nodes: [
      { id: 'start', type: 'start', title: 'Início', subtitle: 'Mensagem inicial', responseKey: 'initialMessage', x: 80, y: 180 },
      { id: 'afterName', type: 'message', title: 'Após informar nome', subtitle: 'Primeira triagem', responseKey: 'afterName', x: 520, y: 180 },
      { id: 'appointmentReason', type: 'question', title: 'Motivo da consulta', subtitle: 'Avaliação ou incômodo', responseKey: 'appointmentReason', x: 980, y: 120 },
      { id: 'brokenToothPain', type: 'question', title: 'Dente quebrado', subtitle: 'Perguntar dor/sensibilidade', responseKey: 'brokenToothPain', x: 1480, y: 40 },
      { id: 'painSwelling', type: 'question', title: 'Dor', subtitle: 'Verificar inchaço', responseKey: 'painSwelling', x: 1480, y: 330 },
      { id: 'askDay', type: 'question', title: 'Escolher dia', subtitle: 'Quinta ou sábado', responseKey: 'askDay', x: 1980, y: 180 },
      { id: 'askPeriod', type: 'question', title: 'Escolher período', subtitle: 'Manhã ou tarde', responseKey: 'askPeriod', x: 2460, y: 180 },
      { id: 'readyForWhatsapp', type: 'handoff', title: 'Confirmar no WhatsApp', subtitle: 'Transferência', responseKey: 'readyForWhatsapp', x: 2940, y: 180 },
      { id: 'price', type: 'message', title: 'Preço', subtitle: 'Resposta sobre valores', responseKey: 'price', x: 980, y: 560 },
      { id: 'sedation', type: 'message', title: 'Sedação', subtitle: 'Explicação breve', responseKey: 'sedation', x: 1480, y: 640 },
      { id: 'fear', type: 'message', title: 'Medo/ansiedade', subtitle: 'Acolhimento', responseKey: 'fear', x: 1480, y: 910 },
      { id: 'critical', type: 'alert', title: 'Sinais críticos', subtitle: 'Urgência', responseKey: 'critical', x: 1980, y: 640 },
    ],
    edges: [
      { id: 'e-start-afterName', from: 'start', to: 'afterName', label: 'nome informado' },
      { id: 'e-afterName-appointmentReason', from: 'afterName', to: 'appointmentReason', label: 'quer agendar' },
      { id: 'e-appointment-broken', from: 'appointmentReason', to: 'brokenToothPain', label: 'dente quebrado' },
      { id: 'e-appointment-pain', from: 'appointmentReason', to: 'painSwelling', label: 'dor' },
      { id: 'e-broken-day', from: 'brokenToothPain', to: 'askDay', label: 'dor avaliada' },
      { id: 'e-pain-day', from: 'painSwelling', to: 'askDay', label: 'inchaço avaliado' },
      { id: 'e-day-period', from: 'askDay', to: 'askPeriod', label: 'dia escolhido' },
      { id: 'e-period-whatsapp', from: 'askPeriod', to: 'readyForWhatsapp', label: 'período escolhido' },
      { id: 'e-afterName-price', from: 'afterName', to: 'price', label: 'preço' },
      { id: 'e-afterName-sedation', from: 'afterName', to: 'sedation', label: 'sedação' },
      { id: 'e-afterName-fear', from: 'afterName', to: 'fear', label: 'medo' },
      { id: 'e-appointment-critical', from: 'appointmentReason', to: 'critical', label: 'alerta' },
    ],
  },
};

export function cloneChatFlowConfig(config = defaultChatFlowConfig) {
  return JSON.parse(JSON.stringify(config));
}

export function mergeChatFlowConfig(config = {}) {
  const defaults = cloneChatFlowConfig();

  return {
    ...defaults,
    ...config,
    typing: {
      ...defaults.typing,
      ...(config.typing || {}),
    },
    ai: {
      ...defaults.ai,
      ...(config.ai || {}),
    },
    intents: {
      ...defaults.intents,
      ...(config.intents || {}),
    },
    entities: {
      ...defaults.entities,
      ...(config.entities || {}),
    },
    responses: {
      ...defaults.responses,
      ...(config.responses || {}),
    },
    flow: {
      ...defaults.flow,
      ...(config.flow || {}),
      nodes: config.flow?.nodes || defaults.flow.nodes,
      edges: config.flow?.edges || defaults.flow.edges,
    },
  };
}

export function loadChatFlowConfig() {
  if (typeof window === 'undefined') {
    return cloneChatFlowConfig();
  }

  try {
    const stored = window.localStorage.getItem(CHAT_FLOW_STORAGE_KEY);
    if (!stored) {
      return cloneChatFlowConfig();
    }

    return mergeChatFlowConfig(JSON.parse(stored));
  } catch {
    return cloneChatFlowConfig();
  }
}

export function saveChatFlowConfig(config) {
  window.localStorage.setItem(CHAT_FLOW_STORAGE_KEY, JSON.stringify(config));
}

export async function fetchChatFlowConfig() {
  const response = await fetch('/api/chat-flow-config.php', {
    headers: { Accept: 'application/json' },
  });
  const payload = await response.json();
  return payload?.ok && payload.config ? payload.config : null;
}

export async function saveChatFlowConfigRemote(config, accessKey) {
  const response = await fetch('/api/chat-flow-config.php', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Chat-Control-Key': accessKey,
    },
    body: JSON.stringify({ config }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || 'Nao foi possivel salvar a configuracao.');
  }

  return payload;
}
