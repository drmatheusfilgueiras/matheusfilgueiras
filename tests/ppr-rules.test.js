import assert from 'node:assert/strict';
import { test } from 'node:test';
import { analyzeBiomechanics, evaluateDirectRetainer, suggestComponents } from '../src/lib/ppr/biomechanics.js';
import { createProject } from '../src/lib/ppr/clinical-rules.js';
import { classifyKennedy } from '../src/lib/ppr/kennedy.js';
import { validateDesign } from '../src/lib/ppr/validation.js';

function mark(project, arch, numbers, status) {
  numbers.forEach((number) => {
    project.arches[arch].teeth[number].status = status;
  });
  return project;
}

function fillSurvey(tooth) {
  Object.assign(tooth.survey, {
    pathOfInsertion: 'favorável',
    guidePlane: 'presente',
    retentiveSurface: 'vestibular',
    undercutLocation: 'mesial',
    undercutDepth: '0,25 mm',
    heightOfContour: 'favorável',
    softTissueUndercut: 'não',
    vestibularAccess: 'adequado',
    frenumInterference: 'não',
    periodontalCondition: 'favorável',
    mobility: 'ausente',
    inclination: 'favorável',
    estheticDemand: 'moderada',
  });
}

test('Kennedy I bilateral distal', () => {
  const project = mark(createProject(), 'lower', [48, 47, 38, 37], 'missing_replace');
  const result = classifyKennedy(project, 'lower');
  assert.equal(result.class, 'I');
  assert.equal(result.supportType, 'tooth_tissue_supported');
  assert.equal(result.indirectRetentionRequired, true);
});

test('Kennedy II unilateral distal', () => {
  const project = mark(createProject(), 'lower', [38, 37], 'missing_replace');
  const result = classifyKennedy(project, 'lower');
  assert.equal(result.class, 'II');
  assert.equal(result.modificationCount, 0);
});

test('Kennedy III com uma modificação', () => {
  const project = mark(createProject(), 'upper', [16, 24], 'missing_replace');
  const result = classifyKennedy(project, 'upper');
  assert.equal(result.class, 'III');
  assert.equal(result.modificationCount, 1);
});

test('Kennedy IV cruza linha média e não possui modificações', () => {
  const project = mark(createProject(), 'upper', [11, 21], 'missing_replace');
  const result = classifyKennedy(project, 'upper');
  assert.equal(result.class, 'IV');
  assert.equal(result.modificationCount, 0);
});

test('missing_no_replace é ignorado na geração da base', () => {
  const project = mark(createProject(), 'upper', [16], 'missing_no_replace');
  const components = suggestComponents(project, 'upper');
  assert.equal(components.bases.length, 0);
});

test('extração planejada é considerada antes da classificação', () => {
  const project = mark(createProject(), 'upper', [16], 'extract_replace');
  const result = classifyKennedy(project, 'upper');
  assert.equal(result.class, 'III');
  assert.deepEqual(result.edentulousAreas[0].teeth, [16]);
});

test('Kennedy I/II exige retenção indireta', () => {
  const project = mark(createProject(), 'lower', [38, 37], 'missing_replace');
  const validation = validateDesign(project);
  assert.equal(validation.canFinish, false);
  assert.ok(validation.issues.some((issue) => issue.code === 'missing_required_indirect_retention'));
});

test('RPI incompatível quando há conflito anatômico para I-bar', () => {
  const project = mark(createProject(), 'lower', [38, 37], 'missing_replace');
  const analysis = analyzeBiomechanics(project, 'lower');
  const tooth = project.arches.lower.teeth[36];
  fillSurvey(tooth);
  tooth.survey.softTissueUndercut = 'sim';
  const candidates = evaluateDirectRetainer(tooth, analysis);
  assert.equal(candidates.find((candidate) => candidate.id === 'rpi').compatibility, 'incompatible');
});

test('RPA surge como alternativa ao RPI incompatível', () => {
  const project = mark(createProject(), 'lower', [38, 37], 'missing_replace');
  const analysis = analyzeBiomechanics(project, 'lower');
  const tooth = project.arches.lower.teeth[36];
  fillSurvey(tooth);
  tooth.survey.vestibularAccess = 'inadequado';
  const candidates = evaluateDirectRetainer(tooth, analysis);
  assert.equal(candidates.find((candidate) => candidate.id === 'rpa').compatibility, 'compatible');
});

test('componentes em dente posteriormente marcado para extração são bloqueados', () => {
  const project = createProject();
  const tooth = project.arches.upper.teeth[16];
  tooth.status = 'extract_replace';
  tooth.directRetainer.selected = 'akers';
  const validation = validateDesign(project);
  assert.ok(validation.issues.some((issue) => issue.code === 'component_on_planned_extraction'));
});
