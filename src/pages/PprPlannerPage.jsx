import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import {
  archLabel,
  archViewBox,
  areaPolygon,
  connectorPath,
  getToothPoint,
  toothPathByNumber,
} from '../lib/ppr/render-svg.js';
import {
  arches,
  createProject,
  migrateProject,
  toothStatusOptions,
  toothArray,
  workflowSteps,
} from '../lib/ppr/clinical-rules.js';
import { classifyAll } from '../lib/ppr/kennedy.js';
import {
  analyzeAll,
  evaluateDirectRetainer,
  hasEssentialSurvey,
  suggestComponents,
} from '../lib/ppr/biomechanics.js';
import { validateDesign, validationChecklist } from '../lib/ppr/validation.js';

const STORAGE_KEY = 'matheus_ppr_design_v2';

const statusTone = {
  present: 'fill-white stroke-slate-500',
  missing_replace: 'fill-amber-50 stroke-amber-500 stroke-dasharray-[4_3]',
  extract_replace: 'fill-rose-50 stroke-rose-500 stroke-dasharray-[5_3]',
  missing_no_replace: 'fill-slate-100 stroke-slate-300 opacity-45',
  excluded_abutment: 'fill-white stroke-slate-400 opacity-60',
};

const surveyFields = [
  ['pathOfInsertion', 'Eixo de inserção', ['não informado', 'favorável', 'exige ajuste']],
  ['guidePlane', 'Plano-guia', ['não informado', 'presente', 'ausente', 'a preparar']],
  ['retentiveSurface', 'Superfície retentiva', ['não informado', 'vestibular', 'lingual']],
  ['undercutLocation', 'Localização do undercut', ['não informado', 'mesial', 'distal', 'cervical']],
  ['undercutDepth', 'Profundidade do undercut', ['não informado', '0,25 mm', '0,50 mm']],
  ['heightOfContour', 'Equador protético', ['não informado', 'favorável', 'alto', 'baixo']],
  ['softTissueUndercut', 'Undercut de tecido mole', ['não informado', 'não', 'sim']],
  ['vestibularAccess', 'Acesso vestibular', ['não informado', 'adequado', 'inadequado']],
  ['frenumInterference', 'Freio/inserção muscular', ['não informado', 'não', 'sim']],
  ['periodontalCondition', 'Condição periodontal', ['não informado', 'favorável', 'reduzida']],
  ['mobility', 'Mobilidade', ['não informado', 'ausente', 'leve', 'moderada']],
  ['inclination', 'Inclinação dentária', ['não informado', 'favorável', 'desfavorável']],
  ['estheticDemand', 'Demanda estética', ['não informado', 'baixa', 'moderada', 'alta']],
];

function classNames(...items) {
  return items.filter(Boolean).join(' ');
}

function loadProject() {
  try {
    return migrateProject(JSON.parse(window.localStorage.getItem(STORAGE_KEY)));
  } catch {
    return createProject();
  }
}

function Pill({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-[#eaf4ff] text-[#0066cc]',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-rose-50 text-rose-700',
  };
  return <span className={classNames('inline-flex rounded-full px-3 py-1 text-xs font-semibold', tones[tone])}>{children}</span>;
}

function PrincipleItem({ label, state }) {
  const tone = state === 'adequado' ? 'bg-emerald-500' : state === 'atenção' ? 'bg-amber-400' : 'bg-slate-300';
  return (
    <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-3 py-2 text-sm">
      <span className="font-semibold text-slate-700">{label}</span>
      <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span className={classNames('h-2.5 w-2.5 rounded-full', tone)} />
        {state}
      </span>
    </div>
  );
}

function Tooth({ project, arch, tooth, selected, onClick }) {
  const [x, y] = getToothPoint(arch, tooth.number);
  const angle = arch === 'upper' ? (x < 400 ? -12 : 12) : (x < 400 ? 12 : -12);
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`Dente ${tooth.number} - ${toothStatusOptions.find((item) => item.value === tooth.status)?.label}`}
      className="cursor-pointer outline-none"
      transform={`translate(${x} ${y}) rotate(${angle})`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <ellipse className={classNames('opacity-0 transition', selected && 'opacity-100')} cx="0" cy="0" rx="25" ry="31" fill="none" stroke="#0066cc" strokeWidth="2" strokeDasharray="4 4" />
      <path className={classNames('transition hover:stroke-[#0066cc]', statusTone[tooth.status])} d={toothPathByNumber(tooth.number)} strokeWidth="2" />
      {tooth.isAbutmentCandidate && <circle cx="0" cy="-24" r="5" fill="#0066cc" />}
      {tooth.rest.enabled && <path d="M -7 -18 Q 0 -24 7 -18 L 4 -12 Q 0 -14 -4 -12 Z" fill="#6f7f88" />}
      {tooth.guidePlane.enabled && <rect x="-17" y="-4" width="5" height="22" rx="2" fill="#22a6b3" opacity="0.75" />}
      {tooth.directRetainer.selected && <path d="M -19 -4 Q -28 7 -16 18 M 19 -4 Q 28 7 16 18" fill="none" stroke="#7c6f64" strokeWidth="3" strokeLinecap="round" />}
      {tooth.indirectRetainer.selected && <rect x="-10" y="-23" width="20" height="6" rx="3" fill="#f2c84b" />}
      <text x="0" y={arch === 'upper' ? 38 : -32} transform={`rotate(${-angle})`} textAnchor="middle" className="fill-slate-500 text-[10px] font-bold">
        {tooth.number}
      </text>
    </g>
  );
}

function ArchSvg({ project, arch, classification, analysis, components, selectedTooth, setSelectedTooth, visibleStep }) {
  const teeth = toothArray(project, arch);
  const connector = project.arches[arch].connector;
  const showBiomechanics = visibleStep >= 2;
  const showSurvey = visibleStep >= 3;
  const showRests = visibleStep >= 4;
  const showRetainers = visibleStep >= 5;
  const showBases = visibleStep >= 6;

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0066cc]">{archLabel(arch)}</p>
          <h3 className="mt-1 text-lg font-semibold">{classification.label}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill tone={classification.supportType === 'tooth_tissue_supported' ? 'amber' : 'blue'}>{classification.supportType === 'tooth_tissue_supported' ? 'Dentomucossuportado' : 'Dentossuportado'}</Pill>
          <Pill tone={classification.hasDistalExtension ? 'amber' : 'green'}>Extremidade livre: {classification.hasDistalExtension ? 'sim' : 'não'}</Pill>
          <Pill tone={classification.indirectRetentionRequired ? 'amber' : 'green'}>RI: {classification.indirectRetentionRequired ? 'necessária' : 'não necessária'}</Pill>
        </div>
      </div>

      <svg className="h-auto w-full" viewBox={archViewBox()} role="img" aria-label={`Odontograma da ${archLabel(arch)}`}>
        <g data-layer="edentulous-areas">
          {classification.edentulousAreas.map((area) => (
            <polygon
              key={area.id}
              points={areaPolygon(arch, area)}
              fill={area.id === classification.definingAreaId ? '#0066cc' : '#f2c84b'}
              opacity={area.id === classification.definingAreaId ? '0.12' : '0.11'}
              stroke={area.id === classification.definingAreaId ? '#0066cc' : '#d89d00'}
              strokeDasharray="6 5"
            />
          ))}
        </g>
        <g data-layer="fulcrum">
          {showBiomechanics && analysis.fulcrumLine.length >= 2 && (
            <line
              x1={analysis.fulcrumLine[0].point[0]}
              y1={analysis.fulcrumLine[0].point[1]}
              x2={analysis.fulcrumLine[1].point[0]}
              y2={analysis.fulcrumLine[1].point[1]}
              stroke="#e11d48"
              strokeWidth="3"
              strokeDasharray="8 6"
            />
          )}
        </g>
        <g data-layer="major-connectors">
          {showBases && connector && <path d={connectorPath(arch, connector)} fill={connector.includes('Placa') ? 'rgba(139,150,156,.34)' : 'none'} stroke="#7d898f" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />}
        </g>
        <g data-layer="bases">
          {showBases && components.bases.map((base) => (
            <polygon key={base.id} points={areaPolygon(arch, { teeth: base.teeth })} fill="url(#meshPattern)" stroke="#7d898f" opacity="0.5" />
          ))}
        </g>
        <defs>
          <pattern id="meshPattern" width="9" height="9" patternUnits="userSpaceOnUse">
            <path d="M 0 0 L 9 9 M 9 0 L 0 9" stroke="#7d898f" strokeWidth="0.8" />
          </pattern>
        </defs>
        <g data-layer="guide-planes">
          {showSurvey && components.guidePlanes.map((plane) => {
            const [x, y] = getToothPoint(arch, plane.tooth);
            return <rect key={`${plane.tooth}-gp`} x={x - 21} y={y - 10} width="6" height="26" rx="3" fill="#22a6b3" opacity="0.55" />;
          })}
        </g>
        <g data-layer="rests">
          {showRests && components.rests.map((rest) => {
            const [x, y] = getToothPoint(arch, rest.tooth);
            return <path key={`${rest.tooth}-rest`} d={`M ${x - 9} ${y - 22} Q ${x} ${y - 29} ${x + 9} ${y - 22} L ${x + 5} ${y - 15} Q ${x} ${y - 18} ${x - 5} ${y - 15} Z`} fill="#6f7f88" />;
          })}
        </g>
        <g data-layer="direct-retainers">
          {showRetainers && teeth.filter((tooth) => tooth.directRetainer.selected).map((tooth) => {
            const [x, y] = getToothPoint(arch, tooth.number);
            return <path key={`${tooth.number}-retainer`} d={`M ${x - 22} ${y - 5} Q ${x - 34} ${y + 9} ${x - 18} ${y + 22} M ${x + 22} ${y - 5} Q ${x + 34} ${y + 9} ${x + 18} ${y + 22}`} fill="none" stroke="#7c6f64" strokeWidth="4" strokeLinecap="round" />;
          })}
        </g>
        <g data-layer="indirect-retainers">
          {showRetainers && teeth.filter((tooth) => tooth.indirectRetainer.selected).map((tooth) => {
            const [x, y] = getToothPoint(arch, tooth.number);
            return <rect key={`${tooth.number}-indirect`} x={x - 12} y={y - 30} width="24" height="8" rx="4" fill="#f2c84b" />;
          })}
        </g>
        <g data-layer="teeth">
          {teeth.map((tooth) => (
            <Tooth
              key={tooth.number}
              project={project}
              arch={arch}
              tooth={tooth}
              selected={selectedTooth?.arch === arch && selectedTooth?.number === tooth.number}
              onClick={() => setSelectedTooth({ arch, number: tooth.number })}
            />
          ))}
        </g>
        <g data-layer="annotations">
          {showBiomechanics && analysis.indirectCandidates.slice(0, 2).map((candidate) => {
            const [x, y] = getToothPoint(arch, candidate.number);
            return <text key={`${candidate.number}-dist`} x={x} y={y + 48} textAnchor="middle" className="fill-amber-700 text-[10px] font-bold">{candidate.distanceToFulcrum}px</text>;
          })}
        </g>
      </svg>
    </section>
  );
}

function Inspector({ project, setProject, selectedTooth, analysis, step }) {
  if (!selectedTooth) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0066cc]">Painel clínico</p>
        <h2 className="mt-1 text-xl font-semibold">Selecione um dente</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">A edição direta fica disponível conforme o fluxo avança.</p>
      </div>
    );
  }

  const tooth = project.arches[selectedTooth.arch].teeth[selectedTooth.number];
  const context = analysis[selectedTooth.arch];
  const retainerCandidates = evaluateDirectRetainer(tooth, context);

  const updateTooth = (updater) => {
    setProject((current) => {
      const next = structuredClone(current);
      updater(next.arches[selectedTooth.arch].teeth[selectedTooth.number]);
      next.updatedAt = new Date().toISOString();
      return next;
    });
  };

  return (
    <aside className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0066cc]">Painel clínico</p>
      <h2 className="mt-1 text-xl font-semibold">Dente {tooth.number}</h2>

      <label className="mt-5 block text-sm font-semibold text-slate-700">
        Situação clínica
        <select value={tooth.status} onChange={(event) => updateTooth((draft) => { draft.status = event.target.value; })} className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm">
          {toothStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>

      {step >= 3 && (
        <div className="mt-5 space-y-3">
          <div>
            <h3 className="font-semibold">Delineamento</h3>
            <p className="text-xs leading-5 text-slate-500">Sem esses dados, retentores permanecem preliminares.</p>
          </div>
          {surveyFields.map(([key, label, options]) => (
            <label key={key} className="block text-xs font-semibold text-slate-600">
              {label}
              <select value={tooth.survey[key]} onChange={(event) => updateTooth((draft) => { draft.survey[key] = event.target.value; })} className="mt-1 h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm">
                {options.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          ))}
          <Pill tone={hasEssentialSurvey(tooth.survey) ? 'green' : 'amber'}>{hasEssentialSurvey(tooth.survey) ? 'Delineamento essencial preenchido' : 'Dados essenciais pendentes'}</Pill>
        </div>
      )}

      {step >= 5 && (
        <div className="mt-5 space-y-3">
          <h3 className="font-semibold">Retentores candidatos</h3>
          {retainerCandidates.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              onClick={() => updateTooth((draft) => {
                draft.directRetainer = {
                  candidate: candidate.id,
                  selected: candidate.id,
                  status: candidate.compatibility,
                  rationale: candidate.rationale,
                  conflicts: candidate.conflicts,
                };
              })}
              className={classNames('w-full rounded-xl border p-3 text-left text-sm transition hover:border-[#0066cc]/50', tooth.directRetainer.selected === candidate.id ? 'border-[#0066cc] bg-[#eaf4ff]' : 'border-black/10 bg-white')}
            >
              <div className="flex items-center justify-between gap-3">
                <strong>{candidate.name}</strong>
                <Pill tone={candidate.compatibility === 'compatible' ? 'green' : candidate.compatibility === 'incompatible' ? 'red' : 'amber'}>{candidate.compatibility}</Pill>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">{candidate.rationale[0]}</p>
              {candidate.conflicts.map((conflict) => <p key={conflict} className="mt-1 text-xs leading-5 text-rose-600">{conflict}</p>)}
            </button>
          ))}
        </div>
      )}

      {step >= 5 && context.indirectRetentionRequired && (
        <div className="mt-5">
          <h3 className="font-semibold">Retenção indireta</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {context.indirectCandidates.map((candidate) => (
              <button
                key={candidate.number}
                type="button"
                onClick={() => setProject((current) => {
                  const next = structuredClone(current);
                  const target = next.arches[selectedTooth.arch].teeth[candidate.number];
                  target.indirectRetainer.selected = !target.indirectRetainer.selected;
                  target.indirectRetainer.candidate = true;
                  target.indirectRetainer.distanceToFulcrum = candidate.distanceToFulcrum;
                  return next;
                })}
                className={classNames('rounded-full px-3 py-1 text-xs font-semibold', project.arches[selectedTooth.arch].teeth[candidate.number].indirectRetainer.selected ? 'bg-amber-400 text-amber-950' : 'bg-slate-100 text-slate-600')}
              >
                {candidate.number} · {candidate.distanceToFulcrum}px
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

function PprPlannerPage() {
  const [project, setProject] = useState(loadProject);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const classification = useMemo(() => classifyAll(project), [project]);
  const analysis = useMemo(() => analyzeAll(project), [project]);
  const components = useMemo(() => ({
    upper: suggestComponents(project, 'upper'),
    lower: suggestComponents(project, 'lower'),
  }), [project]);
  const validation = useMemo(() => validateDesign(project), [project]);
  const checklist = useMemo(() => validationChecklist(project), [project]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [project]);

  const setStep = (step) => setProject((current) => ({ ...current, step }));
  const reset = () => {
    const next = createProject();
    setProject(next);
    setSelectedTooth(null);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const updateConnector = (arch, connector) => {
    setProject((current) => {
      const next = structuredClone(current);
      next.arches[arch].connector = connector;
      return next;
    });
  };

  const exportJson = () => {
    const payload = {
      ...project,
      classification,
      biomechanics: analysis,
      components,
      validation,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'planejamento-ppr.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#f4f7f9] text-[#18242b]">
      <Helmet>
        <title>PPR Design Studio | Matheus Filgueiras</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="description" content="Assistente educacional de planejamento biomecânico de Prótese Parcial Removível." />
      </Helmet>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#15262d] px-4 py-3 text-white">
        <div className="mx-auto flex max-w-[112rem] flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">PPR Design Studio</p>
            <h1 className="text-xl font-semibold">Planejamento biomecânico educacional</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={reset} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15">Reiniciar</button>
            <button type="button" onClick={exportJson} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#15262d]">Exportar JSON</button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[112rem] gap-4 p-4 xl:grid-cols-[18rem_minmax(0,1fr)_24rem]">
        <aside className="space-y-4">
          <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0066cc]">Fluxo</p>
            <ol className="mt-4 space-y-2">
              {workflowSteps.map((step, index) => (
                <li key={step}>
                  <button
                    type="button"
                    onClick={() => setStep(index)}
                    className={classNames('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition', project.step === index ? 'bg-[#e8f3f3] text-[#07595b]' : 'text-slate-600 hover:bg-slate-50')}
                  >
                    <span className={classNames('grid h-7 w-7 place-items-center rounded-full text-xs font-bold', project.step === index ? 'bg-[#0b6f72] text-white' : 'bg-slate-100 text-slate-500')}>{index + 1}</span>
                    <span>{step}</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0066cc]">Princípios biomecânicos</p>
            <div className="mt-4 space-y-2">
              <PrincipleItem label="Suporte" state={analysis.upper.principles.suporte === 'atenção' || analysis.lower.principles.suporte === 'atenção' ? 'atenção' : analysis.upper.principles.suporte} />
              <PrincipleItem label="Retenção" state={analysis.upper.principles.retencao === 'atenção' || analysis.lower.principles.retencao === 'atenção' ? 'atenção' : analysis.upper.principles.retencao} />
              <PrincipleItem label="Estabilidade" state={analysis.upper.principles.estabilidade === 'atenção' || analysis.lower.principles.estabilidade === 'atenção' ? 'atenção' : analysis.upper.principles.estabilidade} />
              <PrincipleItem label="Controle de rotação" state={analysis.upper.principles.controleRotacional === 'atenção' || analysis.lower.principles.controleRotacional === 'atenção' ? 'atenção' : 'adequado'} />
              <PrincipleItem label="Retenção indireta" state={analysis.upper.principles.retencaoIndireta === 'atenção' || analysis.lower.principles.retencaoIndireta === 'atenção' ? 'atenção' : 'adequado'} />
            </div>
          </section>
        </aside>

        <section className="space-y-4">
          <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0066cc]">Etapa {project.step + 1}</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em]">{workflowSteps[project.step]}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                  {project.step === 0 && 'Defina a situação clínica de cada dente. A classificação considera a condição final planejada.'}
                  {project.step === 1 && 'Revise Kennedy/Applegate, área determinante, modificações e espaços ignorados.'}
                  {project.step === 2 && 'Classes I/II ativam controle rotacional, linha de fulcro e retenção indireta.'}
                  {project.step === 3 && 'Preencha delineamento antes de transformar candidatos em retentores definitivos.'}
                  {project.step === 4 && 'Apoios e planos-guia são sugeridos, editáveis e independentes no desenho.'}
                  {project.step === 5 && 'Retentores diretos e indiretos são avaliados com compatibilidade, justificativas e conflitos.'}
                  {project.step === 6 && 'Escolha conectores e veja bases apenas nos espaços que serão repostos.'}
                  {project.step === 7 && 'Validação final mostra bloqueios, warnings e checklist biomecânico.'}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(Math.max(0, project.step - 1))} disabled={project.step === 0} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40">Voltar</button>
                <button type="button" onClick={() => setStep(Math.min(workflowSteps.length - 1, project.step + 1))} className="rounded-full bg-[#0b6f72] px-5 py-2 text-sm font-semibold text-white">Avançar</button>
              </div>
            </div>
          </section>

          <ArchSvg project={project} arch="upper" classification={classification.upper} analysis={analysis.upper} components={components.upper} selectedTooth={selectedTooth} setSelectedTooth={setSelectedTooth} visibleStep={project.step} />
          <ArchSvg project={project} arch="lower" classification={classification.lower} analysis={analysis.lower} components={components.lower} selectedTooth={selectedTooth} setSelectedTooth={setSelectedTooth} visibleStep={project.step} />

          {project.step >= 6 && (
            <section className="grid gap-4 md:grid-cols-2">
              {Object.entries(arches).map(([arch, meta]) => (
                <div key={arch} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0066cc]">{meta.label}</p>
                  <h3 className="mt-1 font-semibold">Conector maior</h3>
                  <div className="mt-3 grid gap-2">
                    {meta.connectorOptions.map((connector) => (
                      <button key={connector} type="button" onClick={() => updateConnector(arch, connector)} className={classNames('rounded-xl border px-3 py-2 text-left text-sm font-semibold', project.arches[arch].connector === connector ? 'border-[#0b6f72] bg-[#e8f3f3] text-[#07595b]' : 'border-black/10 bg-white text-slate-700')}>
                        {connector}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">Quando os dados anatômicos forem insuficientes, as opções ficam editáveis sem recomendação automática definitiva.</p>
                </div>
              ))}
            </section>
          )}

          {project.step >= 7 && (
            <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0066cc]">Validação final</p>
                  <h2 className="mt-1 text-xl font-semibold">{validation.canFinish ? 'Caso pode ser concluído' : 'Há bloqueios pendentes'}</h2>
                </div>
                <Pill tone={validation.canFinish ? 'green' : 'red'}>{validation.canFinish ? 'Sem bloqueios' : 'Bloqueante'}</Pill>
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {checklist.map(([label, state]) => <PrincipleItem key={label} label={label} state={state} />)}
              </div>
              <div className="mt-5 space-y-2">
                {validation.issues.map((issue) => (
                  <div key={`${issue.code}-${issue.message}`} className={classNames('rounded-xl border p-3 text-sm', issue.level === 'blocking' ? 'border-rose-200 bg-rose-50 text-rose-800' : issue.level === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-blue-200 bg-blue-50 text-blue-800')}>
                    <strong>{issue.level}</strong> · {issue.message}
                  </div>
                ))}
                {!validation.issues.length && <p className="text-sm text-slate-500">Nenhum alerta registrado.</p>}
              </div>
            </section>
          )}
        </section>

        <Inspector project={project} setProject={setProject} selectedTooth={selectedTooth} analysis={analysis} step={project.step} />
      </section>
    </main>
  );
}

export default PprPlannerPage;
