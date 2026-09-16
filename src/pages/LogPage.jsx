import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { ArrowDownToLine, BarChart3, CalendarDays, Clock3, Eye, Globe2, KeyRound, RefreshCw, Search } from 'lucide-react';

const LOG_KEY_STORAGE = 'matheus_access_log_key';

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value));
}

function sourceLabel(event) {
  if (!event.referrer) {
    return 'Direto';
  }

  try {
    return new URL(event.referrer).hostname.replace(/^www\./, '');
  } catch {
    return event.referrer;
  }
}

function locationLabel(event) {
  return [event.country, event.timezone, event.language].filter(Boolean).join(' · ') || 'Nao informado';
}

function deviceLabel(userAgent = '') {
  if (/Mobi|Android|iPhone|iPad/i.test(userAgent)) {
    return 'Mobile';
  }

  if (/Tablet|iPad/i.test(userAgent)) {
    return 'Tablet';
  }

  return 'Desktop';
}

function csvEscape(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function downloadCsv(events) {
  const rows = [
    ['Data e hora', 'Documento', 'Caminho', 'Origem', 'Localizacao', 'IP mascarado', 'Visitante', 'Dispositivo'],
    ...events.map((event) => [
      formatDate(event.timestamp),
      event.documentTitle || event.documentId,
      event.path,
      sourceLabel(event),
      locationLabel(event),
      event.ipMasked,
      event.visitorId,
      deviceLabel(event.userAgent),
    ]),
  ];

  const csv = rows.map((row) => row.map(csvEscape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `logs-acesso-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-5">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">{value}</p>
    </div>
  );
}

export default function LogPage() {
  const [key, setKey] = useState(() => window.sessionStorage.getItem(LOG_KEY_STORAGE) || '');
  const [inputKey, setInputKey] = useState(key);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState(key ? 'Carregando logs...' : 'Informe a chave de acesso para consultar os logs.');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const fetchLogs = async (accessKey = key) => {
    if (!accessKey) {
      setStatus('Informe a chave de acesso para consultar os logs.');
      return;
    }

    setLoading(true);
    setStatus('Carregando logs...');

    try {
      const response = await fetch(`/api/access-log.php?limit=5000&key=${encodeURIComponent(accessKey)}`, {
        headers: { Accept: 'application/json' },
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Nao foi possivel carregar os logs.');
      }

      window.sessionStorage.setItem(LOG_KEY_STORAGE, accessKey);
      setKey(accessKey);
      setInputKey(accessKey);
      setData(payload);
      setStatus(`Atualizado em ${formatDate(payload.generatedAt)}.`);
    } catch (error) {
      setData(null);
      setStatus(error.message || 'Nao foi possivel carregar os logs.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    const events = data?.events || [];
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return events;
    }

    return events.filter((event) =>
      [
        event.documentTitle,
        event.documentId,
        event.path,
        sourceLabel(event),
        locationLabel(event),
        deviceLabel(event.userAgent),
        event.ipMasked,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [data, query]);

  const documentRows = Object.entries(data?.summary?.byDocument || {}).slice(0, 8);
  const dayRows = Object.entries(data?.summary?.byDay || {}).slice(-7);

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-5 py-8 text-slate-950 sm:px-8 lg:px-10">
      <Helmet>
        <title>Log de acessos | Matheus Filgueiras</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-black/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Controle interno</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal sm:text-4xl">Log de acessos</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Acompanhe acessos por documento, origem, data, horario, idioma, fuso e identificador tecnico do visitante.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative min-w-0 sm:w-80">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={inputKey}
                onChange={(event) => setInputKey(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    fetchLogs(inputKey);
                  }
                }}
                placeholder="Chave de acesso"
                className="h-11 w-full rounded-lg border border-black/10 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
              />
            </label>
            <button
              type="button"
              onClick={() => fetchLogs(inputKey)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={Eye} label="Acessos carregados" value={data?.summary?.total ?? '-'} />
          <Metric icon={Clock3} label="Hoje" value={data?.summary?.today ?? '-'} />
          <Metric icon={CalendarDays} label="Ultimos 7 dias" value={data?.summary?.last7Days ?? '-'} />
          <Metric icon={Globe2} label="Visitantes unicos" value={data?.summary?.uniqueVisitors ?? '-'} />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-black/10 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-slate-500" />
              <h2 className="text-base font-semibold">Documentos mais acessados</h2>
            </div>
            <div className="space-y-3">
              {documentRows.length ? (
                documentRows.map(([document, count]) => (
                  <div key={document} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <span className="truncate text-sm text-slate-700">{document}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Nenhum acesso carregado ainda.</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              <h2 className="text-base font-semibold">Ultimos dias</h2>
            </div>
            <div className="space-y-3">
              {dayRows.length ? (
                dayRows.map(([day, count]) => (
                  <div key={day} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <span className="text-sm text-slate-700">{day.split('-').reverse().join('/')}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Os dias aparecem depois dos primeiros acessos.</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-black/10 bg-white">
          <div className="flex flex-col gap-3 border-b border-black/10 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold">Registros recentes</h2>
              <p className="mt-1 text-sm text-slate-500">{status}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative sm:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Filtrar por documento, origem ou local"
                  className="h-10 w-full rounded-lg border border-black/10 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
                />
              </label>
              <button
                type="button"
                onClick={() => downloadCsv(filteredEvents)}
                disabled={!filteredEvents.length}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-black/10 px-3 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-40"
              >
                <ArrowDownToLine className="h-4 w-4" />
                CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Data e horario</th>
                  <th className="px-4 py-3 font-medium">Documento</th>
                  <th className="px-4 py-3 font-medium">Origem</th>
                  <th className="px-4 py-3 font-medium">Local</th>
                  <th className="px-4 py-3 font-medium">Dispositivo</th>
                  <th className="px-4 py-3 font-medium">Visitante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredEvents.length ? (
                  filteredEvents.map((event, index) => (
                    <tr key={`${event.timestamp}-${event.visitorId}-${index}`} className="align-top">
                      <td className="px-4 py-3 text-slate-700">{formatDate(event.timestamp)}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-950">{event.documentTitle || event.documentId}</p>
                        <p className="mt-1 max-w-72 truncate text-xs text-slate-500">{event.path}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{sourceLabel(event)}</td>
                      <td className="px-4 py-3">
                        <p className="text-slate-700">{locationLabel(event)}</p>
                        <p className="mt-1 text-xs text-slate-400">{event.ipMasked || 'IP mascarado'}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{deviceLabel(event.userAgent)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{event.visitorId || event.ipHash}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan="6">
                      Nenhum registro para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
