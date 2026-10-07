import { arches, toothArray } from './clinical-rules.js';
import { classifyKennedy } from './kennedy.js';

export const toothCoordinates = {
  upper: {
    18: [112, 238], 17: [122, 194], 16: [146, 154], 15: [186, 120], 14: [238, 92], 13: [300, 72], 12: [336, 58], 11: [374, 52],
    21: [414, 52], 22: [452, 58], 23: [488, 72], 24: [550, 92], 25: [602, 120], 26: [642, 154], 27: [666, 194], 28: [676, 238],
  },
  lower: {
    48: [122, 82], 47: [132, 126], 46: [156, 166], 45: [196, 200], 44: [248, 228], 43: [310, 248], 42: [346, 262], 41: [384, 268],
    31: [424, 268], 32: [462, 262], 33: [498, 248], 34: [560, 228], 35: [612, 200], 36: [652, 166], 37: [676, 126], 38: [686, 82],
  },
};

function distancePointToLine(point, a, b) {
  const [px, py] = point;
  const [ax, ay] = a;
  const [bx, by] = b;
  const numerator = Math.abs((by - ay) * px - (bx - ax) * py + bx * ay - by * ax);
  const denominator = Math.hypot(by - ay, bx - ax) || 1;
  return Math.round(numerator / denominator);
}

export function terminalAbutmentsFor(classification) {
  const teeth = new Set();
  classification.edentulousAreas
    .filter((area) => area.terminal)
    .forEach((area) => {
      if (area.mesialLimit) teeth.add(area.mesialLimit);
      if (area.distalLimit) teeth.add(area.distalLimit);
    });
  return [...teeth];
}

export function boundedAbutmentsFor(classification) {
  const teeth = new Set();
  classification.edentulousAreas.forEach((area) => {
    if (area.mesialLimit) teeth.add(area.mesialLimit);
    if (area.distalLimit) teeth.add(area.distalLimit);
  });
  return [...teeth];
}

export function analyzeBiomechanics(project, arch) {
  const classification = classifyKennedy(project, arch);
  const terminalAbutments = terminalAbutmentsFor(classification);
  const abutmentCandidates = boundedAbutmentsFor(classification).filter((number) => {
    const tooth = project.arches[arch].teeth[number];
    return tooth && tooth.status !== 'excluded_abutment';
  });

  let fulcrumTeeth = classification.hasDistalExtension ? terminalAbutments.slice(0, 2) : [];
  if (classification.class === 'II' && fulcrumTeeth.length === 1) {
    const terminal = fulcrumTeeth[0];
    const terminalIndex = arches[arch].teeth.indexOf(terminal);
    const contralateral = toothArray(project, arch)
      .filter((tooth) => tooth.status !== 'missing_replace' && tooth.status !== 'extract_replace' && tooth.status !== 'missing_no_replace')
      .filter((tooth) => Math.sign(tooth.index - 7.5) !== Math.sign(terminalIndex - 7.5))
      .sort((a, b) => Math.abs(b.index - 7.5) - Math.abs(a.index - 7.5))[0];
    if (contralateral) fulcrumTeeth = [terminal, contralateral.number];
  }
  const fulcrumLine = fulcrumTeeth.length >= 2
    ? fulcrumTeeth.map((number) => ({ number, point: toothCoordinates[arch][number] }))
    : [];

  const indirectCandidates = classification.indirectRetentionRequired && fulcrumLine.length >= 2
    ? toothArray(project, arch)
      .filter((tooth) => !classification.edentulousAreas.some((area) => area.teeth.includes(tooth.number)))
      .filter((tooth) => !fulcrumTeeth.includes(tooth.number))
      .map((tooth) => ({
        number: tooth.number,
        distanceToFulcrum: distancePointToLine(toothCoordinates[arch][tooth.number], fulcrumLine[0].point, fulcrumLine[1].point),
      }))
      .sort((a, b) => b.distanceToFulcrum - a.distanceToFulcrum)
      .slice(0, 4)
    : [];

  return {
    arch,
    classification,
    supportType: classification.supportType,
    rotationControl: classification.class === 'I' || classification.class === 'II',
    indirectRetentionRequired: classification.indirectRetentionRequired,
    terminalAbutments,
    abutmentCandidates,
    fulcrumLine,
    indirectCandidates,
    principles: {
      suporte: classification.class ? 'adequado' : 'não avaliado',
      retencao: abutmentCandidates.length ? 'atenção' : 'não avaliado',
      estabilidade: classification.hasDistalExtension ? 'atenção' : classification.class ? 'adequado' : 'não avaliado',
      controleRotacional: classification.hasDistalExtension ? 'atenção' : 'adequado',
      retencaoIndireta: classification.indirectRetentionRequired ? 'atenção' : 'adequado',
    },
    rationale: classification.hasDistalExtension
      ? ['Kennedy I/II gera extremidade livre e exige controle rotacional.', 'A linha de fulcro representa o eixo em torno do qual a base distal pode tender a girar.']
      : ['Condição predominantemente dentossuportada; retenção indireta não foi ativada automaticamente.'],
  };
}

export function analyzeAll(project) {
  return Object.fromEntries(Object.keys(arches).map((arch) => [arch, analyzeBiomechanics(project, arch)]));
}

export function suggestComponents(project, arch) {
  const analysis = analyzeBiomechanics(project, arch);
  const rests = [];
  const guidePlanes = [];
  const bases = analysis.classification.edentulousAreas.map((area) => ({
    id: `base-${area.id}`,
    areaId: area.id,
    teeth: area.teeth,
    terminal: area.terminal,
    rationale: area.terminal
      ? 'Base em extremidade livre: participação de suporte mucoso deve ser considerada.'
      : 'Base em espaço dentossuportado planejado para reposição.',
  }));

  analysis.abutmentCandidates.forEach((number) => {
    const terminal = analysis.terminalAbutments.includes(number);
    rests.push({
      tooth: number,
      position: terminal && analysis.classification.hasDistalExtension ? 'mesial' : 'adjacente ao espaço',
      rationale: terminal && analysis.classification.hasDistalExtension
        ? `O dente ${number} limita uma extremidade livre; apoio mesial é sugerido para reduzir tendência de torque distal.`
        : `O dente ${number} delimita espaço protético dentossuportado; apoio adjacente é sugerido para suporte.`,
    });
    guidePlanes.push({
      tooth: number,
      surface: 'proximal ao espaço',
      rationale: `Plano-guia sugerido no dente ${number} para auxiliar trajetória de inserção e estabilidade.`,
    });
  });

  return {
    rests,
    guidePlanes,
    bases,
    indirectRetainers: analysis.indirectCandidates,
  };
}

export function hasIBarConflict(survey) {
  return survey.softTissueUndercut === 'sim' || survey.vestibularAccess === 'inadequado' || survey.frenumInterference === 'sim';
}

export function hasEssentialSurvey(survey) {
  return Boolean(
    survey.retentiveSurface !== 'não informado' &&
    survey.undercutLocation !== 'não informado' &&
    survey.undercutDepth !== 'não informado' &&
    survey.heightOfContour !== 'não informado' &&
    survey.vestibularAccess !== 'não informado' &&
    survey.softTissueUndercut !== 'não informado' &&
    survey.frenumInterference !== 'não informado',
  );
}

export function evaluateDirectRetainer(tooth, context) {
  const surveyComplete = hasEssentialSurvey(tooth.survey);
  const freeEndTerminal = context.terminalAbutments.includes(tooth.number) && context.classification.hasDistalExtension;
  const candidates = [];

  if (freeEndTerminal) {
    const conflict = hasIBarConflict(tooth.survey);
    candidates.push({
      id: 'rpi',
      name: 'RPI',
      compatibility: !surveyComplete ? 'insufficient_data' : conflict ? 'incompatible' : 'compatible',
      rationale: [
        'RPI = apoio mesial + placa proximal + I-bar.',
        `O dente ${tooth.number} foi identificado como pilar terminal candidato por limitar uma extremidade livre.`,
      ],
      conflicts: conflict ? ['Conflito informado para I-bar: tecido mole, acesso vestibular ou interferência anatômica.'] : [],
    });
    candidates.push({
      id: 'rpa',
      name: 'RPA',
      compatibility: !surveyComplete ? 'insufficient_data' : conflict ? 'compatible' : 'conditional',
      rationale: ['RPA = apoio + placa proximal + braço circunferencial/Akers modificado.', 'Alternativa considerada quando I-bar é incompatível ou exige revisão.'],
      conflicts: [],
    });
  } else {
    candidates.push({
      id: 'akers',
      name: 'Circunferencial / Akers',
      compatibility: !surveyComplete ? 'insufficient_data' : 'compatible',
      rationale: [`O dente ${tooth.number} está em condição dentossuportada ou não terminal; Akers pode ser candidato comum quando delineamento é compatível.`],
      conflicts: [],
    });
  }

  return candidates;
}
