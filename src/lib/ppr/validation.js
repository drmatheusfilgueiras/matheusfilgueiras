import { analyzeBiomechanics, evaluateDirectRetainer, hasEssentialSurvey, hasIBarConflict, suggestComponents } from './biomechanics.js';
import { arches, isReplacementStatus, toothArray } from './clinical-rules.js';
import { classifyKennedy } from './kennedy.js';

export function validateDesign(project) {
  const issues = [];

  Object.keys(arches).forEach((arch) => {
    const classification = classifyKennedy(project, arch);
    const analysis = analyzeBiomechanics(project, arch);
    const components = suggestComponents(project, arch);

    if (classification.label === 'Arco totalmente edêntulo') {
      issues.push({ level: 'blocking', code: 'fully_edentulous_arch', arch, message: `${arches[arch].label}: arco totalmente edêntulo não pertence ao escopo de PPR.`, relatedTeeth: [] });
    }

    const extractionTeeth = toothArray(project, arch).filter((tooth) => tooth.status === 'extract_replace').map((tooth) => tooth.number);
    const componentTeeth = [
      ...components.rests.map((item) => item.tooth),
      ...components.guidePlanes.map((item) => item.tooth),
      ...Object.values(project.arches[arch].teeth).filter((tooth) => tooth.directRetainer.selected).map((tooth) => tooth.number),
    ];
    extractionTeeth.forEach((number) => {
      if (componentTeeth.includes(number)) {
        issues.push({ level: 'blocking', code: 'component_on_planned_extraction', arch, message: `Há componente planejado sobre o dente ${number}, indicado para extração.`, relatedTeeth: [number] });
      }
    });

    if (classification.indirectRetentionRequired) {
      const selected = toothArray(project, arch).some((tooth) => tooth.indirectRetainer.selected);
      if (!selected) {
        issues.push({ level: 'blocking', code: 'missing_required_indirect_retention', arch, message: `${arches[arch].label}: Classe ${classification.class} exige retenção indireta definida.`, relatedTeeth: analysis.indirectCandidates.map((item) => item.number) });
      }
    }

    analysis.abutmentCandidates.forEach((number) => {
      const tooth = project.arches[arch].teeth[number];
      const candidates = evaluateDirectRetainer(tooth, analysis);
      if (tooth.directRetainer.selected && !hasEssentialSurvey(tooth.survey)) {
        issues.push({ level: 'blocking', code: 'final_retainer_without_required_survey_data', arch, message: `Retentor final no dente ${number} sem dados essenciais de delineamento.`, relatedTeeth: [number] });
      }
      if (tooth.directRetainer.selected === 'rpi' && hasIBarConflict(tooth.survey)) {
        issues.push({ level: 'blocking', code: 'ibar_with_reported_soft_tissue_or_access_conflict', arch, message: `RPI/I-bar selecionado no dente ${number} apesar de conflito anatômico informado.`, relatedTeeth: [number] });
      }
      if (!tooth.directRetainer.selected && candidates.some((candidate) => candidate.compatibility === 'insufficient_data')) {
        issues.push({ level: 'warning', code: 'retainer_needs_survey', arch, message: `Dente ${number}: sugestão de retentor ainda depende do delineamento.`, relatedTeeth: [number] });
      }
    });

    if (classification.edentulousAreas.length && !project.arches[arch].connector) {
      issues.push({ level: 'warning', code: 'no_major_connector', arch, message: `${arches[arch].label}: conector maior ainda não definido.`, relatedTeeth: [] });
    }

    components.bases.forEach((base) => {
      const invalid = base.teeth.filter((number) => !isReplacementStatus(project.arches[arch].teeth[number].status));
      if (invalid.length) {
        issues.push({ level: 'blocking', code: 'base_on_non_replaced_space', arch, message: `Base criada em espaço não indicado para reposição: ${invalid.join(', ')}.`, relatedTeeth: invalid });
      }
    });
  });

  return {
    canFinish: !issues.some((issue) => issue.level === 'blocking'),
    issues,
  };
}

export function validationChecklist(project) {
  const validation = validateDesign(project);
  const hasBlocking = validation.issues.some((issue) => issue.level === 'blocking');
  const hasWarning = validation.issues.some((issue) => issue.level === 'warning');
  return [
    ['Suporte', !hasBlocking ? 'adequado' : 'atenção'],
    ['Retenção', hasWarning || hasBlocking ? 'atenção' : 'adequado'],
    ['Estabilidade', hasWarning || hasBlocking ? 'atenção' : 'adequado'],
    ['Reciprocidade', hasWarning ? 'atenção' : 'adequado'],
    ['Rigidez', hasWarning ? 'atenção' : 'adequado'],
    ['Apoios', hasWarning || hasBlocking ? 'atenção' : 'adequado'],
    ['Planos-guia', hasWarning ? 'atenção' : 'adequado'],
    ['Retenção indireta', hasBlocking ? 'atenção' : 'adequado'],
    ['Conector maior', hasWarning ? 'atenção' : 'adequado'],
    ['Bases', hasBlocking ? 'atenção' : 'adequado'],
  ];
}
