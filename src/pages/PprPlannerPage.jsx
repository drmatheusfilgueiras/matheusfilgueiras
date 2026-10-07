import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import {
  AlertTriangle,
  Check,
  ChevronRight,
  CircleHelp,
  Eye,
  EyeOff,
  FileText,
  GitBranch,
  Layers3,
  RotateCcw,
  Sparkles,
  Stethoscope,
} from 'lucide-react';

const STORAGE_KEY = 'matheus_ppr_planner_case_v1';

const STEPS = [
  'Dentição',
  'Classificação',
  'Análise biomecânica',
  'Pilares',
  'Apoios',
  'Delineamento',
  'Retentores diretos',
  'Estabilidade',
  'Retenção indireta',
  'Conector maior',
  'Bases',
  'Revisão',
  'Finalização',
];

const ARCHES = {
  upper: {
    label: 'Superior',
    short: 'SUP',
    teeth: [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
    connectorOptions: ['Faixa palatina', 'Faixa palatina anteroposterior', 'Placa palatina', 'Conector em ferradura'],
  },
  lower: {
    label: 'Inferior',
    short: 'INF',
    teeth: [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
    connectorOptions: ['Barra lingual', 'Placa lingual', 'Barra sublingual', 'Barra labial'],
  },
};

const toothStates = {
  present: { label: 'Presente', className: 'border-slate-200 bg-white text-slate-900' },
  missing: { label: 'Ausente', className: 'border-slate-200 bg-white/70 text-slate-400 opacity-55 grayscale' },
  planned: { label: 'Extração planejada', className: 'border-amber-400 bg-amber-50/80 text-amber-800 shadow-amber-200/60' },
};

const defaultLayers = {
  teeth: true,
  spaces: true,
  bases: true,
  rests: true,
  retainers: true,
  connectors: true,
  fulcrum: true,
};

function makeArchState(type) {
  const teeth = Object.fromEntries(ARCHES[type].teeth.map((number) => [number, { status: 'present' }]));

  return {
    status: 'not_started',
    step: 0,
    teeth,
    abutments: {},
    rests: {},
    survey: {},
    retainers: {},
    indirectRetainers: [],
    majorConnector: '',
    layers: { ...defaultLayers },
    finalized: false,
  };
}

function makeCase() {
  return {
    id: `ppr-${Date.now()}`,
    name: 'Caso teste',
    updatedAt: new Date().toISOString(),
    activeArch: 'upper',
    upper: makeArchState('upper'),
    lower: makeArchState('lower'),
  };
}

function classNames(...items) {
  return items.filter(Boolean).join(' ');
}

function effectiveStatus(tooth) {
  return tooth?.status === 'missing' || tooth?.status === 'planned' ? 'missing' : 'present';
}

function visualStatus(tooth) {
  return tooth?.status === 'missing' || tooth?.status === 'planned' ? tooth.status : 'present';
}

function findSpaces(archType, arch) {
  const teeth = ARCHES[archType].teeth;
  const spaces = [];
  let current = [];

  teeth.forEach((number, index) => {
    if (effectiveStatus(arch.teeth[number]) === 'missing') {
      current.push({ number, index });
      return;
    }

    if (current.length) {
      spaces.push(current);
      current = [];
    }
  });

  if (current.length) spaces.push(current);

  return spaces.map((items, index) => {
    const first = items[0].index;
    const last = items[items.length - 1].index;
    const mesialLimit = teeth[first - 1] || null;
    const distalLimit = teeth[last + 1] || null;
    const crossesMidline = first <= 7 && last >= 8;
    const terminal = first === 0 || last === teeth.length - 1;
    const side = first <= 7 && last <= 7 ? 'right' : first >= 8 && last >= 8 ? 'left' : 'anterior';

    return {
      id: `space-${index + 1}`,
      index,
      teeth: items.map((item) => item.number),
      first,
      last,
      mesialLimit,
      distalLimit,
      crossesMidline,
      terminal,
      side,
      support: terminal ? 'dentomucossuportado / extremidade livre' : 'dentossuportado',
      extension: items.length,
    };
  });
}

function kennedyClassification(spaces) {
  if (!spaces.length) {
    return {
      label: 'Sem áreas edêntulas',
      className: 'Dentição completa',
      modifications: 0,
      determiningSpaceId: null,
      explanation: 'Nenhum espaço protético foi identificado nesta arcada.',
    };
  }

  const anteriorCrossing = spaces.filter((space) => space.crossesMidline && !space.terminal);
  if (spaces.length === 1 && anteriorCrossing.length === 1) {
    return {
      label: 'Classe IV de Kennedy',
      className: 'Classe IV',
      modifications: 0,
      determiningSpaceId: spaces[0].id,
      explanation: 'Foi identificada uma área edêntula anterior única atravessando a linha média.',
    };
  }

  const terminalSpaces = spaces.filter((space) => space.terminal);
  const hasRightTerminal = terminalSpaces.some((space) => space.side === 'right');
  const hasLeftTerminal = terminalSpaces.some((space) => space.side === 'left');

  if (hasRightTerminal && hasLeftTerminal) {
    const determining = terminalSpaces.find((space) => space.side === 'right') || terminalSpaces[0];
    const modifications = Math.max(0, spaces.length - terminalSpaces.length);
    return {
      label: `Classe I de Kennedy${modifications ? ` — modificação ${modifications}` : ''}`,
      className: 'Classe I',
      modifications,
      determiningSpaceId: determining.id,
      explanation: 'Foram identificadas extremidades livres posteriores bilaterais.',
    };
  }

  if (terminalSpaces.length) {
    const determining = terminalSpaces[0];
    const modifications = Math.max(0, spaces.length - 1);
    return {
      label: `Classe II de Kennedy${modifications ? ` — modificação ${modifications}` : ''}`,
      className: 'Classe II',
      modifications,
      determiningSpaceId: determining.id,
      explanation: modifications
        ? 'Foi identificada uma extremidade livre unilateral associada a área edêntula adicional.'
        : 'Foi identificada uma extremidade livre posterior unilateral.',
    };
  }

  const determining = spaces.reduce((selected, space) => (space.first < selected.first ? space : selected), spaces[0]);
  const modifications = Math.max(0, spaces.length - 1);
  return {
    label: `Classe III de Kennedy${modifications ? ` — modificação ${modifications}` : ''}`,
    className: 'Classe III',
    modifications,
    determiningSpaceId: determining.id,
    explanation: 'As áreas edêntulas estão limitadas por dentes naturais anterior e posteriormente.',
  };
}

function suggestedAbutments(spaces) {
  const abutments = new Set();
  spaces.forEach((space) => {
    if (space.mesialLimit) abutments.add(space.mesialLimit);
    if (space.distalLimit) abutments.add(space.distalLimit);
  });
  return [...abutments];
}

function defaultRestFor(space, tooth) {
  if (!space.terminal) return 'oclusal';
  if (space.mesialLimit === tooth || space.distalLimit === tooth) return 'oclusal mesial';
  return 'oclusal';
}

function restOptionsFor(tooth) {
  const lastDigit = tooth % 10;
  if ([1, 2, 3].includes(lastDigit)) return ['cingular', 'incisal'];
  return ['oclusal mesial', 'oclusal distal', 'oclusal'];
}

function derivePlanning(archType, arch) {
  const spaces = findSpaces(archType, arch);
  const kennedy = kennedyClassification(spaces);
  const abutmentNumbers = suggestedAbutments(spaces);
  const hasExtension = spaces.some((space) => space.terminal);
  const fulcrumCandidates = spaces
    .filter((space) => space.terminal)
    .flatMap((space) => [space.mesialLimit, space.distalLimit])
    .filter(Boolean);

  return {
    spaces,
    kennedy,
    abutmentNumbers,
    hasExtension,
    fulcrumCandidates: [...new Set(fulcrumCandidates)],
    supportType: hasExtension ? 'Com extremidade livre' : spaces.length ? 'Dentossuportado' : 'Sem espaço protético',
  };
}

function defaultConnector(archType, planning) {
  if (archType === 'upper') {
    if (planning.hasExtension || planning.spaces.length > 1) return 'Placa palatina';
    return 'Faixa palatina';
  }

  if (planning.hasExtension || planning.abutmentNumbers.length > 4) return 'Placa lingual';
  return 'Barra lingual';
}

function retainerScore({ planning, rest, survey = {}, tooth }) {
  const isAnterior = [1, 2, 3].includes(tooth % 10);
  const extension = planning.hasExtension;
  const undercut = survey.undercut || 'vestibular';
  const vestibule = survey.vestibule || 'adequado';
  const tissue = survey.tissueInterference || 'não';
  const esthetic = survey.esthetic || 'moderada';

  const options = [
    {
      name: 'RPI',
      score: 0,
      reasons: ['Sistema retentor liberador de tensão.'],
      check: extension && rest === 'oclusal mesial' && undercut === 'vestibular' && vestibule === 'adequado' && tissue === 'não',
      warning: tissue === 'sim' || vestibule === 'reduzido',
    },
    {
      name: 'RPA',
      score: 0,
      reasons: ['Alternativa quando a abordagem gengival é desfavorável.'],
      check: extension && rest === 'oclusal mesial',
      warning: esthetic === 'alta',
    },
    {
      name: 'Circunferencial / Aker',
      score: 0,
      reasons: ['Compatível com espaços dentossuportados e pilares com boa reciprocidade.'],
      check: !extension && !isAnterior,
      warning: extension,
    },
    {
      name: 'Fio forjado',
      score: 0,
      reasons: ['Pode ser útil quando se deseja maior flexibilidade.'],
      check: survey.periodontal === 'reduzida',
      warning: false,
    },
    {
      name: 'I-bar',
      score: 0,
      reasons: ['Requer trajeto gengival favorável e profundidade vestibular adequada.'],
      check: extension && undercut === 'vestibular' && vestibule === 'adequado' && tissue === 'não',
      warning: tissue === 'sim',
    },
    {
      name: 'T modificado',
      score: 0,
      reasons: ['Pode ser considerado em áreas retentivas específicas com ressalvas estéticas.'],
      check: undercut === 'vestibular',
      warning: esthetic === 'alta',
    },
    {
      name: 'Ring clasp',
      score: 0,
      reasons: ['Indicado apenas em situações anatômicas específicas e exige reciprocidade cuidadosa.'],
      check: undercut === 'lingual/palatina',
      warning: true,
    },
    {
      name: 'Hairpin',
      score: 0,
      reasons: ['Opção possível, porém geralmente com maior ressalva estética e biomecânica.'],
      check: undercut === 'distal',
      warning: true,
    },
  ];

  return options
    .map((option) => {
      let score = option.check ? 3 : 1;
      if (option.warning) score -= 1;
      if (isAnterior && ['Circunferencial / Aker', 'Ring clasp', 'Hairpin'].includes(option.name)) score -= 1;

      const category = score >= 3 ? 'Recomendado' : score === 2 ? 'Compatível' : score === 1 ? 'Possível com ressalvas' : 'Não recomendado';
      return {
        ...option,
        score,
        category,
      };
    })
    .sort((a, b) => b.score - a.score);
}

function auditArch(archType, arch, planning) {
  const warnings = [];

  if (!planning.spaces.length) {
    warnings.push({ level: 'sugestão', title: 'Sem espaço protético', text: 'A arcada está completa ou sem áreas selecionadas para reabilitação.' });
    return warnings;
  }

  if (!planning.abutmentNumbers.length) {
    warnings.push({ level: 'erro', title: 'Pilares ausentes', text: 'Não há dentes pilares identificados junto aos espaços protéticos.' });
  }

  planning.abutmentNumbers.forEach((tooth) => {
    if (!arch.rests[tooth]) {
      warnings.push({ level: 'atenção', title: `Apoio não definido no ${tooth}`, text: 'Todo pilar principal deve ter apoio planejado.' });
    }
    if (!arch.retainers[tooth]) {
      warnings.push({ level: 'sugestão', title: `Retentor não definido no ${tooth}`, text: 'Avalie se este pilar precisa de retenção direta ou reciprocidade.' });
    }
  });

  if (planning.hasExtension && !arch.indirectRetainers.length) {
    warnings.push({ level: 'atenção', title: 'Retenção indireta pendente', text: 'Extremidade livre detectada. Avalie retenção indireta distante da linha de fulcro.' });
  }

  if (!arch.majorConnector) {
    warnings.push({ level: 'atenção', title: 'Conector maior não selecionado', text: `Sugestão inicial: ${defaultConnector(archType, planning)}.` });
  }

  return warnings;
}

function progressFor(arch) {
  if (arch.finalized) return 100;
  return Math.min(96, Math.round(((arch.step + 1) / STEPS.length) * 100));
}

function statusLabel(arch) {
  if (arch.finalized) return 'Concluída';
  if (arch.status === 'not_started') return 'Não iniciada';
  return `Em andamento ${progressFor(arch)}%`;
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

function toothScale(number, archType) {
  const digit = number % 10;
  if ([1, 2].includes(digit)) return archType === 'lower' ? 0.72 : 0.82;
  if (digit === 3) return archType === 'lower' ? 0.86 : 0.94;
  if ([4, 5].includes(digit)) return archType === 'lower' ? 0.92 : 1;
  return archType === 'lower' ? 1.05 : 1.12;
}

function ArchDiagram({ archType, arch, planning, selectedTooth, onToothClick }) {
  const isUpper = archType === 'upper';
  const teeth = ARCHES[archType].teeth;
  const selectedKey = selectedTooth ? `${selectedTooth.archType}-${selectedTooth.number}` : '';

  const positionFor = (index) => {
    const t = index / (teeth.length - 1);
    const dx = (t - 0.5) * 2;
    const curve = Math.sqrt(Math.max(0, 1 - dx * dx));
    return {
      x: 15 + t * 70,
      y: isUpper ? 72 - curve * 49 : 28 + curve * 49,
      rotation: dx * (isUpper ? 27 : -27),
    };
  };

  return (
    <div className="relative mx-auto h-[clamp(11rem,21vw,17rem)] w-full max-w-4xl">
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path
          d={isUpper ? 'M 15 72 Q 50 18 85 72' : 'M 15 28 Q 50 82 85 28'}
          fill="none"
          stroke="rgba(0, 102, 204, 0.13)"
          strokeWidth="1.2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {arch.layers.connectors && arch.majorConnector && (
          <path
            d={isUpper ? 'M 27 61 Q 50 42 73 61' : 'M 27 39 Q 50 58 73 39'}
            fill="none"
            stroke="rgba(15, 23, 42, 0.55)"
            strokeWidth="4"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {arch.layers.fulcrum && planning.hasExtension && planning.fulcrumCandidates.length >= 2 && (
          <path
            d={isUpper ? 'M 18 62 L 82 46' : 'M 18 38 L 82 54'}
            fill="none"
            stroke="rgba(244, 63, 94, 0.55)"
            strokeDasharray="4 4"
            strokeWidth="1.8"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {arch.layers.spaces && planning.spaces.map((space) => {
        const first = positionFor(space.first);
        const last = positionFor(space.last);
        const midX = (first.x + last.x) / 2;
        const midY = (first.y + last.y) / 2;
        return (
          <span
            key={space.id}
            className={classNames(
              'pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed',
              space.id === planning.kennedy.determiningSpaceId ? 'border-[#0066cc] bg-[#0066cc]/10' : 'border-amber-400 bg-amber-100/60',
            )}
            style={{
              left: `${midX}%`,
              top: `${midY}%`,
              width: `clamp(3.2rem, ${Math.max(8, (space.last - space.first + 1) * 5.3)}vw, 13rem)`,
              height: 'clamp(2.4rem, 4.8vw, 4.4rem)',
            }}
          />
        );
      })}

      {teeth.map((number, index) => {
        const position = positionFor(index);
        const status = visualStatus(arch.teeth[number]);
        const isAbutment = planning.abutmentNumbers.includes(number);
        const hasRest = Boolean(arch.rests[number]);
        const hasRetainer = Boolean(arch.retainers[number]);
        const indirect = arch.indirectRetainers.includes(number);
        const toothKey = `${archType}-${number}`;
        const scale = toothScale(number, archType);

        return (
          <button
            key={number}
            type="button"
            onClick={() => onToothClick(archType, number)}
            className={classNames(
              'group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[1.15rem] border text-sm font-bold shadow-sm transition hover:border-[#0066cc] hover:shadow-md',
              toothStates[status].className,
              selectedKey === toothKey && 'ring-4 ring-[#0066cc]/20',
            )}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: 'clamp(2.25rem, 3.3vw, 3.2rem)',
              height: 'clamp(3.25rem, 4.8vw, 4.65rem)',
            }}
            aria-label={`Dente ${number} - ${toothStates[status].label}`}
            title={`Dente ${number} - ${toothStates[status].label}`}
          >
            {arch.layers.teeth && (
              <span
                className="flex h-[82%] w-full items-center justify-center"
                style={{ transform: `rotate(${position.rotation}deg) scale(${scale})` }}
              >
                <img
                  src={`/assets/teeth/${number}.png`}
                  alt={`Dente ${number}`}
                  className="max-h-full max-w-full object-contain drop-shadow-sm"
                  draggable="false"
                />
              </span>
            )}
            <span className="absolute -bottom-4 rounded-full bg-white/80 px-1.5 py-0.5 text-[0.58rem] font-semibold leading-none text-slate-400 opacity-75 transition group-hover:text-[#0066cc] group-hover:opacity-100">
              {number}
            </span>
            {isAbutment && <span className="absolute -top-2 rounded-full bg-[#0066cc] px-2 py-0.5 text-[0.58rem] text-white">Pilar</span>}
            {arch.layers.rests && hasRest && <span className="absolute bottom-1 left-1 h-2.5 w-2.5 rounded-full bg-emerald-500" title="Apoio" />}
            {arch.layers.retainers && hasRetainer && <span className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full bg-violet-500" title="Retentor" />}
            {status === 'planned' && <span className="absolute left-1/2 top-1 h-1.5 w-8 -translate-x-1/2 rounded-full bg-amber-400/90" title="Extração planejada" />}
            {indirect && <span className="absolute -bottom-2 rounded-full bg-amber-400 px-1.5 py-0.5 text-[0.55rem] font-bold text-amber-950">RI</span>}
          </button>
        );
      })}

      <span className={classNames('absolute left-1/2 -translate-x-1/2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400', isUpper ? 'top-0' : 'bottom-0')}>
        {ARCHES[archType].label}
      </span>
    </div>
  );
}

function PprPlannerPage() {
  const [caseData, setCaseData] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? { ...makeCase(), ...JSON.parse(saved) } : makeCase();
    } catch {
      return makeCase();
    }
  });
  const [saveState, setSaveState] = useState('Salvo ✓');
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [showCaseSummary, setShowCaseSummary] = useState(false);

  const planningByArch = useMemo(() => ({
    upper: derivePlanning('upper', caseData.upper),
    lower: derivePlanning('lower', caseData.lower),
  }), [caseData.upper, caseData.lower]);
  const focusArchType = selectedTooth?.archType || caseData.activeArch || 'upper';
  const arch = caseData[focusArchType];
  const archMeta = ARCHES[focusArchType];
  const planning = planningByArch[focusArchType];
  const warnings = useMemo(() => auditArch(focusArchType, arch, planning), [arch, focusArchType, planning]);
  const selectedNumber = selectedTooth?.number || null;
  const selectedSurvey = selectedNumber ? arch.survey[selectedNumber] || {} : {};
  const selectedRest = selectedNumber ? arch.rests[selectedNumber] || '' : '';
  const retainerOptions = selectedNumber
    ? retainerScore({ planning, rest: selectedRest, survey: selectedSurvey, tooth: Number(selectedNumber) })
    : [];

  useEffect(() => {
    setSaveState('Salvando...');
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...caseData, updatedAt: new Date().toISOString() }));
      setSaveState('Salvo ✓');
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [caseData]);

  const updateArch = (targetArch, updater) => {
    setCaseData((current) => {
      const nextArch = JSON.parse(JSON.stringify(current[targetArch]));
      updater(nextArch);
      nextArch.status = nextArch.status === 'not_started' ? 'in_progress' : nextArch.status;
      return {
        ...current,
        activeArch: targetArch,
        [targetArch]: nextArch,
      };
    });
  };

  const cycleTooth = (targetArch, number) => {
    setSelectedTooth({ archType: targetArch, number });
    updateArch(targetArch, (draft) => {
      const current = visualStatus(draft.teeth[number]);
      const next = current === 'present' ? 'missing' : current === 'missing' ? 'planned' : 'present';
      draft.teeth[number] = { status: next };
      draft.step = Math.max(draft.step, 1);
      draft.finalized = false;
    });
  };

  const setAllTeeth = (targetArch, status) => {
    updateArch(targetArch, (draft) => {
      ARCHES[targetArch].teeth.forEach((number) => {
        draft.teeth[number] = { status };
      });
      draft.step = status === 'present' ? 0 : draft.step;
      draft.finalized = false;
    });
  };

  const setStep = (index) => {
    updateArch(focusArchType, (draft) => {
      draft.step = index;
    });
  };

  const setRest = (tooth, rest) => {
    updateArch(focusArchType, (draft) => {
      draft.rests[tooth] = rest;
      draft.step = Math.max(draft.step, 5);
    });
  };

  const setSurvey = (tooth, key, value) => {
    updateArch(focusArchType, (draft) => {
      draft.survey[tooth] = { ...(draft.survey[tooth] || {}), [key]: value };
      draft.step = Math.max(draft.step, 6);
    });
  };

  const setRetainer = (tooth, retainer) => {
    updateArch(focusArchType, (draft) => {
      draft.retainers[tooth] = retainer;
      draft.step = Math.max(draft.step, 8);
    });
  };

  const toggleIndirect = (tooth) => {
    updateArch(focusArchType, (draft) => {
      draft.indirectRetainers = draft.indirectRetainers.includes(tooth)
        ? draft.indirectRetainers.filter((item) => item !== tooth)
        : [...draft.indirectRetainers, tooth];
      draft.step = Math.max(draft.step, 9);
    });
  };

  const setConnector = (connector) => {
    updateArch(focusArchType, (draft) => {
      draft.majorConnector = connector;
      draft.step = Math.max(draft.step, 10);
    });
  };

  const toggleLayer = (layer) => {
    updateArch(focusArchType, (draft) => {
      draft.layers[layer] = !draft.layers[layer];
    });
  };

  const finalizeArch = () => {
    updateArch(focusArchType, (draft) => {
      draft.finalized = true;
      draft.status = 'finalized';
      draft.step = STEPS.length - 1;
    });
  };

  const resetCase = () => {
    const next = makeCase();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setCaseData(next);
    setSelectedTooth(null);
  };

  return (
    <main className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f]">
      <Helmet>
        <title>Planejador de PPR | Matheus Filgueiras</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="description" content="Protótipo de planejamento visual de Prótese Parcial Removível." />
      </Helmet>

      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/85 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[96rem] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0066cc]">Planejador de PPR</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Planejamento clínico estruturado</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(ARCHES).map(([key, item]) => (
              <div
                key={key}
                className={classNames(
                  'rounded-full border px-4 py-2 text-left text-sm font-semibold',
                  focusArchType === key ? 'border-[#0066cc] bg-[#0066cc] text-white' : 'border-black/10 bg-white text-slate-700',
                )}
              >
                <span className="block text-[0.66rem] uppercase tracking-[0.18em] opacity-70">{item.label}</span>
                {statusLabel(caseData[key])}
              </div>
            ))}
            <Pill tone="green">{saveState}</Pill>
            <button type="button" onClick={resetCase} className="inline-flex h-10 items-center gap-2 rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <RotateCcw className="h-4 w-4" />
              Restaurar caso
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[96rem] gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)_23rem] lg:px-8">
        <aside className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Fluxo</h2>
            <Pill tone="blue">{archMeta.short}</Pill>
          </div>
          <div className="space-y-1">
            {STEPS.map((step, index) => {
              const done = index < arch.step || arch.finalized;
              const active = index === arch.step;
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => setStep(index)}
                  className={classNames(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition',
                    active ? 'bg-[#eaf4ff] text-[#0066cc]' : 'text-slate-600 hover:bg-slate-50',
                  )}
                >
                  <span className={classNames('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold', done ? 'bg-emerald-100 text-emerald-700' : active ? 'bg-[#0066cc] text-white' : 'bg-slate-100 text-slate-500')}>
                    {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span>{step}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="min-w-0 rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0066cc]">Odontograma frontal</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">Planejamento simultâneo das arcadas</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill tone="blue">Superior: {planningByArch.upper.kennedy.label}</Pill>
                <Pill tone="green">Inferior: {planningByArch.lower.kennedy.label}</Pill>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[23rem]">
              {Object.entries(ARCHES).map(([key, meta]) => (
                <div key={key} className="rounded-2xl border border-black/10 bg-[#f8fafc] p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{meta.label}</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setAllTeeth(key, 'present')} className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Todos presentes</button>
                    <button type="button" onClick={() => setAllTeeth(key, 'missing')} className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Marcar ausentes</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#f5f7fb] px-3 py-8 sm:px-5 lg:px-8">
            <div className="relative mx-auto flex max-w-5xl flex-col gap-2">
              <ArchDiagram
                archType="upper"
                arch={caseData.upper}
                planning={planningByArch.upper}
                selectedTooth={selectedTooth}
                onToothClick={cycleTooth}
              />
              <ArchDiagram
                archType="lower"
                arch={caseData.lower}
                planning={planningByArch.lower}
                selectedTooth={selectedTooth}
                onToothClick={cycleTooth}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(toothStates).map(([key, value]) => (
                <span key={key} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  <span className={classNames('h-3 w-3 rounded-full border', value.className)} />
                  {value.label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <InfoCard title="Espaços protéticos" icon={<GitBranch className="h-4 w-4" />}>
              {planning.spaces.length ? planning.spaces.map((space) => (
                <div key={space.id} className="rounded-xl border border-black/10 bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{space.teeth.join(', ')}</p>
                    <Pill tone={space.terminal ? 'amber' : 'blue'}>{space.terminal ? 'Extremidade livre' : 'Limitado'}</Pill>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Limites: {space.mesialLimit || 'sem'} / {space.distalLimit || 'sem'}</p>
                </div>
              )) : <p className="text-sm text-slate-500">Clique nos dentes para marcar ausências ou extrações planejadas.</p>}
            </InfoCard>

            <InfoCard title="Biomecânica" icon={<Stethoscope className="h-4 w-4" />}>
              <p className="text-sm leading-6 text-slate-600">{planning.supportType}</p>
              {planning.hasExtension && <p className="mt-2 text-sm leading-6 text-amber-700">Extremidade livre detectada. Avalie rotação da base, apoio mesial e retenção indireta.</p>}
            </InfoCard>

            <InfoCard title="Camadas" icon={<Layers3 className="h-4 w-4" />}>
              <div className="flex flex-wrap gap-2">
                {Object.keys(defaultLayers).map((layer) => (
                  <button key={layer} type="button" onClick={() => toggleLayer(layer)} className={classNames('inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold', arch.layers[layer] ? 'bg-[#eaf4ff] text-[#0066cc]' : 'bg-slate-100 text-slate-500')}>
                    {arch.layers[layer] ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {layer}
                  </button>
                ))}
              </div>
            </InfoCard>
          </div>
        </section>

        <aside className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Painel da etapa</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">{STEPS[arch.step]}</h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0066cc]">{archMeta.label}</p>
          </div>

          <div className="space-y-4">
            <InfoCard title="Dente selecionado" compact>
              {selectedNumber ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-semibold tracking-[-0.05em]">{selectedNumber}</p>
                    <Pill tone={planning.abutmentNumbers.includes(selectedNumber) ? 'blue' : 'slate'}>
                      {planning.abutmentNumbers.includes(selectedNumber) ? 'Pilar sugerido' : toothStates[visualStatus(arch.teeth[selectedNumber])].label}
                    </Pill>
                  </div>

                  {planning.abutmentNumbers.includes(selectedNumber) && (
                    <>
                      <label className="block text-sm font-semibold text-slate-700">
                        Apoio
                        <select value={arch.rests[selectedNumber] || defaultRestFor(planning.spaces[0] || {}, selectedNumber)} onChange={(event) => setRest(selectedNumber, event.target.value)} className="mt-2 h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#0066cc]">
                          {restOptionsFor(selectedNumber).map((rest) => <option key={rest} value={rest}>{rest}</option>)}
                        </select>
                      </label>

                      <SurveyField label="Área retentiva" value={selectedSurvey.undercut || 'vestibular'} onChange={(value) => setSurvey(selectedNumber, 'undercut', value)} options={['vestibular', 'lingual/palatina', 'mesial', 'distal']} />
                      <SurveyField label="Vestíbulo" value={selectedSurvey.vestibule || 'adequado'} onChange={(value) => setSurvey(selectedNumber, 'vestibule', value)} options={['adequado', 'reduzido']} />
                      <SurveyField label="Interferência tecidual" value={selectedSurvey.tissueInterference || 'não'} onChange={(value) => setSurvey(selectedNumber, 'tissueInterference', value)} options={['não', 'sim']} />

                      <div>
                        <p className="mb-2 text-sm font-semibold text-slate-700">Retentores compatíveis</p>
                        <div className="space-y-2">
                          {retainerOptions.slice(0, 4).map((retainer) => (
                            <button key={retainer.name} type="button" onClick={() => setRetainer(selectedNumber, retainer.name)} className={classNames('w-full rounded-xl border p-3 text-left transition hover:border-[#0066cc]/40', arch.retainers[selectedNumber] === retainer.name ? 'border-[#0066cc] bg-[#eaf4ff]' : 'border-black/10 bg-white')}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold">{retainer.name}</span>
                                <Pill tone={retainer.category === 'Recomendado' ? 'green' : retainer.category === 'Compatível' ? 'blue' : retainer.category === 'Possível com ressalvas' ? 'amber' : 'red'}>{retainer.category}</Pill>
                              </div>
                              <p className="mt-1 text-xs leading-5 text-slate-500">{retainer.reasons[0]}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-sm leading-6 text-slate-500">Selecione um dente na arcada para editar função, apoio, delineamento e retentor.</p>
              )}
            </InfoCard>

            {planning.hasExtension && (
              <InfoCard title="Retenção indireta" compact>
                <p className="mb-3 text-sm leading-6 text-slate-600">Sugestão: escolha um apoio distante da linha de fulcro.</p>
                <div className="flex flex-wrap gap-2">
                  {planning.abutmentNumbers.map((tooth) => (
                    <button key={tooth} type="button" onClick={() => toggleIndirect(tooth)} className={classNames('rounded-full px-3 py-1 text-sm font-semibold', arch.indirectRetainers.includes(tooth) ? 'bg-amber-400 text-amber-950' : 'bg-slate-100 text-slate-600')}>
                      {tooth}
                    </button>
                  ))}
                </div>
              </InfoCard>
            )}

            <InfoCard title="Conector maior" compact>
              <p className="mb-3 text-sm leading-6 text-slate-600">Sugestão inicial: {defaultConnector(focusArchType, planning)}.</p>
              <div className="space-y-2">
                {archMeta.connectorOptions.map((connector) => (
                  <button key={connector} type="button" onClick={() => setConnector(connector)} className={classNames('flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm font-semibold transition', arch.majorConnector === connector ? 'border-[#0066cc] bg-[#eaf4ff] text-[#0066cc]' : 'border-black/10 text-slate-700 hover:bg-slate-50')}>
                    {connector}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </InfoCard>

            <InfoCard title="Auditoria biomecânica" compact>
              <div className="space-y-2">
                {warnings.map((warning) => (
                  <div key={`${warning.title}-${warning.text}`} className="rounded-xl border border-black/10 bg-white p-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={classNames('h-4 w-4', warning.level === 'erro' ? 'text-rose-500' : warning.level === 'atenção' ? 'text-amber-500' : 'text-[#0066cc]')} />
                      <p className="text-sm font-semibold">{warning.title}</p>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{warning.text}</p>
                  </div>
                ))}
              </div>
            </InfoCard>

            <div className="grid gap-2">
              <button type="button" onClick={finalizeArch} className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-[#0066cc] px-5 text-sm font-semibold text-white hover:bg-[#0057ad]">
                <Check className="h-4 w-4" />
                Finalizar arcada
              </button>
              <button type="button" onClick={() => setShowCaseSummary((current) => !current)} className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <FileText className="h-4 w-4" />
                Resumo do caso
              </button>
            </div>
          </div>
        </aside>
      </section>

      {showCaseSummary && (
        <section className="mx-auto max-w-[96rem] px-4 pb-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#0066cc]" />
              <h2 className="text-xl font-semibold tracking-[-0.03em]">Resumo do caso</h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {Object.entries(ARCHES).map(([key, meta]) => {
                const item = caseData[key];
                const itemPlanning = derivePlanning(key, item);
                return (
                  <div key={key} className="rounded-2xl border border-black/10 bg-[#f8fafc] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold">{meta.label}</h3>
                      <Pill tone={item.finalized ? 'green' : 'blue'}>{statusLabel(item)}</Pill>
                    </div>
                    <dl className="mt-4 grid gap-2 text-sm">
                      <SummaryRow label="Classificação" value={itemPlanning.kennedy.label} />
                      <SummaryRow label="Pilares" value={itemPlanning.abutmentNumbers.join(', ') || '-'} />
                      <SummaryRow label="Apoios" value={Object.entries(item.rests).map(([tooth, rest]) => `${tooth}: ${rest}`).join('; ') || '-'} />
                      <SummaryRow label="Retentores" value={Object.entries(item.retainers).map(([tooth, retainer]) => `${tooth}: ${retainer}`).join('; ') || '-'} />
                      <SummaryRow label="Conector" value={item.majorConnector || '-'} />
                      <SummaryRow label="Bases" value={itemPlanning.spaces.map((space) => space.teeth.join('/')).join('; ') || '-'} />
                    </dl>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function InfoCard({ title, icon, children, compact = false }) {
  return (
    <div className={classNames('rounded-2xl border border-black/10 bg-[#f8fafc]', compact ? 'p-4' : 'p-4')}>
      <div className="mb-3 flex items-center gap-2">
        {icon || <CircleHelp className="h-4 w-4 text-[#0066cc]" />}
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-600">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SurveyField({ label, value, onChange, options }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#0066cc]">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-black/5 pt-2">
      <dt className="font-semibold text-slate-500">{label}</dt>
      <dd className="text-slate-900">{value}</dd>
    </div>
  );
}

export default PprPlannerPage;
