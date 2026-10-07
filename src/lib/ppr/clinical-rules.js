export const workflowSteps = [
  'Situação clínica',
  'Kennedy + Applegate',
  'Análise biomecânica',
  'Delineamento',
  'Apoios e planos-guia',
  'Retentores diretos e indiretos',
  'Conectores e bases',
  'Validação e desenho final',
];

export const arches = {
  upper: {
    label: 'Maxila',
    teeth: [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
    connectorOptions: ['Cinta/barra palatina', 'Dupla cinta / anteroposterior', 'Placa palatina', 'Ferradura'],
  },
  lower: {
    label: 'Mandíbula',
    teeth: [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
    connectorOptions: ['Barra lingual', 'Placa lingual'],
  },
};

export const toothStatusOptions = [
  { value: 'present', label: 'Presente', short: 'Presente' },
  { value: 'missing_replace', label: 'Ausente e será reposto', short: 'Repor' },
  { value: 'extract_replace', label: 'Extração planejada e será reposta', short: 'Extrair + repor' },
  { value: 'missing_no_replace', label: 'Ausente e não será reposto', short: 'Não repor' },
  { value: 'excluded_abutment', label: 'Presente, excluído como possível pilar', short: 'Excluir pilar' },
];

export const replaceStatuses = new Set(['missing_replace', 'extract_replace']);
export const presentStatuses = new Set(['present', 'excluded_abutment']);

export const defaultSurvey = {
  pathOfInsertion: 'não informado',
  guidePlane: 'não informado',
  retentiveSurface: 'não informado',
  undercutLocation: 'não informado',
  undercutDepth: 'não informado',
  heightOfContour: 'não informado',
  softTissueUndercut: 'não informado',
  vestibularAccess: 'não informado',
  frenumInterference: 'não informado',
  periodontalCondition: 'não informado',
  mobility: 'não informado',
  inclination: 'não informado',
  estheticDemand: 'não informado',
};

export function createTooth(arch, number, index) {
  return {
    arch,
    number,
    index,
    status: 'present',
    isAbutmentCandidate: false,
    isConfirmedAbutment: false,
    rest: { enabled: false, type: '', position: '', rationale: '', manualOverride: false, overrideJustification: '' },
    guidePlane: { enabled: false, surface: '', confirmed: false, manualOverride: false },
    survey: { ...defaultSurvey },
    directRetainer: { candidate: '', selected: '', status: 'insufficient_data', rationale: [], conflicts: [] },
    indirectRetainer: { candidate: false, selected: false, distanceToFulcrum: null },
  };
}

export function createProject() {
  return {
    version: 2,
    step: 0,
    selectedArch: 'upper',
    selectedTooth: null,
    arches: Object.fromEntries(
      Object.entries(arches).map(([arch, meta]) => [
        arch,
        {
          connector: '',
          anatomy: {
            torus: 'não informado',
            floorOfMouthSpace: 'não informado',
            mobileTissues: 'não informado',
            palatalAnatomy: 'não informado',
            periodontalSupport: 'não informado',
          },
          teeth: Object.fromEntries(meta.teeth.map((number, index) => [number, createTooth(arch, number, index)])),
        },
      ]),
    ),
    manualOverrides: [],
    updatedAt: new Date().toISOString(),
  };
}

export function migrateProject(raw) {
  if (!raw) return createProject();
  if (raw.version === 2 && raw.arches?.upper?.teeth && raw.arches?.lower?.teeth) return raw;

  const next = createProject();
  Object.entries(raw.arches || {}).forEach(([arch, oldTeeth]) => {
    if (!next.arches[arch]) return;
    const list = Array.isArray(oldTeeth) ? oldTeeth : Object.values(oldTeeth.teeth || oldTeeth || {});
    list.forEach((oldTooth, index) => {
      const number = oldTooth.number || arches[arch].teeth[index];
      if (!number || !next.arches[arch].teeth[number]) return;
      next.arches[arch].teeth[number].status = oldTooth.missing || oldTooth.status === 'missing' ? 'missing_replace' : oldTooth.status || 'present';
    });
  });
  return next;
}

export function toothArray(project, arch) {
  return arches[arch].teeth.map((number) => project.arches[arch].teeth[number]);
}

export function isReplacementStatus(status) {
  return replaceStatuses.has(status);
}

export function isPresentForSupport(status) {
  return presentStatuses.has(status);
}

export function isThirdMolar(number) {
  return number % 10 === 8;
}

export function isSecondMolar(number) {
  return number % 10 === 7;
}
