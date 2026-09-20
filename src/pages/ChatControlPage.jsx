import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Download, GitBranch, KeyRound, MessageSquare, Plus, RefreshCw, RotateCcw, Save, Send, Trash2, Upload } from 'lucide-react';
import {
  CHAT_CONTROL_ACCESS_KEY,
  CHAT_CONTROL_KEY_STORAGE,
  cloneChatFlowConfig,
  defaultChatFlowConfig,
  fetchChatFlowConfig,
  loadChatFlowConfig,
  mergeChatFlowConfig,
  saveChatFlowConfig,
  saveChatFlowConfigRemote,
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

const nodeTypeStyles = {
  start: 'border-emerald-500 bg-emerald-50 text-emerald-950',
  message: 'border-sky-500 bg-sky-50 text-sky-950',
  question: 'border-violet-500 bg-violet-50 text-violet-950',
  handoff: 'border-slate-800 bg-slate-50 text-slate-950',
  alert: 'border-rose-500 bg-rose-50 text-rose-950',
};

function FlowEditor({ config, updateConfig }) {
  const nodes = config.flow?.nodes || [];
  const edges = config.flow?.edges || [];
  const viewportRef = useRef(null);
  const panRef = useRef(null);
  const nodeDragRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState('');
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  const getNodeMessage = (node) => {
    if (!node) return '';
    return node.responseKey === 'initialMessage' ? config.initialMessage : config.responses[node.responseKey] || '';
  };

  const updateNode = (nodeId, patch) => {
    updateConfig((next) => {
      next.flow.nodes = next.flow.nodes.map((node) => (node.id === nodeId ? { ...node, ...patch } : node));
    });
  };

  const updateNodeMessage = (node, value) => {
    updateConfig((next) => {
      if (node.responseKey === 'initialMessage') {
        next.initialMessage = value;
      } else {
        next.responses[node.responseKey] = value;
      }
    });
  };

  const addNode = () => {
    const id = `custom_${Date.now()}`;
    updateConfig((next) => {
      next.responses[id] = 'Nova mensagem.';
      next.flow.nodes.push({
        id,
        type: 'message',
        title: 'Novo bloco',
        subtitle: 'Mensagem editável',
        responseKey: id,
        x: 520,
        y: 1220,
      });
    });
  };

  const removeNode = (nodeToRemove) => {
    if (!nodeToRemove || nodeToRemove.id === 'start') return;
    updateConfig((next) => {
      next.flow.nodes = next.flow.nodes.filter((node) => node.id !== nodeToRemove.id);
      next.flow.edges = next.flow.edges.filter((edge) => edge.from !== nodeToRemove.id && edge.to !== nodeToRemove.id);
      if (nodeToRemove.responseKey?.startsWith('custom_')) {
        delete next.responses[nodeToRemove.responseKey];
      }
    });
  };

  const addEdge = (from, to) => {
    if (!from || !to || from === to) return;
    updateConfig((next) => {
      next.flow.edges.push({
        id: `edge_${Date.now()}`,
        from,
        to,
        label: 'nova condição',
      });
    });
  };

  const updateEdge = (edgeId, patch) => {
    updateConfig((next) => {
      next.flow.edges = next.flow.edges.map((edge) => (edge.id === edgeId ? { ...edge, ...patch } : edge));
    });
  };

  const removeEdge = (edgeId) => {
    updateConfig((next) => {
      next.flow.edges = next.flow.edges.filter((edge) => edge.id !== edgeId);
    });
  };

  const startNodeDrag = (event, node) => {
    if (event.target.closest('button, input, textarea, select, label, a')) return;
    event.stopPropagation();
    nodeDragRef.current = {
      pointerId: event.pointerId,
      nodeId: node.id,
      x: event.clientX,
      y: event.clientY,
      nodeX: node.x,
      nodeY: node.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingNodeId(node.id);
  };

  const moveNodeDrag = (event) => {
    const drag = nodeDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    updateNode(drag.nodeId, {
      x: Math.max(0, Math.round(drag.nodeX + event.clientX - drag.x)),
      y: Math.max(0, Math.round(drag.nodeY + event.clientY - drag.y)),
    });
  };

  const stopNodeDrag = (event) => {
    if (nodeDragRef.current?.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    nodeDragRef.current = null;
    setDraggingNodeId('');
  };

  const startPan = (event) => {
    if (event.target.closest('button, input, textarea, select, label, a')) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    panRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    };
    viewport.setPointerCapture(event.pointerId);
    setIsPanning(true);
  };

  const movePan = (event) => {
    const viewport = viewportRef.current;
    const pan = panRef.current;
    if (!viewport || !pan || pan.pointerId !== event.pointerId) return;

    viewport.scrollLeft = pan.scrollLeft - (event.clientX - pan.x);
    viewport.scrollTop = pan.scrollTop - (event.clientY - pan.y);
  };

  const stopPan = (event) => {
    const viewport = viewportRef.current;
    if (viewport && panRef.current?.pointerId === event.pointerId) {
      viewport.releasePointerCapture(event.pointerId);
    }
    panRef.current = null;
    setIsPanning(false);
  };

  return (
    <Section title="Árvore visual do diálogo" description="Visualize e ajuste o fluxo principal. Cada bloco mostra apenas o essencial para manter a leitura clara.">
      <div className="grid gap-4">
        <div className="min-w-0">
          <div className="mb-3 flex flex-col gap-2 rounded-xl border border-black/10 bg-slate-50 px-4 py-3 text-sm text-slate-600 lg:flex-row lg:items-center lg:justify-between">
            <span>Arraste o fundo para navegar. Edite título, mensagem e saídas diretamente nos blocos.</span>
            <button type="button" onClick={addNode} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-xs font-semibold text-white">
              <Plus className="h-4 w-4" />
              Novo bloco
            </button>
          </div>
          <div
            ref={viewportRef}
            onPointerDown={startPan}
            onPointerMove={movePan}
            onPointerUp={stopPan}
            onPointerCancel={stopPan}
            onPointerLeave={(event) => {
              if (panRef.current?.pointerId === event.pointerId) stopPan(event);
            }}
            className={`h-[82vh] min-h-[48rem] overflow-auto rounded-xl border border-black/10 bg-[#f4f7ff] shadow-inner [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${isPanning ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
            style={{ msOverflowStyle: 'none' }}
          >
          <div
            className="relative h-[1600px] w-[3400px]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(37,99,235,0.16) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          >
            <svg className="pointer-events-none absolute inset-0 h-full w-full">
              {edges.map((edge) => {
                const from = nodeMap.get(edge.from);
                const to = nodeMap.get(edge.to);
                if (!from || !to) return null;
                const x1 = from.x + 320;
                const y1 = from.y + 118;
                const x2 = to.x;
                const y2 = to.y + 118;
                const mid = Math.max(80, Math.abs(x2 - x1) * 0.42);
                const path = `M ${x1} ${y1} C ${x1 + mid} ${y1}, ${x2 - mid} ${y2}, ${x2} ${y2}`;

                return (
                  <g key={edge.id}>
                    <path d={path} fill="none" stroke="#94a3b8" strokeWidth="3" />
                    <circle cx={x1} cy={y1} r="7" fill="#4f7cff" />
                    <circle cx={x2} cy={y2} r="7" fill="#4f7cff" />
                    {edge.label && (
                      <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 10} fill="#475569" fontSize="12" fontWeight="600">
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {nodes.map((node) => (
              <div
                key={node.id}
                onPointerDown={(event) => startNodeDrag(event, node)}
                onPointerMove={moveNodeDrag}
                onPointerUp={stopNodeDrag}
                onPointerCancel={stopNodeDrag}
                className={`absolute w-80 rounded-2xl border-2 bg-white p-4 text-left shadow-[0_16px_44px_rgba(15,23,42,0.14)] ${
                  nodeTypeStyles[node.type] || nodeTypeStyles.message
                } ${draggingNodeId === node.id ? 'cursor-grabbing ring-4 ring-[#4f7cff]/20' : 'cursor-move'}`}
                style={{ left: node.x, top: node.y }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 shrink-0" />
                    <select
                      value={node.type}
                      onChange={(event) => updateNode(node.id, { type: event.target.value })}
                      className="rounded-md border border-black/10 bg-white/80 px-2 py-1 text-xs font-bold uppercase tracking-[0.12em] outline-none"
                    >
                      <option value="start">start</option>
                      <option value="message">message</option>
                      <option value="question">question</option>
                      <option value="handoff">handoff</option>
                      <option value="alert">alert</option>
                    </select>
                  </div>
                  <button type="button" onClick={() => removeNode(node)} disabled={node.id === 'start'} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 bg-white/80 text-slate-500 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <input
                  value={node.title}
                  onChange={(event) => updateNode(node.id, { title: event.target.value })}
                  className="mt-4 w-full rounded-lg border-0 bg-transparent px-0 py-1 text-xl font-semibold leading-tight outline-none focus:bg-white/70 focus:px-3"
                />
                <textarea
                  value={getNodeMessage(node)}
                  onChange={(event) => updateNodeMessage(node, event.target.value)}
                  rows={3}
                  className="mt-3 w-full resize-none rounded-xl border border-black/10 bg-white/80 p-3 text-sm leading-6 text-slate-800 outline-none focus:border-[#0066cc]"
                />

                <div className="mt-4 border-t border-black/10 pt-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-600">Entradas</p>
                  <div className="flex flex-wrap gap-2">
                    {edges.filter((edge) => edge.to === node.id).map((edge) => (
                      <div key={edge.id} className="group inline-flex max-w-full items-center gap-1 rounded-full border border-black/10 bg-white px-2 py-1">
                        <select value={edge.from} onChange={(event) => updateEdge(edge.id, { from: event.target.value })} className="h-7 max-w-28 rounded-full border border-black/10 bg-slate-50 px-2 text-xs outline-none">
                          {nodes.filter((item) => item.id !== node.id).map((item) => (
                            <option key={item.id} value={item.id}>{item.title}</option>
                          ))}
                        </select>
                        <input value={edge.label || ''} onChange={(event) => updateEdge(edge.id, { label: event.target.value })} className="h-7 w-24 min-w-0 bg-transparent text-xs font-semibold outline-none" />
                        <button type="button" onClick={() => removeEdge(edge.id)} className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {!edges.some((edge) => edge.to === node.id) && (
                      <p className="text-xs text-slate-500">Sem entrada configurada.</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 border-t border-black/10 pt-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">Saídas</p>
                    <button type="button" onClick={() => addEdge(node.id, nodes.find((item) => item.id !== node.id)?.id)} className="inline-flex h-7 items-center gap-1 rounded-md bg-slate-950 px-2 text-[0.68rem] font-semibold text-white">
                      <Plus className="h-3 w-3" />
                      opção
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {edges.filter((edge) => edge.from === node.id).map((edge) => (
                      <div key={edge.id} className="group inline-flex max-w-full items-center gap-1 rounded-full border border-black/10 bg-white px-2 py-1">
                        <input value={edge.label || ''} onChange={(event) => updateEdge(edge.id, { label: event.target.value })} className="h-7 w-24 min-w-0 bg-transparent text-xs font-semibold outline-none" />
                        <select value={edge.to} onChange={(event) => updateEdge(edge.id, { to: event.target.value })} className="h-7 max-w-28 rounded-full border border-black/10 bg-slate-50 px-2 text-xs outline-none">
                          {nodes.filter((item) => item.id !== node.id).map((item) => (
                            <option key={item.id} value={item.id}>{item.title}</option>
                          ))}
                        </select>
                        <button type="button" onClick={() => removeEdge(edge.id)} className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {!edges.some((edge) => edge.from === node.id) && (
                      <p className="text-xs text-slate-500">Sem saída configurada.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </Section>
  );
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
  const autoSaveReadyRef = useRef(false);
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

  const loadRemoteConfig = async () => {
    try {
      const remoteConfig = await fetchChatFlowConfig();
      if (remoteConfig) {
        const nextConfig = mergeChatFlowConfig(remoteConfig);
        setConfig(nextConfig);
        saveChatFlowConfig(nextConfig);
        setStatus('Fluxo carregado do servidor. Alterações serão salvas automaticamente.');
      } else {
        setStatus('Nenhum fluxo salvo no servidor ainda. Alterações serão salvas automaticamente.');
      }
    } catch {
      setStatus('Nao foi possivel carregar o fluxo do servidor. Alterações locais continuam disponíveis.');
    } finally {
      window.setTimeout(() => {
        autoSaveReadyRef.current = true;
      }, 0);
    }
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
      loadRemoteConfig();
      fetchConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized]);

  useEffect(() => {
    if (!authorized || !autoSaveReadyRef.current) return undefined;

    saveChatFlowConfig(config);
    setStatus('Salvando alterações...');

    const timeout = window.setTimeout(() => {
      saveChatFlowConfigRemote(config, accessKey)
        .then(() => {
          setStatus('Alterações salvas automaticamente.');
        })
        .catch((error) => {
          setStatus(error.message || 'Nao foi possivel salvar automaticamente.');
        });
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [accessKey, authorized, config]);

  const save = () => {
    saveChatFlowConfig(config);
    saveChatFlowConfigRemote(config, accessKey)
      .then(() => setStatus('Fluxo salvo no servidor.'))
      .catch((error) => setStatus(error.message || 'Nao foi possivel salvar o fluxo.'));
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
        setConfig(mergeChatFlowConfig(parsed));
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

      <div className="mx-auto max-w-[96rem]">
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

          <FlowEditor config={config} updateConfig={updateConfig} />

          <Section title="IA do atendimento" description="Configure a camada de IA que responde como você. Para Gemini, configure GEMINI_API_KEY no servidor. Se a IA estiver desligada ou falhar, o fluxo por regras continua funcionando.">
            <div className="grid gap-5">
              <label className="flex items-center justify-between gap-4 rounded-xl border border-black/10 bg-slate-50 p-4">
                <span>
                  <span className="block text-sm font-semibold text-slate-950">Usar IA nas respostas</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">Quando ligado, o chat tenta gerar uma resposta contextual antes de usar o fluxo por regras.</span>
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(config.ai?.enabled)}
                  onChange={(event) => updateConfig((next) => { next.ai.enabled = event.target.checked; })}
                  className="h-5 w-5"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-4">
                <Field label="Provedor">
                  <select
                    value={config.ai?.provider || 'gemini'}
                    onChange={(event) => updateConfig((next) => {
                      next.ai.provider = event.target.value;
                      if (event.target.value === 'gemini' && (next.ai.model?.startsWith('gpt-') || next.ai.model === 'gemini-3.6-flash')) next.ai.model = 'gemini-2.5-flash-lite';
                      if (event.target.value === 'openai' && next.ai.model?.startsWith('gemini-')) next.ai.model = 'gpt-5.6-luna';
                    })}
                    className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none transition focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
                  >
                    <option value="gemini">Gemini</option>
                    <option value="openai">OpenAI</option>
                  </select>
                </Field>
                <Field label="Modelo">
                  <TextInput value={config.ai?.model || ''} onChange={(value) => updateConfig((next) => { next.ai.model = value; })} />
                </Field>
                <Field label="Criatividade">
                  <TextInput value={String(config.ai?.temperature ?? 0.35)} onChange={(value) => updateConfig((next) => { next.ai.temperature = Number(value) || 0; })} />
                </Field>
                <Field label="Máximo de tokens">
                  <TextInput value={String(config.ai?.maxOutputTokens ?? 420)} onChange={(value) => updateConfig((next) => { next.ai.maxOutputTokens = Number(value) || 420; })} />
                </Field>
              </div>

              <Field label="Prompt de treinamento" hint="Aqui fica a personalidade, limites clínicos, tom de voz e regras de segurança da IA.">
                <TextArea value={config.ai?.systemPrompt || ''} onChange={(value) => updateConfig((next) => { next.ai.systemPrompt = value; })} rows={12} />
              </Field>
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
