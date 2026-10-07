import { arches, isReplacementStatus, isSecondMolar, isThirdMolar, toothArray } from './clinical-rules.js';

function areaSide(first, last) {
  if (last < 8) return 'right';
  if (first > 7) return 'left';
  return 'anterior';
}

function crossesAnteriorMidline(first, last) {
  return first <= 7 && last >= 8;
}

function posteriorScore(area) {
  return Math.max(Math.abs(area.first - 7.5), Math.abs(area.last - 7.5));
}

export function findEdentulousAreas(project, arch) {
  const teeth = toothArray(project, arch);
  const ignoredSpaces = [];
  const areas = [];
  let current = [];

  const flush = () => {
    if (!current.length) return;
    const first = current[0].index;
    const last = current[current.length - 1].index;
    const area = {
      id: `${arch}-area-${areas.length + 1}`,
      arch,
      teeth: current.map((tooth) => tooth.number),
      first,
      last,
      mesialLimit: teeth[first - 1]?.number || null,
      distalLimit: teeth[last + 1]?.number || null,
      side: areaSide(first, last),
      terminal: first === 0 || last === teeth.length - 1,
      crossesMidline: crossesAnteriorMidline(first, last),
      status: 'included',
    };
    areas.push(area);
    current = [];
  };

  teeth.forEach((tooth) => {
    const ignoreByApplegate =
      tooth.status === 'missing_no_replace' ||
      ((isThirdMolar(tooth.number) || isSecondMolar(tooth.number)) && tooth.status === 'missing_no_replace');

    if (ignoreByApplegate) {
      flush();
      ignoredSpaces.push({
        id: `${arch}-ignored-${ignoredSpaces.length + 1}`,
        tooth: tooth.number,
        reason: isThirdMolar(tooth.number)
          ? 'Terceiro molar ausente sem reposição foi ignorado pela regra de Applegate.'
          : isSecondMolar(tooth.number)
            ? 'Segundo molar ausente sem indicação de reposição foi ignorado pela regra de Applegate.'
            : 'Espaço marcado como não será reposto foi ignorado no desenho da base.',
      });
      return;
    }

    if (isReplacementStatus(tooth.status)) {
      current.push(tooth);
      return;
    }

    flush();
  });

  flush();
  return { areas, ignoredSpaces };
}

export function classifyKennedy(project, arch) {
  const { areas, ignoredSpaces } = findEdentulousAreas(project, arch);
  const teeth = toothArray(project, arch);
  const remainingTeeth = teeth.filter((tooth) => !isReplacementStatus(tooth.status) && tooth.status !== 'missing_no_replace');
  const rationale = ['A classificação foi feita após considerar extrações planejadas e espaços indicados para reposição.'];

  if (!remainingTeeth.length) {
    return {
      arch,
      class: null,
      modificationCount: 0,
      label: 'Arco totalmente edêntulo',
      supportType: 'requires_review',
      edentulousAreas: areas,
      definingAreaId: null,
      ignoredSpaces,
      hasDistalExtension: false,
      indirectRetentionRequired: false,
      rationale: [...rationale, 'Arco totalmente edêntulo foge do escopo de PPR.'],
    };
  }

  if (!areas.length) {
    return {
      arch,
      class: null,
      modificationCount: 0,
      label: 'Sem áreas edêntulas a repor',
      supportType: 'tooth_supported',
      edentulousAreas: [],
      definingAreaId: null,
      ignoredSpaces,
      hasDistalExtension: false,
      indirectRetentionRequired: false,
      rationale: [...rationale, 'Nenhuma área edêntula planejada para reposição foi identificada.'],
    };
  }

  const singleAnteriorCrossing = areas.length === 1 && areas[0].crossesMidline && !areas[0].terminal;
  if (singleAnteriorCrossing) {
    return {
      arch,
      class: 'IV',
      modificationCount: 0,
      label: 'Kennedy Classe IV',
      supportType: 'tooth_supported',
      edentulousAreas: areas,
      definingAreaId: areas[0].id,
      ignoredSpaces,
      hasDistalExtension: false,
      indirectRetentionRequired: false,
      rationale: [...rationale, 'Área anterior única cruza a linha média. Classe IV não possui modificações.'],
    };
  }

  const terminalAreas = areas.filter((area) => area.terminal);
  const hasRightTerminal = terminalAreas.some((area) => area.side === 'right');
  const hasLeftTerminal = terminalAreas.some((area) => area.side === 'left');
  let kennedyClass = 'III';
  let definingArea = [...areas].sort((a, b) => posteriorScore(b) - posteriorScore(a))[0];

  if (hasRightTerminal && hasLeftTerminal) {
    kennedyClass = 'I';
    definingArea = terminalAreas.sort((a, b) => posteriorScore(b) - posteriorScore(a))[0];
    rationale.push('Extremidades livres posteriores bilaterais determinam Classe I.');
  } else if (terminalAreas.length) {
    kennedyClass = 'II';
    definingArea = terminalAreas.sort((a, b) => posteriorScore(b) - posteriorScore(a))[0];
    rationale.push('A área edêntula posterior unilateral mais distal determina Classe II.');
  } else {
    rationale.push('As áreas edêntulas são limitadas por dentes anterior e posteriormente, determinando Classe III.');
  }

  const modificationCount = kennedyClass === 'IV' ? 0 : areas.filter((area) => area.id !== definingArea.id).length;
  const supportType = kennedyClass === 'I' || kennedyClass === 'II' ? 'tooth_tissue_supported' : 'tooth_supported';

  return {
    arch,
    class: kennedyClass,
    modificationCount,
    label: `Kennedy Classe ${kennedyClass}${modificationCount ? ` — modificação ${modificationCount}` : ''}`,
    supportType,
    edentulousAreas: areas,
    definingAreaId: definingArea.id,
    ignoredSpaces,
    hasDistalExtension: kennedyClass === 'I' || kennedyClass === 'II',
    indirectRetentionRequired: kennedyClass === 'I' || kennedyClass === 'II',
    rationale,
  };
}

export function classifyAll(project) {
  return Object.fromEntries(Object.keys(arches).map((arch) => [arch, classifyKennedy(project, arch)]));
}
