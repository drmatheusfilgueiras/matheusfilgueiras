// Optional, read-only browser agent interface. No private data or clinical actions.
const SECTIONS = {
  sobre: 'sobre-apple',
  projetos: 'projetos-apple',
  interesses: 'interesses-apple',
  atendimento: 'atendimento-apple',
  historias: 'historias-apple',
  contato: 'contato-apple'
};

const PUBLIC_PROJECTS = [
  { name: 'Unidos pela Bravura', topic: 'Livro infantil sobre medo e ansiedade no atendimento odontológico', url: '/unidos_pela_bravura' },
  { name: 'Pesquisa de mestrado', topic: 'Citotoxicidade de resinas impressas para próteses totais', url: '/#projetos-apple' },
  { name: 'Planejamento Estético Digital', topic: 'E-book e atividades de ensino sobre planejamento digital 2D', url: '/#projetos-apple' },
  { name: 'SedaFlow', topic: 'Projeto de software para registros de sedação consciente', url: 'https://sedaflow.com.br/' }
];

export function registerPublicAgentTools() {
  const context = typeof document !== 'undefined' ? document.modelContext : null;
  if (!context || typeof context.registerTool !== 'function') return;
  const tools = [
    {
      name: 'list_public_projects',
      description: 'Lista os projetos públicos apresentados no site, com descrições e links. Não acessa dados privados.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      execute: async () => ({ projects: PUBLIC_PROJECTS })
    },
    {
      name: 'get_contact_options',
      description: 'Retorna os canais públicos de contato e os links de agendamento. Não agenda nem envia mensagens.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      execute: async () => ({
        email: 'mailto:matheusfilgueiras.dr@gmail.com',
        contactPage: '/contato',
        clinics: ['Salud Odontologia', 'Naturale Dental Studio'],
        message: 'É necessário que o visitante confirme qualquer contato ou agendamento.'
      })
    },
    {
      name: 'navigate_portfolio',
      description: 'Abre uma seção pública da página inicial no navegador do visitante.',
      inputSchema: {
        type: 'object',
        properties: {
          section: { type: 'string', enum: Object.keys(SECTIONS), description: 'Seção a visitar' }
        },
        required: ['section'],
        additionalProperties: false
      },
      execute: async ({ section }) => {
        const id = SECTIONS[section];
        if (!id) return { success: false, reason: 'Seção não reconhecida.' };
        if (window.location.pathname !== '/') {
          window.location.href = '/#' + id;
        } else {
          document.getElementById(id)?.scrollIntoView({ behavior: 'auto' });
          window.history.replaceState(null, '', '/#' + id);
        }
        return { success: true, destination: '/#' + id };
      }
    }
  ];
  tools.forEach(tool => {
    try {
      Promise.resolve(context.registerTool(tool)).catch(() => {});
    } catch {
      // Browsers without complete WebMCP support remain unaffected.
    }
  });
}
