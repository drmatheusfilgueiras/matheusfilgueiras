import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Download, KeyRound, RotateCcw, Save, Upload } from 'lucide-react';
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

export default function ChatControlPage() {
  const [authorized, setAuthorized] = useState(() => window.sessionStorage.getItem(CHAT_CONTROL_KEY_STORAGE) === CHAT_CONTROL_ACCESS_KEY);
  const [accessKey, setAccessKey] = useState('');
  const [config, setConfig] = useState(() => loadChatFlowConfig());
  const [status, setStatus] = useState('Edite o fluxo e salve para testar no chat deste navegador.');
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
