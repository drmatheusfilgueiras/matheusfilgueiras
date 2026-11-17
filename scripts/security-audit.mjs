import { spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const KNOWN_UNPATCHED_ADVISORY = 'GHSA-fc5q-39xc-vjpf';
const args = ['audit', '--json', '--audit-level=low'];
const audit = spawnSync('npm', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });

if (audit.error) {
  console.error('Nao foi possivel iniciar npm audit:', audit.error.message);
  process.exit(1);
}

let report;
try {
  report = JSON.parse(audit.stdout || '');
} catch {
  console.error('npm audit nao retornou um relatorio JSON valido.');
  console.error((audit.stderr || audit.stdout || '').slice(0, 1000));
  process.exit(1);
}

if (report.error || !report.vulnerabilities || !report.metadata?.vulnerabilities) {
  console.error('Auditoria incompleta ou indisponivel:', JSON.stringify(report.error || report).slice(0, 1200));
  process.exit(1);
}

const vulnerabilities = Object.entries(report.vulnerabilities);
const advisories = vulnerabilities.flatMap(([pkg, info]) =>
  (info.via || [])
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      pkg,
      title: item.title,
      url: item.url,
      severity: item.severity,
      id: typeof item.url === 'string'
        ? (item.url.match(/GHSA-[a-z0-9-]+/i) || [null])[0]
        : null,
    }))
);

const unexpected = advisories.filter((item) => item.id !== KNOWN_UNPATCHED_ADVISORY);
const unmatched = report.metadata.vulnerabilities.total > 0 && advisories.length === 0;
if (unexpected.length > 0 || unmatched) {
  console.error('Foram encontradas vulnerabilidades novas ou sem identificacao confiavel:', JSON.stringify(unexpected));
  console.error('Resumo:', JSON.stringify(report.metadata.vulnerabilities));
  process.exit(1);
}

if (vulnerabilities.length > 0) {
  const issue = report.vulnerabilities.picomatch;
  if (!issue || issue.fixAvailable !== false) {
    console.error('Existe uma correcao disponivel ou o advisory nao corresponde mais ao caso aprovado. Atualize as dependencias.');
    process.exit(1);
  }

  const message = `Advisory pendente sem atualizacao oficial: ${KNOWN_UNPATCHED_ADVISORY} (picomatch). ${report.metadata.vulnerabilities.total} ocorrencias transitivas, somente em ferramentas de build/desenvolvimento. Nao tratar como corrigido.`;
  console.warn('::warning title=Vulnerabilidade conhecida sem patch::' + message);
  console.warn(message);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      `### Auditoria de dependencias\n\n- **Pendente**: ${KNOWN_UNPATCHED_ADVISORY} (picomatch) — sem patch oficial.\n- **Ocorrencias**: ${report.metadata.vulnerabilities.total} vulnerabilidades transitivas.\n- **Acao**: monitorar release upstream; nao aceitar novas vulnerabilidades.\n\n`);
  }
} else {
  if (audit.status !== 0) {
    console.error('npm audit retornou falha mesmo sem alertas:', audit.stderr);
    process.exit(1);
  }
  console.log('npm audit: nenhuma vulnerabilidade encontrada.');
}
