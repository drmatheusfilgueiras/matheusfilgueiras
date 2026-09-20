import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Send, X } from 'lucide-react';
import { fetchChatFlowConfig, loadChatFlowConfig, mergeChatFlowConfig, saveChatFlowConfig } from '@/lib/chatFlowConfig';

const WHATSAPP_URL = 'https://api.whatsapp.com/send?phone=5521975027590&text=Ol%C3%A1,%20gostaria%20de%20agendar%20uma%20consulta%20com%20o%20Dr.%20Matheus%20Filgueiras';
const CHAT_CONVERSATION_STORAGE_KEY = 'matheus_chat_conversation_id';
const CHAT_VISITOR_STORAGE_KEY = 'matheus_chat_visitor_id';

function getStoredVisitorId() {
  const existing = window.localStorage.getItem(CHAT_VISITOR_STORAGE_KEY);
  if (existing) return existing;

  const generated = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(CHAT_VISITOR_STORAGE_KEY, generated);
  return generated;
}

function metadata() {
  return {
    visitorId: getStoredVisitorId(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    language: navigator.language || '',
    path: window.location.pathname,
    href: window.location.href,
  };
}

async function recordChatMessage({ conversationId, action, text, patientName }) {
  try {
    const response = await fetch('/api/chat-conversations.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        ...metadata(),
        conversationId,
        action,
        text,
        patientName,
      }),
    });

    const payload = await response.json();
    return payload?.ok ? payload : null;
  } catch {
    return null;
  }
}

async function requestAiReply({ message, patientName, conversationContext, config, messages }) {
  if (!config.ai?.enabled || !patientName) return null;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8500);
  try {
    const response = await fetch('/api/chat-ai.php', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        message,
        patientName,
        context: conversationContext,
        messages,
        ai: config.ai,
      }),
    });
    const payload = await response.json();
    return payload?.ok && payload.reply ? payload.reply : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

function fillTemplate(template, values) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value ?? ''), template);
}

function normalizeMessage(message) {
  return message
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasAny(text, terms = []) {
  return terms.some((term) => text.includes(normalizeMessage(term)));
}

function appointmentInfo(day) {
  if (day === 'sexta') {
    return {
      dayLabel: 'Na sexta',
      clinic: 'Naturale Dental Studio',
      schedule: '9h às 12h e 13h30 às 19h',
    };
  }

  if (day === 'sábado') {
    return {
      dayLabel: 'No sábado',
      clinic: 'Salud Odontologia',
      schedule: '9h às 13h',
    };
  }

  return {
    dayLabel: 'Na quinta',
    clinic: 'Salud Odontologia',
    schedule: '9h às 12h e 14h às 19h',
  };
}

function extractFirstName(message, config) {
  const cleaned = message
    .replace(/^(meu nome é|meu nome e|sou|eu sou|me chamo|chamo|pode me chamar de)\s+/i, '')
    .trim();
  const [firstName = ''] = cleaned.split(/\s+/);
  const blocked = config.firstNameBlockedWords || [];

  if (!firstName || firstName.length < 2 || blocked.includes(firstName.toLowerCase())) return '';

  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
}

function parseConversationInput(message, config) {
  const text = normalizeMessage(message);
  const hasNegativePain = hasAny(text, config.entities.negativePain);
  const hasPain = !hasNegativePain && hasAny(text, config.entities.pain);

  return {
    text,
    intent: {
      appointment: hasAny(text, config.intents.appointment),
      price: hasAny(text, config.intents.price),
      sedation: hasAny(text, config.intents.sedation),
      fear: hasAny(text, config.intents.fear),
      reschedule: hasAny(text, config.intents.reschedule),
      cancel: hasAny(text, config.intents.cancel),
      location: hasAny(text, config.intents.location),
    },
    entities: {
      reason: hasAny(text, config.entities.brokenTooth)
        ? 'dente_quebrado'
        : hasPain
          ? 'dor'
          : hasAny(text, config.entities.routine)
            ? 'avaliacao'
            : null,
      preferredDay: hasAny(text, config.entities.thursday)
        ? 'quinta'
        : hasAny(text, config.entities.friday)
          ? 'sexta'
          : hasAny(text, config.entities.saturday)
            ? 'sábado'
            : null,
      preferredPeriod: hasAny(text, config.entities.morning) ? 'manhã' : hasAny(text, config.entities.afternoon) ? 'tarde' : null,
      pain: hasNegativePain ? false : hasPain ? true : null,
      swelling: hasAny(text, config.entities.swelling) ? true : null,
      critical: hasAny(text, config.entities.critical),
      yes: config.entities.yes.map(normalizeMessage).includes(text),
      no: config.entities.no.map(normalizeMessage).includes(text),
    },
  };
}

function mergeConversationContext(context, parsed) {
  return {
    ...context,
    reason: parsed.entities.reason || context.reason,
    preferredDay: parsed.entities.preferredDay || context.preferredDay,
    preferredPeriod: parsed.entities.preferredPeriod || context.preferredPeriod,
    pain: parsed.entities.pain ?? context.pain,
    swelling: parsed.entities.swelling ?? context.swelling,
    urgent: context.urgent || parsed.entities.critical || parsed.entities.swelling === true || parsed.entities.pain === true,
    lastIntent: Object.entries(parsed.intent).find(([, active]) => active)?.[0] || context.lastIntent,
  };
}

function buildAssistantReply(message, patientName, context, config) {
  const parsed = parseConversationInput(message, config);
  if (context.stage === 'awaiting_pain' && parsed.entities.no) parsed.entities.pain = false;
  if (context.stage === 'awaiting_pain' && parsed.entities.yes) parsed.entities.pain = true;
  if (context.stage === 'awaiting_swelling' && parsed.entities.no) parsed.entities.swelling = false;
  if (context.stage === 'awaiting_swelling' && parsed.entities.yes) parsed.entities.swelling = true;

  const nextContext = mergeConversationContext(context, parsed);
  const namePrefix = patientName ? `${patientName}, ` : '';
  const info = appointmentInfo(nextContext.preferredDay);
  const values = {
    name: patientName,
    namePrefix,
    priorityPrefix: nextContext.urgent ? 'Vamos tentar organizar isso com prioridade.' : 'Perfeito.',
    dayLabel: info.dayLabel,
    clinic: info.clinic,
    schedule: info.schedule,
    period: nextContext.preferredPeriod,
  };
  const respond = (stage, key, extraContext = {}) => ({
    context: { ...nextContext, ...extraContext, stage },
    reply: fillTemplate(config.responses[key], values),
  });

  if (parsed.entities.critical) return respond('urgent_handoff', 'critical');
  if (parsed.intent.cancel) return respond('cancelled', 'cancel');
  if (parsed.intent.reschedule) return respond('awaiting_day', 'reschedule');
  if (parsed.intent.price) return respond('pricing', 'price');
  if (parsed.intent.sedation) return respond('sedation', 'sedation');
  if (parsed.intent.fear) return respond('support', 'fear');
  if (parsed.intent.location) return respond('location', 'location');
  if (nextContext.reason === 'dente_quebrado' && nextContext.pain === null) return respond('awaiting_pain', 'brokenToothPain');
  if (nextContext.reason === 'dor' && nextContext.swelling === null) return respond('awaiting_swelling', 'painSwelling');
  if (parsed.intent.appointment && !nextContext.reason) return respond('awaiting_reason', 'appointmentReason');
  if ((parsed.intent.appointment || nextContext.reason) && !nextContext.preferredDay) return respond('awaiting_day', 'askDay');
  if ((parsed.intent.appointment || nextContext.preferredDay) && !nextContext.preferredPeriod) return respond('awaiting_period', 'askPeriod');
  if (nextContext.preferredDay && nextContext.preferredPeriod) return respond('ready_for_whatsapp', 'readyForWhatsapp');

  return respond('unknown', 'fallback');
}

function getTypingDelay(reply, config) {
  const typing = config.typing;
  return Math.min(typing.maxDelay, Math.max(typing.minDelay, reply.length * typing.msPerCharacter));
}

export default function QuickAssistant() {
  const [config, setConfig] = useState(() => loadChatFlowConfig());
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: 'assistant', text: config.initialMessage }]);
  const [draft, setDraft] = useState('');
  const [patientName, setPatientName] = useState('');
  const [conversationId, setConversationId] = useState(() => window.localStorage.getItem(CHAT_CONVERSATION_STORAGE_KEY) || '');
  const [conversationContext, setConversationContext] = useState({
    stage: 'awaiting_name',
    reason: null,
    preferredDay: null,
    preferredPeriod: null,
    pain: null,
    swelling: null,
    urgent: false,
    lastIntent: null,
  });
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let ignore = false;

    fetchChatFlowConfig()
      .then((remoteConfig) => {
        if (ignore || !remoteConfig) return;
        const nextConfig = mergeChatFlowConfig(remoteConfig);
        setConfig(nextConfig);
        saveChatFlowConfig(nextConfig);
        setMessages((current) => (current.length === 1 && current[0]?.text === config.initialMessage
          ? [{ from: 'assistant', text: nextConfig.initialMessage }]
          : current));
      })
      .catch(() => {
        // Keep local/default config if the server config is unavailable.
      });

    return () => {
      ignore = true;
    };
  }, [config.initialMessage]);

  useEffect(() => {
    if (!conversationId) return undefined;

    const poll = async () => {
      try {
        const visitorId = getStoredVisitorId();
        const response = await fetch(`/api/chat-conversations.php?conversationId=${encodeURIComponent(conversationId)}&visitorId=${encodeURIComponent(visitorId)}`, {
          headers: { Accept: 'application/json' },
        });
        if (response.status === 403 || response.status === 404) {
          window.localStorage.removeItem(CHAT_CONVERSATION_STORAGE_KEY);
          setConversationId('');
          return;
        }

        const payload = await response.json();
        if (!payload?.ok) return;
        const serverMessages = payload?.conversation?.messages || [];
        const operatorMessages = serverMessages.filter((message) => message.sender === 'operator');

        if (!operatorMessages.length) return;

        setMessages((current) => {
          const knownIds = new Set(current.map((message) => message.serverId).filter(Boolean));
          const additions = operatorMessages
            .filter((message) => !knownIds.has(message.id))
            .map((message) => ({
              from: 'assistant',
              text: message.text,
              serverId: message.id,
            }));

          return additions.length ? [...current, ...additions] : current;
        });
      } catch {
        // Silent polling failure; the chat remains usable without live handoff.
      }
    };

    poll();
    const interval = window.setInterval(poll, 6000);
    return () => window.clearInterval(interval);
  }, [conversationId]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;
    const nextName = patientName || extractFirstName(trimmed, config);
    const ruleResponse = patientName
      ? buildAssistantReply(trimmed, patientName, conversationContext, config)
      : nextName
        ? {
          context: { ...conversationContext, stage: 'awaiting_reason' },
          reply: fillTemplate(config.responses.afterName, { name: nextName }),
        }
        : {
          context: conversationContext,
          reply: config.responses.askNameAgain,
        };
    const nextContext = ruleResponse.context;

    setMessages((current) => [...current, { from: 'user', text: trimmed }]);
    if (!patientName && nextName) setPatientName(nextName);
    setConversationContext(nextContext);
    setDraft('');
    setIsOpen(true);
    setIsTyping(true);
    const currentPatientName = nextName || patientName;
    const historyForAi = messages;
    const userLog = recordChatMessage({
      conversationId,
      action: 'visitor_message',
      text: trimmed,
      patientName: currentPatientName,
    }).then((payload) => {
      if (payload?.conversationId && payload.conversationId !== conversationId) {
        window.localStorage.setItem(CHAT_CONVERSATION_STORAGE_KEY, payload.conversationId);
        setConversationId(payload.conversationId);
      }

      return payload?.conversationId || conversationId;
    });
    const aiReplyPromise = requestAiReply({
      message: trimmed,
      patientName: currentPatientName,
      conversationContext: nextContext,
      config,
      messages: historyForAi,
    });

    window.setTimeout(() => {
      aiReplyPromise.then((aiReply) => {
        const finalReply = aiReply || ruleResponse.reply;
        setMessages((current) => [...current, { from: 'assistant', text: finalReply }]);
        setIsTyping(false);
        userLog.then((loggedConversationId) => {
          if (!loggedConversationId) return;
          recordChatMessage({
            conversationId: loggedConversationId,
            action: 'bot_message',
            text: finalReply,
            patientName: currentPatientName,
          });
        });
      });
    }, getTypingDelay(ruleResponse.reply, config));
  };

  return (
    <div className="fixed bottom-5 right-5 z-[70] flex max-w-[calc(100vw-2.5rem)] flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="w-[22rem] max-w-full overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_28px_90px_rgba(0,0,0,0.18)]"
          >
            <div className="flex items-center gap-3 border-b border-[#e8e8ed] bg-[#f5f5f7] p-4">
              <img src="/assets/photos/retrato-editorial.jpg" alt="Matheus Filgueiras" className="h-11 w-11 rounded-full object-cover object-[50%_18%]" loading="lazy" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold tracking-[-0.02em] text-[#1d1d1f]">Converse comigo</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#6e6e73] transition-colors hover:bg-white hover:text-[#1d1d1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/35"
                aria-label="Fechar conversa"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="max-h-[22rem] space-y-3 overflow-y-auto bg-white p-4">
              {messages.map((message, index) => (
                <div key={`${message.from}-${index}`} className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <p className={`max-w-[82%] rounded-[20px] px-4 py-3 text-sm leading-relaxed tracking-[-0.01em] ${
                    message.from === 'user' ? 'bg-[#0066cc] text-white' : 'bg-[#f5f5f7] text-[#1d1d1f]'
                  }`}
                  >
                    {message.text}
                  </p>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start" aria-live="polite" aria-label="Matheus está digitando">
                  <div className="flex items-center gap-1 rounded-[20px] bg-[#f5f5f7] px-4 py-3">
                    {[0, 1, 2].map((dot) => (
                      <motion.span
                        key={dot}
                        className="h-1.5 w-1.5 rounded-full bg-[#6e6e73]"
                        animate={{ opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.16 }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-[#e8e8ed] p-4">
              <form
                className="flex items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  sendMessage(draft);
                }}
              >
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Escreva uma mensagem"
                  disabled={isTyping}
                  className="min-h-[44px] flex-1 rounded-full border border-[#d2d2d7] px-4 text-sm outline-none transition-colors focus:border-[#0066cc] disabled:bg-slate-50"
                />
                <button
                  type="submit"
                  disabled={isTyping}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0066cc] text-white transition-transform hover:-translate-y-px disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/35 focus-visible:ring-offset-2"
                  aria-label="Enviar mensagem"
                >
                  <Send className="h-4 w-4" strokeWidth={2} />
                </button>
              </form>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer noopener" className="mt-3 inline-flex text-xs font-semibold text-[#0066cc] hover:text-[#1d1d1f]">
                Continuar pelo WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex h-14 items-center gap-3 rounded-full bg-[#1d1d1f] px-5 font-semibold text-white shadow-[0_18px_50px_rgba(0,0,0,0.24)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]/35 focus-visible:ring-offset-4"
          aria-label="Abrir conversa"
        >
          <MessageCircle className="h-5 w-5" strokeWidth={2} />
          <span className="hidden sm:inline">Converse comigo</span>
        </button>
      )}
    </div>
  );
}
