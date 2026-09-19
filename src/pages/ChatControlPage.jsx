import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Download, KeyRound, MessageSquare, RefreshCw, RotateCcw, Save, Send, Upload } from 'lucide-react';
import {
  CHAT_CONTROL_ACCESS_KEY,
  CHAT_CONTROL_KEY_STORAGE,
  cloneChatFlowConfig,
  defaultChatFlowConfig,
  loadChatFlowConfig,
  saveChatFlowConfig,
} from '@/lib/chatFlowConfig';

function splitLines(value) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function lines(value = []) {
  return value.join('\n');
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      {hint && <span className="mt-1 block text-xs leading-5 text-slate-500">{hint}</span>}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function TextInput({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none transition focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
    />
  );
}

function TextArea({ value, onChange, rows = 4 }) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(event) => onChange(event.target.value)}
      className="w-full resize-y rounded-lg border border-black/10 bg-white px-3 py-3 text-sm leading-6 outline-none transition focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
    />
  );
}

function Section({ title, description, children }) {
  return (
    <section className="rounded-xl border border-black/10 bg-white p-5">
      <h2 className="text-lg font-semibold tracking-normal text-slate-950">{title}</h2>
      {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
      <div className="mt-5 grid gap-5">{children}</div>
    </section>
  );
}

function formatDate(value) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value));
}

export default function ChatControlPage() {
  const [authorized, setAuthorized] = useState(() => window.sessionStorage.getItem(CHAT_CONTROL_KEY_STORAGE) === CHAT_CONTROL_ACCESS_KEY);
  const [accessKey, setAccessKey] = useState(() => (window.sessionStorage.getItem(CHAT_CONTROL_KEY_STORAGE) === CHAT_CONTROL_ACCESS_KEY ? CHAT_CONTROL_ACCESS_KEY : ''));
  const [config, setConfig] = useState(() => loadChatFlowConfig());
  const [status, setStatus] = useState('Edite o fluxo e salve para testar no chat deste navegador.');
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationStatus, setConversationStatus] = useState('As conversas aparecem aqui depois que alguém iniciar o chat.');
  const [conversationLoading, setConversationLoading] = useState(false);
  const [manualReply, setManualReply] = useState('');
  const responseEntries = useMemo(() => Object.entries(config.responses), [config.responses]);

  const updateConfig = (updater) => {
    setConfig((current) => {
      const next = cloneChatFlowConfig(current);
      updater(next);
      return next;
    });
  };

  const unlock = () => {
    if (accessKey !== CHAT_CONTROL_ACCESS_KEY) {
      setStatus('Chave incorreta.');
      return;
    }

    window.sessionStorage.setItem(CHAT_CONTROL_KEY_STORAGE, accessKey);
    setAuthorized(true);
    setStatus('Acesso liberado.');
  };

  const fetchConversations = async () => {
    if (!accessKey) return;

    setConversationLoading(true);
    setConversationStatus('Carregando conversas...');

    try {
      const response = await fetch('/api/chat-conversations.php', {
        headers: {
          Accept: 'application/json',
          'X-Chat-Control-Key': accessKey,
        },
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Nao foi possivel carregar as conversas.');
      }

      setConversations(payload.conversations || []);
      setConversationStatus(`Atualizado em ${formatDate(payload.generatedAt)}.`);
    } catch (error) {
      setConversationStatus(error.message || 'Nao foi possivel carregar as conversas.');
    } finally {
      setConversationLoading(false);
    }
  };

  const openConversation = async (conversationId) => {
    setConversationLoading(true);
    setConversationStatus('Abrindo conversa...');

    try {
      const response = await fetch(`/api/chat-conversations.php?conversationId=${encodeURIComponent(conversationId)}`, {
        headers: {
          Accept: 'application/json',
          'X-Chat-Control-Key': accessKey,
        },
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Nao foi possivel abrir a conversa.');
      }

      setSelectedConversation(payload.conversation);
      setConversationStatus('Conversa carregada.');
    } catch (error) {
      setConversationStatus(error.message || 'Nao foi possivel abrir a conversa.');
    } finally {
      setConversationLoading(false);
    }
  };

  const sendManualReply = async () => {
    const text = manualReply.trim();
    if (!text || !selectedConversation) return;

    setConversationLoading(true);
    setConversationStatus('Enviando resposta...');

    try {
      const response = await fetch('/api/chat-conversations.php', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Chat-Control-Key': accessKey,
        },
        body: JSON.stringify({
          action: 'operator_message',
          conversationId: selectedConversation.id,
          text,
          patientName: selectedConversation.patientName,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Nao foi possivel responder.');
      }

      setSelectedConversation(payload.conversation);
      setManualReply('');
      setConversationStatus('Resposta enviada. Se a pessoa ainda estiver com o chat aberto, ela verá a mensagem automaticamente.');
      fetchConversations();
    } catch (error) {
      setConversationStatus(error.message || 'Nao foi possivel responder.');
    } finally {
      setConversationLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      fetchConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized]);

  const save = () => {
    saveChatFlowConfig(config);
    setStatus('Fluxo salvo. Recarregue a página inicial para testar com a nova configuração.');
  };

  const reset = () => {
    const next = cloneChatFlowConfig(defaultChatFlowConfig);
    setConfig(next);
    saveChatFlowConfig(next);
    setStatus('Fluxo restaurado para o padrão.');
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fluxo-chat-matheus-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        setConfig({ ...cloneChatFlowConfig(), ...parsed });
        setStatus('Arquivo importado. Revise e clique em salvar.');
      } catch {
        setStatus('Nao foi possivel importar este JSON.');
      }
    };
    reader.readAsText(file);
  };

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f7f9] px-5 text-slate-950">
        <Helmet>
          <title>Controle do chat | Matheus Filgueiras</title>
          <meta name="robots" content="noindex,nofollow" />
        </Helmet>
        <section className="w-full max-w-md rounded-xl border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Controle interno</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Fluxo do chat</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Informe a chave de acesso para editar o Converse comigo.</p>
          <label className="relative mt-6 block">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              value={accessKey}
              onChange={(event) => setAccessKey(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') unlock();
              }}
              placeholder="Chave de acesso"
              className="h-11 w-full rounded-lg border border-black/10 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
            />
          </label>
          <button type="button" onClick={unlock} className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
            Entrar
          </button>
          <p className="mt-3 text-sm text-slate-500">{status}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-5 py-8 text-slate-950 sm:px-8 lg:px-10">
      <Helmet>
        <title>Controle do chat | Matheus Filgueiras</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-black/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Controle interno</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal sm:text-4xl">Fluxo do Converse comigo</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Configure mensagens, atalhos, intenções e palavras-chave do motor conversacional. As alterações ficam salvas neste navegador.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={save} className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
              <Save className="h-4 w-4" />
              Salvar
            </button>
            <button type="button" onClick={reset} className="inline-flex h-10 items-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-medium transition hover:bg-slate-50">
              <RotateCcw className="h-4 w-4" />
              Restaurar
            </button>
            <button type="button" onClick={exportJson} className="inline-flex h-10 items-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-medium transition hover:bg-slate-50">
              <Download className="h-4 w-4" />
              Exportar
            </button>
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-medium transition hover:bg-slate-50">
              <Upload className="h-4 w-4" />
              Importar
              <input type="file" accept="application/json" className="hidden" onChange={(event) => importJson(event.target.files?.[0])} />
            </label>
          </div>
        </header>

        <p className="mt-4 rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-slate-600">{status}</p>

        <div className="mt-6 grid gap-5">
          <Section title="Conversas iniciadas" description="Acompanhe quem abriu conversa, veja o histórico e responda pessoalmente quando precisar.">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-sm text-slate-600">{conversationStatus}</p>
              <button type="button" onClick={fetchConversations} disabled={conversationLoading} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${conversationLoading ? 'animate-spin' : ''}`} />
                Atualizar conversas
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="max-h-[34rem] overflow-y-auto rounded-lg border border-black/10">
                {conversations.length ? (
                  conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => openConversation(conversation.id)}
                      className={`block w-full border-b border-black/5 p-4 text-left transition hover:bg-slate-50 ${
                        selectedConversation?.id === conversation.id ? 'bg-[#eef6ff]' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-950">{conversation.patientName || 'Nome nao informado'}</p>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          conversation.status === 'needs_attention' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}
                        >
                          {conversation.status === 'needs_attention' ? 'Aguardando' : 'Respondida'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(conversation.updatedAt)} · {conversation.ipMasked || 'IP mascarado'}</p>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{conversation.lastMessage || 'Sem mensagens'}</p>
                    </button>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm text-slate-500">
                    <MessageSquare className="mx-auto mb-3 h-6 w-6" />
                    Nenhuma conversa registrada ainda.
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-black/10 bg-slate-50 p-4">
                {selectedConversation ? (
                  <>
                    <div className="mb-4 border-b border-black/10 pb-4">
                      <h3 className="text-lg font-semibold">{selectedConversation.patientName || 'Nome nao informado'}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Iniciada em {formatDate(selectedConversation.createdAt)} · {selectedConversation.path || '/'}
                      </p>
                    </div>
                    <div className="max-h-[24rem] space-y-3 overflow-y-auto pr-1">
                      {(selectedConversation.messages || []).map((message) => (
                        <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                            message.sender === 'user'
                              ? 'bg-[#0066cc] text-white'
                              : message.sender === 'operator'
                                ? 'bg-slate-950 text-white'
                                : 'bg-white text-slate-800'
                          }`}
                          >
                            <p>{message.text}</p>
                            <p className={`mt-1 text-[0.68rem] ${message.sender === 'user' || message.sender === 'operator' ? 'text-white/60' : 'text-slate-400'}`}>
                              {message.sender === 'operator' ? 'Você' : message.sender === 'assistant' ? 'Automático' : 'Paciente'} · {formatDate(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 grid gap-2 border-t border-black/10 pt-4">
                      <TextArea value={manualReply} onChange={setManualReply} rows={3} />
                      <button type="button" onClick={sendManualReply} disabled={!manualReply.trim() || conversationLoading} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50">
                        <Send className="h-4 w-4" />
                        Responder pessoalmente
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-[24rem] items-center justify-center text-center text-sm text-slate-500">
                    Selecione uma conversa para ver o histórico.
                  </div>
                )}
              </div>
            </div>
          </Section>

          <Section title="Início e atalhos" description="Controle a primeira impressão do chat e as opções rápidas depois que o paciente informa o nome.">
            <Field label="Mensagem inicial">
              <TextArea value={config.initialMessage} onChange={(value) => updateConfig((next) => { next.initialMessage = value; })} rows={2} />
            </Field>
            <Field label="Atalhos rápidos" hint="Um atalho por linha.">
              <TextArea value={lines(config.quickReplies)} onChange={(value) => updateConfig((next) => { next.quickReplies = splitLines(value); })} />
            </Field>
          </Section>

          <Section title="Respostas da árvore" description="Use {name}, {namePrefix}, {dayLabel}, {period} e {priorityPrefix} quando precisar de contexto na frase.">
            <div className="grid gap-4 lg:grid-cols-2">
              {responseEntries.map(([key, value]) => (
                <Field key={key} label={key}>
                  <TextArea value={value} onChange={(nextValue) => updateConfig((next) => { next.responses[key] = nextValue; })} rows={3} />
                </Field>
              ))}
            </div>
          </Section>

          <Section title="Intenções" description="Palavras ou expressões que ajudam o chat a entender o que a pessoa quer. Uma por linha.">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(config.intents).map(([key, value]) => (
                <Field key={key} label={key}>
                  <TextArea value={lines(value)} onChange={(nextValue) => updateConfig((next) => { next.intents[key] = splitLines(nextValue); })} />
                </Field>
              ))}
            </div>
          </Section>

          <Section title="Entidades e sintomas" description="Palavras que identificam motivo, sintomas, dias, período e sinais de alerta.">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(config.entities).map(([key, value]) => (
                <Field key={key} label={key}>
                  <TextArea value={lines(value)} onChange={(nextValue) => updateConfig((next) => { next.entities[key] = splitLines(nextValue); })} />
                </Field>
              ))}
            </div>
          </Section>

          <Section title="Tempo de digitação" description="Ajuste a sensação de resposta humana. Valores em milissegundos.">
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Mínimo">
                <TextInput value={String(config.typing.minDelay)} onChange={(value) => updateConfig((next) => { next.typing.minDelay = Number(value) || 0; })} />
              </Field>
              <Field label="Máximo">
                <TextInput value={String(config.typing.maxDelay)} onChange={(value) => updateConfig((next) => { next.typing.maxDelay = Number(value) || 0; })} />
              </Field>
              <Field label="ms por caractere">
                <TextInput value={String(config.typing.msPerCharacter)} onChange={(value) => updateConfig((next) => { next.typing.msPerCharacter = Number(value) || 0; })} />
              </Field>
            </div>
          </Section>
        </div>
      </div>
    </main>
  );
}
